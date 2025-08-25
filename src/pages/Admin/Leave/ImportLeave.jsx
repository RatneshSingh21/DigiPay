import React, { useState, useRef, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import * as XLSX from "xlsx";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Spinner from "../../../components/Spinner";

const ImportLeave = ({ onClose , fetchDesignations }) => {
  const [fileName, setFileName] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

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

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an .xlsx file first!");
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsedData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const jsonData = parsedData.map((row) => ({
          title: row.title || row.Title || row.designation || "",
          level: row.level || row.Level || "",
        }));

        const response = await axiosInstance.post("/Designation/import", jsonData);
        if (response.status === 200 || response.status === 201) {
          toast.success("Leave imported successfully!");
          setFileName(null);
          setSelectedFile(null);
          fetchDesignations();
          onClose();
        } else {
          toast.error("Import failed!");
        }
      };

      reader.onerror = () => {
        toast.error("Error reading the file");
        setLoading(false);
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await axiosInstance.get("/Designation/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Leave.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download sample file!");
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
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Leave - Upload Excel File
        </h2>

        <p className="text-gray-700 mb-6">
          Download a{" "}
          <button
            onClick={handleDownloadSample}
            className="text-blue-600 underline font-medium hover:text-blue-800"
          >
            sample Excel file
          </button>{" "}
          and prepare your own <strong>.xlsx</strong> file with{" "}
          <code>title</code> and <code>level</code> columns.
        </p>

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
            File Format: XLSX | Required Fields: title, level
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-secondary transition duration-200 flex items-center gap-2"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? <Spinner /> : "Save"}
          </button>
          <button
            className="border px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100"
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
          * Ensure your file has the correct columns
        </p>
      </div>
    </div>
  );
};

export default ImportLeave;
