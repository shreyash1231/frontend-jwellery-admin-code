// Show support ticket details in modal
const ViewSupport = ({ showViewSupport, setShowViewSupport, ticket }) => {
  const closeViewModal = () => {
    setShowViewSupport(false);
  };

  if (!ticket) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 9999999 }}
    >
      <div className="bg-white rounded-lg shadow-lg w-[500px] min-h-[400px] flex flex-col">
        {/* Header */}
        <h3 className="text-xl font-bold text-center bg-[#1d2532] py-2 text-white rounded-t-2xl">
          Support Ticket Details
        </h3>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Two fields per row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Ticket ID</label>
              <input
                type="text"
                value={ticket.ticket_no}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Title</label>
              <input
                type="text"
                value={ticket.title}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Name</label>
              <input
                type="text"
                value={`${ticket?.userId?.first_name || ""} ${ticket?.userId?.last_name || ""}`}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Email</label>
              <input
                type="text"
                value={ticket?.userId?.email || "N/A"}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold">Phone</label>
            <input
              type="text"
              value={ticket?.userId?.mobile || "N/A"}
              readOnly
              className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Date</label>
              <input
                type="text"
                value={new Date(ticket.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="font-semibold">Status</label>
              <input
                type="text"
                value={ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                readOnly
                className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* New: User details */}


          {/* Full-width message/description */}
          <div>
            <label className="font-semibold">Message</label>
            <textarea
              value={ticket.description}
              rows={4}
              readOnly
              className="w-full border border-gray-300 bg-gray-200 px-3 py-2 rounded"
            ></textarea>
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

export default ViewSupport;
