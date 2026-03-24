import React, { useEffect, useState } from "react";
import {
  addProjectApi,
  updateProjectApi,
  deleteProductImageApi,
  shopByProd,
  shopByFunc,
} from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";
import { image_url } from "../../common/env";

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

  const message = useToast();

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

      // ✅ LOAD FAQs
      if (Array.isArray(initial?.faqs) && initial.faqs.length > 0) {
        setFaqs(initial.faqs);
        setShowFaq(true);
      }
    }
  }, [mode, initial]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2"
      style={{ zIndex: 999999 }}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[820px] h-full max-h-[780px] flex flex-col">
        <h3 className="text-xl font-bold text-center bg-[#1d2532] py-2 text-white">
          {mode === "edit" ? "Edit Product" : "Add Product"}
        </h3>

        <div className="flex-1 overflow-y-auto p-6">
          {/* NAME & PRICE & QUANTITY */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="border border-gray-900 p-2 w-full"
              />
            </div>

            <div>
              <label className="block mb-1">MRP (Cut Price)</label>
              <input
                type="number"
                name="mrp"
                value={form.mrp}
                onChange={handleChange}
                className="border border-gray-900 p-2 w-full"
              />
            </div>

            <div>
              <label className="block mb-1">Selling Price</label>
              <input
                type="number"
                name="sellingPrice"
                value={form.sellingPrice}
                onChange={handleChange}
                className="border border-gray-900 p-2 w-full"
              />
            </div>

            <div>
              <label className="block mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                disabled={mode === "edit"}
                value={form.quantity}
                onChange={handleChange}
                className="border border-gray-900 p-2 w-full"
              />
            </div>
          </div>

          {/* SELECTION TYPE */}
          <div className="mt-6">
            <label className="block mb-1">Select Type</label>
            <select
              name="selection"
              value={form.selection}
              onChange={handleChange}
              className="border border-gray-900 p-2 w-full"
            >
              <option value="shopByProd">Shop By Category</option>
              <option value="shopByFunc">Shop By Function</option>
            </select>
          </div>

          {/* CATEGORY */}
          <div className="mt-6">
            <label className="block mb-1">Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="border border-gray-900 p-2 w-full"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* SHIPMENT TYPE */}
          <div className="mt-6">
            <label className="block mb-1">Shipment Type</label>
            <select
              name="shipmentType"
              value={form.shipmentType}
              onChange={handleChange}
              className="border border-gray-900 p-2 w-full"
            >
              <option value="ship">Ready to Ship</option>
              <option value="order">Made to Order</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">
            <label className="block mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="border border-gray-900 p-2 w-full"
            />
          </div>
          {/* ADDITIONAL INFO */}
          <div className="mt-4">
            <label className="block mb-1">Additional Info</label>
            <textarea
              name="additionalInfo"
              rows={3}
              value={form.additionalInfo}
              onChange={handleChange}
              className="border border-gray-900 p-2 w-full"
            />
          </div>
          {/* BENEFITS */}
          <div className="mt-4">
            <label className="block mb-1">Return and Help</label>
            <textarea
              name="benefits"
              rows={3}
              value={form.benefits}
              onChange={handleChange}
              className="border border-gray-900 p-2 w-full"
            />
          </div>
          {/* USE */}
          <div className="mt-4">
            <label className="block mb-1">Use</label>
            <textarea
              name="use"
              rows={3}
              value={form.use}
              onChange={handleChange}
              className="border border-gray-900 p-2 w-full"
            />
          </div>
          {/* FEATURES */}
          {/* <div className="mt-4">
            <label className="block mb-1">Features</label>benefits
            <textarea
              name="features"
              rows={3}
              value={form.features}
              onChange={handleChange}
              className="border border-gray-900 p-2 w-full"
            />
          </div> */}

          {/* ================= FAQs ================= */}
          {/* ================= FAQs ================= */}
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">FAQs</h4>

              <button
                type="button"
                onClick={() => setShowFaq(!showFaq)}
                className="text-sm bg-[#1d2532] text-white px-4 py-1 rounded"
              >
                {showFaq ? "Remove FAQs" : "Add FAQs"}
              </button>
            </div>

            {showFaq && (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-4 bg-gray-50 relative"
                  >
                    {/* QUESTION */}
                    <div className="mb-3">
                      <label className="block mb-1 text-sm font-medium">
                        Question
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) =>
                          updateFaq(index, "question", e.target.value)
                        }
                        className="border border-gray-900 p-2 w-full rounded"
                        placeholder="Enter question"
                      />
                    </div>

                    {/* ANSWER */}
                    <div>
                      <label className="block mb-1 text-sm font-medium">
                        Answer
                      </label>
                      <textarea
                        rows={3}
                        value={faq.answer}
                        onChange={(e) =>
                          updateFaq(index, "answer", e.target.value)
                        }
                        className="border border-gray-900 p-2 w-full rounded"
                        placeholder="Enter answer"
                      />
                    </div>

                    {/* REMOVE */}
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFaq(index)}
                        className="absolute top-2 right-2 text-red-600 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addFaq}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm"
                >
                  + Add Another FAQ
                </button>
              </div>
            )}
          </div>

          {/* IMAGES AT BOTTOM */}
          <div className="mt-6">
            <label className="block mb-2 font-medium">Product Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onSelectImages}
            />

            {/* EXISTING IMAGES */}
            {existingImages.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-4">
                {existingImages.map((src, index) => (
                  <div key={index} className="relative">
                    <img
                      src={`${image_url}/${src}`}
                      alt=""
                      className="w-24 h-24 object-cover border rounded"
                    />
                    <span
                      onClick={() => removeExistingImage(src)}
                      className="absolute -top-2 -right-2 bg-white text-red-600 cursor-pointer px-1 rounded-full"
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* NEW IMAGE PREVIEWS */}
            {imagePreviews.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-4">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative">
                    <img
                      src={`${src}`}
                      alt=""
                      className="w-24 h-24 object-cover border rounded"
                    />
                    <span
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 bg-white text-red-600 cursor-pointer px-1 rounded-full"
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end p-4 border-t gap-4">
          <button onClick={onClose} className="bg-gray-300 px-6 py-2 rounded">
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#1d2532] text-white px-6 py-2 rounded"
          >
            {submitting ? "Saving..." : mode === "edit" ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
