import React, { useRef } from "react";
import { FiDownload, FiUpload, FiUsers } from "react-icons/fi";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const data = [
  { id: 1, name: "Basic Detail", importApi: "/Employee/importley", exportApi: "/Employee/export" },
  { id: 2, name: "Salary Details", importApi: "/EmployeeSalary/import", exportApi: "/EmployeeSalary/export" },
  { id: 3, name: "Personal Details", importApi: "/PersonalDetails/import", exportApi: "/PersonalDetails/export" },
  { id: 4, name: "Bank Details", importApi: "/BankDetails/import", exportApi: "/BankDetails/export" },
  { id: 5, name: "Employee Work Types", importApi: "/EmployeeWorkType/import", exportApi: "/EmployeeWorkType/export-work-types" },
  { id: 6, name: "Employee Shift Mapping", importApi: "/ShiftMapping/import-shift-mapping", exportApi: "/ShiftMapping/export" },
  { id: 7, name: "Holiday List", importApi: "/HolidayListMaster/import-holiday", exportApi: "/HolidayListMaster/export" },
  { id: 8, name: "Day-Wise Attendance", importApi: "/Attendance/import", exportApi: "/Attendance/export" },
  { id: 9, name: "Monthly Attendance", importApi: "/Attendance/monthly-summary/import-summary", exportApi: "/Attendance/monthly-summary/export-summary" },
  { id: 10, name: "PF & ESI Mapping", importApi: "/Employee/import-compliance", exportApi: "/Employee/export-compliance-template" },
  { id: 11, name: "Leave Policy Mapping", importApi: "/EmployeeLeavePolicyAllocation/import-Leave", exportApi: "/EmployeeLeavePolicyAllocation/export" },
  { id: 12, name: "Attendance Policy Mapping", importApi: "/EmployeeAttendancePolicyMapping/import-attendance-policy", exportApi: "/EmployeeAttendancePolicyMapping/export" },
];

export default function GeneralImports() {
  const fileInputRef = useRef(null);

  const handleImport = (item) => {
    fileInputRef.current.click();
    fileInputRef.current.dataset.fieldName = item.name;
    fileInputRef.current.dataset.importApi = item.importApi;
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const { fieldName, importApi } = e.target.dataset;

    try {
      const formData = new FormData();
      formData.append("file", file);

      await axiosInstance.post(importApi, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`${fieldName} imported successfully`);
    } catch (err) {
      toast.error(`Import failed for ${fieldName}`);
    }

    e.target.value = "";
  };

  const handleExport = async (api, name) => {
    try {
      const res = await axiosInstance.get(api, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}.xlsx`;
      link.click();
    } catch {
      toast.error(`Export failed for ${name}`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hidden Input */}
      <input ref={fileInputRef} type="file" hidden onChange={onFileChange} />

      {/* Header */}
      <div className="sticky top-14 z-10 bg-white shadow px-6 py-4">
        <div className="flex items-center gap-3">
          <FiUsers className="text-primary text-xl" />
          <h2 className="text-xl font-semibold">General Imports</h2>
          <span className="ml-2 text-xs text-primary px-2 py-0.5 rounded-full">
            ({data.length})
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Import or export employee-related master data using Excel templates.
        </p>
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left px-6 py-3 w-1/2">FIELD NAME</th>
                <th className="text-center px-6 py-3 w-1/4">IMPORT</th>
                <th className="text-center px-6 py-3 w-1/4">EXPORT</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-t hover:bg-primary/5 transition ${i % 2 === 1 ? "bg-gray-50" : "bg-white"
                    }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                    <FiUsers className="text-primary text-sm" />
                    {item.name}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleImport(item)}
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                    >
                      <FiDownload />
                      Import
                    </button>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleExport(item.exportApi, item.name)}
                      className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                    >
                      <FiUpload />
                      Export
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
