import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../../../axiosInstance/axiosInstance";

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? "#60A5FA" : "#CBD5E1",
    boxShadow: state.isFocused ? "0 0 0 1px rgba(96,165,250,0.5)" : "none",
    "&:hover": { borderColor: "#60A5FA" },
    borderRadius: "0.375rem",
    minHeight: "36px",
    fontSize: "0.875rem",
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999, fontSize: "0.875rem" }),
  multiValueLabel: (provided) => ({ ...provided, fontSize: "0.75rem" }),
  placeholder: (provided) => ({ ...provided, fontSize: "0.875rem" }),
};

const overrideOptions = [
  { value: "", label: "Select Override Type" },
  { value: "Percentage", label: "Percentage" },
  { value: "Fixed", label: "Fixed" },
];

const EmployeePFMappingForm = ({ initialData, onClose, refreshList }) => {
  const [employees, setEmployees] = useState([]);
  const [pfSettings, setPfSettings] = useState([]);
  const [existingPFMappings, setExistingPFMappings] = useState([]);

  const normalizeInitialData = (data) => {
    if (!data) return null;

    let overrideCalculationType = null;

    if (
      data.overridePercentage !== null &&
      data.overridePercentage !== undefined &&
      data.overridePercentage !== ""
    ) {
      overrideCalculationType = "Percentage";
    } else if (
      data.overrideFixedAmount !== null &&
      data.overrideFixedAmount !== undefined &&
      data.overrideFixedAmount !== ""
    ) {
      overrideCalculationType = "Fixed";
    }

    return {
      ...data,
      overrideCalculationType,
    };
  };

  const [formData, setFormData] = useState(
    normalizeInitialData(initialData) || {
      employeeId: "",
      pfNumber: "",
      isOptedOut: false,
      pfSettingsId: "",
      overrideCalculationType: null,
      overridePercentage: "",
      overrideFixedAmount: "",
      effectiveFrom: "",
      effectiveTo: "",
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(normalizeInitialData(initialData));
    } else {
      setFormData({
        employeeId: "",
        pfNumber: "",
        isOptedOut: false,
        pfSettingsId: "",
        overrideCalculationType: null,
        overridePercentage: "",
        overrideFixedAmount: "",
        effectiveFrom: "",
        effectiveTo: "",
      });
    }
  }, [initialData]);

  console.log("Initial Data:", initialData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, pfRes, mappingRes] = await Promise.all([
          axiosInstance.get("/Employee"),
          axiosInstance.get("/PFSettings"),
          axiosInstance.get("/PFEmployeeMapping"),
        ]);

        setEmployees(empRes.data || []);
        setPfSettings(pfRes.data.data || []);
        setExistingPFMappings(mappingRes.data?.response || []);
      } catch (err) {
        console.error(err);
        toast.error("Error loading form data");
      }
    };
    fetchData();
  }, []);

  const isEmployeeMapped = (employeeId) =>
    existingPFMappings.some(
      (m) =>
        m.employeeId === employeeId &&
        (!initialData || m.employeeId !== initialData.employeeId)
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEmployeeMapped(Number(formData.employeeId))) {
      toast.warning("PF mapping already exists for this employee");
      return;
    }

    try {
      // Prepare payload according to API
      const payload = {
        employeeId: Number(formData.employeeId),
        pfNumber: formData.pfNumber || null,
        isOptedOut: formData.isOptedOut,
        pfSettingsId: formData.pfSettingsId
          ? Number(formData.pfSettingsId)
          : null,
        overrideCalculationType: formData.overrideCalculationType || null,
        overridePercentage:
          formData.overridePercentage !== "" &&
          formData.overridePercentage != null
            ? Number(formData.overridePercentage)
            : null,
        overrideFixedAmount:
          formData.overrideFixedAmount !== "" &&
          formData.overrideFixedAmount != null
            ? Number(formData.overrideFixedAmount)
            : null,
        effectiveFrom: formData.effectiveFrom
          ? new Date(formData.effectiveFrom).toISOString()
          : null,
        effectiveTo: formData.effectiveTo
          ? new Date(formData.effectiveTo).toISOString()
          : null,
      };

      if (initialData) {
        await axiosInstance.put(
          `/PFEmployeeMapping/${initialData.pfEmployeeMappingId}`,
          payload
        );
        toast.success("Mapping updated!");
      } else {
        await axiosInstance.post("/PFEmployeeMapping", payload);
        toast.success("Mapping created!");
      }
      refreshList();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error saving mapping");
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";
  const cardClass =
    "bg-white p-3 rounded-md shadow-sm border space-y-2 text-sm";

  const employeeOptions = employees.map((emp) => {
    const mapped = isEmployeeMapped(emp.id);
    return {
      value: emp.id,
      label: `${emp.fullName} (${emp.employeeCode})${
        mapped ? " • Already mapped" : ""
      }`,
      isDisabled: mapped,
    };
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 space-y-2 max-h-[75vh] overflow-y-auto bg-gray-50 rounded-lg"
    >
      {/* Opt-Out Toggle */}
      <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
        <span className="font-medium text-gray-700">Opt Out of PF</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isOptedOut}
            className="sr-only peer"
            onChange={(e) =>
              setFormData({ ...formData, isOptedOut: e.target.checked })
            }
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 transition-all duration-200">
            <div className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-full"></div>
          </div>
        </label>
      </div>

      {/* Employee */}
      <div className={cardClass}>
        <label className="font-medium mb-1 block">Employee</label>
        <Select
          value={employeeOptions.find(
            (o) => o.value === Number(formData.employeeId)
          )}
          onChange={(selected) =>
            setFormData({ ...formData, employeeId: selected?.value || "" })
          }
          options={employeeOptions}
          styles={customSelectStyles}
          placeholder="Select Employee"
          isDisabled={!!initialData}
        />
      </div>

      {!formData.isOptedOut && (
        <>
          {/* PF Number & Setting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={cardClass}>
              <label className="font-medium mb-1 block">PF Number</label>
              <input
                type="text"
                value={formData.pfNumber}
                onChange={(e) =>
                  setFormData({ ...formData, pfNumber: e.target.value })
                }
                placeholder="PF Number"
                className={inputClass}
              />
            </div>

            <div className={cardClass}>
              <label className="font-medium mb-1 block">PF Setting</label>
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
                  `PF #${pf.pfSettingsId} || ${pf.calculationType} - ${
                    pf.percentage || pf.fixedAmount
                  }`
                }
                getOptionValue={(pf) => pf.pfSettingsId}
                options={pfSettings}
                styles={customSelectStyles}
                placeholder="Select PF Setting"
              />
            </div>
          </div>

          {/* Override & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={cardClass}>
              <label className="font-medium mb-1 block">Override Type</label>
              <Select
                value={overrideOptions.find(
                  (o) => o.value === formData.overrideCalculationType
                )}
                onChange={(selected) =>
                  setFormData({
                    ...formData,
                    overrideCalculationType: selected?.value || null,
                    overridePercentage: "",
                    overrideFixedAmount: "",
                  })
                }
                options={overrideOptions}
                styles={customSelectStyles}
                placeholder="Select Override Type"
              />
              {formData.overrideCalculationType === "Percentage" && (
                <input
                  type="number"
                  placeholder="Override %"
                  className={inputClass}
                  value={formData.overridePercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      overridePercentage: e.target.value,
                    })
                  }
                />
              )}

              {formData.overrideCalculationType === "Fixed" && (
                <input
                  type="number"
                  placeholder="Override Amount"
                  className={inputClass}
                  value={formData.overrideFixedAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      overrideFixedAmount: e.target.value,
                    })
                  }
                />
              )}
            </div>

            <div className={cardClass}>
              <label className="font-medium mb-1 block">Effective Dates</label>
              <input
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) =>
                  setFormData({ ...formData, effectiveFrom: e.target.value })
                }
                className={`${inputClass} mt-1`}
              />
              <input
                type="date"
                value={formData.effectiveTo}
                onChange={(e) =>
                  setFormData({ ...formData, effectiveTo: e.target.value })
                }
                className={`${inputClass} mt-2`}
              />
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 cursor-pointer rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 cursor-pointer rounded bg-primary hover:bg-secondary text-white font-medium"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default EmployeePFMappingForm;
