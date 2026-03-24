import React, { useEffect, useMemo, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { CiEdit } from 'react-icons/ci';
import { AiFillDelete } from 'react-icons/ai';
import { Pagination } from 'antd';
import Load from '../Load/Load';
import DeleteModal from '../deleteModal/DeleteModal';
import ProductForm from './ProjectForm';
import ProductView from './ProjectView';
import {
  deleteProjectApi,
  getAllProjectsApi,
} from '../../common/services';
import { errorResponseHandler } from '../../common/http';
import { useToast } from '../toast/Toast';
import { image_url } from '../../common/env';

const ITEMS_PER_PAGE = 10;

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selected, setSelected] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const message = useToast();

  const fetchAll = async () => {
    try {
      setLoading(true);
      const projRes = await getAllProjectsApi();
      if (projRes?.success) {
        const list = projRes?.data?.products || projRes?.data || [];
        setProducts(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        (p?.title || '').toLowerCase().includes(q) ||
        (p?.description || '').toLowerCase().includes(q),
    );
  }, [search, products]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

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
        fetchAll();
      }
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  if (loading) return <Load />;

  const img = (p) => {
    if (Array.isArray(p?.imageUrl) && p.imageUrl.length > 0) {
      return p.imageUrl[0];
    }
    return p?.image || p?.logo || '';
  };

  return (
    <div className="p-4 mt-16" style={{ zIndex: 9999999 }}>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-black">Products</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by title or description"
            className="px-3 py-2 border rounded-md"
          />
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-md bg-[#1d2532] text-white hover:bg-gray-700"
          >
            Add Product
          </button>
        </div>
      </div>

      <div>
        <table className="min-w-full bg-[#1d2532] border border-b-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center text-white">
                S.No
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Image
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Name
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Price
              </th>
              <th className="py-2 px-4 border-b text-center text-white">MRP</th>
              <th className="py-2 px-4 border-b text-center text-white">
                Quantity
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                IsShopByProduct
              </th>

               <th className="py-2 px-4 border-b text-center text-white">
                Shipment Type
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length ? (
              currentItems.map((p, idx) => (
                <tr
                  key={p?._id || idx}
                  className={`hover:bg-gray-200 text-center transition ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-300'
                  }`}
                >
                  <td className="py-2 px-4 border-b">
                    {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {img(p) ? (
                      <img
                        src={`${image_url}/${img(p)}`}
                        alt={p?.title}
                        className="w-10 h-10 rounded object-cover mx-auto border"
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">{p?.name}</td>
                  <td className="py-2 px-4 border-b">{p?.sellingPrice}</td>
                  <td className="py-2 px-4 border-b"> {p?.mrp ? p.mrp : 0}</td>

                  <td className="py-2 px-4 border-b">{p?.quantity || '-'}</td>

                  <td className="py-2 px-4 border-b">
                    {p?.categoryId?.isShopByProduct ? 'True' : 'False'}
                  </td>

                   <td className="py-2 px-4 border-b">
                    {p?.categoryId?.shipmentType==='order' ? 'Made to order':'Free to ship'}
                    </td>

                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openView(p)}
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                        title="View"
                      >
                        <AiOutlineEye className="text-lg" />
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="text-green-500 hover:text-green-700 flex items-center"
                        title="Edit"
                      >
                        <CiEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => requestDelete(p)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                        title="Delete"
                      >
                        <AiFillDelete className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="py-4 text-center text-white font-bold"
                >
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <Pagination
            current={currentPage}
            total={filtered.length}
            pageSize={ITEMS_PER_PAGE}
            onChange={setCurrentPage}
            showSizeChanger={false}
            className="mt-4 flex justify-end"
          />
        )}
      </div>

      {showForm && (
        <ProductForm
          mode={formMode}
          initial={selected}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchAll();
          }}
        />
      )}

      {showView && selected && (
        <ProductView show={showView} setShow={setShowView} product={selected} />
      )}

      {showDelete && (
        <DeleteModal
          onClose={() => setShowDelete(false)}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Products;
