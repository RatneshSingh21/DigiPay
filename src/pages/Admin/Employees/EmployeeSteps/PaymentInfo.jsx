import { useState, useEffect } from "react";
import assets from "../../../../assets/assets";
// import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";
import { useAddEmployeeStore } from "../../../../store/useAddEmployeeStore";
import Spinner from "../../../../components/Spinner";

const paymentModes = [
  {
    label: "Bank Transfer",
    value: "Bank Transfer",
    image: assets.BankTransfer,
  },
  { label: "Cash", value: "Cash", image: assets.Cash },
  { label: "Cheque", value: "Cheque", image: assets.Cheque },
  { label: "NEFT", value: "NEFT", image: assets.NEFT },
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
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!basicDetails) return null;

  const fullName = `${basicDetails.firstName || ""} ${
    basicDetails.lastName || ""
  }`.trim();
  const employeeCode = basicDetails.employeeId || "N/A";
  const email = basicDetails.workEmail || "N/A";
  const departmentName = basicDetails.department?.label || "N/A";

  // Fetch existing payment info (commented API)
  useEffect(() => {
    if (employeeId) {
      setLoading(true);
      /*
      axiosInstance
        .get(`/PaymentInfo/${employeeId}`)
        .then((res) => {
          if (res.data) {
            setForm(res.data);
            setIsEdit(true);
          }
        })
        .catch((err) => console.error("Error fetching payment info:", err))
        .finally(() => setLoading(false));
      */
      // Simulate fetch delay
      setTimeout(() => setLoading(false), 500);
    }
  }, [employeeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentModeSelect = (mode) => {
    setForm((prev) => ({ ...prev, paymentMode: mode }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId) {
      toast.error("No employee selected. Please add basic details first.");
      return;
    }

    if (!form.paymentMode) {
      toast.error("Please select a payment mode.");
      return;
    }

    setLoading(true);

    try {
      let response;
      /*
      if (isEdit) {
        response = await axiosInstance.put(`/PaymentInfo/${employeeId}`, {
          employeeId,
          ...form,
        });
        toast.success("Payment info updated successfully!");
      } else {
        response = await axiosInstance.post(`/PaymentInfo/save`, {
          employeeId,
          ...form,
        });
        toast.success("Payment info added successfully!");
      }
      */
      // Simulate API response
      response = { data: form };
      setTimeout(() => {
        toast.success(isEdit ? "Payment info updated!" : "Payment info added!");
        // Update store
        setStepData("paymentInfo", response.data);
        // Move to next step
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error saving payment info:", error);
      toast.error("Failed to save payment info.");
      setLoading(false);
    }
  };

  return (
    <>
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

      <form
        onSubmit={handleSubmit}
        className="space-y-6 px-10 py-7 bg-white rounded-xl shadow"
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b">
          Payment Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bank Name
            </label>
            <input
              required
              name="bankName"
              value={form.bankName || ""}
              onChange={handleChange}
              placeholder="e.g., HDFC Bank"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bank Branch
            </label>
            <input
              required
              name="bankBranch"
              value={form.bankBranch || ""}
              onChange={handleChange}
              placeholder="e.g., Connaught Place Branch"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Number
            </label>
            <input
              required
              name="accountNumber"
              value={form.accountNumber || ""}
              onChange={handleChange}
              placeholder="e.g., 123456789012"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              IFSC Code
            </label>
            <input
              required
              name="ifscCode"
              value={form.ifscCode || ""}
              onChange={handleChange}
              placeholder="e.g., HDFC0001234"
              className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Payment Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Payment Mode
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {paymentModes.map((mode) => (
              <div
                key={mode.value}
                onClick={() => handlePaymentModeSelect(mode.value)}
                className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center shadow-sm transition-all duration-200 ${
                  form.paymentMode === mode.value
                    ? "border-blue-500 ring-2 ring-blue-400 bg-green-50"
                    : "hover:border-blue-300 bg-white"
                }`}
              >
                <img
                  src={mode.image}
                  alt={mode.label}
                  className="w-12 h-12 object-contain mb-2"
                />
                <span className="text-sm font-medium text-center">
                  {mode.label}
                </span>
              </div>
            ))}
          </div>
          {!form.paymentMode && (
            <p className="text-red-500 text-sm mt-1">
              Please select a payment mode
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-between mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`bg-primary text-white px-6 py-2 rounded-full flex items-center gap-2 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary"
            }`}
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
