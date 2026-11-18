import React, { useEffect, useMemo, useState } from 'react';
import { Pagination, Select } from 'antd';
import {
  MdAdd,
  MdSearch,
  MdDiamond,
  MdInventory2,
  MdWarningAmber,
  MdRemoveShoppingCart,
  MdWorkspacePremium,
  MdCurrencyRupee,
  MdGridView,
  MdViewList,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdLocalShipping,
  MdBuild,
  MdStar,
  MdAccountTree,
  MdClose,
} from 'react-icons/md';
import Load from '../Load/Load';
import DeleteModal from '../deleteModal/DeleteModal';
import ProductForm from './ProjectForm';
import ProductView from './ProjectView';
import {
  deleteProjectApi,
  getAllProductsForPickerApi,
  getAllProductCategoriesApi,
} from '../../common/services';
import { errorResponseHandler } from '../../common/http';
import { useToast } from '../toast/Toast';
import { imgSrc } from '../Collections/CollectionForm';

const LOW_STOCK = 3;
const VIEW_KEY = 'admin.products.view';

const rupees = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
const firstImg = (p) => (Array.isArray(p?.imageUrl) && p.imageUrl.length ? p.imageUrl[0] : p?.image || p?.logo || '');
const mainCat = (p) => (typeof p?.categoryId === 'object' ? p.categoryId : null);
const qty = (p) => Number(p?.quantity) || 0;
const discountOf = (p) => (p?.mrp > p?.sellingPrice ? Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100) : 0);

const stockOf = (p) => {
  const q = qty(p);
  if (q <= 0) return { key: 'out', label: 'Out of stock', cls: 'bg-red-50 text-red-700 ring-red-200' };
  if (q <= LOW_STOCK) return { key: 'low', label: `Only ${q} left`, cls: 'bg-amber-50 text-amber-700 ring-amber-200' };
  return { key: 'in', label: `${q} in stock`, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'in', label: 'In stock' },
  { key: 'low', label: 'Low stock' },
  { key: 'out', label: 'Out of stock' },
  { key: 'best', label: 'Best sellers' },
  { key: 'order', label: 'Made to order' },
];

const matchesFilter = (p, key) => {
  if (key === 'all') return true;
  if (key === 'best') return !!p.bestSeller;
  if (key === 'order') return p.shipmentType === 'order';
  return stockOf(p).key === key;
};

const SORTS = [
  { value: 'new', label: 'Newest first' },
  { value: 'old', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'priceLow', label: 'Price: low to high' },
  { value: 'priceHigh', label: 'Price: high to low' },
  { value: 'stockLow', label: 'Stock: lowest first' },
];

const sorters = {
  new: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  old: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  name: (a, b) => (a.name || '').localeCompare(b.name || ''),
  priceLow: (a, b) => a.sellingPrice - b.sellingPrice,
  priceHigh: (a, b) => b.sellingPrice - a.sellingPrice,
  stockLow: (a, b) => qty(a) - qty(b),
};

const readView = () => {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
};

const IconBtn = ({ title, onClick, tone, children }) => {
  const tones = {
    view: 'text-sky-700 bg-sky-50 hover:bg-sky-100',
    edit: 'text-[#1d2532] bg-gray-100 hover:bg-gray-200',
    del: 'text-red-600 bg-red-50 hover:bg-red-100',
  };
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors ${tones[tone]}`}
    >
      {children}
    </button>
  );
};

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [extraCats, setExtraCats] = useState({}); // productId -> number of active extra categories

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [category, setCategory] = useState(undefined);
  const [sort, setSort] = useState('new');
  const [view, setView] = useState(readView);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selected, setSelected] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const message = useToast();

  const fetchAll = async (silent) => {
    try {
      if (!silent) setLoading(true);
      // The products API pages 40 at a time by default; the admin list needs all of them
      const [projRes, linkRes] = await Promise.all([
        getAllProductsForPickerApi(),
        getAllProductCategoriesApi().catch(() => null),
      ]);
      if (projRes?.success) {
        const list = projRes?.data?.products || projRes?.data || [];
        setProducts(Array.isArray(list) ? list : []);
      }
      const counts = {};
      (linkRes?.data || []).forEach((r) => {
        counts[r.product?._id] = r.categories.filter((c) => c.isActive).length;
      });
      setExtraCats(counts);
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* view choice just isn't remembered */
    }
  };

  const stats = useMemo(
    () => ({
      total: products.length,
      inStock: products.filter((p) => qty(p) > 0).length,
      low: products.filter((p) => stockOf(p).key === 'low').length,
      out: products.filter((p) => qty(p) <= 0).length,
      best: products.filter((p) => p.bestSeller).length,
      value: products.reduce((s, p) => s + qty(p) * (Number(p.sellingPrice) || 0), 0),
    }),
    [products],
  );

  const categoryOptions = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const c = mainCat(p);
      if (c?._id) map[c._id] = { value: c._id, label: c.name, count: (map[c._id]?.count || 0) + 1 };
    });
    return Object.values(map)
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((o) => ({ value: o.value, label: `${o.label} (${o.count})` }));
  }, [products]);

  const counts = useMemo(() => {
    const c = {};
    FILTERS.forEach((f) => (c[f.key] = products.filter((p) => matchesFilter(p, f.key)).length));
    return c;
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter(
        (p) =>
          matchesFilter(p, filter) &&
          (!category || mainCat(p)?._id === category) &&
          (!q ||
            (p?.name || '').toLowerCase().includes(q) ||
            (mainCat(p)?.name || '').toLowerCase().includes(q) ||
            (p?.description || '').toLowerCase().includes(q)),
      )
      .sort(sorters[sort]);
  }, [search, products, filter, category, sort]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const resetPage = () => setCurrentPage(1);
  const hasFilters = !!search || filter !== 'all' || !!category;

  const openAdd = () => {
    setFormMode('add');
    setSelected(null);
    setShowForm(true);
  };
  const openEdit = (item) => {
    setFormMode('edit');
    setSelected(item);
    setShowForm(true);
  };
  const openView = (item) => {
    setSelected(item);
    setShowView(true);
  };
  const requestDelete = (item) => {
    setSelected(item);
    setShowDelete(true);
  };

  const handleDelete = async () => {
    try {
      const id = selected?._id || selected?.id;
      if (!id) return;
      const res = await deleteProjectApi(id);
      if (res?.success) {
        message.success('Product deleted successfully');
        fetchAll(true);
      }
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  if (loading) return <Load />;

  const Badges = ({ p }) => (
    <>
      {p.bestSeller && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-[#1d2532] text-[#e3c77a] shadow">
          <MdWorkspacePremium className="text-xs" /> Best seller
        </span>
      )}
      {discountOf(p) > 0 && (
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-rose-600 text-white shadow">
          {discountOf(p)}% OFF
        </span>
      )}
    </>
  );

  const CategoryLine = ({ p }) => {
    const c = mainCat(p);
    const extra = extraCats[p._id] || 0;
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {c ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#fbf6e9] text-[#7a5c14] border border-[#ecd9a6] max-w-[160px]">
            <MdStar className="shrink-0" />
            <span className="truncate">{c.name}</span>
          </span>
        ) : (
          <span className="text-[11px] text-gray-400">No category</span>
        )}
        {extra > 0 && (
          <span
            title={`Also listed in ${extra} more ${extra === 1 ? 'category' : 'categories'}`}
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
          >
            <MdAccountTree /> +{extra}
          </span>
        )}
      </div>
    );
  };

  const Price = ({ p, big }) => (
    <div className="flex items-baseline gap-2">
      <span className={`font-bold text-[#1d2532] ${big ? 'text-lg' : 'text-sm'}`}>{rupees(p.sellingPrice)}</span>
      {p.mrp > p.sellingPrice && <span className="text-xs text-gray-400 line-through">{rupees(p.mrp)}</span>}
    </div>
  );

  const Shipment = ({ p }) =>
    p.shipmentType === 'order' ? (
      <span className="inline-flex items-center gap-1 text-[11px] text-violet-700">
        <MdBuild /> Made to order
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[11px] text-sky-700">
        <MdLocalShipping /> Ready to ship
      </span>
    );

  return (
    <div className="p-4 pb-10 mt-16">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white mb-6 bg-gradient-to-br from-[#1d2532] to-[#2f3b4f]">
        <MdDiamond className="absolute -right-6 -top-6 text-[180px] text-white/5 rotate-12 pointer-events-none" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#e3c77a]">Catalog</p>
            <h2 className="text-3xl font-bold mt-1 !text-white">Products</h2>
            <p className="text-sm text-gray-300 mt-1 max-w-xl">
              Every piece in the store: prices, stock, categories and photos.
            </p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-[#1d2532] shadow-lg hover:brightness-105 transition"
            style={{ background: 'linear-gradient(135deg, #f1dc9e, #c8a24a)' }}
          >
            <MdAdd className="text-xl" /> Add Product
          </button>
        </div>
        <div className="relative flex flex-wrap gap-3 mt-5">
          {[
            { icon: <MdInventory2 />, value: stats.total, label: 'Products' },
            { icon: <MdDiamond />, value: stats.inStock, label: 'Available' },
            { icon: <MdWarningAmber />, value: stats.low, label: `Low stock (≤${LOW_STOCK})` },
            { icon: <MdRemoveShoppingCart />, value: stats.out, label: 'Out of stock' },
            { icon: <MdWorkspacePremium />, value: stats.best, label: 'Best sellers' },
            { icon: <MdCurrencyRupee />, value: rupees(stats.value), label: 'Stock value' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
              <span className="text-xl text-[#e3c77a]">{s.icon}</span>
              <div className="leading-tight">
                <p className="text-lg font-semibold">
                  {typeof s.value === 'number' ? s.value.toLocaleString('en-IN') : s.value}
                </p>
                <p className="text-[11px] text-gray-300">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder="Search by name, category or description"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[#c8a24a]"
          />
          {search && (
            <button
              type="button"
              title="Clear search"
              onClick={() => {
                setSearch('');
                resetPage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <MdClose />
            </button>
          )}
        </div>
        <Select
          allowClear
          showSearch
          value={category}
          onChange={(v) => {
            setCategory(v);
            resetPage();
          }}
          options={categoryOptions}
          optionFilterProp="label"
          placeholder="All categories"
          className="w-56"
          size="large"
        />
        <Select value={sort} onChange={setSort} options={SORTS} className="w-48" size="large" />
        <div className="flex rounded-xl bg-gray-100 p-1" role="group" aria-label="Layout">
          {[
            { v: 'grid', icon: <MdGridView />, label: 'Grid view' },
            { v: 'list', icon: <MdViewList />, label: 'List view' },
          ].map((b) => (
            <button
              key={b.v}
              type="button"
              title={b.label}
              aria-pressed={view === b.v}
              onClick={() => changeView(b.v)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition ${
                view === b.v ? 'bg-white shadow text-[#1d2532]' : 'text-gray-500 hover:text-[#1d2532]'
              }`}
            >
              {b.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              setFilter(f.key);
              resetPage();
            }}
            aria-pressed={filter === f.key}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.key ? 'bg-[#1d2532] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
            <span className={`ml-1.5 text-xs ${filter === f.key ? 'text-[#e3c77a]' : 'text-gray-400'}`}>{counts[f.key]}</span>
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500">
          Showing <b className="text-[#1d2532]">{filtered.length}</b> of {products.length}
        </span>
      </div>

      {/* Products */}
      {!currentItems.length ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl py-14 text-center bg-white">
          <MdInventory2 className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-[#1d2532]">{products.length ? 'No products match' : 'No products yet'}</p>
          <p className="text-sm text-gray-500 mt-1">
            {products.length ? 'Try a different search or filter' : 'Add your first product to get started'}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setFilter('all');
                setCategory(undefined);
                resetPage();
              }}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-[#1d2532] bg-gray-100 hover:bg-gray-200"
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              onClick={openAdd}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#1d2532] hover:bg-[#2f3b4f]"
            >
              Add Product
            </button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentItems.map((p) => {
            const stock = stockOf(p);
            return (
              <article
                key={p._id}
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <button
                  type="button"
                  onClick={() => openView(p)}
                  title="View"
                  className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden"
                >
                  {firstImg(p) ? (
                    <img
                      src={imgSrc(firstImg(p), 320)}
                      alt={p.name}
                      loading="lazy"
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        stock.key === 'out' ? 'grayscale-[60%]' : ''
                      }`}
                    />
                  ) : (
                    <MdDiamond className="absolute inset-0 m-auto text-6xl text-gray-300" />
                  )}
                  <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
                    <Badges p={p} />
                  </div>
                  {Array.isArray(p.imageUrl) && p.imageUrl.length > 1 && (
                    <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/50 text-white">
                      {p.imageUrl.length} photos
                    </span>
                  )}
                  {stock.key === 'out' && (
                    <span className="absolute inset-x-0 bottom-0 py-1.5 text-center text-xs font-bold tracking-widest uppercase bg-white/85 text-red-600">
                      Sold out
                    </span>
                  )}
                </button>

                <div className="p-4 flex-1 flex flex-col gap-2">
                  <CategoryLine p={p} />
                  <h3 className="font-semibold text-[#1d2532] leading-snug line-clamp-2 min-h-[2.6em]" title={p.name}>
                    {p.name}
                  </h3>
                  <Price p={p} big />
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-1">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${stock.cls}`}>{stock.label}</span>
                    <Shipment p={p} />
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    title="Edit"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-white bg-[#1d2532] hover:bg-[#2f3b4f]"
                  >
                    <MdEdit /> Edit
                  </button>
                  <IconBtn title="View" tone="view" onClick={() => openView(p)}>
                    <MdVisibility />
                  </IconBtn>
                  <IconBtn title="Delete" tone="del" onClick={() => requestDelete(p)}>
                    <MdDelete />
                  </IconBtn>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-semibold w-12">#</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Shipping</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((p, idx) => {
                const stock = stockOf(p);
                return (
                  <tr key={p._id} className="border-b last:border-b-0 hover:bg-[#fffaf0] transition-colors">
                    <td className="px-4 py-3 text-gray-400">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <span className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-gray-300 shrink-0">
                          {firstImg(p) ? (
                            <img src={imgSrc(firstImg(p), 160)} alt="" loading="lazy" className="w-full h-full object-cover" />
                          ) : (
                            <MdDiamond className="text-xl" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1d2532] line-clamp-1" title={p.name}>
                            {p.name}
                          </p>
                          <div className="flex gap-1.5 mt-1">
                            {p.bestSeller && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1d2532] text-[#e3c77a]">BEST SELLER</span>
                            )}
                            {discountOf(p) > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">
                                {discountOf(p)}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryLine p={p} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Price p={p} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${stock.cls}`}>{stock.label}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Shipment p={p} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <IconBtn title="View" tone="view" onClick={() => openView(p)}>
                          <MdVisibility />
                        </IconBtn>
                        <IconBtn title="Edit" tone="edit" onClick={() => openEdit(p)}>
                          <MdEdit />
                        </IconBtn>
                        <IconBtn title="Delete" tone="del" onClick={() => requestDelete(p)}>
                          <MdDelete />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > pageSize && (
        <div className="flex justify-center mt-6">
          <Pagination
            current={currentPage}
            total={filtered.length}
            pageSize={pageSize}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            pageSizeOptions={['12', '24', '48']}
          />
        </div>
      )}

      {showForm && (
        <ProductForm
          mode={formMode}
          initial={selected}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchAll(true);
          }}
        />
      )}

      {showView && selected && (
        <ProductView show={showView} setShow={setShowView} product={selected} onEdit={openEdit} />
      )}

      {showDelete && <DeleteModal onClose={() => setShowDelete(false)} handleDelete={handleDelete} />}
    </div>
  );
};

export default Products;
