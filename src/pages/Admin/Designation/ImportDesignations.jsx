import React, { useState, useRef, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import Papa from "papaparse";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import Spinner from "../../../components/Spinner";

const ImportDesignations = ({ onClose }) => {
  const [encoding, setEncoding] = useState("UTF-8 (Unicode)");
  const [fileName, setFileName] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  // Close on outside click
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
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file first!");
      return;
    }

    setLoading(true);
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      encoding: encoding,
      complete: async (result) => {
        const jsonData = result.data.map((row) => ({
          title: row.title || row.Title || row.designation || "",
          level: row.level || row.Level || "",
        }));

        try {
          const response = await axiosInstance.post("/Designation/import", jsonData);

          if (response.status === 200 || response.status === 201) {
            toast.success("Designations imported successfully!");
            setFileName(null);
            setSelectedFile(null);
            onClose(); // Close modal on success
          } else {
            toast.error("Import failed!");
          }
        } catch (error) {
          console.error(error);
          toast.error(error?.response?.data?.message || "Something went wrong!");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div
        ref={modalRef}
        className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-xl relative"
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Designations - Select File
        </h2>

        <p className="text-gray-700 mb-6">
          Download a{" "}
          <a href="#" className="text-blue-600 underline font-medium">
            sample file
          </a>{" "}
          and compare it with your import file to ensure that the file is ready to import.
        </p>

        {/* Upload Box */}
        <div
          className="border border-dashed border-gray-300 p-10 rounded-md flex flex-col items-center text-center mb-8 relative cursor-pointer"
          onDrop={handleDrop}
          onDragOver={preventDefaults}
          onDragEnter={preventDefaults}
        >
          <input
            type="file"
            accept=".csv"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <FaCloudUploadAlt className="text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">
            {fileName ? (
              <span className="text-green-600">{fileName}</span>
            ) : (
              "Drop CSV file here or click to upload"
            )}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            File Format: CSV | Fields: title, level
          </p>
        </div>

        {/* Dropdown */}
        <div className="mb-6">
          <label className="block text-gray-800 font-medium mb-2">
            Character Encoding <span className="text-red-600 font-semibold">*</span>
          </label>
          <select
            value={encoding}
            onChange={(e) => setEncoding(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>UTF-8 (Unicode)</option>
            <option>UTF-16 (Unicode)</option>
            <option>ISO-8859-1</option>
            <option>ISO-8859-2</option>
            <option>ISO-8859-9 (Turkish)</option>
            <option>GB2312 (Simplified Chinese)</option>
            <option>Big5 (Traditional Chinese)</option>
            <option>Shift_JIS (Japanese)</option>
            <option>KOI8-R (Russian)</option>
            <option>Windows-1252 (Western Europe)</option>
            <option>MacRoman (Apple Roman)</option>
            <option>EUC-KR (Korean)</option>
          </select>
        </div>

        {/* Buttons */}
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

        {/* Mandatory Note */}
        <p className="text-sm text-red-500 mt-4">
          * Indicates mandatory fields
        </p>
      </div>
    </div>
  );
};

export default ImportDesignations;
