import React from 'react';

const ViewModal = ({ setShowView, data }) => {
  if (!data) return null;

  const handleClose = () => {
    setShowView(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[700px] max-h-[90vh] overflow-y-auto">

        <h3 className="text-2xl font-bold text-center text-white bg-[#1d2532] py-3 rounded-t-2xl">
          View Details
        </h3>

        <div className="p-8">

          <div className="mb-6">
            <label className="block mb-2 text-lg font-semibold">Question</label>
            <input
              type="text"
              readOnly
              value={data?.question || ''}
              className="w-full p-3 border border-gray-300 rounded bg-gray-100 text-gray-800 focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-lg font-semibold">Answer</label>
            <textarea
              readOnly
              rows={6}
              value={data?.answer || ''}
              className="w-full p-3 border border-gray-300 rounded bg-gray-100 text-gray-800 resize-none focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-6 rounded-md transition duration-200"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewModal;
