import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const PayScheduleForm = ({ schedule, onSuccess, onCancel }) => {
  const isEdit = !!schedule;
  const [selectedDays, setSelectedDays] = useState([
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
  ]);
  const [payOptionSelected, setPayOptionSelected] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [salaryBasis, setSalaryBasis] = useState("actual");
  const [orgWorkingDays, setOrgWorkingDays] = useState({
    value: 22,
    label: "22",
  });
  const [payOn, setPayOn] = useState("");
  const [payDay, setPayDay] = useState({ value: 1, label: "1" });
  const [startMonth, setStartMonth] = useState(null);
  const [calendarDates, setCalendarDates] = useState([]);
  const [selectedPayDate, setSelectedPayDate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const payDayOptions = Array.from({ length: 28 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}`,
  }));
  const orgWorkingDayOptions = Array.from({ length: 11 }, (_, i) => ({
    value: i + 21,
    label: `${i + 21}`,
  }));

  const getNext12Months = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      const value = `${monthName}-${year}`;
      months.push({ value, label: value });
    }

    return months;
  };

  const monthOptions = getNext12Months();
  const today = new Date();
  const currentMonthValue = `${today.toLocaleString("default", {
    month: "long",
  })}-${today.getFullYear()}`;

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  useEffect(() => {
    validateDays();
  }, [selectedDays]);

  const validateDays = () => {
    if (selectedDays.length < 4) {
      setError("Please select at least 4 working days.");
      return false;
    }

    const selectedIndexes = selectedDays
      .map((d) => days.indexOf(d))
      .sort((a, b) => a - b);
    let maxStreak = 1,
      currentStreak = 1;

    for (let i = 1; i < selectedIndexes.length; i++) {
      if (selectedIndexes[i] === selectedIndexes[i - 1] + 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else currentStreak = 1;
    }

    if (maxStreak < 4) {
      setError("Please select at least 4 continuous working days.");
      return false;
    }

    setError("");
    return true;
  };

  const convertToISODate = (monthYearStr) => {
    const [monthName, year] = monthYearStr.split("-");
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    const date = new Date(year, monthIndex, 1, 9, 0, 0);
    return date.toISOString();
  };

  // 1. Calendar generate karne wala effect
  useEffect(() => {
    if (startMonth?.value) {
      const [month, year] = startMonth.value.split("-");
      const baseDate = new Date(`${month} 1, ${year}`);
      const totalDays = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() + 1,
        0
      ).getDate();

      const allDates = Array.from({ length: totalDays }, (_, i) => {
        const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), i + 1);
        return {
          date: i + 1,
          day: days[d.getDay()],
          iso: d.toISOString(),
        };
      });

      setCalendarDates(allDates);
    }
  }, [startMonth]);

  // 2. Pay date auto-select karne wala effect
  useEffect(() => {
    if (calendarDates.length > 0 && payDay?.value) {
      const matchingDate = calendarDates.find((d) => d.date === payDay.value);
      if (matchingDate) {
        setSelectedPayDate(matchingDate);
      }
    }
  }, [calendarDates, payDay]);

  useEffect(() => {
    if (payOn === "lastDay" && calendarDates.length > 0) {
      // Filter dates matching selected working days
      const workingDates = calendarDates
        .filter((d) => selectedDays.includes(d.day))
        .sort((a, b) => b.date - a.date); // sort descending

      if (workingDates.length > 0) {
        setSelectedPayDate(workingDates[0]);
      }
    }
  }, [payOn, calendarDates, selectedDays]);

  useEffect(() => {
    if (selectedPayDate && payOn !== "lastDay") {
      setPayOn("fixedDay");
      setPayDay({
        value: selectedPayDate.date,
        label: `${selectedPayDate.date}`,
      });
    }
  }, [selectedPayDate]);

  const handleSave = async () => {
    if (!employeeName.trim()) {
      toast.error("Please enter a name.");
      return;
    }
    if (!validateDays()) return;
    if (payOptionSelected && !startMonth) {
      toast.error("Please select a payroll start month.");
      return;
    }

    const payload = {
      name: employeeName,
      workWeekDays: selectedDays,
      salaryBasedOn: salaryBasis,
      organizationWorkingDays: salaryBasis === "org" ? orgWorkingDays.value : 0,
      payOnType: payOn,
      specificPayDay: payOn === "fixedDay" ? payDay.value : 0,
      firstPayrollStartFrom: startMonth
        ? convertToISODate(startMonth.value)
        : new Date().toISOString(),
      payFrequency: "monthly",
    };

    setLoading(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`/PaySchedule/${schedule.id}`, payload);
        toast.success("Pay Schedule updated successfully!");
      } else {
        await axiosInstance.post("/PaySchedule/create", payload);
        toast.success("Pay Schedule saved successfully!");
      }

      if (!isEdit) {
        // Reset form after create
        setEmployeeName("");
        setSelectedDays(["MON", "TUE", "WED", "THU", "FRI"]);
        setPayOptionSelected(false);
        setSalaryBasis("actual");
        setPayOn("lastDay");
        setPayDay({ value: 1, label: "1" });
        setOrgWorkingDays({ value: 22, label: "22" });
        setStartMonth(null);
        setCalendarDates([]);
        setSelectedPayDate(null);
        setError("");
      }

      if (onSuccess) onSuccess(); // Optional callback
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save. Please try again."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      setEmployeeName(schedule.name || "");
      setSelectedDays(schedule.workWeekDays || []);
      setSalaryBasis(schedule.salaryBasedOn || "actual");

      if (schedule.salaryBasedOn === "org") {
        setOrgWorkingDays({
          value: schedule.organizationWorkingDays,
          label: String(schedule.organizationWorkingDays),
        });
      }

      setPayOn(schedule.payOnType || "lastDay");

      if (schedule.payOnType === "fixedDay") {
        setPayDay({
          value: schedule.specificPayDay,
          label: String(schedule.specificPayDay),
        });
      }

      const isoDate = new Date(schedule.firstPayrollStartFrom);
      const monthLabel =
        isoDate.toLocaleString("default", { month: "long" }) +
        "-" +
        isoDate.getFullYear();
      const matchedMonth = getNext12Months().find(
        (m) => m.value === monthLabel
      );
      setStartMonth(matchedMonth || null);
      setPayOptionSelected(true);
    }
  }, [schedule]);

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="mx-auto p-4 bg-white rounded-md text-sm shadow">
        {/* Name Input */}
        <div className="mb-4">
          <label className="block font-medium mb-1">
            Schedule Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Enter name"
            autoFocus
            className="w-1/2 px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Work Week */}
        <div className="mb-4">
          <label className="block font-medium mb-1">
            Select your work week <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-500 mb-2">
            The days worked in a calendar week
          </p>
          <div className="flex gap-1 flex-wrap">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-4 py-2 border cursor-pointer text-sm rounded-sm ${
                  selectedDays.includes(day)
                    ? "bg-blue-100 border-blue-500 text-blue-800"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Salary Basis */}
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Calculate monthly salary based on{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="radio"
                name="salaryBasis"
                checked={salaryBasis === "actual"}
                onChange={() => setSalaryBasis("actual")}
                className="accent-[rgb(var(--color-primary))]"
              />
              <span>Actual days in a month</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="radio"
                name="salaryBasis"
                checked={salaryBasis === "org"}
                onChange={() => setSalaryBasis("org")}
                className="accent-[rgb(var(--color-primary))]"
              />
              <span>Organisation working days -</span>
              <div className="w-24">
                <Select
                  isDisabled={salaryBasis !== "org"}
                  value={orgWorkingDayOptions.find(
                    (opt) => opt.value === orgWorkingDays.value
                  )}
                  onChange={(selected) => setOrgWorkingDays(selected)}
                  options={orgWorkingDayOptions}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pay On */}
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Pay on <span className="text-red-500">*</span>
          </label>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="payOn"
                value="lastDay"
                checked={payOn === "lastDay"}
                onChange={() => {
                  setPayOn("lastDay");
                  setPayOptionSelected(true);
                }}
                className="accent-[rgb(var(--color-primary))]"
              />

              <span>the last working day of every month</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="payOn"
                value="fixedDay"
                checked={payOn === "fixedDay"}
                onChange={() => {
                  setPayOn("fixedDay");
                  setPayOptionSelected(true);
                }}
                className="accent-[rgb(var(--color-primary))]"
              />
              <span>day</span>
              <div className="w-24">
                <Select
                  isDisabled={payOn !== "fixedDay"}
                  value={payDayOptions.find(
                    (opt) => opt.value === payDay.value
                  )}
                  onChange={(selected) => setPayDay(selected)}
                  options={payDayOptions}
                />
              </div>
              <span>of every month</span>
            </div>
          </div>
        </div>

        {/* Start Payroll From */}
        {payOptionSelected && (
          <div className="mb-4">
            <label className="block font-medium mb-2">
              Start your first payroll from{" "}
              <span className="text-red-500">*</span>
            </label>
            <Select
              options={monthOptions}
              value={startMonth}
              onChange={(selectedOption) => setStartMonth(selectedOption)}
              placeholder={currentMonthValue}
            />
          </div>
        )}

        {/* Calendar and Pay Date Picker */}
        {startMonth && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block font-medium mb-1">
                Select a pay date for your first payroll{" "}
                <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Pay Period: <strong>{startMonth?.value}</strong>
              </p>
              <Select
                placeholder="Select a pay date"
                options={calendarDates.map((d) => ({
                  value: d.date,
                  label: `${d.date} - ${d.day}`,
                }))}
                value={
                  selectedPayDate
                    ? {
                        value: selectedPayDate.date,
                        label: `${selectedPayDate.date} - ${selectedPayDate.day}`,
                      }
                    : null
                }
                onChange={(option) => {
                  const selected = calendarDates.find(
                    (d) => d.date === option.value
                  );
                  setSelectedPayDate(selected);
                }}
              />
            </div>

            <div className="bg-white p-2 rounded shadow border w-full max-w-xs">
              <div className="text-center font-semibold text-gray-800 mb-2 text-sm">
                {startMonth?.value}
              </div>
              <div className="grid grid-cols-7 gap-[2px] text-xs">
                {days.map((day) => (
                  <div
                    key={day}
                    className="text-center font-medium text-gray-600"
                  >
                    {day}
                  </div>
                ))}
                {/* Previous month filler */}
                {(() => {
                  const [month, year] = startMonth.value.split("-");
                  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
                  const baseDate = new Date(year, monthIndex, 1);
                  const firstDayIndex = baseDate.getDay();
                  const prevMonthLastDate = new Date(
                    year,
                    monthIndex,
                    0
                  ).getDate();
                  return [...Array(firstDayIndex)].map((_, i) => (
                    <div
                      key={`prev-${i}`}
                      className="text-center text-gray-300"
                    >
                      {prevMonthLastDate - firstDayIndex + i + 1}
                    </div>
                  ));
                })()}
                {/* Current month */}
                {calendarDates.map((d) => (
                  <div
                    key={d.date}
                    className={`text-center rounded-full p-1 ${
                      selectedPayDate?.date === d.date
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-gray-700"
                    }`}
                  >
                    {d.date}
                  </div>
                ))}
                {/* Next month filler */}
                {(() => {
                  const [month, year] = startMonth.value.split("-");
                  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
                  const baseDate = new Date(year, monthIndex, 1);
                  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
                  const firstDayIndex = baseDate.getDay();
                  const totalSlots = firstDayIndex + totalDays;
                  const nextMonthDays =
                    7 * Math.ceil(totalSlots / 7) - totalSlots;

                  return [...Array(nextMonthDays)].map((_, i) => (
                    <div
                      key={`next-${i}`}
                      className="text-center text-gray-300"
                    >
                      {i + 1}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        <hr className="my-6" />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className={`bg-primary text-white cursor-pointer px-6 py-2 rounded-md hover:bg-secondary flex items-center gap-2 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? <Spinner /> : "Save"}
          </button>
          <p className="text-sm text-red-500 font-medium">
            * Indicates mandatory fields
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayScheduleForm;
