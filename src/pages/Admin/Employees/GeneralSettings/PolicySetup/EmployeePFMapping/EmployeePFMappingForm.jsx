import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../../../axiosInstance/axiosInstance";

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? "#60A5FA" : "#CBD5E1",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(96,165,250,0.3)" : "none",
    "&:hover": { borderColor: "#60A5FA" },
    borderRadius: "0.5rem",
    minHeight: "44px",
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
};

const EmployeePFMappingForm = ({ initialData, onClose, refreshList }) => {
  const [employees, setEmployees] = useState([]);
  const [pfSettings, setPfSettings] = useState([]);
  const [components, setComponents] = useState([]); // For appliesOnComponents dropdown
  const [formData, setFormData] = useState(
    initialData || {
      employeeId: "",
      pfNumber: "",
      isOptedOut: false,
      pfSettingsId: "",
      overrideCalculationType: "",
      overridePercentage: "",
      overrideFixedAmount: "",
      effectiveFrom: "",
      effectiveTo: "",
      appliesOnComponents: [],
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, pfRes, compRes] = await Promise.all([
          axiosInstance.get("/Employee"),
          axiosInstance.get("/PFSettings"),
          //   axiosInstance.get("/Components"), // Assuming API for components
        ]);
        setEmployees(empRes.data || []);
        // console.log("Employee Data:" ,empRes.data)
        setPfSettings(pfRes.data.data || []);
        // setComponents(compRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Error loading form data");
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initialData) {
        await axiosInstance.put(
          `/PFEmployeeMapping/${initialData.pfEmployeeMappingId}`,
          formData
        );
        toast.success("Mapping updated!");
      } else {
        await axiosInstance.post("/PFEmployeeMapping", formData);
        toast.success("Mapping created!");
      }
      refreshList();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error saving mapping");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 space-y-6 h-[75vh] overflow-y-auto bg-gray-50 rounded-b-lg"
    >
      {/* Employee & PF Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Employee
          </label>
          <Select
            value={
              employees.find((emp) => emp.id === formData.employeeId) || null
            }
            onChange={(selected) =>
              setFormData({
                ...formData,
                employeeId: selected?.id || "",
              })
            }
            getOptionLabel={(emp) => `${emp.fullName} (${emp.employeeCode})`} // nice readable label
            getOptionValue={(emp) => emp.id} // must match `id` from API
            options={employees}
            styles={customSelectStyles}
            placeholder="Select Employee"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            PF Number
          </label>
          <input
            type="text"
            value={formData.pfNumber}
            onChange={(e) =>
              setFormData({ ...formData, pfNumber: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter PF Number"
          />
        </div>
      </div>

      {/* PF Setting & Opt-Out */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            PF Setting
          </label>
          <Select
            value={pfSettings.find(
              (pf) => pf.pfSettingsId === formData.pfSettingsId
            )}
            onChange={(selected) =>
              setFormData({
                ...formData,
                pfSettingsId: selected?.pfSettingsId || "",
              })
            }
            getOptionLabel={(pf) =>
              `${pf.calculationType} - ${pf.percentage || pf.fixedAmount}`
            }
            getOptionValue={(pf) => pf.pfSettingsId}
            options={pfSettings}
            styles={customSelectStyles}
            placeholder="Select PF Setting"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isOptedOut}
            onChange={(e) =>
              setFormData({ ...formData, isOptedOut: e.target.checked })
            }
            className="h-5 w-5"
          />
          <span className="text-gray-700 font-medium">Is Opted Out</span>
        </div>
      </div>

      {/* Override Section */}
      <div className="bg-white p-4 rounded-lg shadow-md border space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          Override Type
        </label>
        <Select
          value={
            formData.overrideCalculationType
              ? {
                  value: formData.overrideCalculationType,
                  label: formData.overrideCalculationType,
                }
              : null
          }
          onChange={(selected) =>
            setFormData({
              ...formData,
              overrideCalculationType: selected?.value || "",
            })
          }
          options={[
            { value: "Percentage", label: "Percentage" },
            { value: "Fixed", label: "Fixed" },
          ]}
          styles={customSelectStyles}
          placeholder="Select Override Type"
        />

        {formData.overrideCalculationType === "Percentage" && (
          <input
            type="number"
            value={formData.overridePercentage}
            onChange={(e) =>
              setFormData({ ...formData, overridePercentage: e.target.value })
            }
            placeholder="Enter override percentage..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}

        {formData.overrideCalculationType === "Fixed" && (
          <input
            type="number"
            value={formData.overrideFixedAmount}
            onChange={(e) =>
              setFormData({ ...formData, overrideFixedAmount: e.target.value })
            }
            placeholder="Enter override fixed amount..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}
      </div>

      {/* Effective Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Effective From
          </label>
          <input
            type="date"
            value={formData.effectiveFrom}
            onChange={(e) =>
              setFormData({ ...formData, effectiveFrom: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Effective To
          </label>
          <input
            type="date"
            value={formData.effectiveTo}
            onChange={(e) =>
              setFormData({ ...formData, effectiveTo: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Applies On Components */}
      <div className="bg-white p-4 rounded-lg shadow-md border">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Applies On Components
        </label>
        <Select
          value={components.filter((c) =>
            formData.appliesOnComponents.includes(c.value)
          )}
          onChange={(selected) =>
            setFormData({
              ...formData,
              appliesOnComponents: selected.map((s) => s.value),
            })
          }
          options={components}
          styles={customSelectStyles}
          isMulti
          placeholder="Select components..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded bg-primary hover:bg-secondary text-white font-semibold"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default EmployeePFMappingForm;
