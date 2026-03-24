import React, { useState, useEffect } from "react";
import { message } from "antd";
import { changePassword } from "../../common/services";
import Load from "../Load/Load";
import Modal from "react-modal";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useToast } from "../toast/Toast";
import { image_url } from "../../common/env";

const Profile = () => {
  const [profile, setProfile] = useState("");
  const [profileFormData, setProfileFormData] = useState({
    firstName: "",
    lastName: "",
    profileImage: "",
  });
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [isOldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setConfirmNewPasswordVisible] =
    useState(false);
  const [adminProfileImage, setAdminProfileImage] = useState("");

  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const message = useToast();

  const adminProfile = async () => {
    setLoading(true);
    try {
      setLoading(true);
      if (!sessionStorage.getItem("token")) {
        return;
      }

      const response = "";
      //    await getProfile()
      if (response?.data?.success) {
        setProfile(response?.data?.data);
        setProfileFormData({
          firstName: response?.data?.data?.firstName,
          lastName: response?.data?.data?.lastName,
          profileImage: response?.data?.data?.profileImage,
        });
      }
    } catch (error) {
      if (
        error.message === "Network Error" ||
        error.message.includes("ERR_INTERNET_DISCONNECTED")
      ) {
        message.error("Network Error");
        return;
      }
      // Handle specific error cases
      if (error?.response?.status === 401) {
        window.alert(
          "Your account is logged in to another device, please login again !",
        );
        sessionStorage.removeItem("token");
        window.location.href = "/admin/login";
      }
      if (error?.response?.status === 500) {
        message.error("Server not responding");
        return;
      } else {
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminProfile();
  }, []);

  const handleProfileImageChange = (e) => {
    setAdminProfileImage(e.target.files[0]);
  };

  const handleProfileChange = (e) => {
    setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });
    validateProfileFields(e.target.name, e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPasswordFormData({
      ...passwordFormData,
      [e.target.name]: e.target.value,
    });
    validatePasswordFields(e.target.name, e.target.value);
  };

  const validateProfileFields = (name, value) => {
    const errors = { ...profileErrors };

    if (name === "firstName") {
      const nameRegex = /^[A-Za-z. ]+$/; // allows only letters and dots
      if (!value) {
        errors.firstName = "First name is required";
      } else if (value.length < 2) {
        errors.firstName = "First name must be at least 2 characters";
      } else if (value.length > 15) {
        errors.firstName = "First name cannot be more than 15 letters";
      } else if (!nameRegex.test(value)) {
        errors.firstName = "First name can only contain letters";
      } else {
        delete errors.firstName;
      }
    }

    if (name === "lastName") {
      const lastNameRegex = /^[A-Za-z. ]+$/; // allows only letters and dots
      if (!value) {
        errors.lastName = "Last name is required";
      } else if (value.length < 2) {
        errors.lastName = "Last name must be at least 2 characters";
      } else if (value.length > 15) {
        errors.lastName = "Last name cannot be more than 15 letters";
      } else if (!lastNameRegex.test(value)) {
        errors.lastName = "Last name can only contain letters";
      } else {
        delete errors.lastName;
      }
    }

    setProfileErrors(errors);
  };

  const validatePasswordFields = (name, value) => {
    setPasswordErrors((prevErrors) => {
      const errors = { ...prevErrors }; // Copy previous errors state

      if (name === "oldPassword") {
        if (!value) {
          errors.oldPassword = "Old password is required";
        } else {
          delete errors.oldPassword; // ✅ Remove error when value is entered
        }
      }

      if (name === "newPassword") {
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!value) {
          errors.newPassword = "New password is required";
        } else if (value.length < 8 || value.length > 16) {
          errors.newPassword = "New password must be 8 to 16 characters long";
        } else if (!passwordRegex.test(value)) {
          errors.newPassword =
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
        } else {
          delete errors.newPassword;
        }
      }

      if (name === "confirmNewPassword") {
        if (!value) {
          errors.confirmNewPassword = "Please confirm your new password";
        } else if (value !== passwordFormData.newPassword) {
          errors.confirmNewPassword =
            "New password & confirm password should match.";
        } else {
          delete errors.confirmNewPassword;
        }
      }

      return errors; // ✅ Return the updated errors state
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (Object.keys(profileErrors).length > 0) {
      // message.error('Please fix the errors in the form.');
      return;
    }
    setLoading(true);
    try {
      const response = "";
      // await updateProfile(profileFormData, adminProfileImage);
      if (response?.data?.success)
        message.success(
          response?.data?.message || "Profile updated successfully",
        );
      setProfileModalOpen(false);
      adminProfile();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Error while update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (Object.keys(passwordErrors).length > 0) {
      // message.error('All fields are mendatory');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        oldPassword: passwordFormData?.oldPassword,
        newPassword: passwordFormData?.newPassword,
        confirmPassword: passwordFormData?.confirmNewPassword,
      };
      const response = await changePassword(payload);
      if (response?.success) {
        message.success(response?.message || "Password changed successfully");
        setPasswordFormData({
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setPasswordModalOpen(false);
      }
    } catch (error) {
      // setError('Failed to change password');
      message.error(
        error?.response?.data?.message || "Failed to change password",
      );
    }
    setLoading(false);
  };

  return (
    <>
      <h2 className="text-2xl font-bold mt-2 ml-2"></h2>

      <div className="bg-gradient-to-r from-teal-400 to-blue-200 text-black  p-6 h-2/5 w-3/5 rounded-lg shadow-2xl mt-36 ml-48 lg:h-auto max-xl:h-auto">
        <div className="flex items-center w-full xl:w-full">
          <img
            src={`${image_url}/${profile?.profileImage}`}
            alt="Profile"
            className="w-40 h-40 object-cover rounded-full border-4 border-gray-600 mr-6"
          />
          <div>
            <h2 className="text-2xl font-bold">{`${profile?.firstName || ""} ${profile?.lastName || ""}`}</h2>
            <p className="text-xl font-semibold text-blue-600">
              {profile?.email}
            </p>
          </div>
        </div>

        <div className="mt-8 w-full flex justify-end">
          <button
            onClick={() => setProfileModalOpen(true)}
            className="bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-500 transition mr-4 "
          >
            Update Profile
          </button>
          <button
            onClick={() => setPasswordModalOpen(true)}
            className="bg-green-700 text-white px-6 py-3 rounded-md hover:bg-green-500 transition "
          >
            Change Password
          </button>
        </div>
      </div>
      {loading && <Load />}

      {/* Profile Update Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onRequestClose={() => setProfileModalOpen(false)}
        contentLabel="Update Profile"
        className="bg-white rounded-lg shadow-lg w-2/5  mx-auto mt-20 flex flex-col justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-br from-teal-950 to-teal-500 text-white py-2">
          Update Profile
        </h2>
        <form
          onSubmit={handleUpdateProfile}
          className="flex flex-col items-center p-12"
          encType="multipart/form-data"
        >
          {/* Profile Picture Field */}
          <div className="mb-4 w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Profile Picture
            </label>
            <input
              type="file"
              name="profilePic"
              //value={profileFormData?.profileImage}
              accept="image/*"
              onChange={(e) => {
                handleProfileImageChange(e);
              }} // Add a handler for file changes
              className="border-2 border-blue-600 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
            />
          </div>

          {/* Existing Form Fields */}
          <div className="mb-2 w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={profileFormData?.firstName}
              onChange={handleProfileChange}
              placeholder="First Name"
              className={`border-2 ${profileErrors.firstName ? "border-red-500" : "border-blue-600"} rounded-md p-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition`}
            />
            {profileErrors.firstName && (
              <span className="text-red-500">{profileErrors.firstName}</span>
            )}
          </div>

          <div className="mb-4 w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={profileFormData?.lastName}
              onChange={handleProfileChange}
              placeholder="Last Name"
              className={`border-2 ${profileErrors.lastName ? "border-red-500" : "border-blue-600"} rounded-md p-2 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition`}
            />
            {profileErrors.lastName && (
              <span className="text-red-500">{profileErrors.lastName}</span>
            )}
          </div>
          {/* Submit and Close Buttons */}
          <div className="flex justify-center gap-12 w-full">
            <button
              type="button"
              onClick={() => {
                setProfileModalOpen(false);
                setProfileErrors({});
                setProfileFormData({
                  firstName: profile?.firstName,
                  lastName: profile?.lastName,
                  profileImage: profile?.profileImage,
                });
              }}
              className="ml-2 bg-red-600 text-white px-12 py-2 rounded-md border border-gray-300 hover:bg-red-700 transition"
            >
              Close
            </button>

            <button
              type="submit"
              className="bg-blue-500 text-white px-12 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Update
            </button>
          </div>
        </form>
        {/* {loading && <Loader/>} */}
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onRequestClose={() => setPasswordModalOpen(false)}
        contentLabel="Change Password"
        className="bg-white rounded-lg shadow-lg w-2/5  mx-auto mt-20 flex flex-col justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-br from-teal-950 to-teal-500 text-white py-2">
          Change Password
        </h2>
        <form
          onSubmit={handleChangePassword}
          className="flex flex-col  p-8 items-center"
        >
          <div className="relative mb-4 w-full">
            <div className="mb-2 w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Old Password
              </label>
              <input
                type={isOldPasswordVisible ? "text" : "password"}
                name="oldPassword"
                value={passwordFormData?.oldPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your old password"
                required
                className={`border-2 ${passwordErrors.oldPassword ? "border-red-500" : "border-blue-400"} rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition`}
              />
            </div>
            {passwordErrors.oldPassword && (
              <span className="text-red-500">{passwordErrors.oldPassword}</span>
            )}
            <button
              type="button"
              onClick={() => setOldPasswordVisible(!isOldPasswordVisible)}
              className="absolute right-2 top-10"
            >
              {isOldPasswordVisible ? <AiFillEye /> : <AiFillEyeInvisible />}
            </button>
          </div>
          <div className="relative mb-6 w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              New Password
            </label>
            <input
              type={isNewPasswordVisible ? "text" : "password"}
              name="newPassword"
              value={passwordFormData?.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter your new password"
              required
              className={`border-2 ${passwordErrors.newPassword ? "border-red-500" : "border-blue-400"} rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition`}
            />
            {passwordErrors.newPassword && (
              <span className="text-red-500">{passwordErrors.newPassword}</span>
            )}
            <button
              type="button"
              onClick={() => setNewPasswordVisible(!isNewPasswordVisible)}
              className="absolute right-2 top-10"
            >
              {isNewPasswordVisible ? <AiFillEye /> : <AiFillEyeInvisible />}
            </button>
          </div>
          <div className="relative mb-4 w-full">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirm Password
            </label>
            <input
              type={isConfirmNewPasswordVisible ? "text" : "password"}
              name="confirmNewPassword"
              value={passwordFormData?.confirmNewPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm New Password"
              required
              className={`border-2 ${passwordErrors.confirmNewPassword ? "border-red-500" : "border-blue-400"} rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition`}
            />
            {passwordErrors.confirmNewPassword && (
              <span className="text-red-500">
                {passwordErrors.confirmNewPassword}
              </span>
            )}
            <button
              type="button"
              onClick={() =>
                setConfirmNewPasswordVisible(!isConfirmNewPasswordVisible)
              }
              className="absolute right-2 top-10"
            >
              {isConfirmNewPasswordVisible ? (
                <AiFillEye />
              ) : (
                <AiFillEyeInvisible />
              )}
            </button>
          </div>
          <div className="flex justify-center gap-12 w-full mt-4">
            <button
              type="button"
              onClick={() => {
                setPasswordModalOpen(false);
                setPasswordFormData({
                  oldPassword: "",
                  newPassword: "",
                  confirmNewPassword: "",
                }); // Clear the form data
                setPasswordErrors({});
              }}
              className="ml-2 bg-red-600 text-white px-14 py-2 rounded-md border border-gray-300 hover:bg-red-700 transition"
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-14 py-2 rounded-md hover:bg-green-700 transition"
            >
              Change
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Profile;
