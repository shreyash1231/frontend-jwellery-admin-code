import React from "react";
import { image_url } from "../../common/env";

function ViewModal({ onClose, selectedBanner }) {
  if (!selectedBanner) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] max-h-[700px] flex flex-col overflow-hidden">
        <h3 className="text-lg font-bold text-center bg-[#1d2532] py-3 text-white">
          Banner Details
        </h3>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image Preview */}
          <div className="flex flex-col items-center">
            <label className="block mb-2 font-semibold text-gray-800">
              Banner Image
            </label>
            <img
              src={`${image_url}/${selectedBanner.imageUrl}`}
              alt="Banner"
              className="w-full rounded-lg shadow-md border border-gray-300 object-cover"
              style={{ maxHeight: "400px" }}
            />
          </div>

          {/* Created Date */}
          {selectedBanner.createdAt && (
            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Created Date
              </label>
              <p className="border border-gray-300 p-3 rounded-md bg-gray-50 text-gray-700">
                {new Date(selectedBanner.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
            </div>
          )}

          {selectedBanner.updatedAt && (
            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Last Updated
              </label>
              <p className="border border-gray-300 p-3 rounded-md bg-gray-50 text-gray-700">
                {new Date(selectedBanner.updatedAt).toLocaleDateString(
                  "en-IN",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end p-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#1d2532] text-white w-40 py-2 px-4 rounded-md hover:bg-gray-800 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewModal;
