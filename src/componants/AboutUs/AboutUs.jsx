import React, { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { AiFillDelete } from "react-icons/ai";
import Load from "../Load/Load";
import DeleteModal from "../deleteModal/DeleteModal";
import AboutUsForm from "./AboutUsForm";
import { getAboutUsApi, deleteAboutUsApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { useToast } from "../toast/Toast";
import { image_url } from "../../common/env";

const AboutUs = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selected, setSelected] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const message = useToast();

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getAboutUsApi();
      if (res?.success) {
        setData(res?.data || []);
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

  const requestDelete = (item) => {
    setSelected(item);
    setShowDelete(true);
  };

  const handleDelete = async () => {
    try {
      const id = selected?._id || selected?.id;
      if (!id) return;
      const res = await deleteAboutUsApi(id);
      if (res?.success) {
        message.success("Entry deleted successfully");
        fetchAll();
      }
    } catch (err) {
      errorResponseHandler(err);
    }
  };

  if (loading) return <Load />;

  return (
    <div className="p-4 mt-16" style={{ zIndex: 9999999 }}>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-black">About Us</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            disabled={data.length >= 3}
            className={`px-4 py-2 rounded-md bg-[#1d2532] text-white ${
              data.length >= 3
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-700"
            }`}
          >
            Add About Usasg
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
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
                Type
              </th>
              <th className="py-2 px-4 border-b text-center text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((item, idx) => (
                <tr
                  key={item?._id || idx}
                  className={`hover:bg-gray-200 text-center transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-300"
                  }`}
                >
                  <td className="py-2 px-4 border-b">{idx + 1}</td>
                  <td className="py-2 px-4 border-b">
                    {item?.image ? (
                      <>
                      
                      <img
                        src={`${image_url}/${item.image}`}
                        alt={item.type}
                        className="w-10 h-10 rounded object-cover mx-auto border"
                      />
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-2 px-4 border-b capitalize">
                    {item?.type}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-green-500 hover:text-green-700"
                        title="Edit"
                      >
                        <CiEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => requestDelete(item)}
                        className="text-red-500 hover:text-red-700"
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
                  colSpan="4"
                  className="py-4 text-center text-white font-bold"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <AboutUsForm
          mode={formMode}
          initial={selected}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchAll();
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

export default AboutUs;
