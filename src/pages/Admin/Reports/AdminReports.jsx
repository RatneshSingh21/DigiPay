import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import {
  FileText,
  Layers,
  Calendar,
  PieChart as PieChartIcon,
  ExternalLink,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Predefined months for filter
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

// Normalize API letterType to human-readable format
const normalizeType = (type) => {
  switch (type) {
    case "OfferLetter":
      return "Offer Letter";
    case "AppointmentLetter":
      return "Appointment Letter";
    case "ConfirmationLetter":
      return "Confirmation Letter";
    case "LetterOfIntent":
      return "Letter of Intent";
    case "IncrementLetter":
      return "Increment Letter";
    case "ExperienceCertificate":
      return "Experience Certificate";
    case "FullFinalSettlement":
      return "Full & Final Settlement";
    default:
      return type;
  }
};

const AdminReports = () => {
  const [letterData, setLetterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState(null);
  const [filterMonth, setFilterMonth] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Fetch data from API
  useEffect(() => {
    const fetchLetters = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/LetterMaster");
        if (response.data) {
          const formatted = response.data.map((item) => ({
            letterType: normalizeType(item.letterType),
            issueDate: item.issueDate,
            issuedTo: item.candidateName || "-",
            description: item.description || "-",
            reason: item.reason || "-",
            pdfUrl: item.pdfUrl || null,
          }));
          setLetterData(formatted);
        }
      } catch (error) {
        console.error("Error fetching letters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
  }, []);

  // Filter Logic
  const filteredData = letterData.filter((item) => {
    const matchesType = filterType
      ? item.letterType === filterType.value
      : true;

    const itemMonth = item.issueDate
      ? new Date(item.issueDate).getMonth() + 1
      : null;
    const matchesMonth = filterMonth
      ? parseInt(filterMonth.value) === itemMonth
      : true;

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

  // Pie Chart Data (dynamic)
  const pieChartData = (() => {
    const countMap = {};
    filteredData.forEach((item) => {
      countMap[item.letterType] = (countMap[item.letterType] || 0) + 1;
    });
    return Object.entries(countMap).map(([name, value]) => ({ name, value }));
  })();

  return (
    <>
      {/* Header + Filters */}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">HR Letters Management</h2>
        <div className="px-4 mb-2 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name, description, reason..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border min-w-[220px] rounded-lg px-3 py-1 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="min-w-[220px]">
            <Select
              options={[
                { value: "", label: "All Letter Types" },
                ...Array.from(new Set(letterData.map((l) => l.letterType))).map(
                  (t) => ({
                    value: t,
                    label: t,
                  })
                ),
              ]}
              onChange={(val) => setFilterType(val?.value ? val : null)}
              placeholder="Letter Type"
              isClearable
            />
          </div>
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

      {/* Summary + Pie Chart */}
      <div className="px-4 mt-4 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="flex items-center gap-3 bg-green-100 rounded-xl p-4 shadow-sm border border-green-300">
            <div className="bg-green-500 text-white p-3 rounded-full shadow">
              <Calendar size={22} />
            </div>
            <div>
              <h3 className="text-xs text-gray-700 font-medium">
                {filterMonth?.label || "All Months"} Count
              </h3>
              <p className="text-2xl font-bold text-green-700">
                {filteredData.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-orange-100 rounded-xl p-4 shadow-sm border border-orange-300">
            <div className="bg-orange-500 text-white p-3 rounded-full shadow">
              <PieChartIcon size={22} />
            </div>
            <div>
              <h3 className="text-xs text-gray-700 font-medium">Most Issued</h3>
              <p className="text-sm font-bold text-orange-700">
                {mostIssuedType?.type || "-"}
              </p>
              <p className="text-xs text-gray-600">
                {mostIssuedType ? `${mostIssuedType.count} issued` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4 border border-gray-200">
          <h3 className="font-semibold text-md mb-3 text-center">
            Letter Type Distribution
          </h3>
          <div className="w-full h-72">
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

      {/* Table */}
      <div className="bg-white mt-5 mx-4 rounded-xl text-xs shadow-lg overflow-y-auto max-h-[50vh] border border-gray-200">
        {loading ? (
          <p className="text-gray-500 text-center py-6">Loading letters...</p>
        ) : filteredData.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No records found.</p>
        ) : (
          <table className="min-w-full text-center border-collapse">
            <thead className="bg-blue-50 text-gray-700 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-4 py-3 font-semibold">S.No</th>
                <th className="px-4 py-3 font-semibold">Letter Type</th>
                <th className="px-4 py-3 font-semibold">Issue Date</th>
                <th className="px-4 py-3 font-semibold">Issued To</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={index}
                  className="transition-all duration-200 hover:bg-blue-50/70 hover:shadow-sm"
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

                  {/* ✅ Action Column */}
                  <td className="px-4 py-3 border-b border-gray-100">
                    {item.pdfUrl ? (
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        <ExternalLink size={16} /> View PDF
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
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
