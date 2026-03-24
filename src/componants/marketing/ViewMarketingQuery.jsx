const ViewMarketingQuery = ({ showViewQuery, setShowViewQuery, query }) => {
  const closeViewModal = () => {
    setShowViewQuery(false);
  };

  if (!query) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999999 }}>
      <div className="bg-white rounded-lg shadow-lg w-[600px] min-h-[420px] flex flex-col">
        <h3 className="text-xl font-bold text-center bg-[#1d2532] py-2 text-white rounded-t-2xl">
          Marketing Query Details
        </h3>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">First Name</label>
              <input
                type="text"
                value={query?.firstName || "-"}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Last Name</label>
              <input
                type="text"
                value={query?.lastName || "-"}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Email</label>
              <input
                type="text"
                value={query?.email || "-"}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Phone</label>
              <input
                type="text"
                value={query?.phone || "-"}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold">Subject</label>
            <input
              type="text"
              value={query?.subject || "-"}
              readOnly
              className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="font-semibold">Message</label>
            <textarea
              value={query?.message || "-"}
              rows={5}
              readOnly
              className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">SEO</label>
              <input
                type="text"
                value={query?.SEO ? "Yes" : "No"}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="font-semibold">SMO</label>
              <input
                type="text"
                value={query?.SMO ? "Yes" : "No"}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={closeViewModal}
            className="bg-gray-300 text-black w-32 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMarketingQuery;