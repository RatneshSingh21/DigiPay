import { useState, useEffect } from "react";

export default function SalaryDetails({
  onNext,
  onBack,
  formData,
  setFormData,
}) {
  const [ctc, setCtc] = useState(formData.ctc || 0);
  const [basicPct, setBasicPct] = useState(formData.basicPct || 50);
  const [hraPct, setHraPct] = useState(formData.hraPct || 50);
  const [monthly, setMonthly] = useState(0);

  useEffect(() => {
    const basic = (ctc * basicPct) / 100;
    const hra = (basic * hraPct) / 100;
    const conveyance = 0;
    const fixedAllowance = ctc / 12 - (basic + hra) / 12;
    const annualTotal = basic + hra + conveyance + fixedAllowance * 12;
    const monthlyTotal = annualTotal / 12;

    setMonthly(monthlyTotal.toFixed(0));
    setFormData((prev) => ({
      ...prev,
      ctc,
      basic,
      hra,
      fixedAllowance,
      conveyance,
      basicPct,
      hraPct,
    }));
  }, [ctc, basicPct, hraPct, setFormData]);

  return (
    <form
      className="bg-white p-6 rounded shadow"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="mb-6 flex items-center gap-2">
        <label className="font-medium">
          Annual CTC <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={ctc}
          onChange={(e) => setCtc(Number(e.target.value))}
          className="ml-2 border rounded px-3 py-1 w-48"
        />
        <span>per year</span>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Earnings</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>Salary Components</div>
          <div>Calculation Type</div>
          <div>Monthly</div>
          <div>Annual</div>

          <div>Basic</div>
          <div className="flex">
            <input
              type="number"
              value={basicPct}
              onChange={(e) => setBasicPct(Number(e.target.value))}
              className="border rounded-l px-2 w-20"
            />
            <span className="border px-2 rounded-r"> % of CTC </span>
          </div>
          <div>{((ctc * basicPct) / 100 / 12).toFixed(0)}</div>
          <div>{((ctc * basicPct) / 100).toFixed(0)}</div>

          <div>House Rent Allowance</div>
          <div className="flex">
            <input
              type="number"
              value={hraPct}
              onChange={(e) => setHraPct(Number(e.target.value))}
              className="border rounded-l px-2 w-20"
            />
            <span className="border px-2 rounded-r"> % of Basic </span>
          </div>
          <div>
            {((((ctc * basicPct) / 100) * hraPct) / 100 / 12).toFixed(0)}
          </div>
          <div>{((((ctc * basicPct) / 100) * hraPct) / 100).toFixed(0)}</div>

          <div>Conveyance Allowance</div>
          <div>Fixed amount</div>
          <div>0</div>
          <div>0</div>

          <div>Fixed Allowance</div>
          <div>Fixed amount</div>
          <div>{monthly}</div>
          <div>{monthly * 12}</div>
        </div>
      </div>

      <div className="bg-blue-50 mt-6 p-4 font-medium flex justify-between">
        <span>Cost to Company</span>
        <div className="flex gap-8">
          <span>₹ {monthly}</span>
          <span>₹ {ctc}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="border px-4 py-2 rounded"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save and Continue
        </button>
      </div>
    </form>
  );
}
