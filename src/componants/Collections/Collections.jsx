import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination } from "antd";
import {
  MdEdit,
  MdDelete,
  MdSearch,
  MdCollectionsBookmark,
  MdDiamond,
  MdCategory,
  MdAddCircleOutline,
  MdClose,
  MdLowPriority,
  MdHome,
  MdVisibilityOff,
} from "react-icons/md";
import {
  getAllCollectionsApi,
  addCollectionApi,
  updateCollectionApi,
  deleteCollectionApi,
  getDomainsApi,
  getAllProductsForPickerApi,
} from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";
import Load from "../Load/Load";
import DeleteModal from "../deleteModal/DeleteModal";
import CollectionForm, { imgSrc, ConfirmModal } from "./CollectionForm";
import PositionBoard from "./PositionBoard";
import { placementLabel } from "./HomePlacementPicker";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "-";

const productCount = (c) => (c.items || []).reduce((n, i) => n + (i.products || []).length, 0);
const firstImage = (p) => (Array.isArray(p?.imageUrl) ? p.imageUrl[0] : p?.imageUrl);

// Up to four product photos, in the collection's own order
const Mosaic = ({ collection }) => {
  const images = (collection.items || [])
    .flatMap((i) => i.products || [])
    .map(firstImage)
    .filter(Boolean)
    .slice(0, 4);
  if (!images.length) {
    return (
      <div className="aspect-[16/10] bg-gray-100 flex items-center justify-center text-5xl text-gray-300">
        <MdCollectionsBookmark />
      </div>
    );
  }
  // 2×2 grid: 1 photo fills it, 2 split it in halves, 3 = one tall + two small, 4 = quarters
  const span = (i) => {
    if (images.length === 1) return "col-span-2 row-span-2";
    if (images.length === 2) return "row-span-2";
    if (images.length === 3 && i === 0) return "row-span-2";
    return "";
  };
  return (
    <div className="aspect-[16/10] grid grid-cols-2 grid-rows-2 gap-0.5 bg-white overflow-hidden">
      {images.map((src, i) => (
        <div key={src + i} className={`bg-gray-100 overflow-hidden min-h-0 ${span(i)}`}>
          <img
            src={imgSrc(src, 320)}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
};

const Collections = () => {
  const navigate = useNavigate();
  const message = useToast();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [positioning, setPositioning] = useState(null);
  const [editDirty, setEditDirty] = useState(false);
  const [confirmCloseEdit, setConfirmCloseEdit] = useState(false);

  const closeEdit = () => {
    setEditing(null);
    setEditDirty(false);
    setConfirmCloseEdit(false);
  };

  const fetchCollections = async () => {
    try {
      const res = await getAllCollectionsApi();
      if (res?.success) setCollections(res.data || []);
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
        await fetchCollections();
      } catch (err) {
        errorResponseHandler(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // position: "Save & Positioning" was used, so open the positioning view for the saved collection
  const handleAdd = async (payload, { position } = {}) => {
    try {
      const res = await addCollectionApi(payload);
      if (res?.success) {
        message.success("Collection saved successfully");
        fetchCollections();
        if (position) setPositioning(res.data);
        return true;
      }
    } catch (err) {
      errorResponseHandler(err);
    }
    return false;
  };

  const handleUpdate = async (payload, { position } = {}) => {
    try {
      const res = await updateCollectionApi(editing._id || editing.id, payload);
      if (res?.success) {
        message.success("Collection updated successfully");
        closeEdit();
        fetchCollections();
        if (position) setPositioning(res.data);
        return true;
      }
    } catch (err) {
      errorResponseHandler(err);
    }
    return false;
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteCollectionApi(id);
      if (res?.success) message.success("Collection deleted successfully");
      fetchCollections();
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  // Opened directly (new tab, refresh with no history) there is nothing to go back to, so go to the dashboard
  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate("/dashboard");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.items || []).some((i) => (i.category?.name || "").toLowerCase().includes(q)),
    );
  }, [collections, search]);

  const stats = useMemo(() => {
    const productIds = new Set();
    const categoryIds = new Set();
    collections.forEach((c) =>
      (c.items || []).forEach((i) => {
        if (i.category?._id) categoryIds.add(i.category._id);
        (i.products || []).forEach((p) => productIds.add(p?._id || p));
      }),
    );
    return { products: productIds.size, categories: categoryIds.size };
  }, [collections]);

  if (loading) return <Load />;

  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="p-4 pb-10 mt-16">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white mb-6 bg-gradient-to-br from-[#1d2532] to-[#2f3b4f]">
        <p className="text-xs tracking-[0.25em] uppercase text-[#e3c77a]">Catalog</p>
        <h2 className="text-3xl font-bold mt-1 !text-white">Collections</h2>
        <p className="text-sm text-gray-300 mt-1 max-w-xl">
          Curate hand-picked groups like Wedding Gifts or Under ₹1,000 from any of your categories, in the order you choose.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          {[
            { icon: <MdCollectionsBookmark />, value: collections.length, label: "Collections" },
            { icon: <MdDiamond />, value: stats.products, label: "Products featured" },
            { icon: <MdCategory />, value: stats.categories, label: "Categories used" },
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
          <h3 className="text-lg font-semibold text-[#1d2532]">Create a collection</h3>
        </div>
        <CollectionForm
          categories={categories}
          products={products}
          collections={collections}
          onSubmit={handleAdd}
          onBack={goBack}
        />
      </div>

      {/* Listing */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#1d2532]">Your collections</h3>
          <p className="text-sm text-gray-500">
            {filtered.length === collections.length
              ? `${collections.length} collection${collections.length === 1 ? "" : "s"}`
              : `${filtered.length} of ${collections.length} match`}
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
            placeholder="Search by title or category"
            className="border rounded-xl pl-9 pr-3 py-2 text-sm w-64 bg-white"
          />
        </div>
      </div>

      {pageItems.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {pageItems.map((item) => {
            const cats = (item.items || []).map((i) => i.category?.name).filter(Boolean);
            const count = productCount(item);
            return (
              <article
                key={item._id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="relative">
                  <Mosaic collection={item} />
                  <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/95 text-[#1d2532] shadow-sm">
                    {count} product{count === 1 ? "" : "s"}
                  </span>
                  {item.isActive === false && (
                    <span className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-900/80 text-white">
                      <MdVisibilityOff /> Hidden from website
                    </span>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      title="Change position"
                      onClick={() => setPositioning(item)}
                      className="w-9 h-9 rounded-full bg-white/95 text-[#2563eb] shadow flex items-center justify-center hover:bg-white"
                    >
                      <MdLowPriority />
                    </button>
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => setEditing(item)}
                      className="w-9 h-9 rounded-full bg-white/95 text-[#1d2532] shadow flex items-center justify-center hover:bg-white"
                    >
                      <MdEdit />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => setDeleting(item)}
                      className="w-9 h-9 rounded-full bg-white/95 text-red-600 shadow flex items-center justify-center hover:bg-white"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-[#1d2532] text-lg truncate" title={item.title}>
                    {item.title}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-2 min-h-[26px]">
                    {cats.slice(0, 3).map((name) => (
                      <span key={name} className="text-xs px-2 py-0.5 rounded-full bg-[#fbf6e9] text-[#7a5c14]">
                        {name}
                      </span>
                    ))}
                    {cats.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600" title={cats.slice(3).join(", ")}>
                        +{cats.length - 3} more
                      </span>
                    )}
                    {!cats.length && <span className="text-xs text-gray-400">No categories</span>}
                  </div>
                  <p className="mt-3 flex items-center gap-1 text-xs font-medium text-[#b32126]">
                    <MdHome className="text-sm" /> Homepage: {placementLabel(item.placement)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Created {formatDate(item.createdAt)}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setPositioning(item)}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#2563eb] bg-[#eff4ff] hover:bg-[#dfe8ff] transition-colors"
                    >
                      <MdLowPriority className="text-base" /> Change position
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(item)}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#1d2532] bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <MdEdit className="text-base" /> Edit collection
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl py-14 text-center bg-white">
          <MdCollectionsBookmark className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-[#1d2532]">
            {collections.length ? "No collections match your search" : "No collections yet"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {collections.length ? "Try a different title or category" : "Create your first one with the form above"}
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
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2"
          style={{ zIndex: 9999999 }}
        >
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-[1100px] h-full max-h-[90vh] flex flex-col">
            <div className="relative px-6 py-4 rounded-t-2xl text-white bg-gradient-to-br from-[#1d2532] to-[#2f3b4f]">
              <p className="text-[11px] tracking-[0.25em] uppercase text-[#e3c77a]">Edit collection</p>
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
              <CollectionForm
                key={editing._id}
                categories={categories}
                products={products}
                collections={collections}
                initial={editing}
                isEdit
                inModal
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
          text="You have unsaved changes in this collection. Close without saving?"
          confirmLabel="Discard & close"
          cancelLabel="Keep editing"
          confirmColor="#dc2626"
          onCancel={() => setConfirmCloseEdit(false)}
          onConfirm={closeEdit}
        />
      )}

      {positioning && (
        <PositionBoard
          key={positioning._id}
          collection={positioning}
          onClose={() => setPositioning(null)}
          onSaved={fetchCollections}
        />
      )}

      {deleting && (
        <DeleteModal onClose={() => setDeleting(null)} handleDelete={() => handleDelete(deleting._id)} />
      )}
    </div>
  );
};

export default Collections;
