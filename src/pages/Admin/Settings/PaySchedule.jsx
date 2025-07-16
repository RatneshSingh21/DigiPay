import React, { useState, useEffect } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Spinner from "../../../components/Spinner";

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const PaySchedule = () => {
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
  const [payOn, setPayOn] = useState("lastDay");
  const [payDay, setPayDay] = useState({ value: 1, label: "1" });
  const [startMonth, setStartMonth] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dayOptions = [...Array(31).keys()].map((d) => ({
    value: d + 1,
    label: `${d + 1}`,
  }));
  const orgWorkingDayOptions = dayOptions;
  const monthOptions = [
    "April-2025",
    "May-2025",
    "June-2025",
    "July-2025",
    "August-2025",
    "September-2025",
  ].map((month) => ({ value: month, label: month }));

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
      } else {
        currentStreak = 1;
      }
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

    setLoading(true); // Start loading

    try {
      await axiosInstance.post("/PaySchedule/create", payload);
      toast.success("Pay Schedule saved successfully!!!");

      // Reset form
      setEmployeeName("");
      setSelectedDays(["MON", "TUE", "WED", "THU", "FRI"]);
      setPayOptionSelected(false);
      setSalaryBasis("actual");
      setPayOn("lastDay");
      setPayDay({ value: 1, label: "1" });
      setOrgWorkingDays({ value: 22, label: "22" });
      setStartMonth(null);
      setError("");
    } catch (err) {
      toast.error("Failed to save. Please try again.");
      console.error(err);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <>
      <div className="p-4 shadow mb-5 sticky top-14 bg-white z-10">
        <h2 className="font-semibold text-xl">Pay Schedule</h2>
      </div>
      <div className="mx-auto p-4 bg-white rounded-md shadow">
        {/* Name */}
        <div className="mb-6">
          <label className="block font-medium mb-1">
            Schedule Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Enter name"
            className="w-1/2 border px-4 py-2 rounded"
          />
        </div>

        {/* Work week */}
        <div className="mb-6">
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
                className={`px-4 py-2 border text-sm rounded-sm ${
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

        {/* Salary basis */}
        <div className="mb-6">
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

        {/* Pay on */}
        <div className="mb-6">
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
                  value={dayOptions.find((opt) => opt.value === payDay.value)}
                  onChange={(selected) => setPayDay(selected)}
                  options={dayOptions}
                />
              </div>
              <span>of every month</span>
            </div>
          </div>
        </div>

        {/* Start Month */}
        {payOptionSelected && (
          <div className="mb-6">
            <label className="block font-medium mb-2">
              Start your first payroll from{" "}
              <span className="text-red-500">*</span>
            </label>
            <Select
              options={monthOptions}
              value={monthOptions.find(
                (opt) => opt.value === startMonth?.value
              )}
              onChange={(selected) => setStartMonth(selected)}
              placeholder="Select month"
            />
          </div>
        )}

        <hr className="my-6" />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className={`bg-primary text-white px-6 py-2 rounded-md hover:bg-secondary flex items-center gap-2 ${
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
    </>
  );
};

export default PaySchedule;
