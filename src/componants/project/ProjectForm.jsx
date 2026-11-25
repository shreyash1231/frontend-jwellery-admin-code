import React, { useEffect, useMemo, useState } from "react";
import {
  MdCheck,
  MdSearch,
  MdStar,
  MdClose,
  MdDiamond,
  MdWorkspacePremium,
  MdLocalShipping,
  MdBuild,
  MdCloudUpload,
  MdDelete,
  MdSave,
} from "react-icons/md";
import {
  addProjectApi,
  updateProjectApi,
  deleteProductImageApi,
  shopByProd,
  shopByFunc,
  getDomainsApi,
  getProductCategoriesApi,
  saveProductCategoriesApi,
} from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";
import { image_url } from "../../common/env";
import SeoFields, { validateSeo, slugify, LockButton, lockedCls } from "../Seo/SeoFields";

const EMPTY_SEO = { slug: "", metaTitle: "", metaDescription: "", metaKeywords: "" };

const INPUT_CLS =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-[#1d2532] placeholder-gray-400 focus:outline-none focus:border-[#c8a24a] focus:ring-2 focus:ring-[#c8a24a]/20 transition";

const Section = ({ n, title, hint, children, right }) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3">
        <span
          className="w-8 h-8 rounded-full text-white text-sm font-semibold flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #1d2532, #34425a)" }}
        >
          {n}
        </span>
        <div>
          <h4 className="font-semibold text-[#1d2532] leading-tight">{title}</h4>
          {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
        </div>
      </div>
      {right}
    </div>
    {children}
  </section>
);

const Label = ({ children, required, extra }) => (
  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
    <span>
      {children} {required && <span className="text-red-500">*</span>}
    </span>
    {extra}
  </div>
);

const Counter = ({ value, max = 500 }) => (
  <span className={`normal-case font-normal ${value.length > max ? "text-red-600" : "text-gray-400"}`}>
    {value.length}/{max}
  </span>
);

const ProductForm = ({ onClose, onSaved, mode = "add", initial = null }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    additionalInfo: "",
    benefits: "",
    use: "",
    features: "",
    mrp: "",
    sellingPrice: "",
    bestSeller: false,
    quantity: "",
    categoryId: "",
    selection: "shopByProd",
    shipmentType: "ship",
  });

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  // EXISTING images already saved in DB
  const [existingImages, setExistingImages] = useState([]);
  const [showFaq, setShowFaq] = useState(false);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [seo, setSeo] = useState(EMPTY_SEO);
  const [tags, setTags] = useState([]);
  // The slug follows the product name until the admin types their own slug
  const [slugLinked, setSlugLinked] = useState(true);
  // Edit mode: the name is read-only until its Edit button is clicked
  const [nameUnlocked, setNameUnlocked] = useState(false);
  const nameLocked = mode === "edit" && !nameUnlocked;

  // Optional (extra) categories: the product also shows in these, besides its main category.
  // Same data as the Multi Category page.
  const [allCategories, setAllCategories] = useState([]);
  const [extraIds, setExtraIds] = useState([]);
  const [savedExtras, setSavedExtras] = useState({}); // { categoryId: isActive } saved for this product
  const [extraSearch, setExtraSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const message = useToast();

  /* ================= LOAD OPTIONAL CATEGORIES ================= */
  useEffect(() => {
    getDomainsApi()
      .then((res) => setAllCategories(res?.data || []))
      .catch(errorResponseHandler);
  }, []);

  useEffect(() => {
    const id = initial?._id || initial?.id;
    if (mode !== "edit" || !id) return;
    getProductCategoriesApi(id)
      .then((res) => {
        const saved = {};
        (res?.data || []).forEach((l) => (saved[l.category?._id || l.category] = l.isActive !== false));
        setSavedExtras(saved);
        setExtraIds(Object.keys(saved));
      })
      .catch(errorResponseHandler);
  }, [mode, initial]);

  // A category picked as the main one can't also be optional
  useEffect(() => {
    if (form.categoryId) setExtraIds((ids) => ids.filter((id) => id !== form.categoryId));
  }, [form.categoryId]);

  const categoryLabel = (c) => (c.parentCategory?.name ? `${c.parentCategory.name} › ${c.name}` : c.name);

  const sortedAllCategories = useMemo(
    () => [...allCategories].sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b))),
    [allCategories],
  );

  const visibleExtras = useMemo(() => {
    const q = extraSearch.trim().toLowerCase();
    return sortedAllCategories.filter((c) => !q || categoryLabel(c).toLowerCase().includes(q));
  }, [sortedAllCategories, extraSearch]);

  const toggleExtra = (id) =>
    setExtraIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res =
          form.selection === "shopByProd" ? await shopByProd() : await shopByFunc();
        if (res?.success) {
          setCategories(res?.data || []);
        }
      } catch (err) {
        errorResponseHandler(err);
      }
    };

    loadCategories();
  }, [form.selection]);

  const addFaq = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  };

  const removeFaq = (index) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFaq = (index, field, value) => {
    setFaqs((prev) =>
      prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)),
    );
  };

  /* ================= EDIT MODE ================= */
  useEffect(() => {
    if (mode === "edit" && initial) {
      setForm({
        name: initial?.name || "",
        description: initial?.description || "",
        additionalInfo: initial?.additionalInfo || "",
        benefits: initial?.benefits || "",
        use: initial?.use || "",
        features: initial?.features || "",
        bestSeller: initial?.bestSeller || false,
        mrp: initial?.mrp || "",
        sellingPrice: initial?.sellingPrice || "",
        quantity: initial?.quantity || "",
        categoryId:
          initial?.categoryId?._id ||
          initial?.categoryId?.id ||
          initial?.categoryId ||
          "",
        selection: initial?.categoryId?.isShopByFunction ? "shopByFunc" : "shopByProd",
        shipmentType: initial?.shipmentType || "ship",
      });

      if (Array.isArray(initial?.imageUrl)) {
        setExistingImages(initial.imageUrl);
      }

      setSeo({
        slug: initial?.slug || "",
        metaTitle: initial?.metaTitle || "",
        metaDescription: initial?.metaDescription || "",
        metaKeywords: initial?.metaKeywords || "",
      });
      setTags(Array.isArray(initial?.tags) ? initial.tags : []);

      // ✅ LOAD FAQs
      if (Array.isArray(initial?.faqs) && initial.faqs.length > 0) {
        setFaqs(initial.faqs);
        setShowFaq(true);
      }
    }
  }, [mode, initial]);

  /* ================= HANDLERS ================= */
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  if (name === "name" && slugLinked) {
    setSeo((s) => ({ ...s, slug: slugify(value) }));
  }

  setForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};

  const onSelectImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };
  const removeExistingImage = async (imgUrl) => {
    try {
      const id = initial?._id || initial?.id;
      if (!id) return;

      await deleteProductImageApi(id, { imageUrl: imgUrl });
      message.success("Image deleted");

      setExistingImages((prev) => prev.filter((img) => img !== imgUrl));
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  const isValidObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ""));

  const validateOptionalText = (value, min, max, fieldLabel) => {
    if (!value?.trim()) return null;
    const len = value.trim().length;
    if (len < min || len > max) {
      return `${fieldLabel} must be between ${min} and ${max} characters`;
    }
    return null;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    const name = form.name?.trim() || "";
    const description = form.description?.trim() || "";
    const additionalInfo = form.additionalInfo?.trim() || "";
    const benefits = form.benefits?.trim() || "";
    const use = form.use?.trim() || "";
    const features = form.features?.trim() || "";
    const quantity = Number(form.quantity);
    const mrp = form.mrp === "" ? undefined : Number(form.mrp);
    const sellingPrice = Number(form.sellingPrice);
    const totalImages = images.length + existingImages.length;

    if (images.length > 10) {
      message.error("Only 10 images allowed");
      return;
    }

    if (!name || name.length < 2 || name.length > 100) {
      message.error("Name must be between 2 and 100 characters");
      return;
    }

    if (!description || description.length < 10 || description.length > 500) {
      message.error("Description must be between 10 and 500 characters");
      return;
    }

    const optionalTextError =
      validateOptionalText(benefits, 5, 500, "Benefits") ||
      validateOptionalText(features, 5, 500, "Features") ||
      validateOptionalText(use, 5, 500, "Use") ||
      validateOptionalText(additionalInfo, 5, 500, "Additional info");

    if (optionalTextError) {
      message.error(optionalTextError);
      return;
    }

    if (!Number.isFinite(sellingPrice) || sellingPrice < 1) {
      message.error("Selling price must be at least 1");
      return;
    }

    if (mrp !== undefined && (!Number.isFinite(mrp) || mrp < 0)) {
      message.error("MRP must be 0 or greater");
      return;
    }

    if (mrp !== undefined && sellingPrice > mrp) {
      message.error("Selling price cannot exceed MRP");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      message.error("Quantity must be an integer greater than or equal to 0");
      return;
    }

    if (!form.categoryId || !isValidObjectId(form.categoryId)) {
      message.error("Please select a valid category");
      return;
    }

    if (mode === "add" && totalImages < 1) {
      message.error("At least 1 product image is required");
      return;
    }

    const seoError = validateSeo(seo);
    if (seoError) {
      message.error(seoError);
      return;
    }

    if (showFaq) {
      if (faqs.length > 10) {
        message.error("Maximum 10 FAQs are allowed");
        return;
      }
      for (const faq of faqs) {
        if (!faq.question?.trim() || !faq.answer?.trim()) {
          message.error("FAQ question & answer are required");
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      const { selection, ...filteredForm } = form;
      const fd = new FormData();

      Object.entries(filteredForm).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          fd.append(key, typeof value === "string" ? value.trim() : value);
        }
      });

      // SEO: always sent, so clearing a field saves it as empty (= automatic)
      Object.entries(seo).forEach(([key, value]) => fd.append(key, value.trim()));
      fd.append("tags", JSON.stringify(tags));

      if (showFaq && faqs.length > 0) {
        const cleanedFaqs = faqs.map((faq) => ({
          question: faq.question?.trim(),
          answer: faq.answer?.trim(),
        }));
        fd.append("faqs", JSON.stringify(cleanedFaqs));
      }

      images.forEach((img) => {
        fd.append("images", img);
      });

      const res =
        mode === "edit"
          ? await updateProjectApi(initial?._id || initial?.id, fd)
          : await addProjectApi(fd);

      if (res?.success) {
        message.success(
          mode === "edit"
            ? "Product updated successfully"
            : "Product added successfully"
        );

        // Save optional categories once the product exists; only when something changed
        const productId = mode === "edit" ? initial?._id || initial?.id : res?.data?._id;
        const changed =
          extraIds.length !== Object.keys(savedExtras).length ||
          extraIds.some((id) => !(id in savedExtras));
        if (productId && changed) {
          try {
            await saveProductCategoriesApi(
              productId,
              // Already-linked categories keep their active/inactive status
              extraIds.map((id) => ({ category: id, isActive: savedExtras[id] ?? true })),
            );
          } catch (err) {
            message.error("Product saved, but optional categories could not be saved. Try again from Multi Category.");
          }
        }

        onSaved?.();
        onClose?.();
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSubmitting(false);
    }
  };


  /* ================= UI ================= */
  const discount =
    Number(form.mrp) > Number(form.sellingPrice) && Number(form.sellingPrice) > 0
      ? Math.round(((Number(form.mrp) - Number(form.sellingPrice)) / Number(form.mrp)) * 100)
      : 0;
  const totalImages = existingImages.length + imagePreviews.length;

  const textAreas = [
    { name: "description", label: "Description", required: true },
    { name: "additionalInfo", label: "Additional Info" },
    { name: "benefits", label: "Return and Help" },
    { name: "use", label: "Use" },
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#0f141c]/60 backdrop-blur-sm p-2 sm:p-4"
      style={{ zIndex: 999999 }}
    >
      <div className="bg-[#f6f7f9] rounded-3xl shadow-2xl w-full max-w-[900px] h-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="relative px-6 py-5 text-white bg-gradient-to-br from-[#1d2532] to-[#2f3b4f] shrink-0">
          <MdDiamond className="absolute right-16 -top-4 text-[110px] text-white/5 rotate-12 pointer-events-none" />
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#e3c77a]">
            {mode === "edit" ? "Edit product" : "New product"}
          </p>
          <h3 className="text-2xl font-bold truncate pr-12">
            {mode === "edit" ? initial?.name || "Edit Product" : "Add Product"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-2xl"
          >
            <MdClose />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* 1. BASICS */}
          <Section n={1} title="Basic details" hint="Name, price and stock">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label
                  required
                  extra={
                    <span className="flex items-center gap-2">
                      <Counter value={form.name || ""} max={100} />
                      {mode === "edit" && (
                        <LockButton
                          locked={nameLocked}
                          changed={form.name !== (initial?.name || "")}
                          onEdit={() => setNameUnlocked(true)}
                          onLock={() => setNameUnlocked(false)}
                          onCancel={() => {
                            setForm((f) => ({ ...f, name: initial?.name || "" }));
                            if (slugLinked) setSeo((s) => ({ ...s, slug: initial?.slug || "" }));
                            setNameUnlocked(false);
                          }}
                        />
                      )}
                    </span>
                  }
                >
                  Product Name
                </Label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  readOnly={nameLocked}
                  maxLength={100}
                  placeholder="e.g. Kundan bridal choker"
                  className={`${INPUT_CLS} ${nameLocked ? lockedCls : ""}`}
                />
                {!nameLocked && slugLinked && (
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /product/<span className="text-[#8a6a1f] font-medium">{seo.slug || slugify(form.name) || "…"}</span>{" "}
                    (updates as you type)
                  </p>
                )}
              </div>
              <div>
                <Label>MRP (Cut Price)</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    name="mrp"
                    value={form.mrp}
                    onChange={handleChange}
                    placeholder="0"
                    className={`${INPUT_CLS} pl-8`}
                  />
                </div>
              </div>
              <div>
                <Label
                  required
                  extra={
                    discount > 0 && (
                      <span className="normal-case text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                        {discount}% OFF
                      </span>
                    )
                  }
                >
                  Selling Price
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={form.sellingPrice}
                    onChange={handleChange}
                    placeholder="0"
                    className={`${INPUT_CLS} pl-8`}
                  />
                </div>
              </div>
              <div>
                <Label required>Quantity</Label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <Label>Best Seller</Label>
                <label
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 cursor-pointer transition ${
                    form.bestSeller ? "border-[#c8a24a] bg-[#fffaf0]" : "border-gray-200 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="bestSeller"
                    checked={form.bestSeller}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span
                    className={`relative inline-flex w-10 h-6 rounded-full transition-colors shrink-0 ${
                      form.bestSeller ? "bg-[#c8a24a]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        form.bestSeller ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </span>
                  <span className="text-sm text-[#1d2532] flex items-center gap-1.5">
                    <MdWorkspacePremium className={form.bestSeller ? "text-[#c8a24a]" : "text-gray-400"} />
                    {form.bestSeller ? "Shown as best seller" : "Not a best seller"}
                  </span>
                </label>
              </div>
            </div>
          </Section>

          {/* 2. CATEGORY & SHIPPING */}
          <Section n={2} title="Category & shipping" hint="Where the product is listed and how it ships">
            <Label>Select Type</Label>
            <div className="inline-flex rounded-xl bg-gray-100 p-1 mb-4" role="group">
              {[
                { v: "shopByProd", label: "Shop By Category" },
                { v: "shopByFunc", label: "Shop By Function" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  aria-pressed={form.selection === o.v}
                  onClick={() => setForm((f) => ({ ...f, selection: o.v }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    form.selection === o.v ? "bg-white shadow text-[#1d2532]" : "text-gray-500 hover:text-[#1d2532]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <Label required>Main Category</Label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} className={INPUT_CLS}>
              <option value="">Select category</option>
              {categories.map((c) => {
                const parentName =
                  c.parentCategory?.name || categories.find((p) => p._id === c.parentCategory)?.name;
                return (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {parentName ? `${parentName} › ${c.name}` : c.name}
                  </option>
                );
              })}
            </select>

          {/* OPTIONAL CATEGORIES */}
          <div className="mt-5 rounded-2xl border border-[#ecd9a6] bg-gradient-to-br from-[#fffdf7] to-[#fbf6e9] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#1d2532] flex items-center gap-2">
                  Optional Categories
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-[#ecd9a6] text-[#7a5c14]">
                    {extraIds.length} selected
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Also show this product in these categories. The main category above stays as it is.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={extraSearch}
                    onChange={(e) => setExtraSearch(e.target.value)}
                    placeholder="Find a category"
                    className="border border-gray-200 rounded-full pl-8 pr-3 py-1.5 text-sm w-44 bg-white focus:outline-none focus:border-[#c8a24a]"
                  />
                </div>
                {extraIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setExtraIds([])}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 max-h-44 overflow-y-auto pr-1">
              {visibleExtras.map((c) => {
                const isMain = c._id === form.categoryId;
                const on = !isMain && extraIds.includes(c._id);
                const inactive = on && savedExtras[c._id] === false;
                return (
                  <button
                    key={c._id}
                    type="button"
                    role="checkbox"
                    aria-checked={isMain || on}
                    disabled={isMain}
                    onClick={() => toggleExtra(c._id)}
                    title={isMain ? "This is the main category" : inactive ? "Saved as inactive on the Multi Category page" : ""}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                      isMain
                        ? "bg-[#ecd9a6] border-[#ecd9a6] text-[#7a5c14] cursor-not-allowed"
                        : on
                          ? "bg-[#1d2532] border-[#1d2532] text-white shadow-sm"
                          : "bg-white border-gray-200 text-gray-700 hover:border-[#c8a24a] hover:text-[#1d2532]"
                    }`}
                  >
                    {isMain ? (
                      <MdStar className="text-sm" />
                    ) : on ? (
                      <MdCheck className="text-sm text-[#e3c77a]" />
                    ) : (
                      <span className="text-gray-400 leading-none">+</span>
                    )}
                    {categoryLabel(c)}
                    {isMain && <span className="text-[10px] font-bold">MAIN</span>}
                    {inactive && <span className="text-[10px] font-semibold text-gray-300">INACTIVE</span>}
                  </button>
                );
              })}
              {!visibleExtras.length && (
                <p className="text-sm text-gray-500 py-2">
                  {allCategories.length ? "No category matches your search" : "No categories yet"}
                </p>
              )}
            </div>

            {extraIds.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#ecd9a6] flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-[#7a5c14] mr-1">Selected:</span>
                {extraIds.map((id) => {
                  const c = allCategories.find((x) => x._id === id);
                  if (!c) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 text-xs pl-2.5 pr-1 py-0.5 rounded-full bg-white border border-[#ecd9a6] text-[#1d2532]"
                    >
                      {c.name}
                      <button
                        type="button"
                        title={`Remove ${c.name}`}
                        onClick={() => toggleExtra(id)}
                        className="w-4 h-4 rounded-full hover:bg-red-50 hover:text-red-600 flex items-center justify-center"
                      >
                        <MdClose className="text-[11px]" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

            <div className="mt-5">
              <Label>Shipment Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { v: "ship", label: "Ready to Ship", hint: "In stock, dispatched quickly", icon: <MdLocalShipping /> },
                  { v: "order", label: "Made to Order", hint: "Crafted after the order is placed", icon: <MdBuild /> },
                ].map((o) => {
                  const on = form.shipmentType === o.v;
                  return (
                    <button
                      key={o.v}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setForm((f) => ({ ...f, shipmentType: o.v }))}
                      className={`flex items-center gap-3 text-left rounded-xl border px-4 py-3 transition ${
                        on ? "border-[#1d2532] bg-[#1d2532] text-white shadow" : "border-gray-200 bg-white hover:border-[#c8a24a]"
                      }`}
                    >
                      <span className={`text-2xl ${on ? "text-[#e3c77a]" : "text-gray-400"}`}>{o.icon}</span>
                      <span>
                        <span className="block text-sm font-semibold">{o.label}</span>
                        <span className={`block text-xs ${on ? "text-gray-300" : "text-gray-500"}`}>{o.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* 3. DETAILS */}
          <Section
            n={3}
            title="Description & details"
            hint="Shown on the product page. Description needs 10–500 characters; the others 5–500 if filled."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {textAreas.map((t) => (
                <div key={t.name} className={t.name === "description" ? "sm:col-span-2" : ""}>
                  <Label required={t.required} extra={<Counter value={form[t.name] || ""} />}>
                    {t.label}
                  </Label>
                  <textarea
                    name={t.name}
                    rows={t.name === "description" ? 4 : 3}
                    value={form[t.name]}
                    onChange={handleChange}
                    className={`${INPUT_CLS} resize-y`}
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* 4. PHOTOS */}
          <Section
            n={4}
            title="Photos"
            hint={
              mode === "add"
                ? "At least 1 photo, up to 10 new photos at a time. The first one is the cover."
                : "Up to 10 new photos at a time. The first one is the cover."
            }
            right={
              <span className="text-xs font-semibold text-gray-500">
                {totalImages} photo{totalImages === 1 ? "" : "s"}
              </span>
            }
          >
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
                onSelectImages({ target: { files } });
              }}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-4 py-7 cursor-pointer text-center transition ${
                dragOver
                  ? "border-[#c8a24a] bg-[#fffaf0]"
                  : "border-gray-300 bg-gray-50 hover:border-[#c8a24a] hover:bg-[#fffdf7]"
              }`}
            >
              <MdCloudUpload className="text-4xl text-[#c8a24a]" />
              <span className="text-sm font-semibold text-[#1d2532]">Drop photos here or click to browse</span>
              <span className="text-xs text-gray-500">JPG, PNG or WEBP</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  onSelectImages(e);
                  e.target.value = "";
                }}
                className="sr-only"
              />
            </label>

            {totalImages > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {existingImages.map((src, index) => (
                  <div
                    key={src}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
                  >
                    <img src={`${image_url}/${src}`} alt="" className="w-full h-full object-cover" />
                    {index === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1d2532] text-[#e3c77a]">
                        COVER
                      </span>
                    )}
                    <button
                      type="button"
                      title="Delete photo"
                      onClick={() => removeExistingImage(src)}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 text-red-600 shadow flex items-center justify-center hover:bg-red-50"
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
                {imagePreviews.map((src, index) => (
                  <div
                    key={src}
                    className="group relative aspect-square rounded-xl overflow-hidden border-2 border-[#c8a24a] bg-gray-100"
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#c8a24a] text-white">
                      {existingImages.length === 0 && index === 0 ? "COVER · NEW" : "NEW"}
                    </span>
                    <button
                      type="button"
                      title="Remove photo"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 text-red-600 shadow flex items-center justify-center hover:bg-red-50"
                    >
                      <MdClose />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* 5. FAQs */}
          <Section
            n={5}
            title="FAQs"
            hint="Optional questions and answers shown on the product page (up to 10)"
            right={
              <button
                type="button"
                onClick={() => setShowFaq(!showFaq)}
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition ${
                  showFaq ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-white bg-[#1d2532] hover:bg-[#2f3b4f]"
                }`}
              >
                {showFaq ? "Remove FAQs" : "Add FAQs"}
              </button>
            }
          >
            {showFaq ? (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="relative rounded-xl border border-gray-200 bg-gray-50 p-4 pt-5">
                    <span className="absolute -top-2.5 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1d2532] text-[#e3c77a]">
                      Q{index + 1}
                    </span>
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        title="Remove this FAQ"
                        onClick={() => removeFaq(index)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full text-red-600 hover:bg-red-50 flex items-center justify-center"
                      >
                        <MdClose />
                      </button>
                    )}
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(index, "question", e.target.value)}
                        className={INPUT_CLS}
                        placeholder="Question"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, "answer", e.target.value)}
                        className={`${INPUT_CLS} resize-y`}
                        placeholder="Answer"
                      />
                    </div>
                  </div>
                ))}
                {faqs.length < 10 && (
                  <button
                    type="button"
                    onClick={addFaq}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-sm font-semibold text-gray-600 hover:border-[#c8a24a] hover:text-[#7a5c14]"
                  >
                    + Add another FAQ
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No FAQs for this product.</p>
            )}
          </Section>

          {/* 6. SEO */}
          <Section
            n={6}
            title="SEO (Google & sharing)"
            hint="Optional. Empty fields are filled automatically from the product name and description."
          >
            <SeoFields
              value={seo}
              onChange={setSeo}
              name={form.name}
              description={form.description}
              basePath="/product/"
              inputCls={INPUT_CLS}
              lockable={mode === "edit"}
              saved={{
                slug: initial?.slug || "",
                metaTitle: initial?.metaTitle || "",
                metaDescription: initial?.metaDescription || "",
                metaKeywords: initial?.metaKeywords || "",
              }}
              slugLinked={slugLinked}
              onSlugLinkedChange={setSlugLinked}
              tags={tags}
              onTagsChange={setTags}
            />
          </Section>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-white shrink-0">
          <p className="hidden sm:block text-xs text-gray-500">
            Fields marked <span className="text-red-500">*</span> are required
          </p>
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#1d2532] bg-gray-100 hover:bg-gray-200"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1d2532] hover:bg-[#2f3b4f] disabled:opacity-60 shadow"
            >
              <MdSave /> {submitting ? "Saving..." : mode === "edit" ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
