import React, { useEffect, useMemo, useRef, useState } from "react";
import { Select } from "antd";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdDragIndicator,
  MdLowPriority,
  MdOpenInNew,
  MdRestartAlt,
  MdSave,
  MdSearch,
  MdUndo,
  MdVerticalAlignBottom,
  MdVerticalAlignTop,
  MdVisibilityOff,
} from "react-icons/md";
import { getCategoryProductOrderApi, getDomainsApi, saveCategoryProductOrderApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";
import Load from "../Load/Load";
import { imgSrc, ConfirmModal } from "../Collections/CollectionForm";
import { idOf, firstImage } from "../Discounts/DiscountForm";
import { categoryPath } from "../MultiCategory/CategoriesModal";
import { WEBSITE_URL } from "../Seo/SeoFields";

const Badge = ({ children, tone }) => {
  const tones = {
    extra: "bg-blue-50 text-blue-700 border-blue-200",
    new: "bg-amber-50 text-amber-700 border-amber-200",
    off: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${tones[tone]}`}>
      {children}
    </span>
  );
};

const move = (list, from, to) => {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

// Admin > Product Order: the order products appear in on a category page of the website
const ProductOrder = () => {
  const message = useToast();
  const loadRequest = useRef(0);

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(undefined);
  const [info, setInfo] = useState(null); // { category, hasCustomOrder, updatedAt }
  const [saved, setSaved] = useState([]); // products in the order last loaded/saved
  const [order, setOrder] = useState([]); // products in the order on screen
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drag, setDrag] = useState(null); // index being dragged
  const [over, setOver] = useState(null); // index hovered while dragging
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null); // { kind: "switch", to } | { kind: "reset" }

  useEffect(() => {
    getDomainsApi()
      .then((res) => setCategories(res?.data || []))
      .catch(errorResponseHandler);
  }, []);

  const categoryOptions = useMemo(
    () =>
      [...categories]
        .map((c) => ({ value: idOf(c), label: categoryPath(c), search: categoryPath(c).toLowerCase() }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [categories],
  );

  const dirty = useMemo(
    () => order.length !== saved.length || order.some((p, i) => idOf(p) !== idOf(saved[i])),
    [order, saved],
  );

  // Warn before leaving the page with unsaved changes
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const load = async (id) => {
    const request = ++loadRequest.current;
    setCategoryId(id);
    setSearch("");
    if (!id) {
      setInfo(null);
      setSaved([]);
      setOrder([]);
      return;
    }
    try {
      setLoading(true);
      const res = await getCategoryProductOrderApi(id);
      if (request !== loadRequest.current) return; // another category was picked meanwhile
      const products = res?.data?.products || [];
      setInfo({ category: res?.data?.category, hasCustomOrder: res?.data?.hasCustomOrder, updatedAt: res?.data?.updatedAt });
      setSaved(products);
      setOrder(products);
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      if (request === loadRequest.current) setLoading(false);
    }
  };

  const pickCategory = (id) => {
    if (id === categoryId) return;
    if (dirty) setConfirm({ kind: "switch", to: id });
    else load(id);
  };

  const save = async (products) => {
    try {
      setSaving(true);
      const res = await saveCategoryProductOrderApi(categoryId, products.map(idOf));
      if (res?.success) {
        message.success(products.length ? "Product order saved" : "Order reset to newest first");
        await load(categoryId);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSaving(false);
      setConfirm(null);
    }
  };

  const q = search.trim().toLowerCase();
  const matches = (p) => !q || (p.name || "").toLowerCase().includes(q);
  const newCount = order.filter((p) => p.isNew).length;
  const hiddenCount = order.filter((p) => p.isActive === false).length;
  const websiteLink = info?.category?.slug ? `${WEBSITE_URL}/categories/${info.category.slug}` : null;

  const iconBtn =
    "w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#1d2532] disabled:opacity-30 disabled:hover:bg-transparent transition-colors";

  return (
    <div className="p-4 pb-28 mt-16">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white mb-6 bg-gradient-to-br from-[#1d2532] to-[#2f3b4f]">
        <p className="text-xs tracking-[0.25em] uppercase text-[#e3c77a]">Catalog</p>
        <h2 className="text-3xl font-bold mt-1 !text-white">Product Order</h2>
        <p className="text-sm text-gray-300 mt-1 max-w-2xl">
          Choose the order products appear in on a category page of the website. Drag a row, or use the arrows. Products
          added to the category later appear after the ordered ones, newest first, until you place them.
        </p>
      </div>

      <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
        <label className="block text-sm font-semibold text-[#1d2532] mb-1.5">Category</label>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            showSearch
            allowClear
            value={categoryId}
            onChange={pickCategory}
            placeholder="Search and choose a category"
            options={categoryOptions}
            filterOption={(input, opt) => opt.search.includes(input.toLowerCase())}
            className="w-full max-w-xl"
            size="large"
            notFoundContent="No categories found"
          />
          {websiteLink && (
            <a
              href={websiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#8a6a1f] hover:underline"
            >
              View on website <MdOpenInNew />
            </a>
          )}
        </div>

        {loading && (
          <div className="py-16">
            <Load />
          </div>
        )}

        {!loading && categoryId && info && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-[#1d2532]">{order.length} products</span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    info.hasCustomOrder ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {info.hasCustomOrder ? "Custom order" : "Default order: newest first"}
                </span>
                {newCount > 0 && <Badge tone="new">{newCount} not placed yet</Badge>}
                {hiddenCount > 0 && (
                  <Badge tone="off">
                    <MdVisibilityOff /> {hiddenCount} hidden
                  </Badge>
                )}
              </div>
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a product"
                  className="pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#c8a24a] w-56"
                />
              </div>
            </div>

            {q && (
              <p className="text-xs text-gray-500 mb-2">
                Showing products matching "{search.trim()}". Dragging works on the full list; clear the search to drag.
              </p>
            )}

            {order.length === 0 ? (
              <p className="py-12 text-center text-gray-500">This category has no products yet.</p>
            ) : (
              <ol className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                {order.map((p, index) => {
                  if (!matches(p)) return null;
                  const id = idOf(p);
                  const image = firstImage(p);
                  return (
                    <li
                      key={id}
                      draggable={!q}
                      onDragStart={() => setDrag(index)}
                      onDragOver={(e) => {
                        if (drag === null) return;
                        e.preventDefault();
                        setOver(index);
                      }}
                      onDrop={() => {
                        if (drag !== null) setOrder((list) => move(list, drag, index));
                        setDrag(null);
                        setOver(null);
                      }}
                      onDragEnd={() => {
                        setDrag(null);
                        setOver(null);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 bg-white transition-colors ${
                        drag === index ? "opacity-40" : ""
                      } ${over === index && drag !== index ? "!bg-[#fbf6e9]" : ""}`}
                    >
                      <MdDragIndicator
                        className={`text-xl shrink-0 ${q ? "text-gray-200" : "text-gray-400 cursor-grab"}`}
                        title={q ? "Clear the search to drag" : "Drag to move"}
                      />
                      <span className="w-8 text-center text-sm font-semibold text-gray-500 shrink-0">{index + 1}</span>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {image && <img src={imgSrc(image, 80)} alt="" className="w-full h-full object-cover" loading="lazy" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${p.isActive === false ? "text-gray-400" : "text-[#1d2532]"}`}>
                          {p.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-gray-500">₹{Number(p.sellingPrice || 0).toLocaleString("en-IN")}</span>
                          {p.isExtra && <Badge tone="extra">Via Multi Category</Badge>}
                          {p.isNew && <Badge tone="new">Not placed yet</Badge>}
                          {p.isActive === false && <Badge tone="off">Hidden on website</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button type="button" title="Move to top" className={iconBtn} disabled={index === 0}
                          onClick={() => setOrder((list) => move(list, index, 0))}>
                          <MdVerticalAlignTop />
                        </button>
                        <button type="button" title="Move up" className={iconBtn} disabled={index === 0}
                          onClick={() => setOrder((list) => move(list, index, index - 1))}>
                          <MdArrowUpward />
                        </button>
                        <button type="button" title="Move down" className={iconBtn} disabled={index === order.length - 1}
                          onClick={() => setOrder((list) => move(list, index, index + 1))}>
                          <MdArrowDownward />
                        </button>
                        <button type="button" title="Move to bottom" className={iconBtn} disabled={index === order.length - 1}
                          onClick={() => setOrder((list) => move(list, index, list.length - 1))}>
                          <MdVerticalAlignBottom />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        )}

        {!loading && !categoryId && (
          <div className="py-14 text-center text-gray-400">
            <MdLowPriority className="text-5xl mx-auto mb-2" />
            <p>Choose a category to arrange its products.</p>
          </div>
        )}
      </div>

      {/* Floating actions */}
      {categoryId && info && !loading && (
        <div className="sticky bottom-4 mt-4 flex justify-end pointer-events-none">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-2xl bg-white/95 backdrop-blur border border-gray-200 shadow-lg p-2">
            {info.hasCustomOrder && (
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirm({ kind: "reset" })}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 flex items-center gap-1.5"
              >
                <MdRestartAlt /> Reset to newest first
              </button>
            )}
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => setOrder(saved)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 flex items-center gap-1.5"
            >
              <MdUndo /> Undo changes
            </button>
            <button
              type="button"
              disabled={(!dirty && !(newCount > 0)) || saving || !order.length}
              onClick={() => save(order)}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#1d2532] hover:bg-[#2f3b4f] disabled:opacity-40 flex items-center gap-1.5"
              title={!dirty && newCount > 0 ? "Save to place the new products where they are now" : undefined}
            >
              <MdSave /> {saving ? "Saving..." : "Save order"}
            </button>
          </div>
        </div>
      )}

      {confirm?.kind === "switch" && (
        <ConfirmModal
          title="Discard unsaved changes?"
          text={`The new order for "${info?.category?.name}" hasn't been saved. Switch category and lose it?`}
          confirmLabel="Yes, switch"
          cancelLabel="Stay"
          confirmColor="#b42318"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            const to = confirm.to;
            setConfirm(null);
            load(to);
          }}
        />
      )}
      {confirm?.kind === "reset" && (
        <ConfirmModal
          title="Reset to newest first?"
          text={`"${info?.category?.name}" will show its products newest first again. Your saved order will be removed.`}
          confirmLabel="Yes, reset"
          cancelLabel="No"
          confirmColor="#b42318"
          busy={saving}
          onCancel={() => setConfirm(null)}
          onConfirm={() => save([])}
        />
      )}
    </div>
  );
};

export default ProductOrder;
