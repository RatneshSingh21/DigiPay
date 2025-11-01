import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import Spinner from "../../../../components/Spinner";

export default function PaymentAdjustmentForm({
  onClose,
  onSuccess,
  isEdit,
  initialData,
}) {
  const initialFormData = {
    paymentType: "",
    complianceId: 0,
    otRateSlabId: 0,
    salaryId: null,
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

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [otOptions, setOtOptions] = useState([]);
  const [complianceOptions, setComplianceOptions] = useState([]);

  const inputClass =
    "w-full px-3 py-1.5 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400";

  const normalizeValue = (value) =>
    value === null || value === undefined ? "" : value;

  useEffect(() => {
    if (isEdit === "Edit" && initialData) {
      setFormData({
        ...initialFormData,
        ...Object.fromEntries(
          Object.entries(initialData).map(([key, val]) => [
            key,
            normalizeValue(val),
          ])
        ),
        effectiveFrom: initialData.effectiveFrom
          ? new Date(initialData.effectiveFrom).toISOString().split("T")[0]
          : "",
        effectiveTo: initialData.effectiveTo
          ? new Date(initialData.effectiveTo).toISOString().split("T")[0]
          : "",
      });
    }
  }, [isEdit, initialData]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [complianceRes, otRes] = await Promise.all([
          axiosInstance.get("/Compliance/get-all"),
          axiosInstance.get("/OTRateSlabMaster/all"),
        ]);

        const complianceFormatted = complianceRes.data.map((item) => ({
          value: item.complianceId,
          label: item.complianceName,
        }));
        const otFormatted = otRes.data.map((item) => ({
          value: item.otRateSlabId,
          label: `${item.rateType} - ₹${item.ratePerHour}/hr`,
        }));

        setComplianceOptions(complianceFormatted);
        setOtOptions(otFormatted);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dropdown data");
      }
    };

    fetchDropdownData();
  }, []);

  const handleSelectChange = (selected, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selected ? selected.value : 0,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "maxAllowedAmount" ||
            name === "executionOrder" ||
            name === "salaryId" ||
            name === "linkedPaymentAdjustmentId"
          ? Number(value)
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare payload with proper date formatting
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
        toast.success("Payment Adjustment updated successfully");
      } else {
        await axiosInstance.post("/PaymentAdjustment/create", payload);
        toast.success("Payment Adjustment created successfully");
      }

      // Refresh list and close popup
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting Payment Adjustment:", error);
      toast.error(
        error.response?.data?.message || "Failed to save Payment Adjustment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 max-h-[70vh] overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {isEdit === "Edit" ? "Edit" : "New"} Payment Adjustment
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label className="block text-gray-700">Payment Type</label>
          <input
            type="text"
            name="paymentType"
            value={formData.paymentType}
            onChange={handleChange}
            className={inputClass}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-gray-700">Max Allowed Amount</label>
          <input
            type="number"
            name="maxAllowedAmount"
            value={formData.maxAllowedAmount}
            onChange={handleChange}
            className={inputClass}
            min="0"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={inputClass}
            rows={2}
          ></textarea>
        </div>

        {/* Compliance Dropdown */}
        <div>
          <label className="block text-gray-700">Compliance</label>
          <Select
            options={complianceOptions}
            value={complianceOptions.find(
              (opt) => opt.value === formData.complianceId
            )}
            onChange={(selected) =>
              handleSelectChange(selected, "complianceId")
            }
            placeholder="Select Compliance"
            isClearable
          />
        </div>

        {/* OT Rate Slab Dropdown */}
        <div>
          <label className="block text-gray-700">OT Rate Slab</label>
          <Select
            options={otOptions}
            value={otOptions.find((opt) => opt.value === formData.otRateSlabId)}
            onChange={(selected) =>
              handleSelectChange(selected, "otRateSlabId")
            }
            placeholder="Select OT Rate Slab"
            isClearable
          />
        </div>

        {/* <div>
          <label className="block text-gray-700">Salary ID</label>
          <input
            type="number"
            name="salaryId"
            value={formData.salaryId}
            onChange={handleChange}
            className={inputClass}
            min="0"
          />
        </div> */}

        <div>
          <label className="block text-gray-700">Execution Order</label>
          <input
            type="number"
            name="executionOrder"
            value={formData.executionOrder}
            onChange={handleChange}
            className={inputClass}
            min="0"
          />
        </div>

        <div>
          <label className="block text-gray-700">
            Payment Calculation Type
          </label>
          <input
            type="text"
            name="paymentCalculationType"
            value={formData.paymentCalculationType}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">Calculation Formula</label>
          <input
            type="text"
            name="calculationFormula"
            value={formData.calculationFormula}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-700">
            Additional Metadata (JSON)
          </label>
          <input
            type="text"
            name="additionalMetadataJson"
            value={formData.additionalMetadataJson}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-gray-700">Effective From</label>
          <input
            type="date"
            name="effectiveFrom"
            value={formData.effectiveFrom}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-gray-700">Effective To</label>
          <input
            type="date"
            name="effectiveTo"
            value={formData.effectiveTo}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-gray-700">
            Linked Payment Adjustment ID
          </label>
          <input
            type="number"
            name="linkedPaymentAdjustmentId"
            value={formData.linkedPaymentAdjustmentId}
            onChange={handleChange}
            className={inputClass}
            min="0"
          />
        </div>
        <div></div>

        {/* Boolean fields */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="accent-primary"
          />
          <label className="text-gray-700">Is Active</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isUserSelectable"
            checked={formData.isUserSelectable}
            onChange={handleChange}
            className="accent-primary"
          />
          <label className="text-gray-700">User Selectable</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isTaxable"
            checked={formData.isTaxable}
            onChange={handleChange}
            className="accent-primary"
          />
          <label className="text-gray-700">Taxable</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
            className="accent-primary"
          />
          <label className="text-gray-700">Recurring</label>
        </div>

        {/* Buttons */}
        <div className="col-span-2 flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="border px-5 py-2 cursor-pointer rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary cursor-pointer"
          >
            {loading ? <Spinner size={20} /> : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
