import React, { useEffect, useState } from "react";
import ViewSupport from "./ViewSupport";
import { AiOutlineEye } from "react-icons/ai";
import { getSupportTicketApi, updateTicketStatusApi } from "../../common/services";
import { errorResponseHandler } from "../../common/http";
import { message, Pagination } from "antd";
import Load from "../Load/Load";
import { useToast } from "../toast/Toast";

const itemsPerPage = 10;

const SupportManagement = () => {
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [ticketIdFilter, setTicketIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allowedStatuses, setAllowedStatuses] = useState([
    "open",
    "pending",
    "close",
  ]);
  const message=useToast();

  const fetchTickets = async () => {
    try {
      const response = await getSupportTicketApi();
      if (response.success) {
        setTickets(response?.data || []);
        if (response.allowedStatuses) {
          setAllowedStatuses(response.allowedStatuses);
        }
      }
    } catch (error) {
      errorResponseHandler(error);
    } finally {
      setLoading(false)
    }
  };


  const handleStatusChange = async (id, newStatus) => {
    try {
      const data = { status: newStatus };
      const response = await updateTicketStatusApi(id, data);

      if (response.success) {
        message.success(response.message)
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket._id === id ? { ...ticket, status: response.data.status } : ticket
          )
        );
      }
    } catch (error) {
      errorResponseHandler(error);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesDate = dateFilter
      ? new Date(ticket.createdAt).toISOString().split("T")[0] === dateFilter
      : true;
    const matchesId = ticketIdFilter
      ? ticket.ticket_no?.toLowerCase().includes(ticketIdFilter.toLowerCase())
      : true;
    const matchesStatus = statusFilter ? ticket.status === statusFilter : true;
    return matchesDate && matchesId && matchesStatus;
  });


  const currentTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setDateFilter("");
    setTicketIdFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };




  const [showViewSupport, setShowViewSupport] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleViewModalOpen = (ticket) => {
    setSelectedTicket(ticket);
    setShowViewSupport(true);
  };

  useEffect(() => {
    fetchTickets();
  }, []);


  const isToday = (dateString) => {
    const today = new Date().toISOString().split("T")[0];
    const ticketDate = new Date(dateString).toISOString().split("T")[0];
    return today === ticketDate;
  };


  const shouldHighlight = (ticket) => {
    if (isToday(ticket.createdAt)) {
      return ticket.status === "open" || ticket.status === "pending";
    }
    return false;
  };

  if (loading) {
    return <Load />
  }

  return (
    <div className="p-4 mt-16">
      {/* Header + Filters */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-black">Support Ticket Management</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Search Ticket ID..."
            value={ticketIdFilter}
            onChange={(e) => {
              setTicketIdFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Status</option>
            {allowedStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div>
        <table className="min-w-full bg-[#1d2532] border border-b-4">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center text-white">S.No</th>
              <th className="py-2 px-4 border-b text-center text-white">Ticket ID</th>
              <th className="py-2 px-4 border-b text-center text-white">Title</th>
              <th className="py-2 px-4 border-b text-center text-white">Message</th>
              <th className="py-2 px-4 border-b text-center text-white">Date</th>
              <th className="py-2 px-4 border-b text-center text-white">Status</th>
              <th className="py-2 px-4 border-b text-center text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTickets.length > 0 ? (
              currentTickets.map((t, idx) => {
                const isNew =
                  new Date(t.createdAt).toISOString().split("T")[0] ===
                  new Date().toISOString().split("T")[0] &&
                  (t.status === "open" || t.status === "pending");

                return (
                  <tr
                    key={t._id || idx}
                    className={`hover:bg-gray-200 text-center transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-300"
                      }`}
                  >
                    <td className="py-2 px-4 border-b">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <div className="flex items-center justify-center gap-2">
                        {t.ticket_no}

                      </div>
                    </td>

                    <td className="py-2 px-4 border-b">{t.title.length > 30 ? t.title.slice(0, 30) + "..." : t.title}</td>
                    <td className="py-2 px-4 border-b">{t.description.length > 30 ? t.description.slice(0, 30) + "..." : t.description}</td>
                    <td className="py-2 px-4 border-b">
                      {new Date(t.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t._id, e.target.value)}
                        className="px-2 py-1 border rounded-md bg-white text-black"
                      >
                        {allowedStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-4  flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleViewModalOpen(t)}
                        className="text-blue-500 hover:text-blue-700 flex items-center justify-center"
                      >
                        <AiOutlineEye className="text-lg" />
                      </button>

                      {/* Always render a placeholder span so spacing stays consistent */}
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${isNew ? "bg-red-500" : "bg-transparent"
                          }`}
                      ></span>
                    </td>


                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-white font-bold">
                  No support tickets found
                </td>
              </tr>
            )}
          </tbody>

        </table>

        {/* Pagination */}
        {currentTickets.length > 0 && (
          <Pagination
            current={currentPage}
            total={filteredTickets.length}
            pageSize={itemsPerPage}
            onChange={setCurrentPage}
            showSizeChanger={false}
            className="mt-4 flex justify-end"
          />
        )}
      </div>

      {/* ViewSupport Modal */}
      {showViewSupport && selectedTicket && (
        <ViewSupport
          showViewSupport={showViewSupport}
          setShowViewSupport={setShowViewSupport}
          ticket={selectedTicket}
        />
      )}
    </div>
  );
};

export default SupportManagement;
