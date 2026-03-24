import React, { useState, useEffect } from "react";
import { getAllReelsApi, deleteReelApi } from "../../common/services";
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

const Reels = () => {
  const [reelsData, setReelsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // modal states
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const message=useToast();

  const fetchReels = async () => {
    try {
      setLoading(true);
      const res = await getAllReelsApi();
      if (res.success) {
        setReelsData(res.data);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteReelApi(id);
      if (response.success) {
        message.success("Deleted Successfully");
      }
      fetchReels();
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const startIndex = (currentPage - 1) * pageSize;
  const currentReels = reelsData.slice(startIndex, startIndex + pageSize);

  if (loading) return <Load />;

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center w-full space-x-4">
        <h2 className="text-2xl font-bold text-black">Reels</h2>
        <button
          type="primary"
          className="px-4 py-2 rounded-md bg-[#1d2532] text-white hover:bg-gray-700"
          onClick={() => setAddModal(true)}
        >
          Add Reel
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
                Title
              </th>
          
              <th className="py-2 px-4 border-b text-center text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentReels.length > 0 ? (
              currentReels.map((item, index) => (
                <tr
                  key={item._id}
                  className={`hover:bg-gray-200 text-center transition duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-300"
                  }`}
                >
                  <td className="py-2 px-4 border-b">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="py-2 px-4 border-b">{item.title}</td>
                 
                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-center gap-3">
                      <button
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                        onClick={() => {
                          setSelectedReel(item);
                          setViewModal(true);
                        }}
                      >
                        <AiOutlineEye className="mr-1 text-xl" />
                      </button>

                      <button
                        className="text-green-500 hover:text-green-700 flex items-center"
                        onClick={() => {
                          setSelectedReel(item);
                          setEditModal(true);
                        }}
                      >
                        <CiEdit className="mr-1 text-xl" />
                      </button>

                      <button
                        className="text-red-500 hover:text-red-700 flex items-center"
                        onClick={() => {
                          setSelectedReel(item);
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
                  colSpan="5"
                  className="px-4 py-4 border-b text-center text-white font-bold"
                >
                  No reels found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {reelsData.length > 0 && (
          <div className="flex justify-end mt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={reelsData.length}
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
        <AddModal onClose={() => setAddModal(false)} fetchReels={fetchReels} />
      )}

      {viewModal && (
        <ViewModal
          onClose={() => setViewModal(false)}
          selectedReel={selectedReel}
        />
      )}

      {editModal && (
        <EditModal
          onClose={() => setEditModal(false)}
          selectedReel={selectedReel}
          fetchReels={fetchReels}
        />
      )}

      {deleteModal && (
        <DeleteModal
          onClose={() => setDeleteModal(false)}
          handleDelete={() => handleDelete(selectedReel._id)}
          title={"Are You Sure To Delete This Reel?"}
        />
      )}
    </div>
  );
};

export default Reels;
