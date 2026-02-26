import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import assets from "../../../assets/assets";

const UpcomingHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axiosInstance.get("/HolidayListMaster/get-all");
        const today = new Date();

        // Filter upcoming + sort by date + take only first 5
        const sortedUpcoming = (response.data || [])
          .filter((h) => new Date(h.holidayDate) >= today)
          .sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate));

        setHolidays(sortedUpcoming);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white py-3">
        <div className="text-center text-gray-500 py-4">
          Loading holidays...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-3">
      <div className="max-h-52 overflow-y-auto divide-y divide-gray-200">
        {holidays.length > 0 ? (
          holidays.map((holiday) => {
            const dateObj = parseISO(holiday.holidayDate);
            return (
              <div
                key={holiday.holidayId}
                className="flex items-center justify-between py-3 px-3 text-sm"
              >
                <div className="flex flex-col">
                  <span className="text-gray-900 font-medium">
                    {holiday.holidayName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(dateObj, "EEEE")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-indigo-600">
                    {format(dateObj, "dd MMM yyyy")}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <img
              src={assets.holiday}
              alt="No holidays"
              className="w-40 h-40 object-contain opacity-80"
            />
            <p className="text-gray-500 text-sm mt-2">No upcoming holidays</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingHolidays;
