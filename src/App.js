import React, { useState, createContext, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import "./index.css";

import Sidenav from "./componants/Side Navbar/Sidenav";
import Navbar from "./componants/Navbar/Navbar";
import Login from "./componants/Auth/Login";
import Load from "./componants/Load/Load";
import AboutUs from "./componants/AboutUs/AboutUs";


import NewsLetter from "./componants/newsLetter/NewsLetter";
import GetInTouch from "./componants/getInTouch/GetInTouch";
import Queries from "./componants/queries/Queries";
import Domain from "./componants/domain/Domain";
import Products from "./componants/project/Projects";

import Reels from "./componants/Reels/Reels";
import Users from "./componants/Users/Users";
import UserInfo from "./componants/userInfo/UserInfo";
import Orders from "./componants/Orders/Orders";
import CustomOrders from "./componants/CustomOrders/CustomOrders";
import Payments from "./componants/Payments/Payments";
import Banners from "./componants/Banners/Banners";
import Coupons from "./componants/Coupons/Coupons";

const Home = lazy(() => import("./componants/Home/Home"));
const Profile = lazy(() => import("./componants/Profile/Profile"));
const About = lazy(() => import("./componants/AboutUs/AboutUs"));
const Privacy = lazy(() => import("./componants/Privacy Policies/Privacy"));
const Terms = lazy(() => import("./componants/Terms & Condition/Terms"));
const Shipping = lazy(() => import("./componants/Shipping/Shipping"));
const Exchange = lazy(() => import("./componants/Exchange/Exchange"));

export const UserContext = createContext();

function App() {
  const [isOpen, setIsOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    sessionStorage.getItem("token") ? true : false,
  );

  const toggleSidenav = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Router basename="/admin">
      <UserContext.Provider value={{ setIsAuthenticated, isAuthenticated }}>
        <Suspense
          fallback={
            <div className="text-center mt-10">
              <Load />
            </div>
          }
        >
          <Routes>
            {/* Authenticated Routes */}
            {isAuthenticated ? (
              <Route
                path="*"
                element={
                  <AuthenticatedApp
                    isOpen={isOpen}
                    toggleSidenav={toggleSidenav}
                  />
                }
              />
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </Suspense>
      </UserContext.Provider>
    </Router>
  );
}

const AuthenticatedApp = ({ isOpen, toggleSidenav }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-y-scroll scrollbar-hidden">
      <Sidenav isOpen={isOpen} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Navbar toggleSidenav={toggleSidenav} isSidenavOpen={isOpen} />

        <Routes location={location}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/user-info" element={<UserInfo />} />

          <Route path="/orders" element={<Orders />} />
          <Route path="/custom-orders" element={<CustomOrders />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/profile" element={<Profile />} />
          {/* <Route path="/signature" element={<Signatures />} /> */}
          <Route path="/banners" element={<Banners />} />
          <Route path="/coupons" element={<Coupons />} />

          {/* <Route path="/faqs" element={<Faqs />} /> */}

          <Route path="/help" element={<About />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/about-us" element={<AboutUs />} />
          {/* <Route path="/testimonials" element={<Testimonials />} /> */}
          {/* <Route path="/services" element={<Services />} /> */}

          <Route path="/news-letter" element={<NewsLetter />} />
          {/* <Route path="/marketing" element={<MarketingQueries />} /> */}

          <Route path="/get-in-touch" element={<GetInTouch />} />
          <Route path="/queries" element={<Queries />} />
          <Route path="/domains" element={<Domain />} />
          <Route path="/reels" element={<Reels />} />

          <Route path="/products" element={<Products />} />
          {/* <Route path="/blogs" element={<Blogs />} /> */}

          <Route path="/terms-conditions" element={<Terms />} />
          <Route path="/shipping-policy" element={<Shipping />} />
          <Route path="/exchange-policy" element={<Exchange />} />
          <Route path="/*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
