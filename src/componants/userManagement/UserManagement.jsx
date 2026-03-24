import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { message, Switch, Pagination } from "antd";
import { AiOutlineEye, AiFillDelete } from "react-icons/ai";
import { CiEdit } from "react-icons/ci";
import {
  getAllUsers,
  deactivate,
  updateUserProfileApi,
} from "../../common/services";
import Load from "../Load/Load";
import ViewModal from "./ViewModal";
import EditModal from "./EditModal";
import DeleteModal from "../deleteModal/DeleteModal";
import noProfile from "../../Images/noProfile.jpg";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";
import { image_url } from "../../common/env";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showViewUser, setShowViewUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionToggle, setActionToggle] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const message = useToast();

  const navigate = useNavigate();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      if (response?.success) {
        setUsers([...response.data.users].reverse());
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [actionToggle]);

  // Handle status toggle
  const handleStatusChange = async (user) => {
    try {
      setLoading(true);
      const newStatus = !user.is_active;
      const formData = new FormData();
      formData.append("is_active", newStatus);
      const response = await updateUserProfileApi(user._id, formData);
      if (response?.success) {
        message.success(
          `User ${newStatus ? "Activated" : "Deactivated"} successfully`,
        );
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...u, is_active: newStatus } : u,
          ),
        );
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      const response = await deactivate(selectedUser._id);
      if (response?.success) {
        message.success("User deleted successfully");
        setShowDeleteUser(false);
        setActionToggle(!actionToggle);
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  // Search filter including email
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      (user.firstName && user.firstName.toLowerCase().includes(query)) ||
      (user.lastName && user.lastName.toLowerCase().includes(query)) ||
      (user.user_name && user.user_name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.phone && user.phone.toLowerCase().includes(query))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleVehicleNavigate = (id) => {
    navigate("/vehicle-management", { state: { id } });
  };

  const handleHistoryNavigate = (id) => {
    navigate("/booking-history", { state: { id } });
  };

  return (
    <div className="p-4 mt-16">
      {/* Header & Search */}
      <div className="flex justify-between items-center w-full space-x-4">
        <h2 className="text-2xl font-bold text-black">User Management</h2>
        <input
          type="text"
          placeholder="Search user"
          value={searchQuery}
          onChange={handleSearch}
          className="border rounded px-3 py-1"
        />
      </div>

      {/* User Table */}
      <div>
        <table className="min-w-full mt-7 bg-[#1d2532] border border-b-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center text-white">
                S.No
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Image
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Name
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Email
              </th>

              <th className="py-2 px-4 border-b text-center text-white">
                Vehicles
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Booking
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Status
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
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <img
                      src={`${image_url}/${user.profile_image || noProfile}`}
                      alt="User profile"
                      className="w-10 h-10 rounded-full border object-cover mx-auto"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">{user.user_name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>

                  {/* Vehicles */}
                  <td
                    onClick={() => handleVehicleNavigate(user._id)}
                    className="py-3 px-4 border-b cursor-pointer"
                  >
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full shadow hover:bg-blue-200 transition shadow-sm">
                        <AiOutlineEye className="text-lg" />
                        <span className="text-sm font-semibold">
                          {user.vahicleCount}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Booking History */}
                  <td
                    onClick={() => handleHistoryNavigate(user._id)}
                    className="py-3 px-4 border-b cursor-pointer"
                  >
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-1 bg-blue-100 text-green-700 px-3 py-1 rounded-full shadow hover:bg-blue-200 transition shadow-sm">
                        <AiOutlineEye className="text-lg" />
                        <span className="text-sm font-semibold">
                          {user.bookingCount}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-2 px-4 border-b">
                    <Switch
                      checked={user.is_active}
                      onChange={() => handleStatusChange(user)}
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowViewUser(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                      >
                        <AiOutlineEye className="mr-1 text-2xl" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditUser(true);
                        }}
                        className="text-green-500 hover:text-green-700 flex items-center"
                      >
                        <CiEdit className="mr-1 text-xl" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteUser(true);
                        }}
                        className="text-red-500 hover:text-red-700 flex items-center"
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
                  colSpan="7"
                  className="px-4 py-4 border-b text-center text-white font-bold"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {currentUsers.length > 0 && (
          <Pagination
            current={currentPage}
            total={filteredUsers.length}
            pageSize={itemsPerPage}
            onChange={setCurrentPage}
            showSizeChanger={false}
            className="mt-4 flex justify-end"
          />
        )}

        {loading && <Load />}
      </div>

      {/* Modals */}
      {showViewUser && (
        <ViewModal
          showViewAdmin={showViewUser}
          setShowViewAdmin={setShowViewUser}
          selectedAdmin={selectedUser}
        />
      )}

      {showEditUser && (
        <EditModal
          showEditAdmin={showEditUser}
          onClose={() => setShowEditUser(false)}
          fetchUsers={fetchUsers}
          selectedUser={selectedUser}
          action={actionToggle}
          setAction={setActionToggle}
        />
      )}

      {showDeleteUser && (
        <DeleteModal
          closeModal={() => setShowDeleteUser(false)}
          handleDelete={deleteUser}
        />
      )}
    </div>
  );
};

export default UserManagement;
