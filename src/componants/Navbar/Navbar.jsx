import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUserCircle,
  faSignOutAlt,
  faKey,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { message } from "antd";
import Loader from "../Loader/Loader";

import UpdateProfile from "./Update Admin Profile/UpdateProfile";
import ChangePassword from "./Change Password/ChangePassword";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";


const Navbar = ({ toggleSidenav, isSidenavOpen }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openUpdateProfile, setOpenUpdateProfile] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const dropdownRef = useRef(null);
  const adminToken = sessionStorage.getItem("adminToken");
  const isAdminAuthenticated = Boolean(adminToken); 
  const message=useToast();


  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openLogoutModal = () => {
    setIsDropdownOpen(false);
    setLogoutOpen(true);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      sessionStorage.clear();
      message.success("Successfully logged out");
      setLogoutOpen(false);
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 1000);
    } catch (error) {
      errorResponseHandler(error)
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdmin = () => {
    setOpenUpdateProfile(true);
    setIsDropdownOpen(false);
  };

  const handleChangePassword = () => {
    setOpenChangePassword(true);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div
        style={{ zIndex: 9 }}
        className={`fixed w-full transition-all duration-300 ${isSidenavOpen ? "md:pr-64" : ""
          }`}
      >
        <nav className="text-white p-4 flex justify-between items-center" style={{ backgroundColor: 'rgb(29 37 50)' }}>
          <div className="flex items-center gap-6">
            <button
              className="w-10 h-10 rounded bg-white text-black"
              onClick={toggleSidenav}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            {/* <h1 className="text-xl font-bold">AppSical</h1> */}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="text-white focus:outline-none"
            >
              <FontAwesomeIcon icon={faUserCircle} className="text-3xl" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-lg shadow-lg z-50">
                <ul className="py-2">
              
                  {/* <li
                    onClick={handleChangePassword}
                    className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faKey} /> Change Password
                  </li> */}


                  <li
                    onClick={openLogoutModal}
                    className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer text-red-600"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </nav>
        {loading && <Loader />}

        {openUpdateProfile && <UpdateProfile setOpen={setOpenUpdateProfile} />}

        {openChangePassword && <ChangePassword setOpen={setOpenChangePassword} />}


      </div>

      {logoutOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h3 className="text-3xl font-bold mb-4">Confirm Logout</h3>
            <p className="mb-4">Are you sure you want to logout?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setLogoutOpen(false)}
                className="bg-gray-300 text-black py-3 px-8 rounded-md hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-3 px-8 rounded-md hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

      )}
    </>
  );
};

export default Navbar;
