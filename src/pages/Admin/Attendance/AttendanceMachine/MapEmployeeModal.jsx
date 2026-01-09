import { useEffect, useState } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  mapEmployeeToDevice,
  getDeviceMappings,
  getEmployees,
} from "./biometricApi";

const initialFormState = {
  employeeId: null,
  payCode: "",
  isEnrolled: true,
  enrollmentType: "Fingerprint",
  fingerIndex: 0,
  notes: "",
};

const MapEmployeeModal = ({
  open,
  onClose,
  deviceId,
  onSuccess,
  payCodeMode, // numeric | alphanumeric | hyphenated
}) => {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [existingMappings, setExistingMappings] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState(initialFormState);

  /* ================= PAYCODE RESOLVER ================= */
  const resolvePayCode = (employeeCode = "") => {
    if (!employeeCode) return "";

    // NUMERIC → PMSD0099 → 99
    if (payCodeMode === "numeric") {
      const digits = employeeCode.replace(/\D/g, "");
      return digits || "";
    }

    // HYPHENATED → PMSD0099 → PMSD-0099
    if (payCodeMode === "hyphenated") {
      const match = employeeCode.match(/^([A-Za-z]+)(\d+)$/);
      if (!match) return employeeCode; // fallback (safe)

      const [, prefix, number] = match;
      return `${prefix}-${number}`;
    }

    // ALPHANUMERIC (default) → PMSD0099
    return employeeCode;
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!open || !deviceId) return;

    const fetchData = async () => {
      try {
        setLoadingEmployees(true);

        const [empRes, mappingRes] = await Promise.all([
          getEmployees(),
          getDeviceMappings(deviceId),
        ]);

        setEmployees(empRes.data || []);
        setExistingMappings(mappingRes.data?.data || []);
      } catch {
        toast.error("Failed to load mapping data");
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchData();
  }, [open, deviceId]);

  const isEmployeeAlreadyMapped = (employeeId) =>
    existingMappings.some((m) => m.employeeId === employeeId);

  if (!open) return null;

  /* ================= EMPLOYEE OPTIONS ================= */
  const employeeOptions = employees.map((emp) => {
    const isMapped = existingMappings.some((m) => m.employeeId === emp.id);

    return {
      value: emp.id,
      label: `${emp.fullName} (${emp.employeeCode})${
        isMapped ? " • Already mapped" : ""
      }`,
      employeeCode: emp.employeeCode,
      isDisabled: isMapped,
    };
  });

  const enrollmentOptions = [
    { value: "Fingerprint", label: "Fingerprint" },
    { value: "Face", label: "Face Recognition" },
    { value: "Card", label: "RF Card" },
  ];

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.employeeId) {
      toast.error("Employee is required");
      return;
    }

    if (!form.payCode) {
      toast.error(
        payCodeMode === "numeric"
          ? "Employee code has no numeric value to generate PayCode"
          : "Invalid PayCode"
      );
      return;
    }

    if (isEmployeeAlreadyMapped(form.employeeId)) {
      toast.warning("Employee is already mapped to this device");
      return;
    }

    try {
      setSubmitting(true);

      await mapEmployeeToDevice({
        ...form,
        deviceId,
      });

      toast.success("Employee mapped successfully");

      setForm(initialFormState);
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Failed to map employee");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= PAYCODE LABEL ================= */
  const payCodeHint =
    payCodeMode === "numeric"
      ? "numeric only"
      : payCodeMode === "hyphenated"
      ? "prefix-number format"
      : "employee code";

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold text-lg">Map Employee to Device</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-2xl hover:text-red-500"
          >
            <FiX />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-2 max-h-[80vh] p-2 overflow-y-auto text-sm"
        >
          {/* Employee */}
          <div>
            <label className="block font-medium mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
            <Select
              options={employeeOptions}
              isLoading={loadingEmployees}
              placeholder="Select employee by name or code"
              value={employeeOptions.find(
                (opt) => opt.value === form.employeeId
              )}
              onChange={(opt) => {
                if (!opt) return;

                const generatedPayCode = resolvePayCode(opt.employeeCode);

                setForm({
                  ...form,
                  employeeId: opt.value,
                  payCode: generatedPayCode,
                });
              }}
              styles={{
                option: (base, state) => ({
                  ...base,
                  color: state.isDisabled ? "#9ca3af" : base.color,
                  cursor: state.isDisabled ? "not-allowed" : "pointer",
                }),
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Choose the employee to enroll on this biometric device.
            </p>
          </div>

          {/* Pay Code */}
          <div>
            <label className="block font-medium mb-1">
              Machine PayCode <span className="text-red-500">*</span>
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed"
              value={form.payCode}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              Generated automatically ({payCodeHint}).
            </p>
          </div>

          {/* Enrollment Type */}
          <div>
            <label className="block font-medium mb-1">Enrollment Type</label>
            <Select
              options={enrollmentOptions}
              value={enrollmentOptions.find(
                (opt) => opt.value === form.enrollmentType
              )}
              onChange={(opt) =>
                setForm({ ...form, enrollmentType: opt?.value })
              }
            />
          </div>

          {/* Finger Index */}
          <div>
            <label className="block font-medium mb-1">Finger Index</label>
            <input
              type="number"
              className={inputClass}
              value={form.fingerIndex}
              onChange={(e) =>
                setForm({
                  ...form,
                  fingerIndex: Number(e.target.value),
                })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Required only for fingerprint enrollment.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium mb-1">Notes</label>
            <textarea
              className={inputClass}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white w-full py-2 rounded hover:bg-secondary disabled:opacity-50"
          >
            {submitting ? "Mapping..." : "Map Employee"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MapEmployeeModal;
