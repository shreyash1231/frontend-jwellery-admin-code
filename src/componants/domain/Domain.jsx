import React, { useEffect, useState, useMemo } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { CiEdit } from "react-icons/ci";
import { AiFillDelete } from "react-icons/ai";
import { Pagination } from "antd";
import Load from "../Load/Load";
import DeleteModal from "../deleteModal/DeleteModal";
import DomainView from "./DomainView";
import DomainForm from "./DomainForm";
import { getDomainsApi, deleteDomainApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";

const ITEMS_PER_PAGE = 10;

/* ================= HELPERS ================= */

const pickName = (item) =>
  item?.name || item?.domain_name || item?.title || "";

const pickDescription = (item) =>
  item?.description || item?.domain_name || item?.title || "";

const trimText = (text, limit = 20) => {
  if (!text) return "-";
  return text.length > limit ? text.slice(0, limit) + "..." : text;
};

const Domain = () => {
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showView, setShowView] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selected, setSelected] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const message=useToast();

  /* ================= FETCH ONCE ================= */

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const res = await getDomainsApi();
      if (res?.success) {
        setDomains(res?.data || []);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  /* ================= LOCAL SEARCH ================= */

  const filteredDomains = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return domains;

    return domains.filter((item) => {
      const name = pickName(item).toLowerCase();
      const desc = pickDescription(item).toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [search, domains]);

  /* ================= PAGINATION ================= */

  const paginatedDomains = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDomains.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDomains, currentPage]);

  /* ================= ACTIONS ================= */

  const openAdd = () => {
    setFormMode("add");
    setSelected(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setFormMode("edit");
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

      const res = await deleteDomainApi(id);
      if (res?.success) {
        message.success("Category deleted successfully");
        fetchDomains();
      }
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  if (loading) return <Load />;

  /* ================= UI ================= */

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Categories</h2>

        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name or description"
            className="px-3 py-2 border rounded-md"
          />
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-[#1d2532] text-white rounded-md"
          >
            Add Category
          </button>
        </div>
      </div>

      <table className="min-w-full bg-[#1d2532]">
        <thead>
          <tr>
            <th className="text-white py-2">S.No</th>
            <th className="text-white py-2">Name</th>
            <th className="text-white py-2">Description</th>
            <th className="text-white py-2">Shop By Product</th>
            <th className="text-white py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedDomains.length ? (
            paginatedDomains.map((item, idx) => (
              <tr
                key={item._id}
                className={idx % 2 ? "bg-gray-200" : "bg-white"}
              >
                <td className="text-center py-2">
                  {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                </td>
                <td className="text-center py-2">
                  {pickName(item)}
                </td>
                <td className="text-center py-2">
                  {trimText(pickDescription(item))}
                </td>
                <td className="text-center py-2">
                  {item.isShopByProduct ? (
                    <span className="text-green-600 font-bold">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </td>
                <td className="text-center py-2">
                  <div className="flex justify-center gap-3">
                    <AiOutlineEye onClick={() => openView(item)} />
                    <CiEdit onClick={() => openEdit(item)} />
                    <AiFillDelete onClick={() => requestDelete(item)} />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-6 text-white">
                No categories found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {filteredDomains.length > 0 && (
        <Pagination
          current={currentPage}
          total={filteredDomains.length}
          pageSize={ITEMS_PER_PAGE}
          onChange={setCurrentPage}
          className="mt-4 flex justify-end"
        />
      )}

      {showView && (
        <DomainView showView={showView} setShowView={setShowView} domain={selected} />
      )}

      {showForm && (
        <DomainForm
          mode={formMode}
          initialDomain={selected}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchDomains();
          }}
        />
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

export default Domain;
