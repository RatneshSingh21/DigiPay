import React, { useState } from "react";
import SalarySlipContent from "./SalarySlipContent";

const EmpSalarySlip = () => {
  const [selectedMonth, setSelectedMonth] = useState("August");
  const [selectedYear, setSelectedYear] = useState("2025");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = ["2023", "2024", "2025", "2026"];

  return (
    <div className="p-6">
      {/* Control Panel */}
      <div className="mb-4 flex flex-col md:flex-row items-start md:items-center gap-4 print:hidden">
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Salary Slip Content */}
      <SalarySlipContent month={selectedMonth} year={selectedYear} />
    </div>
  );
};

export default EmpSalarySlip;
