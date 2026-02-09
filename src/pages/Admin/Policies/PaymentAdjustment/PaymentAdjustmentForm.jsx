import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../components/Spinner";
import { X } from "lucide-react";
import Select from "react-select";
import useAuthStore from "../../../../store/authStore";

export default function PaymentAdjustmentForm({
  onClose,
  onSuccess,
  isEdit,
  initialData,
}) {
  const { user } = useAuthStore();
  const ORG_ID = user.userId;

  const initialFormData = {
    paymentType: "",
    maxAllowedAmount: 0,
    isActive: true,
    isUserSelectable: true,
    description: "",
    calculationFormula: "",
    additionalMetadataJson: "",
    executionOrder: 0,
    paymentCalculationType: "",
    isTaxable: true,
    isRecurring: true,
    effectiveFrom: "",
    effectiveTo: "",
    linkedPaymentAdjustmentId: 0,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [components, setComponents] = useState([]);

  const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  // ================= LOAD SALARY COMPONENTS =================
  useEffect(() => {
    axiosInstance
      .get(`/OrgComponentConfig/by-org?orgId=${ORG_ID}`)
      .then((res) => {
        if (Array.isArray(res.data?.data)) {
          setComponents(res.data.data.filter((c) => c.isEnabled));
        }
      })
      .catch(() => toast.error("Failed to load salary components"));
  }, []);

  // ================= EDIT MODE =================
  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData({
        ...initialFormData,
        ...initialData,
        effectiveFrom: initialData.effectiveFrom?.split("T")[0] || "",
        effectiveTo: initialData.effectiveTo?.split("T")[0] || "",
      });
    }
  }, [isEdit, initialData]);

  // ================= INPUT HANDLER =================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ================= REACT-SELECT HANDLERS =================
  const handleComponentChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      paymentType: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleCalculationTypeChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      paymentCalculationType: selectedOption ? selectedOption.value : "",
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      effectiveFrom: formData.effectiveFrom
        ? new Date(formData.effectiveFrom).toISOString()
        : null,
      effectiveTo: formData.effectiveTo
        ? new Date(formData.effectiveTo).toISOString()
        : null,
    };

    try {
      if (isEdit === "Edit") {
        await axiosInstance.put(
          `/PaymentAdjustment/update/${initialData.paymentAdjustmentId}`,
          payload
        );
        toast.success("Payment Adjustment updated");
      } else {
        await axiosInstance.post("/PaymentAdjustment/create", payload);
        toast.success("Payment Adjustment created");
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save Payment Adjustment");
    } finally {
      setLoading(false);
    }
  };

  // ================= REACT-SELECT OPTIONS =================
  const componentOptions = components.map((c) => ({
    value: c.componentName,
    label: c.componentName,
  }));

  const calculationOptions = [
    { value: "Addition", label: "Addition (adds money)" },
    { value: "Deduction", label: "Deduction (cuts salary)" },
    { value: "Override", label: "Override (replaces value)" },
  ];

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-start pt-12 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl relative overflow-y-auto max-h-[90vh] p-6">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-red-500 transition"
        >
          <X size={25} />
        </button>

        {/* HEADER */}
        <h2 className="text-xl font-semibold mb-1">
          {isEdit === "Edit" ? "Edit" : "New"} Payment Adjustment
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure how extra earnings or deductions affect employee salary.
        </p>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 text-xs md:grid-cols-2 gap-4"
        >
          {/* SALARY COMPONENT */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">Salary Component</label>
            <Select
              options={componentOptions}
              value={componentOptions.find(
                (opt) => opt.value === formData.paymentType
              )}
              onChange={handleComponentChange}
              placeholder="Select salary component"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <p className="text-xs text-gray-400 mt-1">
              Example: Bonus, Overtime, TDS
            </p>
          </div>

          {/* MAX AMOUNT */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">
              Maximum Amount (Optional)
            </label>
            <input
              type="number"
              name="maxAllowedAmount"
              value={formData.maxAllowedAmount}
              onChange={handleChange}
              placeholder="Leave empty or 0 for no limit"
              className={inputClass}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="font-medium mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain why this adjustment exists"
              className={inputClass}
            />
          </div>

          {/* CALCULATION TYPE */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">Calculation Type</label>
            <Select
              options={calculationOptions}
              value={calculationOptions.find(
                (opt) => opt.value === formData.paymentCalculationType
              )}
              onChange={handleCalculationTypeChange}
              placeholder="Select calculation type"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <p className="text-xs text-gray-400 mt-1">
              How this adjustment changes the final salary
            </p>
          </div>

          {/* EXECUTION ORDER */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">Calculation Priority</label>
            <input
              type="number"
              name="executionOrder"
              value={formData.executionOrder}
              onChange={handleChange}
              placeholder="Lower runs first (e.g. 1, 5, 10)"
              className={inputClass}
            />
          </div>

          {/* FORMULA */}
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="font-medium mb-1">Calculation Rule</label>
            <input
              type="text"
              name="calculationFormula"
              value={formData.calculationFormula}
              onChange={handleChange}
              placeholder="e.g. OT_HOURS * RATE | BASIC * 0.1"
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">
              Leave empty if the amount is fixed
            </p>
          </div>

          {/* ADVANCED JSON */}
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="font-medium mb-1">
              Advanced Settings (Optional)
            </label>
            <input
              type="text"
              name="additionalMetadataJson"
              value={formData.additionalMetadataJson}
              onChange={handleChange}
              placeholder='{ "source": "OT_OVERFLOW" }'
              className={inputClass}
            />
          </div>

          {/* FLAGS */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isUserSelectable"
                checked={formData.isUserSelectable}
                onChange={handleChange}
              />
              Visible to users
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isTaxable"
                checked={formData.isTaxable}
                onChange={handleChange}
              />
              Taxable
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
              />
              Recurring
            </label>
          </div>

          {/* EFFECTIVE DATES */}
          <div className="flex flex-col">
            <label className="font-medium mb-1">Effective From</label>
            <input
              type="date"
              name="effectiveFrom"
              value={formData.effectiveFrom}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Effective To</label>
            <input
              type="date"
              name="effectiveTo"
              value={formData.effectiveTo}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* HIDDEN FIELD */}
          <input
            type="hidden"
            name="linkedPaymentAdjustmentId"
            value={formData.linkedPaymentAdjustmentId}
          />

          {/* ACTIONS */}
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded cursor-pointer hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white cursor-pointer px-4 py-2 rounded hover:bg-secondary transition flex items-center gap-2"
            >
              {loading && <Spinner size={16} />}
              {isEdit === "Edit" ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
