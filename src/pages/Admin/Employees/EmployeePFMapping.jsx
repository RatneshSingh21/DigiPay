import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? "#60A5FA" : "#93C5FD", // focus:ring-blue-400 / border-blue-300
    boxShadow: state.isFocused ? "0 0 0 2px rgba(96,165,250,0.5)" : "none",
    "&:hover": {
      borderColor: "#60A5FA",
    },
    borderRadius: "0.375rem", // rounded-md
    padding: "2px",
    minHeight: "42px",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
};

const EmployeePFMapping = () => {
  const [mappings, setMappings] = useState([]);
  const [pfSettings, setPfSettings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    pfNumber: "",
    pfSettingsId: "",
    isOptedOut: false,
    overrideCalculationType: "",
    overridePercentage: 0,
    overrideFixedAmount: 0,
    effectiveFrom: "",
    effectiveTo: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Employee Mapping
  const fetchMappings = async () => {
    try {
      const res = await axiosInstance.get("/PFEmployeeMapping");
      setMappings(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPfSettings = async () => {
    try {
      const res = await axiosInstance.get("/PFSettings");
      setPfSettings(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMappings();
    fetchPfSettings();
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/PFEmployeeMapping", formData);
      toast.success("PF Employee Mapping created!");
      setIsModalOpen(false);
      fetchMappings();
    } catch (err) {
      toast.error("Error saving mapping");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 mb-4 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold">PF Employee Mapping</h2>
        <button
          onClick={() => {
            setFormData({
              employeeId: "",
              pfNumber: "",
              pfSettingsId: "",
              isOptedOut: false,
              overrideCalculationType: "",
              overridePercentage: 0,
              overrideFixedAmount: 0,
              effectiveFrom: "",
              effectiveTo: "",
            });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-secondary transition"
        >
          <Plus size={16} /> Add Mapping
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">Employee</th>
              <th className="p-2 border">PF Number</th>
              <th className="p-2 border">PF Setting</th>
              <th className="p-2 border">Override %</th>
              <th className="p-2 border">Override Fixed</th>
            </tr>
          </thead>
          <tbody>
            {mappings.length > 0 ? (
              mappings.map((m) => (
                <tr key={m.pfEmployeeMappingId} className="hover:bg-gray-50">
                  <td className="p-2 border">{m.employeeId}</td>
                  <td className="p-2 border">{m.pfNumber}</td>
                  <td className="p-2 border">{m.pfSettingsId}</td>
                  <td className="p-2 border">{m.overridePercentage}</td>
                  <td className="p-2 border">{m.overrideFixedAmount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No mappings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b px-4 py-3">
              <h3 className="text-lg font-semibold">Add Employee Mapping</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-4 space-y-2 h-[70vh] overflow-y-auto"
            >
              {/* Employee */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employee
                </label>
                <Select
                  value={employees.find(
                    (emp) => emp.employeeId === formData.employeeId
                  )}
                  onChange={(selected) =>
                    setFormData({
                      ...formData,
                      employeeId: selected ? selected.employeeId : "",
                    })
                  }
                  getOptionLabel={(emp) => emp.fullName}
                  getOptionValue={(emp) => emp.employeeId}
                  options={employees}
                  styles={customSelectStyles}
                  placeholder="Select Employee"
                />
              </div>

              {/* PF Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  PF Number
                </label>
                <input
                  type="text"
                  value={formData.pfNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, pfNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* PF Setting */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  PF Setting
                </label>
                <Select
                  value={pfSettings.find(
                    (pf) => pf.pfSettingsId === formData.pfSettingsId
                  )}
                  onChange={(selected) =>
                    setFormData({
                      ...formData,
                      pfSettingsId: selected ? selected.pfSettingsId : "",
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

              {/* Opt Out */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isOptedOut}
                  onChange={(e) =>
                    setFormData({ ...formData, isOptedOut: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">Is Opted Out</span>
              </div>

              {/* Override Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                      overrideCalculationType: selected
                        ? selected.value
                        : "",
                    })
                  }
                  options={[
                    { value: "Percentage", label: "Percentage" },
                    { value: "Fixed", label: "Fixed" },
                  ]}
                  styles={customSelectStyles}
                  placeholder="--Select--"
                />
              </div>

              {/* Override % */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Override %
                </label>
                <input
                  type="number"
                  value={formData.overridePercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      overridePercentage: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Override Fixed */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Override Fixed Amount
                </label>
                <input
                  type="number"
                  value={formData.overrideFixedAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      overrideFixedAmount: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-primary hover:bg-secondary text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeePFMapping;
