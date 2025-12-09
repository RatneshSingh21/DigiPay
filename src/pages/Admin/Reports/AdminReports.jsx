import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  FileText,
  Layers,
  Calendar,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const LETTER_TYPES = [
  "Appointment Letter",
  "Confirmation Letter",
  "Offer Letter",
  "Letter of Intent",
  "Increment Letter",
  "Experience Certificate",
  "Full & Final Settlement",
];

// Dummy Data
const DUMMY_LETTERS = [
  // Appointment Letter
  {
    letterType: "Appointment Letter",
    issueDate: "2025-02-15",
    issuedTo: "Rahul Sharma",
    description: "Appointment for Software Engineer",
    reason: "New Hiring",
  },
  {
    letterType: "Appointment Letter",
    issueDate: "2025-03-01",
    issuedTo: "Nikita Verma",
    description: "Appointment for UI/UX Designer",
    reason: "Team Expansion",
  },

  // Confirmation Letter
  {
    letterType: "Confirmation Letter",
    issueDate: "2025-01-22",
    issuedTo: "Vikas Kumar",
    description: "Confirmation after 6 months probation",
    reason: "Good Performance",
  },
  {
    letterType: "Confirmation Letter",
    issueDate: "2025-02-10",
    issuedTo: "Shalini Gupta",
    description: "Confirmation for HR Assistant",
    reason: "Probation Completed",
  },

  // Offer Letter
  {
    letterType: "Offer Letter",
    issueDate: "2025-01-10",
    issuedTo: "Priya Singh",
    description: "Offer for HR Executive",
    reason: "Replacement Hiring",
  },
  {
    letterType: "Offer Letter",
    issueDate: "2025-02-18",
    issuedTo: "Aman Yadav",
    description: "Offer for Backend Developer",
    reason: "New Project Requirement",
  },

  // Letter of Intent
  {
    letterType: "Letter of Intent",
    issueDate: "2025-02-05",
    issuedTo: "Harshit Mehra",
    description: "LOI for internship",
    reason: "Campus Hiring",
  },
  {
    letterType: "Letter of Intent",
    issueDate: "2025-03-08",
    issuedTo: "Tanya Kapoor",
    description: "LOI for Analyst Position",
    reason: "Shortlisted Candidate",
  },

  // Increment Letter
  {
    letterType: "Increment Letter",
    issueDate: "2025-03-05",
    issuedTo: "Ankit Verma",
    description: "Annual increment approval",
    reason: "Yearly Performance Review",
  },
  {
    letterType: "Increment Letter",
    issueDate: "2025-01-25",
    issuedTo: "Saurabh Mishra",
    description: "Mid-year salary revision",
    reason: "Exceptional Contribution",
  },

  // Experience Certificate
  {
    letterType: "Experience Certificate",
    issueDate: "2024-12-22",
    issuedTo: "Sneha Patel",
    description: "Issued after resignation",
    reason: "Relieving formalities",
  },
  {
    letterType: "Experience Certificate",
    issueDate: "2024-11-30",
    issuedTo: "Mohit Rana",
    description: "Experience certificate for 3 years of service",
    reason: "Employee Exit",
  },
  {
    letterType: "Experience Certificate",
    issueDate: "2024-05-22",
    issuedTo: "Ravi Patel",
    description: "Experience certificate for 2 years of service",
    reason: "Employee Exit",
  },

  // Full & Final Settlement
  {
    letterType: "Full & Final Settlement",
    issueDate: "2025-01-12",
    issuedTo: "Deepak Joshi",
    description: "FNF after resignation",
    reason: "Exit Formalities",
  },
  {
    letterType: "Full & Final Settlement",
    issueDate: "2025-03-03",
    issuedTo: "Kavita Pandey",
    description: "FNF processed",
    reason: "Separation Process",
  },
];

const MONTHS = [
  { value: "", label: "All Months" },
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const AdminReports = () => {
  const [letterData, setLetterData] = useState([]);
  const [filterType, setFilterType] = useState(null);
  const [filterMonth, setFilterMonth] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setLetterData(DUMMY_LETTERS);
  }, []);

  // Filter Logic
  const filteredData = letterData.filter((item) => {
    const matchesType = filterType
      ? item.letterType === filterType.value
      : true;

    const itemMonth = item.issueDate.split("-")[1];
    const matchesMonth = filterMonth ? itemMonth === filterMonth.value : true;

    const matchesSearch =
      item.issuedTo.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchText.toLowerCase());

    return matchesType && matchesMonth && matchesSearch;
  });

  // Most Issued Letter Type
  const mostIssuedType = (() => {
    const countMap = {};

    filteredData.forEach((item) => {
      countMap[item.letterType] = (countMap[item.letterType] || 0) + 1;
    });

    const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]);

    return sorted.length ? { type: sorted[0][0], count: sorted[0][1] } : null;
  })();

  // Prepare Pie Chart Data (Optimized)
  const pieChartData = (() => {
    const countMap = {};

    // single-loop counting
    filteredData.forEach((item) => {
      countMap[item.letterType] = (countMap[item.letterType] || 0) + 1;
    });

    // Convert to recharts-friendly format
    return LETTER_TYPES.map((type) => ({
      name: type,
      value: countMap[type] || 0,
    }));
  })();

  return (
    <>
      {/* Header Section */}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">HR Letters Management</h2>
        {/* Filter Section */}
        <div className="px-4 mb-2 flex flex-wrap gap-4 items-center">
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search by name, description, reason..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border min-w-[220px] rounded-lg px-3 py-1  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* React Select - Letter Type */}
          <div className="min-w-[220px]">
            <Select
              options={[
                { value: "", label: "All Letter Types" },
                ...LETTER_TYPES.map((t) => ({ value: t, label: t })),
              ]}
              onChange={(val) => setFilterType(val?.value ? val : null)}
              placeholder="Letter Type"
              isClearable
            />
          </div>

          {/* Month Filter */}
          <div className="min-w-[200px]">
            <Select
              options={MONTHS}
              onChange={(val) => setFilterMonth(val?.value ? val : null)}
              placeholder="Month"
              isClearable
            />
          </div>
        </div>
      </div>

      {/* Summary + Chart Section */}
      <div className="px-4 mt-4 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side Summary Cards - Modern Style */}
        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Letters */}
          <div className="flex items-center gap-3 bg-blue-100 rounded-xl p-4 shadow-sm border border-blue-300">
            <div className="bg-blue-500 text-white p-3 rounded-full shadow">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-xs text-gray-700 font-medium">
                Total Letters
              </h3>
              <p className="text-2xl font-bold text-blue-700">
                {filteredData.length}
              </p>
            </div>
          </div>

          {/* Letter Types Found */}
          <div className="flex items-center gap-3 bg-purple-100 rounded-xl p-4 shadow-sm border border-purple-300">
            <div className="bg-purple-500 text-white p-3 rounded-full shadow">
              <Layers size={22} />
            </div>
            <div>
              <h3 className="text-xs text-gray-700 font-medium">
                Letter Types
              </h3>
              <p className="text-2xl font-bold text-purple-700">
                {new Set(filteredData.map((i) => i.letterType)).size}
              </p>
            </div>
          </div>

          {/* Selected Month Count */}
          <div className="flex items-center gap-3 bg-green-100 rounded-xl p-4 shadow-sm border border-green-300">
            <div className="bg-green-500 text-white p-3 rounded-full shadow">
              <Calendar size={22} />
            </div>
            <div>
              <h3 className="text-xs text-gray-700 font-medium">
                {filterMonth?.label || "All Months"} Count
              </h3>
              <p className="text-2xl font-bold text-green-700">
                {
                  filteredData.filter((i) =>
                    filterMonth
                      ? i.issueDate.split("-")[1] === filterMonth.value
                      : true
                  ).length
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-orange-100 rounded-xl p-4 shadow-sm border border-orange-300">
            <div className="bg-orange-500 text-white p-3 rounded-full shadow">
              <PieChartIcon size={22} />
            </div>
            <div>
              <h3 className="text-xs text-gray-700 font-medium">
                Most Issued
              </h3>
              <p className="text-sm font-bold text-orange-700">
                {mostIssuedType ? mostIssuedType.type : "-"}
              </p>
              <p className="text-xs text-gray-600">
                {mostIssuedType ? `${mostIssuedType.count} issued` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Pie Chart (bigger space) */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="font-semibold text-md mb-3 text-center">
            Letter Type Distribution
          </h3>

          <div className="w-full h-72">
            {" "}
            {/* Increased height for clarity */}
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={index} fill={`hsl(${index * 50}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white mt-5 rounded-xl text-xs shadow-lg overflow-y-auto max-h-[50vh] border border-gray-200">
        {filteredData.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No records found.</p>
        ) : (
          <table className="min-w-full text-center border-collapse">
            {/* Table Head */}
            <thead className="bg-blue-50 text-gray-700 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-4 py-3 font-semibold">S.No</th>
                <th className="px-4 py-3 font-semibold">Letter Type</th>
                <th className="px-4 py-3 font-semibold">Issue Date</th>
                <th className="px-4 py-3 font-semibold">Issued To</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={index}
                  className="transition-all duration-200 hover:bg-blue-50/70 hover:shadow-sm cursor-pointer"
                >
                  <td className="px-4 py-3 border-b border-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100 font-medium">
                    {item.letterType}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100">
                    {item.issueDate
                      ? new Date(item.issueDate).toLocaleDateString("en-GB")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100">
                    {item.issuedTo}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-100">
                    {item.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default AdminReports;
