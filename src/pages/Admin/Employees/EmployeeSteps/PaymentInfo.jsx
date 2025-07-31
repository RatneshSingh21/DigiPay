import { useState, useEffect } from "react";
import assets from "../../../../assets/assets";

const paymentModes = [
  {
    label: "Bank Transfer",
    value: "Bank Transfer",
    image: assets.BankTransfer,
  },
  {
    label: "Cash",
    value: "Cash",
    image: assets.Cash,
  },
  {
    label: "Cheque",
    value: "Cheque",
    image: assets.Cheque,
  },
  {
    label: "NEFT",
    value: "NEFT",
    image: assets.NEFT,
  },
];

const PaymentInfo = ({
  data = {},
  updateData = () => {},
  goNext = () => {},
}) => {
  const [form, setForm] = useState(data.paymentInfo || {});

  useEffect(() => {
    setForm(data.paymentInfo || {});
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentModeSelect = (mode) => {
    setForm((prev) => ({ ...prev, paymentMode: mode }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData("paymentInfo", form);
    goNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-10 py-7">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b">
        Payment Information
      </h2>
      {/* <h2 className="text-xl font-semibold text-gray-700 mb-4">Payment Information</h2> */}

      {/* Two-column grid */}
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

      {/* Payment Mode Selection */}
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
      <div className="text-right">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow"
        >
          Save & Continue
        </button>
      </div>
    </form>
  );
};

export default PaymentInfo;
