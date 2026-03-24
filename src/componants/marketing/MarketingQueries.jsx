import React, { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import { AiOutlineEye } from "react-icons/ai";
import { getAllMarketingQueryApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import Load from "../Load/Load";
import ViewMarketingQuery from "./ViewMarketingQuery";

const ITEMS_PER_PAGE = 10;

const MarketingQueries = () => {
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const [showViewQuery, setShowViewQuery] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);

  const fetchQueries = async () => {
    try {
      const res = await getAllMarketingQueryApi();
      if (res?.success) {
        const list = res?.data?.queries || res?.data || [];
        setQueries(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return queries;
    return queries.filter((it) => {
      const name = `${it?.firstName || ""} ${it?.lastName || ""}`.toLowerCase();
      const email = `${it?.email || ""}`.toLowerCase();
      const subject = `${it?.subject || ""}`.toLowerCase();
      const message = `${it?.message || ""}`.toLowerCase();
      return (
        name.includes(q) || email.includes(q) || subject.includes(q) || message.includes(q)
      );
    });
  }, [search, queries]);


  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);



  const openView = (q) => {
    setSelectedQuery(q);
    setShowViewQuery(true);
  };

  if (loading) return <Load />;

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-black">Marketing Queries</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search name, email, subject, message"
          className="px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <table className="min-w-full bg-[#1d2532] border border-b-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center text-white">S.No</th>
              <th className="py-2 px-4 border-b text-center text-white">Name</th>
              <th className="py-2 px-4 border-b text-center text-white">Email</th>
              <th className="py-2 px-4 border-b text-center text-white">Phone</th>
              <th className="py-2 px-4 border-b text-center text-white">Date</th>
              <th className="py-2 px-4 border-b text-center text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((q, idx) => (
                <tr
                  key={q?._id || idx}
                  className={`hover:bg-gray-200 text-center transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-300"}`}
                >
                  <td className="py-2 px-4 border-b">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td className="py-2 px-4 border-b">{q?.firstName + ' ' + q?.lastName}</td>
                  <td className="py-2 px-4 border-b">{q?.email || "-"}</td>
                  <td className="py-2 px-4 border-b">{q?.phone || "-"}</td>
                  <td className="py-2 px-4 border-b">
                    {q?.createdAt ? new Date(q.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openView(q)}
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                        title="View"
                      >
                        <AiOutlineEye className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-white font-bold">
                  No marketing queries found
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

      {showViewQuery && selectedQuery && (
        <ViewMarketingQuery
          showViewQuery={showViewQuery}
          setShowViewQuery={setShowViewQuery}
          query={selectedQuery}
        />
      )}
    </div>
  );
};

export default MarketingQueries;