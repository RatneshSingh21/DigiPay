import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cake, ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const AdminUpcomingBirthdays = () => {
  const [employees, setEmployees] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const fetchBirthdays = async () => {
    try {
      const res = await axiosInstance.get("/PersonalDetails/dashboard-report");
      setEmployees(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 🎯 Professional filtering logic
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0–11

    return employees
      .filter((emp) => {
        if (!emp.dateOfBirth) return false;
        const dob = new Date(emp.dateOfBirth);
        return dob.getMonth() === currentMonth; // 🎯 Only current month
      })
      .map((emp) => {
        const dob = new Date(emp.dateOfBirth);

        const nextBirthday = new Date(
          today.getFullYear(),
          dob.getMonth(),
          dob.getDate(),
        );

        const diff = nextBirthday - today;
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const turningAge = today.getFullYear() - dob.getFullYear();

        return {
          ...emp,
          nextBirthday,
          daysLeft,
          turningAge,
        };
      })
      .filter((emp) => emp.daysLeft >= 0) // Optional: only future dates this month
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [employees]);

  // Auto slide
  useEffect(() => {
    if (!upcomingBirthdays.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === upcomingBirthdays.length - 1 ? 0 : prev + 1,
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [upcomingBirthdays]);

  if (!upcomingBirthdays.length) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Cake size={18} />
          Upcoming Birthdays
        </h2>
        <p className="text-gray-500 mt-3 text-sm">
          No upcoming birthdays found.
        </p>
      </div>
    );
  }

  const current = upcomingBirthdays[currentIndex];

  const progress =
    current.daysLeft === 0
      ? 100
      : Math.max(0, 100 - (current.daysLeft / 30) * 100);

  const initials = current.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Upcoming Birthdays
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Celebrate your team members
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <Cake size={14} className="text-primary" />
          {upcomingBirthdays.length} Upcoming
        </div>
      </div>

      {/* Carousel */}
      <div className="relative h-44">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.employeeCode}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="absolute w-full"
          >
            <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-semibold text-lg shadow-inner">
                {initials}
              </div>

              {/* Info Section */}
              <div className="flex-1">
                {/* Name + Code */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-slate-800">
                    {current.fullName}
                  </h3>

                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                    {current.employeeCode}
                  </span>
                </div>

                {/* Department & Designation Pills */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    {current.departmentName}
                  </span>

                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    {current.designationTitle}
                  </span>
                </div>

                <div className="mt-4 flex justify-between items-center text-sm">
                  <span className="text-slate-700 font-medium">
                    {current.nextBirthday.toLocaleDateString("en-Gb")}
                  </span>

                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary text-white flex items-center gap-1">
                    {current.daysLeft === 0 ? (
                      <>
                        Today <Cake size={14} />
                      </>
                    ) : (
                      `${current.daysLeft} days left`
                    )}
                  </span>
                </div>

                {/* Progress */}
                <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  Turning {current.turningAge} years old
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === 0 ? upcomingBirthdays.length - 1 : prev - 1,
            )
          }
          className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Indicators */}
        <div className="flex gap-2">
          {upcomingBirthdays.map((_, i) => (
            <div
              key={i}
              className={`transition-all duration-300 rounded-full ${
                i === currentIndex
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-slate-300"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === upcomingBirthdays.length - 1 ? 0 : prev + 1,
            )
          }
          className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default AdminUpcomingBirthdays;
