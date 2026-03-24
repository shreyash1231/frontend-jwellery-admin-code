import React, { useState } from "react";
import { updateCouponApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { message } from "antd";
import { useToast } from "../toast/Toast";

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .required("Coupon code is required")
    .matches(/^[A-Z0-9]+$/, "Code must be uppercase letters and numbers only"),
  type: Yup.string()
    .required("Type is required")
    .oneOf(["AMOUNT", "PERCENT"], "Type must be AMOUNT or PERCENT"),
  value: Yup.number()
    .required("Value is required")
    .positive("Value must be positive")
    .when("type", {
      is: "PERCENT",
      then: (schema) => schema.max(100, "Percentage cannot exceed 100"),
    }),
  maxDiscount: Yup.number()
    .nullable()
    .when("type", {
      is: "PERCENT",
      then: (schema) =>
        schema.positive("Max discount must be positive if provided"),
    }),
  minOrderValue: Yup.number()
    .min(0, "Minimum order value cannot be negative")
    .nullable(),
  expiresAt: Yup.date().nullable(),
  usageLimit: Yup.number()
    .positive("Usage limit must be positive")
    .integer("Usage limit must be a whole number")
    .nullable(),
  perUserLimit: Yup.number()
    .positive("Per user limit must be positive")
    .integer("Per user limit must be a whole number")
    .nullable(),
  // isActive: Yup.boolean(),
});

function EditModal({ onClose, fetchCoupons, selectedCoupon }) {
  const [submitting, setSubmitting] = useState(false);

  const formatDateLocal = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const message=useToast();

  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      let data = {
        code: values.code.toUpperCase(),
        type: values.type,
        value: Number(values.value),
        minOrderValue: values.minOrderValue ? Number(values.minOrderValue) : 0,
        perUserLimit: values.perUserLimit ? Number(values.perUserLimit) : 1,
        // isActive: values.isActive,
      };

      // Add maxDiscount only for PERCENT type
      if (values.type === "PERCENT" && values.maxDiscount) {
        data.maxDiscount = Number(values.maxDiscount);
      }

      // Add optional fields
      if (values.expiresAt) {
        data.expiresAt = new Date(values.expiresAt).toISOString();
      }
      if (values.usageLimit) {
        data.usageLimit = Number(values.usageLimit);
      }

      const res = await updateCouponApi(
        selectedCoupon._id || selectedCoupon.id,
        data,
      );
      if (res.success) {
        message.success("Coupon updated successfully!");
        fetchCoupons();
        resetForm();
        onClose();
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedCoupon) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-2 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] max-h-[90vh] flex flex-col">
        <h3 className="text-lg font-bold mb-1 text-center bg-[#1d2532] py-2 text-white">
          Edit Coupon
        </h3>
        <Formik
          initialValues={{
            code: selectedCoupon.code || "",
            type: selectedCoupon.type || "AMOUNT",
            value: selectedCoupon.value || "",
            maxDiscount: selectedCoupon.maxDiscount || "",
            minOrderValue: selectedCoupon.minOrderValue || "",
            expiresAt: formatDateLocal(selectedCoupon.expiresAt),
            usageLimit: selectedCoupon.usageLimit || "",
            perUserLimit: selectedCoupon.perUserLimit || "1",
            //   isActive: selectedCoupon.isActive !== undefined ? selectedCoupon.isActive : true,
          }}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-5">
                {/* Coupon Code */}
                <div>
                  <label className="block mb-2 font-semibold">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="text"
                    name="code"
                    className="border border-gray-900 p-2 w-full rounded-md"
                    placeholder="Enter coupon code"
                    onChange={(e) => {
                      setFieldValue("code", e.target.value.toUpperCase());
                    }}
                  />
                  <ErrorMessage
                    name="code"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block mb-2 font-semibold">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    name="type"
                    className="border border-gray-900 p-2 w-full rounded-md"
                  >
                    <option value="AMOUNT">Amount (₹)</option>
                    <option value="PERCENT">Percentage (%)</option>
                  </Field>
                  <ErrorMessage
                    name="type"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Value */}
                <div>
                  <label className="block mb-2 font-semibold">
                    Discount Value {values.type === "PERCENT" ? "(%)" : "(₹)"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="number"
                    name="value"
                    className="border border-gray-900 p-2 w-full rounded-md"
                    placeholder={
                      values.type === "PERCENT"
                        ? "Enter percentage (0-100)"
                        : "Enter amount"
                    }
                    min={0}
                    max={values.type === "PERCENT" ? 100 : undefined}
                  />
                  <ErrorMessage
                    name="value"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Max Discount - Only show for PERCENT type */}
                {values.type === "PERCENT" && (
                  <div>
                    <label className="block mb-2 font-semibold">
                      Maximum Discount (₹){" "}
                      <span className="text-gray-500 text-sm font-normal">
                        (Optional - Safety cap for % coupons)
                      </span>
                    </label>
                    <Field
                      type="number"
                      name="maxDiscount"
                      className="border border-gray-900 p-2 w-full rounded-md"
                      placeholder="Enter maximum discount amount"
                      min={0}
                    />
                    <ErrorMessage
                      name="maxDiscount"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}

                {/* Minimum Order Value */}
                <div>
                  <label className="block mb-2 font-semibold">
                    Minimum Order Value (₹){" "}
                    <span className="text-gray-500 text-sm font-normal">
                      (Optional)
                    </span>
                  </label>
                  <Field
                    type="number"
                    name="minOrderValue"
                    className="border border-gray-900 p-2 w-full rounded-md"
                    placeholder="Enter minimum order value (default: 0)"
                    min={0}
                  />
                  <ErrorMessage
                    name="minOrderValue"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block mb-2 font-semibold">
                    Expiry Date{" "}
                    <span className="text-gray-500 text-sm font-normal">
                      (Optional)
                    </span>
                  </label>
                  <Field
                    type="date"
                    name="expiresAt"
                    min={new Date().toISOString().split("T")[0]}
                    className="border border-gray-900 p-2 w-full rounded-md"
                  />
                  <ErrorMessage
                    name="expiresAt"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block mb-2 font-semibold">
                    Total Usage Limit{" "}
                    <span className="text-gray-500 text-sm font-normal">
                      (Optional)
                    </span>
                  </label>
                  <Field
                    type="number"
                    name="usageLimit"
                    className="border border-gray-900 p-2 w-full rounded-md"
                    placeholder="Enter maximum number of uses (leave empty for unlimited)"
                    min={1}
                  />
                  <ErrorMessage
                    name="usageLimit"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Per User Limit */}
                <div>
                  <label className="block mb-2 font-semibold">
                    Per User Limit{" "}
                    <span className="text-gray-500 text-sm font-normal">
                      (Optional)
                    </span>
                  </label>
                  <Field
                    type="number"
                    name="perUserLimit"
                    className="border border-gray-900 p-2 w-full rounded-md"
                    placeholder="Max uses per user (default: 1)"
                    min={1}
                  />
                  <ErrorMessage
                    name="perUserLimit"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Used Count - Display Only */}
                {selectedCoupon.usedCount !== undefined && (
                  <div>
                    <label className="block mb-2 font-semibold">
                      Times Used{" "}
                      <span className="text-gray-500 text-sm font-normal">
                        (Read only)
                      </span>
                    </label>
                    <p className="border border-gray-300 p-2 w-full rounded-md bg-gray-100 text-gray-600">
                      {selectedCoupon.usedCount}
                    </p>
                  </div>
                )}

                {/* Is Active */}
                {/* <div className="flex items-center gap-3">
                  <Field
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    className="w-5 h-5 rounded border-gray-900"
                  />
                  <label htmlFor="isActive" className="font-semibold cursor-pointer">
                    Active{" "}
                    <span className="text-gray-500 text-sm font-normal">
                      (Coupon can be used)
                    </span>
                  </label>
                </div> */}
              </div>

              <div className="flex justify-end p-4 border-t gap-6 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 text-black w-52 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-white py-2 px-4 rounded-md w-52 bg-[#1d2532] hover:bg-gray-800 transition duration-200 disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Update"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default EditModal;
