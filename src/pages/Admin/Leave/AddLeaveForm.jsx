import React, { useEffect, useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import { toast } from "react-toastify";
import Select from "react-select";

const AddLeaveForm = ({ onClose, isEdit, initialData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [leaveTypeId, setLeaveTypeId] = useState(0);
  const user = useAuthStore((state) => state.user);
  // console.log(user.userId);

  const [formData, setFormData] = useState({
    leaveName: "",
    leaveCode: "",
    isPaid: false,
    isCarryForwardAllowed: false,
    maxCarryForwardLimit: 0,
    maxLeavesPerYear: 0,
    minServiceMonthsRequired: 0,
    allowDuringNoticePeriod: false,
    allowOnHolidays: false,
    allowOnWeekends: false,
    allowHalfDay: false,
    genderSpecific: false,
    applicableGender: "",
    isRoleRestricted: false,
    isActive: true,
  });

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setLeaveTypeId(initialData.leaveTypeId);
      setFormData(initialData);
    }
  }, [isEdit, initialData]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    setLoading(true);

    try {
      console.log(isEdit);
      if (isEdit === "Edit") {
        const payload = {
          ...formData,
          leaveTypeId,
          updatedBy: user.userId,
        };
        await axiosInstance.put("/LeaveType/update", payload);
      } else {
        const payload = {
          ...formData,
          createdBy: user.userId,
        };
        await axiosInstance.post("/LeaveType/save", payload);
      }

      toast.success("Leave Saved Successfully");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error saving Leave");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="fixed inset-0  backdrop-blur-sm z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close btn */}
          <button
            type="button"
            className="absolute top-4 right-4 text-slate-500 hover:text-red-500 text-xl cursor-pointer"
            onClick={onClose}
          >
            &times;
          </button>

          {/* Header */}
          <div className="px-6 pt-6 pb-2 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              {isEdit === "Edit" ? "Edit" : "New"} Leave Type
            </h2>
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[65vh] overflow-y-auto ">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leave Name & Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Leave Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="leaveName"
                    value={formData.leaveName}
                    onChange={handleChange}
                    placeholder="Enter leave name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Leave Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="leaveCode"
                    value={formData.leaveCode}
                    onChange={handleChange}
                    placeholder="Enter leave code"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
              </div>

              {/* Switches */}
              <div>
                <p className="text-sm font-medium mb-2 text-slate-700">
                  Settings
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Paid Leave", name: "isPaid" },
                    { label: "Carry Forward", name: "isCarryForwardAllowed" },
                    { label: "Half Day", name: "allowHalfDay" },
                    { label: "Active", name: "isActive" },
                    { label: "On Holidays", name: "allowOnHolidays" },
                    { label: "On Weekends", name: "allowOnWeekends" },
                    { label: "Notice Period", name: "allowDuringNoticePeriod" },
                    { label: "Role Restricted", name: "isRoleRestricted" },
                  ].map((item) => (
                    <label
                      key={item.name}
                      className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
                    >
                      <span className="text-sm">{item.label}</span>
                      <input
                        type="checkbox"
                        name={item.name}
                        checked={formData[item.name]}
                        onChange={handleChange}
                        className="w-5 h-5 accent-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Numeric Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Carry Forward
                  </label>
                  <input
                    type="number"
                    name="maxCarryForwardLimit"
                    value={formData.maxCarryForwardLimit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Leaves / Year
                  </label>
                  <input
                    type="number"
                    name="maxLeavesPerYear"
                    value={formData.maxLeavesPerYear}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Min Service Months
                  </label>
                  <input
                    type="number"
                    name="minServiceMonthsRequired"
                    value={formData.minServiceMonthsRequired}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Gender Restriction */}
              <div className="col-span-2 md:col-span-4 flex items-center gap-4 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 ">
                {/* Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">Gender Specific</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        genderSpecific: !formData.genderSpecific,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer
            ${formData.genderSpecific ? "bg-primary" : "bg-gray-300"}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition 
              ${formData.genderSpecific ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>

                {/* Applicable Gender Dropdown (sirf ON hone par dikhega) */}
                {formData.genderSpecific && (
                  <div className="flex-1 ">
                    <Select
                      isClearable
                      name="applicableGender"
                      value={
                        formData.applicableGender
                          ? {
                              value: formData.applicableGender,
                              label: formData.applicableGender,
                            }
                          : null
                      }
                      styles={{
                        menuList: (base) => ({
                          ...base,
                          maxHeight: 80, // yaha height fix karo
                          overflowY: "auto",
                        }),
                      }}
                      placeholder="Select Gender"
                      onChange={(selectedOption) =>
                        setFormData({
                          ...formData,
                          applicableGender: selectedOption?.value || "",
                        })
                      }
                      options={[
                        { value: "Male", label: "Male" },
                        { value: "Female", label: "Female" },
                        { value: "Other", label: "Other" },
                      ]}
                      className="w-full  "
                    />
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className={`px-6 py-2 rounded-lg font-medium text-white shadow-sm transition cursor-pointer ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-primary hover:bg-secondary"
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLeaveForm;
