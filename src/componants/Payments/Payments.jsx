import React, { useState, useEffect } from "react";
import { getAllPaymentsApi } from "../../common/services";
import { AiOutlineEye } from "react-icons/ai";
import { Pagination, Input } from "antd";
import PaymentView from "./PaymentView";
import { errorResponseHandler } from "../../common/http";
import Load from "../Load/Load";

const Payments = () => {
  const [paymentsData, setPaymentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getAllPaymentsApi();
      if (res.success) {
        setPaymentsData(res.data || []);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments based on search query (by Payment ID, Order ID, or User Email)
  const filteredPayments = paymentsData.filter((payment) => {
    const query = searchQuery.toLowerCase();
    const paymentId = (payment._id || "").toLowerCase();
    const orderId = (payment.orderId?._id || "").toLowerCase();
    const email = (payment.userId?.email || "").toLowerCase();

    return (
      paymentId.includes(query) ||
      orderId.includes(query) ||
      email.includes(query)
    );
  });

  const startIndex = (currentPage - 1) * pageSize;
  const currentPayments = filteredPayments.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) return <Load />;

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-black">Payments</h2>
        <Input
          type="text"
          placeholder="Search by Payment ID, Order ID or Email..."
          value={searchQuery}
          onChange={handleSearch}
          className="border rounded px-3 py-2 w-96"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full mt-7 bg-[#1d2532] border border-b-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center text-white">S.No</th>
              <th className="py-2 px-4 border-b text-center text-white">
                Payment ID
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Order ID
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                User Email
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Amount
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Status
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Date
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentPayments.length > 0 ? (
              currentPayments.map((payment, index) => (
                <tr
                  key={payment._id}
                  className={`hover:bg-gray-200 text-center transition duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-300"
                  }`}
                >
                  <td className="py-2 px-4 border-b">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="py-2 px-4 border-b font-mono text-xs">
                    {payment._id}
                  </td>
                  <td className="py-2 px-4 border-b font-mono text-xs">
                    {payment.orderId?._id || "-"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {payment.userId?.email || "-"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {payment.orderId?.currency} {payment.orderId?.amount}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        payment.paymentStatus === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-sm">
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-center gap-3">
                      <button
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setViewModal(true);
                        }}
                        title="View Details"
                      >
                        <AiOutlineEye className="text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-4 border-b text-center text-white font-bold"
                >
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredPayments.length > 0 && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredPayments.length}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              showSizeChanger
              pageSizeOptions={["5", "10", "20", "50"]}
            />
          </div>
        )}
      </div>

      {viewModal && (
        <PaymentView
          onClose={() => setViewModal(false)}
          selectedPayment={selectedPayment}
        />
      )}
    </div>
  );
};

export default Payments;
