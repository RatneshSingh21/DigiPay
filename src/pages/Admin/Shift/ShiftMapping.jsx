import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { FiPlus, FiRefreshCw, FiX } from "react-icons/fi";

const ShiftMapping = () => {
  const [shiftMappings, setShiftMappings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    shiftId: "",
    effectiveFrom: "",
    effectiveTo: "",
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchShiftMappings(), fetchEmployees(), fetchShifts()]);
    setLoading(false);
  };

  const fetchShiftMappings = async () => {
    try {
      const res = await axiosInstance.get("/ShiftMapping/all");
      if (res.data?.data) setShiftMappings(res.data.data);
    } catch {
      toast.error("Failed to fetch shift mappings");
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch {
      toast.error("Failed to fetch employees");
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await axiosInstance.get("/shift");
      setShifts(res.data || []);
    } catch {
      toast.error("Failed to fetch shifts");
    }
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    const { employeeId, shiftId, effectiveFrom, effectiveTo } = form;

    if (!employeeId || !shiftId || !effectiveFrom || !effectiveTo) {
      toast.warn("Please fill all fields");
      return;
    }

    try {
      await axiosInstance.post("/ShiftMapping/assign", {
        employeeId: parseInt(employeeId),
        shiftId: parseInt(shiftId),
        effectiveFrom,
        effectiveTo,
      });
      toast.success("Shift assigned successfully!");
      setForm({
        employeeId: "",
        shiftId: "",
        effectiveFrom: "",
        effectiveTo: "",
      });
      setShowModal(false);
      fetchShiftMappings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to assign shift");
    }
  };

  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.fullName} (${emp.employeeCode})` : `Emp#${id}`;
  };

  const getShiftName = (id) => {
    const s = shifts.find((x) => x.id === id);
    return s ? s.shiftName : `Shift#${id}`;
  };

  // React-select options
  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const shiftOptions = shifts.map((s) => ({
    value: s.id,
    label: s.shiftName,
  }));

  return (
    <div className="space-y-2">
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Shift Mapping</h2>
        <div className="flex items-center text-sm gap-3">
          <button
            onClick={fetchAllData}
            className="flex items-center cursor-pointer gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center cursor-pointer gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
          >
            <FiPlus /> Assign Shift
          </button>
        </div>
      </div>

      {/* Shift Mapping List */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold text-gray-700 mb-3">
          Existing Shift Mappings
        </h3>

        {loading ? (
          <p>Loading...</p>
        ) : shiftMappings.length === 0 ? (
          <p className="text-gray-500 text-sm">No shift mappings found.</p>
        ) : (
          <div className="overflow-x-auto shadow">
            <table className="min-w-full divide-y text-xs text-center divide-gray-200">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Shift</th>
                  <th className="px-3 py-2">Effective From</th>
                  <th className="px-3 py-2">Effective To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shiftMappings.map((m, i) => (
                  <tr
                    key={m.employeeShiftMappingId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">
                      {getEmployeeName(m.employeeId)}
                    </td>
                    <td className="px-3 py-2">{getShiftName(m.shiftId)}</td>
                    <td className="px-3 py-2">
                      {new Date(m.effectiveFrom).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(m.effectiveTo).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-lg font-semibold mb-4">Assign New Shift</h3>

            <form onSubmit={handleAssignShift} className="flex flex-col gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Employee
                </label>
                <Select
                  options={employeeOptions}
                  value={
                    employeeOptions.find(
                      (opt) => opt.value === form.employeeId
                    ) || null
                  }
                  onChange={(selected) =>
                    setForm((prev) => ({
                      ...prev,
                      employeeId: selected?.value || "",
                    }))
                  }
                  placeholder="Select Employee..."
                  className="text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Shift
                </label>
                <Select
                  options={shiftOptions}
                  value={
                    shiftOptions.find((opt) => opt.value === form.shiftId) ||
                    null
                  }
                  onChange={(selected) =>
                    setForm((prev) => ({
                      ...prev,
                      shiftId: selected?.value || "",
                    }))
                  }
                  placeholder="Select Shift..."
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Effective From
                </label>
                <input
                  type="date"
                  name="effectiveFrom"
                  value={form.effectiveFrom}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      effectiveFrom: e.target.value,
                    }))
                  }
                  className="border p-2 rounded-lg w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Effective To
                </label>
                <input
                  type="date"
                  name="effectiveTo"
                  value={form.effectiveTo}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      effectiveTo: e.target.value,
                    }))
                  }
                  className="border p-2 rounded-lg w-full"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 cursor-pointer rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg cursor-pointer bg-primary text-white hover:bg-secondary"
                >
                  Assign Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftMapping;
