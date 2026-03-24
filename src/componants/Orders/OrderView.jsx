import React from "react";
import { image_url } from "../../common/env";

const OrderView = ({ onClose, selectedOrder }) => {
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

  const address = selectedOrder.addressId || {};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
        <h3 className="text-lg font-bold text-center bg-[#1d2532] py-3 text-white">
          Order Details
        </h3>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 border-b pb-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-semibold">{selectedOrder._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-semibold">
                {formatDate(selectedOrder.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold">{selectedOrder.orderStatus}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-semibold">
                {selectedOrder.currency} {selectedOrder.amount}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-800 mb-2 underline">
                Customer Details
              </h4>
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                {selectedOrder.userId?.email || "-"}
              </p>
              <p>
                <span className="text-gray-500">Name:</span> {address.firstName}{" "}
                {address.lastName}
              </p>
              <p>
                <span className="text-gray-500">Contact:</span>{" "}
                {address.contactNumber}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2 underline">
                Shipping Address
              </h4>
              <p>
                {address.address}, {address.apartment}
              </p>
              <p>
                {address.city}, {address.state} - {address.pincode}
              </p>
              <p>{address.country}</p>
              <p>
                <span className="text-gray-500">Label:</span> {address.label}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-bold text-gray-800 mb-2 underline">
              Order Items
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          {item.productId?.imageUrl && (
                            <img
                              src={`${image_url}/>${item.productId.imageUrl[0]}`}
                              alt=""
                              className="w-10 h-10 object-cover rounded mr-2"
                            />
                          )}
                          <span className="text-sm">
                            {item.productId?.name || "Product Deleted"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center text-sm">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        {selectedOrder.currency} {item.price}
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        {selectedOrder.currency} {item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-4 py-2 text-right font-bold">
                      Total
                    </td>
                    <td className="px-4 py-2 text-right font-bold">
                      {selectedOrder.currency} {selectedOrder.amount}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order History */}
          {selectedOrder.history && selectedOrder.history.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 mb-2 underline">
                Order History
              </h4>
              <div className="space-y-2">
                {selectedOrder.history.map((h, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm border-l-2 border-blue-500 pl-2"
                  >
                    <span>
                      {h.status} - {h.note}
                    </span>
                    <span className="text-gray-500">
                      {formatDate(h.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
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
};

export default OrderView;
