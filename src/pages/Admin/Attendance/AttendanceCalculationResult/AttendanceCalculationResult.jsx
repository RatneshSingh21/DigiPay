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

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <>
      <div className="px-4 py-3 shadow-md sticky top-14 bg-white z-10 flex justify-between items-center rounded-b-lg border-b border-gray-100">
        <h2 className="font-semibold text-xl text-gray-800 tracking-wide">
          Attendance Calculation Result
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary cursor-pointer text-white px-4 py-1 rounded-lg hover:bg-secondary"
        >
          Generate
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative">
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

      <div className="max-w-6xl mx-auto bg-white shadow rounded-2xl p-4">
        {loading ? <Spinner /> : <AttendanceResultTable results={results} />}
      </div>
    </>
  );
};

export default AttendanceCalculationResult;
