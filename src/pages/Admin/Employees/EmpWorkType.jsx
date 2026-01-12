import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { FileUp, FileDown, Plus, Inbox } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import EmpWorkTypeForm from "./EmpWorkTypeForm";

const EmpWorkType = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workTypes, setWorkTypes] = useState([]);

  // -------------------------
  // EXPORT Work Types
  // -------------------------
  const handleExport = async () => {
    try {
      const response = await axiosInstance.get("/EmployeeWorkType/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "EmployeeWorkTypes.xlsx");
      document.body.appendChild(link);
      link.click();
      toast.success("Exported successfully!");
    } catch (error) {
      toast.error("Failed to export file!");
      console.error(error);
    }
  };

  // -------------------------
  // IMPORT Work Types
  // -------------------------
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axiosInstance.post(
        "/EmployeeWorkType/import",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Imported successfully!");
      fetchWorkTypes();
    } catch (error) {
      toast.error("Failed to import file!");
      console.error(error);
    }
  };

  // Fetch Work Types list
  const fetchWorkTypes = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/WorkTypeMaster/all");
      setWorkTypes(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to fetch Work Types");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkTypes();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Work Types</h2>

        <div className="flex gap-3">
          {/* Import Button */}
          <label className="px-3 py-2 bg-gray-700 text-white text-sm rounded-lg cursor-pointer hover:bg-gray-900 flex items-center gap-2">
            <FileUp size={16} />
            Import
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImport}
            />
          </label>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm cursor-pointer rounded-lg flex items-center gap-2"
          >
            <FileDown size={16} />
            Export
          </button>

          {/* Add New Button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center text-sm cursor-pointer gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto p-4 shadow rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner />
          </div>
        ) : workTypes.length > 0 ? (
          <table className="w-full text-xs border-collapse text-center">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-2 py-2">S.No</th>
                <th className="px-2 py-2">Work Type Name</th>
                <th className="px-2 py-2">Description</th>
                <th className="px-2 py-2">Work Hours</th>
                <th className="px-2 py-2">Break Hours</th>
                <th className="px-2 py-2">Overtime</th>
                <th className="px-2 py-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {workTypes.map((item, index) => (
                <tr
                  key={item.workTypeId}
                  className={`hover:bg-gray-50 ${
                    !item.isActive ? "opacity-70" : ""
                  }`}
                >
                  <td className="px-2 py-2">{index + 1}</td>
                  <td className="px-2 py-2">{item.workTypeName}</td>
                  <td className="px-2 py-2">{item.description || "-"}</td>
                  <td className="px-2 py-2">{item.workHoursPerDay || "-"}</td>
                  <td className="px-2 py-2">{item.breakHours || "-"}</td>
                  <td className="px-2 py-2">
                    {item.overtimeApplicable ? "Yes" : "No"}
                  </td>
                  <td className="px-2 py-2">
                    {item.isActive ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-red-500 font-medium">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-14 text-gray-500">
            <Inbox size={40} className="mb-3 text-gray-400" />
            <p className="text-sm font-medium">No Work Types found</p>
            <p className="text-xs text-gray-400 mt-1">
              Add a work type to define employee working schedules
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="mt-4 flex items-center cursor-pointer gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-secondary transition"
            >
              <Plus size={16} />
              Add Work Type
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <EmpWorkTypeForm
          onClose={() => setShowModal(false)}
          onSuccess={fetchWorkTypes}
        />
      )}
    </div>
  );
};

export default EmpWorkType;
