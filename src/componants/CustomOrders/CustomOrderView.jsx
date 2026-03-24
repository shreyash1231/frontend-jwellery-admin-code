import React from "react";

const CustomOrderView = ({ onClose, selectedOrder }) => {
  if (!selectedOrder) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        <h3 className="text-lg font-bold text-center bg-[#1d2532] py-3 text-white">
          Custom Order Details
        </h3>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 border-b pb-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-semibold">{selectedOrder._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created Date</p>
              <p className="font-semibold">{formatDate(selectedOrder.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold">{selectedOrder.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Type</p>
              <p className="font-semibold">{selectedOrder.type}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-gray-800 mb-2 underline">User Details</h4>
              {typeof selectedOrder.userId === "object" && selectedOrder.userId !== null ? (
                <>
                  <p><span className="text-gray-500">Name:</span> {selectedOrder.userId.name || "-"}</p>
                  <p><span className="text-gray-500">Email:</span> {selectedOrder.userId.email || "-"}</p>
                  <p><span className="text-gray-500">User ID:</span> {selectedOrder.userId._id || "-"}</p>
                </>
              ) : (
                <p><span className="text-gray-500">User ID:</span> {selectedOrder.userId || "-"}</p>
              )}
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2 underline">Booking Details</h4>
              <p><span className="text-gray-500">Target Date:</span> {formatDate(selectedOrder.date)}</p>
              <p><span className="text-gray-500">Address:</span> {selectedOrder.address}</p>
            </div>
          </div>
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
};

export default CustomOrderView;
