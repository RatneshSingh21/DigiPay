import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CustomSelect from "../EmployeeComponents/CustomSelect";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

export default function BasicDetails({
  onNext,
  formData,
  setFormData,
  isEdit,
}) {
  const [isDirector, setIsDirector] = useState(formData.isDirector || false);
  const [portalAccess, setPortalAccess] = useState(
    formData.portalAccess || false
  );
  const [locations, setLocations] = useState([]);
  const [designation, setDesignation] = useState([]);
  const [department, setDepartment] = useState([]);

  const handleChange = (e) => {
    if (e?.target) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [e.name]: e }));
    }
  };

  const handleNextClick = () => {
    setFormData((prev) => ({ ...prev, isDirector, portalAccess }));
  };

  const workLocationAPI = async () => {
    try {
      const res = await axiosInstance.get("/WorkLocation");
      const formatted = res.data.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setLocations(formatted);
    } catch (error) {
      toast.error("Failed to fetch locations");
    }
  };

  const designationAPI = async () => {
    try {
      const res = await axiosInstance.get("/Designation");
      const formatted = res.data.map((item) => ({
        value: item.id,
        label: item.title,
      }));
      setDesignation(formatted);
    } catch (error) {
      toast.error("Failed to fetch designations.");
    }
  };

  const departmentAPI = async () => {
    try {
      const res = await axiosInstance.get("/Department");
      const formatted = res.data.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setDepartment(formatted);
    } catch (error) {
      toast.error("Failed to fetch departments.");
    }
  };

  const getEmployeeById = async (id) => {
    try {
      const response = await axiosInstance.get(`/Employee/${id}`);

      if (response.status === 200) {
        const data = response.data;
        console.log(data);
        

        setFormData({
          ...formData,
          id: data.id,
          employeeId: data.employeeCode || "",
          firstName: data.fullName?.split(" ")[0] || "",
          middleName: data.fullName?.split(" ")[1] || "",
          lastName: data.fullName?.split(" ")[2] || "",
          dateOfJoining: data.dateOfJoining?.split("T")[0] || "",
          workEmail: data.workEmail || "",
          mobileNumber: data.mobileNumber || "",
          gender: data.gender
            ? { label: data.gender, value: data.gender }
            : null,
          department: data.departmentId
            ? { label: data.departmentName, value: data.departmentId }
            : null,
          designation: data.designationId
            ? { label: data.designationName, value: data.designationId }
            : null,
          workLocation: data.workLocationId
            ? { label: data.workLocationName, value: data.workLocationId }
            : null,
          payScheduleId: data.payScheduleId || "",
        });

        setIsDirector(data.isDirector || false);
        setPortalAccess(data.portalAccessEnabled || false);
      } else {
        toast.warning("Failed to fetch employee data.");
      }
    } catch (error) {
      toast.error("Error while fetching employee data");
      console.error("Get Employee Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullName = `${formData.firstName || ""} ${
      formData.middleName || ""
    } ${formData.lastName || ""}`.trim();
    const payload = {
      employeeCode: formData.employeeId || "",
      fullName: fullName || "",
      dateOfJoining: formData.dateOfJoining
        ? new Date(formData.dateOfJoining).toISOString()
        : null,
      workEmail: formData.workEmail || "",
      mobileNumber: formData.mobileNumber || "",
      isDirector,
      gender: formData.gender?.value || "",
      departmentId: formData.department?.value || null,
      designationId: formData.designation?.value || null,
      workLocationId: formData.workLocation?.value || null,
      payScheduleId: formData.payScheduleId || "",
      portalAccessEnabled: portalAccess,
    };

    try {
      let response;
      if (isEdit) {
        response = await axiosInstance.put(`/Employee/${formData.id}`, payload);
      } else {
        response = await axiosInstance.post("/Employee", payload);

        const returnedId = response.data?.id || response.data;
        setFormData((prev) => ({ ...prev, id: returnedId }));
        await getEmployeeById(returnedId); // fetch latest data after POST
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(
          `Employee ${isEdit ? "updated" : "created"} successfully`
        );
        onNext();
      } else {
        toast.warning("Something went wrong");
      }
    } catch (error) {
      toast.error(`Failed to ${isEdit ? "update" : "create"} employee`);
      console.error(error);
    }
  };

  useEffect(() => {
    workLocationAPI();
    designationAPI();
    departmentAPI();
  }, []);

  useEffect(() => {
    if (isEdit && formData.id) {
      getEmployeeById(formData.id);
    }
  }, [isEdit, formData.id]);

  return (
    <form className="text-sm" onSubmit={handleSubmit}>
      {/* Employee Name */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Employee Name <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-4">
          <input
            required
            name="firstName"
            placeholder="First Name"
            value={formData.firstName || ""}
            autoFocus
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="middleName"
            placeholder="Middle Name"
            value={formData.middleName || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-medium mb-1">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="employeeId"
            placeholder="employeeId"
            value={formData.employeeId || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            value={formData.dateOfJoining || ""}
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
            value={formData.workEmail || ""}
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
            value={formData.mobileNumber || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Director */}
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={isDirector}
            onChange={() => setIsDirector(!isDirector)}
            className="accent-[rgb(var(--color-primary))] mr-2"
          />
          <span>
            Employee is a <strong>Director/person</strong> with substantial
            interest in the company
          </span>
        </label>
      </div>

      {/* Select Boxes */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-medium mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            name="gender"
            required={true}
            value={formData.gender || null}
            onChange={handleChange}
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" },
            ]}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Work Location <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            name="workLocation"
            required={true}
            value={formData.workLocation || null}
            onChange={handleChange}
            options={locations}
            allowAddOption={true}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Designation <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            name="designation"
            required={true}
            value={formData.designation || null}
            onChange={handleChange}
            options={designation}
            allowAddOption={true}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            name="department"
            required={true}
            value={formData.department || null}
            onChange={handleChange}
            options={department}
            allowAddOption={true}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            PayScheduleId <span className="text-red-500">*</span>
          </label>
          <input
            required
            placeholder="payscheduleId"
            name="payScheduleId"
            value={formData.payScheduleId || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Portal Access */}
      <div className="mb-4">
        <label className="inline-flex items-start">
          <input
            type="checkbox"
            checked={portalAccess}
            onChange={() => setPortalAccess(!portalAccess)}
            className="accent-[rgb(var(--color-primary))] mr-2 mt-1"
          />
          <span className="text-sm">
            <strong>Enable Portal Access</strong>
            <br />
            The employee will be able to view payslips, submit declarations and
            create reimbursement claims through the portal.
          </span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          onClick={handleNextClick}
          className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-full shadow"
        >
          {isEdit ? "Update Details" : "Save & Continue"}
        </button>

        <button
          type="button"
          className="bg-white border border-gray-300 px-6 py-2 rounded-full shadow"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
