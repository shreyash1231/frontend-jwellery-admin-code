import React, { useState } from "react";
import { MdClose, MdDelete, MdDiamond, MdStar, MdEdit } from "react-icons/md";
import { imgSrc, ConfirmModal } from "../Collections/CollectionForm";
import { Switch, firstImage } from "../Discounts/DiscountForm";

// "Gift Item › Birthday" for sub-categories, just the name otherwise
export const categoryPath = (c) => {
  const parent = typeof c?.parentCategory === "object" ? c.parentCategory?.name : "";
  return parent ? `${parent} › ${c?.name}` : c?.name || "";
};

// Every category of one product: the main one (read-only here) and the extra ones,
// each with a status switch and delete.
const CategoriesModal = ({ row, onClose, onToggle, onDelete, onEdit, busyId }) => {
  const [confirm, setConfirm] = useState(null); // extra link waiting for delete confirmation
  const p = row.product;
  const main = typeof p?.categoryId === "object" ? p.categoryId : null;
  const active = row.categories.filter((c) => c.isActive).length;

  return (
    <>
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2"
      style={{ zIndex: 9999999 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-[560px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Categories of ${p?.name}`}
      >
        <div className="relative px-6 py-4 rounded-t-2xl text-white bg-gradient-to-br from-[#1d2532] to-[#2f3b4f] flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden flex items-center justify-center text-[#e3c77a] text-xl shrink-0">
            {firstImage(p) ? <img src={imgSrc(firstImage(p), 160)} alt="" className="w-full h-full object-cover" /> : <MdDiamond />}
          </span>
          <div className="min-w-0 pr-10">
            <p className="text-[11px] tracking-[0.25em] uppercase text-[#e3c77a]">All categories</p>
            <h3 className="text-lg font-bold truncate">{p?.name}</h3>
            <p className="text-xs text-gray-300">
              1 main + {row.categories.length} extra · {active} active
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-2xl"
          >
            <MdClose />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto p-4 space-y-2">
          {main && (
            <li className="flex items-center gap-3 rounded-xl border border-[#ecd9a6] bg-[#fbf6e9] px-4 py-3">
              <MdStar className="text-[#c8a24a] text-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1d2532] truncate">{main.name}</p>
                <p className="text-[11px] text-[#7a5c14]">Main category · change it on the Products page</p>
              </div>
            </li>
          )}

          {row.categories.map((link) => {
            const busy = busyId === link._id;
            return (
              <li
                key={link._id}
                className={`flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 ${
                  link.isActive ? "bg-white" : "bg-gray-50"
                } ${busy ? "opacity-60" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${link.isActive ? "text-[#1d2532]" : "text-gray-500"}`}>
                    {categoryPath(link.category)}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {link.isActive ? "Product shows in this category" : "Inactive · hidden from this category"}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <Switch
                    checked={link.isActive}
                    size="sm"
                    label={`${link.isActive ? "Deactivate" : "Activate"} ${link.category?.name}`}
                    onChange={(v) => !busy && onToggle(link, v)}
                  />
                  <span className="w-12">{link.isActive ? "Active" : "Inactive"}</span>
                </label>
                <button
                  type="button"
                  title="Remove this category"
                  disabled={busy}
                  onClick={() => setConfirm(link)}
                  className="w-9 h-9 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 flex items-center justify-center shrink-0"
                >
                  <MdDelete />
                </button>
              </li>
            );
          })}

          {!row.categories.length && (
            <li className="text-center text-sm text-gray-500 py-6">No extra categories left for this product.</li>
          )}
        </ul>

        <div className="px-4 py-3 border-t border-gray-100 flex justify-between gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#1d2532] bg-gray-100 hover:bg-gray-200"
          >
            <MdEdit /> Add / change categories
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#1d2532] hover:bg-[#2f3b4f]"
          >
            Done
          </button>
        </div>
      </div>
    </div>

      {/* Outside the overlay so its clicks don't bubble up and close the popup */}
      {confirm && (
        <ConfirmModal
          title="Remove category?"
          text={`"${p?.name}" will no longer be listed in "${categoryPath(confirm.category)}".`}
          confirmLabel="Remove"
          cancelLabel="Cancel"
          confirmColor="#dc2626"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            onDelete(confirm);
            setConfirm(null);
          }}
        />
      )}
    </>
  );
};

export default CategoriesModal;
