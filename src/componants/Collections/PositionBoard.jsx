import React, { useMemo, useState } from "react";
import {
  MdClose,
  MdSave,
  MdRestartAlt,
  MdWarningAmber,
  MdCheckCircle,
  MdArrowBack,
  MdArrowForward,
  MdArrowUpward,
  MdArrowDownward,
  MdDragIndicator,
} from "react-icons/md";
import { updateCollectionApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";
import { ConfirmModal, imgSrc } from "./CollectionForm";

const idOf = (x) => x?._id || x?.id || x;
const firstImage = (p) => (Array.isArray(p?.imageUrl) ? p.imageUrl[0] : p?.imageUrl);

// Collection items as saved: categories in order, each with its products in order
const toBoard = (collection) =>
  (collection?.items || [])
    .filter((i) => i.category)
    .map((i) => ({
      category: i.category,
      products: (i.products || []).filter((p) => p && typeof p === "object"),
    }));

const signature = (board) =>
  JSON.stringify(board.map((i) => [idOf(i.category), i.products.map(idOf)]));

const move = (list, from, to) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

// Arrange the order customers see: category labels, product cards numbered across the whole collection
const PositionBoard = ({ collection, onClose, onSaved }) => {
  const message = useToast();
  const initial = useMemo(() => toBoard(collection), [collection]);
  const [board, setBoard] = useState(initial);
  const [drag, setDrag] = useState(null); // { cat, index }
  const [over, setOver] = useState(null); // { cat, index }
  const [confirm, setConfirm] = useState(null); // "save" | "close"
  const [saving, setSaving] = useState(false);

  const dirty = signature(board) !== signature(initial);

  const moveProduct = (cat, from, to) => {
    if (to < 0 || to >= board[cat].products.length || from === to) return;
    setBoard((prev) => prev.map((g, i) => (i === cat ? { ...g, products: move(g.products, from, to) } : g)));
  };

  const moveCategory = (from, to) => {
    if (to < 0 || to >= board.length) return;
    setBoard((prev) => move(prev, from, to));
  };

  const handleReset = () => {
    setBoard(initial);
    message.info("Order reset to the last saved positions");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateCollectionApi(idOf(collection), {
        items: board.map((g) => ({ category: idOf(g.category), products: g.products.map(idOf) })),
      });
      if (res?.success) {
        message.success("Positions saved successfully");
        onSaved?.(res.data);
        onClose();
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSaving(false);
      setConfirm(null);
    }
  };

  const requestClose = () => (dirty ? setConfirm("close") : onClose());

  let serial = 0;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 backdrop-blur-sm"
      style={{ zIndex: 9999999 }}
    >
      <div className="bg-[#f5f6f8] rounded-2xl shadow-2xl w-full max-w-[1200px] h-full max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-4 text-white bg-gradient-to-br from-[#1d2532] to-[#2f3b4f] shrink-0">
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#93b4ff]">Arrange positions</p>
          <h3 className="text-xl font-bold truncate pr-12">{collection?.title}</h3>
          <p className="text-xs text-gray-300 mt-1">
            Drag a card onto another (or use the arrows) to reorder. Numbers show the order customers see.
          </p>
          <button
            type="button"
            onClick={requestClose}
            title="Close"
            className="absolute right-4 top-4 w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-2xl"
          >
            <MdClose />
          </button>
        </div>

        {/* Board */}
        <div className="flex-1 overflow-y-auto px-6 pt-6">
          {board.length ? (
            board.map((group, cat) => (
              <section key={idOf(group.category)} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-2 pl-1 pr-4 py-1 rounded-full bg-[#fbf6e9] border border-[#ecd9a3] text-[#7a5c14] font-semibold text-sm">
                    {group.category.imageUrl ? (
                      <img
                        src={imgSrc(group.category.imageUrl, 80)}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-[#ecd9a3]" />
                    )}
                    {group.category.name}
                    <span className="text-xs font-medium text-[#a07c2c]">· {group.products.length}</span>
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                  <button
                    type="button"
                    onClick={() => moveCategory(cat, cat - 1)}
                    disabled={cat === 0}
                    title="Move category up"
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:text-[#1d2532] disabled:opacity-30"
                  >
                    <MdArrowUpward />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCategory(cat, cat + 1)}
                    disabled={cat === board.length - 1}
                    title="Move category down"
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:text-[#1d2532] disabled:opacity-30"
                  >
                    <MdArrowDownward />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {group.products.map((p, index) => {
                    serial += 1;
                    const isDragging = drag?.cat === cat && drag.index === index;
                    const isOver = over?.cat === cat && over.index === index && drag && !isDragging;
                    return (
                      <div
                        key={idOf(p)}
                        draggable
                        onDragStart={() => setDrag({ cat, index })}
                        onDragOver={(e) => {
                          if (drag?.cat !== cat) return;
                          e.preventDefault();
                          if (over?.index !== index || over?.cat !== cat) setOver({ cat, index });
                        }}
                        onDrop={() => {
                          if (drag?.cat === cat) moveProduct(cat, drag.index, index);
                          setDrag(null);
                          setOver(null);
                        }}
                        onDragEnd={() => {
                          setDrag(null);
                          setOver(null);
                        }}
                        className={`group relative bg-white rounded-2xl overflow-hidden border cursor-grab active:cursor-grabbing transition-all ${
                          isOver ? "border-[#2563eb] ring-2 ring-[#2563eb]/40 scale-[1.02]" : "border-gray-200 hover:shadow-md"
                        } ${isDragging ? "opacity-40" : ""}`}
                      >
                        <span className="absolute top-2 left-2 z-10 min-w-[28px] h-7 px-2 rounded-full bg-[#1d2532] text-white text-xs font-bold flex items-center justify-center shadow">
                          {serial}
                        </span>
                        <MdDragIndicator className="absolute top-2.5 right-2 z-10 text-xl text-white drop-shadow" />
                        <div className="aspect-square bg-gray-100">
                          {firstImage(p) && (
                            <img
                              src={imgSrc(firstImage(p), 320)}
                              alt=""
                              draggable={false}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-[#1d2532] truncate" title={p.name}>
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ₹{Number(p.sellingPrice || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="absolute inset-x-0 top-[calc(50%-1.5rem)] flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => moveProduct(cat, index, index - 1)}
                            disabled={index === 0}
                            title="Move earlier"
                            className="w-8 h-8 rounded-full bg-white/95 shadow flex items-center justify-center text-[#1d2532] disabled:opacity-0"
                          >
                            <MdArrowBack />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveProduct(cat, index, index + 1)}
                            disabled={index === group.products.length - 1}
                            title="Move later"
                            className="w-8 h-8 rounded-full bg-white/95 shadow flex items-center justify-center text-[#1d2532] disabled:opacity-0"
                          >
                            <MdArrowForward />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <p className="text-center text-gray-500 py-16">This collection has no products to arrange.</p>
          )}

          {/* Floating actions */}
          <div className="sticky bottom-0 py-4 flex justify-end pointer-events-none">
            <div
              className={`pointer-events-auto flex items-center gap-3 pl-5 pr-2 py-2 rounded-[2rem] backdrop-blur border shadow-xl ${
                dirty ? "bg-[#fffaeb]/95 border-[#fec84b]" : "bg-white/95 border-gray-200"
              }`}
            >
              {dirty ? (
                <p className="flex items-center gap-1 text-xs font-semibold text-[#b54708]" role="status">
                  <MdWarningAmber className="text-base" /> Positions changed. Click Save to keep the new order.
                </p>
              ) : (
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <MdCheckCircle className="text-base text-green-600" /> All positions saved
                </p>
              )}
              <button
                type="button"
                onClick={handleReset}
                disabled={!dirty}
                title="Reset"
                style={{ background: "#dc2626", color: "#fff" }}
                className="w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <MdRestartAlt className="text-xl" />
                <span className="text-[10px] leading-none mt-1 font-medium">Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirm("save")}
                disabled={!dirty}
                title="Save"
                style={{ background: "#16a34a", color: "#fff" }}
                className="w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <MdSave className="text-xl" />
                <span className="text-[10px] leading-none mt-1 font-medium">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirm === "save" && (
        <ConfirmModal
          title="Save positions?"
          text={`Save the new order for "${collection?.title}"?`}
          confirmColor="#16a34a"
          busy={saving}
          onCancel={() => setConfirm(null)}
          onConfirm={handleSave}
        />
      )}
      {confirm === "close" && (
        <ConfirmModal
          title="Discard position changes?"
          text="You have changed the order but not saved it. Close without saving?"
          confirmLabel="Discard & close"
          cancelLabel="Keep arranging"
          confirmColor="#dc2626"
          onCancel={() => setConfirm(null)}
          onConfirm={onClose}
        />
      )}
    </div>
  );
};

export default PositionBoard;
