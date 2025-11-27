import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import EmpWorkTypeForm from "./EmpWorkTypeForm";

const EmpWorkType = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workTypes, setWorkTypes] = useState([]);

  // Fetch Work Types list
  const fetchWorkTypes = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/WorkTypeMaster/all");
      setWorkTypes(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to fetch Work Types");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkTypes();
  }, []);

  return (
    <div>
      {/* Header */}{" "}
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        {" "}
        <h2 className="font-semibold text-xl">Work Types</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center text-sm cursor-pointer gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
        >
          {" "}
          <FiPlus /> Add New{" "}
        </button>{" "}
      </div>
      {/* Table Section */}
      <div className="overflow-x-auto p-4 shadow rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner />
          </div>
        ) : workTypes.length > 0 ? (
          <table className="w-full text-xs border-collapse text-center">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-2 py-2">S.No</th>
                <th className="px-2 py-2">Work Type Name</th>
                <th className="px-2 py-2">Description</th>
                <th className="px-2 py-2">Work Hours</th>
                <th className="px-2 py-2">Break Hours</th>
                <th className="px-2 py-2">Overtime</th>
                <th className="px-2 py-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {workTypes.map((item, index) => (
                <tr
                  key={item.workTypeId}
                  className={`hover:bg-gray-50 ${
                    !item.isActive ? "opacity-70" : ""
                  }`}
                >
                  <td className="px-2 py-2">{index + 1}</td>
                  <td className="px-2 py-2">{item.workTypeName}</td>
                  <td className="px-2 py-2">{item.description || "-"}</td>
                  <td className="px-2 py-2">{item.workHoursPerDay || "-"}</td>
                  <td className="px-2 py-2">{item.breakHours || "-"}</td>
                  <td className="px-2 py-2">
                    {item.overtimeApplicable ? "Yes" : "No"}
                  </td>
                  <td className="px-2 py-2">
                    {item.isActive ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-red-500 font-medium">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-8 text-sm">
            No Work Types found.
          </p>
        )}
      </div>
      {/* Add Modal */}
      {showModal && (
        <EmpWorkTypeForm
          onClose={() => setShowModal(false)}
          onSuccess={fetchWorkTypes}
        />
      )}
    </div>
  );
};

export default EmpWorkType;
