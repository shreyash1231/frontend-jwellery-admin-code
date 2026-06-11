import React, { useState } from "react";
import { updateBannerApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../toast/Toast";
import { image_url } from "../../common/env";

const validationSchema = Yup.object().shape({
  file: Yup.mixed().nullable(),
});

function EditModal({ onClose, fetchBanners, selectedBanner }) {
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const message = useToast();

  const isVideoFile = (url) => {
    return /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(url || "");
  };

  const handleFileChange = (e, setFieldValue) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setFieldValue("file", file);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const res = await updateBannerApi(selectedBanner.id, formData);

      if (res.success) {
        message.success("Banner updated successfully!");

        fetchBanners();
        resetForm();
        setSelectedFile(null);
        onClose();
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 z-50"
      style={{ zIndex: 9999999 }}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[500px] max-h-[650px] flex flex-col">
        <h3 className="text-lg font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
          Edit Banner
        </h3>

        <Formik
          initialValues={{
            file: null,
          }}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block mb-2 font-semibold">
                    Banner Image / Video (Optional)
                  </label>

                  <div
                    className="border-2 border-dashed border-gray-900 p-6 rounded-md text-center cursor-pointer hover:bg-gray-50 transition"
                    onClick={() =>
                      document.getElementById("fileInput").click()
                    }
                  >
                    <FontAwesomeIcon
                      icon={faUpload}
                      className="text-3xl text-gray-600 mb-2"
                    />

                    <p className="text-gray-700 font-semibold">
                      Click to upload new image or video
                    </p>

                    <p className="text-gray-500 text-sm">
                      Leave empty to keep existing banner
                    </p>

                    {/* New File Preview */}
                    {selectedFile && (
                      <div className="mt-4">
                        {selectedFile.type.startsWith("video/") ? (
                          <video
                            controls
                            className="mx-auto h-40 rounded-md"
                          >
                            <source
                              src={URL.createObjectURL(selectedFile)}
                              type={selectedFile.type}
                            />
                          </video>
                        ) : (
                          <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            className="mx-auto h-40 rounded-md object-cover"
                          />
                        )}

                        <p className="text-green-600 text-sm mt-2 break-all">
                          {selectedFile.name}
                        </p>
                      </div>
                    )}

                    {/* Existing Banner Preview */}
                    {!selectedFile && selectedBanner?.imageUrl && (
                      <div className="mt-4">
                        {isVideoFile(selectedBanner.imageUrl) ? (
                          <video
                            controls
                            className="mx-auto h-40 rounded-md"
                          >
                            <source
                              src={`${image_url}/${selectedBanner.imageUrl}`}
                            />
                          </video>
                        ) : (
                          <img
                            src={`${image_url}/${selectedBanner.imageUrl}`}
                            alt="Current Banner"
                            className="mx-auto h-40 rounded-md object-cover"
                          />
                        )}

                        <p className="text-blue-600 text-sm mt-2">
                          ✓ Current Banner
                        </p>
                      </div>
                    )}
                  </div>

                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => handleFileChange(e, setFieldValue)}
                    className="hidden"
                  />

                  <ErrorMessage
                    name="file"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end p-4 border-t gap-6 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 text-black w-52 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="text-white py-2 px-4 rounded-md w-52 bg-[#1d2532] hover:bg-gray-800 transition duration-200 disabled:opacity-50"
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