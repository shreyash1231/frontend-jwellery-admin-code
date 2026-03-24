import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { message } from "antd";
import { FaUsers} from "react-icons/fa";
import { SiGooglebigquery } from "react-icons/si";
import { FaRegNewspaper } from "react-icons/fa6";
import { MdOutlineDomain } from "react-icons/md";
import { GrProjects } from "react-icons/gr";
import { MdDoNotTouch } from "react-icons/md";
import { MdDashboardCustomize } from "react-icons/md";


import {
  MdPolicy,
  MdInfo,
  MdGavel,
  MdLocalShipping,
  MdSwapHoriz,
} from "react-icons/md";
import { MdInventory2 } from "react-icons/md";
import Loader from "../Loader/Loader";
import { errorResponseHandler } from "../../common/http";
import { MdOutlinePayments } from "react-icons/md";
import { RiCoupon3Fill } from "react-icons/ri";
import { GiKnightBanner } from "react-icons/gi";

const Sidenav = React.memo(({ isOpen }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();;

  const handleLogout = async () => {
    setLoading(true);
    try {
      sessionStorage.clear();
      message.success("Successfully logged out");
      setShowLogoutModal(false);
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, [1000]);
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside
        className={` text-white w-64 h-screen p-4 fixed top-0 left-0 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-lg flex flex-col`}
        style={{ backgroundColor: "rgb(29 37 50)" }}
      >
        <div className="flex-1 overflow-y-auto scrollbar-hidden mt-4">
          <ul className="space-y-1">
            <li>
              <Link
                to="/dashboard"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/dashboard"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <MdDashboardCustomize className="text-xl mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                to="/users"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/users"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <FaUsers className="text-xl mr-3" />
                <span>Users</span>
              </Link>
            </li>

            <li>
              <Link
                to="/banners"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/banners"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <GiKnightBanner className="text-xl mr-3" />
                <span>Banners</span>
              </Link>
            </li>

            <li>
              <Link
                to="/coupons"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/coupons"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <RiCoupon3Fill className="text-xl mr-3" />
                <span>Coupons</span>
              </Link>
            </li>

            <li>
              <Link
                to="/orders"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/orders"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <MdInventory2 className="text-xl mr-3" />
                <span>Orders</span>
              </Link>
            </li>

            <li>
              <Link
                to="/custom-orders"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/custom-orders"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`} 
              >
                <MdInventory2 className="text-xl mr-3" />
                <span>Custom Orders</span>
              </Link>
            </li>

            <li>
              <Link
                to="/payments"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/payments"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <MdOutlinePayments className="text-xl mr-3" />
                <span>Payments</span>
              </Link>
            </li>

            {/* <li>
              <Link
                to="/signature"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/signature"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <FaUsers className="text-xl mr-3" />
                <span>Signature</span>
              </Link>
            </li> */}

            {/* <li>
              <Link
                to="/testimonials"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/testimonials"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <FaStarOfDavid className="text-xl mr-3" />
                <span>Testimonials</span>
              </Link>
            </li> */}
            {/* <li>
              <Link
                to="/blogs"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/blogs"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <FaRegNewspaper className="text-xl mr-3" />
                <span>Blogs</span>
              </Link>
            </li> */}

            <li>
              <Link
                to="/news-letter"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/news-letter"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <FaRegNewspaper className="text-xl mr-3" />
                <span>NewsLetter</span>
              </Link>
            </li>

            <li>
              <Link
                to="/user-info"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/user-info"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <FaUsers className="text-xl mr-3" />
                <span>User Info</span>
              </Link>
            </li>
            {/* 
            <li>
              <Link
                to="/marketing"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/marketing"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <FaRegNewspaper className="text-xl mr-3" />
                <span>Marketing</span>
              </Link>
            </li> */}

            <li>
              <Link
                to="/reels"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/reels"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <FaRegNewspaper className="text-xl mr-3" />
                <span>Reels</span>
              </Link>
            </li>

            <li>
              <Link
                to="/queries"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/queries"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <SiGooglebigquery className="text-xl mr-3" />
                <span>Queries</span>
              </Link>
            </li>

            <li>
              <Link
                to="/domains"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/domains"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <MdOutlineDomain className="text-xl mr-3" />
                <span>Category</span>
              </Link>
            </li>
            {/* 
            <li>
              <Link
                to="/services"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/services"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <FaRegNewspaper className="text-xl mr-3" />
                <span>Services</span>
              </Link>
            </li> */}

            <li>
              <Link
                to="/products"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/products"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <GrProjects className="text-xl mr-3" />
                <span>Products</span>
              </Link>
            </li>

            <li>
              <Link
                to="/get-in-touch"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/get-in-touch"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <MdDoNotTouch className="text-xl mr-3" />
                <span>Get In Touch</span>
              </Link>
            </li>

            {/* <li>
              <Link
                to="/faqs"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/faqs"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <MdInventory2 className="text-2xl mr-3" />
                <span>FAQS</span>
              </Link>
            </li> */}

            <li>
              <Link
                to="/about-us"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/about-us"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <MdInfo className="text-xl mr-3" />
                <span>About us</span>
              </Link>
            </li>

            <li>
              <Link
                to="/terms-conditions"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/terms-conditions"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <MdGavel className="text-xl mr-3" />
                <span>Terms & Conditions</span>
              </Link>
            </li>

            <li>
              <Link
                to="/privacy-policy"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/privacy-policy"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <MdPolicy className="text-xl mr-3" />{" "}
                <span>Privacy & Policy</span>
              </Link>
            </li>

            <li>
              <Link
                to="/shipping-policy"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/shipping-policy"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <MdLocalShipping className="text-xl mr-3" />
                <span>Shipping Policy</span>
              </Link>
            </li>

            <li>
              <Link
                to="/exchange-policy"
                className={`flex items-center p-2 rounded-md transition-colors ${
                  location.pathname === "/exchange-policy"
                    ? "bg-[#454546]"
                    : "hover:bg-[#00000029]"
                }`}
              >
                <MdSwapHoriz className="text-xl mr-3" />
                <span>Exchange Policy</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      {loading && <Loader />}

      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-3xl font-bold mb-4 text-start">
              Confirm logout
            </h3>
            <p className="mb-4 text-start">
              Are you sure you want to logout ?{" "}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                }}
                className="bg-gray-300 text-black py-3 px-8 rounded-md hover:bg-gray-400 transition duration-200"
                aria-label="Cancel logout"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-3 px-8 rounded-md mr-2 hover:bg-red-700 transition duration-200"
                aria-label="Confirm logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Sidenav;
