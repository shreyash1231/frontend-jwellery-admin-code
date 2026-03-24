import React, { useEffect, useState} from "react";
import { useFormik } from "formik";
import defalutImage from "../../../Images/noProfile.jpg";
import { message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import * as Yup from "yup";
import NewLoad from "../../Load/Load";
import { getProfileApi, updateProfileApi } from "../../../common/services";
import { errorResponseHandler } from "../../../common/http";


function UpdateProfile({ setOpen }) {
  const [loading, setLoading] = useState(false);
  const [adminProfile, setAdminProfile] = useState({});
  const [image, setImage] = useState(null)
  const [updating, setUpdateing] = useState(false)

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
  const id = await sessionStorage.getItem("id")
      const response = await getProfileApi(id);

      if (response?.success) {
        setAdminProfile(response?.data);
      }
    } catch (error) {
      errorResponseHandler(error)
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: adminProfile?.email || "",
      fullName: adminProfile?.name || "",
      picture: adminProfile?.profileImage || null,
    },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .required("Full name is required")
        .max(30, "Full name should not be more than 30 characters")
        .min(2, "Fist name should be atleast 2 characters long")
        .trim("First name should not have spaces")
        .matches(
          /^[a-zA-Z\s]*$/,
          "First name should not contain special characters or numbers"
        ),
      picture: Yup.string().required(
        "Profile picture is required can not be empty"
      ),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setUpdateing(true);
        const formData = new FormData();
        formData.append("name", values.fullName);
        formData.append("file", image)


        const response = await updateProfileApi(formData);


        if (response?.success) {
          setAdminProfile(response?.data?.data)
          resetForm();
          fetchAdminProfile()
          message.success(response?.message)
        }

      } catch (error) {
        errorResponseHandler(error)

      } finally {
        setUpdateing(false);
        setSubmitting(false);
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      formik.setFieldValue("picture", URL.createObjectURL(file))
      setImage(file)
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg w-[700px] h-[600px] flex flex-col">
        <h3 className="text-xl font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
          Admin Profile
        </h3>
        <div className="flex-1 overflow-y-auto">
          <form className="p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <img
                  src={
                    formik.values.picture !== null
                      ? formik.values.picture
                      : defalutImage
                  }
                  alt="Profile Preview"
                  className="border border-gray-800 w-48 h-48 object-cover rounded-full"
                />
                <button
                  type="button"
                  className="w-10 h-10 absolute bottom-2 right-2 bg-white text-black p-2 rounded-full shadow hover:bg-gray-200"
                  onClick={() => {
                    document.getElementById('fileInput').click()
                  }}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
                {/* Hidden file input field */}
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="w-full">
              <label className="block mb-1">Name </label>
              <input
                type="text"
                name="fullName"
                className="border border-gray-900 p-2 w-full"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.fullName}
                placeholder="Enter your name"
              />
              {formik.errors.fullName && (
                <p className="text-red-600">{formik.errors.fullName}</p>
              )}
            </div>

            <div className="w-full mt-4">
              <label className="block mb-1">Email </label>
              <input
                type="text"
                name="email"
                className="border border-gray-900 p-2 w-full bg-gray-100"
                value={adminProfile?.email}
                placeholder="Enter your email"
                disabled
              />
              {/* {formik.touched.firstName && formik.errors.firstName && (
                                <p className='text-red-600'>{formik.errors.firstName}</p>
                            )} */}
            </div>
          </form>
        </div>
        <div className="flex justify-end p-4 border-t gap-6">
          <button
            onClick={handleClose}
            className="bg-gray-300 text-black w-52 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
          >
            Close
          </button>
          <button
            onClick={formik.handleSubmit}
            disabled={updating}
            className=" text-white py-2 px-4 rounded-md w-52 bg-[#1d2532] transition duration-200 mr-2"
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>

      {loading && <NewLoad />}
    </div>
  );
}

export default UpdateProfile;
