import React, { useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Select from "react-select";
import { toast } from "react-toastify";

const AddModule = ({ isOpen, onClose, onSuccess }) => {
  const [formdata, setformdata] = useState({
    moduleName: "",
    description: "",
    isActive: true,
  });

  const moduleOptions = [
    { label: "Employee", value: "Employee" },
    { label: "Salary", value: "Salary" },
    { label: "Attendance", value: "Attendance" },
    { label: "Pay Schedule", value: "Pay Schedule" },
    { label: "Work Location", value: "Work Location" },
    { label: "Leave", value: "Leave" },
  ];

  const addModule = async () => {
    try {
      const payload = {
        moduleName: formdata.moduleName?.value || "",
        description: formdata.description,
        isActive: formdata.isActive,
      };
      await axiosInstance.post("/ModuleMaster", payload);
      toast.success("Module added successfully!");
      onSuccess?.(); // refresh list if needed
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add module");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* Module Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Module Name</label>
          <Select
            options={moduleOptions}
            value={formdata.moduleName}
            onChange={(option) =>
              setformdata({ ...formdata, moduleName: option })
            }
            placeholder="Select Module"
            isSearchable
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formdata.description}
            onChange={(e) =>
              setformdata({ ...formdata, description: e.target.value })
            }
            className="border border-gray-300 p-2 w-full rounded-md"
          />
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-3 mb-5">
          <label className="text-sm font-medium">Status</label>
          <button
            type="button"
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${
              formdata.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
            onClick={() =>
              setformdata({ ...formdata, isActive: !formdata.isActive })
            }
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                formdata.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm">
            {formdata.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={addModule}
            className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModule;
