import { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const SalaryDetails = ({ data = {}, updateData = () => {}, goNext = () => {} }) => {
  const orgId = 6;
  const [components, setComponents] = useState([]);
  const [form, setForm] = useState({});
  const [ctc, setCtc] = useState(data.salaryDetails?.ctc || 0);

  const additionsList = [
    "basicSalary",
    "hra",
    "conveyanceAllowance",
    "fixedAllowance",
    "bonus",
    "arrears",
    "leaveEncashment",
    "specialAllowance",
  ];

  const deductionsList = [
    "pfEmployee",
    "esicEmployee",
    "professionalTax",
    "tds",
    "loanRepayment",
    "otherDeduction",
  ];

  useEffect(() => {
    axiosInstance
      .get("/OrgComponentConfig/by-org", { params: { orgId } })
      .then((res) => setComponents(res.data?.data || []))
      .catch(() => toast.error("Failed to load salary components"));
  }, []);

//  useEffect(() => {
//   if (!ctc || components.length === 0) return;

//   const updated = {};
//   let basic = 0;

//   // First pass: calculate basic salary
//   components.forEach((comp) => {
//     if (comp.componentName === "basicSalary") {
//       if (comp.calculationType === 1) {
//         basic = (ctc * comp.percentageValue) / 100;
//       } else if (comp.calculationType === 2) {
//         basic = comp.fixedAmount;
//       }
//       updated[comp.componentName] = parseFloat(basic.toFixed(4));
//     }
//   });

//   // Second pass: calculate all other components
//   components.forEach((comp) => {
//     if (comp.componentName === "basicSalary") return;

//     let value = 0;
//     if (comp.calculationType === 1) {
//       // % based
//       if (comp.componentName === "hra") {
//         value = (basic * comp.percentageValue) / 100; // HRA based on basic
//       } else {
//         value = (ctc * comp.percentageValue) / 100; // % of CTC
//       }
//     } else if (comp.calculationType === 2) {
//       // Fixed amount
//       value = comp.fixedAmount;
//     }

//     updated[comp.componentName] = parseFloat(value.toFixed(4));
//   });

//   setForm(updated);
// }, [ctc, components]);

useEffect(() => {
  if (!ctc || components.length === 0) return;

  let calculated = {};
  let basic = 0;
  let totalAdditions = 0;
  let totalDeductions = 0;

  const earnings = [];
  const deductions = [];

  // Step 1: Calculate fixed and % of CTC (except HRA)
  components.forEach((comp) => {
    let value = 0;

    if (comp.calculationType === 2) {
      value = comp.fixedAmount;
    } else if (comp.calculationType === 1 && comp.componentName !== "hra") {
      if (comp.componentName === "basicSalary") {
        value = (ctc * comp.percentageValue) / 100;
        basic = value;
      } else {
        value = (ctc * comp.percentageValue) / 100;
      }
    }

    value = parseFloat(value.toFixed(4));
    calculated[comp.componentName] = value;

    if (additionsList.includes(comp.componentName)) {
      earnings.push({ name: comp.componentName, value });
      totalAdditions += value;
    } else if (deductionsList.includes(comp.componentName)) {
      deductions.push({ name: comp.componentName, value });
      totalDeductions += value;
    }
  });

  // Step 2: Calculate HRA based on Basic
  const hraComp = components.find((c) => c.componentName === "hra");
  if (hraComp && hraComp.calculationType === 1 && basic > 0) {
    const hra = (basic * hraComp.percentageValue) / 100;
    calculated["hra"] = parseFloat(hra.toFixed(4));
    totalAdditions += hra;
    earnings.push({ name: "hra", value: hra });
  }

  // Step 3: Calculate current total and find difference from CTC
  const currentTotal = totalAdditions + totalDeductions;
  const diff = ctc - currentTotal;

  // Step 4: Adjust 'specialAllowance' to fix the difference
  if (Math.abs(diff) > 0.01) {
    if (components.find((c) => c.componentName === "specialAllowance")) {
      const prev = calculated["specialAllowance"] || 0;
      calculated["specialAllowance"] = parseFloat((prev + diff).toFixed(4));
      totalAdditions += diff;
    } else {
      toast.error("CTC mismatch and no adjustable component like specialAllowance found.");
    }
  }

  setForm(calculated);
}, [ctc, components]);

  const handleCTCChange = (e) => {
    const value = parseFloat(e.target.value);
    setCtc(isNaN(value) ? 0 : value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData("salaryDetails", {
      ctc,
      components: form,
    });
    goNext();
  };

  const getMonthly = (annual) => parseFloat((annual / 12).toFixed(2));

  const getComponentRows = (filterList) => {
    return components
      .filter((comp) => filterList.includes(comp.componentName))
      .map((comp) => {
        const annual = form[comp.componentName] || 0;
        const monthly = getMonthly(annual);
        const showPercentage =
          comp.calculationType === 1 && comp.percentageValue > 0;
        const calcLabel =
          comp.calculationType === 2
            ? "Fixed amount"
            : comp.componentName === "hra"
            ? "% of Basic"
            : "% of CTC";

        return {
          name: comp.componentName,
          label: comp.componentName.replace(/([A-Z])/g, " $1"),
          annual,
          monthly,
          calcLabel,
          showPercentage,
          percentage: comp.percentageValue,
        };
      });
  };

  const additions = getComponentRows(additionsList);
  const deductions = getComponentRows(deductionsList);

  const totalAnnualAdditions = additions.reduce((sum, row) => sum + row.annual, 0);
  const totalMonthlyAdditions = getMonthly(totalAnnualAdditions);

  const totalAnnualDeductions = deductions.reduce((sum, row) => sum + row.annual, 0);
  const totalMonthlyDeductions = getMonthly(totalAnnualDeductions);

  const netMonthlySalary = totalMonthlyAdditions - totalMonthlyDeductions;
  const netAnnualSalary = totalAnnualAdditions - totalAnnualDeductions;

  return (
    <form onSubmit={handleSubmit} className="p-6 border rounded bg-white shadow space-y-6">
      {/* CTC Input */}
      <div className="flex items-center gap-2">
        <label className="font-semibold w-40">Annual CTC *</label>
        <input
          required
          name="ctc"
          type="number"
          step="0.0001"
          value={ctc}
          onChange={handleCTCChange}
          className="border px-4 py-2 rounded w-64"
        />
        <span className="text-gray-600">per year</span>
      </div>

      {/* Additions Table */}
      <div>
        <h2 className="font-semibold mb-2 mt-6 text-green-700">Earnings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-300 rounded">
            <thead className="bg-green-100 text-gray-700 text-left">
              <tr>
                <th className="px-4 py-2">Component</th>
                <th className="px-4 py-2">Calculation Type</th>
                <th className="px-4 py-2">Monthly</th>
                <th className="px-4 py-2">Annual</th>
              </tr>
            </thead>
            <tbody>
              {additions.map((row) => (
                <tr key={row.name} className="border-t">
                  <td className="px-4 py-2 capitalize font-medium">{row.label}</td>
                  <td className="px-4 py-2">
                    {row.showPercentage ? (
                      <div className="flex items-center gap-2">
                        <input
                          disabled
                          type="number"
                          className="w-16 px-2 py-1 border rounded bg-gray-100 text-right"
                          value={row.percentage}
                        />
                        <span>{row.calcLabel}</span>
                      </div>
                    ) : (
                      <span className="text-gray-700">{row.calcLabel}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">₹ {row.monthly}</td>
                  <td className="px-4 py-2">₹ {row.annual.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deductions Table */}
      <div>
        <h2 className="font-semibold mb-2 mt-6 text-red-700">Deductions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-300 rounded">
            <thead className="bg-red-100 text-gray-700 text-left">
              <tr>
                <th className="px-4 py-2">Component</th>
                <th className="px-4 py-2">Calculation Type</th>
                <th className="px-4 py-2">Monthly</th>
                <th className="px-4 py-2">Annual</th>
              </tr>
            </thead>
            <tbody>
              {deductions.map((row) => (
                <tr key={row.name} className="border-t">
                  <td className="px-4 py-2 capitalize font-medium">{row.label}</td>
                  <td className="px-4 py-2">
                    {row.showPercentage ? (
                      <div className="flex items-center gap-2">
                        <input
                          disabled
                          type="number"
                          className="w-16 px-2 py-1 border rounded bg-gray-100 text-right"
                          value={row.percentage}
                        />
                        <span>{row.calcLabel}</span>
                      </div>
                    ) : (
                      <span className="text-gray-700">{row.calcLabel}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">₹ {row.monthly}</td>
                  <td className="px-4 py-2">₹ {row.annual.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 p-4 rounded text-lg font-medium space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-700">Total Monthly Earnings:</span>
          ₹ {totalMonthlyAdditions}
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Total Monthly Deductions:</span>
          ₹ {totalMonthlyDeductions}
        </div>
        <div className="flex justify-between text-green-700">
          <span>Net Monthly Salary:</span>
          ₹ {netMonthlySalary.toFixed(2)}
        </div>
        <div className="flex justify-between text-gray-700 pt-2 border-t">
          <span>CTC (Annual):</span>
          ₹ {ctc}
        </div>
      </div>

      {/* Button */}
      <div className="flex justify-between mt-6">
        <button type="submit" className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded">
          Save and Continue
        </button>
      </div>
    </form>
  );
};

export default SalaryDetails;
