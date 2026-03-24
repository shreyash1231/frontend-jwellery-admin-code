import React, { useState, useEffect } from "react";
import { getAllCouponsApi, deleteCouponApi } from "../../common/services";
import { CiEdit } from "react-icons/ci";
import { AiFillDelete } from "react-icons/ai";
import { AiOutlineEye } from "react-icons/ai";
import { message, Pagination } from "antd";
import EditModal from "./EditModal";
import DeleteModal from "../deleteModal/DeleteModal";
import AddModal from "./AddModal";
import ViewModal from "./ViewModal";
import { errorResponseHandler } from "../../common/http";
import Load from "../Load/Load";
import { useToast } from "../toast/Toast";

const Coupons = () => {
  const [couponsData, setCouponsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // modal states
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const message=useToast()

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await getAllCouponsApi();
      if (res.success) {
        setCouponsData(res.data);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteCouponApi(id);
      if (response.success) {
        message.success("Coupon deleted successfully");
      }
      fetchCoupons();
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const startIndex = (currentPage - 1) * pageSize;
  const currentCoupons = couponsData.slice(startIndex, startIndex + pageSize);

  const formatDate = (dateString) => {
    if (!dateString) return "No expiry";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getStatusBadge = (item) => {
    // if (!item.isActive) {
    //   return (
    //     <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
    //       Inactive
    //     </span>
    //   );
    // }
    if (isExpired(item.expiresAt)) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
          Expired
        </span>
      );
    }
    if (item.usageLimit && item.usedCount >= item.usageLimit) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600">
          Limit Reached
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
        Active
      </span>
    );
  };

  const getDiscountDisplay = (item) => {
    if (item.type === "AMOUNT") {
      return `₹${item.value}`;
    }
    // PERCENT type
    if (item.maxDiscount) {
      return `${item.value}% (max ₹${item.maxDiscount})`;
    }
    return `${item.value}%`;
  };

  if (loading) return <Load />;

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center w-full space-x-4">
        <h2 className="text-2xl font-bold text-black">Coupons</h2>
        <button
          type="primary"
          className="px-4 py-2 rounded-md bg-[#1d2532] text-white hover:bg-gray-700"
          onClick={() => setAddModal(true)}
        >
          Add Coupon
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full mt-7 bg-[#1d2532] border border-b-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center text-white">
                S.No
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Code
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Type
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Discount
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Min Order
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Expires At
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Usage
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Per User
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Status
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentCoupons.length > 0 ? (
              currentCoupons.map((item, index) => (
                <tr
                  key={item._id || item.id}
                  className={`hover:bg-gray-200 text-center transition duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-300"
                  }`}
                >
                  <td className="py-2 px-4 border-b">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="py-2 px-4 border-b font-semibold">
                    {item.code}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.type === "PERCENT" ? "Percent" : "Amount"}
                  </td>
                  <td className="py-2 px-4 border-b font-semibold text-green-600">
                    {getDiscountDisplay(item)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.minOrderValue ? `₹${item.minOrderValue}` : "-"}
                  </td>
                  <td className={`py-2 px-4 border-b ${isExpired(item.expiresAt) ? "text-red-600" : ""}`}>
                    {formatDate(item.expiresAt)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.usedCount || 0} / {item.usageLimit || "∞"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {item.perUserLimit || 1}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {getStatusBadge(item)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-center gap-3">
                      <button
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                        onClick={() => {
                          setSelectedCoupon(item);
                          setViewModal(true);
                        }}
                      >
                        <AiOutlineEye className="mr-1 text-xl" />
                      </button>

                      <button
                        className="text-green-500 hover:text-green-700 flex items-center"
                        onClick={() => {
                          setSelectedCoupon(item);
                          setEditModal(true);
                        }}
                      >
                        <CiEdit className="mr-1 text-xl" />
                      </button>

                      <button
                        className="text-red-500 hover:text-red-700 flex items-center"
                        onClick={() => {
                          setSelectedCoupon(item);
                          setDeleteModal(true);
                        }}
                      >
                        <AiFillDelete className="mr-1 text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="py-4 text-center text-white font-bold"
                >
                  No coupons found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {couponsData.length > 0 && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={couponsData.length}
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

      {addModal && (
        <AddModal onClose={() => setAddModal(false)} fetchCoupons={fetchCoupons} />
      )}

      {viewModal && (
        <ViewModal
          onClose={() => setViewModal(false)}
          selectedCoupon={selectedCoupon}
        />
      )}

      {editModal && (
        <EditModal
          onClose={() => setEditModal(false)}
          selectedCoupon={selectedCoupon}
          fetchCoupons={fetchCoupons}
        />
      )}

      {deleteModal && (
        <DeleteModal
          onClose={() => setDeleteModal(false)}
          handleDelete={() => handleDelete(selectedCoupon._id || selectedCoupon.id)}
          title={"Are You Sure To Delete This Coupon?"}
        />
      )}
    </div>
  );
};

export default Coupons;
