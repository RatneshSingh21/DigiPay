// src/pages/StatusMaster.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Select from "react-select";
import { toast } from "react-toastify";

const StatusMaster = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    statusName: "",
    statusCode: "",
    isActive: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const STATUS_OPTIONS = [
    { value: "Pending", label: "Pending" },
    { value: "Processed", label: "Processed" },
    { value: "Approved", label: "Approved" },
    { value: "Paid", label: "Paid" },
    { value: "Partial", label: "Partial" },
    { value: "Rejected", label: "Rejected" },
  ];

  //  Fetch statuses
  const fetchStatuses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/StatusMaster");
      if (res.data?.status === 200 && res.data?.data) {
        setStatuses(res.data.data);
      } else {
        setError("No data returned from API");
      }
    } catch (err) {
      setError("Failed to fetch statuses.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // ✅ DUPLICATE STATUS NAME CHECK (case-insensitive)
    const alreadyExists = statuses.some(
      (s) => s.statusName?.toLowerCase() === formData.statusName.toLowerCase()
    );

    if (alreadyExists) {
      toast.warning("Status name already exists!");
      return; // ❌ STOP API CALL
    }

    try {
      await axiosInstance.post("/StatusMaster", {
        ...formData,
        createdOn: new Date().toISOString(),
      });

      toast.success("Status added successfully!");
      setFormData({ statusName: "", statusCode: "", isActive: true });
      fetchStatuses();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error adding status.");
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  return (
    <div className="">
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl"> Status Master</h2>
      </div>

      {/*  Add Status Form */}
      <div className="bg-white w-fit shadow-lg rounded-xl p-6 mb-3 flex flex-col items-center mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Add New Status
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-1 gap-3 "
        >
          <Select
            options={STATUS_OPTIONS}
            placeholder="Select Status Name"
            value={
              formData.statusName
                ? { value: formData.statusName, label: formData.statusName }
                : null
            }
            onChange={(selectedOption) =>
              setFormData({
                ...formData,
                statusName: selectedOption?.value || "",
              })
            }
            className="w-72"
            isClearable
            required
          />
          <input
            type="text"
            placeholder="Status Code"
            value={formData.statusCode}
            onChange={(e) =>
              setFormData({ ...formData, statusCode: e.target.value })
            }
            required
            className="w-72 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-primary cursor-pointer text-white w-72 px-4 py-2 rounded-lg shadow hover:bg-secondary transition"
          >
            Add Status
          </button>
        </form>

        {success && <p className="text-green-600 mt-3">{success}</p>}
        {error && <p className="text-red-600 mt-3">{error}</p>}
      </div>

      {/*  Status List */}
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Existing Status
        </h2>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <div className="overflow-x-auto shadow h-[40vh] overflow-y-scroll">
            <table className="min-w-full divide-y text-center text-xs divide-gray-200">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-2">S.No</th>
                  <th className="px-4 py-2">Status Name</th>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Created By</th>
                  <th className="px-4 py-2">Created On</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {statuses.map((status, idx) => (
                  <tr key={status.statusId} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{idx + 1}.</td>
                    <td className="px-4 py-2">{status.statusName}</td>
                    <td className="px-4 py-2">{status.statusCode}</td>
                    <td className="px-4 py-2">{status.createdBy || "-"}</td>
                    <td className="px-4 py-2">
                      {new Date(status.createdOn).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-4 py-2 cursor-pointer">
                      {status.isActive ? (
                        <span className="text-green-600 font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {statuses.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No statuses found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusMaster;
