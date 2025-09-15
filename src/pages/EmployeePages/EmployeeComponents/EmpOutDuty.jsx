import React, { useState, useEffect } from "react";
import Select from "react-select";
import { format } from "date-fns";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";



const EmpOutDuty = () => {
  const [formData, setFormData] = useState({
    inDateTime: "",
    outDateTime: "",
    reason: "",
    statusId: null,
  });
  const [requests, setRequests] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch Status Master
  const fetchStatuses = async () => {
    try {
      const res = await axiosInstance.get("/StatusMaster");
      if (res.data?.status === 200) {
        const options = res.data.data.map((s) => ({
          value: s.statusId,
          label: s.statusName,
        }));
        setStatuses(options);
      }
    } catch (err) {
      toast.error("Failed to fetch statuses");
      console.error(err);
    }
  };

  const statusColor = {
    Approved: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Rejected: "bg-red-100 text-red-700",
  };

  // Function to get status name & color by statusId
  const getStatusInfo = (statusId) => {
    const statusObj = statuses.find((s) => s.value === statusId);
    const name = statusObj?.label || "Pending";
    const color =
      statusColor[name] || "bg-gray-200 text-gray-700";
    return { name, color };
  };


  // Fetch Out Duty
  const fetchOnDuty = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/OnDuty");
      if (res.data?.status === 200) {
        setRequests(res.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to fetch Out Duty requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnDuty();
    fetchStatuses();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (selected) => {
    setFormData((prev) => ({ ...prev, statusId: selected?.value }));
  };

  // Submit new request
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        inDateTime: new Date(formData.inDateTime).toISOString(),
        outDateTime: new Date(formData.outDateTime).toISOString(),
        reason: formData.reason,
        isActive: true,
        statusId: formData.statusId || 6, // fallback default Pending
      };

      await axiosInstance.post("/OnDuty", payload);
      toast.success("Out Duty request submitted successfully");
      setShowModal(false);
      setFormData({ inDateTime: "", outDateTime: "", reason: "", statusId: null });
      fetchOnDuty(); // refresh list
    } catch (err) {
      // toast.error("Failed to submit request");
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-3 shadow mb-5 sticky top-14 bg-white z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="font-semibold text-lg sm:text-xl text-gray-800 text-center sm:text-left">
          Employee On Duty
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary text-sm flex items-center justify-center cursor-pointer gap-2 w-full sm:w-auto"
        >
          <FaPlus /> <span className="hidden sm:inline">Apply Out Duty</span>
          <span className="sm:hidden">Apply</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow mx-2 sm:mx-4">
        <table className="min-w-full text-sm sm:text-base table-auto">
          <thead className="bg-gray-100 text-gray-700">
            <tr className="border-b">
              <th className="px-2 sm:px-4 py-3 text-left">#</th>
              <th className="px-2 sm:px-4 py-3 text-left">In Date & Time</th>
              <th className="px-2 sm:px-4 py-3 text-left">Out Date & Time</th>
              <th className="px-2 sm:px-4 py-3 text-left">Reason</th>
              <th className="px-2 sm:px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : requests.length > 0 ? (
              requests.map((req, index) => (
                <tr
                  key={req.id || index}
                  className="border-t hover:bg-gray-50 transition-all duration-150"
                >
                  <td className="px-2 sm:px-4 py-3">{index + 1}</td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                    {format(new Date(req.inDateTime), "dd MMM yyyy HH:mm")}
                  </td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                    {format(new Date(req.outDateTime), "dd MMM yyyy HH:mm")}
                  </td>
                  <td className="px-2 sm:px-4 py-3">{req.reason}</td>
                  <td className="px-2 sm:px-4 py-3">
                    {(() => {
                      const { name, color } = getStatusInfo(req.statusId);
                      return (
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${color}`}
                        >
                          {name}
                        </span>
                      );
                    })()}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-4 text-gray-500 text-sm"
                >
                  No out duty requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-2 sm:px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md sm:max-w-xl p-4 sm:p-6 relative animate-fade-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-2xl"
            >
              &times;
            </button>

            <h2 className="text-lg sm:text-xl font-semibold mb-5 text-gray-800">
              Submit Out Duty Request
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  In Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="inDateTime"
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm sm:text-base"
                  value={formData.inDateTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Out Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="outDateTime"
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm sm:text-base"
                  value={formData.outDateTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  name="reason"
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm sm:text-base"
                  rows={3}
                  placeholder="Reason for Out Duty"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Status Select (instead of Location) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  options={statuses}
                  value={statuses.find((s) => s.value === formData.statusId) || null}
                  onChange={handleStatusChange}
                  placeholder="Select status"
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 sm:px-6 py-2 rounded hover:bg-secondary transition cursor-pointer w-full sm:w-auto"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpOutDuty;
