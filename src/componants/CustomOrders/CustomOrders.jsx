import React, { useEffect, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { Input, Pagination, Select} from "antd";

import { customOrderApi, updateCustomOrderStatusApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import CustomOrderView from "./CustomOrderView";
import Load from "../Load/Load";
import { useToast } from "../toast/Toast";

const { Option } = Select;

const CustomOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const message=useToast()

  /* ---------- FETCH ORDERS ---------- */
  const fetchOrders = async (page = 1, limit = 10) => {
    try {
      setLoading(true);

      const res = await customOrderApi({ page, limit });

      if (res?.success) {
        setOrders(res.data.data || []);
        setPagination(res.data.pagination || { page, limit, total: 0 });
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  /* ---------- STATUS UPDATE ---------- */
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await updateCustomOrderStatusApi(orderId, { status: newStatus });
      if (res.success) {
        message.success("Order status updated successfully");
        fetchOrders(pagination.page, pagination.limit);
      }
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  /* ---------- SEARCH ---------- */
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order._id.toLowerCase().includes(q) ||
      order.type.toLowerCase().includes(q) ||
      order.address.toLowerCase().includes(q)
    );
  });

  if (loading) return <Load />;

  return (
    <div className="p-4 mt-16">
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Custom Orders</h2>

        <Input
          placeholder="Search by Order ID, Type or Address"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="w-96"
        />
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#1d2532] border">
          <thead>
            <tr>
              {[
                "S.No",
                "Order ID",
                "Type",
                "Address",
                "Date",
                "Status",
                "Action",
              ].map((head) => (
                <th
                  key={head}
                  className="py-2 px-4 border-b text-center text-white"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <tr
                  key={order._id}
                  className={`text-center ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-300"
                  }`}
                >
                  <td className="py-2 px-4 border-b">
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </td>

                  <td className="py-2 px-4 border-b font-mono text-xs">
                    {order._id}
                  </td>

                  <td className="py-2 px-4 border-b font-semibold">
                    {order.type}
                  </td>

                  <td className="py-2 px-4 border-b text-sm">
                    {order.address}
                  </td>

                  <td className="py-2 px-4 border-b text-sm">
                    {order.date
                      ? new Date(order.date).toLocaleDateString("en-IN")
                      : "-"}
                  </td>

                  <td className="py-2 px-4 border-b">
                    <Select
                      value={order.status}
                      onChange={(value) =>
                        handleStatusChange(order._id, value)
                      }
                      className="w-32"
                    >
                      {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
                        (status) => (
                          <Option key={status} value={status}>
                            {status}
                          </Option>
                        )
                      )}
                    </Select>
                  </td>

                  <td className="py-2 px-4 border-b">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => {
                        setSelectedOrder(order);
                        setViewModal(true);
                      }}
                    >
                      <AiOutlineEye className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-4 text-center text-white font-bold"
                >
                  No custom orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ---------- PAGINATION ---------- */}
        <div className="flex justify-center mt-4">
          <Pagination
            current={pagination.page}
            pageSize={pagination.limit}
            total={pagination.total}
            showSizeChanger
            pageSizeOptions={["5", "10", "20", "50"]}
            onChange={(page, limit) =>
              setPagination({ ...pagination, page, limit })
            }
          />
        </div>
      </div>

      {/* ---------- VIEW MODAL ---------- */}
      {viewModal && (
        <CustomOrderView
          selectedOrder={selectedOrder}
          onClose={() => setViewModal(false)}
        />
      )}
    </div>
  );
};

export default CustomOrders;
