import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { message } from "antd";
import NewLoad from "../../Load/Load";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { changePassword } from "../../../common/services";
import { errorResponseHandler } from "../../../common/http";
import { useToast } from "../../toast/Toast";

function ChangePassword({ setOpen }) {
  const [loading, setLoading] = useState(false);

  const [isOldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setConfirmNewPasswordVisible] = useState(false);
  const message=useToast();

  const handleClose = () => {
    setOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required("Old password is required"),
      newPassword: Yup.string()
        .required("New password is required")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        ),
      confirmPassword: Yup.string()
        .required("Confirm password is required")
        .oneOf([Yup.ref("newPassword")], "New password and confirm password should match"),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setLoading(true);
        const response = await changePassword(values);

        if (response?.success) {
          message.success(response?.message);
          resetForm();
          setOpen(false);
        }
      } catch (error) {
        errorResponseHandler(error);
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[700px] h-[500px] flex flex-col">
        <h3 className="text-xl font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
          Change Password
        </h3>

        <form onSubmit={formik.handleSubmit} className="flex-1 flex flex-col justify-between p-8 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Old Password</label>
              <div className="relative">
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type={isOldPasswordVisible ? "text" : "password"}
                  className="border border-gray-900 p-2 w-full"
                  placeholder="Enter your old password"
                  value={formik.values.oldPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setOldPasswordVisible(!isOldPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2"
                >
                  <FontAwesomeIcon
                    icon={isOldPasswordVisible ? faEye : faEyeSlash}
                    className="text-gray-500"
                  />
                </button>
              </div>
              {formik.touched.oldPassword && formik.errors.oldPassword && (
                <p className="text-red-600">{formik.errors.oldPassword}</p>
              )}
            </div>

            <div>
              <label className="block mb-1">New Password</label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={isNewPasswordVisible ? "text" : "password"}
                  className="border border-gray-900 p-2 w-full"
                  placeholder="Enter your new password"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setNewPasswordVisible(!isNewPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2"
                >
                  <FontAwesomeIcon
                    icon={isNewPasswordVisible ? faEye : faEyeSlash}
                    className="text-gray-500"
                  />
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <p className="text-red-600">{formik.errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={isConfirmNewPasswordVisible ? "text" : "password"}
                  className="border border-gray-900 p-2 w-full"
                  placeholder="Confirm your new password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setConfirmNewPasswordVisible(!isConfirmNewPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2"
                >
                  <FontAwesomeIcon
                    icon={isConfirmNewPasswordVisible ? faEye : faEyeSlash}
                    className="text-gray-500"
                  />
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-600">{formik.errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-300 text-black w-40 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1d2532] text-white w-40 py-2 px-4 rounded-md hover:bg-gray-800 transition duration-200"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>

        {loading && <NewLoad />}
      </div>
    </div>
  );
}

export default ChangePassword;
