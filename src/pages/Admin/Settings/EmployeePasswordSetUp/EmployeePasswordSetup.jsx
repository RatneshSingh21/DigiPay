import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import EmployeePasswordModal from "./EmployeePasswordModal";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const EmployeePasswordSetup = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* Fetch Employee Logins */
  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/user-auth/Employee-logins");

      if (res.data.success) {
        const normalized = res.data.data.map((x) => ({
          ...x,
          email: x.email || x.Email || "",
          createdAt: x.createdAt || x.CreatedAt || "",
        }));

        setEmployees(normalized);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load employee logins",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-4 py-2 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-xl">Employee Password Setup</h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage employee login credentials and password status
          </p>
        </div>

        <button
          className="bg-primary text-sm cursor-pointer hover:bg-secondary text-white px-4 py-2 rounded-lg font-medium"
          onClick={() => {
            setSelectedEmp(null);
            setShowModal(true);
          }}
        >
          + Setup Password
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">
          Loading employee logins...
        </div>
      ) : employees.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          No employee login records found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 w-12">S.No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp, index) => (
                <tr
                  key={emp.id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition text-center"
                >
                  {/* Index */}
                  <td className="p-3">{index + 1}.</td>

                  {/* Name */}
                  <td className="p-3 font-medium text-gray-800">
                    {emp.fullName || "-"}
                  </td>

                  {/* Email */}
                  <td className="p-3 text-gray-600">{emp.email || "N/A"}</td>

                  {/* Status */}
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        emp.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="p-3 text-gray-600">
                    {emp.createdAt
                      ? new Date(emp.createdAt).toLocaleDateString("en-GB")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* Modal */}
      <EmployeePasswordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        employee={selectedEmp}
        onSuccess={fetchEmployees}
      />
    </div>
  );
};

export default EmployeePasswordSetup;
