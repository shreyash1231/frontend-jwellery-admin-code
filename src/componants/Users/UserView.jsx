import React from "react";

const UserView = ({ onClose, selectedUser }) => {
  if (!selectedUser) return null;

  const formatPhone = () => {
    if (selectedUser.phone) {
      if (selectedUser.countryCode) {
        return `+${selectedUser.countryCode} ${selectedUser.phone}`;
      }
      return selectedUser.phone;
    }
    return "-";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] max-h-[700px] flex flex-col overflow-hidden">
        <h3 className="text-lg font-bold text-center bg-[#1d2532] py-3 text-white">
          User Details
        </h3>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                First Name
              </label>
              <input
                type="text"
                value={selectedUser.firstName || "-"}
                readOnly
                className="w-full border border-gray-300 bg-gray-50 px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Last Name
              </label>
              <input
                type="text"
                value={selectedUser.lastName || "-"}
                readOnly
                className="w-full border border-gray-300 bg-gray-50 px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Email
            </label>
            <input
              type="email"
              value={selectedUser.email || "-"}
              readOnly
              className="w-full border border-gray-300 bg-gray-50 px-3 py-2 rounded"
            />
          </div>

          {/* Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Phone
              </label>
              <input
                type="text"
                value={selectedUser.phone || "-"}
                readOnly
                className="w-full border border-gray-300 bg-gray-50 px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-800">
                Country Code
              </label>
              <input
                type="text"
                value={
                  selectedUser.countryCode
                    ? `+${selectedUser.countryCode}`
                    : "-"
                }
                readOnly
                className="w-full border border-gray-300 bg-gray-50 px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* Complete Phone */}
          <div>
            <label className="block mb-2 font-semibold text-gray-800">
              Phone Number
            </label>
            <input
              type="text"
              value={formatPhone()}
              readOnly
              className="w-full border border-gray-300 bg-gray-50 px-3 py-2 rounded font-semibold"
            />
          </div>

        
        </div>

        {/* Close Button */}
        <div className="flex justify-end p-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#1d2532] text-white w-40 py-2 px-4 rounded-md hover:bg-gray-800 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserView;
