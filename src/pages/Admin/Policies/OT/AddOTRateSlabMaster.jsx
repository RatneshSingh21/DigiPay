import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

export default function AddOTRateSlabMaster({
  onClose,
  isEdit = false,
  initialData = null,
  onSuccess,
}) {
  const [form, setForm] = useState({
    complianceId: "",
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

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [compliances, setCompliances] = useState([]);
  const [loadingCompliances, setLoadingCompliances] = useState(false);
  const [paymentAdjustments, setPaymentAdjustments] = useState([]);
  const [loadingPaymentAdjustments, setLoadingPaymentAdjustments] =
    useState(false);

  const fetchPaymentAdjustments = async () => {
    try {
      setLoadingPaymentAdjustments(true);
      const res = await axiosInstance.get("/PaymentAdjustment/getAll");
      setPaymentAdjustments(res.data?.data || []);
    } catch (error) {
      toast.error("Failed to load payment adjustments");
    } finally {
      setLoadingPaymentAdjustments(false);
    }
  };

  const fetchCompliances = async () => {
    try {
      setLoadingCompliances(true);
      const res = await axiosInstance.get("/Compliance/get-all");
      setCompliances(res.data || []);
    } catch (error) {
      toast.error("Failed to load compliances");
    } finally {
      setLoadingCompliances(false);
    }
  };

  useEffect(() => {
    fetchCompliances();
    fetchPaymentAdjustments();
  }, []);

  useEffect(() => {
    if (isEdit && initialData) {
      const toLocalDateTime = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        const pad = (n) => String(n).padStart(2, "0");

        return (
          d.getFullYear() +
          "-" +
          pad(d.getMonth() + 1) +
          "-" +
          pad(d.getDate()) +
          "T" +
          pad(d.getHours()) +
          ":" +
          pad(d.getMinutes())
        );
      };

      setForm({
        complianceId: initialData.complianceId ?? "",
        fromHours: initialData.fromHours ?? "",
        toHours: initialData.toHours ?? "",
        ratePerHour: initialData.ratePerHour ?? "",
        rateType: initialData.rateType ?? "Fixed",
        multiplierValue: initialData.multiplierValue ?? "",
        graceMinutesBeforeOT: initialData.graceMinutesBeforeOT ?? "",
        effectiveFrom: toLocalDateTime(initialData.effectiveFrom),
        effectiveTo: toLocalDateTime(initialData.effectiveTo),
        paymentAdjustmentId: initialData.paymentAdjustmentId ?? "",

        // ✅ Missing fields added
        maxOTHours: initialData.maxOTHours ?? "",
        includeOverflowInPayroll: initialData.includeOverflowInPayroll ?? false,

        calculationFormula: initialData.calculationFormula ?? "",
        additionalMetadataJson: initialData.additionalMetadataJson ?? "",
        isEnabled: initialData.isEnabled ?? true,
        notes: initialData.notes ?? "",
      });
    }
  }, [isEdit, initialData]);


  const validate = () => {
    const e = {};

    if (!form.complianceId) e.complianceId = "Compliance is required.";
    if (form.fromHours === "" || isNaN(Number(form.fromHours)))
      e.fromHours = "Enter a valid number.";
    if (form.toHours === "" || isNaN(Number(form.toHours)))
      e.toHours = "Enter a valid number.";
    if (Number(form.fromHours) > Number(form.toHours))
      e.toHours = "To Hours must be >= From Hours.";

    if (form.ratePerHour === "" || isNaN(Number(form.ratePerHour)))
      e.ratePerHour = "Enter a valid number.";

    if (form.paymentAdjustmentId === "" || isNaN(Number(form.paymentAdjustmentId)))
      e.paymentAdjustmentId = "Payment Adjustment is required.";

    if (form.effectiveFrom && form.effectiveTo) {
      if (new Date(form.effectiveFrom) > new Date(form.effectiveTo))
        e.effectiveTo = "effectiveTo must be after effectiveFrom.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key, value) => {
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const toISO = (val) => (val ? new Date(val).toISOString() : null);
      const payload = {
        complianceId: Number(form.complianceId),
        fromHours: Number(form.fromHours),
        toHours: Number(form.toHours),
        ratePerHour: Number(form.ratePerHour),
        rateType: form.rateType,
        multiplierValue:
          form.multiplierValue === "" ? 0 : Number(form.multiplierValue),
        graceMinutesBeforeOT:
          form.graceMinutesBeforeOT === ""
            ? 0
            : Number(form.graceMinutesBeforeOT),
        effectiveFrom: toISO(form.effectiveFrom),
        effectiveTo: toISO(form.effectiveTo),
        paymentAdjustmentId: Number(form.paymentAdjustmentId),
        maxOTHours: form.maxOTHours === "" ? 0 : Number(form.maxOTHours),
        includeOverflowInPayroll: Boolean(form.includeOverflowInPayroll),
        calculationFormula: form.calculationFormula || "",
        additionalMetadataJson: form.additionalMetadataJson || "",
        isEnabled: Boolean(form.isEnabled),
        notes: form.notes || "",
      };

      let res;
      if (isEdit && initialData?.otRateSlabId) {
        res = await axiosInstance.put(
          `/OTRateSlabMaster/update/${initialData.otRateSlabId}`,
          payload
        );
      } else {
        res = await axiosInstance.post("/OTRateSlabMaster/create", payload);
      }

      setLoading(false);
      if (res && (res.status === 200 || res.status === 201)) {
        toast.success(
          isEdit
            ? "OT Rate Slab updated successfully!"
            : "OT Rate Slab created successfully!"
        );
        onSuccess && onSuccess(res.data);
        onClose && onClose();
      }
    } catch (err) {
      setLoading(false);
      const msg =
        err?.response?.data?.message || err.message || "Failed to save ";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        {isEdit ? "Edit" : "Create"} OT Rate Slab
      </h2>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Compliance</label>
            <Select
              options={compliances.map((c) => ({
                value: c.complianceId,
                label: `${c.complianceName} (${c.complianceCode})`,
              }))}
              isLoading={loadingCompliances}
              value={
                compliances
                  .map((c) => ({
                    value: c.complianceId,
                    label: `${c.complianceName} (${c.complianceCode})`,
                  }))
                  .find((opt) => opt.value === form.complianceId) || null
              }
              onChange={(selected) =>
                setForm({ ...form, complianceId: selected?.value || "" })
              }
              placeholder="Select Compliance"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Rate Type</label>
            <Select
              options={[
                { value: "Fixed", label: "Fixed" },
                { value: "Percentage", label: "Percentage" },
              ]}
              value={
                form.rateType
                  ? { value: form.rateType, label: form.rateType }
                  : null
              }
              onChange={(selected) =>
                handleChange("rateType", selected?.value || "")
              }
              placeholder="Select Rate Type"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">From Hours</label>
            <input
              value={form.fromHours}
              onChange={(e) => handleChange("fromHours", e.target.value)}
              type="number"
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.fromHours
                  ? "border-red-500"
                  : " border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              }`}
            />
            {errors.fromHours && (
              <p className="text-xs text-red-500 mt-1">{errors.fromHours}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">To Hours</label>
            <input
              value={form.toHours}
              onChange={(e) => handleChange("toHours", e.target.value)}
              type="number"
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.toHours
                  ? "border-red-500"
                  : "border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              }`}
            />
            {errors.toHours && (
              <p className="text-xs text-red-500 mt-1">{errors.toHours}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Rate Per Hour
            </label>
            <input
              value={form.ratePerHour}
              onChange={(e) => handleChange("ratePerHour", e.target.value)}
              type="number"
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.ratePerHour
                  ? "border-red-500"
                  : " border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              }`}
            />
            {errors.ratePerHour && (
              <p className="text-xs text-red-500 mt-1">{errors.ratePerHour}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Multiplier Value
            </label>
            <input
              value={form.multiplierValue}
              onChange={(e) => handleChange("multiplierValue", e.target.value)}
              type="number"
              className="w-full border rounded-lg px-3 py-2  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Grace Minutes Before OT
            </label>
            <input
              value={form.graceMinutesBeforeOT}
              onChange={(e) =>
                handleChange("graceMinutesBeforeOT", e.target.value)
              }
              type="number"
              className="w-full border rounded-lg px-3 py-2  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Max OT Hours
            </label>
            <input
              value={form.maxOTHours}
              onChange={(e) => handleChange("maxOTHours", e.target.value)}
              type="number"
              className="w-full border rounded-lg px-3 py-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Effective From
            </label>
            <input
              type="datetime-local"
              value={form.effectiveFrom}
              onChange={(e) => handleChange("effectiveFrom", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.effectiveFrom
                  ? "border-red-500"
                  : " border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Effective To
            </label>
            <input
              type="datetime-local"
              value={form.effectiveTo}
              onChange={(e) => handleChange("effectiveTo", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.effectiveTo
                  ? "border-red-500"
                  : " border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
              }`}
            />
            {errors.effectiveTo && (
              <p className="text-xs text-red-500 mt-1">{errors.effectiveTo}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">
              Payment Adjustment
            </label>

            <Select
              options={paymentAdjustments.map((p) => ({
                value: p.paymentAdjustmentId,
                label: `${p.paymentType} (ID: ${p.paymentAdjustmentId})`,
              }))}
              isLoading={loadingPaymentAdjustments}
              value={
                paymentAdjustments
                  .map((p) => ({
                    value: p.paymentAdjustmentId,
                    label: `${p.paymentType} (ID: ${p.paymentAdjustmentId})`,
                  }))
                  .find((opt) => opt.value === form.paymentAdjustmentId) || null
              }
              onChange={(selected) =>
                handleChange("paymentAdjustmentId", selected?.value || "")
              }
              placeholder="Select Payment Adjustment"
            />

            {errors.paymentAdjustmentId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.paymentAdjustmentId}
              </p>
            )}
          </div>

          <div className="flex flex-col justify-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.includeOverflowInPayroll}
                onChange={(e) =>
                  handleChange("includeOverflowInPayroll", e.target.checked)
                }
                className="h-4 w-4 accent-primary"
              />
              <span className="text-xs">Include Overflow in Payroll</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isEnabled}
                onChange={(e) => handleChange("isEnabled", e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-xs">Is Enabled</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">
            Calculation Formula
          </label>
          <input
            value={form.calculationFormula}
            onChange={(e) => handleChange("calculationFormula", e.target.value)}
            className="w-full border rounded-lg px-3 py-2  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Optional - formula or expression"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">
            Additional Metadata (JSON)
          </label>
          <textarea
            value={form.additionalMetadataJson}
            onChange={(e) =>
              handleChange("additionalMetadataJson", e.target.value)
            }
            rows={4}
            className="w-full border rounded-lg px-3 py-2 font-mono text-xs  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder='e.g. {"key":"value"}'
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Additional Notes</label>
            <input
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full border rounded-lg px-3 py-2  border-blue-300  focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg cursor-pointer border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-secondary cursor-pointer text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
