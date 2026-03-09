import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Download } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../axiosInstance/axiosInstance";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const DownloadSlip = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  /* ================= Fetch Employees ================= */

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");

      const formatted = res.data.map((emp) => ({
        value: emp.id,
        label: `${emp.fullName} (${emp.employeeCode})`,
      }));

      setEmployees(formatted);
    } catch (error) {
      toast.error("Failed to load employees");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* ================= Download Slip ================= */

  const handleDownload = async () => {
    if (!selectedEmployee || !month || !year) {
      toast.warning("Please select Employee, Month and Year");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.get(`/EmployeeSalarySlip/download`, {
        params: {
          employeeId: selectedEmployee.value,
          month: month,
          year: year,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const fileName = `SalarySlip_${selectedEmployee.value}_${month}_${year}.pdf`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Salary slip downloaded successfully");

      /* ===== Clear Form ===== */

      setSelectedEmployee(null);
      setMonth("");
      setYear(new Date().getFullYear());
    } catch (error) {
      toast.error("Failed to download salary slip");
    } finally {
      setLoading(false);
    }
  };

  /* ================= Month Options ================= */

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  return (
    <div className="min-h-[80vh] flex justify-center items-start bg-gray-50 p-6">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Download Salary Slip
          </h2>
          <p className="text-sm text-gray-500">
            Select employee and period to download payslip.
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>

            <Select
              options={employees}
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              placeholder="Search employee..."
            />
          </div>

          {/* Month + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>

              <Select
                options={monthOptions}
                value={monthOptions.find((m) => m.value === month)}
                onChange={(e) => setMonth(e.value)}
                placeholder="Select month"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>

              <input
                type="number"
                className={inputClass}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          {/* Download Button */}

          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-sm bg-primary text-white py-2.5 rounded-lg hover:bg-secondary cursor-pointer transition font-medium"
          >
            <Download size={18} />
            {loading ? "Downloading..." : "Download Salary Slip"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadSlip;
