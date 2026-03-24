import React, { useEffect, useState } from "react";
import { getNewsLettersApi } from "../../common/services";
import { Pagination } from "antd";
import { errorResponseHandler } from "../../common/http";
import Load from "../Load/Load";

const NewsLetter = () => {
  const [newsLetterData, setNewsLetterData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  const fetchNewsletters = async (page) => {
    setLoading(true);
    try {
      const res = await getNewsLettersApi({ page, limit: itemsPerPage });
      if (res?.success) {
        setNewsLetterData(res.data.docs || res.data);
        setTotalItems(res.data.totalDocs || res.data.total || 0);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters(currentPage);
  }, [currentPage]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <Load />;

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center w-full space-x-4">
        <h2 className="text-2xl font-bold text-black">Newsletters</h2>
      </div>

      <div>
        <table className="min-w-full mt-7 bg-[#1d2532] border border-b-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center text-white">S.No</th>
              <th className="py-2 px-4 border-b text-center text-white">Email</th>
              <th className="py-2 px-4 border-b text-center text-white">Created At</th>
            </tr>
          </thead>
          <tbody>
            {newsLetterData.length > 0 ? (
              newsLetterData.map((item, index) => (
                <tr
                  key={item._id}
                  className={`hover:bg-gray-200 text-center transition duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-300"
                  }`}
                >
                  <td className="py-2 px-4 border-b">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-2 px-4 border-b">{item.email}</td>
                  <td className="py-2 px-4 border-b">{formatDate(item.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="py-4 text-center text-white font-bold"
                >
                  No newsletters found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalItems > 0 && (
          <div className="flex justify-end mt-4">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={totalItems}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsLetter;
