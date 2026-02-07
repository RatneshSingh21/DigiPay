import { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import { FiUpload, FiFileText } from "react-icons/fi";

const BulkUpdateAttendance = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileSelect = (f) => {
    if (!f) return;

    if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      toast.error("Only Excel files (.xlsx, .xls) are allowed.");
      return;
    }

    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select an Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setResult(null);

      const res = await axiosInstance.post(
        "/Attendance/bulk-update",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setResult(res.data);
      toast.success("Bulk attendance update completed.");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Bulk attendance update failed.";

      toast.error(msg);
      setResult(err?.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Bulk Attendance Update</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-700 cursor-pointer text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* EXCEL SELECTOR */}
        <label
          className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition
          ${
            file
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-blue-400"
          }`}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />

          {!file ? (
            <>
              <FiUpload className="text-3xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click or drag Excel file here
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: .xlsx, .xls
              </p>
            </>
          ) : (
            <>
              <FiFileText className="text-3xl text-green-600 mb-2" />
              <p className="text-sm font-medium text-gray-700">{file.name}</p>
              <p className="text-xs text-gray-500 mt-1">Ready to upload</p>
            </>
          )}
        </label>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="bg-orange-600 text-white px-4 py-2 text-sm cursor-pointer rounded-md hover:bg-orange-700 disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? <Spinner /> : "Upload & Update"}
          </button>
        </div>

        {/* RESULT */}
        {result && (
          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold mb-2">Result Summary</h4>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Total Rows</p>
                <p className="font-semibold">
                  {result?.Summary?.TotalRows ?? result?.TotalRows}
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded">
                <p className="text-gray-500">Updated</p>
                <p className="font-semibold text-green-600">
                  {result?.Summary?.UpdatedCount ?? result?.UpdatedCount}
                </p>
              </div>

              <div className="bg-red-50 p-3 rounded">
                <p className="text-gray-500">Skipped</p>
                <p className="font-semibold text-red-600">
                  {result?.Summary?.SkippedCount ?? result?.SkippedCount}
                </p>
              </div>
            </div>

            {/* ERRORS */}
            {result?.Errors?.length > 0 && (
              <div className="mt-4 max-h-56 overflow-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Employee</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.Errors.map((e, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{e.employeeCode}</td>
                        <td className="p-2">
                          {new Date(e.attendanceDate).toLocaleDateString(
                            "en-Gb",
                          )}
                        </td>
                        <td className="p-2 text-red-600">{e.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpdateAttendance;
