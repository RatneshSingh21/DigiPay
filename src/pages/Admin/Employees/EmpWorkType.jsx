import React, { useState, useEffect } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Select from "react-select";

const EmpWorkType = () => {
  const User = useAuthStore((state) => state.user);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    workTypeName: "",
    description: "",
    categoryId: null,
    employmentTypeId: null,
    workNatureId: null,
    shiftId: null,
    workHoursPerDay: "",
    breakHours: "",
    overtimeApplicable: true,
    otRateSlabId: null,
    weekendPolicyId: null,
    payScheduleId: null,
    minWageRate: "",
    isPieceRateApplicable: true,
    pieceRateFormulaId: null,
    complianceGroupId: null,
    unionApplicable: true,
    factoryActCoverage: true,
    pfApplicable: true,
    esiApplicable: true,
    leavePolicyId: null,
    isActive: true,
    createdBy: User.userId,
    createdDate: new Date().toISOString(),
    updatedBy: User.userId,
    updatedDate: new Date().toISOString(),
  });

  // Dropdown states
  const [categories, setCategories] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [workNatures, setWorkNatures] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [otRateSlabs, setOtRateSlabs] = useState([]);
  const [weekendPolicies, setWeekendPolicies] = useState([]);
  const [paySchedules, setPaySchedules] = useState([]);
  const [pieceRateFormulas, setPieceRateFormulas] = useState([]);
  const [complianceGroups, setComplianceGroups] = useState([]);
  const [leavePolicies, setLeavePolicies] = useState([]);

  // Fetch dropdown options
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [
          catRes,
          empRes,
          wnRes,
          shiftRes,
          otRes,
          wpRes,
          psRes,
          prfRes,
          cgRes,
          lpRes,
        ] = await Promise.all([
          axiosInstance.get("/Category/list"),
          axiosInstance.get("/EmploymentType/list"),
          axiosInstance.get("/WorkNatureMaster/list"),
          axiosInstance.get("/ShiftMaster/list"),
          axiosInstance.get("/OTRateSlab/list"),
          axiosInstance.get("/WeekendPolicy/list"),
          axiosInstance.get("/PaySchedule/all"),
          axiosInstance.get("/PieceRateFormula/list"),
          axiosInstance.get("/ComplianceGroup/list"),
          axiosInstance.get("/LeavePolicy/list"),
        ]);

        setCategories(catRes.data || []);
        setEmploymentTypes(empRes.data || []);
        setWorkNatures(wnRes.data || []);
        setShifts(shiftRes.data || []);
        setOtRateSlabs(otRes.data || []);
        setWeekendPolicies(wpRes.data || []);
        setPaySchedules(psRes.data || []);
        setPieceRateFormulas(prfRes.data || []);
        setComplianceGroups(cgRes.data || []);
        setLeavePolicies(lpRes.data || []);
      } catch (err) {
        console.error("Failed to fetch dropdowns", err);
      }
    };

    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (field, selected) => {
    setForm((prev) => ({
      ...prev,
      [field]: selected ? selected.value : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/WorkTypeMaster/create", form);
      toast.success(res.data.message || "Work Type created successfully");
      setShowModal(false);
      setForm((prev) => ({
        ...prev,
        workTypeName: "",
        description: "",
        categoryId: null,
        employmentTypeId: null,
        workNatureId: null,
        shiftId: null,
        workHoursPerDay: "",
        breakHours: "",
        overtimeApplicable: true,
        otRateSlabId: null,
        weekendPolicyId: null,
        payScheduleId: null,
        minWageRate: "",
        isPieceRateApplicable: true,
        pieceRateFormulaId: null,
        complianceGroupId: null,
        unionApplicable: true,
        factoryActCoverage: true,
        pfApplicable: true,
        esiApplicable: true,
        leavePolicyId: null,
        isActive: true,
        createdBy: User.userId,
        createdDate: new Date().toISOString(),
        updatedBy: User.userId,
        updatedDate: new Date().toISOString(),
      }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create Work Type");
      console.error(err);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div>
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">Work Types</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center text-sm cursor-pointer gap-2 px-3 py-2 bg-primary hover:bg-secondary text-white rounded-lg"
        >
          <FiPlus /> Add New
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 relative animate-fadeIn overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-5 text-gray-800 text-center">
              Add Work Type
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label>Work Type Name *</label>
                <input
                  type="text"
                  name="workTypeName"
                  value={form.workTypeName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div>
                <label>Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Dropdowns */}
                <SelectField
                  label="Category"
                  options={categories}
                  value={form.categoryId}
                  onChange={(val) => handleSelectChange("categoryId", val)}
                  valueKey="categoryId"
                  labelKey="categoryName"
                />

                <SelectField
                  label="Employment Type"
                  options={employmentTypes}
                  value={form.employmentTypeId}
                  onChange={(val) =>
                    handleSelectChange("employmentTypeId", val)
                  }
                  valueKey="employmentTypeId"
                  labelKey="employmentTypeName"
                />

                <SelectField
                  label="Work Nature"
                  options={workNatures}
                  value={form.workNatureId}
                  onChange={(val) => handleSelectChange("workNatureId", val)}
                  valueKey="workNatureId"
                  labelKey="workNatureName"
                />

                <SelectField
                  label="Shift"
                  options={shifts}
                  value={form.shiftId}
                  onChange={(val) => handleSelectChange("shiftId", val)}
                  valueKey="shiftId"
                  labelKey="shiftName"
                />

                <SelectField
                  label="OT Rate Slab"
                  options={otRateSlabs}
                  value={form.otRateSlabId}
                  onChange={(val) => handleSelectChange("otRateSlabId", val)}
                  valueKey="otRateSlabId"
                  labelKey="name"
                />

                <SelectField
                  label="Weekend Policy"
                  options={weekendPolicies}
                  value={form.weekendPolicyId}
                  onChange={(val) => handleSelectChange("weekendPolicyId", val)}
                  valueKey="weekendPolicyId"
                  labelKey="policyName"
                />

                <SelectField
                  label="Pay Schedule"
                  options={paySchedules}
                  value={form.payScheduleId}
                  onChange={(val) => handleSelectChange("payScheduleId", val)}
                  valueKey="payScheduleId"
                  labelKey="payScheduleName"
                />

                <SelectField
                  label="Piece Rate Formula"
                  options={pieceRateFormulas}
                  value={form.pieceRateFormulaId}
                  onChange={(val) =>
                    handleSelectChange("pieceRateFormulaId", val)
                  }
                  valueKey="pieceRateFormulaId"
                  labelKey="formulaName"
                />

                <SelectField
                  label="Compliance Group"
                  options={complianceGroups}
                  value={form.complianceGroupId}
                  onChange={(val) =>
                    handleSelectChange("complianceGroupId", val)
                  }
                  valueKey="complianceGroupId"
                  labelKey="groupName"
                />

                <SelectField
                  label="Leave Policy"
                  options={leavePolicies}
                  value={form.leavePolicyId}
                  onChange={(val) => handleSelectChange("leavePolicyId", val)}
                  valueKey="leavePolicyId"
                  labelKey="policyName"
                />
              </div>

              {/* Numeric Fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label>Work Hours Per Day *</label>
                  <input
                    type="number"
                    name="workHoursPerDay"
                    value={form.workHoursPerDay}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label>Break Hours</label>
                  <input
                    type="number"
                    name="breakHours"
                    value={form.breakHours}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label>Minimum Wage Rate</label>
                  <input
                    type="number"
                    name="minWageRate"
                    value={form.minWageRate}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <CheckboxField
                  label="Overtime Applicable"
                  checked={form.overtimeApplicable}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      overtimeApplicable: e.target.checked,
                    }))
                  }
                />
                <CheckboxField
                  label="Piece Rate Applicable"
                  checked={form.isPieceRateApplicable}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isPieceRateApplicable: e.target.checked,
                    }))
                  }
                />
                <CheckboxField
                  label="Union Applicable"
                  checked={form.unionApplicable}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      unionApplicable: e.target.checked,
                    }))
                  }
                />
                <CheckboxField
                  label="Factory Act Coverage"
                  checked={form.factoryActCoverage}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      factoryActCoverage: e.target.checked,
                    }))
                  }
                />
                <CheckboxField
                  label="PF Applicable"
                  checked={form.pfApplicable}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pfApplicable: e.target.checked,
                    }))
                  }
                />
                <CheckboxField
                  label="ESI Applicable"
                  checked={form.esiApplicable}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      esiApplicable: e.target.checked,
                    }))
                  }
                />
                <CheckboxField
                  label="Active"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 cursor-pointer text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 cursor-pointer text-sm bg-primary text-white rounded-lg hover:bg-secondary transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Select Field
const SelectField = ({
  label,
  options,
  value,
  onChange,
  valueKey,
  labelKey,
}) => (
  <div>
    <label>{label}</label>
    <Select
      options={options.map((opt) => ({
        value: opt[valueKey],
        label: opt[labelKey],
      }))}
      value={
        value
          ? {
              value,
              label: options.find((o) => o[valueKey] === value)?.[labelKey],
            }
          : null
      }
      onChange={onChange}
      styles={{
        menu: (base) => ({ ...base, fontSize: "12px" }),
        control: (base) => ({ ...base, fontSize: "12px" }),
      }}
    />
  </div>
);

// Reusable Checkbox Field
const CheckboxField = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <span className="text-xs">{label}</span>
  </div>
);

export default EmpWorkType;
