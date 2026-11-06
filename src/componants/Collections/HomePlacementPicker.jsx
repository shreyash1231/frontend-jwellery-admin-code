import React from "react";
import { MdCheckCircle, MdAddCircleOutline, MdCollectionsBookmark, MdVisibility, MdVisibilityOff } from "react-icons/md";

// Homepage sections, top to bottom, as customers see them. Must match the backend PLACEMENTS
// and the slots rendered by the storefront homepage.
const SECTIONS = [
  { key: "banner", label: "Banner slider", height: "h-16", tone: "bg-gradient-to-r from-[#d6c3a1] to-[#b9a07a]" },
  { key: "signature", label: "Our Signature Collection", height: "h-12", tone: "bg-[#efe6d6]" },
  { key: "categories", label: "Categories", height: "h-10", tone: "bg-[#efe6d6]" },
  { key: "best_sellers", label: "Best Sellers", height: "h-12", tone: "bg-[#efe6d6]" },
  { key: "shop_the_look", label: "Shop the Look", height: "h-10", tone: "bg-[#efe6d6]" },
  { key: "dulhan", label: "Dulhan banner", height: "h-10", tone: "bg-[#efe6d6]" },
];

export const PLACEMENTS = [
  { value: "after_banner", label: "Below the banner", hint: "First thing customers see after the slider" },
  { value: "after_signature", label: "Below Signature Collection", hint: "Right after the signature image grid" },
  { value: "after_categories", label: "Below Categories", hint: "Between Categories and Best Sellers" },
  { value: "after_best_sellers", label: "Below Best Sellers", hint: "After the Best Sellers products" },
  { value: "after_shop_the_look", label: "Below Shop the Look", hint: "Between Shop the Look and Dulhan" },
  { value: "after_dulhan", label: "At the bottom", hint: "Last section, just above the footer" },
];

export const DEFAULT_PLACEMENT = "after_categories";

export const placementLabel = (value) =>
  (PLACEMENTS.find((p) => p.value === value) || PLACEMENTS.find((p) => p.value === DEFAULT_PLACEMENT)).label;

// A miniature homepage: click any gap between sections to put the collection there
const HomePlacementPicker = ({ value, onChange, isActive, onActiveChange, title, others = [] }) => {
  const current = value || DEFAULT_PLACEMENT;
  // Other live collections already in each slot, shown so the admin knows what will sit next to theirs
  const othersIn = (slot) => others.filter((c) => (c.placement || DEFAULT_PLACEMENT) === slot && c.isActive !== false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
      {/* Mini homepage */}
      <div className="rounded-2xl border border-gray-200 bg-[#faf7f2] p-4">
        <div className="mx-auto max-w-md rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
            <span className="w-2 h-2 rounded-full bg-red-300" />
            <span className="w-2 h-2 rounded-full bg-amber-300" />
            <span className="w-2 h-2 rounded-full bg-green-300" />
            <span className="ml-2 text-[10px] text-gray-400">Homepage</span>
          </div>
          <div className="p-3 flex flex-col">
            <div className="h-5 rounded bg-gray-100 mb-1 flex items-center px-2 text-[9px] text-gray-400">Header</div>
            {SECTIONS.map((s) => {
              const slot = `after_${s.key}`;
              const active = current === slot;
              const placed = othersIn(slot);
              return (
                <React.Fragment key={s.key}>
                  <div
                    className={`${s.height} ${s.tone} rounded-md flex items-center justify-center text-[11px] font-medium text-[#6b5a3c] mt-1`}
                  >
                    {s.label}
                  </div>
                  {placed.map((c) => (
                    <div
                      key={c._id}
                      className="mt-1 h-7 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center gap-1 px-2 text-[10px] text-gray-500 truncate"
                      title={`"${c.title}" is already shown here`}
                    >
                      <MdCollectionsBookmark className="shrink-0" /> {c.title}
                    </div>
                  ))}
                  {active ? (
                    <div className="mt-1 rounded-md border-2 border-[#b32126] bg-[#fff4f4] p-2 shadow-sm">
                      <p className="text-[11px] font-semibold text-[#b32126] truncate text-center">
                        {title?.trim() || "Your collection"}
                      </p>
                      <div className="grid grid-cols-4 gap-1 mt-1.5">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="h-6 rounded bg-[#f3d6d6]" />
                        ))}
                      </div>
                      <div className="mx-auto mt-1.5 h-2.5 w-14 rounded-full bg-[#b32126]/70" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onChange(slot)}
                      className="group mt-1 h-5 rounded-md border border-dashed border-transparent hover:border-[#b32126] hover:bg-[#fff4f4] flex items-center justify-center text-[10px] text-transparent hover:text-[#b32126] transition-colors"
                      title={`Place here: ${placementLabel(slot)}`}
                    >
                      <MdAddCircleOutline className="mr-1" /> Place here
                    </button>
                  )}
                </React.Fragment>
              );
            })}
            <div className="h-6 rounded bg-gray-800 mt-1 flex items-center px-2 text-[9px] text-gray-300">Footer</div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">
          Click a gap between sections to move the collection there
        </p>
      </div>

      {/* Slot list + visibility */}
      <div className="flex flex-col gap-2">
        {PLACEMENTS.map((p) => {
          const active = current === p.value;
          const count = othersIn(p.value).length;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              className={`text-left rounded-xl border px-3 py-2.5 transition-colors flex items-start gap-2 ${
                active ? "border-[#b32126] bg-[#fff4f4]" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <MdCheckCircle className={`mt-0.5 text-lg shrink-0 ${active ? "text-[#b32126]" : "text-gray-200"}`} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#1d2532]">{p.label}</span>
                <span className="block text-xs text-gray-500">{p.hint}</span>
                {count > 0 && (
                  <span className="block text-[11px] text-[#7a5c14] mt-0.5">
                    {count} other collection{count === 1 ? "" : "s"} here, shown oldest first
                  </span>
                )}
              </span>
            </button>
          );
        })}

        <label className="mt-2 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => onActiveChange(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="flex-1">
            <span className="flex items-center gap-1 text-sm font-semibold text-[#1d2532]">
              {isActive ? <MdVisibility className="text-green-600" /> : <MdVisibilityOff className="text-gray-400" />}
              Show on website
            </span>
            <span className="block text-xs text-gray-500">
              {isActive ? "Customers can see this collection" : "Hidden from customers until you turn it on"}
            </span>
          </span>
        </label>
      </div>
    </div>
  );
};

export default HomePlacementPicker;
