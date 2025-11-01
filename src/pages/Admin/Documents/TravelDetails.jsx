import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Calendar,
  Smartphone,
} from "lucide-react";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const TravelDetails = () => {
  const [travelData, setTravelData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const inputClass =
    "w-full px-3 py-1.5 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm";

  useEffect(() => {
    const fetchTravelData = async () => {
      try {
        const res = await axiosInstance.get("/EmployeeTravelLocation/all");
        const data = res.data?.data || [];

        // Group by employeeId
        const grouped = data.reduce((acc, item) => {
          if (!acc[item.employeeId]) acc[item.employeeId] = [];
          acc[item.employeeId].push(item);
          return acc;
        }, {});

        const formatted = Object.entries(grouped).map(([empId, trips]) => ({
          empId,
          employeeName: trips[0]?.employeeName || "Unknown",
          totalTrips: trips.length,
          trips,
        }));

        setTravelData(formatted);
        setFiltered(formatted);
      } catch (error) {
        console.error("Error fetching travel data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelData();
  }, []);

  // Search and Date Filter Logic
  useEffect(() => {
    let temp = travelData;

    if (search.trim()) {
      temp = temp.filter((g) =>
        g.employeeName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (startDate || endDate) {
      temp = temp
        .map((group) => ({
          ...group,
          trips: group.trips.filter((trip) => {
            const tripDate = new Date(trip.startDate);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && tripDate < start) return false;
            if (end && tripDate > end) return false;
            return true;
          }),
        }))
        .filter((g) => g.trips.length > 0);
    }

    setFiltered(temp);
  }, [search, startDate, endDate, travelData]);

  const toggleExpand = (empId) => {
    setExpandedId((prev) => (prev === empId ? null : empId));
  };

  const trimAddress = (addr) => {
    if (!addr) return "—";
    const parts = addr.split(",");
    return parts.slice(0, 4).join(",");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="px-4 py-2 shadow-sm sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-lg text-gray-800">
          Employee Travel Details
        </h2>
        <p className="text-xs text-gray-500">
          Total Employees:{" "}
          <span className="font-medium text-gray-700">{filtered.length}</span>
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <input
            type="text"
            placeholder="🔎 Search by employee name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-64 px-3 py-1.5 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
            <span className="text-gray-500 text-sm">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* No Data */}
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 text-sm">
            No travel records found.
          </div>
        ) : (
          filtered.map((group) => (
            <div
              key={group.empId}
              className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Employee Header */}
              <div
                className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(group.empId)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="font-semibold text-gray-800 text-sm">
                    {group.employeeName}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-blue-600 font-medium flex items-center gap-1 text-sm">
                    Total Trips: {group.totalTrips}
                  </p>
                  {expandedId === group.empId ? (
                    <ChevronUp className="text-gray-500" size={18} />
                  ) : (
                    <ChevronDown className="text-gray-500" size={18} />
                  )}
                </div>
              </div>

              {/* Expandable Details */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  expandedId === group.empId
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-4 border-t border-gray-100 bg-gray-50/40">
                  <div className="overflow-x-auto max-h-[35vh] overflow-y-scroll">
                    <table className="min-w-full text-xs text-center border-t border-gray-100">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="py-2 px-3">S.No</th>
                          <th className="py-2 px-3">Start Date</th>
                          <th className="py-2 px-3">Start Address</th>
                          <th className="py-2 px-3">End Date</th>
                          <th className="py-2 px-3">End Address</th>
                          <th className="py-2 px-3">Purpose</th>
                          {/* <th className="py-2 px-3">Device Info</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {group.trips.map((trip, idx) => (
                          <tr
                            key={trip.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-2 px-3 text-gray-500">
                              {idx + 1}.
                            </td>
                            <td className="py-2 px-3 text-gray-600">
                              <Calendar
                                size={12}
                                className="inline mr-1 text-gray-400"
                              />
                              {new Date(trip.startDate).toLocaleString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </td>
                            <td className="py-2 px-3 text-gray-700 flex items-center">
                              <MapPin
                                size={12}
                                className="inline text-blue-500 mr-1"
                              />
                              {trimAddress(trip.startAddress)}
                            </td>
                            <td className="py-2 px-3 text-gray-600">
                              {trip.endDate
                                ? new Date(trip.endDate).toLocaleString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "—"}
                            </td>
                            <td className="py-2 px-3 text-gray-700">
                              {trip.endAddress ? (
                                <>
                                  <MapPin
                                    size={12}
                                    className="inline text-green-500 mr-1"
                                  />
                                  {trimAddress(trip.endAddress)}
                                </>
                              ) : (
                                <span className="text-gray-400 italic">—</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-gray-700">
                              {trip.purpose || "—"}
                            </td>
                            {/* <td className="py-2 px-3 text-gray-500 flex items-center justify-center gap-1">
                              <Smartphone size={12} className="text-gray-400" />
                              {trip.deviceInfo || "—"}
                            </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TravelDetails;
