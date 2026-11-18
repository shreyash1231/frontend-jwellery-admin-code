import React, { useEffect, useMemo, useRef, useState } from "react";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import {
  MdSave,
  MdStar,
  MdStarBorder,
  MdVerified,
  MdCloudUpload,
  MdClose,
  MdPlayCircle,
  MdDiamond,
  MdPerson,
  MdEdit,
  MdEvent,
  MdVisibility,
} from "react-icons/md";
import { useToast } from "../toast/Toast";
import { imgSrc } from "../Collections/CollectionForm";
import { Switch, idOf, firstImage } from "../Discounts/DiscountForm";
import { image_url } from "../../common/env";

export const MAX_MEDIA = 10;
const MAX_TEXT = 3000;
const MAX_FILE_MB = 100;
// Picked in the reviewer list to type a name that isn't a customer account
export const CUSTOM_REVIEWER = "__custom__";
export const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

// "Potli Bag (Bridal)" so products with the same name can be told apart
export const categoryName = (p) => (typeof p?.categoryId === "object" ? p.categoryId?.name : "") || "";
export const productLabel = (p) => {
  const c = categoryName(p);
  return c ? `${p?.name} (${c})` : p?.name || "";
};

export const userName = (u) => [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() || u?.email || "Customer";
export const mediaSrc = (m, width) => (m.type === "video" ? `${image_url}/${m.url}` : imgSrc(m.url, width));

const DISPLAY_FORMAT = "DD MMM YYYY, hh:mm A";

export const Stars = ({ value, size = "text-base" }) => (
  <span className={`inline-flex text-[#e0a526] ${size}`} aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (n <= value ? <MdStar key={n} /> : <MdStarBorder key={n} className="text-gray-300" />))}
  </span>
);

const Field = ({ label, hint, error, children, required }) => (
  <div>
    <label className="block text-sm font-semibold text-[#1d2532] mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

const buildState = (initial) => ({
  product: idOf(initial?.product) || undefined,
  rating: initial?.rating || 0,
  reviewer: initial ? (initial.user ? idOf(initial.user) : CUSTOM_REVIEWER) : undefined,
  reviewerName: initial && !initial.user ? initial.reviewerName || "" : "",
  isVerifiedPurchase: !!initial?.isVerifiedPurchase,
  reviewedAt: initial?.reviewedAt ? dayjs(initial.reviewedAt) : dayjs().second(0),
  comment: initial?.comment || "",
  isActive: initial?.isActive !== false,
  keepMedia: (initial?.media || []).map((m) => ({ type: m.type, url: m.url })),
});

const ReviewForm = ({ products, users, initial, isEdit, onSubmit, onDirtyChange }) => {
  const message = useToast();
  const [form, setForm] = useState(() => buildState(initial));
  const [files, setFiles] = useState([]); // { file, url, type }
  const [hoverStar, setHoverStar] = useState(0);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef(null);
  const initialSnapshot = useRef(JSON.stringify(buildState(initial)));

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  useEffect(() => {
    onDirtyChange?.(JSON.stringify(form) !== initialSnapshot.current || files.length > 0);
  }, [form, files, onDirtyChange]);

  // Free the preview URLs of picked files when the form closes
  const filesRef = useRef(files);
  filesRef.current = files;
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.url)), []);

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: p._id,
        search: productLabel(p).toLowerCase(),
        label: (
          <span className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-md bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-gray-300">
              {firstImage(p) ? <img src={imgSrc(firstImage(p), 80)} alt="" className="w-full h-full object-cover" /> : <MdDiamond />}
            </span>
            <span className="truncate">
              {p.name}
              {categoryName(p) && <span className="text-gray-500"> ({categoryName(p)})</span>}
            </span>
          </span>
        ),
      })),
    [products],
  );

  const reviewerOptions = useMemo(
    () => [
      {
        value: CUSTOM_REVIEWER,
        search: "custom name dummy",
        label: (
          <span className="flex items-center gap-2 font-semibold text-[#7a5c14]">
            <MdEdit /> Custom name (not saved as a customer)
          </span>
        ),
      },
      ...users.map((u) => ({
        value: u._id,
        search: `${userName(u)} ${u.email || ""}`.toLowerCase(),
        label: (
          <span className="flex items-center gap-2">
            <MdPerson className="text-gray-400 shrink-0" />
            <span className="truncate">{userName(u)}</span>
            {u.email && <span className="text-xs text-gray-400 truncate">{u.email}</span>}
          </span>
        ),
      })),
    ],
    [users],
  );

  const selectedProduct = products.find((p) => p._id === form.product);
  const mediaCount = form.keepMedia.length + files.length;

  const addFiles = (list) => {
    const picked = Array.from(list || []);
    const room = MAX_MEDIA - mediaCount;
    if (!picked.length) return;
    const ok = [];
    picked.forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) return message.error(`${file.name} is not a photo or video`);
      if (file.size > MAX_FILE_MB * 1024 * 1024) return message.error(`${file.name} is larger than ${MAX_FILE_MB} MB`);
      ok.push({ file, url: URL.createObjectURL(file), type: isVideo ? "video" : "image" });
    });
    if (ok.length > room) {
      message.error(`Up to ${MAX_MEDIA} photos or videos per review`);
      ok.slice(room).forEach((f) => URL.revokeObjectURL(f.url));
    }
    setFiles((f) => [...f, ...ok.slice(0, Math.max(0, room))]);
  };

  const validate = () => {
    const e = {};
    if (!form.product) e.product = "Choose a product";
    if (!form.rating) e.rating = "Choose a star rating";
    if (!form.reviewer) e.reviewer = "Choose a customer or a custom name";
    if (form.reviewer === CUSTOM_REVIEWER && !form.reviewerName.trim()) e.reviewerName = "Enter the reviewer's name";
    if (!form.reviewedAt) e.reviewedAt = "Choose the date and time";
    else if (form.reviewedAt.isAfter(dayjs().add(1, "minute"))) e.reviewedAt = "Date and time can't be in the future";
    if (!form.comment.trim() && mediaCount === 0) e.comment = "Write the review or add a photo/video";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const reset = () => {
    files.forEach((f) => URL.revokeObjectURL(f.url));
    setFiles([]);
    const fresh = buildState(null);
    initialSnapshot.current = JSON.stringify(fresh);
    setForm(fresh);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const fd = new FormData();
    fd.append("product", form.product);
    fd.append("rating", String(form.rating));
    const custom = form.reviewer === CUSTOM_REVIEWER;
    fd.append("user", custom ? "" : form.reviewer);
    fd.append("reviewerName", custom ? form.reviewerName.trim() : "");
    fd.append("isVerifiedPurchase", String(form.isVerifiedPurchase));
    fd.append("reviewedAt", form.reviewedAt.toISOString());
    fd.append("comment", form.comment.trim());
    fd.append("isActive", String(form.isActive));
    if (isEdit) fd.append("keepMedia", JSON.stringify(form.keepMedia));
    files.forEach((f) => fd.append("media", f.file));

    setSaving(true);
    const ok = await onSubmit(fd);
    setSaving(false);
    if (ok && !isEdit) reset();
  };

  const shownStar = hoverStar || form.rating;

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 pb-6">
      {/* Left: what and who */}
      <div className="space-y-6">
        <Field label="Product" required error={errors.product} hint="Category is shown in brackets">
          <Select
            showSearch
            size="large"
            className="w-full"
            placeholder="Search by product or category name"
            value={form.product}
            options={productOptions}
            filterOption={(input, opt) => opt.search.includes(input.toLowerCase())}
            onChange={(v) => set("product", v)}
            status={errors.product ? "error" : undefined}
            notFoundContent="No product found"
          />
        </Field>

        {selectedProduct && (
          <div className="flex items-center gap-3 rounded-xl bg-[#fbf6e9] border border-[#efe2bf] p-3 -mt-3">
            <span className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 flex items-center justify-center text-gray-300">
              {firstImage(selectedProduct) ? (
                <img src={imgSrc(firstImage(selectedProduct), 160)} alt="" className="w-full h-full object-cover" />
              ) : (
                <MdDiamond />
              )}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-[#1d2532] truncate">{productLabel(selectedProduct)}</p>
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                {selectedProduct.ratingCount ? (
                  <>
                    <Stars value={Math.round(selectedProduct.ratingAverage || 0)} size="text-sm" />
                    {Number(selectedProduct.ratingAverage || 0).toFixed(1)} · {selectedProduct.ratingCount} review
                    {selectedProduct.ratingCount === 1 ? "" : "s"} now
                  </>
                ) : (
                  "No reviews yet"
                )}
              </p>
            </div>
          </div>
        )}

        <Field label="Star rating" required error={errors.rating}>
          <div className="flex items-center gap-3">
            <div className="flex" onMouseLeave={() => setHoverStar(0)} role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={form.rating === n}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  onMouseEnter={() => setHoverStar(n)}
                  onClick={() => set("rating", n)}
                  className="text-4xl p-0.5 transition-transform hover:scale-110"
                >
                  {n <= shownStar ? <MdStar className="text-[#e0a526]" /> : <MdStarBorder className="text-gray-300" />}
                </button>
              ))}
            </div>
            <span className={`text-sm font-semibold ${shownStar ? "text-[#7a5c14]" : "text-gray-400"}`}>
              {shownStar ? `${shownStar}/5 · ${RATING_WORDS[shownStar]}` : "Tap a star"}
            </span>
          </div>
        </Field>

        <Field
          label="Reviewer"
          required
          error={errors.reviewer}
          hint="Pick a customer, or a custom name that is shown only on this review"
        >
          <Select
            showSearch
            size="large"
            className="w-full"
            placeholder="Search a customer or pick custom name"
            value={form.reviewer}
            options={reviewerOptions}
            filterOption={(input, opt) => opt.search.includes(input.toLowerCase())}
            onChange={(v) => set("reviewer", v)}
            status={errors.reviewer ? "error" : undefined}
            notFoundContent="No customer found"
          />
        </Field>

        {form.reviewer === CUSTOM_REVIEWER && (
          <Field label="Name shown on the review" required error={errors.reviewerName}>
            <input
              type="text"
              value={form.reviewerName}
              maxLength={60}
              onChange={(e) => set("reviewerName", e.target.value)}
              placeholder="e.g. Priya S."
              className="w-full border rounded-lg px-3 py-2.5"
            />
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date & time" required error={errors.reviewedAt}>
            <DatePicker
              showTime={{ use12Hours: true, format: "hh:mm A" }}
              format={DISPLAY_FORMAT}
              value={form.reviewedAt}
              onChange={(v) => set("reviewedAt", v)}
              disabledDate={(d) => d && d.isAfter(dayjs().endOf("day"))}
              className="offer-range w-full"
              classNames={{ popup: { root: "offer-picker" } }}
              suffixIcon={<MdEvent className="text-[#c8a24a]" />}
              allowClear={false}
              status={errors.reviewedAt ? "error" : undefined}
            />
          </Field>
          <div className="space-y-3 sm:pt-7">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-[#1d2532] cursor-pointer">
              <Switch
                checked={form.isVerifiedPurchase}
                onChange={(v) => set("isVerifiedPurchase", v)}
                label="Verified purchase"
              />
              <MdVerified className={form.isVerifiedPurchase ? "text-emerald-600" : "text-gray-300"} />
              Verified purchase
            </label>
            <label className="flex items-center gap-2.5 text-sm font-semibold text-[#1d2532] cursor-pointer">
              <Switch checked={form.isActive} onChange={(v) => set("isActive", v)} label="Show on website" />
              <MdVisibility className={form.isActive ? "text-[#c8a24a]" : "text-gray-300"} />
              Show on website
            </label>
          </div>
        </div>
      </div>

      {/* Right: what they said and showed */}
      <div className="space-y-6">
        <Field label="Review" error={errors.comment}>
          <textarea
            value={form.comment}
            maxLength={MAX_TEXT}
            rows={7}
            onChange={(e) => set("comment", e.target.value)}
            placeholder="What did the customer say about this piece?"
            className="w-full border rounded-lg px-3 py-2.5 resize-y"
          />
          <p className="text-[11px] text-gray-400 text-right -mt-0.5">
            {form.comment.length}/{MAX_TEXT}
          </p>
        </Field>

        <Field label="Photos & videos" hint={`Up to ${MAX_MEDIA} files, ${MAX_FILE_MB} MB each`}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => mediaCount < MAX_MEDIA && fileInput.current?.click()}
            className={`rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
              mediaCount >= MAX_MEDIA
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : dragOver
                  ? "border-[#c8a24a] bg-[#fbf6e9] cursor-pointer"
                  : "border-gray-300 hover:border-[#c8a24a] hover:bg-[#fffdf7] cursor-pointer"
            }`}
          >
            <MdCloudUpload className="text-3xl text-[#c8a24a] mx-auto" />
            <p className="text-sm font-semibold text-[#1d2532] mt-1">
              {mediaCount >= MAX_MEDIA ? "Limit reached" : "Drop photos or videos here, or click to choose"}
            </p>
            <p className="text-xs text-gray-500">
              {mediaCount}/{MAX_MEDIA} added
            </p>
            <input
              ref={fileInput}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {mediaCount > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-3">
              {form.keepMedia.map((m) => (
                <MediaThumb
                  key={m.url}
                  type={m.type}
                  src={mediaSrc(m, 160)}
                  onRemove={() => set("keepMedia", form.keepMedia.filter((x) => x.url !== m.url))}
                />
              ))}
              {files.map((f) => (
                <MediaThumb
                  key={f.url}
                  type={f.type}
                  src={f.url}
                  isNew
                  onRemove={() => {
                    URL.revokeObjectURL(f.url);
                    setFiles((list) => list.filter((x) => x.url !== f.url));
                  }}
                />
              ))}
            </div>
          )}
        </Field>
      </div>

      <div className="lg:col-span-2 flex justify-end pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-[#1d2532] text-white rounded-xl font-semibold disabled:opacity-60"
        >
          <MdSave className="text-lg" />
          {saving ? (files.length ? "Uploading..." : "Saving...") : isEdit ? "Save changes" : "Add review"}
        </button>
      </div>
    </form>
  );
};

const MediaThumb = ({ type, src, onRemove, isNew }) => (
  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
    {type === "video" ? (
      <>
        <video src={src} className="w-full h-full object-cover" muted preload="metadata" />
        <MdPlayCircle className="absolute inset-0 m-auto text-3xl text-white drop-shadow" />
      </>
    ) : (
      <img src={src} alt="" className="w-full h-full object-cover" />
    )}
    {isNew && (
      <span className="absolute bottom-1 left-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#c8a24a] text-white">
        New
      </span>
    )}
    <button
      type="button"
      title="Remove"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-600"
    >
      <MdClose className="text-sm" />
    </button>
  </div>
);

export default ReviewForm;
