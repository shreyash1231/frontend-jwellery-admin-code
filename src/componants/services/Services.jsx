import React, { useState, useEffect } from "react";
import {
    getAllServiceApi,
    deleteServiceApi,
    addServiceApi,
    updateServiceApi,
} from "../../common/services";
import { AiOutlineEye } from "react-icons/ai";
import { CiEdit } from "react-icons/ci";
import { AiFillDelete } from "react-icons/ai";
import { message, Pagination } from "antd";
import EditModal from "./EditModal";
import DeleteModal from "../deleteModal/DeleteModal";
import AddModal from "./AddModal";
import ViewModal from "./ViewModal";
import { useToast } from "../toast/Toast";

const Services = () => {
    const [serviceData, setServiceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [addModal, setAddModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const message=useToast()

    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await getAllServiceApi();
            if (res.success) {
                setServiceData(res.data);
            }
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await deleteServiceApi(id);
            if (response.success) {
                message.success("Deleted Successfully");
            }
            fetchServices();
        } catch (err) {
        }
    };



    useEffect(() => {
        fetchServices();
    }, []);

    const startIndex = (currentPage - 1) * pageSize;
    const currentServices = serviceData.slice(
        startIndex,
        startIndex + pageSize
    );

    return (
        <div className="p-4 mt-16">
            <div className="flex justify-between items-center w-full space-x-4">
                <h2 className="text-2xl font-bold text-black">Services</h2>
                <button type="primary" className="px-4 py-2 rounded-md bg-[#1d2532] text-white hover:bg-gray-700" onClick={() => setAddModal(true)}>
                    Add Service
                </button>
            </div>

            <div>
                <table className="min-w-full mt-7 bg-[#1d2532] border border-b-4">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-center text-white">S.No</th>
                            <th className="py-2 px-4 border-b text-center text-white">Name</th>
                            <th className="py-2 px-4 border-b text-center text-white">Description</th>
                            <th className="py-2 px-4 border-b text-center text-white">Images</th>
                            <th className="py-2 px-4 border-b text-center text-white">Features</th>
                            <th className="py-2 px-4 border-b text-center text-white">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentServices.length > 0 ? (
                            currentServices.map((item, index) => (
                                <tr
                                    key={item._id}
                                    className={`hover:bg-gray-200 text-center transition duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-300"
                                        }`}
                                >
                                    <td className="py-2 px-4 border-b">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </td>
                                    <td className="py-2 px-4 border-b">{item.name}</td>
                                    <td className="py-2 px-4 border-b text-sm max-w-xs truncate">
                                        {item.description}
                                    </td>
                                    <td className="py-2 px-4 border-b">{item.images ? item.images.length : 0}</td>
                                    <td className="py-2 px-4 border-b">{item.features ? item.features.length : 0}</td>
                                    <td className="py-2 px-4 border-b">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                className="text-blue-500 hover:text-blue-700 flex items-center"
                                                onClick={() => {
                                                    setSelectedService(item);
                                                    setViewModal(true);
                                                }}
                                            >
                                                <AiOutlineEye className="mr-1 text-xl" />
                                            </button>

                                            <button
                                                className="text-green-500 hover:text-green-700 flex items-center"
                                                onClick={() => {
                                                    setSelectedService(item);
                                                    setEditModal(true);
                                                }}
                                            >
                                                <CiEdit className="mr-1 text-xl" />
                                            </button>

                                            <button
                                                className="text-red-500 hover:text-red-700 flex items-center"
                                                onClick={() => {
                                                    setSelectedService(item);
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
                                    colSpan="6"
                                    className="px-4 py-4 border-b text-center text-white font-bold"
                                >
                                    No services found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {serviceData.length > 0 && (
                    <div className="flex justify-center mt-4">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={serviceData.length}
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
                    fetchServices={fetchServices}
                />
            )}

            {editModal && (
                <EditModal
                    onClose={() => setEditModal(false)}
                    selectedService={selectedService}
                    fetchServices={fetchServices}
                />
            )}

            {viewModal && (
                <ViewModal
                    onClose={() => setViewModal(false)}
                    selectedService={selectedService}
                />
            )}

            {deleteModal && (
                <DeleteModal onClose={() => setDeleteModal(false)} handleDelete={() => handleDelete(selectedService.id)} title={"Are You Sure To Delete This Service?"} />
            )}
        </div>
    );
};

export default Services;