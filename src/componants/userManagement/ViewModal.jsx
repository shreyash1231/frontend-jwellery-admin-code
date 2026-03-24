import React, { useEffect, useState } from "react";
import noProfile from "../../Images/noProfile.jpg";
import { image_url } from "../../common/env";

const ViewAdmin = ({ showViewAdmin, setShowViewAdmin, selectedAdmin }) => {
  const [open, setOpen] = useState(showViewAdmin);

  const closeViewModal = () => {
    setOpen(false);
    setShowViewAdmin(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 9999999 }}
    >
      <div className="bg-white rounded-lg shadow-lg w-[700px] h-[600px] flex flex-col">
        {/* Header */}
        <h3 className="text-xl font-bold text-center bg-[#1d2532] py-2 text-white rounded-t-2xl">
          View Details
        </h3>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-col items-center">
            <img
              src={
                selectedAdmin.profile_image &&
                selectedAdmin.profile_image !== ""
                  ? selectedAdmin.profile_image.startsWith("http")
                    ? selectedAdmin.profile_image
                    : `${image_url}/${selectedAdmin.profile_image}`
                  : noProfile
              }
              alt="Profile"
              className="border border-gray-800 w-32 h-32 object-contain rounded-full"
            />

            <div className="mt-4 w-full">
              <label className="font-semibold">Name</label>
              <input
                type="text"
                value={selectedAdmin.user_name || ""}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="font-semibold">Email</label>
              <input
                type="email"
                value={selectedAdmin.email || ""}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Gender</label>
              <input
                type="text"
                value={selectedAdmin.gender || ""}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="font-semibold">Mobile</label>
              <input
                type="text"
                value={selectedAdmin.mobile || ""}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="font-semibold">Status</label>
              <input
                type="text"
                value={selectedAdmin.is_active ? "Active" : "Inactive"}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>

            <div className="col-span-2">
              <label className="font-semibold">Address</label>
              <textarea
                value={selectedAdmin.current_address || ""}
                rows={3}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={closeViewModal}
            className="bg-gray-300 text-black w-52 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAdmin;
