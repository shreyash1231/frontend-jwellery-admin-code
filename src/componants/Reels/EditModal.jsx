import React, { useState } from "react";
import { updateReelApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { useToast } from "../toast/Toast";
import { image_url } from "../../common/env";

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),

});

function EditModal({ onClose, fetchReels, selectedReel }) {
  const [submitting, setSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const message=useToast();


  // ================= VIDEO =================
  const handleVideoChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setFieldValue("video", file);
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);

      if (imageFile) formData.append("image", imageFile);
      if (videoFile) formData.append("video", videoFile);

      const res = await updateReelApi(selectedReel._id, formData);

      if (res.success) {
        message.success("Reel updated successfully!");
        fetchReels();
        resetForm();
        setImageFile(null);
        setVideoFile(null);
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
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[520px] max-h-[650px] flex flex-col overflow-hidden">
        <h3 className="text-lg font-bold text-center bg-[#1d2532] py-2 text-white">
          Edit Reel
        </h3>

        <Formik
          initialValues={{
            title: selectedReel?.title || "",
            image: null,
            video: null,
          }}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TITLE */}
              <div>
                <label className="block mb-2 font-semibold">Title</label>
                <Field
                  type="text"
                  name="title"
                  className="border border-gray-900 p-2 w-full rounded-md"
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

            

          

              {/* VIDEO SECTION */}
              <div>
                <label className="block mb-2 font-semibold">
                  Video (Optional)
                </label>

                {/* EXISTING VIDEO */}
                {!videoFile && selectedReel?.videoUrl && (
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Current Video
                    </p>
                    <video
                      controls
                      className="w-full h-44 border rounded-md object-contain"
                    >
                      <source
                        src={`${image_url}/${selectedReel.videoUrl}`}
                        type="video/mp4"
                      />
                    </video>
                  </div>
                )}

                {/* NEW VIDEO */}
                {videoFile && (
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-green-700 mb-1">
                      New Video (Will replace current)
                    </p>
                    <video
                      controls
                      className="w-full h-44 border rounded-md object-contain"
                    >
                      <source
                        src={URL.createObjectURL(videoFile)}
                        type={videoFile.type}
                      />
                    </video>
                  </div>
                )}

                <div
                  className="border-2 border-dashed border-gray-900 p-4 rounded-md text-center cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    document.getElementById("videoInput").click()
                  }
                >
                  <FontAwesomeIcon icon={faUpload} className="text-xl mb-1" />
                  <p className="font-semibold">Upload new video</p>
                  <p className="text-sm text-gray-500">
                    Leave empty to keep existing video
                  </p>
                  {videoFile && (
                    <p className="text-green-600 text-sm mt-1">
                      📹 {videoFile.name}
                    </p>
                  )}
                </div>

                <input
                  id="videoInput"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleVideoChange(e, setFieldValue)}
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 px-6 py-2 rounded-md"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#1d2532] text-white px-6 py-2 rounded-md disabled:opacity-50"
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
