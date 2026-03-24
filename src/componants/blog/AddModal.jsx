import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addBlogsApi } from "../../common/services";
import { message } from "antd";
import { errorResponseHandler } from "../../common/http";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { image_url } from "../../common/env";

const AddModal = ({ showCreateBlog, setShowCreateBlog, action, setAction }) => {
  const [open, setOpen] = useState(showCreateBlog);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCloseModal = () => {
    setOpen(false);
    setShowCreateBlog(false);
    setImagePreview(null);
    setSelectedImage(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required("Title is required")
        .trim("Title should not contain spaces")
        .max(100, "Title can not be more than 100 characters long"),
      content: Yup.string()
        .required("Content is required")
        .trim("Content should not contain spaces")
        .min(10, "Content must be at least 10 characters"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("content", values.content);
        if (selectedImage) {
          formData.append("image", selectedImage);
        }

        const response = await addBlogsApi(formData);
        if (response?.success) {
          message.success("Blog Added successfully");
          resetForm();
          setOpen(false);
          setShowCreateBlog(false);
          setImagePreview(null);
          setSelectedImage(null);
          setAction(!action);
        }
      } catch (error) {
        errorResponseHandler(error);
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[900px] h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
          Create New Blog
        </h3>
        <form onSubmit={formik.handleSubmit} className="p-8">
          <div className="w-full mb-6">
            <label className="block mb-2 text-xl font-bold">Title</label>
            <input
              type="text"
              name="title"
              className="border border-gray-900 p-2 w-full"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.title}
              placeholder="Enter the blog title"
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-red-600">{formik.errors.title}</p>
            )}
          </div>

          <div className="w-full mb-6">
            <label className="block mb-2 text-xl font-bold">Content</label>
            <ReactQuill
              theme="snow"
              value={formik.values.content}
              onChange={(value) => formik.setFieldValue("content", value)}
              placeholder="Enter your blog content"
              style={{ height: "200px" }}
            />
            {formik.touched.content && formik.errors.content && (
              <p className="text-red-600 mt-12">{formik.errors.content}</p>
            )}
          </div>

          <div className="w-full mb-6 mt-10">
            <label className="block mb-2 text-xl font-bold">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border border-gray-900 p-2 w-full"
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={`${image_url}/${imagePreview}`}
                  alt="Preview"
                  className="w-32 h-32 object-cover border"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-6 mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="bg-gray-300 text-black w-52 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1d2532] text-white py-2 px-4 rounded-md w-52 duration-200 mr-2"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
