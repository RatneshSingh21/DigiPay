import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import AddShiftPatternModal from "./AddShiftPatternModal";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const ShiftPatternPage = () => {
  const [isEdit, setIsEdit] = useState("");
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [employees, setEmployees] = useState([]);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/shift-pattern");
      setPatterns(res.data?.data || []);
    } catch (error) {
      toast.error("Failed to fetch shift patterns");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch (error) {
      console.error("Failed to fetch employees");
    }
  };

  useEffect(() => {
    fetchPatterns();
    fetchEmployees();
  }, []);

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee
      ? `${employee.fullName}(${employee.employeeCode})`
      : "Unknown";
  };

  const explainPattern = (pattern) => {
    if (!pattern.days || pattern.days.length === 0) return "No shift assigned";

    if (pattern.cycleLength === 1) {
      return `From ${new Date(pattern.patternStartDate).toLocaleDateString(
        "en-Gb",
      )} onward works Shift ${pattern.days[0].shiftId} daily`;
    }

    return `${pattern.cycleLength}-day rotating schedule starting ${new Date(
      pattern.patternStartDate,
    ).toLocaleDateString("en-Gb")}`;
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axiosInstance.get(
        "/shift-pattern/export-template",
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ShiftPatternTemplate.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Template downloaded successfully");
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const handleBulkImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      await axiosInstance.post("/shift-pattern/bulk-import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Shift patterns imported successfully");
      fetchPatterns();
    } catch (error) {
      toast.error("Bulk import failed");
    } finally {
      setUploading(false);
    }
  };

  const filteredPatterns = patterns.filter((pattern) => {
    const employee = employees.find((emp) => emp.id === pattern.employeeId);

    if (!employee) return false;

    const search = searchTerm.toLowerCase();

    return (
      employee.fullName.toLowerCase().includes(search) ||
      employee.employeeCode.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ================= PAGE HEADER ================= */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-14 z-10">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Shift Patterns
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage employee shift cycle configurations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Bulk Upload */}
          <label className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer">
            {uploading ? "Uploading..." : "Import"}
            <input
              type="file"
              accept=".xlsx"
              onChange={handleBulkImport}
              className="hidden"
            />
          </label>

          {/* Download Template */}
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 cursor-pointer text-gray-700 hover:bg-gray-100 transition"
          >
            Export
          </button>

          {/* Add Pattern */}
          <button
            onClick={() => {
              setIsEdit("");
              setSelectedPattern(null);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-secondary cursor-pointer text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition"
          >
            <FaPlus size={14} />
            Add Pattern
          </button>
        </div>
      </div>

      {/* ================= CONTENT AREA ================= */}
      <div className="p-6 flex-1 overflow-auto">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* TABLE HEADER BAR */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Shift Pattern List
            </h3>

            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search by employee name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 rounded-lg border border-gray-300 pl-3 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* ================= TABLE ================= */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
              <svg
                className="animate-spin h-6 w-6 mb-4 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <p className="text-sm font-medium">Loading shift patterns...</p>
            </div>
          ) : filteredPatterns.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500">
              <svg
                className="h-12 w-12 mb-4 text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17v-2a4 4 0 014-4h4m0 0l-3-3m3 3l-3 3M5 7h14M5 11h6"
                />
              </svg>

              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                No Shift Patterns Found
              </h3>

              <p className="text-xs text-gray-400 text-center max-w-xs">
                There are no shift patterns matching your search criteria. Try
                adjusting your search or create a new shift pattern.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-center">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-3 py-3">S.No</th>
                    <th className="px-3 py-3">Employee</th>
                    <th className="px-3 py-3">Start Date</th>
                    <th className="px-3 py-3">Cycle Length</th>
                    <th className="px-3 py-3">Explanation</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredPatterns.map((pattern, index) => (
                    <tr
                      key={pattern.patternId}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-3 py-2 text-gray-600">{index + 1}.</td>

                      <td className="px-3 py-2 font-medium text-gray-800">
                        {getEmployeeName(pattern.employeeId)}
                      </td>

                      <td className="px-3 py-2 text-gray-600">
                        {new Date(pattern.patternStartDate).toLocaleDateString(
                          "en-Gb",
                        )}
                      </td>

                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {pattern.cycleLength} Days
                        </span>
                      </td>

                      <td className="px-3 py-2 text-gray-600 max-w-md">
                        {explainPattern(pattern)}
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          <button
                            onClick={() => {
                              setIsEdit("Edit");
                              setSelectedPattern(pattern);
                              setShowModal(true);
                            }}
                            className="inline-flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                          >
                            <FiEdit2 size={14} />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <AddShiftPatternModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchPatterns}
          isEdit={isEdit}
          initialData={selectedPattern}
        />
      )}
    </div>
  );
};

export default ShiftPatternPage;
