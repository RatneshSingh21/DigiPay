import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AttendanceCalculationForm from "./AttendanceCalculationForm";
import AttendanceResultTable from "./AttendanceResultTable";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../components/Spinner";

const AttendanceCalculationResult = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/AttendanceCalculationResult/all");
      setResults(res.data.response || []);
    } catch {
      toast.error("Failed to fetch attendance results");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch {
      toast.error("Failed to fetch employees");
    }
  };

  useEffect(() => {
    fetchResults();
    fetchEmployees();
  }, []);

  // Get employee name by ID
  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.employeeId === id || e.id === id);
    return emp ? `${emp.fullName} (${emp.employeeCode})` : `Emp#${id}`;
  };

  // Filter results based on search
  const filteredResults = results.filter((r) =>
    getEmployeeName(r.employeeId)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Highlight search matches
  const highlightText = (text) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    return text
      .toString()
      .split(regex)
      .map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200">
            {part}
          </span>
        ) : (
          part
        )
      );
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 shadow-md sticky top-14 bg-white z-10 flex flex-col md:flex-row md:justify-between md:items-center rounded-b-lg border-b border-gray-100 gap-2 md:gap-0">
        <h2 className="font-semibold text-xl text-gray-800 tracking-wide">
          Attendance Calculation Result
        </h2>
        <div className="flex items-center gap-2 flex-col md:flex-row w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by employee name or code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-1 rounded-md text-sm w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary cursor-pointer text-white px-4 py-1 rounded-lg hover:bg-secondary"
          >
            Add
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white shadow rounded-2xl p-6 w-full max-w-lg relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute cursor-pointer text-lg top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <AttendanceCalculationForm
              onSuccess={() => {
                fetchResults();
                setShowForm(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-3 bg-white shadow rounded-2xl p-4">
        {loading ? (
          <Spinner />
        ) : (
          <AttendanceResultTable
            results={filteredResults}
            highlightText={highlightText} // Pass highlight function
            getEmployeeName={getEmployeeName} // Pass mapping function
          />
        )}
      </div>
    </>
  );
};

export default AttendanceCalculationResult;
