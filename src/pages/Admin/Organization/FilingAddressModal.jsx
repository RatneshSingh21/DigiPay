import React, { useState, useEffect } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";

const FilingAddressModal = ({
  isOpen,
  onClose,
  filingOptions,
  selected,
  onSave,
}) => {
  const [workLocations, setWorkLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      axiosInstance
        .get("/WorkLocation")
        .then((res) => {
          setWorkLocations(res.data || []);
          if (selected) {
            setSelectedLocation(selected);
          } else if (res.data.length > 0) {
            setSelectedLocation(res.data[0]);
          }
        })
        .catch((err) => console.error("Failed to load locations:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, selected]);

  const locationOptions = workLocations.map((loc) => ({
    label: loc.name,
    value: loc,
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg relative shadow-xl">
        {/* Close (X) Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-xl font-semibold mb-4">Update Filing Address</h2>

        <label className="block text-sm font-medium mb-1 text-gray-700">
          Select Filing Address <span className="text-red-500">*</span>
        </label>
        <Select
          options={locationOptions}
          isLoading={loading}
          value={
            selectedLocation
              ? { label: selectedLocation.name, value: selectedLocation }
              : null
          }
          onChange={(selected) => setSelectedLocation(selected?.value || null)}
        />

        {selectedLocation && (
          <div className="mt-4 border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-1">{selectedLocation.name}</h3>
            <p>{selectedLocation.addressLine1}</p>
            <p>
              {selectedLocation.city}, {selectedLocation.state}{" "}
              {selectedLocation.pinCode}
            </p>
          </div>
        )}

        <p className="text-xs text-gray-600 mt-4">
          <strong>Note:</strong> Your filing address can only be one of your
          work locations. To set a new address as your filing address, add that
          address as a work location in{" "}
          <a href="#" className="text-blue-600 underline">
            Settings &gt; Work Locations
          </a>
          .
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-black cursor-pointer text-white rounded hover:bg-gray-800"
            onClick={() => {
              if (selectedLocation) {
                onSave(selectedLocation);
              }
              onClose();
            }}
          >
            Save
          </button>

          <button
            className="px-4 py-2 border rounded cursor-pointer hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilingAddressModal;
