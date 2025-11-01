import React, { useState } from "react";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import Spinner from "../../../components/Spinner";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Select from "react-select";

const EmpDocumentsForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    documnetModelName: "",
    remark: "",
    file: null,
  });

  const documentOptions = [
    { value: "10th Marksheet", label: "10th Marksheet" },
    { value: "12th Marksheet", label: "12th Marksheet" },
    { value: "Graduation", label: "Graduation" },
    { value: "Post Graduation", label: "Post Graduation" },
    { value: "Aadhar card", label: "Aadhar card" },
    { value: "Pan card", label: "Pan card" },
    { value: "Salary slip previous", label: "Salary slip previous" },
  ];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- Handle Input ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  // ---------------- Handle Submit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.documnetModelName || !formData.file) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const uploadData = new FormData();
      uploadData.append("DocumnetModelName", formData.documnetModelName);
      uploadData.append("Remark", formData.remark);
      uploadData.append("File", formData.file);

      const res = await axiosInstance.post("/Document/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.statusCode === 200) {
        toast.success("Document uploaded successfully!");
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to upload document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-2xl cursor-pointer"
        >
          <FiX />
        </button>

        <h2 className="text-lg font-semibold mb-5 text-gray-800">
          Upload New Document
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Model Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Document Name <span className="text-red-500">*</span>
            </label>
            <Select
              options={documentOptions}
              value={documentOptions.find(
                (opt) => opt.value === formData.documnetModelName
              )}
              onChange={(selectedOption) =>
                setFormData((prev) => ({
                  ...prev,
                  documnetModelName: selectedOption ? selectedOption.value : "",
                }))
              }
              placeholder="Select document type"
              className="text-sm "
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#60a5fa" },
                }),
              }}
            />
          </div>

          {/* Remark */}
          <div>
            <label className="block text-sm font-medium mb-1">Remark</label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              className="w-full border px-3 py-2  border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
              placeholder="Enter remarks (optional)"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Choose File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="file"
              accept="*/*"
              onChange={handleFileChange}
              className="w-full border  px-3 py-2 cursor-pointer  border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`bg-primary text-white flex items-center justify-center px-5 py-2  rounded w-full transition ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-secondary cursor-pointer"
            }`}
          >
            {loading ? <Spinner /> : "Upload Document"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmpDocumentsForm;
