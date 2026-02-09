import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";


const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const AttendanceBased = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
const totalSteps = 6;

const nextStep = () => {
  if (step < totalSteps) setStep(step + 1);
};

const prevStep = () => {
  if (step > 1) setStep(step - 1);
};

  const [form, setForm] = useState({
    prorateEarningsByPresentDays: true,
    prorateDeductionsByPresentDays: true,
    minDaysForFullSalary: 0,
    roundingPolicyForPresentDays: "",

    includeWeekOffAsPresent: true,
    includeHolidaysAsPresent: true,
    includeHalfDayAsHalf: true,

    fullDayHours: 0,
    halfDayHours: 0,
    minimumPresentHoursForFullDay: 0,
    minimumPresentHoursForHalfDay: 0,

    autoConvertAbsentToLeave: true,
    autoConvertLateToLeave: true,
    autoConvertShortHoursToLeave: true,
    leaveConversionPriority: "",

    applyShortHoursDeduction: true,
    allowedShortHoursPerMonth: 0,
    shortHoursDeductionType: "",

    countOTAsPresent: true,
    reducePresentDaysIfNoMinHours: true,

    graceMinutesPerDay: 0,
    graceMinutesPerMonth: 0,
    maxGraceCount: 0,

    allowHalfDayLOP: true,
    allowQuarterDayLOP: true,
    autoLOPIfMinHoursNotMet: true,

    makeCTCEqualNetSalary: true,
    allowNegativeSalary: true,
    netSalaryRoundingPolicy: "",
    roundingNearestValue: 0,

    applyMinimumWageCheck: true,
    applyPFESIEligibilityRules: true,

    treatWorkFromHomeAsPresent: true,
    treatOnDutyAsPresent: true,
    applyHolidayMultiplierOnOvertime: true,
    autoApproveAttendanceIfGeoFenceFails: true,
  });

  const [ruleId, setRuleId] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    });
  };

  // Fetch existing rule when modal opens
  useEffect(() => {
    if (open) {
      fetchExistingRule();
    }
  }, [open]);

  const fetchExistingRule = async () => {
    try {
      const res = await axiosInstance.get("/AttendanceSalaryRule/all");

      if (res.data?.data?.length > 0) {
        const rule = res.data.data[0];
        setRuleId(rule.id);

        // Remove extra fields not needed in API
        const {
          id,
          companyId,
          createdAt,
          createdBy,
          updatedAt,
          updatedBy,
          ...payload
        } = rule;

        setForm(payload);
      }
    } catch {
      toast.error("Failed to load attendance rules");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (ruleId) {
        // UPDATE
        await axiosInstance.put(`/AttendanceSalaryRule/update/${ruleId}`, form);
        toast.success("Attendance rules updated");
      } else {
        // CREATE
        await axiosInstance.post("/AttendanceSalaryRule/create", form);
        toast.success("Attendance rules created");
      }

      onClose();
    } catch {
      toast.error("Failed to save attendance salary rules");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-[920px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-4 relative text-sm">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 cursor-pointer text-gray-500"
        >
          <X size={18} />
        </button>

        <h2 className="text-base font-semibold mb-3 border-b border-gray-300 pb-2">
          Attendance Based Salary Rules
        </h2>

        <Stepper step={step} />

        {step === 1 && (
  <>
    <Section title="Proration & Attendance">
      <Toggle label="Prorate Earnings By Present Days" name="prorateEarningsByPresentDays" value={form.prorateEarningsByPresentDays} onChange={handleChange} />
      <Toggle label="Prorate Deductions By Present Days" name="prorateDeductionsByPresentDays" value={form.prorateDeductionsByPresentDays} onChange={handleChange} />
      <Input label="Min Days For Full Salary" name="minDaysForFullSalary" value={form.minDaysForFullSalary} onChange={handleChange} />
      <Input label="Rounding Policy" name="roundingPolicyForPresentDays" value={form.roundingPolicyForPresentDays} onChange={handleChange} type="text" />
    </Section>

    <Section title="Presence Rules">
      <Toggle label="Include Week Off As Present" name="includeWeekOffAsPresent" value={form.includeWeekOffAsPresent} onChange={handleChange} />
      <Toggle label="Include Holidays As Present" name="includeHolidaysAsPresent" value={form.includeHolidaysAsPresent} onChange={handleChange} />
      <Toggle label="Include Half Day As Half" name="includeHalfDayAsHalf" value={form.includeHalfDayAsHalf} onChange={handleChange} />
      <Toggle label="Count OT As Present" name="countOTAsPresent" value={form.countOTAsPresent} onChange={handleChange} />
    </Section>
  </>
)}

{step === 2 && (
  <Section title="Working Hours">
    <Input label="Full Day Hours" name="fullDayHours" value={form.fullDayHours} onChange={handleChange} />
    <Input label="Half Day Hours" name="halfDayHours" value={form.halfDayHours} onChange={handleChange} />
    <Input label="Min Hours For Full Day" name="minimumPresentHoursForFullDay" value={form.minimumPresentHoursForFullDay} onChange={handleChange} />
    <Input label="Min Hours For Half Day" name="minimumPresentHoursForHalfDay" value={form.minimumPresentHoursForHalfDay} onChange={handleChange} />
  </Section>
)}

{step === 3 && (
  <Section title="Leave Conversion & Short Hours">
    <Toggle label="Auto Convert Absent To Leave" name="autoConvertAbsentToLeave" value={form.autoConvertAbsentToLeave} onChange={handleChange} />
    <Toggle label="Auto Convert Late To Leave" name="autoConvertLateToLeave" value={form.autoConvertLateToLeave} onChange={handleChange} />
    <Toggle label="Auto Convert Short Hours To Leave" name="autoConvertShortHoursToLeave" value={form.autoConvertShortHoursToLeave} onChange={handleChange} />
    <Input label="Leave Conversion Priority" name="leaveConversionPriority" value={form.leaveConversionPriority} onChange={handleChange} type="text" />
    <Input label="Allowed Short Hours / Month" name="allowedShortHoursPerMonth" value={form.allowedShortHoursPerMonth} onChange={handleChange} />
  </Section>
)}

{step === 4 && (
  <Section title="Grace & LOP">
    <Input label="Grace Minutes / Day" name="graceMinutesPerDay" value={form.graceMinutesPerDay} onChange={handleChange} />
    <Input label="Grace Minutes / Month" name="graceMinutesPerMonth" value={form.graceMinutesPerMonth} onChange={handleChange} />
    <Toggle label="Allow Half Day LOP" name="allowHalfDayLOP" value={form.allowHalfDayLOP} onChange={handleChange} />
    <Toggle label="Allow Quarter Day LOP" name="allowQuarterDayLOP" value={form.allowQuarterDayLOP} onChange={handleChange} />
  </Section>
)}

{step === 5 && (
  <Section title="Salary Policies">
    <Toggle label="Make CTC Equal Net Salary" name="makeCTCEqualNetSalary" value={form.makeCTCEqualNetSalary} onChange={handleChange} />
    <Toggle label="Allow Negative Salary" name="allowNegativeSalary" value={form.allowNegativeSalary} onChange={handleChange} />
    <Input label="Net Salary Rounding Policy" name="netSalaryRoundingPolicy" value={form.netSalaryRoundingPolicy} onChange={handleChange} type="text" />
    <Input label="Rounding Nearest Value" name="roundingNearestValue" value={form.roundingNearestValue} onChange={handleChange} />
  </Section>
)}

{step === 6 && (
  <Section title="Compliance & Misc">
    <Toggle label="Apply Minimum Wage Check" name="applyMinimumWageCheck" value={form.applyMinimumWageCheck} onChange={handleChange} />
    <Toggle label="Apply PF / ESI Rules" name="applyPFESIEligibilityRules" value={form.applyPFESIEligibilityRules} onChange={handleChange} />
    <Toggle label="Treat WFH As Present" name="treatWorkFromHomeAsPresent" value={form.treatWorkFromHomeAsPresent} onChange={handleChange} />
    <Toggle label="Treat On Duty As Present" name="treatOnDutyAsPresent" value={form.treatOnDutyAsPresent} onChange={handleChange} />
  </Section>
)}


        <div className="flex justify-between mt-6 border-t border-gray-400 pt-4">
  <button
    onClick={prevStep}
    disabled={step === 1}
    className="px-4 py-1.5 border border-gray-400 rounded disabled:opacity-50"
  >
    Back
  </button>

  {step < totalSteps ? (
    <button
      onClick={nextStep}
      className="px-5 py-1.5 bg-primary text-white rounded"
    >
      Next
    </button>
  ) : (
    <button
      disabled={loading}
      onClick={handleSubmit}
      className="px-5 py-1.5 bg-primary text-white rounded"
    >
      {loading ? "Saving..." : "Save Rules"}
    </button>
  )}
</div>
      </div>
    </div>
  );
};

/* ===== UI HELPERS ===== */
const Section = ({ title, children }) => (
  <div className="mb-4">
    <h3 className="font-medium mb-2">{title}</h3>
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">{children}</div>
  </div>
);

const Input = ({ label, name, value, onChange, type = "number" }) => (
  <div>
    <label className="text-xs text-gray-600">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={inputClass}
    />
  </div>
);

const Toggle = ({ label, name, value, onChange }) => (
  <label className="flex items-center gap-2">
    <input type="checkbox" name={name} checked={value} onChange={onChange} />
    <span className="text-xs">{label}</span>
  </label>
);

const Stepper = ({ step }) => {
  const steps = [
    "Proration",
    "Working Hours",
    "Leave Rules",
    "Grace & LOP",
    "Salary",
    "Compliance",
  ];

  return (
    <div className="flex justify-between mb-4">
      {steps.map((label, index) => {
        const current = index + 1;
        return (
          <div key={label} className="flex-1 text-center">
            <div
              className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium
                ${
                  step >= current
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
            >
              {current}
            </div>
            <p className="text-[11px] mt-1 text-gray-600">{label}</p>
          </div>
        );
      })}
    </div>
  );
};


export default AttendanceBased;
