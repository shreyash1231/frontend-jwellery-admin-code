import React,{useState} from 'react';
import { errorResponseHandler } from '../../common/http';

const DeleteModal = ({ onClose, handleDelete }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDeleteData = async () => {
        try {
            setIsSubmitting(true);
            await handleDelete();
        } catch (error) {
            errorResponseHandler(error)
        } finally {
            onClose();
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-1/3 flex flex-col items-center text-center">
                <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
                <p className="mb-6">Are you sure you want to delete?</p>
                <div className="flex justify-center space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteData}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-red-600 text-white rounded-md"
                    >
                        {isSubmitting ? 'Deleting...' :'Delete'}
                        
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
