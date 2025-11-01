import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Pencil } from "lucide-react";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../../components/Spinner";
import AddHeaderForm from "./AddHeaderForm";

const ExpenseHeader = () => {
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editHeaderId, setEditHeaderId] = useState(null);

  const fetchHeaders = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/Header");
      if (res.data.statusCode === 200) {
        setHeaders(res.data.response || []);
      } else {
        toast.error(res.data.message || "Failed to fetch headers");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching headers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeaders();
  }, []);

  const handleEdit = (header) => {
    setEditData(header);
    setShowModal(true);
  };

  return (
    <div className="bg-white">
      <div className="px-4 py-2 shadow mb-4 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold">Expense Headers</h2>
        <button
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
          className="bg-primary text-sm cursor-pointer hover:bg-secondary text-white px-4 py-2 rounded flex items-center"
        >
          <Plus className="mr-2" size={16} /> Add Header
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : headers.length > 0 ? (
        <div className="overflow-x-auto shadow rounded-lg p-4 mx-2">
          <table className="min-w-full divide-y divide-gray-200 text-xs text-center">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Header Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Max Allowed Amount</th>
                <th className="px-4 py-2">Allowed Users</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {headers.map((header, index) => (
                <tr
                  key={header.headerId}
                  className="hover:bg-gray-50 transition-all"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {header.headerName}
                  </td>
                  <td className="px-4 py-2">{header.description || "-"}</td>
                  <td className="px-4 py-2">
                    {header.maxAllowedAmount !== null
                      ? header.maxAllowedAmount
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {header.allowedToUserIds?.length > 0
                      ? `${header.allowedToUserIds.length} Employee${
                          header.allowedToUserIds.length > 1 ? "s" : ""
                        }`
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => {
                        setEditHeaderId(header.headerId);
                        setShowModal(true);
                      }}
                      className="text-blue-600 underline cursor-pointer text-xs"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center py-6">
          No headers found. Click “Add Header” to create one.
        </p>
      )}

      {showModal && (
        <AddHeaderForm
          onClose={() => {
            setShowModal(false);
            setEditHeaderId(null);
          }}
          onSuccess={fetchHeaders}
          headerId={editHeaderId} // pass here
        />
      )}
    </div>
  );
};

export default ExpenseHeader;
