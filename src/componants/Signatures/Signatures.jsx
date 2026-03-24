import React, { useState, useEffect } from "react";
import { getAllSignatureApi, deleteSignatureApi } from "../../common/services";
import { CiEdit } from "react-icons/ci";
import { AiFillDelete } from "react-icons/ai";
import { AiOutlineEye } from "react-icons/ai";
import { message, Pagination } from "antd";
import EditModal from "./EditModal";
import DeleteModal from "../deleteModal/DeleteModal";
import AddModal from "./AddModal";
import ViewModal from "./ViewModal";
import { errorResponseHandler } from "../../common/http";
import { image_url } from "../../common/env";

const Signatures = () => {
  const [signaturesData, setSignaturesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // modal states
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState(null);

  const fetchSignatures = async () => {
    try {
      setLoading(true);
      const res = await getAllSignatureApi();
      if (res.success) {
        setSignaturesData(res.data);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteSignatureApi(id);
      if (response.success) {
        message.success("Deleted Successfully");
      }
      fetchSignatures();
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  const startIndex = (currentPage - 1) * pageSize;
  const currentSignatures = signaturesData.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center w-full space-x-4">
        <h2 className="text-2xl font-bold text-black">Signatures</h2>
        <button
          type="primary"
          className="px-4 py-2 rounded-md bg-[#1d2532] text-white hover:bg-gray-700"
          onClick={() => setAddModal(true)}
        >
          Add Signature
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentSignatures.length > 0 ? (
              currentSignatures.map((item, index) => (
                <tr
                  key={item._id}
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
                      alt="Signature"
                      className="w-16 h-16 rounded border object-cover mx-auto"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-center gap-3">
                      {/* <button
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                        onClick={() => {
                          setSelectedSignature(item);
                          setViewModal(true);
                        }}
                      >
                        <AiOutlineEye className="mr-1 text-xl" />
                      </button> */}

                      <button
                        className="text-green-500 hover:text-green-700 flex items-center"
                        onClick={() => {
                          setSelectedSignature(item);
                          setEditModal(true);
                        }}
                      >
                        <CiEdit className="mr-1 text-xl" />
                      </button>

                      <button
                        className="text-red-500 hover:text-red-700 flex items-center"
                        onClick={() => {
                          setSelectedSignature(item);
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
                  colSpan="3"
                  className="px-4 py-4 border-b text-center text-white font-bold"
                >
                  No signatures found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {signaturesData.length > 0 && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={signaturesData.length}
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
          fetchSignatures={fetchSignatures}
        />
      )}

      {viewModal && (
        <ViewModal
          onClose={() => setViewModal(false)}
          selectedSignature={selectedSignature}
        />
      )}

      {editModal && (
        <EditModal
          onClose={() => setEditModal(false)}
          selectedSignature={selectedSignature}
          fetchSignatures={fetchSignatures}
        />
      )}

      {deleteModal && (
        <DeleteModal
          onClose={() => setDeleteModal(false)}
          handleDelete={() => handleDelete(selectedSignature._id)}
          title={"Are You Sure To Delete This Signature?"}
        />
      )}
    </div>
  );
};

export default Signatures;
