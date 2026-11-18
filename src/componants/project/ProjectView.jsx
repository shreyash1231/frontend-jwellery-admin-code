import React, { useEffect, useState } from 'react';
import {
  MdClose,
  MdDiamond,
  MdEdit,
  MdWorkspacePremium,
  MdLocalShipping,
  MdBuild,
  MdInventory2,
  MdStar,
  MdExpandMore,
  MdChevronLeft,
  MdChevronRight,
  MdAccountTree,
} from 'react-icons/md';
import { image_url } from '../../common/env';
import { getProductCategoriesApi, getDomainsApi } from '../../common/services';

const rupees = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

const Tile = ({ icon, label, children }) => (
  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
      <span className="text-sm text-[#c8a24a]">{icon}</span>
      {label}
    </p>
    <div className="mt-1 text-sm font-semibold text-[#1d2532]">{children}</div>
  </div>
);

const TextBlock = ({ title, text }) =>
  text ? (
    <div>
      <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">{title}</h5>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  ) : null;

const ProductView = ({ show, setShow, product, onEdit }) => {
  const close = () => setShow(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [active, setActive] = useState(0);
  const [extras, setExtras] = useState([]); // [{ name, isActive }]

  // Extra categories from the Multi Category page
  useEffect(() => {
    if (!product?._id) return;
    let alive = true;
    Promise.all([getProductCategoriesApi(product._id), getDomainsApi()])
      .then(([linkRes, catRes]) => {
        if (!alive) return;
        const names = {};
        (catRes?.data || []).forEach((c) => (names[c._id] = c.name));
        setExtras(
          (linkRes?.data || [])
            .map((l) => ({ name: names[l.category?._id || l.category], isActive: l.isActive !== false }))
            .filter((l) => l.name),
        );
      })
      .catch(() => alive && setExtras([]));
    return () => {
      alive = false;
    };
  }, [product?._id]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setShow(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setShow]);

  if (!show || !product) return null;

  const images = Array.isArray(product?.imageUrl) ? product.imageUrl : [];
  const current = images[Math.min(active, images.length - 1)];
  const q = Number(product.quantity) || 0;
  const discount =
    product.mrp > product.sellingPrice ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0;
  const stock =
    q <= 0
      ? { label: 'Out of stock', cls: 'text-red-600' }
      : q <= 3
        ? { label: `Only ${q} left`, cls: 'text-amber-600' }
        : { label: `${q} in stock`, cls: 'text-emerald-600' };
  const faqs = Array.isArray(product?.faqs) ? product.faqs : [];
  const step = (d) => setActive((i) => (i + d + images.length) % images.length);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#0f141c]/60 backdrop-blur-sm p-2 sm:p-4"
      style={{ zIndex: 9999999 }}
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#f6f7f9] rounded-3xl shadow-2xl w-full max-w-[960px] max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-[1.05fr_1fr]">
            {/* GALLERY */}
            <div className="bg-white p-4 sm:p-5 md:border-r border-gray-200">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {current ? (
                  <img src={`${image_url}/${current}`} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                    <MdDiamond className="text-7xl" />
                    <span className="text-sm mt-2">No photos</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
                  {product.bestSeller && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-[#1d2532] text-[#e3c77a] shadow">
                      <MdWorkspacePremium /> Best seller
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-rose-600 text-white shadow">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      title="Previous photo"
                      onClick={() => step(-1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-xl text-[#1d2532] hover:bg-white"
                    >
                      <MdChevronLeft />
                    </button>
                    <button
                      type="button"
                      title="Next photo"
                      onClick={() => step(1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-xl text-[#1d2532] hover:bg-white"
                    >
                      <MdChevronRight />
                    </button>
                    <span className="absolute bottom-3 right-3 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/50 text-white">
                      {active + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActive(idx)}
                      title={`Photo ${idx + 1}`}
                      className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        idx === active ? 'border-[#c8a24a]' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={`${image_url}/${img}`} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div className="relative p-5 sm:p-6 space-y-5">
              <button
                type="button"
                onClick={close}
                title="Close"
                className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-xl text-[#1d2532]"
              >
                <MdClose />
              </button>

              <div className="pr-10">
                <p className="text-[11px] tracking-[0.25em] uppercase text-[#c8a24a] font-semibold">Product details</p>
                <h3 className="text-2xl font-bold text-[#1d2532] leading-tight mt-1">{product.name}</h3>
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-3xl font-bold text-[#1d2532]">{rupees(product.sellingPrice)}</span>
                  {product.mrp > product.sellingPrice && (
                    <>
                      <span className="text-base text-gray-400 line-through">{rupees(product.mrp)}</span>
                      <span className="text-sm font-bold text-rose-600">Save {rupees(product.mrp - product.sellingPrice)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Tile icon={<MdInventory2 />} label="Stock">
                  <span className={stock.cls}>{stock.label}</span>
                </Tile>
                <Tile icon={product.shipmentType === 'order' ? <MdBuild /> : <MdLocalShipping />} label="Shipping">
                  {product.shipmentType === 'order' ? 'Made to order' : 'Ready to ship'}
                </Tile>
                <div className="col-span-2">
                  <Tile icon={<MdStar />} label="Categories">
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#fbf6e9] text-[#7a5c14] border border-[#ecd9a6]">
                        <MdStar /> {product?.categoryId?.name || 'No category'}
                      </span>
                      {extras.map((c) => (
                        <span
                          key={c.name}
                          title={c.isActive ? 'Extra category' : 'Extra category (inactive)'}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                            c.isActive ? 'bg-white text-[#1d2532] border-gray-200' : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
                          }`}
                        >
                          <MdAccountTree className="text-gray-400" /> {c.name}
                        </span>
                      ))}
                    </div>
                  </Tile>
                </div>
              </div>

              <TextBlock title="Description" text={product.description} />
              <TextBlock title="Additional info" text={product.additionalInfo} />
              <TextBlock title="Return and help" text={product.benefits} />
              <TextBlock title="Use" text={product.use} />
              <TextBlock title="Features" text={product.features} />

              {faqs.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    FAQs ({faqs.length})
                  </h5>
                  <div className="space-y-2">
                    {faqs.map((faq, index) => {
                      const open = openFaq === index;
                      return (
                        <div key={faq._id || index} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                          <button
                            type="button"
                            aria-expanded={open}
                            onClick={() => setOpenFaq(open ? null : index)}
                            className="w-full flex justify-between items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                          >
                            <span className="text-sm font-medium text-[#1d2532]">{faq.question}</span>
                            <MdExpandMore className={`text-xl text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                          </button>
                          {open && <div className="px-4 pb-3 text-sm text-gray-600 whitespace-pre-line">{faq.answer}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white shrink-0">
          <button
            type="button"
            onClick={close}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#1d2532] bg-gray-100 hover:bg-gray-200"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                close();
                onEdit(product);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1d2532] hover:bg-[#2f3b4f] shadow"
            >
              <MdEdit /> Edit product
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductView;
