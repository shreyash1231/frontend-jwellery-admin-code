import React from "react";

const PaymentView = ({ onClose, selectedPayment }) => {
  if (!selectedPayment) return null;

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

  const order = selectedPayment.orderId || {};
  const user = selectedPayment.userId || {};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
        <h3 className="text-lg font-bold text-center bg-[#1d2532] py-3 text-white">
          Payment Details
        </h3>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-4 border-b pb-4">
            <div>
              <p className="text-sm text-gray-500">Payment ID</p>
              <p className="font-semibold">{selectedPayment._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Date</p>
              <p className="font-semibold">{formatDate(selectedPayment.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className={`font-semibold ${selectedPayment.paymentStatus === 'SUCCESS' ? 'text-green-600' : 'text-orange-600'}`}>
                {selectedPayment.paymentStatus}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Provider</p>
              <p className="font-semibold">{selectedPayment.provider}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Razorpay Order ID</p>
              <p className="font-semibold">{selectedPayment.razorpayOrderId || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-semibold">{order.currency} {order.amount}</p>
            </div>
          </div>

          {/* User & Order Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-800 mb-2 underline">User Details</h4>
              <p><span className="text-gray-500">Email:</span> {user.email || "-"}</p>
              <p><span className="text-gray-500">User ID:</span> {user._id || "-"}</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2 underline">Order Details</h4>
              <p><span className="text-gray-500">Order ID:</span> {order._id || "-"}</p>
              <p><span className="text-gray-500">Status:</span> {order.orderStatus || "-"}</p>
              <p><span className="text-gray-500">Items Count:</span> {order.items?.length || 0}</p>
            </div>
          </div>

          {/* Order Items Summary */}
          {order.items && order.items.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 mb-2 underline">Items Summary</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product ID</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{item.productId}</td>
                        <td className="px-4 py-2 text-center text-sm">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-sm">{order.currency} {item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default PaymentView;
