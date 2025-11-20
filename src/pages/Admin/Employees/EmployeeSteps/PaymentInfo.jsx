import { useState, useEffect } from "react";
import assets from "../../../../assets/assets";
import { toast } from "react-toastify";
import Select from "react-select";
import { useAddEmployeeStore } from "../../../../store/useAddEmployeeStore";
import Spinner from "../../../../components/Spinner";
import axiosInstance from "../../../../axiosInstance/axiosInstance";

const paymentModes = [
  { label: "Bank Transfer", value: "Bank Transfer", image: assets.BankTransfer },
  { label: "Cash", value: "Cash", image: assets.Cash },
  { label: "Cheque", value: "Cheque", image: assets.Cheque },
  { label: "NEFT", value: "NEFT", image: assets.NEFT },
];

const accountTypeOptions = [
  { value: "Savings", label: "Savings" },
  { value: "Current", label: "Current" },
  { value: "Salary", label: "Salary" },
  { value: "Fixed Deposit", label: "Fixed Deposit" },
];

const PaymentInfo = () => {
  const {
    employeeId,
    paymentInfo,
    setStepData,
    setCurrentStep,
    totalSteps,
    basicDetails,
  } = useAddEmployeeStore();

  const [form, setForm] = useState(paymentInfo || {});
  const [bankDetailId, setBankDetailId] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!basicDetails) return null;

  const fullName = `${basicDetails.firstName || ""} ${
    basicDetails.lastName || ""
  }`.trim();
  const employeeCode = basicDetails.employeeId || "N/A";
  const email = basicDetails.workEmail || "N/A";
  const departmentName = basicDetails.department?.label || "N/A";

  // Prefill Account Holder Name
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      accountHolderName: prev.accountHolderName || fullName,
    }));
  }, [fullName]);

  // Fetch Bank Info
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!employeeId) return;

      setLoading(true);

      try {
        const response = await axiosInstance.get(
          `/BankDetails/employee/${employeeId}`
        );

        const data = response.data?.data || [];

        if (data.length > 0) {
          const existing = data[0];
          setForm(existing);
          setBankDetailId(existing.bankDetailId);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // No bank details → allow POST
          console.warn("No bank details found. Creating new entry.");
        } else {
          toast.error("Failed to fetch bank details.");
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, [employeeId]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePaymentModeSelect = (mode) => {
    setForm((prev) => ({ ...prev, paymentMode: mode }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId) {
      return toast.error("Employee not found.");
    }

    if (!form.paymentMode) {
      return toast.error("Please select a payment mode.");
    }

    setLoading(true);

    try {
      const payload = {
        bankDetailId: bankDetailId || 0,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        accountType: form.accountType,
        branchName: form.branchName,
        branchAddress: form.branchAddress,
        accountHolderName: form.accountHolderName,
        paymentMode: form.paymentMode,
        employeeId,
      };

      let response;

      if (bankDetailId) {
        // UPDATE
        response = await axiosInstance.put(
          `/BankDetails/${bankDetailId}`,
          payload
        );
        toast.success("Payment info updated!");
      } else {
        // CREATE
        response = await axiosInstance.post("/BankDetails/create", payload);

        const newId = response.data?.data?.bankDetailId;
        if (newId) setBankDetailId(newId);

        toast.success("Payment info added!");
      }

      // Store in global state
      setStepData("paymentInfo", response.data?.data || response.data);

      // Move to next step
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    } catch (err) {
      console.error(err);
      toast.error("Failed to save payment info.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Employee Summary */}
      <div className="p-4 bg-white rounded-xl shadow mb-4">
        <h2 className="text-lg font-semibold text-green-600 mb-2">
          Employee Summary :
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
          <p>
            <span className="font-medium">Employee Code:</span> {employeeCode}
          </p>
          <p>
            <span className="font-medium">Full Name:</span> {fullName}
          </p>
          <p>
            <span className="font-medium">Email:</span> {email}
          </p>
          <p>
            <span className="font-medium">Department:</span> {departmentName}
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 px-10 py-7 bg-white rounded-xl shadow"
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b">
          Payment Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Code */}
          <div>
            <label className="block text-sm font-medium">Employee Code</label>
            <input
              value={employeeCode}
              disabled
              className="w-full px-4 py-2 border rounded-md bg-gray-100"
            />
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-sm font-medium">
              Account Holder Name
            </label>
            <input
              required
              name="accountHolderName"
              value={form.accountHolderName || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium">Bank Name</label>
            <input
              required
              name="bankName"
              value={form.bankName || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium">Bank Branch</label>
            <input
              required
              name="branchName"
              value={form.branchName || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Branch Address */}
          <div>
            <label className="block text-sm font-medium">Branch Address</label>
            <input
              required
              name="branchAddress"
              value={form.branchAddress || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium">Account Number</label>
            <input
              required
              name="accountNumber"
              value={form.accountNumber || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* IFSC */}
          <div>
            <label className="block text-sm font-medium">IFSC Code</label>
            <input
              required
              name="ifscCode"
              value={form.ifscCode || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium">Account Type</label>
            <Select
              required
              value={
                accountTypeOptions.find(
                  (opt) => opt.value === form.accountType
                ) || null
              }
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  accountType: selected?.value,
                }))
              }
              options={accountTypeOptions}
            />
          </div>
        </div>

        {/* Payment Mode */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Payment Mode
          </label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {paymentModes.map((mode) => (
              <div
                key={mode.value}
                onClick={() => handlePaymentModeSelect(mode.value)}
                className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center shadow-sm transition-all ${
                  form.paymentMode === mode.value
                    ? "border-blue-500 ring-2 ring-blue-400 bg-green-50"
                    : "hover:border-blue-300"
                }`}
              >
                <img
                  src={mode.image}
                  className="w-12 h-12 mb-2"
                />
                <span className="text-sm font-medium">{mode.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-between mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-full flex items-center gap-2"
          >
            {loading && <Spinner />}
            Save and Continue
          </button>
        </div>
      </form>
    </>
  );
};

export default PaymentInfo;
