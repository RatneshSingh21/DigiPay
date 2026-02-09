import React, { useState, useEffect } from "react";
import Select from "react-select";
import { X } from "lucide-react";

const options = [
  { value: "AttendanceBased", label: "Attendance Based" },
  { value: "DynamicComponentBased", label: "Dynamic Component Based" },
];

const SalaryCalculationTypeModal = ({
  open,
  onClose,
  defaultType,
  onSubmit,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (defaultType) {
      setSelectedOption(options.find((o) => o.value === defaultType));
    }
  }, [defaultType]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white w-[420px] rounded-xl shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer text-gray-500"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Salary Calculation Type</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Calculation Type
          </label>
          <Select
            options={options}
            value={selectedOption}
            onChange={setSelectedOption}
            placeholder="Select calculation type"
          />
        </div>

        <div className="flex justify-end text-sm gap-3">
          <button onClick={onClose} className="px-4 py-2 cursor-pointer rounded-md border border-gray-300">
            Cancel
          </button>

          <button
            disabled={!selectedOption}
            onClick={() => onSubmit(selectedOption.value)}
            className="px-4 py-2 rounded-md bg-primary hover:bg-secondary cursor-pointer text-white disabled:opacity-50"
          >
            {defaultType ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculationTypeModal;
