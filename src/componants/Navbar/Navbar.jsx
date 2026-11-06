import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MdMenu, MdMenuOpen, MdKeyboardArrowDown, MdLogout, MdPerson } from "react-icons/md";
import Loader from "../Loader/Loader";

import UpdateProfile from "./Update Admin Profile/UpdateProfile";
import ChangePassword from "./Change Password/ChangePassword";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";

// Shown in the top bar: [section, page title]
const PAGE_TITLES = {
  "/dashboard": ["Overview", "Dashboard"],
  "/orders": ["Sales", "Orders"],
  "/custom-orders": ["Sales", "Custom Orders"],
  "/payments": ["Sales", "Payments"],
  "/coupons": ["Sales", "Coupons"],
  "/products": ["Catalog", "Products"],
  "/domains": ["Catalog", "Category"],
  "/collections": ["Catalog", "Collections"],
  "/banners": ["Storefront", "Banners"],
  "/marquee": ["Storefront", "Top Marquee"],
  "/reels": ["Storefront", "Reels"],
  "/users": ["Customers", "Users"],
  "/user-info": ["Customers", "User Info"],
  "/news-letter": ["Customers", "NewsLetter"],
  "/queries": ["Customers", "Queries"],
  "/get-in-touch": ["Customers", "Get In Touch"],
  "/about-us": ["Content", "About us"],
  "/terms-conditions": ["Content", "Terms & Conditions"],
  "/privacy-policy": ["Content", "Privacy & Policy"],
  "/shipping-policy": ["Content", "Shipping Policy"],
  "/exchange-policy": ["Content", "Exchange Policy"],
  "/site-settings": ["Settings", "Site Settings"],
  "/profile": ["Account", "Profile"],
};

const Navbar = ({ toggleSidenav, isSidenavOpen }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openUpdateProfile, setOpenUpdateProfile] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const dropdownRef = useRef(null);
  const message = useToast();
  const location = useLocation();
  const [section, title] = PAGE_TITLES[location.pathname] || ["", ""];

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
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{ zIndex: 9 }}
        className={`fixed w-full transition-all duration-300 ${isSidenavOpen ? "md:pr-64" : ""}`}
      >
        <nav className="h-16 px-4 flex justify-between items-center bg-white/90 backdrop-blur border-b border-gray-200">
          <div className="flex items-center gap-4 min-w-0">
            <button
              className="w-10 h-10 rounded-xl text-2xl text-[#1d2532] hover:bg-gray-100 flex items-center justify-center transition-colors"
              onClick={toggleSidenav}
              title={isSidenavOpen ? "Hide menu" : "Show menu"}
              aria-label={isSidenavOpen ? "Hide menu" : "Show menu"}
            >
              {isSidenavOpen ? <MdMenuOpen /> : <MdMenu />}
            </button>
            {title && (
              <div className="leading-tight min-w-0">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400">{section}</p>
                <p className="text-lg font-semibold text-[#1d2532] truncate">{title}</p>
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg text-white"
                style={{ background: "linear-gradient(135deg, #1d2532, #34425a)" }}
              >
                <MdPerson />
              </span>
              <span className="hidden sm:block text-left leading-tight">
                <span className="block text-sm font-semibold text-[#1d2532]">Admin</span>
                <span className="block text-[11px] text-gray-400">Store manager</span>
              </span>
              <MdKeyboardArrowDown
                className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-52 bg-white text-gray-700 rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
              >
                <ul className="py-1.5">
                  {/* <li
                    onClick={handleChangePassword}
                    className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faKey} /> Change Password
                  </li> */}

                  <li
                    role="menuitem"
                    onClick={openLogoutModal}
                    className="px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 cursor-pointer text-red-600 text-sm"
                  >
                    <MdLogout className="text-lg" /> Logout
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
            <h3 className="text-2xl font-bold mb-2 text-[#1d2532]">Confirm Logout</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to logout?</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setLogoutOpen(false)}
                className="bg-white border border-gray-300 text-gray-700 py-2.5 px-6 rounded-xl hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-2.5 px-6 rounded-xl hover:bg-red-700 transition duration-200"
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
