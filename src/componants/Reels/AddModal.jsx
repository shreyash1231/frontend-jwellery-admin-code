import React, { useState } from "react";
import { addReelsApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../toast/Toast";

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  video: Yup.mixed().required("Video file is required"),
  image: Yup.mixed().nullable(),
});

function AddModal({ onClose, fetchReels }) {
  const [submitting, setSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const message=useToast()

  const handleVideoChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setFieldValue("video", file);
    }
  };
  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);

      if (videoFile) formData.append("video", videoFile);
      if (imageFile) formData.append("image", imageFile);

      const res = await addReelsApi(formData);
      if (res.success) {
        message.success("Reel added successfully!");
        fetchReels();
        resetForm();
        setVideoFile(null);
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
          Add Reel
        </h3>

        <Formik
          initialValues={{ title: "", video: null, image: null }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Title */}
                <div>
                  <label className="block mb-2 font-semibold">Title</label>
                  <Field
                    type="text"
                    name="title"
                    className="border border-gray-900 p-2 w-full rounded-md"
                    placeholder="Enter reel title"
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Price */}
            

                {/* Video Upload */}
                <div>
                  <label className="block mb-2 font-semibold">Video File</label>
                  <div
                    className="border-2 border-dashed border-gray-900 p-6 rounded-md text-center cursor-pointer hover:bg-gray-50 transition"
                    onClick={() =>
                      document.getElementById("videoInput").click()
                    }
                  >
                    <FontAwesomeIcon
                      icon={faUpload}
                      className="text-3xl text-gray-600 mb-2"
                    />
                    <p className="text-gray-700 font-semibold">
                      Click to upload video
                    </p>
                    <p className="text-gray-500 text-sm">
                      MP4, WebM, Ogg supported
                    </p>

                    {videoFile && (
                      <p className="text-green-600 text-sm mt-2">
                        📹 {videoFile.name}
                      </p>
                    )}
                  </div>

                  <input
                    id="videoInput"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleVideoChange(e, setFieldValue)}
                    className="hidden"
                  />

                  <ErrorMessage
                    name="video"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Image Upload */}
                {/* <div>
                  <label className="block mb-2 font-semibold">
                    Thumbnail Image (Optional)
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
                          src={URL.createObjectURL(imageFile)}
                          alt="preview"
                          className="mx-auto h-24 rounded-md object-cover"
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
                </div> */}
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
