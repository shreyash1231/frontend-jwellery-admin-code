import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pagination, Select } from "antd";
import {
  MdAccountTree,
  MdAddCircleOutline,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDelete,
  MdDiamond,
  MdEdit,
  MdInventory2,
  MdSave,
  MdSearch,
  MdStar,
  MdVisibilityOff,
  MdRefresh,
} from "react-icons/md";
import {
  getAllProductCategoriesApi,
  getProductCategoriesApi,
  saveProductCategoriesApi,
  updateProductCategoryStatusApi,
  deleteProductCategoryApi,
  deleteProductCategoriesApi,
  getAllProductsForPickerApi,
  getDomainsApi,
} from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";
import Load from "../Load/Load";
import { imgSrc, ConfirmModal } from "../Collections/CollectionForm";
import { idOf, firstImage } from "../Discounts/DiscountForm";
import CategoriesModal, { categoryPath } from "./CategoriesModal";

// Extra category chips shown in a listing row before "+N more"
const VISIBLE_EXTRA = 2;

const mainCategoryOf = (p) => (typeof p?.categoryId === "object" ? p.categoryId : null);

// { categoryId: isActive } from the API's link list
const toSelection = (links) => {
  const sel = {};
  (links || []).forEach((l) => (sel[idOf(l.category)] = l.isActive !== false));
  return sel;
};

const sameSelection = (a, b) => {
  const ka = Object.keys(a);
  return ka.length === Object.keys(b).length && ka.every((k) => b[k] === a[k]);
};

const Chip = ({ children, tone = "default", title }) => {
  const tones = {
    main: "bg-[#fbf6e9] text-[#7a5c14] border-[#ecd9a6]",
    default: "bg-white text-[#1d2532] border-gray-200",
    off: "bg-gray-100 text-gray-400 border-gray-200 line-through",
  };
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 max-w-[180px] text-xs font-medium px-2.5 py-1 rounded-full border ${tones[tone]}`}
    >
      <span className="truncate">{children}</span>
    </span>
  );
};

const MultiCategory = () => {
  const message = useToast();
  const formRef = useRef(null);
  const pickRequest = useRef(0);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = useState([]);

  // Assign form
  const [formProduct, setFormProduct] = useState(undefined);
  const [selected, setSelected] = useState({}); // { categoryId: isActive }
  const [original, setOriginal] = useState({}); // what's saved for formProduct
  const [loadingSel, setLoadingSel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  // Listing
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewing, setViewing] = useState(null); // product id whose popup is open
  const [busyId, setBusyId] = useState(null);
  const [deletingRow, setDeletingRow] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const fetchRows = async () => {
    try {
      const res = await getAllProductCategoriesApi();
      if (res?.success) setRows(res.data || []);
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([getAllProductsForPickerApi(), getDomainsApi()]);
        setProducts(prodRes?.data?.products || []);
        setCategories(catRes?.data || []);
        await fetchRows();
      } catch (err) {
        errorResponseHandler(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productById = useMemo(() => {
    const m = {};
    products.forEach((p) => (m[p._id] = p));
    return m;
  }, [products]);

  const extraCount = useMemo(() => {
    const m = {};
    rows.forEach((r) => (m[idOf(r.product)] = r.categories.length));
    return m;
  }, [rows]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => categoryPath(a).localeCompare(categoryPath(b))),
    [categories],
  );

  /* ---------------- Assign form ---------------- */

  const formMain = mainCategoryOf(productById[formProduct]);
  const dirty = !!formProduct && !sameSelection(selected, original);
  const selectedCount = Object.keys(selected).length;

  // Picking a product (again) loads the extra categories already saved for it
  const pickProduct = async (productId) => {
    const requestId = ++pickRequest.current;
    setFormProduct(productId);
    setSelected({});
    setOriginal({});
    setCatSearch("");
    if (!productId) return setLoadingSel(false);
    setLoadingSel(true);
    try {
      const res = await getProductCategoriesApi(productId);
      if (requestId !== pickRequest.current) return; // another product was picked meanwhile
      const sel = toSelection(res?.data);
      setSelected(sel);
      setOriginal(sel);
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      if (requestId === pickRequest.current) setLoadingSel(false);
    }
  };

  const editProduct = (productId) => {
    setViewing(null);
    pickProduct(productId);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleCategory = (id) =>
    setSelected((s) => {
      const next = { ...s };
      if (id in next) delete next[id];
      else next[id] = original[id] ?? true; // re-checking keeps the saved status
      return next;
    });

  const visibleCategories = useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    return sortedCategories.filter((c) => !q || categoryPath(c).toLowerCase().includes(q));
  }, [sortedCategories, catSearch]);

  const pickable = visibleCategories.filter((c) => c._id !== idOf(formMain));
  const allVisibleChecked = pickable.length > 0 && pickable.every((c) => c._id in selected);

  const toggleAllVisible = () =>
    setSelected((s) => {
      const next = { ...s };
      pickable.forEach((c) => {
        if (allVisibleChecked) delete next[c._id];
        else if (!(c._id in next)) next[c._id] = original[c._id] ?? true;
      });
      return next;
    });

  const handleSave = async () => {
    if (!formProduct) return message.error("Choose a product first");
    setSaving(true);
    try {
      const list = Object.entries(selected).map(([category, isActive]) => ({ category, isActive }));
      const res = await saveProductCategoriesApi(formProduct, list);
      if (res?.success) {
        const sel = toSelection(res.data);
        setSelected(sel);
        setOriginal(sel);
        message.success(res.message || "Categories saved");
        fetchRows();
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Listing actions ---------------- */

  // Keeps the form in step when the same product is changed from the popup
  const syncForm = (productId, categoryId, isActive) => {
    if (productId !== formProduct) return;
    const apply = (s) => {
      const next = { ...s };
      if (isActive === null) delete next[categoryId];
      else if (categoryId in next) next[categoryId] = isActive;
      return next;
    };
    setSelected(apply);
    setOriginal(apply);
  };

  const handleToggle = async (productId, link, isActive) => {
    setBusyId(link._id);
    try {
      const res = await updateProductCategoryStatusApi(link._id, isActive);
      if (res?.success) {
        setRows((list) =>
          list.map((r) =>
            idOf(r.product) === productId
              ? { ...r, categories: r.categories.map((c) => (c._id === link._id ? { ...c, isActive } : c)) }
              : r,
          ),
        );
        syncForm(productId, idOf(link.category), isActive);
        message.success(isActive ? "Category activated" : "Category deactivated");
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteLink = async (productId, link) => {
    setBusyId(link._id);
    try {
      const res = await deleteProductCategoryApi(link._id);
      if (res?.success) {
        setRows((list) =>
          list
            .map((r) =>
              idOf(r.product) === productId ? { ...r, categories: r.categories.filter((c) => c._id !== link._id) } : r,
            )
            .filter((r) => r.categories.length),
        );
        syncForm(productId, idOf(link.category), null);
        message.success("Category removed from product");
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteRow = async () => {
    const productId = idOf(deletingRow.product);
    setDeletingBusy(true);
    try {
      const res = await deleteProductCategoriesApi(productId);
      if (res?.success) {
        setRows((list) => list.filter((r) => idOf(r.product) !== productId));
        if (productId === formProduct) {
          setSelected({});
          setOriginal({});
        }
        message.success("Extra categories removed");
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setDeletingBusy(false);
      setDeletingRow(null);
    }
  };

  /* ---------------- Derived listing ---------------- */

  const stats = useMemo(() => {
    const links = rows.flatMap((r) => r.categories);
    return {
      products: rows.length,
      links: links.length,
      inactive: links.filter((l) => !l.isActive).length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.product?.name || "").toLowerCase().includes(q) ||
        (mainCategoryOf(r.product)?.name || "").toLowerCase().includes(q) ||
        r.categories.some((c) => categoryPath(c.category).toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const productOptions = useMemo(
    () =>
      products.map((p) => {
        const main = mainCategoryOf(p)?.name || "";
        const extras = extraCount[p._id] || 0;
        return {
          value: p._id,
          search: `${p.name} ${main}`.toLowerCase(),
          label: (
            <span className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-md bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-gray-300">
                {firstImage(p) ? <img src={imgSrc(firstImage(p), 80)} alt="" className="w-full h-full object-cover" /> : <MdDiamond />}
              </span>
              <span className="truncate flex-1">
                {p.name}
                {main && <span className="text-gray-500"> ({main})</span>}
              </span>
              {extras > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#fbf6e9] text-[#7a5c14] shrink-0">
                  +{extras} categories
                </span>
              )}
            </span>
          ),
        };
      }),
    [products, extraCount],
  );

  if (loading) return <Load />;

  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);
  const viewingRow = viewing ? rows.find((r) => idOf(r.product) === viewing) : null;

  return (
    <div className="p-4 pb-10 mt-16">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white mb-6 bg-gradient-to-br from-[#1d2532] to-[#2f3b4f]">
        <p className="text-xs tracking-[0.25em] uppercase text-[#e3c77a]">Catalog</p>
        <h2 className="text-3xl font-bold mt-1 !text-white">Multi Category</h2>
        <p className="text-sm text-gray-300 mt-1 max-w-xl">
          List one product in several categories. The product's main category stays as it is; the extra categories
          chosen here show the product in those categories on the website too.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          {[
            { icon: <MdInventory2 />, value: stats.products, label: "Products in many categories" },
            { icon: <MdAccountTree />, value: stats.links, label: "Extra category links" },
            { icon: <MdVisibilityOff />, value: stats.inactive, label: "Inactive links" },
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

      {/* Assign */}
      <div ref={formRef} className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm mb-10 scroll-mt-20">
        <div className="flex items-center gap-2 mb-6">
          <MdAddCircleOutline className="text-2xl text-[#c8a24a]" />
          <h3 className="text-lg font-semibold text-[#1d2532]">Assign categories to a product</h3>
        </div>

        <label className="block text-sm font-semibold text-[#1d2532] mb-1.5">
          Product <span className="text-red-500">*</span>
        </label>
        <Select
          showSearch
          allowClear
          value={formProduct}
          onChange={pickProduct}
          placeholder="Search and choose a product"
          options={productOptions}
          filterOption={(input, opt) => opt.search.includes(input.toLowerCase())}
          className="w-full max-w-xl"
          size="large"
          notFoundContent="No products found"
        />
        <p className="text-xs text-gray-500 mt-1">
          Choosing a product that already has extra categories shows them ticked below, ready to change.
        </p>

        {formProduct && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-[#1d2532]">
                  Categories <span className="font-normal text-gray-500">· {selectedCount} extra selected</span>
                </p>
                {formMain && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <MdStar className="text-[#c8a24a]" /> Main category: <b className="text-[#7a5c14]">{formMain.name}</b>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    placeholder="Find a category"
                    className="border rounded-xl pl-9 pr-3 py-2 text-sm w-56 bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleAllVisible}
                  disabled={!pickable.length || loadingSel}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[#1d2532] bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  {allVisibleChecked ? "Untick all" : "Tick all"}
                </button>
              </div>
            </div>

            {loadingSel ? (
              <div className="py-10 text-center text-sm text-gray-500">Loading saved categories…</div>
            ) : visibleCategories.length ? (
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-h-[360px] overflow-y-auto pr-1">
                {visibleCategories.map((c) => {
                  const isMain = c._id === idOf(formMain);
                  const checked = isMain || c._id in selected;
                  const inactive = !isMain && checked && selected[c._id] === false;
                  return (
                    <button
                      key={c._id}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      disabled={isMain}
                      onClick={() => toggleCategory(c._id)}
                      title={isMain ? "Main category: change it on the Products page" : categoryPath(c)}
                      className={`flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                        isMain
                          ? "border-[#ecd9a6] bg-[#fbf6e9] cursor-not-allowed"
                          : checked
                            ? "border-[#c8a24a] bg-[#fffaf0]"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      {checked ? (
                        <MdCheckBox className={`text-xl shrink-0 ${isMain ? "text-[#d9c287]" : "text-[#c8a24a]"}`} />
                      ) : (
                        <MdCheckBoxOutlineBlank className="text-xl shrink-0 text-gray-300" />
                      )}
                      <span className="flex-1 min-w-0 truncate text-[#1d2532]">{categoryPath(c)}</span>
                      {isMain && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#ecd9a6] text-[#7a5c14]">MAIN</span>
                      )}
                      {inactive && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">INACTIVE</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-500 border-2 border-dashed rounded-xl">
                {categories.length ? "No category matches your search" : "No categories yet. Add some on the Category page."}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 mt-5">
              {dirty && <span className="text-xs text-amber-600 mr-auto">Unsaved changes. Unticked categories are removed when you save.</span>}
              <button
                type="button"
                onClick={() => setSelected(original)}
                disabled={!dirty || saving}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#1d2532] bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                <MdRefresh /> Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!dirty || saving || loadingSel}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1d2532] hover:bg-[#2f3b4f] disabled:opacity-50"
              >
                <MdSave /> {saving ? "Saving…" : "Save categories"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Listing */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#1d2532]">Products in multiple categories</h3>
          <p className="text-sm text-gray-500">Click "+ more" to see every category of a product, switch them on or off, or remove them.</p>
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
            placeholder="Search product or category"
            className="border rounded-xl pl-9 pr-3 py-2 text-sm w-72 bg-white"
          />
        </div>
      </div>

      {pageItems.length ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-semibold w-12">#</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Categories</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((r, i) => {
                const p = r.product;
                const pid = idOf(p);
                const main = mainCategoryOf(p);
                const shown = r.categories.slice(0, VISIBLE_EXTRA);
                const more = r.categories.length - shown.length;
                return (
                  <tr key={pid} className="border-b last:border-b-0 hover:bg-gray-50/60 align-middle">
                    <td className="px-4 py-3 text-gray-400">{startIndex + i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <span className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center text-gray-300 shrink-0">
                          {firstImage(p) ? <img src={imgSrc(firstImage(p), 80)} alt="" className="w-full h-full object-cover" /> : <MdDiamond />}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1d2532] line-clamp-2">{p?.name}</p>
                          {p?.isActive === false && <p className="text-[11px] text-gray-400">Product is inactive</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {main && (
                          <Chip tone="main" title="Main category">
                            <MdStar className="inline -mt-0.5 mr-0.5" />
                            {main.name}
                          </Chip>
                        )}
                        {shown.map((c) => (
                          <Chip
                            key={c._id}
                            tone={c.isActive ? "default" : "off"}
                            title={`${categoryPath(c.category)}${c.isActive ? "" : " (inactive)"}`}
                          >
                            {c.category?.name}
                          </Chip>
                        ))}
                        {more > 0 ? (
                          <button
                            type="button"
                            onClick={() => setViewing(pid)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1d2532] text-white hover:bg-[#2f3b4f]"
                          >
                            +{more} more
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setViewing(pid)}
                            className="text-xs font-semibold px-2 py-1 rounded-full text-[#7a5c14] hover:bg-[#fbf6e9]"
                          >
                            View all
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => editProduct(pid)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1d2532] bg-gray-100 hover:bg-gray-200"
                        >
                          <MdEdit className="text-base" /> Edit
                        </button>
                        <button
                          type="button"
                          title="Remove all extra categories"
                          onClick={() => setDeletingRow(r)}
                          className="w-9 h-9 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 flex items-center justify-center"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl py-14 text-center bg-white">
          <MdAccountTree className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-[#1d2532]">{rows.length ? "No products match" : "No products in multiple categories yet"}</p>
          <p className="text-sm text-gray-500 mt-1">
            {rows.length ? "Try a different search" : "Choose a product above and tick its extra categories"}
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

      {viewingRow && (
        <CategoriesModal
          row={viewingRow}
          busyId={busyId}
          onClose={() => setViewing(null)}
          onToggle={(link, v) => handleToggle(viewing, link, v)}
          onDelete={(link) => handleDeleteLink(viewing, link)}
          onEdit={() => editProduct(viewing)}
        />
      )}

      {deletingRow && (
        <ConfirmModal
          title="Remove all extra categories?"
          text={`"${deletingRow.product?.name}" will stay only in its main category${
            mainCategoryOf(deletingRow.product) ? ` (${mainCategoryOf(deletingRow.product).name})` : ""
          }. The product itself is not deleted.`}
          confirmLabel="Remove all"
          cancelLabel="Cancel"
          confirmColor="#dc2626"
          busy={deletingBusy}
          onCancel={() => setDeletingRow(null)}
          onConfirm={handleDeleteRow}
        />
      )}
    </div>
  );
};

export default MultiCategory;
