import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { message } from "antd";
import { GiDiamondRing } from "react-icons/gi";
import {
  MdDashboardCustomize,
  MdShoppingBag,
  MdDesignServices,
  MdOutlinePayments,
  MdLocalOffer,
  MdDiamond,
  MdCategory,
  MdCollectionsBookmark,
  MdViewCarousel,
  MdCampaign,
  MdVideoLibrary,
  MdPeople,
  MdBadge,
  MdMarkEmailRead,
  MdQuestionAnswer,
  MdContactMail,
  MdInfo,
  MdGavel,
  MdPolicy,
  MdLocalShipping,
  MdSwapHoriz,
  MdLogout,
} from "react-icons/md";
import Loader from "../Loader/Loader";
import { errorResponseHandler } from "../../common/http";
import { getSiteSettingsApi } from "../../common/services";

// newFeature: shown only once the new website features are switched on in Site Settings
const MENU = [
  {
    title: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: MdDashboardCustomize }],
  },
  {
    title: "Sales",
    items: [
      { to: "/orders", label: "Orders", icon: MdShoppingBag },
      { to: "/custom-orders", label: "Custom Orders", icon: MdDesignServices },
      { to: "/payments", label: "Payments", icon: MdOutlinePayments },
      { to: "/coupons", label: "Coupons", icon: MdLocalOffer },
    ],
  },
  {
    title: "Catalog",
    items: [
      { to: "/products", label: "Products", icon: MdDiamond },
      { to: "/domains", label: "Category", icon: MdCategory },
      { to: "/collections", label: "Collections", icon: MdCollectionsBookmark },
    ],
  },
  {
    title: "Storefront",
    items: [
      { to: "/banners", label: "Banners", icon: MdViewCarousel },
      { to: "/marquee", label: "Top Marquee", icon: MdCampaign, newFeature: true },
      { to: "/reels", label: "Reels", icon: MdVideoLibrary },
    ],
  },
  {
    title: "Customers",
    items: [
      { to: "/users", label: "Users", icon: MdPeople },
      { to: "/user-info", label: "User Info", icon: MdBadge },
      { to: "/news-letter", label: "NewsLetter", icon: MdMarkEmailRead },
      { to: "/queries", label: "Queries", icon: MdQuestionAnswer },
      { to: "/get-in-touch", label: "Get In Touch", icon: MdContactMail },
    ],
  },
  {
    title: "Content",
    items: [
      { to: "/about-us", label: "About us", icon: MdInfo },
      { to: "/terms-conditions", label: "Terms & Conditions", icon: MdGavel },
      { to: "/privacy-policy", label: "Privacy & Policy", icon: MdPolicy },
      { to: "/shipping-policy", label: "Shipping Policy", icon: MdLocalShipping },
      { to: "/exchange-policy", label: "Exchange Policy", icon: MdSwapHoriz },
    ],
  },
];

const Sidenav = React.memo(({ isOpen }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [newFeatures, setNewFeatures] = useState(false);

  useEffect(() => {
    getSiteSettingsApi()
      .then((res) => setNewFeatures(!!res?.data?.newFeaturesEnabled))
      .catch(() => setNewFeatures(false));

    const onUpdate = (e) => setNewFeatures(!!e.detail?.newFeaturesEnabled);
    window.addEventListener("site-settings-updated", onUpdate);
    return () => window.removeEventListener("site-settings-updated", onUpdate);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      sessionStorage.clear();
      message.success("Successfully logged out");
      setShowLogoutModal(false);
      setTimeout(() => {
        window.location.href = "/login";
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
        className={`text-white w-64 h-screen fixed top-0 left-0 transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-xl flex flex-col`}
        style={{ background: "linear-gradient(180deg, #1d2532 0%, #161c26 100%)", zIndex: 20 }}
      >
        {/* Brand */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10 shrink-0">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: "linear-gradient(135deg, #e3c77a, #b18a33)", color: "#1d2532" }}
          >
            <GiDiamondRing />
          </span>
          <div className="leading-tight">
            <p className="font-semibold text-[15px]">कुछ अलग</p>
            <p className="text-[11px] tracking-widest uppercase text-gray-400">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto sidenav-scroll px-3 py-4">
          {MENU.map((group) => {
            const items = group.items.filter((i) => !i.newFeature || newFeatures);
            if (!items.length) return null;
            return (
              <div key={group.title} className="mb-5">
                <p className="px-3 mb-1.5 text-[11px] font-semibold tracking-widest uppercase text-gray-500">
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {items.map(({ to, label, icon: Icon }) => {
                    const active = location.pathname === to;
                    return (
                      <li key={to}>
                        <Link
                          to={to}
                          aria-current={active ? "page" : undefined}
                          className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            active
                              ? "bg-white/10 text-white font-medium"
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {active && (
                            <span
                              className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r"
                              style={{ background: "#c8a24a" }}
                            />
                          )}
                          <Icon className={`text-lg shrink-0 ${active ? "text-[#e3c77a]" : ""}`} />
                          <span>{label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-red-500/15 hover:text-red-300 transition-colors"
          >
            <MdLogout className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {loading && <Loader />}

      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-2 text-start text-[#1d2532]">Confirm logout</h3>
            <p className="mb-6 text-start text-gray-600">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-white border border-gray-300 text-gray-700 py-2.5 px-6 rounded-xl hover:bg-gray-50 transition duration-200"
                aria-label="Cancel logout"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-2.5 px-6 rounded-xl hover:bg-red-700 transition duration-200"
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
