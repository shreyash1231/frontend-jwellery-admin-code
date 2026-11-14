import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination } from "antd";
import {
  MdEdit,
  MdDelete,
  MdSearch,
  MdDiscount,
  MdBolt,
  MdSchedule,
  MdDiamond,
  MdAddCircleOutline,
  MdClose,
  MdCategory,
  MdChecklist,
  MdEvent,
} from "react-icons/md";
import {
  getAllDiscountsApi,
  addDiscountApi,
  updateDiscountApi,
  deleteDiscountApi,
  getDomainsApi,
  getAllProductsForPickerApi,
} from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";
import Load from "../Load/Load";
import DeleteModal from "../deleteModal/DeleteModal";
import { imgSrc, ConfirmModal } from "../Collections/CollectionForm";
import DiscountForm, { Switch, idOf, offerLabel } from "./DiscountForm";

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

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// "3 days", "5 hours", "20 minutes"
const until = (ms) => {
  if (ms >= DAY) {
    const n = Math.floor(ms / DAY);
    return `${n} day${n === 1 ? "" : "s"}`;
  }
  if (ms >= HOUR) {
    const n = Math.floor(ms / HOUR);
    return `${n} hour${n === 1 ? "" : "s"}`;
  }
  const n = Math.max(1, Math.ceil(ms / 60000));
  return `${n} minute${n === 1 ? "" : "s"}`;
};

// Where an offer stands right now
const statusOf = (d, now = Date.now()) => {
  if (d.isActive === false) return "inactive";
  if (now < new Date(d.startDate).getTime()) return "scheduled";
  if (now > new Date(d.endDate).getTime()) return "expired";
  return "live";
};

const STATUS = {
  live: { label: "Live", pill: "bg-emerald-500 text-white", band: "from-[#0f5132] to-[#1d7a4f]" },
  scheduled: { label: "Scheduled", pill: "bg-blue-500 text-white", band: "from-[#1d2b5a] to-[#2f4a8f]" },
  expired: { label: "Expired", pill: "bg-gray-500 text-white", band: "from-[#3b3f46] to-[#5b616b]" },
  inactive: { label: "Inactive", pill: "bg-gray-900/80 text-white", band: "from-[#3b3f46] to-[#5b616b]" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "scheduled", label: "Scheduled" },
  { key: "expired", label: "Expired" },
  { key: "inactive", label: "Inactive" },
];

const timeNote = (d, status) => {
  const now = Date.now();
  if (status === "live") return `Ends in ${until(new Date(d.endDate).getTime() - now)}`;
  if (status === "scheduled") return `Starts in ${until(new Date(d.startDate).getTime() - now)}`;
  return null;
};

const Discounts = () => {
  const navigate = useNavigate();
  const message = useToast();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [editDirty, setEditDirty] = useState(false);
  const [confirmCloseEdit, setConfirmCloseEdit] = useState(false);

  const closeEdit = () => {
    setEditing(null);
    setEditDirty(false);
    setConfirmCloseEdit(false);
  };

  const fetchDiscounts = async () => {
    try {
      const res = await getAllDiscountsApi();
      if (res?.success) setDiscounts(res.data || []);
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([getDomainsApi(), getAllProductsForPickerApi()]);
        setCategories(catRes?.data || []);
        setProducts(prodRes?.data?.products || []);
        await fetchDiscounts();
      } catch (err) {
        errorResponseHandler(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const productsInCategory = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const c = idOf(p.categoryId);
      if (c) map[c] = (map[c] || 0) + 1;
    });
    return map;
  }, [products]);

  // How many products an offer lowers the price of (switched-off products don't count)
  const coveredCount = (d) =>
    d.scope === "category"
      ? productsInCategory[idOf(d.category)] || 0
      : (d.products || []).filter((p) => p.isActive !== false).length;

  const handleAdd = async (payload) => {
    try {
      const res = await addDiscountApi(payload);
      if (res?.success) {
        message.success("Offer saved successfully");
        fetchDiscounts();
        return true;
      }
    } catch (err) {
      errorResponseHandler(err);
    }
    return false;
  };

  const handleUpdate = async (payload) => {
    try {
      const res = await updateDiscountApi(editing._id, payload);
      if (res?.success) {
        message.success("Offer updated successfully");
        closeEdit();
        fetchDiscounts();
        return true;
      }
    } catch (err) {
      errorResponseHandler(err);
    }
    return false;
  };

  const handleToggle = async (d, isActive) => {
    setToggling(d._id);
    try {
      const res = await updateDiscountApi(d._id, { isActive });
      if (res?.success) {
        setDiscounts((list) => list.map((x) => (x._id === d._id ? { ...x, isActive } : x)));
        message.success(isActive ? "Offer activated" : "Offer deactivated");
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteDiscountApi(id);
      if (res?.success) message.success("Offer deleted successfully");
      fetchDiscounts();
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate("/dashboard");
  };

  const counts = useMemo(() => {
    const c = { all: discounts.length, live: 0, scheduled: 0, expired: 0, inactive: 0 };
    discounts.forEach((d) => (c[statusOf(d)] += 1));
    return c;
  }, [discounts]);

  const liveProducts = useMemo(
    () => discounts.filter((d) => statusOf(d) === "live").reduce((n, d) => n + coveredCount(d), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [discounts, productsInCategory],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return discounts.filter(
      (d) =>
        (filter === "all" || statusOf(d) === filter) &&
        (!q ||
          (d.title || "").toLowerCase().includes(q) ||
          (d.category?.name || "").toLowerCase().includes(q)),
    );
  }, [discounts, search, filter]);

  if (loading) return <Load />;

  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="p-4 pb-10 mt-16">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white mb-6 bg-gradient-to-br from-[#1d2532] to-[#2f3b4f]">
        <p className="text-xs tracking-[0.25em] uppercase text-[#e3c77a]">Discount</p>
        <h2 className="text-3xl font-bold mt-1 !text-white">Discounts</h2>
        <p className="text-sm text-gray-300 mt-1 max-w-xl">
          Put a whole category or hand-picked products on offer, by percentage or a flat amount, for the dates you choose.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          {[
            { icon: <MdDiscount />, value: discounts.length, label: "Offers" },
            { icon: <MdBolt />, value: counts.live, label: "Live now" },
            { icon: <MdSchedule />, value: counts.scheduled, label: "Scheduled" },
            { icon: <MdDiamond />, value: liveProducts, label: "Products on offer" },
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
          <h3 className="text-lg font-semibold text-[#1d2532]">Create an offer</h3>
        </div>
        <DiscountForm categories={categories} products={products} onSubmit={handleAdd} onBack={goBack} />
      </div>

      {/* Listing */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#1d2532]">Your offers</h3>
          <p className="text-sm text-gray-500">
            If two live offers cover the same product, the customer gets the lower price.
          </p>
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
            placeholder="Search by offer or category"
            className="border rounded-xl pl-9 pr-3 py-2 text-sm w-64 bg-white"
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
            <span className={`ml-1.5 text-xs ${filter === f.key ? "text-[#e3c77a]" : "text-gray-400"}`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {pageItems.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {pageItems.map((d) => {
            const status = statusOf(d);
            const s = STATUS[status];
            const note = timeNote(d, status);
            const covered = coveredCount(d);
            const off = (d.products || []).filter((p) => p.isActive === false).length;
            const thumbs = (d.products || [])
              .map((p) => p.product)
              .filter(Boolean)
              .slice(0, 4);
            return (
              <article
                key={d._id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {/* Offer band */}
                <div className={`relative p-5 text-white bg-gradient-to-br ${s.band}`}>
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: "radial-gradient(circle at 85% 20%, #fff 0, transparent 45%)",
                    }}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.pill}`}>
                        {status === "live" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        {s.label}
                      </span>
                      <p className="text-3xl font-extrabold mt-3 tracking-tight text-[#f5dc9a]">{offerLabel(d)}</p>
                      {note && <p className="text-xs text-white/80 mt-1">{note}</p>}
                    </div>
                    <span className="w-14 h-14 rounded-xl bg-white/15 overflow-hidden shrink-0 flex items-center justify-center text-2xl text-white/70">
                      {d.category?.imageUrl ? (
                        <img src={imgSrc(d.category.imageUrl, 160)} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <MdCategory />
                      )}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => setEditing(d)}
                      className="w-9 h-9 rounded-full bg-white/95 text-[#1d2532] shadow flex items-center justify-center hover:bg-white"
                    >
                      <MdEdit />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => setDeleting(d)}
                      className="w-9 h-9 rounded-full bg-white/95 text-red-600 shadow flex items-center justify-center hover:bg-white"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-[#1d2532] text-lg truncate" title={d.title}>
                    {d.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#fbf6e9] text-[#7a5c14]">
                      {d.category?.name || "Deleted category"}
                    </span>
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {d.scope === "category" ? <MdCategory /> : <MdChecklist />}
                      {d.scope === "category" ? "Whole category" : "Specific products"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {d.scope === "products" && thumbs.length > 0 && (
                      <div className="flex -space-x-2">
                        {thumbs.map((p) => {
                          const src = Array.isArray(p.imageUrl) ? p.imageUrl[0] : p.imageUrl;
                          return (
                            <span
                              key={p._id}
                              title={p.name}
                              className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 overflow-hidden flex items-center justify-center text-gray-300 text-xs"
                            >
                              {src ? <img src={imgSrc(src, 80)} alt="" className="w-full h-full object-cover" /> : <MdDiamond />}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-[#1d2532]">{covered}</span> product{covered === 1 ? "" : "s"} on offer
                      {off > 0 && <span className="text-gray-400"> · {off} switched off</span>}
                    </p>
                  </div>

                  <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                    <MdEvent className="text-sm text-[#c8a24a] mt-0.5 shrink-0" />
                    <span>
                      <span className="block">
                        <span className="text-gray-400">From</span> {formatDateTime(d.startDate)}
                      </span>
                      <span className="block">
                        <span className="text-gray-400">To</span> {formatDateTime(d.endDate)}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <Switch
                        checked={d.isActive !== false}
                        label={`${d.title} active`}
                        onChange={(v) => toggling !== d._id && handleToggle(d, v)}
                      />
                      {d.isActive !== false ? "Active" : "Inactive"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditing(d)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#1d2532] bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <MdEdit className="text-base" /> Edit offer
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl py-14 text-center bg-white">
          <MdDiscount className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-[#1d2532]">
            {discounts.length ? "No offers match" : "No offers yet"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {discounts.length ? "Try a different search or filter" : "Create your first one with the form above"}
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
            pageSizeOptions={["6", "12", "24", "48"]}
          />
        </div>
      )}

      {/* Edit popup: same form as add */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2" style={{ zIndex: 9999999 }}>
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-[1100px] h-full max-h-[90vh] flex flex-col">
            <div className="relative px-6 py-4 rounded-t-2xl text-white bg-gradient-to-br from-[#1d2532] to-[#2f3b4f]">
              <p className="text-[11px] tracking-[0.25em] uppercase text-[#e3c77a]">Edit offer</p>
              <h3 className="text-xl font-bold truncate pr-10">{editing.title}</h3>
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
              <DiscountForm
                key={editing._id}
                categories={categories}
                products={products}
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
          text="You have unsaved changes in this offer. Close without saving?"
          confirmLabel="Discard & close"
          cancelLabel="Keep editing"
          confirmColor="#dc2626"
          onCancel={() => setConfirmCloseEdit(false)}
          onConfirm={closeEdit}
        />
      )}

      {deleting && <DeleteModal onClose={() => setDeleting(null)} handleDelete={() => handleDelete(deleting._id)} />}
    </div>
  );
};

export default Discounts;
