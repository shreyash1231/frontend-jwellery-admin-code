import React, { useState } from "react";
import { addServiceApi } from "../../common/services";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import { errorResponseHandler } from "../../common/http";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    features: Yup.string().required("Features are required"),
});

function AddModal({ onClose, fetchServices }) {
    const [previews, setPreviews] = useState([]);
    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [previewModal, setPreviewModal] = useState({ open: false, src: '', title: '' });

    const handleImageChange = (e, setFieldValue) => {
        const selectedFiles = Array.from(e.target.files);
        const newPreviews = [];
        const newFiles = [];

        selectedFiles.forEach((file) => {
            if (file) {
                newFiles.push(file);
                newPreviews.push(URL.createObjectURL(file));
            }
        });

        setFiles([...files, ...newFiles]);
        setPreviews([...previews, ...newPreviews]);
        setFieldValue("files", [...files, ...newFiles]);
    };

    const removeImage = (index, setFieldValue) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setFiles(newFiles);
        setPreviews(newPreviews);
        setFieldValue("files", newFiles);
    };

    const openPreview = (src, title) => {
        setPreviewModal({ open: true, src, title });
    };

    const closePreview = () => {
        setPreviewModal({ open: false, src: '', title: '' });
    };

    const handleSubmit = async (values, { resetForm }) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description);

            const features = values.features ? values.features.split(',').map(f => f.trim()).filter(f => f) : [];
            features.forEach(feature => formData.append('features', feature));

            files.forEach(file => formData.append('images', file));

            const res = await addServiceApi(formData);
            if (res.success) {
                fetchServices();
                resetForm();
                setPreviews([]);
                setFiles([]);
                onClose();
            }
        } catch (err) {
            errorResponseHandler(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2">
                <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] max-h-[80vh] flex flex-col">
                    <h3 className="text-lg font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
                        Add Service
                    </h3>
                    <Formik
                        initialValues={{ name: "", description: "", features: "", files: [] }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ setFieldValue }) => (
                            <Form className="flex-1 overflow-y-auto p-6">

                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block mb-1">Name</label>
                                        <Field
                                            type="text"
                                            name="name"
                                            className="border border-gray-900 p-2 w-full"
                                            placeholder="Enter service name"
                                        />
                                        <ErrorMessage
                                            name="name"
                                            component="div"
                                            className="text-red-500 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1">Description</label>
                                        <Field
                                            as="textarea"
                                            name="description"
                                            className="border border-gray-900 p-2 w-full"
                                            rows={4}
                                            placeholder="Enter service description"
                                        />
                                        <ErrorMessage
                                            name="description"
                                            component="div"
                                            className="text-red-500 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1">Features (comma separated)</label>
                                        <Field
                                            as="textarea"
                                            name="features"
                                            className="border border-gray-900 p-2 w-full"
                                            rows={3}
                                            placeholder="Enter features separated by commas"
                                        />
                                        <ErrorMessage
                                            name="features"
                                            component="div"
                                            className="text-red-500 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block mb-2">Images (Multiple)</label>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => handleImageChange(e, setFieldValue)}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        className="bg-[#1d2532] text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
                                        onClick={() => document.getElementById("fileInput").click()}
                                    >
                                        Select Images
                                    </button>

                                    {previews.length > 0 && (
                                        <div className="grid grid-cols-3 gap-4 mt-4">
                                            {previews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-md border"
                                                    />
                                                    <div className="absolute top-1 right-1 flex gap-1">
                                                        <button
                                                            type="button"
                                                            className="bg-white bg-opacity-75 p-1 rounded"
                                                            onClick={() => openPreview(preview, `Image ${index + 1}`)}
                                                        >
                                                            <FontAwesomeIcon icon={faEye} className="text-black text-xs" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="bg-red-500 bg-opacity-75 p-1 rounded"
                                                            onClick={() => removeImage(index, setFieldValue)}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="text-white text-xs" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>


                                <div className="flex justify-end p-4 border-t gap-6 mt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="bg-gray-300 text-black w-52 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="text-white py-2 px-4 rounded-md w-52 bg-[#1d2532] transition duration-200"
                                    >
                                        {submitting ? "Adding..." : "Add Service"}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>

            {previewModal.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 p-2">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-[500px] max-h-[500px] flex flex-col">
                        <h3 className="text-lg font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
                            {previewModal.title}
                        </h3>
                        <div className="flex-1 flex items-center justify-center p-4">
                            <img src={previewModal.src} alt={previewModal.title} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="flex justify-end p-4 border-t">
                            <button
                                onClick={closePreview}
                                className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AddModal;