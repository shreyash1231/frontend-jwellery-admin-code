import React, { useEffect, useMemo, useState } from "react";
import {
  MdSave,
  MdArrowBack,
  MdSearch,
  MdCategory,
  MdCheck,
  MdPercent,
  MdCurrencyRupee,
  MdDiamond,
  MdChecklist,
  MdEvent,
  MdArrowForward,
} from "react-icons/md";
import { useToast } from "../toast/Toast";
import { imgSrc } from "../Collections/CollectionForm";

export const idOf = (x) => x?._id || x?.id || x;
export const firstImage = (p) => (Array.isArray(p?.imageUrl) ? p.imageUrl[0] : p?.imageUrl);
export const rupees = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

// Same rule as the server: never below ₹1
export const offerPrice = (price, type, value) => {
  const base = Number(price) || 0;
  const v = Number(value) || 0;
  const off = type === "percentage" ? (base * v) / 100 : v;
  return Math.max(Math.round(base - off), Math.min(1, base));
};

export const offerLabel = (d) =>
  d.type === "percentage" ? `${Number(d.value)}% OFF` : `${rupees(d.value)} OFF`;

// Offers run from the start of the start day to the end of the end day, in the admin's local time
const toInputDate = (d) => {
  if (!d) return "";
  const x = new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};
const startOfDay = (s) => new Date(`${s}T00:00:00`).toISOString();
const endOfDay = (s) => new Date(`${s}T23:59:59.999`).toISOString();
const today = () => toInputDate(new Date());

const buildState = (initial) => {
  const selected = {};
  (initial?.products || []).forEach((p) => {
    selected[idOf(p.product)] = p.isActive !== false;
  });
  return {
    title: initial?.title || "",
    category: idOf(initial?.category) || "",
    scope: initial?.scope || "category",
    selected,
    type: initial?.type || "percentage",
    value: initial?.value != null ? String(initial.value) : "",
    startDate: toInputDate(initial?.startDate) || today(),
    endDate: toInputDate(initial?.endDate) || "",
    isActive: initial?.isActive !== false,
  };
};

export const Switch = ({ checked, onChange, label, size = "md" }) => {
  const big = size === "md";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex shrink-0 items-center rounded-full transition-colors ${
        big ? "w-11 h-6" : "w-9 h-5"
      } ${checked ? "bg-emerald-500" : "bg-gray-300"}`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow transition-transform ${
          big ? "w-5 h-5" : "w-4 h-4"
        } ${checked ? (big ? "translate-x-[22px]" : "translate-x-[18px]") : "translate-x-0.5"}`}
      />
    </button>
  );
};

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

const ChoiceCard = ({ active, icon, title, text, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`relative text-left rounded-2xl border-2 p-4 transition-all ${
      active
        ? "border-[#c8a24a] bg-[#fbf6e9] shadow-sm"
        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
    }`}
  >
    {active && (
      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#c8a24a] text-white flex items-center justify-center text-sm">
        <MdCheck />
      </span>
    )}
    <span
      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 ${
        active ? "bg-[#1d2532] text-[#e3c77a]" : "bg-gray-100 text-gray-500"
      }`}
    >
      {icon}
    </span>
    <p className="font-semibold text-[#1d2532]">{title}</p>
    <p className="text-xs text-gray-500 mt-0.5">{text}</p>
  </button>
);

// Used for both "add" (on the page) and "edit" (inside the popup)
const DiscountForm = ({ categories, products, initial, isEdit, onSubmit, onBack, onDirtyChange }) => {
  const message = useToast();
  const [form, setForm] = useState(() => buildState(initial));
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const initialJson = useMemo(() => JSON.stringify(buildState(initial)), [initial]);
  useEffect(() => {
    onDirtyChange?.(JSON.stringify(form) !== initialJson);
  }, [form, initialJson, onDirtyChange]);

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  };

  const catProducts = useMemo(
    () => products.filter((p) => String(idOf(p.categoryId)) === String(form.category)),
    [products, form.category],
  );

  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? catProducts.filter((p) => (p.name || "").toLowerCase().includes(q)) : catProducts;
  }, [catProducts, search]);

  const selectedIds = Object.keys(form.selected);
  const activeSelected = selectedIds.filter((id) => form.selected[id]);

  // Products the offer will actually lower the price of
  const coveredProducts =
    form.scope === "category" ? catProducts : catProducts.filter((p) => form.selected[idOf(p)]);

  const chooseCategory = (id) => {
    if (id === form.category) return;
    set({ category: id, selected: {} });
    setSearch("");
  };

  const toggleProduct = (id) => {
    const selected = { ...form.selected };
    if (id in selected) delete selected[id];
    else selected[id] = true;
    set({ selected });
  };

  const setProductActive = (id, on) => set({ selected: { ...form.selected, [id]: on } });

  const selectAllVisible = () => {
    const selected = { ...form.selected };
    visibleProducts.forEach((p) => {
      if (!(idOf(p) in selected)) selected[idOf(p)] = true;
    });
    set({ selected });
  };

  const validate = () => {
    const e = {};
    const v = Number(form.value);
    if (form.title.trim().length < 2) e.title = "Give the offer a name (at least 2 characters)";
    if (!form.category) e.category = "Choose a category";
    if (form.scope === "products" && !selectedIds.length) e.selected = "Select at least one product";
    if (!form.value || !(v > 0)) e.value = "Enter a discount more than 0";
    else if (form.type === "percentage" && v >= 100) e.value = "Percentage must be less than 100";
    if (!form.startDate) e.startDate = "Choose a start date";
    if (!form.endDate) e.endDate = "Choose an end date";
    else if (form.startDate && form.endDate < form.startDate) e.endDate = "End date must be on or after the start date";
    setErrors(e);
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      message.error(Object.values(errs)[0]);
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      category: form.category,
      scope: form.scope,
      products:
        form.scope === "products"
          ? selectedIds.map((id) => ({ product: id, isActive: !!form.selected[id] }))
          : [],
      type: form.type,
      value: Number(form.value),
      startDate: startOfDay(form.startDate),
      endDate: endOfDay(form.endDate),
      isActive: form.isActive,
    };
    const ok = await onSubmit(payload);
    setSaving(false);
    if (ok && !isEdit) {
      setForm(buildState(null));
      setSearch("");
    }
  };

  const errText = (k) => errors[k] && <p className="text-xs text-red-600 mt-1.5">{errors[k]}</p>;
  const previewItems = coveredProducts.slice(0, 4);
  const valueNum = Number(form.value) || 0;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* 1. Name */}
      <Step n={1} title="Name the offer" hint="Shown to customers next to the offer price, e.g. Diwali Dhamaka">
        <input
          type="text"
          value={form.title}
          onChange={(e) => set({ title: e.target.value })}
          maxLength={100}
          placeholder="e.g. Festive Earrings Sale"
          className={`w-full max-w-xl border rounded-xl px-4 py-2.5 ${errors.title ? "border-red-500" : "border-gray-300"}`}
        />
        {errText("title")}
      </Step>

      {/* 2. Category */}
      <Step n={2} title="Choose a category" hint="The offer works on products of this category">
        {categories.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((c) => {
              const id = idOf(c);
              const active = String(id) === String(form.category);
              const count = products.filter((p) => String(idOf(p.categoryId)) === String(id)).length;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => chooseCategory(id)}
                  aria-pressed={active}
                  className={`relative flex items-center gap-3 p-2.5 rounded-xl border-2 text-left transition-all ${
                    active ? "border-[#c8a24a] bg-[#fbf6e9]" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-gray-300 text-xl">
                    {c.imageUrl ? (
                      <img src={imgSrc(c.imageUrl, 160)} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <MdCategory />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#1d2532] truncate">{c.name}</span>
                    <span className="block text-[11px] text-gray-500">
                      {count} product{count === 1 ? "" : "s"}
                    </span>
                  </span>
                  {active && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#c8a24a] text-white flex items-center justify-center text-sm shadow">
                      <MdCheck />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Add a category first.</p>
        )}
        {errText("category")}
      </Step>

      {/* 3. Scope */}
      <Step n={3} title="Apply the offer to" hint="The whole category, or only the products you pick">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          <ChoiceCard
            active={form.scope === "category"}
            icon={<MdCategory />}
            title="Whole category"
            text="Every product in the category, including ones added later"
            onClick={() => set({ scope: "category" })}
          />
          <ChoiceCard
            active={form.scope === "products"}
            icon={<MdChecklist />}
            title="Specific products"
            text="Pick products and switch each one on or off"
            onClick={() => set({ scope: "products" })}
          />
        </div>

        {form.scope === "products" && (
          <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
            {!form.category ? (
              <p className="text-sm text-gray-500 py-6 text-center">Choose a category above to see its products.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <p className="text-sm text-[#1d2532]">
                    <span className="font-semibold">{selectedIds.length}</span> selected
                    {selectedIds.length > 0 && (
                      <span className="text-gray-500">
                        {" "}· {activeSelected.length} active, {selectedIds.length - activeSelected.length} inactive
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products"
                        className="border border-gray-300 rounded-xl pl-9 pr-3 py-1.5 text-sm w-52 bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={selectAllVisible}
                      className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100"
                    >
                      Select all
                    </button>
                    {selectedIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => set({ selected: {} })}
                        className="text-xs font-semibold px-3 py-2 rounded-xl text-red-600 bg-white border border-red-200 hover:bg-red-50"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {visibleProducts.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
                    {visibleProducts.map((p) => {
                      const id = idOf(p);
                      const picked = id in form.selected;
                      const on = !!form.selected[id];
                      return (
                        <div
                          key={id}
                          role="checkbox"
                          aria-checked={picked}
                          tabIndex={0}
                          onClick={() => toggleProduct(id)}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              toggleProduct(id);
                            }
                          }}
                          className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-colors ${
                            picked ? "border-[#c8a24a] bg-white shadow-sm" : "border-transparent bg-white/70 hover:bg-white"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs shrink-0 ${
                              picked ? "bg-[#1d2532] border-[#1d2532] text-white" : "border-gray-300"
                            }`}
                          >
                            {picked && <MdCheck />}
                          </span>
                          <span className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-gray-300">
                            {firstImage(p) ? (
                              <img src={imgSrc(firstImage(p), 160)} alt="" className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <MdDiamond />
                            )}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-[#1d2532] truncate" title={p.name}>
                              {p.name}
                            </span>
                            <span className="block text-xs text-gray-500">
                              {picked && on && valueNum > 0 ? (
                                <>
                                  <s className="text-gray-400">{rupees(p.sellingPrice)}</s>{" "}
                                  <span className="font-semibold text-emerald-700">
                                    {rupees(offerPrice(p.sellingPrice, form.type, form.value))}
                                  </span>
                                </>
                              ) : (
                                rupees(p.sellingPrice)
                              )}
                            </span>
                          </span>
                          {picked && (
                            <span className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <span className={`text-[11px] font-semibold ${on ? "text-emerald-700" : "text-gray-400"}`}>
                                {on ? "Active" : "Inactive"}
                              </span>
                              <Switch
                                size="sm"
                                checked={on}
                                label={`Offer on ${p.name}`}
                                onChange={(v) => setProductActive(id, v)}
                              />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-6 text-center">
                    {catProducts.length ? "No products match your search" : "This category has no products yet"}
                  </p>
                )}
              </>
            )}
            {errText("selected")}
          </div>
        )}
      </Step>

      {/* 4. Discount */}
      <Step n={4} title="Set the discount" hint="Taken off each product's selling price">
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <div className="inline-flex p-1 rounded-xl bg-gray-100">
              {[
                { key: "percentage", label: "Percentage", icon: <MdPercent /> },
                { key: "flat", label: "Flat amount", icon: <MdCurrencyRupee /> },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => set({ type: t.key })}
                  aria-pressed={form.type === t.key}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    form.type === t.key ? "bg-white text-[#1d2532] shadow" : "text-gray-500 hover:text-[#1d2532]"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <div className="relative mt-3 w-56">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                {form.type === "percentage" ? "%" : "₹"}
              </span>
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.value}
                onChange={(e) => set({ value: e.target.value })}
                placeholder={form.type === "percentage" ? "e.g. 15" : "e.g. 500"}
                className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-lg font-semibold ${
                  errors.value ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
            {errText("value")}
          </div>

          {/* Live preview */}
          <div className="flex-1 min-w-[16rem] rounded-2xl p-4 bg-gradient-to-br from-[#fbf6e9] to-white border border-[#efe2bd]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#7a5c14]">Price preview</p>
              {valueNum > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#b32126] text-white">
                  {offerLabel(form)}
                </span>
              )}
            </div>
            {previewItems.length && valueNum > 0 ? (
              <ul className="space-y-2">
                {previewItems.map((p) => (
                  <li key={idOf(p)} className="flex items-center gap-3 text-sm">
                    <span className="flex-1 truncate text-[#1d2532]">{p.name}</span>
                    <s className="text-gray-400">{rupees(p.sellingPrice)}</s>
                    <MdArrowForward className="text-gray-400" />
                    <span className="font-bold text-emerald-700 w-20 text-right">
                      {rupees(offerPrice(p.sellingPrice, form.type, form.value))}
                    </span>
                  </li>
                ))}
                {coveredProducts.length > previewItems.length && (
                  <li className="text-xs text-gray-500">
                    + {coveredProducts.length - previewItems.length} more product
                    {coveredProducts.length - previewItems.length === 1 ? "" : "s"}
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                {coveredProducts.length
                  ? "Enter a discount to see the new prices."
                  : "Choose a category and products to see the new prices."}
              </p>
            )}
          </div>
        </div>
      </Step>

      {/* 5. Dates */}
      <Step n={5} title="Offer period" hint="Runs from the start of the start date to the end of the end date">
        <div className="flex flex-wrap items-start gap-4">
          {[
            { key: "startDate", label: "Start date" },
            { key: "endDate", label: "End date" },
          ].map((f) => (
            <label key={f.key} className="block">
              <span className="flex items-center gap-1.5 text-sm font-medium text-[#1d2532] mb-1">
                <MdEvent className="text-[#c8a24a]" /> {f.label}
              </span>
              <input
                type="date"
                value={form[f.key]}
                min={f.key === "endDate" ? form.startDate || undefined : undefined}
                onChange={(e) => set({ [f.key]: e.target.value })}
                className={`border rounded-xl px-4 py-2.5 w-52 ${errors[f.key] ? "border-red-500" : "border-gray-300"}`}
              />
              {errText(f.key)}
            </label>
          ))}
        </div>
      </Step>

      {/* 6. Status */}
      <Step n={6} title="Status" hint="Switch the whole offer off any time without deleting it">
        <div
          className={`inline-flex items-center gap-4 rounded-2xl border px-5 py-3 ${
            form.isActive ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"
          }`}
        >
          <Switch checked={form.isActive} label="Offer active" onChange={(v) => set({ isActive: v })} />
          <div>
            <p className={`font-semibold ${form.isActive ? "text-emerald-700" : "text-gray-600"}`}>
              {form.isActive ? "Active" : "Inactive"}
            </p>
            <p className="text-xs text-gray-500">
              {form.isActive ? "Customers get this offer during its dates" : "Customers will not see this offer"}
            </p>
          </div>
        </div>
      </Step>

      <div className="flex flex-wrap justify-end gap-3 pt-5 border-t border-gray-100 pb-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <MdArrowBack /> Back
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold shadow-sm disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #1d2532, #34425a)" }}
        >
          <MdSave /> {saving ? "Saving..." : isEdit ? "Update offer" : "Save offer"}
        </button>
      </div>
    </form>
  );
};

export default DiscountForm;
