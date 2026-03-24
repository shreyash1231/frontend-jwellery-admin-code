import React, { useState } from 'react';
import { image_url } from '../../common/env';

const ProductView = ({ show, setShow, product }) => {
  const close = () => setShow(false);
  const [openFaq, setOpenFaq] = useState(null);

  if (!show || !product) return null;

  const images = Array.isArray(product?.imageUrl) ? product.imageUrl : [];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 9999999 }}
    >
      <div className="bg-white rounded-2xl shadow-lg w-[700px] max-h-[650px] flex flex-col">
        <h3 className="text-xl font-bold text-center bg-[#1d2532] py-2 text-white rounded-t-2xl">
          Product Details
        </h3>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ================= IMAGES ================= */}
          <div>
            <label className="font-semibold block mb-2 text-center">
              Product Images
            </label>

            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={`${image_url}/${img}`}
                    alt={`product-${idx}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center bg-gray-100 border rounded">
                No Images Available
              </div>
            )}
          </div>

          {/* ================= BASIC INFO ================= */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Name</label>
              <input
                value={product.name}
                readOnly
                className="w-full bg-gray-200 border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="font-semibold">Price</label>
              <input
                value={product.sellingPrice}
                readOnly
                className="w-full bg-gray-200 border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Quantity</label>
              <input
                value={product.quantity}
                readOnly
                className="w-full bg-gray-200 border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="font-semibold">Category</label>
              <input
                value={product?.categoryId?.name || '-'}
                readOnly
                className="w-full bg-gray-200 border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="font-semibold">Shipment Type</label>
              <input
                value={
                  product?.shipementType === 'order'
                    ? 'Made to order'
                    : 'Ready to ship'
                }
                readOnly
                className="w-full bg-gray-200 border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* ================= DESCRIPTION ================= */}
          <div>
            <label className="font-semibold">Description</label>
            <textarea
              value={product.description}
              readOnly
              rows={4}
              className="w-full bg-gray-200 border px-3 py-2 rounded"
            />
          </div>

          {product.benefits && (
            <div>
              <label className="font-semibold">Benefits</label>
              <textarea
                value={product.benefits}
                readOnly
                rows={3}
                className="w-full bg-gray-200 border px-3 py-2 rounded"
              />
            </div>
          )}

          {product.features && (
            <div>
              <label className="font-semibold">Features</label>
              <textarea
                value={product.features}
                readOnly
                rows={3}
                className="w-full bg-gray-200 border px-3 py-2 rounded"
              />
            </div>
          )}

          {/* ================= FAQs ================= */}
          {Array.isArray(product?.faqs) && product.faqs.length > 0 && (
            <div>
              <label className="font-semibold block mb-2">FAQs</label>

              <div className="space-y-3">
                {product.faqs.map((faq, index) => (
                  <div
                    key={faq._id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setOpenFaq(openFaq === index ? null : index)
                      }
                      className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200"
                    >
                      <span className="font-medium">
                        {index + 1}. {faq.question}
                      </span>
                      <span>{openFaq === index ? '−' : '+'}</span>
                    </button>

                    {openFaq === index && (
                      <div className="px-4 py-3 border-t bg-white">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= ACTION ================= */}
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={close}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
