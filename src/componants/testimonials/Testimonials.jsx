import React, { useState, useEffect } from "react";
import {
    getAllTestimonialsApi,
    deleteTestimonialApi,
} from "../../common/services";
import { AiOutlineEye } from "react-icons/ai";
import { CiEdit } from "react-icons/ci";
import { AiFillDelete } from "react-icons/ai";
import { message, Pagination, Modal, Button, Form, Input } from "antd";
import EditModal from "./EditModal";
import DeleteModal from "../deleteModal/DeleteModal";
import AddModal from "./AddModal";
import { errorResponseHandler } from "../../common/http";

const Testimonials = () => {
    const [testimonialData, setTestimonialData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // modal states
    const [viewModal, setViewModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [addModal, setAddModal] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);

    const [form] = Form.useForm();

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const res = await getAllTestimonialsApi();
            if (res.success) {
                setTestimonialData(res.data);
            }
        } catch (err) {
            errorResponseHandler(err)
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await deleteTestimonialApi(id);
            if (response.success) {
                message.success("Deleted Successfully");
            }
            fetchTestimonials();
        } catch (err) {
            errorResponseHandler(err)
        }
    };

   
    useEffect(() => {
        fetchTestimonials();
    }, []);

    const startIndex = (currentPage - 1) * pageSize;
    const currentTestimonials = testimonialData.slice(
        startIndex,
        startIndex + pageSize
    );

    return (
        <div className="p-4 mt-16">
            <div className="flex justify-between items-center w-full space-x-4">
                <h2 className="text-2xl font-bold text-black">Testimonials</h2>
                <button type="primary" className="px-4 py-2 rounded-md bg-[#1d2532] text-white hover:bg-gray-700" onClick={() => setAddModal(true)}>
                    Add Testimonial
                </button>
            </div>

            <div>
                <table className="min-w-full mt-7 bg-[#1d2532] border border-b-4">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-center text-white">S.No</th>
                            <th className="py-2 px-4 border-b text-center text-white">Image</th>
                            <th className="py-2 px-4 border-b text-center text-white">Name</th>
                            <th className="py-2 px-4 border-b text-center text-white">Country</th>
                            <th className="py-2 px-4 border-b text-center text-white">Message</th>
                            <th className="py-2 px-4 border-b text-center text-white">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTestimonials.length > 0 ? (
                            currentTestimonials.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className={`hover:bg-gray-200 text-center transition duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-300"
                                        }`}
                                >
                                    <td className="py-2 px-4 border-b">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-10 h-10 rounded-full border object-cover mx-auto"
                                        />
                                    </td>
                                    <td className="py-2 px-4 border-b">{item.name}</td>
                                    <td className="py-2 px-4 border-b">{item.country}</td>
                                    <td className="py-2 px-4 border-b text-sm max-w-xs truncate">
                                        {item.message}
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        <div className="flex justify-center gap-3">


                                            <button
                                                className="text-green-500 hover:text-green-700 flex items-center"
                                                onClick={() => {
                                                    setSelectedTestimonial(item);
                                                    setEditModal(true);
                                                }}
                                            >
                                                <CiEdit className="mr-1 text-xl" />
                                            </button>

                                            <button
                                                className="text-red-500 hover:text-red-700 flex items-center"
                                                onClick={() => {
                                                    setSelectedTestimonial(item);
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
                                    No testimonials found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {testimonialData.length > 0 && (
                    <div className="flex justify-center mt-4">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={testimonialData.length}
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
                    fetchTestimonials={fetchTestimonials}
                />
            )}

            {editModal && (
                <EditModal
                    onClose={() => setEditModal(false)}
                    selectedTestimonial={selectedTestimonial}
                    fetchTestimonials={fetchTestimonials}
                />
            )}

            {deleteModal && (

                <DeleteModal onClose={() => setDeleteModal(false)} handleDelete={() => handleDelete(selectedTestimonial.id)} title={"Are You Sure To Delete This Testimonial?"} />
            )
            }


        </div>
    );
};

export default Testimonials;
