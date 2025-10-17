import React, { useState, useRef, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";


const ImportExportAttendance = ({ onClose, fetchAttendance = () => {} }) => {
  const [fileName, setFileName] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".xlsx")) {
      setFileName(file.name);
      setSelectedFile(file);
    } else {
      toast.error("Only .xlsx files are supported");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".xlsx")) {
      setFileName(file.name);
      setSelectedFile(file);
    } else {
      toast.error("Only .xlsx files are supported");
    }
  };

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Upload attendance file
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an .xlsx file first!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axiosInstance.post("/Attendance/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Attendance data imported successfully!");
        setFileName(null);
        setSelectedFile(null);
        fetchAttendance();
        onClose();
      } else {
        toast.error("Import failed!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong during import.");
    } finally {
      setLoading(false);
    }
  };

  // Download attendance export file
  const handleExportAttendance = async () => {
    try {
      const response = await axiosInstance.get("/Attendance/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from headers or fallback
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "Attendance.xlsx";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) fileName = match[1];
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Attendance file downloaded successfully!");
    } catch (error) {
      toast.error("Failed to export attendance file!");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div
        ref={modalRef}
        className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-xl relative"
      >
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Attendance - Import / Export
        </h2>

        <p className="text-gray-700 mb-6">
          You can{" "}
          <button
            onClick={handleExportAttendance}
            className="text-blue-600 cursor-pointer underline font-medium hover:text-blue-800"
          >
            download the current Attendance Excel file
          </button>{" "}
          or upload a new one to update records. Only{" "}
          <strong>.xlsx</strong> format is supported.
        </p>

        {/* Upload Area */}
        <div
          className="border border-dashed border-gray-300 p-10 rounded-md flex flex-col items-center text-center mb-8 relative cursor-pointer"
          onDrop={handleDrop}
          onDragOver={preventDefaults}
          onDragEnter={preventDefaults}
        >
          <input
            type="file"
            accept=".xlsx"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <FaCloudUploadAlt className="text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">
            {fileName ? (
              <span className="text-green-600">{fileName}</span>
            ) : (
              "Drop .xlsx file here or click to upload"
            )}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            File Format: XLSX | Required Columns: Employee ID, Date, Status, In-Time, Out-Time
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-secondary transition duration-200 flex items-center gap-2 cursor-pointer"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? <Spinner /> : "Import"}
          </button>

          <button
            className="border px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setFileName(null);
              setSelectedFile(null);
              onClose();
            }}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        <p className="text-sm text-red-500 mt-4">
          * Ensure your Excel columns match the required structure before uploading.
        </p>
      </div>
    </div>
  );
};

export default ImportExportAttendance;
