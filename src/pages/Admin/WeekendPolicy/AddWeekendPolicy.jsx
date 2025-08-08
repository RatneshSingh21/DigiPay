//Semi-ready
import React, { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const DayToggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-lg shadow-sm">
    <span className="text-gray-700 font-medium">{label}</span>
    <Switch
      checked={value}
      onChange={onChange}
      className={`${
        value ? "bg-primary" : "bg-gray-300"
      } relative inline-flex h-6 w-11 items-center rounded-full transition`}
    >
      <span
        className={`${
          value ? "translate-x-6" : "translate-x-1"
        } inline-block h-4 w-4 transform bg-white rounded-full transition`}
      />
    </Switch>
  </div>
);

const AddWeekendPolicy = ({ onClose, onSuccess, initialData, isEdit }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    policyName: "",
    isFixedWeekend: false,
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    alternateSaturday: false,
    firstSaturdayOff: false,
    secondSaturdayOff: false,
    thirdSaturdayOff: false,
    fourthSaturdayOff: false,
    isHalfDayWeekend: false,
    halfDayStartTime: "",
    halfDayEndTime: "",
    isRotationalWeekend: false,
    rotationalRuleJson: "",
    allowOverrideByShift: false,
    remarks: "",
    isActive: true,
    createdOn: new Date().toISOString(),
    createdBy: "Admin",
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const weekendDays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const selectedWeekendDays = weekendDays.filter((day) => formData[day]);

  const handleWeekendDayChange = (day) => {
    const currentlySelected = weekendDays.filter((d) => formData[d]);
    if (formData[day]) {
      handleChange(day, false);
    } else if (currentlySelected.length < 2) {
      handleChange(day, true);
    } else {
      toast.warning("You can only select 2 weekend days.");
    }
  };

  const allowedAltCombos = [
    ["first", "third"],
    ["second", "fourth"],
  ];

  const getAltDayFields = (day) => {
    return allowedAltCombos.map((combo) => (
      <div key={combo.join("-")} className="flex gap-4">
        {combo.map((num) => (
          <DayToggle
            key={`${num}${day}`}
            label={`${num.charAt(0).toUpperCase() + num.slice(1)} ${
              day.charAt(0).toUpperCase() + day.slice(1)
            } Off`}
            value={
              formData[
                `${num}${day.charAt(0).toUpperCase() + day.slice(1)}Off`
              ] || false
            }
            onChange={(val) => {
              const update = {};
              allowedAltCombos.forEach(([a, b]) => {
                update[
                  `${a}${day.charAt(0).toUpperCase() + day.slice(1)}Off`
                ] = false;
                update[
                  `${b}${day.charAt(0).toUpperCase() + day.slice(1)}Off`
                ] = false;
              });
              update[`${num}${day.charAt(0).toUpperCase() + day.slice(1)}Off`] =
                val;
              setFormData((prev) => ({ ...prev, ...update }));
            }}
          />
        ))}
      </div>
    ));
  };

  const validateForm = () => {
    if (!formData.policyName.trim()) {
      toast.error("Policy name is required");
      return false;
    }
    if (formData.isFixedWeekend && selectedWeekendDays.length !== 2) {
      toast.error("Exactly 2 weekend days must be selected");
      return false;
    }
    if (formData.isHalfDayWeekend) {
      if (!formData.halfDayStartTime || !formData.halfDayEndTime) {
        toast.error("Start and end time are required for half-day");
        return false;
      }
      if (formData.halfDayStartTime >= formData.halfDayEndTime) {
        toast.error("Half-day end time must be after start time");
        return false;
      }
    }
    if (formData.isRotationalWeekend && formData.rotationalRuleJson.trim()) {
      try {
        JSON.parse(formData.rotationalRuleJson);
      } catch (err) {
        toast.error("Rotational Rule JSON is invalid");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validateForm()) return;

    setLoading(true);

    const payload = {
      ...formData,
    };

    try {
      await axiosInstance.post("WeekendPolicy/insert-or-update", payload);
      toast.success("Weekend Policy saved successfully!");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        toast.error(`Failed: ${error.response.data.message}`);
      } else {
        toast.error("Error submitting policy");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [isEdit, initialData]);

  return (
    <div
      className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white max-h-[100vh] overflow-y-auto p-6 rounded-lg shadow-lg max-w-3xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
          onClick={onClose}
        >
          &times;
        </button> 

        <h2 className="text-2xl font-bold mb-8 text-gray-800">
          {isEdit === "Edit" ? "Edit" : "New"} Weekend Policy
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Policy Name
              </label>
              <input
                type="text"
                value={formData.policyName}
                onChange={(e) => handleChange("policyName", e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Default Weekend"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Remarks
              </label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) => handleChange("remarks", e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Any additional notes"
              />
            </div>
          </div>

          <DayToggle
            label="Is Fixed Weekend"
            value={formData.isFixedWeekend}
            onChange={(val) => handleChange("isFixedWeekend", val)}
          />

          {formData.isFixedWeekend && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Select 2 Weekend Days
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {weekendDays.map((day) => (
                  <DayToggle
                    key={day}
                    label={day.charAt(0).toUpperCase() + day.slice(1)}
                    value={formData[day]}
                    onChange={() => handleWeekendDayChange(day)}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedWeekendDays.map((day) => (
            <div key={day} className="mt-6">
              <h3 className="text-lg mb-2 font-semibold text-gray-700">
                Alternate {day.charAt(0).toUpperCase() + day.slice(1)} Off
              </h3>
              <DayToggle
                label={`Enable Alternate ${
                  day.charAt(0).toUpperCase() + day.slice(1)
                }`}
                value={
                  formData[
                    `alternate${day.charAt(0).toUpperCase() + day.slice(1)}`
                  ] || false
                }
                onChange={(val) =>
                  handleChange(
                    `alternate${day.charAt(0).toUpperCase() + day.slice(1)}`,
                    val
                  )
                }
              />
              {formData[
                `alternate${day.charAt(0).toUpperCase() + day.slice(1)}`
              ] && <div className="mt-4">{getAltDayFields(day)}</div>}
            </div>
          ))}

          <DayToggle
            label="Is Half Day Weekend"
            value={formData.isHalfDayWeekend}
            onChange={(val) => handleChange("isHalfDayWeekend", val)}
          />

          {formData.isHalfDayWeekend && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-1">
                  Half Day Start Time
                </label>
                <input
                  type="time"
                  value={formData.halfDayStartTime}
                  onChange={(e) =>
                    handleChange("halfDayStartTime", e.target.value)
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Half Day End Time
                </label>
                <input
                  type="time"
                  value={formData.halfDayEndTime}
                  onChange={(e) =>
                    handleChange("halfDayEndTime", e.target.value)
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          )}

          <DayToggle
            label="Is Rotational Weekend"
            value={formData.isRotationalWeekend}
            onChange={(val) => handleChange("isRotationalWeekend", val)}
          />

          {formData.isRotationalWeekend && (
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Rotational Rule JSON
              </label>
              <textarea
                value={formData.rotationalRuleJson}
                onChange={(e) =>
                  handleChange("rotationalRuleJson", e.target.value)
                }
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Paste or write JSON for rotational rules"
                rows={3}
              ></textarea>
            </div>
          )}

          <DayToggle
            label="Allow Override By Shift"
            value={formData.allowOverrideByShift}
            onChange={(val) => handleChange("allowOverrideByShift", val)}
          />

          <DayToggle
            label="Is Active"
            value={formData.isActive}
            onChange={(val) => handleChange("isActive", val)}
          />

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Saving..." : "Save Policy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWeekendPolicy;