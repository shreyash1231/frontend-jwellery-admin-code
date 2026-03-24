import React,{ useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Load from "../Load/Load";
import * as Yup from "yup";
import { useFormik } from "formik";
import bgImage from "../../assets/mainLogo.webp";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import {
  login,
  forgotPasswordApi,
  verifyOtp,
  resetPassword,
} from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";

const Login = () => {
  const [redirect, setRedirect] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const message = useToast();

  useEffect(() => {
    if (redirect === 2) {
      if (timer > 0) {
        const interval = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
      }
    }
  }, [redirect, timer]);

  useEffect(() => {
    const handlePopState = () => {
      navigate("/login");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);


  const initialValues = {
    email: "",
    password: "",
    otpEmail: "",
    otp: ["", "", "", "", ""],
    newPassword: "",
    confirmPassword: "",
  };

  const getValidationSchema = (redirect) => {
    switch (redirect) {
      case 0: // Sign In
        return Yup.object({
          email: Yup.string()
            .email("Invalid email address")
            .matches(
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              "Enter valid email",
            )
            .required("Email id is required"),

          password: Yup.string().required("Password is required"),
        });

      case 1: // Send Otp
        return Yup.object({
          otpEmail: Yup.string()
            .email("Invalid email address")
            .matches(
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              "Enter valid email",
            )
            .required("Email id is required"),
        });

      case 2:
        return Yup.object().shape({
          otp: Yup.array()
            .test(
              "otp-filled",
              "Please enter OTP",
              (otp) => Array.isArray(otp) && otp.filter(Boolean).length === 5,
            )
            .test(
              "otp-numeric",
              "OTP should contain only numbers",
              (otp) =>
                Array.isArray(otp) &&
                otp.length === 5 &&
                otp.every((digit) => /^\d$/.test(digit)),
            ),
        });

      case 3:
        return Yup.object({
          newPassword: Yup.string()
            .matches(
              /^(?=(.*[a-z]))(?=(.*[A-Z]))(?=(.*\d))(?=(.*[\W_])).{8,}$/,
              "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.",
            )
            .required("Password is required"),

          confirmPassword: Yup.string()
            .oneOf(
              [Yup.ref("newPassword")],
              "New password and confirm password should be match",
            ) // Ensures confirmPassword matches newPassword
            .required("Confirm password is required"),
        });

      default:
        return;
    }
  };

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleBackspace = (index, event) => {
    if (event.key === "Backspace" && index > 0 && !event.target.value) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleDigitInput = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const otp = [...formik.values.otp];
    otp[index] = value;
    formik.setFieldValue("otp", otp);

    if (value.length > 0 && index < inputRefs.length - 1) {
      if (inputRefs[index + 1]?.current) {
        inputRefs[index + 1].current.focus();
      }
    } else if (value.length === 0 && index > 0) {
      if (inputRefs[index - 1]?.current) {
        inputRefs[index - 1].current.focus();
      }
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchema(redirect),

    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const otp = values.otp.join("") || "";
      if (redirect === 0) {
        await handleSubmit(values, { setSubmitting, resetForm }, "signIn");
      } else if (redirect === 1) {
        await handleSubmit(values, { setSubmitting, resetForm }, "sendOtp");
      } else if (redirect === 2) {
        await handleSubmit(
          { ...values, otp },
          { setSubmitting, resetForm },
          "verifyOtp",
        );
      } else if (redirect === 3) {
        await handleSubmit(
          values,
          { setSubmitting, resetForm },
          "resetPassword",
        );
      }
    },
  });

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm },
    actionType,
  ) => {
    let response;
    let data;
    setLoading(true);
    setSubmitting(true);
    try {
      if (actionType === "signIn") {
        sessionStorage.clear();
        data = {
          email: values.email,
          password: values.password,
        };
        response = await login(data);
        if (response?.success) {
          sessionStorage.setItem("token", response?.data?.token);
          sessionStorage.removeItem("otp");
          sessionStorage.removeItem("otpEmail");
          sessionStorage.removeItem("verifyToken");

          message.success(response?.message);
          setTimeout(() => {
            window.location.href = "/admin/home";
          }, 500);
          return;
        }
      }

      if (actionType === "sendOtp") {
        data = {
          email: values.otpEmail,
        };
        sessionStorage.setItem("otpEmail", values.otpEmail);

        response = await forgotPasswordApi(data);

        if (response?.success) {
          message.success(response?.message);
          sessionStorage.setItem("token", response.data.token);
          setRedirect(2);
          return;
        }
      }

      if (actionType === "verifyOtp") {
        data = {
          otp: values.otp,
        };
        response = await verifyOtp(data);
        if (response?.success) {
          sessionStorage.setItem("otp", values?.otp);
          sessionStorage.setItem("verifyToken", response?.data);
          message.success(response?.message);
          formik.setFieldValue("otp", ["", "", "", ""]);
          setRedirect(3);
          return;
        }
      }

      if (actionType === "resetPassword") {
        const data = {
          confirmPassword: values?.confirmPassword,
          password: values?.newPassword,
        };
        response = await resetPassword(data);
        if (response?.success) {
          message.success(response?.message);
          setRedirect(0);
        }
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      let data = {
        email: sessionStorage.getItem("otpEmail"),
      };
      const response = await forgotPasswordApi(data);
      if (response?.success) {
        message.success(response?.message);
        sessionStorage.setItem("token", response.data.token);

        formik.setFieldValue("otp", ["", "", "", "", ""]);
        setTimer(60);
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Load />
        </div>
      )}

      <div
        className=" min-h-screen"
        style={{
          alignItems: "center",
          display: "grid",
          gridTemplateColumns: "50% 50%",
        }}
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            background: "#1d2532",
          }}
        >
          <img
            src={`${bgImage}`}
            alt=""
            style={{ width: "90%", margin: "0 auto" }}
          />
        </div>

        {redirect === 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
            }}
          >
            <div className="bg-white bg-opacity-90 p-10 rounded-xl shadow-2xl w-full max-w-md">
              <h2 className="text-3xl font-extrabold mb-5 text-center text-gray-800">
                Login
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  formik.handleSubmit(e);
                }}
              >
                <div className="mb-6">
                  <label
                    className="block mb-3 text-gray-800 font-semibold"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border-2 p-3 w-full rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 transition ${
                      formik.errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-600 text-sm mt-2">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    className="block mb-3 text-gray-800 font-semibold"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`border-2 p-3 w-full rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 transition ${
                        formik.errors.password
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEye : faEyeSlash}
                        className="text-gray-500"
                      />
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-red-600 text-sm mt-2">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                {/* <div className="w-full mt-1 mb-4 flex justify-end">
                  <button
                    type="button"
                    className="font-medium text-blue-600 hover:text-orange-900 underline"
                    onClick={handleForgetPassword}
                    style={{ cursor: "pointer" }}
                  >
                    Forgot Password
                  </button>
                </div> */}

                <button
                  type="submit"
                  className="bg-[#1d2532] text-white font-semibold py-3 w-full rounded-lg transition-all duration-200"
                >
                  {formik.isSubmitting ? "Logging in ..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        )}

        {redirect === 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "aliceblue",
              padding: "40px",
            }}
          >
            <div className="bg-white bg-opacity-90 p-10 rounded-xl shadow-2xl w-full max-w-md">
              <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
                Send OTP
              </h2>

              <h3 className="font-bold mt-10 mb-5 text-center text-blue-300">
                Enter your registered email
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  formik.handleSubmit(e);
                }}
              >
                <div className="mb-6">
                  <label
                    className="block mb-3 text-gray-800 font-semibold"
                    htmlFor="otpEmail"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="otpEmail"
                    name="otpEmail"
                    placeholder="Enter your email"
                    value={formik.values.otpEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`border-2 p-3 w-full rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 transition ${
                      formik.errors.otpEmail
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formik.touched.otpEmail && formik.errors.otpEmail && (
                    <p className="text-red-600 text-sm mt-2">
                      {formik.errors.otpEmail}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-[#1d2532] text-white font-semibold py-3 w-full rounded-lg transition-all duration-200"
                >
                  {formik.isSubmitting ? "Sending ..." : "Send OTP"}
                </button>
              </form>
            </div>
          </div>
        )}

        {redirect === 2 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "aliceblue",
              padding: "40px",
            }}
          >
            <div className="bg-white bg-opacity-90 p-10 rounded-xl shadow-2xl w-full max-w-md">
              <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
                Verify OTP
              </h2>

              <h3 className="font-bold mt-10 mb-5 text-center text-blue-300">
                Enter your 5 digit otp to verify your email
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  formik.handleSubmit(e);
                }}
              >
                <div className="flex justify-center gap-8">
                  <div className="space-x-2 mt-4 mb-4">
                    {formik.values.otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) =>
                          handleDigitInput(index, e.target.value)
                        }
                        onKeyDown={(e) => handleBackspace(index, e)}
                        ref={inputRefs[index]}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-10 h-10 text-center border border-black rounded-lg"
                      />
                    ))}

                    {formik.errors.otp && (
                      <p className="text-red-600 text-sm mt-2 text-center">
                        {formik.errors.otp}
                      </p>
                    )}
                  </div>
                </div>

                <div className=" text-blue-600 w-40 mb-2 ">
                    <button
                      type="button"
                      className="font-medium hover:text-orange-900 underline"
                      onClick={handleResendOtp}
                      style={{ cursor: timer > 0 ? "not-allowed" : "pointer" }}
                      disabled={timer > 0}
                    >
                      {timer > 0 ? `Resend in : ${timer} s` : "Resend OTP"}
                    </button>
                </div>

                <button
                  type="submit"
                  className="bg-[#1d2532] text-white font-semibold py-3 w-full rounded-lg transition-all duration-200 mt-4"
                >
                  {formik.isSubmitting ? "Verifying ..." : "Verify OTP"}
                </button>
              </form>
            </div>
          </div>
        )}

        {redirect === 3 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "aliceblue",
              padding: "40px",
            }}
          >
            <div className="bg-white bg-opacity-90 p-10 rounded-xl shadow-2xl w-full max-w-md">
              <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
                Reset Password
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  formik.handleSubmit(e);
                }}
              >
                <div className="mb-6">
                  <label
                    className="block mb-3 text-gray-800 font-semibold"
                    htmlFor="newPassword"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      placeholder="Enter your new password"
                      value={formik.values.newPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`border-2 p-3 w-full rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 transition ${
                        formik.errors.newPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center "
                    >
                      <FontAwesomeIcon
                        icon={showNewPassword ? faEye : faEyeSlash}
                        className="text-gray-500 mr-2"
                      />
                    </button>
                  </div>
                  {formik.touched.newPassword && formik.errors.newPassword && (
                    <p className="text-red-600 text-sm mt-2">
                      {formik.errors.newPassword}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    className="block mb-3 text-gray-800 font-semibold"
                    htmlFor="confirmPassword"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`border-2 p-3 w-full rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 transition ${
                        formik.errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center "
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEye : faEyeSlash}
                        className="text-gray-500 mr-2"
                      />
                    </button>
                  </div>
                  {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword && (
                      <p className="text-red-600 text-sm mt-2">
                        {formik.errors.confirmPassword}
                      </p>
                    )}
                </div>

                <button
                  type="submit"
                  className="bg-[#1d2532] text-white font-semibold py-3 w-full rounded-lg transition-all duration-200 mt-4"
                >
                  {formik.isSubmitting ? "Resetting ..." : "Reset Password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
