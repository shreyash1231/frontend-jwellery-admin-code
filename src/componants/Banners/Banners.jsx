import React, { useState, useEffect } from "react";
import { getAllBannersApi, deleteBannerApi } from "../../common/services";
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
import { image_url } from "../../common/env";

const Banners = () => {
  const [bannersData, setBannersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // modal states
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const message = useToast();

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await getAllBannersApi();
      if (res.success) {
        setBannersData(res.data);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteBannerApi(id);

      if (response.success) {
        message.success("Banner deleted successfully");

        // remove banner from UI immediately
        setBannersData((prev) => prev.filter((item) => item.id !== id));

        // close modal & clear selection
        setDeleteModal(false);
        setSelectedBanner(null);
      }
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const startIndex = (currentPage - 1) * pageSize;
  const currentBanners = bannersData.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return <Load />;
  }

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center w-full space-x-4">
        <h2 className="text-2xl font-bold text-black">Banners</h2>
        <button
          type="button"
          className="
    px-4 py-2 rounded-md 
    bg-[#1d2532] text-white 
    hover:bg-gray-700
    transition-opacity duration-300
    disabled:opacity-40
    disabled:cursor-not-allowed
    disabled:hover:bg-[#1d2532]
  "
          onClick={() => setAddModal(true)}
          disabled={currentBanners.length >= 1}
        >
          Add Banner
        </button>
      </div>

      <div>
        <table className="min-w-full mt-7 bg-[#1d2532] border border-b-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center text-white">
                S.No
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Image
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Created At
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-4 border-b text-center text-white font-bold"
                >
                  Loading...
                </td>
              </tr>
            ) : currentBanners.length > 0 ? (
              currentBanners.map((item, index) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-200 text-center transition duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-300"
                  }`}
                >
                  <td className="py-2 px-4 border-b">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <img
                      src={`${image_url}/${item.imageUrl}`}
                      alt="Banner"
                      className="w-20 h-20 object-cover rounded-md mx-auto"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-center gap-3">
                      {/* <button
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                        onClick={() => {
                          setSelectedBanner(item);
                          setViewModal(true);
                        }}
                      >
                        <AiOutlineEye className="mr-1 text-xl" />
                      </button> */}

                      <button
                        className="text-green-500 hover:text-green-700 flex items-center"
                        onClick={() => {
                          setSelectedBanner(item);
                          setEditModal(true);
                        }}
                      >
                        <CiEdit className="mr-1 text-xl" />
                      </button>

                      <button
                        className="text-red-500 hover:text-red-700 flex items-center"
                        onClick={() => {
                          setSelectedBanner(item);
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
                  colSpan="4"
                  className="px-4 py-4 border-b text-center text-white font-bold"
                >
                  No banners found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {bannersData.length > 0 && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={bannersData.length}
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
        <AddModal
          onClose={() => setAddModal(false)}
          fetchBanners={fetchBanners}
        />
      )}

      {viewModal && (
        <ViewModal
          onClose={() => setViewModal(false)}
          selectedBanner={selectedBanner}
        />
      )}

      {editModal && (
        <EditModal
          onClose={() => setEditModal(false)}
          selectedBanner={selectedBanner}
          fetchBanners={fetchBanners}
        />
      )}

      {deleteModal && (
        <DeleteModal
          onClose={() => setDeleteModal(false)}
          handleDelete={() => handleDelete(selectedBanner.id)}
          title={"Are You Sure To Delete This Banner?"}
        />
      )}
    </div>
  );
};

export default Banners;
