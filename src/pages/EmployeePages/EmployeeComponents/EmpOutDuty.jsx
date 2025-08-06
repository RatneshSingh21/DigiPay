import React, { useState } from "react";
import Select from "react-select";
import { format } from "date-fns";
import { FaPlus } from "react-icons/fa";

const locations = [
  { value: "Head Office", label: "Head Office" },
  { value: "Client Site A", label: "Client Site A" },
  { value: "Branch Office", label: "Branch Office" },
];

const dummyRequests = [
  {
    id: 1,
    date: "2025-08-02",
    reason: "Client visit for sales discussion",
    location: "Client Site A",
    status: "Pending",
  },
  {
    id: 2,
    date: "2025-07-28",
    reason: "Implementation support",
    location: "Client Site B",
    status: "Approved",
  },
  {
    id: 3,
    date: "2025-07-20",
    reason: "Product demo",
    location: "Branch Office",
    status: "Rejected",
  },
];

const statusColor = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
};

const EmpOutDuty = () => {
  const [formData, setFormData] = useState({
    date: "",
    reason: "",
    location: null,
  });
  const [requests, setRequests] = useState(dummyRequests);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, location: selectedOption }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRequest = {
      id: requests.length + 1,
      date: formData.date,
      reason: formData.reason,
      location: formData.location?.label,
      status: "Pending",
    };

    setRequests((prev) => [newRequest, ...prev]);
    setFormData({ date: "", reason: "", location: null });
    setShowModal(false);
  };

  return (
    <div>
      {/* Button to open modal */}
      <div className="px-4 py-3 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl text-gray-800">Out Duty</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary flex items-center gap-2"
        >
          <FaPlus /> Apply Out Duty
        </button>
      </div>
      <div className="flex justify-end"></div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow mx-4">
        <table className="min-w-full text-sm table-auto">
          <thead className="bg-gray-100 text-gray-700">
            <tr className="border-b">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, index) => (
              <tr
                key={req.id}
                className="border-t hover:bg-gray-50 transition-all duration-150"
              >
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">
                  {format(new Date(req.date), "dd MMM yyyy")}
                </td>
                <td className="px-4 py-2">{req.location}</td>
                <td className="px-4 py-2">{req.reason}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColor[req.status]
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl"
            >
              &times;
            </button>

            <h2 className="text-lg font-semibold mb-4">Out Duty Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  className="w-full border rounded px-3 py-2"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <Select
                  options={locations}
                  value={formData.location}
                  onChange={handleSelectChange}
                  placeholder="Select location"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  name="reason"
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Reason for Out Duty"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
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
