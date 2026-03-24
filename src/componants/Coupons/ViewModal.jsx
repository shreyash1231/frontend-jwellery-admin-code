import React from "react";

function ViewModal({ onClose, selectedCoupon }) {
  if (!selectedCoupon) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getStatus = () => {
    // if (!selectedCoupon.isActive) {
    //   return { text: "Inactive", color: "text-gray-600", bg: "bg-gray-100" };
    // }
    if (isExpired(selectedCoupon.expiresAt)) {
      return { text: "Expired", color: "text-red-600", bg: "bg-red-50" };
    }
    if (selectedCoupon.usageLimit && selectedCoupon.usedCount >= selectedCoupon.usageLimit) {
      return { text: "Limit Reached", color: "text-orange-600", bg: "bg-orange-50" };
    }
    return { text: "Active", color: "text-green-600", bg: "bg-green-50" };
  };

  const status = getStatus();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        <h3 className="text-lg font-bold text-center bg-[#1d2532] py-3 text-white">
          Coupon Details
        </h3>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Coupon Code */}
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Coupon Code
            </label>
            <p className="border border-gray-300 p-3 rounded-md bg-gray-50 text-gray-700 text-lg font-bold">
              {selectedCoupon.code}
            </p>
          </div>

          {/* Type */}
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Discount Type
            </label>
            <p className="border border-gray-300 p-3 rounded-md bg-gray-50 text-gray-700">
              {selectedCoupon.type === "PERCENT" ? "Percentage" : "Fixed Amount"}
            </p>
          </div>

          {/* Value */}
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Discount Value
            </label>
            <p className="border border-gray-300 p-3 rounded-md bg-gray-50 text-gray-700 text-lg font-semibold text-green-600">
              {selectedCoupon.type === "AMOUNT"
                ? `₹${selectedCoupon.value}`
                : `${selectedCoupon.value}%`}
            </p>
          </div>

          {/* Max Discount - Only for PERCENT type */}
          {selectedCoupon.type === "PERCENT" && (
            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Maximum Discount Cap
              </label>
              <p className="border border-gray-300 p-3 rounded-md bg-gray-50 text-gray-700">
                {selectedCoupon.maxDiscount
                  ? `₹${selectedCoupon.maxDiscount}`
                  : "No limit"}
              </p>
            </div>
          )}

          {/* Minimum Order Value */}
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Minimum Order Value
            </label>
            <p className="border border-gray-300 p-3 rounded-md bg-gray-50 text-gray-700">
              {selectedCoupon.minOrderValue
                ? `₹${selectedCoupon.minOrderValue}`
                : "No minimum"}
            </p>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Expires At
            </label>
            <p className={`border border-gray-300 p-3 rounded-md bg-gray-50 ${
              isExpired(selectedCoupon.expiresAt) ? "text-red-600" : "text-gray-700"
            }`}>
              {selectedCoupon.expiresAt ? formatDate(selectedCoupon.expiresAt) : "No expiry"}
            </p>
          </div>

          {/* Usage Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Total Usage Limit
              </label>
              <p className="border border-gray-300 p-3 rounded-md bg-gray-50 text-gray-700">
                {selectedCoupon.usageLimit || "Unlimited"}
              </p>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Times Used
              </label>
              <p className="border border-gray-300 p-3 rounded-md bg-gray-50 text-gray-700 font-semibold">
                {selectedCoupon.usedCount || 0}
              </p>
            </div>
          </div>

          {/* Per User Limit */}
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Per User Limit
            </label>
            <p className="border border-gray-300 p-3 rounded-md bg-gray-50 text-gray-700">
              {selectedCoupon.perUserLimit || 1} time(s) per user
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Status
            </label>
            <p
              className={`border border-gray-300 p-3 rounded-md font-semibold ${status.color} ${status.bg}`}
            >
              {status.text}
            </p>
          </div>

          {/* Active Toggle Status */}
          {/* <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Coupon Enabled
            </label>
            <p className={`border border-gray-300 p-3 rounded-md ${
              selectedCoupon.isActive 
                ? "text-green-600 bg-green-50" 
                : "text-gray-600 bg-gray-100"
            }`}>
              {selectedCoupon.isActive ? "Yes" : "No"}
            </p>
          </div> */}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            {selectedCoupon.createdAt && (
              <div>
                <label className="block mb-2 font-semibold text-gray-800">
                  Created At
                </label>
                <p className="border border-gray-300 p-3 rounded-md bg-gray-50 text-gray-700 text-sm">
                  {formatDate(selectedCoupon.createdAt)}
                </p>
              </div>
            )}
            {selectedCoupon.updatedAt && (
              <div>
                <label className="block mb-2 font-semibold text-gray-800">
                  Last Updated
                </label>
                <p className="border border-gray-300 p-3 rounded-md bg-gray-50 text-gray-700 text-sm">
                  {formatDate(selectedCoupon.updatedAt)}
                </p>
              </div>
            )}
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
}

export default ViewModal;
