import React, { useEffect, useState } from "react";
import AmountInWords from "../../../components/AmountInWords";
import assets from "../../../assets/assets";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

const EmpSalarySlip = () => {
  const [config, setConfig] = useState({
    showPAN: true,
    showYTD: false,
    showBank: true,
    showWorkLocation: true,
    showDepartment: true,
    showDesignation: true,
    showOrgName: true,
    showOrgAddress: true,
    orgName: "Digicode Software Pvt. Ltd.",
    orgAddress: "Noida, Uttar Pradesh",
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const { user } = useAuthStore();

  useEffect(() => {
    const fetchSlip = async () => {
      try {
        const res = await axiosInstance.get("/EmployeeSalarySlip/get", {
          params: {
            employeeId: user.userId,
            year: currentYear,
            month: currentMonth, // previous month slip
          },
        });
        console.log("Payslip data:", res.data);
        if (res.data && res.data.length > 0) {
          setData(res.data[0]);
        }
      } catch (err) {
        console.error("Error fetching payslip:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlip();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-sm animate-pulse">
          Loading payslip...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-8 my-10 shadow-md max-w-md mx-auto text-center border rounded-md">
        <div className="flex flex-col items-center space-y-4">
          {/* Empty State Icon */}
          <div className="bg-red-100 text-red-500 p-4 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Message */}
          <h2 className="text-lg font-semibold text-gray-700">
            No Payslip Available
          </h2>
          <p className="text-sm text-gray-500">
            We couldn’t find your payslip for this month. Please check back
            later or contact HR.
          </p>

          {/* Action Button */}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Extract data safely
  const employee = data?.employees?.[0] || {};
  const dept = data?.department?.[0]?.name || "-";
  const location = data?.workLocations?.[0]?.name || "-";
  const bank = data?.bankDetail?.[0] || {};
  const salary = data?.salaryDetail?.[0] || {};

  const earnings = [
    { label: "Basic", amount: salary.basicSalary || 0 },
    { label: "HRA", amount: salary.hra || 0 },
    { label: "Fixed Allowance", amount: salary.fixedAllowance || 0 },
    { label: "Bonus", amount: salary.bonus || 0 },
    { label: "Arrears", amount: salary.arrears || 0 },
    { label: "Conveyance", amount: salary.conveyanceAllowance || 0 },
    { label: "Special Allowance", amount: salary.specialAllowance || 0 },
    { label: "Other Allowances", amount: salary.otherAllowances || 0 },
    { label: "Leave Encashment", amount: salary.leaveEncashment || 0 },
  ];

  const deductions = [{ label: "Deductions", amount: salary.deductions || 0 }];

  const totalEarnings = salary.earnings || 0;
  const totalDeductions = salary.deductions || 0;
  const netPay = salary.netPay || 0;

  return (
    <div className="bg-white p-8 my-5 shadow-md max-w-4xl mx-auto text-sm text-gray-800 border rounded-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <img
            src={assets.Digicode}
            alt="Company Logo"
            style={{ width: "140px" }}
            className="mb-2"
          />
          {config.showOrgName && (
            <h1 className="text-lg font-bold text-gray-900">
              {config.orgName}
            </h1>
          )}
          {config.showOrgAddress && (
            <p className="text-xs text-gray-600 whitespace-pre-line">
              {config.orgAddress}
            </p>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-xs font-medium text-gray-500">
            Payslip For the Month
          </h2>
          <p className="text-base font-semibold">
            {new Date(salary.paymentDate).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Employee Summary */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p>
            <span className="font-semibold">Employee Name</span> :{" "}
            {employee.fullName}
          </p>
          {config.showDesignation && (
            <p>
              <span className="font-semibold">Designation</span> :{" "}
              {employee.designation || "-"}
            </p>
          )}
          {config.showDepartment && (
            <p>
              <strong>Department</strong> : {dept}
            </p>
          )}
          {config.showWorkLocation && (
            <p>
              <strong>Work Location</strong> : {location}
            </p>
          )}
          <p>
            <span className="font-semibold">Employee ID</span> :{" "}
            {employee.employeeCode}
          </p>
          <p>
            <span className="font-semibold">Date of Joining</span> :{" "}
            {employee.dateOfJoining?.slice(0, 10)}
          </p>
          <p>
            <span className="font-semibold">Pay Period</span> :{" "}
            {new Date(salary.paymentDate).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <p>
            <span className="font-semibold">Pay Date</span> :{" "}
            {salary.paymentDate?.slice(0, 10)}
          </p>
        </div>
        <div className="bg-green-50 border rounded p-4">
          <p className="text-sm text-gray-500">Total Net Pay</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{netPay.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 text-sm">
            <p>
              <span className="font-semibold">Paid Days</span> :{" "}
              {salary.totalWorkingDays}
            </p>
          </div>
        </div>
      </div>

      {/* Bank and ID Info */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div>
          <p>
            <span className="font-semibold">PF A/C Number</span> :
            AA/AAA/0000000/000/0000000
          </p>
          {config.showBank && bank.accountNumber && (
            <p>
              <span className="font-semibold">Bank Account No</span> :{" "}
              {bank.accountNumber}
            </p>
          )}
        </div>
        <div>
          {config.showPAN && (
            <p>
              <span className="font-semibold">UAN</span> : 101010101010
            </p>
          )}
          <p>
            <span className="font-semibold">ESI Number</span> : 1234567890
          </p>
        </div>
      </div>

      {/* Earnings & Deductions */}
      <div className="mb-6 border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-2 text-left w-1/6">EARNINGS</th>
              <th className="p-2 text-right w-1/6">AMOUNT</th>
              {config.showYTD && <th className="p-2 text-right w-1/6">YTD</th>}
              <th className="p-2 text-left w-1/6">DEDUCTIONS</th>
              <th className="p-2 text-right w-1/6">AMOUNT</th>
              {config.showYTD && <th className="p-2 text-right w-1/6">YTD</th>}
            </tr>
          </thead>
          <tbody>
            {Array.from({
              length: Math.max(earnings.length, deductions.length),
            }).map((_, index) => {
              const earning = earnings[index] || { label: "", amount: "" };
              const deduction = deductions[index] || { label: "", amount: "" };
              return (
                <tr key={index} className="border-t">
                  <td className="p-2">{earning.label}</td>
                  <td className="p-2 text-right">{earning.amount}</td>
                  {config.showYTD && <td className="p-2 text-right">-</td>}
                  <td className="p-2">{deduction.label}</td>
                  <td className="p-2 text-right">{deduction.amount}</td>
                  {config.showYTD && <td className="p-2 text-right">-</td>}
                </tr>
              );
            })}
            <tr className="bg-gray-50 border-t font-semibold">
              <td className="p-2">Gross Earnings</td>
              <td className="p-2 text-right">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </td>
              {config.showYTD && <td className="p-2 text-right">-</td>}
              <td className="p-2">Total Deductions</td>
              <td className="p-2 text-right">
                ₹{totalDeductions.toLocaleString("en-IN")}
              </td>
              {config.showYTD && <td className="p-2 text-right">-</td>}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net Pay Box */}
      <div className="border rounded p-4 mb-2 bg-gray-50">
        <p className="text-xs text-gray-500 mb-1">TOTAL NET PAYABLE</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Gross Earnings - Total Deductions
          </span>
          <span className="text-xl font-bold text-green-700 bg-green-100 px-4 py-1 rounded">
            ₹{netPay.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Amount in Words */}
      <p className="text-center text-xs text-gray-400 mt-1">
        Amount In Words :{" "}
        <AmountInWords amount={netPay} currency="Indian Rupee" />
      </p>

      {/* Signature */}
      <div className="mt-6 text-right">
        <img
          src={assets.sign}
          alt="Signature"
          className="inline-block"
          style={{ width: "90px" }}
        />
        <p className="text-xs mt-1 text-gray-500">Authorized Signatory</p>
      </div>

      <p className="text-center text-gray-400 text-xs mt-6">
        — This is a system-generated document —
      </p>
    </div>
  );
};

export default EmpSalarySlip;

// import React, { useEffect, useState } from "react";
// import AmountInWords from "../../../components/AmountInWords";
// import assets from "../../../assets/assets";

// const EmpSalarySlip = () => {
//   const [config, setConfig] = useState({});

//   // Component mount hote hi localStorage se load karega
//  useEffect(() => {
//   const savedConfig = localStorage.getItem("templateConfigs");
//   if (savedConfig) {
//     const parsedConfig = JSON.parse(savedConfig);
//     setConfig(parsedConfig.simple || {}); // only using the "simple" template
//   }
// }, []);

//   const {
//     showPAN,
//     showYTD,
//     showBank,
//     showWorkLocation,
//     showDepartment,
//     showDesignation,
//     showOrgName,
//     showOrgAddress,
//     logo,
//     logoSize,
//     signature,
//     signatureAlign,
//     orgName,
//     orgAddress,
//     department,
//     workLocation,
//   } = config;

//   const earnings = [
//     { label: "Basic", amount: "₹60,000.00", ytd: "₹2,40,000.00" },
//     {
//       label: "House Rent Allowance",
//       amount: "₹60,000.00",
//       ytd: "₹2,40,000.00",
//     },
//     { label: "Conveyance Allowance", amount: "₹0.00", ytd: "₹0.00" },
//     { label: "Fixed Allowance", amount: "₹0.00", ytd: "₹0.00" },
//     { label: "Bonus", amount: "₹0.00", ytd: "₹0.00" },
//     { label: "Commission", amount: "₹0.00", ytd: "₹0.00" },
//     { label: "Leave Encashment", amount: "₹0.00", ytd: "₹0.00" },
//   ];

//   const deductions = [
//     { label: "Income Tax", amount: "₹22,130.00", ytd: "₹2,65,554.00" },
//   ];

//   const parseAmount = (amountStr) =>
//     parseFloat(amountStr.replace(/[^0-9.-]+/g, "")) || 0;

//   const totalEarnings = earnings.reduce(
//     (sum, item) => sum + parseAmount(item.amount),
//     0
//   );
//   const totalDeductions = deductions.reduce(
//     (sum, item) => sum + parseAmount(item.amount),
//     0
//   );
//   const netPay = totalEarnings - totalDeductions;

//   return (
//     <div className="bg-white p-8 my-5 shadow-md max-w-4xl mx-auto text-sm text-gray-800 border rounded-md">
//       {/* Header */}
//       <div className="flex items-start justify-between mb-6">
//         <div>
//           <img
//             src={assets.Digicode}
//             alt="Company Logo"
//             style={{ width: `140px` }}
//             className="mb-2"
//           />

//           {showOrgName && (
//             <h1 className="text-lg font-bold text-gray-900">{orgName}</h1>
//           )}
//           {showOrgAddress && (
//             <p className="text-xs text-gray-600 whitespace-pre-line">
//               {orgAddress}
//             </p>
//           )}
//         </div>
//         <div className="text-right">
//           <h2 className="text-xs font-medium text-gray-500">
//             Payslip For the Month
//           </h2>
//           <p className="text-base font-semibold">July 2025</p>
//         </div>
//       </div>

//       {/* Employee Summary */}
//       <div className="grid grid-cols-2 gap-6 mb-6">
//         <div>
//           <p>
//             <span className="font-semibold">Employee Name</span> : Nitish Yadav
//           </p>
//           {showDesignation && (
//             <p>
//               <span className="font-semibold">Designation</span> : Software
//               Engineer
//             </p>
//           )}
//           {showDepartment && (
//             <p>
//               <strong>Department</strong> : {department || "Development"}
//             </p>
//           )}
//           {showWorkLocation && (
//             <p>
//               <strong>Work Location</strong> : {workLocation || "Noida"}
//             </p>
//           )}
//           <p>
//             <span className="font-semibold">Employee ID</span> : EMP001
//           </p>
//           <p>
//             <span className="font-semibold">Date of Joining</span> : 21-09-2024
//           </p>
//           <p>
//             <span className="font-semibold">Pay Period</span> : July 2025
//           </p>
//           <p>
//             <span className="font-semibold">Pay Date</span> : 31/08/2025
//           </p>
//         </div>
//         <div className="bg-green-50 border rounded p-4">
//           <p className="text-sm text-gray-500">Total Net Pay</p>
//           <p className="text-2xl font-bold text-green-600">₹97,870.00</p>
//           <div className="mt-2 text-sm">
//             <p>
//               <span className="font-semibold">Paid Days</span> : 28
//             </p>
//             <p>
//               <span className="font-semibold">LOP Days</span> : 3
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Bank and ID Info */}
//       <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
//         <div>
//           <p>
//             <span className="font-semibold">PF A/C Number</span> :
//             AA/AAA/0000000/000/0000000
//           </p>
//           {showBank && (
//             <p>
//               <span className="font-semibold">Bank Account No</span> :
//               101010101010101
//             </p>
//           )}
//         </div>
//         <div>
//           {showPAN && (
//             <p>
//               <span className="font-semibold">UAN</span> : 101010101010
//             </p>
//           )}
//           <p>
//             <span className="font-semibold">ESI Number</span> : 1234567890
//           </p>
//         </div>
//       </div>

//       {/* Earnings & Deductions - Exact Layout Match */}
//       <div className="mb-6 border rounded overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50 text-gray-600 ">
//             <tr>
//               <th className="p-2 text-left w-1/6">EARNINGS</th>
//               <th className="p-2 text-right w-1/6">AMOUNT</th>
//               {showYTD && <th className="p-2 text-right w-1/6">YTD</th>}
//               <th className="p-2 text-left l w-1/6">DEDUCTIONS</th>
//               <th className="p-2 text-right w-1/6">AMOUNT</th>
//               {showYTD && <th className="p-2 text-right w-1/6">YTD</th>}
//             </tr>
//           </thead>
//           <tbody>
//             {Array.from({
//               length: Math.max(earnings.length, deductions.length),
//             }).map((_, index) => {
//               const earning = earnings[index] || {
//                 label: "",
//                 amount: "",
//                 ytd: "",
//               };
//               const deduction = deductions[index] || {
//                 label: "",
//                 amount: "",
//                 ytd: "",
//               };
//               return (
//                 <tr key={index} className="border-t">
//                   <td className="p-2">{earning.label}</td>
//                   <td className="p-2 text-right">{earning.amount}</td>
//                   {showYTD && <td className="p-2 text-right">{earning.ytd}</td>}
//                   <td className="p-2">{deduction.label}</td>{" "}
//                   {/* 👈 border-l hata diya */}
//                   <td className="p-2 text-right">{deduction.amount}</td>
//                   {showYTD && (
//                     <td className="p-2 text-right">{deduction.ytd}</td>
//                   )}
//                 </tr>
//               );
//             })}

//             <tr className="bg-gray-50 border-t font-semibold">
//               <td className="p-2">Gross Earnings</td>
//               <td className="p-2 text-right">
//                 ₹{totalEarnings.toLocaleString("en-IN")}
//               </td>
//               {showYTD && <td className="p-2 text-right"></td>}
//               <td className="p-2">Total Deductions</td>{" "}
//               {/* 👈 border-l hata diya */}
//               <td className="p-2 text-right">
//                 ₹{totalDeductions.toLocaleString("en-IN")}
//               </td>
//               {showYTD && <td className="p-2 text-right"></td>}
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* Net Pay Box */}
//       <div className="border rounded p-4 mb-2 bg-gray-50">
//         <p className="text-xs text-gray-500 mb-1">TOTAL NET PAYABLE</p>
//         <div className="flex items-center justify-between">
//           <span className="text-xs text-gray-500">
//             Gross Earnings - Total Deductions
//           </span>
//           <span className="text-xl font-bold text-green-700 bg-green-100 px-4 py-1 rounded">
//             ₹{netPay.toLocaleString("en-IN")}
//           </span>
//         </div>
//       </div>

//       {/* Amount in Words */}
//       <p className="text-center text-xs text-gray-400 mt-1">
//         Amount In Words :{" "}
//         <AmountInWords amount={netPay} currency="Indian Rupee" />
//       </p>

//       {/* Signature */}

//       <div className={`mt-6 text-right`}>
//         <img
//           src={assets.sign}
//           alt="Signature"
//           className="inline-block"
//           style={{ width: "90px" }}
//         />
//         <p className="text-xs mt-1 text-gray-500">Authorized Signatory</p>
//       </div>

//       <p className="text-center text-gray-400 text-xs mt-6">
//         — This is a system-generated document —
//       </p>
//     </div>
//   );
// };

// export default EmpSalarySlip;
