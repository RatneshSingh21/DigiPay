import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Select from "react-select";
import Spinner from "../../../../components/Spinner";

const WeekendPolicyMap = ({ policy, onClose }) => {
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    weekendPolicyId: policy.weekendPolicyId,
    departmentId: null,
    locationId: null,
    employeeId: null,
    isDefault: false,
    effectiveFrom: "",
    effectiveTo: "",
  });

  const handleSelectChange = (selected, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selected,
      ...(name === "departmentId" || name === "locationId"
        ? { employeeId: null }
        : {}),
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (formData.effectiveFrom >= formData.effectiveTo) {
      toast.error("Policy end time must be after start time");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const payload = {
      ...formData,
      departmentId: formData.departmentId?.value,
      locationId: formData.locationId?.value,
      employeeId: formData.employeeId?.value,
    };
    try {
      await axiosInstance.post("/WeekendPolicyMapping/create", payload);
      toast.success("Weekend policy mapped successfully");
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to map policy");
    }
  };

  // Load Departments & Locations initially
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [deptRes, locRes] = await Promise.all([
          axiosInstance.get("/Department"),
          axiosInstance.get("/WorkLocation"),
        ]);
        setDepartments(
          deptRes.data.map((d) => ({ value: d.id, label: d.name }))
        );
        setLocations(locRes.data.map((l) => ({ value: l.id, label: l.name })));
      } catch (error) {
        toast.error("Failed to load dropdown data");
      }
    };
    loadOptions();
  }, []);

  // Load Employees when Department or Location changes
  useEffect(() => {
    const loadEmployees = async () => {
      if (formData.departmentId && formData.locationId) {
        try {
          const res = await axiosInstance.get("/Employee");

          // Filter employees based on selected department and location
          const filtered = res.data.filter(
            (emp) =>
              emp.departmentId === formData.departmentId.value &&
              emp.workLocationId === formData.locationId.value
          );

          setEmployees(
            filtered.map((e) => ({
              value: e.id,
              label: e.fullName,
            }))
          );
        } catch (error) {
          toast.error("Failed to load employees");
        }
      } else {
        setEmployees([]);
      }
    };

    loadEmployees();
  }, [formData.departmentId, formData.locationId]);

  // ESC to close
  //   useEffect(() => {
  //     const esc = (e) => e.key === "Escape" && onClose();
  //     window.addEventListener("keydown", esc);
  //     return () => window.removeEventListener("keydown", esc);
  //   }, [onClose]);

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 relative">
        {/* Header */}
        <div className="mb-6 border-b pb-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Map Weekend Policy
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Policy Info */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Policy Information
            </h4>
            <input
              type="text"
              value={formData.weekendPolicyId}
              readOnly
              className="w-full bg-gray-100 border rounded px-4 py-2 text-gray-600"
            />
          </div>

          {/* Mapping Details */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3">
              Mapping Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Department
                </label>
                <Select
                  value={formData.departmentId}
                  onChange={(val) => handleSelectChange(val, "departmentId")}
                  options={departments}
                  placeholder="Select Department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Location
                </label>
                <Select
                  value={formData.locationId}
                  onChange={(val) => handleSelectChange(val, "locationId")}
                  options={locations}
                  placeholder="Select Location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Employee
                </label>
                <Select
                  value={formData.employeeId}
                  onChange={(val) => handleSelectChange(val, "employeeId")}
                  options={employees}
                  isDisabled={!formData.departmentId || !formData.locationId}
                  placeholder="Select Employee"
                />
              </div>
            </div>

            {/* Default Checkbox */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => handleChange("isDefault", e.target.checked)}
                className="mr-2 accent-primary"
              />
              <label className="text-sm text-gray-700">
                Set as Default Policy
              </label>
            </div>
          </div>

          {/* Effective Dates */}
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-3">
              Effective Duration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Effective From
                </label>
                <input
                  type="datetime-local"
                  value={formData.effectiveFrom}
                  onChange={(e) =>
                    handleChange("effectiveFrom", e.target.value)
                  }
                  required
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Effective To
                </label>
                <input
                  type="datetime-local"
                  value={formData.effectiveTo}
                  onChange={(e) => handleChange("effectiveTo", e.target.value)}
                  required
                  className="w-full border rounded px-4 py-2"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-primary hover:bg-primary hover:text-white  text-primary font-semibold rounded-lg  transition-all"
            >
              Map Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeekendPolicyMap;