import React from "react";
import { image_url } from "../../common/env";

function ViewModal({ onClose, selectedService }) {
    if (!selectedService) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-[700px] max-h-[90vh] flex flex-col">
                <h3 className="text-lg font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
                    View Service
                </h3>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block mb-1 font-semibold">Name</label>
                            <p className="border border-gray-300 p-2 w-full bg-gray-50">{selectedService.name}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-semibold">Description</label>
                            <p className="border border-gray-300 p-2 w-full bg-gray-50 min-h-[100px] whitespace-pre-wrap">{selectedService.description}</p>
                        </div>

                        <div>
                            <label className="block mb-1 font-semibold">Features</label>
                            <ul className="border border-gray-300 p-2 w-full bg-gray-50 min-h-[60px]">
                                {selectedService.features && selectedService.features.length > 0 ? (
                                    selectedService.features.map((feature, index) => (
                                        <li key={index} className="list-disc list-inside">{feature}</li>
                                    ))
                                ) : (
                                    <li className="text-gray-500">No features available</li>
                                )}
                            </ul>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold">Images ({selectedService.images ? selectedService.images.length : 0})</label>
                            {selectedService.images && selectedService.images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {selectedService.images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={`${image_url}/${image}`}
                                                alt={`Service Image ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-md border"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="border border-gray-300 p-2 w-full bg-gray-50 text-gray-500">No images available</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 font-semibold">Created At</label>
                                <p className="border border-gray-300 p-2 w-full bg-gray-50">
                                    {new Date(selectedService.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold">Updated At</label>
                                <p className="border border-gray-300 p-2 w-full bg-gray-50">
                                    {new Date(selectedService.updatedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end p-4 border-t gap-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-300 text-black w-52 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ViewModal;