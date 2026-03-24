import React, { useEffect, useState } from "react";
import { addAboutUsApi, updateAboutUsApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";
import { image_url } from "../../common/env";

const AboutUsForm = ({ onClose, onSaved, mode = "add", initial = null }) => {
  const [form, setForm] = useState({
    type: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const message = useToast();

  useEffect(() => {
    if (mode === "edit" && initial) {
      setForm({
        type: initial?.type || "",
      });
      setImagePreview(initial?.image || "");
    }
  }, [mode, initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSelectImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.type) {
      message.error("Please select a type");
      return;
    }

    if (mode === "add" && !image) {
      message.error("Image is required");
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("type", form.type);
      if (image) {
        fd.append("image", image);
      }

      let res;
      if (mode === "edit") {
        const id = initial?._id || initial?.id;
        res = await updateAboutUsApi(id, fd);
      } else {
        res = await addAboutUsApi(fd);
      }

      if (res?.success) {
        message.success(
          mode === "edit"
            ? "Entry updated successfully"
            : "Entry added successfully",
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

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2"
      style={{ zIndex: 999999 }}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[500px] flex flex-col">
        <h3 className="text-xl font-bold text-center bg-[#1d2532] py-2 text-white rounded-t-2xl">
          {mode === "edit" ? "Edit About Us" : "Add About U dds"}
        </h3>

        <div className="p-6">
          <div className="mb-4">
            <label className="block mb-1 font-medium">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="border border-gray-900 p-2 w-full rounded"
            >
              <option value="">Select Type</option>
              <option value="background">Background</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={onSelectImage}
              className="mb-2"
            />
         {imagePreview && (
  <div className="relative mt-2">
    <img
      src={
        imagePreview.includes("uploads/")
          ? `${image_url}/${imagePreview}`
          : imagePreview
      }
      alt="Preview"
      className="w-full h-48 object-cover border rounded"
    />
  </div>
)}

          </div>
        </div>

        <div className="flex justify-end p-4 border-t gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 transition"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#1d2532] text-white px-6 py-2 rounded hover:bg-gray-800 transition disabled:opacity-50"
          >
            {submitting ? "Saving..." : mode === "edit" ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUsForm;
