import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../../store/authStore";
import { toast } from "react-toastify";
import { useAddEmployeeStore } from "../../../../store/useAddEmployeeStore";
import Spinner from "../../../../components/Spinner";

const SalaryDetails = () => {
  const { user } = useAuthStore();
  const {
    employeeId,
    totalSteps,
    setStepData,
    setCurrentStep,
    basicDetails,
    salaryDetails,
  } = useAddEmployeeStore();
  const [earnings, setEarnings] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [basicSalary, setBasicSalary] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!basicDetails) return null; // Prevent rendering before data is loaded

  const fullName = `${basicDetails.firstName || ""} ${
    basicDetails.lastName || ""
  }`.trim();
  const employeeCode = basicDetails.employeeId || "N/A";
  const email = basicDetails.workEmail || "N/A";
  const departmentName = basicDetails.department?.label || "N/A";

  useEffect(() => {
    if (!user?.userId) return;

    axiosInstance
      .get("/OrgComponentConfig/by-org", {
        params: { orgId: user.userId },
      })
      .then((res) => {
        const data = res.data?.data || [];

        const basic = data.find((c) => c.componentName === "basicSalary");
        const basicAmt = basic?.fixedAmount || 0;
        setBasicSalary(basicAmt);

        const earningList = data
          .filter((c) =>
            [
              "basicSalary",
              "hra",
              "conveyanceAllowance",
              "fixedAllowance",
              "bonus",
              "arrears",
              "overtimeHours",
              "overtimeRate",
              "leaveEncashment",
              "specialAllowance",
            ].includes(c.componentName)
          )
          .map((c) => setupComponent(c, basicAmt));

        const deductionList = data
          .filter(
            (c) =>
              ![
                "basicSalary",
                "hra",
                "conveyanceAllowance",
                "fixedAllowance",
                "bonus",
                "arrears",
                "overtimeHours",
                "overtimeRate",
                "leaveEncashment",
                "specialAllowance",
              ].includes(c.componentName)
          )
          .map((c) => setupComponent(c, basicAmt));

        setEarnings(earningList);
        setDeductions(deductionList);
      })
      .catch(() => toast.error("Failed to load salary components"));
  }, [user?.userId]);

  const setupComponent = (comp, basic) => {
    const monthly =
      comp.calculationType === 1
        ? (basic * (comp.percentageValue || 0)) / 100
        : comp.fixedAmount || 0;

    return {
      ...comp,
      calcTypeLabel: comp.calculationType === 1 ? "Percentage" : "Fixed",
      monthly: parseFloat(monthly.toFixed(2)),
      annual: parseFloat((monthly * 12).toFixed(2)),
    };
  };

  const handleBasicSalaryChange = (value) => {
    const newBasic = parseFloat(value) || 0;
    setBasicSalary(newBasic);

    setEarnings((prev) =>
      prev.map((item) => {
        if (item.componentName === "basicSalary") {
          return {
            ...item,
            fixedAmount: newBasic,
            monthly: newBasic,
            annual: newBasic * 12,
          };
        }
        if (item.calculationType === 1) {
          const monthly = (newBasic * (item.percentageValue || 0)) / 100;
          return {
            ...item,
            monthly: parseFloat(monthly.toFixed(2)),
            annual: parseFloat((monthly * 12).toFixed(2)),
          };
        }
        return item;
      })
    );

    setDeductions((prev) =>
      prev.map((item) => {
        if (item.calculationType === 1) {
          const monthly = (newBasic * (item.percentageValue || 0)) / 100;
          return {
            ...item,
            monthly: parseFloat(monthly.toFixed(2)),
            annual: parseFloat((monthly * 12).toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const handlePercentageChange = (id, value, type) => {
    const updateFn = type === "Earning" ? setEarnings : setDeductions;
    updateFn((prev) =>
      prev.map((item) =>
        item.componentConfigId === id
          ? {
              ...item,
              percentageValue: parseFloat(value) || 0,
              monthly: (basicSalary * (parseFloat(value) || 0)) / 100,
              annual: ((basicSalary * (parseFloat(value) || 0)) / 100) * 12,
            }
          : item
      )
    );
  };

  const handleMonthlyChange = (id, value, type) => {
    const updateFn = type === "Earning" ? setEarnings : setDeductions;
    updateFn((prev) =>
      prev.map((item) => {
        if (item.componentConfigId === id) {
          const monthly = parseFloat(value) || 0;
          const annual = monthly * 12;
          let percentageValue = item.percentageValue;

          if (item.calculationType === 1 && basicSalary) {
            percentageValue = ((monthly / basicSalary) * 100).toFixed(2);
          }

          return {
            ...item,
            monthly,
            annual,
            percentageValue,
          };
        }
        return item;
      })
    );
  };

  const totalEarnings = earnings.reduce((sum, e) => sum + e.monthly, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.monthly, 0);
  const netPay = totalEarnings - totalDeductions;

  const handleSave = async () => {
    try {
      setLoading(true);

      const allComponents = [...earnings, ...deductions];
      const salaryPayload = {
        employeeId,
        orgId: user.userId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        employeeCategory: 0,
        absentDays: 0,
        totalWorkingDays: 0,
        status: 1,
        paymentDate: new Date().toISOString(),
        basicSalary,
        hra: findMonthly("hra"),
        conveyanceAllowance: findMonthly("conveyanceAllowance"),
        fixedAllowance: findMonthly("fixedAllowance"),
        bonus: findMonthly("bonus"),
        arrears: findMonthly("arrears"),
        overtimeHours: findMonthly("overtimeHours"),
        overtimeRate: findMonthly("overtimeRate"),
        leaveEncashment: findMonthly("leaveEncashment"),
        specialAllowance: findMonthly("specialAllowance"),
        pfEmployee: findMonthly("pfEmployee"),
        esicEmployee: findMonthly("esicEmployee"),
        professionalTax: findMonthly("professionalTax"),
        tds: findMonthly("tds"),
        loanRepayment: findMonthly("loanRepayment"),
        otherDeductions: findMonthly("otherDeductions"),
      };

      function findMonthly(name) {
        const comp = allComponents.find((c) => c.componentName === name);
        return comp ? comp.monthly : 0;
      }

      console.log(salaryPayload);

      if (salaryDetails?.id) {
        await axiosInstance.put("/Salary/update", salaryPayload);
        toast.success("Salary updated successfully");
      } else {
        await axiosInstance.post("/Salary/create", salaryPayload);
        toast.success("Salary created successfully");
      }

      // Store data in step state
      setStepData("salaryDetails", salaryPayload);

      // Move to next step reactively
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to save salary details"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (title, data, color, type) => (
    <div className="overflow-x-auto border rounded-lg shadow mb-6">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className={color}>
            <th className="px-4 py-2 text-left">{title}</th>
            <th className="px-4 py-2 text-left">Calc. Type</th>
            <th className="px-4 py-2 text-right">%</th>
            <th className="px-4 py-2 text-right">Monthly (₹)</th>
            <th className="px-4 py-2 text-right">Annual (₹)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.componentConfigId} className="border-t">
              <td className="px-4 py-2">{item.componentName}</td>
              <td className="px-4 py-2">{item.calcTypeLabel}</td>
              <td className="px-4 py-2 text-right">
                {item.calculationType === 1 ? (
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-20 text-right"
                    value={item.percentageValue || ""}
                    onChange={(e) =>
                      handlePercentageChange(
                        item.componentConfigId,
                        e.target.value,
                        type
                      )
                    }
                  />
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-2 text-right">
                {item.componentName === "basicSalary" ? (
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-28 text-right"
                    value={basicSalary}
                    onChange={(e) => handleBasicSalaryChange(e.target.value)}
                  />
                ) : (
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-28 text-right"
                    value={item.monthly}
                    onChange={(e) =>
                      handleMonthlyChange(
                        item.componentConfigId,
                        e.target.value,
                        type
                      )
                    }
                  />
                )}
              </td>
              <td className="px-4 py-2 text-right">{item.annual}</td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-bold">
            <td className="px-4 py-2">Total {title}</td>
            <td></td>
            <td></td>
            <td className="px-4 py-2 text-right">
              {type === "Earning"
                ? totalEarnings.toFixed(2)
                : totalDeductions.toFixed(2)}
            </td>
            <td className="px-4 py-2 text-right">
              {type === "Earning"
                ? (totalEarnings * 12).toFixed(2)
                : (totalDeductions * 12).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8">
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
      {renderTable(
        "Earnings",
        earnings,
        "bg-green-100 text-gray-700",
        "Earning"
      )}
      {renderTable(
        "Deductions",
        deductions,
        "bg-red-100 text-gray-700",
        "Deduction"
      )}

      <div className="p-4 border rounded-lg shadow bg-gray-50 text-right">
        <h2 className="text-lg font-bold">
          Net Pay (Monthly): ₹{netPay.toFixed(2)}
        </h2>
        <p className="text-gray-600">Annual: ₹{(netPay * 12).toFixed(2)}</p>
      </div>

      <div className="text-right">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-secondary"
        >
         {loading && <Spinner />} Save and Continue
        </button>
      </div>
    </div>
  );
};

export default SalaryDetails;
