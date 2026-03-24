import React, { useState } from "react";
import { addBannerApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../toast/Toast";
import { image_url } from "../../common/env";

const validationSchema = Yup.object().shape({
  image: Yup.mixed().required("Image file is required"),
});

function AddModal({ onClose, fetchBanners }) {
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const message = useToast();

  const handleImageChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFieldValue("image", file);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (imageFile) formData.append("image", imageFile);

      const res = await addBannerApi(formData);
      if (res.success) {
        message.success("Banner added successfully!");
        fetchBanners();
        resetForm();
        setImageFile(null);
        onClose();
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[500px] max-h-[600px] flex flex-col">
        <h3 className="text-lg font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
          Add Banner
        </h3>

        <Formik
          initialValues={{ image: null }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Image Upload */}
                <div>
                  <label className="block mb-2 font-semibold">
                    Banner Image
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-900 p-6 rounded-md text-center cursor-pointer hover:bg-gray-50 transition"
                    onClick={() =>
                      document.getElementById("imageInput").click()
                    }
                  >
                    <FontAwesomeIcon
                      icon={faUpload}
                      className="text-3xl text-gray-600 mb-2"
                    />
                    <p className="text-gray-700 font-semibold">
                      Click to upload image
                    </p>
                    <p className="text-gray-500 text-sm">
                      JPG, PNG, WEBP supported
                    </p>

                    {imageFile && (
                      <div className="mt-3">
                        <img
                          src={URL.createObjectURL(imageFile)} // local preview
                          alt=""
                        />

                        <p className="text-green-600 text-sm mt-1">
                          🖼️ {imageFile.name}
                        </p>
                      </div>
                    )}
                  </div>

                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setFieldValue)}
                    className="hidden"
                  />

                  <ErrorMessage
                    name="image"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end p-4 border-t gap-6 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 text-black w-52 py-2 px-4 rounded-md hover:bg-gray-400 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-white py-2 px-4 rounded-md w-52 bg-[#1d2532] hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default AddModal;
