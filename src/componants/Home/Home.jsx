import React, { useState, useEffect } from "react";
import { getAnalyticsApi } from "../../common/services";
import Load from "../Load/Load";
import { useNavigate } from "react-router";
import { MdPerson } from "react-icons/md";
import { BsCardChecklist } from "react-icons/bs";
import { errorResponseHandler } from "../../common/http";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await getAnalyticsApi();

      if (response?.success) {
        setAnalytics(response.data); // ✅ FIXED
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const handlePopState = () => navigate("/home");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const bgColors = [
    "bg-blue-100",
    "bg-green-100",
    "bg-yellow-100",
    "bg-purple-100",
  ];

  const iconColors = [
    "text-blue-600",
    "text-green-800",
    "text-yellow-800",
    "text-purple-800",
  ];

  const cards = [
    {
      title: "Total Users",
      value: analytics?.userCount ?? 0,
      description: "Total registered users",
      icon: <MdPerson className="text-3xl" />,
    },
    {
      title: "Total Orders",
      value: analytics?.orderCount ?? 0,
      description: "Total orders placed",
      icon: <BsCardChecklist className="text-3xl" />,
    },
    {
      title: "Total Reels",
      value: analytics?.reelCount ?? 0,
      description: "Total reels uploaded",
      icon: <BsCardChecklist className="text-3xl" />,
    },
    {
      title: "Total Categories",
      value: analytics?.categoryCount ?? 0,
      description: "Total product categories",
      icon: <BsCardChecklist className="text-3xl" />,
    },
    {
      title: "Total CustomOrders ",
      value: analytics?.customOrderCount ?? 0,
      description: "Total product categories",
      icon: <BsCardChecklist className="text-3xl" />,
    },
  ];

  return (
    <div className="p-4 mt-16">
      <h2 className="text-3xl font-bold text-gray-600">Dashboard</h2>
      <p className="text-gray-600">Welcome to the admin dashboard!</p>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
        {cards.map((card, index) => {
          const bgColor = bgColors[index % bgColors.length];
          const iconColor = iconColors[index % iconColors.length];

          return (
            <div
              key={index}
              className={`${bgColor} w-full rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-200 p-6`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-800 text-sm uppercase font-bold">
                    {card.title}
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`bg-white ${iconColor} rounded-full p-3 shadow`}
                >
                  {card.icon}
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">{card.description}</p>
            </div>
          );
        })}
      </div>

      {loading && <Load />}
    </div>
  );
};

export default Home;
