import React, { useEffect, useState } from "react";
import { message } from "antd";
import { addDomainApi, updateDomainApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../toast/Toast";
import { image_url } from "../../common/env";

const DomainForm = ({
  mode = "add",
  onClose,
  initialDomain = null,
  onSaved,
}) => {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: "",
    description: "",
    isShopByProduct: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const message = useToast();

  // ================= INITIAL DATA =================
  useEffect(() => {
    if (isEdit && initialDomain) {
      setForm({
        name:
          initialDomain?.name ||
          initialDomain?.domain_name ||
          initialDomain?.title ||
          "",
        description:
          initialDomain?.description ||
          initialDomain?.desc ||
          initialDomain?.detail ||
          "",
        isShopByProduct: initialDomain?.isShopByProduct || false,
      });

      const img =
        initialDomain?.image ||
        initialDomain?.imageUrl ||
        initialDomain?.profile_image ||
        "";
      const logo = initialDomain?.logo || "";

      setImagePreview(img);
      setImageFile(null);
      setLogoPreview(logo);
      setLogoFile(null);
    } else {
      setForm({ name: "", description: "", isShopByProduct: false });
      setImagePreview("");
      setImageFile(null);
      setLogoPreview("");
      setLogoFile(null);
    }
  }, [isEdit, initialDomain]);

  // ================= CLEANUP OBJECT URL =================
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    };
  }, [imagePreview, logoPreview]);

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      message.error("Name and Description are required");
      return;
    }

    if (!isEdit && !imageFile) {
      message.error("Image is required");
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("isShopByProduct", form.isShopByProduct);

      if (imageFile) fd.append("image", imageFile);
      if (logoFile) fd.append("logo", logoFile);

      if (isEdit) {
        const id = initialDomain?._id || initialDomain?.id;
        const res = await updateDomainApi(id, fd);
        if (res?.success) {
          message.success("Category updated successfully");
          onSaved?.();
        }
      } else {
        const res = await addDomainApi(fd);
        if (res?.success) {
          message.success("Category added successfully");
          onSaved?.();
        }
      }

      setForm({ name: "", description: "", isShopByProduct: false });
      setImageFile(null);
      setImagePreview("");
      setLogoFile(null);
      setLogoPreview("");
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2"
      style={{ zIndex: 9999999 }}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[700px] max-h-[680px] flex flex-col">
        <h3 className="text-xl font-bold text-center bg-[#1d2532] py-2 text-white">
          {isEdit ? "Edit Category" : "Add Category"}
        </h3>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ================= IMAGE SECTION (MATCHES OTHER MODAL) ================= */}
          <div>
            <label className="block mb-2 font-semibold">
              Image {isEdit ? "(Optional)" : ""}
            </label>

            {/* EXISTING IMAGE */}
            {!imageFile && imagePreview && (
              <div className="mb-2">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Current Image
                </p>
                <img
                  src={`${image_url}/${imagePreview}`}
                  alt="current"
                  className="w-full h-44 object-contain border rounded-md"
                />
              </div>
            )}

            {/* NEW IMAGE */}
            {imageFile && (
              <div className="mb-2">
                <p className="text-sm font-semibold text-green-700 mb-1">
                  New Image (Will replace current)
                </p>
                <img
                  src={`${imagePreview}`}
                  alt="preview"
                  className="w-full h-44 object-contain border rounded-md"
                />
              </div>
            )}

            <div
              className="border-2 border-dashed border-gray-900 p-4 rounded-md text-center cursor-pointer hover:bg-gray-50"
              onClick={() =>
                document.getElementById("domainImageInput").click()
              }
            >
              <FontAwesomeIcon icon={faUpload} className="text-xl mb-1" />
              <p className="font-semibold">Upload image</p>
              <p className="text-sm text-gray-500">
                {isEdit
                  ? "Leave empty to keep existing image"
                  : "Image is required"}
              </p>
            </div>

            <input
              id="domainImageInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* ================= LOGO (OPTIONAL) ================= */}
          <div>
            <label className="block mb-2 font-semibold">Logo (Optional)</label>
            {!logoFile && logoPreview && (
              <div className="mb-2">
                <p className="text-sm font-semibold text-gray-700 mb-1">Current Logo</p>
                <img
                  src={`${image_url}/${logoPreview}`}
                  alt="current logo"
                  className="w-full h-32 object-contain border rounded-md"
                />
              </div>
            )}
            {logoFile && (
              <div className="mb-2">
                <p className="text-sm font-semibold text-green-700 mb-1">New Logo</p>
                <img
                  src={logoPreview}
                  alt="logo preview"
                  className="w-full h-32 object-contain border rounded-md"
                />
              </div>
            )}
            <div
              className="border-2 border-dashed border-gray-400 p-4 rounded-md text-center cursor-pointer hover:bg-gray-50"
              onClick={() => document.getElementById("domainLogoInput").click()}
            >
              <FontAwesomeIcon icon={faUpload} className="text-xl mb-1" />
              <p className="font-semibold">Upload logo</p>
            </div>
            <input
              id="domainLogoInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          {/* ================= FORM FIELDS ================= */}
          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              name="name"
              className="border border-gray-900 p-2 w-full"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block mb-1">Description</label>
            <textarea
              name="description"
              className="border border-gray-900 p-2 w-full"
              rows={5}
              value={form.description}
              onChange={handleChange}
              placeholder="Enter description"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isShopByProduct"
              id="isShopByProduct"
              checked={form.isShopByProduct}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  isShopByProduct: e.target.checked,
                }))
              }
              className="w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="isShopByProduct"
              className="font-semibold cursor-pointer"
            >
              Shop By Product
            </label>
          </div>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex justify-end p-4 border-t gap-6">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black w-40 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="text-white py-2 px-4 rounded-md w-40 bg-[#1d2532]"
          >
            {submitting
              ? isEdit
                ? "Updating..."
                : "Saving..."
              : isEdit
                ? "Update"
                : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomainForm;
