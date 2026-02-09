import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";

export default function AddOTRateSlabMaster({
  onClose,
  isEdit = false,
  initialData = null,
  onSuccess,
}) {
  const [form, setForm] = useState({
    fromHours: "",
    toHours: "",
    ratePerHour: "",
    rateType: "Fixed",
    multiplierValue: "",
    graceMinutesBeforeOT: "",
    effectiveFrom: "",
    effectiveTo: "",
    paymentAdjustmentId: "",
    maxOTHours: "",
    includeOverflowInPayroll: false,
    calculationFormula: "",
    additionalMetadataJson: "",
    isEnabled: true,
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentAdjustments, setPaymentAdjustments] = useState([]);

  const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  useEffect(() => {
    axiosInstance
      .get("/PaymentAdjustment/getAll")
      .then((res) => setPaymentAdjustments(res.data?.data || []))
      .catch(() => toast.error("Failed to load payment components"));
  }, []);

  useEffect(() => {
    if (isEdit && initialData) {
      const toLocal = (iso) =>
        iso ? new Date(iso).toISOString().slice(0, 16) : "";

      setForm({
        fromHours: initialData.fromHours ?? "",
        toHours: initialData.toHours ?? "",
        ratePerHour: initialData.ratePerHour ?? "",
        rateType: initialData.rateType ?? "Fixed",
        multiplierValue: initialData.multiplierValue ?? "",
        graceMinutesBeforeOT: initialData.graceMinutesBeforeOT ?? "",
        effectiveFrom: toLocal(initialData.effectiveFrom),
        effectiveTo: toLocal(initialData.effectiveTo),
        paymentAdjustmentId: initialData.paymentAdjustmentId ?? "",
        maxOTHours: initialData.maxOTHours ?? "",
        includeOverflowInPayroll: initialData.includeOverflowInPayroll ?? false,
        calculationFormula: initialData.calculationFormula ?? "",
        additionalMetadataJson: initialData.additionalMetadataJson ?? "",
        isEnabled: initialData.isEnabled ?? true,
        notes: initialData.notes ?? "",
      });
    }
  }, [isEdit, initialData]);

  const handleChange = (key, value) => {
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.fromHours === "") e.fromHours = "Start hour is required";
    if (form.toHours === "") e.toHours = "End hour is required";
    if (+form.fromHours > +form.toHours)
      e.toHours = "End hours must be greater than start hours";
    if (!form.ratePerHour) e.ratePerHour = "Rate per hour is required";
    if (!form.paymentAdjustmentId)
      e.paymentAdjustmentId = "Select where OT will be paid";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const payload = {
      fromHours: Number(form.fromHours),
      toHours: Number(form.toHours),
      ratePerHour: Number(form.ratePerHour),
      rateType: form.rateType,
      multiplierValue: Number(form.multiplierValue || 0),
      graceMinutesBeforeOT: Number(form.graceMinutesBeforeOT || 0),
      effectiveFrom: form.effectiveFrom
        ? new Date(form.effectiveFrom).toISOString()
        : null,
      effectiveTo: form.effectiveTo
        ? new Date(form.effectiveTo).toISOString()
        : null,
      paymentAdjustmentId: Number(form.paymentAdjustmentId),
      maxOTHours: Number(form.maxOTHours || 0),
      includeOverflowInPayroll: Boolean(form.includeOverflowInPayroll),
      calculationFormula: form.calculationFormula || "",
      additionalMetadataJson: form.additionalMetadataJson || "",
      isEnabled: Boolean(form.isEnabled),
      notes: form.notes || "",
    };

    try {
      isEdit
        ? await axiosInstance.put(
            `/OTRateSlabMaster/update/${initialData.otRateSlabId}`,
            payload
          )
        : await axiosInstance.post("/OTRateSlabMaster/create", payload);

      toast.success(isEdit ? "OT Slab updated" : "OT Slab created");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save OT slab");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-red-600"
        >
          <FiX size={25} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-1">
          {isEdit ? "Edit" : "Create"} OT Rate Slab
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Define how overtime is calculated and paid in payroll.
        </p>

        {/* FORM */}
        <form onSubmit={submit} className="space-y-4 text-sm">
          {/* HOURS */}
          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputClass}
              placeholder="From hours (e.g. 0)"
              value={form.fromHours}
              onChange={(e) => handleChange("fromHours", e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="To hours (e.g. 4)"
              value={form.toHours}
              onChange={(e) => handleChange("toHours", e.target.value)}
            />
          </div>

          {/* RATE */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              className="shadow-sm rounded-lg"
              options={[
                { value: "Fixed", label: "Fixed (₹ per hour)" },
                { value: "Percentage", label: "Percentage of salary" },
              ]}
              value={{ value: form.rateType, label: form.rateType }}
              onChange={(o) => handleChange("rateType", o.value)}
            />
            <input
              className={inputClass}
              placeholder="Rate per hour (e.g. 200)"
              value={form.ratePerHour}
              onChange={(e) => handleChange("ratePerHour", e.target.value)}
            />
          </div>

          {/* GRACE + MULTIPLIER */}
          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputClass}
              placeholder="Grace minutes before OT (e.g. 15)"
              value={form.graceMinutesBeforeOT}
              onChange={(e) =>
                handleChange("graceMinutesBeforeOT", e.target.value)
              }
            />
            <input
              className={inputClass}
              placeholder="Multiplier (e.g. 1.5 for 1.5x pay)"
              value={form.multiplierValue}
              onChange={(e) => handleChange("multiplierValue", e.target.value)}
            />
          </div>

          {/* PAYMENT COMPONENT */}
          <Select
            className="shadow-sm rounded-lg"
            placeholder="Select salary component where OT will be paid"
            options={paymentAdjustments.map((p) => ({
              value: p.paymentAdjustmentId,
              label: p.paymentType,
            }))}
            value={paymentAdjustments
              .map((p) => ({
                value: p.paymentAdjustmentId,
                label: p.paymentType,
              }))
              .find((o) => o.value === form.paymentAdjustmentId)}
            onChange={(o) => handleChange("paymentAdjustmentId", o?.value)}
          />

          {/* MAX OT */}
          <input
            className={inputClass}
            placeholder="Maximum OT hours per day (optional)"
            value={form.maxOTHours}
            onChange={(e) => handleChange("maxOTHours", e.target.value)}
          />

          {/* EFFECTIVE DATES */}
          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputClass}
              type="datetime-local"
              value={form.effectiveFrom}
              onChange={(e) => handleChange("effectiveFrom", e.target.value)}
            />
            <input
              className={inputClass}
              type="datetime-local"
              value={form.effectiveTo}
              onChange={(e) => handleChange("effectiveTo", e.target.value)}
            />
          </div>

          {/* ADVANCED */}
          <input
            className={inputClass}
            placeholder="Calculation formula (optional)"
            value={form.calculationFormula}
            onChange={(e) => handleChange("calculationFormula", e.target.value)}
          />
          <textarea
            className={`${inputClass} font-mono`}
            placeholder="Additional metadata (JSON, optional)"
            value={form.additionalMetadataJson}
            onChange={(e) =>
              handleChange("additionalMetadataJson", e.target.value)
            }
          />
          <input
            className={inputClass}
            placeholder="Internal notes (optional)"
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />

          {/* FLAGS */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.includeOverflowInPayroll}
                onChange={(e) =>
                  handleChange("includeOverflowInPayroll", e.target.checked)
                }
                className="accent-primary"
              />
              Include extra OT in payroll
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isEnabled}
                onChange={(e) => handleChange("isEnabled", e.target.checked)}
                className="accent-primary"
              />
              Enable this slab
            </label>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border cursor-pointer hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white shadow-md font-semibold ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-primary hover:bg-secondary cursor-pointer"
              }`}
            >
              {loading ? "Saving…" : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
