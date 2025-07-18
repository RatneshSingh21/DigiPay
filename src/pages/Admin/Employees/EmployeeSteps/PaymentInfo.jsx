export default function PaymentInfo({
  onBack,
  formData,
  setFormData,
  submitForm,
}) {
  const options = ["Direct Deposit", "Bank Transfer", "Cheque", "Cash"];

  const handleSelect = (method) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
  };

  return (
    <div>
      <h2 className="font-medium mb-4 text-lg">
        How would you like to pay this employee?{" "}
        <span className="text-red-500">*</span>
      </h2>

      <div className="flex flex-col gap-4 mb-6">
        {options.map((option) => (
          <div
            key={option}
            onClick={() => handleSelect(option)}
            className={`border rounded p-4 cursor-pointer hover:bg-gray-50 ${
              formData.paymentMethod === option
                ? "bg-orange-100 border-orange-500"
                : ""
            }`}
          >
            <div className="font-semibold">{option}</div>
            <div className="text-sm text-gray-500">
              {option === "Direct Deposit" &&
                "Initiate payment once payroll is approved"}
              {option === "Bank Transfer" &&
                "Download advice and pay via your bank"}
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-red-500">* indicates mandatory fields</div>

      <div className="mt-6 flex gap-4">
        <button onClick={onBack} className="border px-4 py-2 rounded">
          Back
        </button>

        <button
          onClick={submitForm}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save and Continue
        </button>

        <button className="border px-4 py-2 rounded">Skip</button>
      </div>
    </div>
  );
}
