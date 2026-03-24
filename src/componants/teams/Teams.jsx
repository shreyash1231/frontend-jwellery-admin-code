import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { CiEdit } from "react-icons/ci";
import { AiFillDelete } from "react-icons/ai";
import { message, Pagination } from "antd";
import Load from "../Load/Load";
import DeleteModal from "../deleteModal/DeleteModal";
import TeamForm from "./TeamForm";
import TeamView from "./TeamView";
import { addTeamApi, deleteTeamApi, getAllTeamsApi, updateTeamApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";

const itemsPerPage = 10;

const Teams = () => {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selected, setSelected] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllTeamsApi();
      if (res?.success) {
        const list = res?.data?.docs || res?.data?.data || res?.data || [];
        setTeams(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      errorResponseHandler(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const openAdd = () => { setFormMode("add"); setSelected(null); setShowForm(true); };
  const openEdit = (item) => { setFormMode("edit"); setSelected(item); setShowForm(true); };
  const openView = (item) => { setSelected(item); setShowView(true); };
  const requestDelete = (item) => { setSelected(item); setShowDelete(true); };

  const filteredTeams = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teams;

    return teams.filter((team) => (
      (team?.name || "").toLowerCase().includes(q) ||
      (team?.designation || "").toLowerCase().includes(q)
    ));
  }, [search, teams]);

  const paginatedTeams = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTeams.slice(startIndex, startIndex + pageSize);
  }, [filteredTeams, currentPage, pageSize]);

  const handleDelete = async () => {
    try {
      const id = selected?._id || selected?.id;
      if (!id) return;
      const res = await deleteTeamApi(id);
      if (res?.success) {
        message.success("Team deleted successfully");
        fetchTeams();
      }
    } catch (err) { errorResponseHandler(err); }
  };

  if (loading) return <Load />;

  const photo = (t) => t?.image || t?.imageUrl || t?.profile_image || t?.logo;

  return (
    <div className="p-4 mt-16">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-black">Teams</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or designation"
            className="px-3 py-2 border rounded-md"
          />
          <button onClick={openAdd} className="px-4 py-2 rounded-md bg-[#1d2532] text-white hover:bg-gray-700">Add Team</button>
        </div>
      </div>

      <div>
        <table className="min-w-full bg-[#1d2532] border border-b-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center text-white">S.No</th>
              <th className="py-2 px-4 border-b text-center text-white">Image</th>
              <th className="py-2 px-4 border-b text-center text-white">Name</th>
              <th className="py-2 px-4 border-b text-center text-white">Designation</th>
              <th className="py-2 px-4 border-b text-center text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTeams.length ? paginatedTeams.map((t, idx) => (
              <tr key={t?._id || idx} className={`hover:bg-gray-200 text-center transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-300"}`}>
                <td className="py-2 px-4 border-b">{(currentPage - 1) * pageSize + idx + 1}</td>
                <td className="py-2 px-4 border-b">{photo(t) ? <img src={photo(t)} alt={t?.name} className="w-10 h-10 rounded object-cover mx-auto border" /> : '-'}</td>
                <td className="py-2 px-4 border-b">{t?.name || '-'}</td>
                <td className="py-2 px-4 border-b">{t?.designation || '-'}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => openView(t)} className="text-blue-500 hover:text-blue-700" title="View"><AiOutlineEye className="text-lg" /></button>
                    <button onClick={() => openEdit(t)} className="text-green-500 hover:text-green-700" title="Edit"><CiEdit className="text-lg" /></button>
                    <button onClick={() => requestDelete(t)} className="text-red-500 hover:text-red-700" title="Delete"><AiFillDelete className="text-lg" /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="py-4 text-center text-white font-bold">No teams found</td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredTeams.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Pagination
              current={currentPage}
              total={filteredTeams.length}
              pageSize={pageSize}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              showSizeChanger
              pageSizeOptions={["10", "20", "50"]}
            />
          </div>
        )}
      </div>

      {showForm && (
        <TeamForm
          mode={formMode}
          initial={selected}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchTeams(); }}
        />
      )}

      {showView && selected && (
        <TeamView show={showView} setShow={setShowView} team={selected} />
      )}

      {showDelete && (
        <DeleteModal onClose={() => setShowDelete(false)} handleDelete={handleDelete} />
      )}
    </div>
  );
};

export default Teams;