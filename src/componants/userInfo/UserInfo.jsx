import React, { useEffect, useMemo, useState } from "react";
import { Input, Pagination } from "antd";
import { getUserInfoApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import Load from "../Load/Load";

const ITEMS_PER_PAGE = 10;

const UserInfo = () => {
  const [loading, setLoading] = useState(true);
  const [userInfoList, setUserInfoList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUserInfo = async () => {
    try {
      const res = await getUserInfoApi();
      if (res?.success) {
        setUserInfoList(res?.data || []);
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const filteredList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return userInfoList;
    return userInfoList.filter((item) => {
      const name = (item?.name || "").toLowerCase();
      const email = (item?.email || "").toLowerCase();
      const mobile = (item?.mobileNumber || "").toLowerCase();
      const location = (item?.location || "").toLowerCase();
      return (
        name.includes(query) ||
        email.includes(query) ||
        mobile.includes(query) ||
        location.includes(query)
      );
    });
  }, [searchQuery, userInfoList]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  if (loading) return <Load />;

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center w-full space-x-4 mb-6">
        <h2 className="text-2xl font-bold text-black">User Info</h2>
        <Input
          type="text"
          placeholder="Search by name, email, mobile or location"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setCurrentPage(1);
          }}
          className="border rounded px-3 py-2 w-96"
        />
      </div>

      <div>
        <table className="min-w-full mt-7 bg-[#1d2532] border border-b-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center text-white">S.No</th>
              <th className="py-2 px-4 border-b text-center text-white">Name</th>
              <th className="py-2 px-4 border-b text-center text-white">Email</th>
              <th className="py-2 px-4 border-b text-center text-white">Mobile</th>
              <th className="py-2 px-4 border-b text-center text-white">Location</th>
              <th className="py-2 px-4 border-b text-center text-white">
                Created At
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr
                  key={item?.id || index}
                  className={`hover:bg-gray-200 text-center transition duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-300"
                  }`}
                >
                  <td className="py-2 px-4 border-b">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="py-2 px-4 border-b">{item?.name || "-"}</td>
                  <td className="py-2 px-4 border-b">{item?.email || "-"}</td>
                  <td className="py-2 px-4 border-b">
                    {item?.mobileNumber || "-"}
                  </td>
                  <td className="py-2 px-4 border-b">{item?.location || "-"}</td>
                  <td className="py-2 px-4 border-b">
                    {item?.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-center text-white font-bold">
                  No user info records found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredList.length > 0 && (
          <div className="flex justify-end mt-4">
            <Pagination
              current={currentPage}
              pageSize={ITEMS_PER_PAGE}
              total={filteredList.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
