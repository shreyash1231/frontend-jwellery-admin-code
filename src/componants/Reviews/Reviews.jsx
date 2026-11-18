import React, { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import {
  MdEdit,
  MdDelete,
  MdSearch,
  MdStar,
  MdRateReview,
  MdVerified,
  MdPhotoLibrary,
  MdAddCircleOutline,
  MdClose,
  MdDiamond,
  MdPlayCircle,
  MdPerson,
} from "react-icons/md";
import {
  getAllReviewsApi,
  addReviewApi,
  updateReviewApi,
  deleteReviewApi,
  getAllProductsForPickerApi,
  getAllUsersApi,
} from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";
import Load from "../Load/Load";
import DeleteModal from "../deleteModal/DeleteModal";
import { imgSrc, ConfirmModal } from "../Collections/CollectionForm";
import { Switch, firstImage } from "../Discounts/DiscountForm";
import ReviewForm, { Stars, mediaSrc, RATING_WORDS, productLabel, categoryName } from "./ReviewForm";

const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "-";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "5", label: "5★" },
  { key: "4", label: "4★" },
  { key: "3", label: "3★" },
  { key: "2", label: "2★" },
  { key: "1", label: "1★" },
  { key: "verified", label: "Verified" },
  { key: "media", label: "With photos" },
  { key: "hidden", label: "Hidden" },
];

const matches = (r, key) => {
  if (key === "all") return true;
  if (key === "verified") return r.isVerifiedPurchase;
  if (key === "media") return (r.media || []).length > 0;
  if (key === "hidden") return r.isActive === false;
  return String(r.rating) === key;
};

const Reviews = () => {
  const message = useToast();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [editDirty, setEditDirty] = useState(false);
  const [confirmCloseEdit, setConfirmCloseEdit] = useState(false);
  const [viewer, setViewer] = useState(null); // media item being viewed full size

  const closeEdit = () => {
    setEditing(null);
    setEditDirty(false);
    setConfirmCloseEdit(false);
  };

  // Products are reloaded too so their star averages stay current in the picker
  const refresh = async () => {
    try {
      const [revRes, prodRes] = await Promise.all([getAllReviewsApi(), getAllProductsForPickerApi()]);
      if (revRes?.success) setReviews(revRes.data || []);
      setProducts(prodRes?.data?.products || []);
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const userRes = await getAllUsersApi().catch(() => null);
        const list = userRes?.data;
        setUsers(Array.isArray(list) ? list : list?.users || []);
        await refresh();
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async (fd) => {
    try {
      const res = await addReviewApi(fd);
      if (res?.success) {
        message.success("Review added");
        refresh();
        return true;
      }
    } catch (err) {
      errorResponseHandler(err);
    }
    return false;
  };

  const handleUpdate = async (fd) => {
    try {
      const res = await updateReviewApi(editing._id, fd);
      if (res?.success) {
        message.success("Review updated");
        closeEdit();
        refresh();
        return true;
      }
    } catch (err) {
      errorResponseHandler(err);
    }
    return false;
  };

  const handleToggle = async (r, isActive) => {
    setToggling(r._id);
    try {
      const fd = new FormData();
      fd.append("isActive", String(isActive));
      const res = await updateReviewApi(r._id, fd);
      if (res?.success) {
        setReviews((list) => list.map((x) => (x._id === r._id ? { ...x, isActive } : x)));
        message.success(isActive ? "Review is shown on the website" : "Review hidden from the website");
        refresh();
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteReviewApi(id);
      if (res?.success) message.success("Review deleted");
      refresh();
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  const stats = useMemo(() => {
    const visible = reviews.filter((r) => r.isActive !== false);
    const avg = visible.length ? visible.reduce((s, r) => s + r.rating, 0) / visible.length : 0;
    return {
      total: reviews.length,
      avg: avg ? avg.toFixed(1) : "–",
      verified: reviews.filter((r) => r.isVerifiedPurchase).length,
      media: reviews.filter((r) => (r.media || []).length).length,
    };
  }, [reviews]);

  const counts = useMemo(() => {
    const c = {};
    FILTERS.forEach((f) => (c[f.key] = reviews.filter((r) => matches(r, f.key)).length));
    return c;
  }, [reviews]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter(
      (r) =>
        matches(r, filter) &&
        (!q ||
          productLabel(r.product).toLowerCase().includes(q) ||
          (r.reviewerName || "").toLowerCase().includes(q) ||
          (r.comment || "").toLowerCase().includes(q)),
    );
  }, [reviews, search, filter]);

  if (loading) return <Load />;

  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="p-4 pb-10 mt-16">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white mb-6 bg-gradient-to-br from-[#1d2532] to-[#2f3b4f]">
        <p className="text-xs tracking-[0.25em] uppercase text-[#e3c77a]">Catalog</p>
        <h2 className="text-3xl font-bold mt-1 !text-white">Reviews</h2>
        <p className="text-sm text-gray-300 mt-1 max-w-xl">
          Add product reviews with stars, photos and videos. Customers can't post reviews themselves; only reviews
          added here show on the website.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          {[
            { icon: <MdRateReview />, value: stats.total, label: "Reviews" },
            { icon: <MdStar />, value: stats.avg, label: "Average rating" },
            { icon: <MdVerified />, value: stats.verified, label: "Verified purchase" },
            { icon: <MdPhotoLibrary />, value: stats.media, label: "With photos/videos" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
              <span className="text-xl text-[#e3c77a]">{s.icon}</span>
              <div className="leading-tight">
                <p className="text-lg font-semibold">{s.value.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-gray-300">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add */}
      <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm mb-10">
        <div className="flex items-center gap-2 mb-6">
          <MdAddCircleOutline className="text-2xl text-[#c8a24a]" />
          <h3 className="text-lg font-semibold text-[#1d2532]">Add a review</h3>
        </div>
        <ReviewForm products={products} users={users} onSubmit={handleAdd} />
      </div>

      {/* Listing */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#1d2532]">All reviews</h3>
          <p className="text-sm text-gray-500">Hidden reviews don't show on the website or count in the star rating.</p>
        </div>
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search product, category, name or text"
            className="border rounded-xl pl-9 pr-3 py-2 text-sm w-72 bg-white"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              setFilter(f.key);
              setCurrentPage(1);
            }}
            aria-pressed={filter === f.key}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.key ? "bg-[#1d2532] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
            <span className={`ml-1.5 text-xs ${filter === f.key ? "text-[#e3c77a]" : "text-gray-400"}`}>{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {pageItems.length ? (
        <div className="space-y-4">
          {pageItems.map((r) => {
            const p = r.product;
            const hidden = r.isActive === false;
            return (
              <article
                key={r._id}
                className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row gap-4 ${
                  hidden ? "opacity-70" : ""
                }`}
              >
                {/* Product */}
                <div className="flex md:flex-col items-center md:items-start gap-3 md:w-44 shrink-0">
                  <span className="w-14 h-14 md:w-20 md:h-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-gray-300 text-2xl shrink-0">
                    {firstImage(p) ? <img src={imgSrc(firstImage(p), 160)} alt="" className="w-full h-full object-cover" /> : <MdDiamond />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1d2532] line-clamp-2" title={productLabel(p)}>
                      {p?.name || "Deleted product"}
                    </p>
                    {categoryName(p) && (
                      <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-[#fbf6e9] text-[#7a5c14]">
                        {categoryName(p)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Review */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars value={r.rating} size="text-lg" />
                    <span className="text-xs font-semibold text-[#7a5c14]">{RATING_WORDS[r.rating]}</span>
                    {r.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        <MdVerified /> Verified purchase
                      </span>
                    )}
                    {hidden && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">Hidden</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1.5 flex flex-wrap items-center gap-x-2">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#1d2532]">
                      <MdPerson className="text-gray-400" /> {r.reviewerName}
                    </span>
                    <span className="text-xs text-gray-400">{r.user ? "Customer account" : "Custom name"}</span>
                    <span className="text-xs text-gray-400">· {formatDateTime(r.reviewedAt)}</span>
                  </p>
                  {r.comment && <p className="text-sm text-gray-700 mt-2 whitespace-pre-line line-clamp-4">{r.comment}</p>}
                  {(r.media || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {r.media.map((m) => (
                        <button
                          key={m.url}
                          type="button"
                          onClick={() => setViewer(m)}
                          className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100"
                          title={m.type === "video" ? "Play video" : "View photo"}
                        >
                          {m.type === "video" ? (
                            <>
                              <video src={mediaSrc(m)} className="w-full h-full object-cover" muted preload="metadata" />
                              <MdPlayCircle className="absolute inset-0 m-auto text-2xl text-white drop-shadow" />
                            </>
                          ) : (
                            <img src={mediaSrc(m, 160)} alt="" className="w-full h-full object-cover" loading="lazy" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 md:w-40 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <Switch
                      checked={!hidden}
                      label="Show on website"
                      onChange={(v) => toggling !== r._id && handleToggle(r, v)}
                    />
                    {hidden ? "Hidden" : "Shown"}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(r)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1d2532] bg-gray-100 hover:bg-gray-200"
                    >
                      <MdEdit className="text-base" /> Edit
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => setDeleting(r)}
                      className="w-9 h-9 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 flex items-center justify-center"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl py-14 text-center bg-white">
          <MdRateReview className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-[#1d2532]">{reviews.length ? "No reviews match" : "No reviews yet"}</p>
          <p className="text-sm text-gray-500 mt-1">
            {reviews.length ? "Try a different search or filter" : "Add the first one with the form above"}
          </p>
        </div>
      )}

      {filtered.length > pageSize && (
        <div className="flex justify-center mt-6">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filtered.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            pageSizeOptions={["10", "20", "50"]}
          />
        </div>
      )}

      {/* Edit popup: same form as add */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2" style={{ zIndex: 9999999 }}>
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-[1100px] max-h-[90vh] flex flex-col">
            <div className="relative px-6 py-4 rounded-t-2xl text-white bg-gradient-to-br from-[#1d2532] to-[#2f3b4f]">
              <p className="text-[11px] tracking-[0.25em] uppercase text-[#e3c77a]">Edit review</p>
              <h3 className="text-xl font-bold truncate pr-10">
                {editing.reviewerName} on {editing.product ? productLabel(editing.product) : "deleted product"}
              </h3>
              <button
                type="button"
                onClick={() => (editDirty ? setConfirmCloseEdit(true) : closeEdit())}
                title="Close"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-2xl"
              >
                <MdClose />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pt-6">
              <ReviewForm
                key={editing._id}
                products={products}
                users={users}
                initial={editing}
                isEdit
                onSubmit={handleUpdate}
                onDirtyChange={setEditDirty}
              />
            </div>
          </div>
        </div>
      )}

      {confirmCloseEdit && (
        <ConfirmModal
          title="Discard changes?"
          text="You have unsaved changes in this review. Close without saving?"
          confirmLabel="Discard & close"
          cancelLabel="Keep editing"
          confirmColor="#dc2626"
          onCancel={() => setConfirmCloseEdit(false)}
          onConfirm={closeEdit}
        />
      )}

      {viewer && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
          style={{ zIndex: 9999999 }}
          onClick={() => setViewer(null)}
        >
          <button
            type="button"
            title="Close"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 text-white text-2xl flex items-center justify-center"
          >
            <MdClose />
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            {viewer.type === "video" ? (
              <video src={mediaSrc(viewer)} controls autoPlay className="max-h-[85vh] max-w-[90vw] rounded-xl" />
            ) : (
              <img src={mediaSrc(viewer)} alt="" className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain" />
            )}
          </div>
        </div>
      )}

      {deleting && <DeleteModal onClose={() => setDeleting(null)} handleDelete={() => handleDelete(deleting._id)} />}
    </div>
  );
};

export default Reviews;
