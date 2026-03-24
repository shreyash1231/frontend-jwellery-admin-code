import { updateUserProfileApi } from "../../common/services";
import React, { useEffect, useState } from "react";
import defalutImage from "../../Images/noProfile.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { errorResponseHandler } from "../../common/http";
import { image_url } from "../../common/env";

function EditModal({ onClose, selectedUser, fetchUsers }) {
  const [adminProfile, setAdminProfile] = useState({
    user_name: "",
    gender: "",
    mobile: "",
    profile_image: null,
    current_address: "",
  });
  const [image, setImage] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setAdminProfile({
        user_name: selectedUser.user_name || "",
        gender: selectedUser.gender || "",
        mobile: selectedUser.mobile || "",
        profile_image: selectedUser.profile_image || null,
        current_address: selectedUser.current_address || "",
      });
    }
  }, [selectedUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdminProfile((prev) => ({
        ...prev,
        profile_image: URL.createObjectURL(file),
      }));
      setImage(file);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("user_name", adminProfile.user_name);
      formData.append("gender", adminProfile.gender);
      formData.append("mobile", adminProfile.mobile);
      formData.append("current_address", adminProfile.current_address);
      if (image) formData.append("file", image);

      const response = await updateUserProfileApi(selectedUser._id, formData);
      if (response.success) {
        fetchUsers();
        onClose();
      }
    } catch (err) {

      errorResponseHandler(err)
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[700px] h-full max-h-[700px] flex flex-col">
        <h3 className="text-xl font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
          Admin Profile
        </h3>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={`${image_url}/${adminProfile.profile_image || defalutImage}`}
                alt="Profile Preview"
                className="border border-gray-800 w-48 h-48 object-contain rounded-full"
              />
              <button
                type="button"
                className="w-10 h-10 absolute bottom-2 right-2 bg-white text-black p-2 rounded-full shadow hover:bg-gray-200"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <FontAwesomeIcon icon={faPen} />
              </button>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Two-column Inputs */}
          <div className="grid grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block mb-1">Name</label>
              <input
                type="text"
                name="user_name"
                className="border border-gray-900 p-2 w-full"
                value={adminProfile.user_name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>

            {/* Email (disabled) */}
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="text"
                name="email"
                className="border border-gray-900 p-2 w-full bg-gray-100"
                value={selectedUser?.email || ""}
                disabled
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-1">Gender</label>
              <select
                name="gender"
                value={adminProfile.gender}
                onChange={handleChange}
                className="border border-gray-900 p-2 w-full"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Mobile */}
            <div>
              <label className="block mb-1">Mobile</label>
              <input
                type="number"
                name="mobile"
                value={adminProfile.mobile}
                onChange={handleChange}
                className="border border-gray-900 p-2 w-full"
                placeholder="Enter mobile number"
              />
            </div>

            {/* Address (full width) */}
            <div className="col-span-2">
              <label className="block mb-1">Address</label>
              <textarea
                name="current_address"
                value={adminProfile.current_address}
                onChange={handleChange}
                className="border border-gray-900 p-2 w-full"
                placeholder="Enter address"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end p-4 border-t gap-6">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black w-52 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
          >
            Close
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="text-white py-2 px-4 rounded-md w-52 bg-[#1d2532] transition duration-200"
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
