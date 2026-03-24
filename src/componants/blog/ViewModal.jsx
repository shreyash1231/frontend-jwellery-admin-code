import React from "react";
import { image_url } from "../../common/env";

const ViewModal = ({ setShowView, data }) => {
  const handleClose = () => {
    setShowView(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[900px] h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
          View Blog
        </h3>
        <div className="p-8">
          <div className="w-full mb-6">
            <label className="block mb-2 text-xl font-bold">Title</label>
            <p className="border border-gray-900 p-2 w-full bg-gray-100">
              {data?.title}
            </p>
          </div>

          <div className="w-full mb-6">
            <label className="block mb-2 text-xl font-bold">Content</label>
            <div
              className="border border-gray-900 p-2 w-full bg-gray-100"
              dangerouslySetInnerHTML={{ __html: data?.content }}
            />
          </div>

          <div className="w-full mb-6">
            <label className="block mb-2 text-xl font-bold">Image</label>
            {data?.imageUrl ? (
              <img
                src={`${image_url}/${data.imageUrl}`}
                alt="Blog"
                className="w-64 h-64 object-cover border"
              />
            ) : (
              <p>No image available</p>
            )}
          </div>

          <div className="flex justify-end gap-6 mt-6">
            <button
              onClick={handleClose}
              className="bg-gray-300 text-black w-52 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
