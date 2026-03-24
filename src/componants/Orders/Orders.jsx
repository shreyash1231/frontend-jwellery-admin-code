import React, { useState, useEffect } from "react";
import { getAllOrdersApi, updateOrderApi } from "../../common/services";
import { AiOutlineEye } from "react-icons/ai";
import { message, Pagination, Input, Select } from "antd";
import OrderView from "./OrderView";
import { errorResponseHandler } from "../../common/http";
import Load from "../Load/Load";
import { useToast } from "../toast/Toast";

const { Option } = Select;

const Orders = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const message=useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrdersApi();
      if (res.success) {
        setOrdersData(res.data || []);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await updateOrderApi(orderId, { orderStatus: newStatus });
      if (res.success) {
        message.success("Order status updated successfully");
        fetchOrders();
      }
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  // Filter orders based on search query (by Order ID or Customer Email)
  const filteredOrders = ordersData.filter((order) => {
    const query = searchQuery.toLowerCase();
    const orderId = (order._id || "").toLowerCase();
    const email = (order.userId?.email || "").toLowerCase();

    return orderId.includes(query) || email.includes(query);
  });

  const startIndex = (currentPage - 1) * pageSize;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) return <Load />;

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center w-full space-x-4 mb-6">
        <h2 className="text-2xl font-bold text-black">Orders</h2>
        <Input
          type="text"
          placeholder="Search by Order ID or Email..."
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
              <th className="py-2 px-4 border-b text-center text-white">Order ID</th>
              <th className="py-2 px-4 border-b text-center text-white">Customer Email</th>
              <th className="py-2 px-4 border-b text-center text-white">Amount</th>
              <th className="py-2 px-4 border-b text-center text-white">Status</th>
              <th className="py-2 px-4 border-b text-center text-white">Date</th>
              <th className="py-2 px-4 border-b text-center text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order, index) => (
                <tr
                  key={order._id}
                  className={`hover:bg-gray-200 text-center transition duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-300"
                  }`}
                >
                  <td className="py-2 px-4 border-b">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="py-2 px-4 border-b font-mono text-xs">
                    {order._id}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {order.userId?.email || "-"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {order.currency} {order.amount}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <Select
                      value={order.orderStatus}
                      onChange={(value) => handleStatusChange(order._id, value)}
                      className="w-32"
                    >
                      <Option value="PLACED">PLACED</Option>
                      <Option value="CONFIRMED">CONFIRMED</Option>
                      <Option value="SHIPPED">SHIPPED</Option>
                      <Option value="DELIVERED">DELIVERED</Option>
                      <Option value="CANCELLED">CANCELLED</Option>
                    </Select>
                  </td>
                  <td className="py-2 px-4 border-b text-sm">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-center gap-3">
                      <button
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                        onClick={() => {
                          setSelectedOrder(order);
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
                  colSpan="7"
                  className="px-4 py-4 border-b text-center text-white font-bold"
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredOrders.length > 0 && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredOrders.length}
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
        <OrderView
          onClose={() => setViewModal(false)}
          selectedOrder={selectedOrder}
        />
      )}
    </div>
  );
};

export default Orders;
