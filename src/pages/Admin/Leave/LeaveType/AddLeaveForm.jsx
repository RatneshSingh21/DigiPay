import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../../store/authStore";
import { toast } from "react-toastify";
import Select from "react-select";
import { LEAVE_CATALOG } from "./leaveCatalog";

const CUSTOM_OPTION = {
  label: "➕ Add Custom Leave",
  value: "__CUSTOM__",
};

const AddLeaveForm = ({ onClose, isEdit, initialData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    leaveName: "",
    leaveCode: "",
    isSystemDefined: true,
    isActive: true,
  });

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData({
        leaveName: initialData.leaveName,
        leaveCode: initialData.leaveCode,
        isSystemDefined: initialData.isSystemDefined,
        isActive: initialData.isActive,
      });
      setIsCustom(!initialData.isSystemDefined);
    }
  }, [isEdit, initialData]);

  const options = [...LEAVE_CATALOG, CUSTOM_OPTION];

  const selectedOption = isCustom
    ? CUSTOM_OPTION
    : LEAVE_CATALOG.find((x) => x.value === formData.leaveCode) || null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.leaveName || !formData.leaveCode) {
      toast.error("Leave name and code are required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        leaveName: formData.leaveName.trim(),
        leaveCode: formData.leaveCode.trim(),
        isSystemDefined: !isCustom,
        isActive: formData.isActive,
      };

      if (isEdit === "Edit") {
        await axiosInstance.put("/LeaveType/update", {
          ...payload,
          leaveTypeId: initialData.leaveTypeId,
          updatedBy: user.userId,
        });
      } else {
        await axiosInstance.post("/LeaveType/save", {
          ...payload,
          createdBy: user.userId,
        });
      }

      toast.success("Leave type saved successfully");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error saving leave type");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border rounded-lg px-2 py-1  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-transform hover:-translate-y-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-3xl cursor-pointer text-gray-400 hover:text-red-500"
        >
          &times;
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-3 border-b">
          <h2 className="text-xl font-extrabold text-primary">
            {isEdit === "Edit" ? "Edit Leave Type" : "Add Leave Type"}
          </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Leave selector */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Select Leave Type <span className="text-red-500">*</span>
            </label>

            <Select
              options={options}
              value={selectedOption}
              isDisabled={isEdit === "Edit"}
              placeholder="Choose leave type"
              className="shadow-sm rounded-lg"
              onChange={(option) => {
                if (option.value === "__CUSTOM__") {
                  setIsCustom(true);
                  setFormData({
                    leaveName: "",
                    leaveCode: "",
                    isSystemDefined: false,
                    isActive: true,
                  });
                } else {
                  setIsCustom(false);
                  setFormData({
                    leaveName: option.name,
                    leaveCode: option.value,
                    isSystemDefined: true,
                    isActive: true,
                  });
                }
              }}
            />
          </div>

          {/* Custom leave inputs */}
          {isCustom && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Leave Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.leaveName}
                  onChange={(e) =>
                    setFormData({ ...formData, leaveName: e.target.value })
                  }
                  className={inputClass}
                  placeholder="e.g. Birthday Leave"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Leave Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.leaveCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      leaveCode: e.target.value.toUpperCase(),
                    })
                  }
                  className={inputClass}
                  placeholder="e.g. BDL"
                  maxLength={5}
                  required
                />
              </div>
            </div>
          )}

          {/* Active toggle */}
          <label className="flex items-center justify-between px-4 py-2 rounded-lg border border-blue-300 bg-gray-50 cursor-pointer">
            <span className="text-sm font-medium">Active</span>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-6 h-6 accent-primary cursor-pointer"
            />
          </label>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border cursor-pointer hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white font-semibold shadow-md transition-colors ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-primary hover:bg-secondary cursor-pointer"
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveForm;
