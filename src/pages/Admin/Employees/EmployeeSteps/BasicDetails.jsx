import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import CustomSelect from "../EmployeeComponents/CustomSelect";
import AddDepartmentForm from "../../Department/AddDepartmentForm";
import AddDesignationForm from "../../Designation/AddDesignationForm";
import WorkLocationForm from "../../WorkLocation/WorkLocationForm";
import { useAddEmployeeStore } from "../../../../store/useAddEmployeeStore";
import Spinner from "../../../../components/Spinner";
import { useNavigate } from "react-router-dom";

const BasicDetails = () => {
  const {
    basicDetails,
    employeeId,
    setEmployeeId,
    setStepData,
    setCurrentStep,
    totalSteps,
  } = useAddEmployeeStore();

  const [form, setForm] = useState(basicDetails || {});
  const [isDirector, setIsDirector] = useState(
    basicDetails?.isDirector || false
  );
  const [portalAccess, setPortalAccess] = useState(
    basicDetails?.portalAccess || false
  );
  const [locations, setLocations] = useState([]);
  const [designation, setDesignation] = useState([]);
  const [department, setDepartment] = useState([]);
  const [payschedule, setPayschedule] = useState([]);
  const [openModalField, setOpenModalField] = useState(null);
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
  const resetStore = useAddEmployeeStore((state) => state.resetStore);

  const handleCancel = () => {
    // Clear all stored step data
    resetStore();
    // Redirect to employee list
    navigate("/admin-dashboard/employees/list");
  };

  const fetchDropdowns = async () => {
    try {
      const [locRes, desigRes, deptRes, payRes] = await Promise.all([
        axiosInstance.get("/WorkLocation"),
        axiosInstance.get("/Designation"),
        axiosInstance.get("/Department"),
        axiosInstance.get("/PaySchedule/all"),
      ]);

      setLocations(
        locRes.data.map((item) => ({ value: item.id, label: item.name }))
      );
      setDesignation(
        desigRes.data.map((item) => ({ value: item.id, label: item.title }))
      );
      setDepartment(
        deptRes.data.map((item) => ({ value: item.id, label: item.name }))
      );
      setPayschedule(
        payRes.data.map((item) => ({ value: item.id, label: item.name }))
      );
    } catch {
      toast.error("Failed to fetch dropdown data.");
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (basicDetails && Object.keys(basicDetails).length > 0) {
      setForm(basicDetails);
    }
  }, [basicDetails]);

  const handleChange = (e) => {
    if (e?.target) {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setForm((prev) => ({ ...prev, [e.name]: e }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      employeeCode: form.employeeId,
      fullName: `${form.firstName || ""} ${form.middleName || ""} ${
        form.lastName || ""
      }`.trim(),
      dateOfJoining: form.dateOfJoining,
      workEmail: form.workEmail,
      mobileNumber: form.mobileNumber,
      isDirector,
      gender: form.gender?.value || "",
      departmentId: form.department?.value || 0,
      designationId: form.designation?.value || 0,
      workLocationId: form.workLocation?.value || 0,
      payScheduleId: form.payschedule?.value || 0,
      portalAccessEnabled: portalAccess,
    };

    try {
      let res;
      if (!employeeId) {
        res = await axiosInstance.post("/Employee", payload);
        setEmployeeId(res.data.id);
      } else {
        await axiosInstance.put(`/Employee/${employeeId}`, payload);
      }

      setStepData("basicDetails", { ...form, isDirector, portalAccess });
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save basic details"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="text-sm px-10 pb-10 pt-0 " onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium mb-1">
            Employee Name <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-4">
            <input
              required
              name="firstName"
              placeholder="First Name"
              type="text"
              value={form.firstName || ""}
              onChange={handleChange}
              autoFocus
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="middleName"
              placeholder="Middle Name"
              type="text"
              value={form.middleName || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="lastName"
              placeholder="Last Name"
              type="text"
              value={form.lastName || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-medium mb-1">
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              required
              name="employeeId"
              placeholder="employeeId"
              value={form.employeeId || ""}
              type="text"
              onChange={handleChange}
              disabled={employeeId}
              className={`w-full px-4 py-2 border rounded-md ${
                employeeId
                  ? "bg-gray-100 cursor-not-allowed"
                  : "border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              }`}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              Date of Joining <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="date"
              name="dateOfJoining"
              value={form.dateOfJoining || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              Work Email <span className="text-red-500">*</span>
            </label>
            <input
              required
              name="workEmail"
              placeholder="workEmail"
              type="email"
              value={form.workEmail || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              required
              placeholder="mobileNumber"
              name="mobileNumber"
              value={form.mobileNumber || ""}
              onChange={handleChange}
              type="text"
              maxLength={10}
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isDirector}
              onChange={() => setIsDirector(!isDirector)}
              className="accent-[rgb(var(--color-primary))] mr-2"
            />
            <span>
              Employee is a Company <strong>Director</strong> or not?
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <CustomSelect
            name="gender"
            label="Gender"
            required={true}
            value={form.gender || null}
            onChange={handleChange}
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" },
            ]}
          />
          <CustomSelect
            name="workLocation"
            label="Work Location"
            required={true}
            value={form.workLocation || null}
            onChange={handleChange}
            options={locations}
            allowAddOption
            onAddNewOption={() => setOpenModalField("workLocation")}
          />
          <CustomSelect
            name="department"
            label="Department"
            required={true}
            value={form.department || null}
            onChange={handleChange}
            options={department}
            allowAddOption
            onAddNewOption={() => setOpenModalField("department")}
          />
          <CustomSelect
            name="designation"
            label="Designation"
            required={true}
            value={form.designation || null}
            onChange={handleChange}
            options={designation}
            allowAddOption
            onAddNewOption={() => setOpenModalField("designation")}
          />
          <CustomSelect
            name="payschedule"
            label="PaySchedule"
            required={true}
            value={form.payschedule || null}
            onChange={handleChange}
            options={payschedule}
            // allowAddOption
            // onAddNewOption={() => setOpenModalField("payschedule")}
          />
        </div>

        <div className="mb-4">
          <label className="inline-flex items-start">
            <input
              type="checkbox"
              checked={portalAccess}
              onChange={() => setPortalAccess(!portalAccess)}
              className="accent-[rgb(var(--color-primary))] mr-2 mt-1"
            />
            <span className="text-sm">
              <strong>Portal Access Rights</strong>
              <br />
              Allows employee to access payslips, declarations, and claims.
            </span>
          </label>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary cursor-pointer hover:bg-secondary text-white px-6 py-2 rounded-full shadow flex items-center justify-center gap-2"
          >
            {loading && <Spinner />}
            {employeeId ? "Update & Continue" : "Save & Continue"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-200 cursor-pointer text-gray-700 px-4 py-2 rounded-full shadow hover:bg-gray-300 flex items-center justify-center gap-2"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Modal Components */}
      {openModalField === "department" && (
        <AddDepartmentForm
          onClose={() => setOpenModalField(null)}
          onSuccess={() => {
            fetchDropdowns();
            setOpenModalField(null);
          }}
        />
      )}

      {openModalField === "designation" && (
        <AddDesignationForm
          onClose={() => setOpenModalField(null)}
          onSuccess={() => {
            fetchDropdowns();
            setOpenModalField(null);
          }}
        />
      )}

      {openModalField === "workLocation" && (
        <WorkLocationForm
          onClose={() => setOpenModalField(null)}
          onSuccess={() => {
            fetchDropdowns();
            setOpenModalField(null);
          }}
        />
      )}
    </>
  );
};

export default BasicDetails;
