import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import AddPunchTypeModal from "./AddPunchTypeModal";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import assets from "../../../assets/assets";

const AttendancePunch = () => {
  const [showModal, setShowModal] = useState(false);
  const [punchTypes, setPunchTypes] = useState([]);

  const fetchPunchTypes = async () => {
    try {
      const res = await axiosInstance.get("/PunchType");
      if (res.data.success) {
        setPunchTypes(res.data.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch Punch Types");
    }
  };

  useEffect(() => {
    fetchPunchTypes();
  }, []);

  return (
    <>
      {/* Header */}
      <div className="px-4 py-2 shadow-md sticky top-14 bg-white z-10 flex justify-between items-center rounded-b-lg border-b border-gray-100">
        <h2 className="font-semibold text-xl text-gray-800 tracking-wide">
          Punch Types
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex cursor-pointer items-center text-sm gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
        >
          <FiPlus className="text-lg" /> Add Punch Type
        </button>
      </div>

      {/* Punch Type Cards */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {punchTypes.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-5">
            <div className="flex flex-col items-center text-center bg-white border border-dashed border-gray-300 rounded-2xl p-5 max-w-[90vh] shadow-sm">
              <img
                src={assets.NoData}
                alt="No Punch Found"
                className="w-64 mb-2 opacity-90"
              />

              <h3 className="text-xl font-semibold text-gray-800">
                No Punch Types Found
              </h3>

              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Punch types define how employee attendance is recorded
                (Check-In, Check-Out, Break, etc.). Add one to start configuring
                attendance rules.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="mt-6 inline-flex items-center cursor-pointer gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-secondary transition"
              >
                <FiPlus className="text-base" />
                Add Punch Type
              </button>
            </div>
          </div>
        ) : (
          punchTypes.map((punch, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
            >
              {/* Accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>

              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-lg text-gray-800 group-hover:text-primary transition">
                  {punch.name}
                </h3>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium text-gray-700">Code:</span>{" "}
                    {punch.code}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Category:</span>{" "}
                    {punch.category}
                  </p>
                </div>

                <span
                  className={`inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full ${
                    punch.isActive
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  {punch.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddPunchTypeModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchPunchTypes();
            setShowModal(false);
          }}
        />
      )}
    </>
  );
};

export default AttendancePunch;
