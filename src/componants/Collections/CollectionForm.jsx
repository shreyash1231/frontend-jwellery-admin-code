import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MdSave,
  MdClose,
  MdArrowBack,
  MdEdit,
  MdKeyboardArrowDown,
  MdDragIndicator,
  MdArrowUpward,
  MdArrowDownward,
  MdCheck,
  MdLock,
  MdSearch,
  MdCategory,
  MdCollectionsBookmark,
  MdWarningAmber,
  MdLowPriority,
} from "react-icons/md";
import { image_url } from "../../common/env";
import { useToast } from "../toast/Toast";
import HomePlacementPicker, { DEFAULT_PLACEMENT } from "./HomePlacementPicker";

const idOf = (x) => x?._id || x?.id || x;

// Category images are stored either as a full URL or as an "uploads/..." path.
// Uploads are full-size photos (up to ~50 MB once decoded), so lists use a small server-made thumbnail.
export const imgSrc = (path, width) => {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  if (width && /^uploads\/[\w.-]+$/.test(path)) {
    return `${process.env.REACT_APP_BASE_URL || ""}/api/v1/user/image-thumb?w=${width}&path=${encodeURIComponent(path)}`;
  }
  return `${image_url}/${path}`;
};

const productImage = (p) => (Array.isArray(p?.imageUrl) ? p.imageUrl[0] : p?.imageUrl);

// Form state built from a saved collection (or empty for a new one).
// order[catId] holds every product of the category in display order; chosen products come first.
const buildState = (initial, productsByCat) => {
  const selectedCats = [];
  const order = {};
  const selected = {};
  (initial?.items || []).forEach((item) => {
    const catId = idOf(item.category);
    const saved = (item.products || []).map(idOf);
    const rest = (productsByCat[catId] || []).map(idOf).filter((id) => !saved.includes(id));
    selectedCats.push(catId);
    order[catId] = [...saved, ...rest];
    selected[catId] = saved;
  });
  return {
    title: initial?.title || "",
    selectedCats,
    order,
    selected,
    placement: initial?.placement || DEFAULT_PLACEMENT,
    isActive: initial?.isActive !== false,
  };
};

const SelectAllBox = ({ checked, indeterminate, onChange }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      className="w-4 h-4 cursor-pointer"
    />
  );
};

export const ConfirmModal = ({
  title,
  text,
  onCancel,
  onConfirm,
  busy,
  confirmLabel = "Yes, Save",
  cancelLabel = "No",
  confirmColor = "#1d2532",
}) => (
  <div
    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4"
    style={{ zIndex: 10000000 }}
  >
    <div className="bg-white p-6 rounded-lg w-full max-w-md flex flex-col items-center text-center">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <p className="mb-6">{text}</p>
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="px-4 py-2 bg-gray-500 text-white rounded-md"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="px-4 py-2 text-white rounded-md"
          style={{ background: confirmColor, borderRadius: 10 }}
        >
          {busy ? "Saving..." : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

const Step = ({ n, title, hint, right, children }) => (
  <section className="mb-8">
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <span
        className="w-8 h-8 rounded-full text-white text-sm font-semibold flex items-center justify-center shrink-0"
        style={{ background: "linear-gradient(135deg, #1d2532, #34425a)" }}
      >
        {n}
      </span>
      <div className="flex-1 min-w-[12rem]">
        <h4 className="font-semibold text-[#1d2532] leading-tight">{title}</h4>
        {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
      </div>
      {right}
    </div>
    {children}
  </section>
);

// Used for both "add" (on the page) and "edit" (inside the popup)
const CollectionForm = ({ categories, products, collections = [], initial, isEdit, onSubmit, onBack, inModal, onDirtyChange }) => {
  const message = useToast();

  const productsByCat = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const catId = idOf(p.categoryId);
      if (!catId) return;
      (map[catId] = map[catId] || []).push(p);
    });
    return map;
  }, [products]);

  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [idOf(p), p])),
    [products],
  );

  const initialState = useMemo(() => buildState(initial, productsByCat), [initial, productsByCat]);

  const [title, setTitle] = useState(initialState.title);
  const [titleEditable, setTitleEditable] = useState(!isEdit);
  const [selectedCats, setSelectedCats] = useState(initialState.selectedCats);
  const [order, setOrder] = useState(initialState.order);
  const [selected, setSelected] = useState(initialState.selected);
  const [placement, setPlacement] = useState(initialState.placement);
  const [isActive, setIsActive] = useState(initialState.isActive);
  const [openCats, setOpenCats] = useState({});
  const [catSearch, setCatSearch] = useState("");
  const [drag, setDrag] = useState(null); // { catId, index }
  const [confirmMode, setConfirmMode] = useState(null); // "save" | "position"
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  const reset = () => {
    setTitle(initialState.title);
    setTitleEditable(!isEdit);
    setSelectedCats(initialState.selectedCats);
    setOrder(initialState.order);
    setSelected(initialState.selected);
    setPlacement(initialState.placement);
    setIsActive(initialState.isActive);
    setOpenCats({});
  };

  useEffect(reset, [initialState]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ================= CATEGORY ================= */
  const toggleCategory = (catId) => {
    if (selectedCats.includes(catId)) {
      setSelectedCats((prev) => prev.filter((id) => id !== catId));
      return;
    }
    setSelectedCats((prev) => [...prev, catId]);
    setOrder((prev) => ({
      ...prev,
      [catId]: prev[catId] || (productsByCat[catId] || []).map(idOf),
    }));
    setSelected((prev) => ({ ...prev, [catId]: prev[catId] || [] }));
    setOpenCats((prev) => ({ ...prev, [catId]: true }));
  };

  const moveCategory = (from, to) => {
    if (to < 0 || to >= selectedCats.length) return;
    setSelectedCats((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  /* ================= PRODUCTS ================= */
  const toggleProduct = (catId, productId) => {
    setSelected((prev) => {
      const cur = prev[catId] || [];
      return {
        ...prev,
        [catId]: cur.includes(productId) ? cur.filter((id) => id !== productId) : [...cur, productId],
      };
    });
  };

  const toggleAll = (catId) => {
    const all = order[catId] || [];
    const cur = selected[catId] || [];
    setSelected((prev) => ({ ...prev, [catId]: cur.length === all.length ? [] : [...all] }));
  };

  const moveProduct = (catId, from, to) => {
    const list = order[catId] || [];
    if (to < 0 || to >= list.length || from === to) return;
    setOrder((prev) => {
      const next = [...prev[catId]];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...prev, [catId]: next };
    });
  };

  /* ================= SAVE / CANCEL / BACK ================= */
  const buildPayload = () => ({
    title: title.trim(),
    items: selectedCats.map((catId) => ({
      category: catId,
      // Keep the on-screen order
      products: (order[catId] || []).filter((id) => (selected[catId] || []).includes(id)),
    })),
    placement,
    isActive,
  });

  // What would be saved if nothing were touched; anything different is an unsaved change
  const initialPayload = useMemo(
    () => ({
      title: initialState.title.trim(),
      items: initialState.selectedCats.map((catId) => ({
        category: catId,
        products: (initialState.order[catId] || []).filter((id) => (initialState.selected[catId] || []).includes(id)),
      })),
      placement: initialState.placement,
      isActive: initialState.isActive,
    }),
    [initialState],
  );
  const dirty = JSON.stringify(buildPayload()) !== JSON.stringify(initialPayload);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveClick = (mode) => {
    const payload = buildPayload();
    if (payload.title.length < 2) {
      message.error("Please enter a title (at least 2 characters)");
      return;
    }
    if (!payload.items.length) {
      message.error("Select at least one category");
      return;
    }
    const empty = payload.items.find((i) => !i.products.length);
    if (empty) {
      const name = categories.find((c) => idOf(c) === empty.category)?.name || "a category";
      message.error(`Select at least one product in "${name}"`);
      return;
    }
    setConfirmMode(mode);
  };

  const handleConfirm = async () => {
    try {
      setSaving(true);
      // position: the parent opens the positioning view for the saved collection
      const ok = await onSubmit(buildPayload(), { position: confirmMode === "position" });
      setConfirmMode(null);
      if (ok && !isEdit) reset();
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    message.info(isEdit ? "Changes discarded" : "Form cleared");
  };

  /* ================= UI ================= */
  const totalSelected = selectedCats.reduce((n, id) => n + (selected[id] || []).length, 0);
  const q = catSearch.trim().toLowerCase();
  const visibleCategories = q ? categories.filter((c) => (c.name || "").toLowerCase().includes(q)) : categories;

  const iconBtn =
    "w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#1d2532] disabled:opacity-30 disabled:hover:bg-transparent transition-colors";

  return (
    <div>
      {/* Step 1: title */}
      <Step n={1} title="Name your collection" hint="Shown to customers as the collection heading">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!titleEditable}
              maxLength={100}
              placeholder="e.g. Wedding Gifts, Bridesmaid, Home Decor, Under ₹1,000"
              className={`border w-full rounded-xl pl-4 pr-20 py-3 text-base ${
                titleEditable ? "bg-white" : "bg-gray-50 text-gray-600 cursor-not-allowed"
              }`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400">
              {!titleEditable && <MdLock aria-label="Locked" />}
              {title.length}/100
            </span>
          </div>
          {isEdit && (
            <button
              type="button"
              onClick={() => {
                setTitleEditable(true);
                setTimeout(() => titleRef.current?.focus(), 0);
              }}
              disabled={titleEditable}
              title="Edit title"
              className="px-4 rounded-xl border border-gray-300 bg-white flex items-center gap-1.5 text-sm font-medium text-[#1d2532] hover:bg-gray-50 disabled:opacity-40"
            >
              <MdEdit className="text-lg" />
              {titleEditable ? "Editing" : "Edit"}
            </button>
          )}
        </div>
      </Step>

      {/* Step 2: categories */}
      <Step
        n={2}
        title="Choose categories"
        hint="Tick the categories whose products belong in this collection"
        right={
          <div className="flex items-center gap-3">
            {selectedCats.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1d2532] text-white">
                {selectedCats.length} selected
              </span>
            )}
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                placeholder="Search categories"
                className="border rounded-xl pl-9 pr-3 py-2 text-sm w-48 bg-white"
              />
            </div>
          </div>
        }
      >
        {visibleCategories.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {visibleCategories.map((c) => {
              const catId = idOf(c);
              const checked = selectedCats.includes(catId);
              const count = (productsByCat[catId] || []).length;
              return (
                <label
                  key={catId}
                  className={`group relative block rounded-2xl overflow-hidden cursor-pointer bg-gray-100 transition-all duration-200 ${
                    checked
                      ? "ring-2 ring-[#c8a24a] ring-offset-2 shadow-lg -translate-y-0.5"
                      : "ring-1 ring-black/5 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(catId)}
                    className="sr-only"
                    aria-label={c.name}
                  />
                  <div className="aspect-[4/3] w-full">
                    {c.imageUrl ? (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={imgSrc(c.imageUrl, 320)}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                        <MdCategory />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <span className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-[#1d2532]">
                    {count} product{count === 1 ? "" : "s"}
                  </span>
                  <span
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-lg transition-colors ${
                      checked ? "bg-[#c8a24a] text-white" : "bg-white/80 text-transparent group-hover:text-gray-400"
                    }`}
                    aria-hidden
                  >
                    <MdCheck />
                  </span>
                  <p className="absolute bottom-0 left-0 right-0 px-3 py-2.5 text-white font-semibold text-sm truncate" title={c.name}>
                    {c.name}
                  </p>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-6 text-center">
            {categories.length ? "No categories match your search" : "No categories found. Add categories first."}
          </p>
        )}
      </Step>

      {/* Step 3: products */}
      <Step
        n={3}
        title="Pick & order products"
        hint="Tick products to include. Drag a row (or use the arrows) to set the order customers see."
        right={
          totalSelected > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#fbf6e9] text-[#7a5c14]">
              {totalSelected} product{totalSelected === 1 ? "" : "s"} selected
            </span>
          )
        }
      >
        {selectedCats.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl py-10 text-center text-gray-400">
            <MdCollectionsBookmark className="text-4xl mx-auto mb-2" />
            <p className="text-sm">Choose at least one category above to pick its products</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedCats.map((catId, catIndex) => {
              const cat = categories.find((c) => idOf(c) === catId);
              const list = (order[catId] || []).filter((id) => productById[id]);
              const chosen = selected[catId] || [];
              const isOpen = !!openCats[catId];
              const allChosen = list.length > 0 && chosen.length === list.length;
              return (
                <div
                  key={catId}
                  className={`rounded-2xl bg-white border transition-shadow ${
                    isOpen ? "border-gray-300 shadow-md" : "border-gray-200"
                  }`}
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                    onClick={() => setOpenCats((prev) => ({ ...prev, [catId]: !isOpen }))}
                  >
                    <MdKeyboardArrowDown
                      className={`text-2xl text-gray-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
                    />
                    {cat?.imageUrl ? (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={imgSrc(cat.imageUrl, 80)}
                        alt=""
                        className="w-11 h-11 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1d2532] truncate">{cat?.name || "Deleted category"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-28 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${list.length ? (chosen.length / list.length) * 100 : 0}%`,
                              background: "#c8a24a",
                            }}
                          />
                        </div>
                        <span className={`text-xs ${chosen.length ? "text-gray-500" : "text-red-600 font-medium"}`}>
                          {chosen.length ? `${chosen.length} of ${list.length} selected` : "None selected yet"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <label
                        className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
                          allChosen ? "bg-[#1d2532] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <SelectAllBox
                          checked={allChosen}
                          indeterminate={chosen.length > 0 && chosen.length < list.length}
                          onChange={() => toggleAll(catId)}
                        />
                        Select all
                      </label>
                      <button
                        type="button"
                        onClick={() => moveCategory(catIndex, catIndex - 1)}
                        disabled={catIndex === 0}
                        className={iconBtn}
                        title="Move category up"
                      >
                        <MdArrowUpward />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCategory(catIndex, catIndex + 1)}
                        disabled={catIndex === selectedCats.length - 1}
                        className={iconBtn}
                        title="Move category down"
                      >
                        <MdArrowDownward />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCategory(catId)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Remove category"
                      >
                        <MdClose />
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-gray-100 p-2">
                      {list.length ? (
                        list.map((pid, index) => {
                          const p = productById[pid];
                          const checked = chosen.includes(pid);
                          const dragging = drag?.catId === catId && drag.index === index;
                          return (
                            <div
                              key={pid}
                              draggable
                              onDragStart={() => setDrag({ catId, index })}
                              onDragOver={(e) => drag?.catId === catId && e.preventDefault()}
                              onDrop={() => {
                                if (drag?.catId === catId) moveProduct(catId, drag.index, index);
                                setDrag(null);
                              }}
                              onDragEnd={() => setDrag(null)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-xl border-l-4 transition-colors ${
                                checked
                                  ? "border-[#c8a24a] bg-[#fbf8ef] hover:bg-[#f7f1e0]"
                                  : "border-transparent hover:bg-gray-50"
                              } ${dragging ? "opacity-40" : ""}`}
                            >
                              <MdDragIndicator
                                className="text-xl text-gray-300 hover:text-gray-500 cursor-grab shrink-0"
                                title="Drag to reorder"
                              />
                              <span className="w-7 h-7 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-500 flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleProduct(catId, pid)}
                                className="w-4 h-4 cursor-pointer shrink-0"
                                aria-label={p.name}
                              />
                              {productImage(p) ? (
                                <img
                                  loading="lazy"
                                  decoding="async"
                                  src={imgSrc(productImage(p), 80)}
                                  alt=""
                                  className="w-11 h-11 object-cover rounded-lg shrink-0"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-lg bg-gray-100 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate ${checked ? "text-[#1d2532] font-medium" : "text-gray-500"}`}>
                                  {p.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  ₹{Number(p.sellingPrice || 0).toLocaleString("en-IN")}
                                  {p.mrp > p.sellingPrice && (
                                    <span className="line-through ml-1.5">₹{Number(p.mrp).toLocaleString("en-IN")}</span>
                                  )}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => moveProduct(catId, index, index - 1)}
                                disabled={index === 0}
                                className={iconBtn}
                                title="Move up"
                              >
                                <MdArrowUpward />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveProduct(catId, index, index + 1)}
                                disabled={index === list.length - 1}
                                className={iconBtn}
                                title="Move down"
                              >
                                <MdArrowDownward />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="px-3 py-4 text-sm text-gray-500">No products in this category</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Step>

      {/* Step 4: homepage placement */}
      <Step
        n={4}
        title="Where to show on the homepage"
        hint="Customers see the first 4 products here, with a View All button for the rest"
      >
        <HomePlacementPicker
          value={placement}
          onChange={setPlacement}
          isActive={isActive}
          onActiveChange={setIsActive}
          title={title}
          others={collections.filter((c) => idOf(c) !== idOf(initial))}
        />
      </Step>

      {/* Floating actions: sticky, not fixed, so they float while the form is on screen and stop at its end */}
      <div
        className={`${inModal ? "sticky bottom-0 py-3" : "sticky bottom-4 pt-2"} flex justify-end pointer-events-none`}
        style={{ zIndex: 40 }}
      >
        <div
          className={`pointer-events-auto flex flex-wrap items-center justify-end gap-3 pl-5 pr-2 py-2 rounded-[2rem] backdrop-blur border shadow-xl transition-colors ${
            dirty ? "bg-[#fffaeb]/95 border-[#fec84b]" : "bg-white/95 border-gray-200"
          }`}
        >
          <div className="text-xs hidden sm:block">
            {dirty && (
              <p className="flex items-center gap-1 font-semibold text-[#b54708]" role="status">
                <MdWarningAmber className="text-base" /> You have unsaved changes. Click Save to keep them.
              </p>
            )}
            <p className="text-gray-500">
              <span className="font-semibold text-[#1d2532]">{selectedCats.length}</span> categor
              {selectedCats.length === 1 ? "y" : "ies"} ·{" "}
              <span className="font-semibold text-[#1d2532]">{totalSelected}</span> product{totalSelected === 1 ? "" : "s"}
            </p>
          </div>
          {[
            // The popup closes with Cancel/Save, so it has no Back button
            !inModal && { label: "Back", icon: <MdArrowBack />, onClick: onBack, style: { background: "#fff", color: "#1d2532", border: "1px solid #d0d5dd" } },
            { label: "Cancel", icon: <MdClose />, onClick: handleCancel, style: { background: "#f2f4f7", color: "#475467" } },
            { label: "Save", icon: <MdSave />, onClick: () => handleSaveClick("save"), style: { background: "linear-gradient(135deg, #1d2532, #34425a)", color: "#fff" } },
          ]
            .filter(Boolean)
            .map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={b.onClick}
                title={b.label}
                style={b.style}
                className="w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span className="text-xl leading-none">{b.icon}</span>
                <span className="text-[10px] leading-none mt-1 font-medium">{b.label}</span>
              </button>
            ))}
          <button
            type="button"
            onClick={() => handleSaveClick("position")}
            title="Save, then arrange the order customers see"
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff" }}
            className="h-14 px-5 rounded-full flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <MdLowPriority className="text-xl" />
            <span className="text-sm font-semibold whitespace-nowrap">Save &amp; Positioning</span>
          </button>
        </div>
      </div>

      {confirmMode && (
        <ConfirmModal
          title={confirmMode === "position" ? "Save and arrange positions?" : isEdit ? "Save changes?" : "Save collection?"}
          text={
            confirmMode === "position"
              ? `Save "${title.trim()}" with ${totalSelected} product${totalSelected === 1 ? "" : "s"}, then arrange their order?`
              : `Save "${title.trim()}" with ${totalSelected} product${totalSelected === 1 ? "" : "s"}?`
          }
          confirmLabel={confirmMode === "position" ? "Yes, Save & Position" : "Yes, Save"}
          confirmColor={confirmMode === "position" ? "#2563eb" : "#1d2532"}
          busy={saving}
          onCancel={() => setConfirmMode(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};

export default CollectionForm;
