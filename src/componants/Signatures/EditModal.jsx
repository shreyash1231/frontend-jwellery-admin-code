import React, { useState } from "react";
import { updateSignatureApi } from "../../common/services";
import defaultImage from "../../Images/noProfile.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { errorResponseHandler } from "../../common/http";
import { message } from "antd";
import { image_url } from "../../common/env";

function EditModal({ onClose, fetchSignatures, selectedSignature }) {
  const [preview, setPreview] = useState(selectedSignature?.imageUrl || null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (file) formData.append("image", file);

      const res = await updateSignatureApi(selectedSignature._id, formData);
      if (res.success) {
        message.success("Signature updated successfully!");
        fetchSignatures();
        setPreview(null);
        setFile(null);
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
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[500px] max-h-[550px] flex flex-col">
        <h3 className="text-lg font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
          Edit Signature
        </h3>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={`${image_url}/${preview || defaultImage}`}
                alt="Preview"
                className="border border-gray-800 w-48 h-48 object-contain rounded"
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
                onChange={handleImageChange}
                className="hidden"
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
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="text-white py-2 px-4 rounded-md w-52 bg-[#1d2532] hover:bg-gray-800 transition duration-200 disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
