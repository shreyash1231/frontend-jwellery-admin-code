import React, { useState } from "react";
import { editTestimonialApi } from "../../common/services";
import defalutImage from "../../Images/noProfile.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { errorResponseHandler } from "../../common/http";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { image_url } from "../../common/env";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  country: Yup.string().required("Country is required"),
  message: Yup.string().required("Message is required"),
});

function EditModal({ onClose, fetchTestimonials, selectedTestimonial }) {
  const [preview, setPreview] = useState(selectedTestimonial?.imageUrl || null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
      setFieldValue("file", file);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("country", values.country);
      formData.append("message", values.message);
      if (file) formData.append("image", file);

      const res = await editTestimonialApi(selectedTestimonial.id,formData);
      if (res.success) {
        fetchTestimonials();
        resetForm();
        setPreview(null);
        onClose();
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[500px] max-h-[550px] flex flex-col">
        <h3 className="text-lg font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
          Edit Testimonial
        </h3>
        <Formik
          initialValues={{
            name: selectedTestimonial?.name || "",
            country: selectedTestimonial?.country || "",
            message: selectedTestimonial?.message || "",
            file: null,
          }}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto p-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src={`${image_url}/${preview || defalutImage}`}
                    alt="Preview"
                    className="border border-gray-800 w-40 h-40 object-contain rounded-full"
                  />
                  <button
                    type="button"
                    className="w-10 h-10 absolute bottom-2 right-2 bg-white text-black p-2 rounded-full shadow hover:bg-gray-200"
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setFieldValue)}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1">Name</label>
                  <Field
                    type="text"
                    name="name"
                    className="border border-gray-900 p-2 w-full"
                    placeholder="Enter name"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1">Country</label>
                  <Field
                    type="text"
                    name="country"
                    className="border border-gray-900 p-2 w-full"
                    placeholder="Enter country"
                  />
                  <ErrorMessage
                    name="country"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block mb-1">Message</label>
                  <Field
                    as="textarea"
                    name="message"
                    className="border border-gray-900 p-2 w-full"
                    rows={3}
                    placeholder="Enter testimonial message"
                  />
                  <ErrorMessage
                    name="message"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end p-4 border-t gap-6 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 text-black w-40 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-white py-2 px-4 rounded-md w-40 bg-[#1d2532] transition duration-200"
                >
                  {submitting ? "Updating..." : "Update"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default EditModal;
