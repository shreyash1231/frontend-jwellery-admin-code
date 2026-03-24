import React, { useState, useEffect } from "react";
import { getAllUsersApi } from "../../common/services";
import { AiOutlineEye } from "react-icons/ai";
import { Pagination, Input } from "antd";
import UserView from "./UserView";
import { errorResponseHandler } from "../../common/http";
import Load from "../Load/Load";

const Users = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsersApi();
      if (res.success) {
        setUsersData(res.data || []);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = usersData.filter((user) => {
    const query = searchQuery.toLowerCase();
    const firstName = (user.firstName || "").toLowerCase();
    const lastName = (user.lastName || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const phone = (user.phone || "").toString();

    return (
      firstName.includes(query) ||
      lastName.includes(query) ||
      email.includes(query) ||
      phone.includes(query)
    );
  });

  const startIndex = (currentPage - 1) * pageSize;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) return <Load />;

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center w-full space-x-4 mb-6">
        <h2 className="text-2xl font-bold text-black">Users</h2>
        <Input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={handleSearch}
          className="border rounded px-3 py-2 w-96"
        />
      </div>

      <div>
        <table className="min-w-full mt-7 bg-[#1d2532] border border-b-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center text-white">
                S.No
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                First Name
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Last Name
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Email
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Phone
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Joined Date
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr
                  key={user._id}
                  className={`hover:bg-gray-200 text-center transition duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-300"
                  }`}
                >
                  <td className="py-2 px-4 border-b">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {user.firstName || "-"}
                  </td>
                  <td className="py-2 px-4 border-b">{user.lastName || "-"}</td>
                  <td className="py-2 px-4 border-b text-sm">
                    {user.email || "-"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {user.countryCode && user.phone
                      ? `+${user.countryCode} ${user.phone}`
                      : user.phone || "-"}
                  </td>
                  <td className="py-2 px-4 border-b text-sm">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN")
                      : "-"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-center gap-3">
                      <button
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                        onClick={() => {
                          setSelectedUser(user);
                          setViewModal(true);
                        }}
                        title="View Details"
                      >
                        <AiOutlineEye className="text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-4 border-b text-center text-white font-bold"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredUsers.length > 0 && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredUsers.length}
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

      {viewModal && (
        <UserView
          onClose={() => setViewModal(false)}
          selectedUser={selectedUser}
        />
      )}
    </div>
  );
};

export default Users;
