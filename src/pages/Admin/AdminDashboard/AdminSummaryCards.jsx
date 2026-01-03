import {
  FaUserFriends,
  FaMoneyCheckAlt,
  FaClock,
  FaHandHoldingUsd,
} from "react-icons/fa";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

/* ===================== MONTH UTILITY ===================== */
const getLastMonths = (count = 12) => {
  const months = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }
  return months;
};

const MONTH_OPTIONS = getLastMonths(12);

/* ===================== FILTER ===================== */
const filterByMonth = (data, { month, year }) =>
  data.filter((s) => s.month === month && s.year === year);

const round = (value) => Math.round(Number(value || 0));

const AdminSummaryCards = () => {
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);

  const [summary, setSummary] = useState({
    totalSalaryPaid: 0,
    otPaid: 0,
    pfPaid: 0,
    esiPaid: 0,
  });

  const DEFAULT_MONTH =
    MONTH_OPTIONS.length > 1 ? MONTH_OPTIONS[1] : MONTH_OPTIONS[0];

  const [salaryMonth, setSalaryMonth] = useState(DEFAULT_MONTH);
  const [otMonth, setOtMonth] = useState(DEFAULT_MONTH);
  const [pfEsiMonth, setPfEsiMonth] = useState(DEFAULT_MONTH);

  /* ===================== FETCH EMPLOYEES ===================== */
  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/Employee");
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ===================== FETCH SALARIES (ONCE) ===================== */
  const fetchSalaries = async () => {
    try {
      const res = await axiosInstance.get("/CalculatedSalary");
      setSalaries(res.data?.data || []);
    } catch (err) {
      console.error(err);
      // toast.error("Failed to fetch salaries");
    }
  };

  /* ===================== EFFECTS ===================== */
  useEffect(() => {
    fetchEmployees();
    fetchSalaries();
  }, []);

  /* Salary */
  useEffect(() => {
    const data = filterByMonth(salaries, salaryMonth);
    setSummary((prev) => ({
      ...prev,
      totalSalaryPaid: data.reduce((sum, s) => sum + (s.netSalary || 0), 0),
    }));
  }, [salaryMonth, salaries]);

  /* OT */
  useEffect(() => {
    const data = filterByMonth(salaries, otMonth);
    setSummary((prev) => ({
      ...prev,
      otPaid: data.reduce((sum, s) => {
        if (s.overtimeAmount) return sum + s.overtimeAmount;
        return sum + (s.overtimeHours || 0) * (s.overtimeRate || 0);
      }, 0),
    }));
  }, [otMonth, salaries]);

  /* PF + ESI */
  useEffect(() => {
    const data = filterByMonth(salaries, pfEsiMonth);
    setSummary((prev) => ({
      ...prev,
      pfPaid: data.reduce((sum, s) => sum + (s.pfEmployee || 0), 0),
      esiPaid: data.reduce((sum, s) => sum + (s.esicEmployee || 0), 0),
    }));
  }, [pfEsiMonth, salaries]);

  /* ===================== DROPDOWN ===================== */
  const MonthDropdown = ({ value, onChange }) => (
    <select
      value={`${value.month}-${value.year}`}
      onChange={(e) => {
        const [m, y] = e.target.value.split("-");
        onChange(MONTH_OPTIONS.find((opt) => opt.month == m && opt.year == y));
      }}
      className="text-xs font-semibold text-primary bg-gray-50 border border-gray-200 cursor-pointer rounded-lg px-2 py-1"
    >
      {MONTH_OPTIONS.map((opt) => (
        <option
          key={`${opt.month}-${opt.year}`}
          value={`${opt.month}-${opt.year}`}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );

  /* ===================== CARDS ===================== */
  const cards = [
    {
      label: "Total Employees",
      value: employees.length,
      diff: `+${
        employees.filter((emp) => {
          if (!emp.dateOfJoining) return false;
          const d = new Date(emp.dateOfJoining);
          const now = new Date();
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        }).length
      } Joined this month`,
      icon: <FaUserFriends />,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Salary Paid",
      value: `₹${round(summary.totalSalaryPaid).toLocaleString()}`,
      diff: <MonthDropdown value={salaryMonth} onChange={setSalaryMonth} />,
      icon: <FaMoneyCheckAlt />,
      color: "from-green-500 to-green-600",
    },
    {
      label: "OT Amount Paid",
      value: `₹${round(summary.otPaid).toLocaleString()}`,
      diff: <MonthDropdown value={otMonth} onChange={setOtMonth} />,
      icon: <FaClock />,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "PF & ESI Contribution",
      customContent: (
        <div className="text-sm font-semibold">
          <div>PF: ₹{round(summary.pfPaid).toLocaleString()}</div>
          <div>ESI: ₹{round(summary.esiPaid).toLocaleString()}</div>
        </div>
      ),
      diff: <MonthDropdown value={pfEsiMonth} onChange={setPfEsiMonth} />,
      icon: <FaHandHoldingUsd />,
      color: "from-purple-500 to-pink-500",
    },
  ];

  /* ===================== UI ===================== */
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col gap-2 sm:gap-3"
        >
          <div className="flex justify-between items-center">
            {card.customContent ? (
              <div>{card.customContent}</div>
            ) : (
              <div className="text-2xl font-bold text-gray-800">
                {card.value}
              </div>
            )}
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white text-lg`}
            >
              {card.icon}
            </div>
          </div>
          <div className="text-sm font-medium text-gray-500">{card.label}</div>
          <div className="text-xs font-semibold text-primary">{card.diff}</div>
        </div>
      ))}
    </div>
  );
};

export default AdminSummaryCards;

// import {
//   FaUserFriends,
//   FaMoneyCheckAlt,
//   FaClock,
//   FaHandHoldingUsd,
// } from "react-icons/fa";
// import { useEffect, useState } from "react";

// const AdminSummaryCards = () => {
//   // ----------------------------
//   // 🔥 120 Dummy Employees
//   // ----------------------------
//   const generateDummyEmployees = () => {
//   const arr = [];
//   const now = new Date();

//   // 🔥 Only 1 to 3 employees joined this month
//   const lowJoinCount = Math.floor(Math.random() * 13) + 1;

//   for (let i = 1; i <= 120; i++) {
//     let doj;

//     if (i <= lowJoinCount) {
//       // few employees joined this month
//       doj = new Date(
//         now.getFullYear(),
//         now.getMonth(),
//         Math.floor(Math.random() * 28) + 1
//       );
//     } else {
//       // all others joined in previous months
//       const randomMonth = Math.floor(Math.random() * 11); // 0–10
//       doj = new Date(
//         now.getFullYear(),
//         randomMonth,
//         Math.floor(Math.random() * 28) + 1
//       );
//     }

//     arr.push({
//       id: i,
//       name: "Employee " + i,
//       dateOfJoining: doj.toISOString(),
//     });
//   }

//   return arr;
// };

//   const [employees, setEmployees] = useState([]);
//   const [summary, setSummary] = useState({
//     totalSalaryPaid: 0,
//     otPaid: 0,
//     pfPaid: 0,
//     esiPaid: 0,
//   });

//   const [salaryMonth, setSalaryMonth] = useState("previous");
//   const [otMonth, setOtMonth] = useState("previous");
//   const [pfEsiMonth, setPfEsiMonth] = useState("previous");

//   // ----------------------------
//   // 🔥 Dummy Salary Generator
//   // ----------------------------
//   const generateDummySalaries = () => {
//     const list = [];
//     for (let i = 0; i < 102; i++) {
//       list.push({
//         netSalary: Math.floor(Math.random() * 40000) + 2000, // 20k - 60k
//         pfEmployee: Math.floor(Math.random() * 2000) + 1500,
//         esicEmployee: Math.floor(Math.random() * 800) + 500,
//       });
//     }
//     return list;
//   };

//   // ----------------------------
//   // 🔥 Dummy OT Generator
//   // ----------------------------
//   const generateDummyOT = () => {
//     const now = new Date();
//     const arr = [];
//     for (let i = 0; i < 102; i++) {
//       arr.push({
//         attendanceDate: new Date(
//           now.getFullYear(),
//           now.getMonth(),
//           Math.floor(Math.random() * 28) + 1
//         ),
//         otAmount: Math.floor(Math.random() * 1500) + 300, // 300–1500
//       });
//     }
//     return arr;
//   };

//   // ----------------------------
//   // Dummy Fetch Methods (Logic unchanged)
//   // ----------------------------

//   const fetchEmployees = () => {
//     setEmployees(generateDummyEmployees());
//   };

//   const fetchSalaryOnly = (monthType = "current") => {
//     const salaries = generateDummySalaries();
//     const totalSalaryPaid = salaries.reduce(
//       (sum, s) => sum + (s.netSalary || 0),
//       0
//     );

//     setSummary((prev) => ({
//       ...prev,
//       totalSalaryPaid,
//     }));
//   };

//   const fetchPfEsiOnly = (monthType = "current") => {
//     const salaries = generateDummySalaries();

//     const pfPaid = salaries.reduce((sum, s) => sum + (s.pfEmployee || 0), 0);
//     const esiPaid = salaries.reduce((sum, s) => sum + (s.esicEmployee || 0), 0);

//     setSummary((prev) => ({
//       ...prev,
//       pfPaid,
//       esiPaid,
//     }));
//   };

//   const fetchOTSummary = (monthType = "current") => {
//     const data = generateDummyOT();
//     const otPaid = data.reduce((sum, item) => sum + (item.otAmount || 0), 0);

//     setSummary((prev) => ({
//       ...prev,
//       otPaid,
//     }));
//   };

//   // Load initial data
//   useEffect(() => {
//     fetchEmployees();
//     fetchSalaryOnly();
//     fetchOTSummary();
//     fetchPfEsiOnly();
//   }, []);

//   useEffect(() => {
//     fetchSalaryOnly(salaryMonth);
//   }, [salaryMonth]);

//   useEffect(() => {
//     fetchOTSummary(otMonth);
//   }, [otMonth]);

//   useEffect(() => {
//     fetchPfEsiOnly(pfEsiMonth);
//   }, [pfEsiMonth]);

//   // ----------------------------
//   // Cards (no change)
//   // ----------------------------
//   const cards = [
//     {
//       label: "Total Employees",
//       value: employees.length,
//       diff: `+${
//         employees.filter((emp) => {
//           if (!emp.dateOfJoining) return false;
//           const doj = new Date(emp.dateOfJoining);
//           const now = new Date();
//           return (
//             doj.getMonth() === now.getMonth() &&
//             doj.getFullYear() === now.getFullYear()
//           );
//         }).length
//       } Joined this month`,
//       icon: <FaUserFriends />,
//       color: "from-blue-500 to-blue-600",
//     },
//     {
//       label: "Total Salary Paid",
//       value: `₹${summary.totalSalaryPaid.toLocaleString()}`,
//       diff: (
//         <select
//           value={salaryMonth}
//           onChange={(e) => setSalaryMonth(e.target.value)}
//           className="text-xs font-semibold text-primary bg-transparent border-none outline-none cursor-pointer"
//         >
//           <option value="current">This month</option>
//           <option value="previous">Previous month</option>
//         </select>
//       ),
//       icon: <FaMoneyCheckAlt />,
//       color: "from-green-500 to-green-600",
//     },
//     {
//       label: "OT Amount Paid",
//       value: `₹${summary.otPaid.toLocaleString()}`,
//       diff: (
//         <select
//           value={otMonth}
//           onChange={(e) => setOtMonth(e.target.value)}
//           className="text-xs font-semibold text-primary bg-transparent border-none outline-none cursor-pointer"
//         >
//           <option value="current">This month</option>
//           <option value="previous">Previous month</option>
//         </select>
//       ),
//       icon: <FaClock />,
//       color: "from-yellow-500 to-yellow-600",
//     },
//     {
//       label: "PF & ESI Contribution",
//       customContent: (
//         <div className="flex flex-col gap-1 text-gray-800 text-sm font-semibold">
//           <div>PF: ₹{summary.pfPaid.toLocaleString()}</div>
//           <div>ESI: ₹{summary.esiPaid.toLocaleString()}</div>
//         </div>
//       ),
//       diff: (
//         <select
//           value={pfEsiMonth}
//           onChange={(e) => setPfEsiMonth(e.target.value)}
//           className="text-xs font-semibold text-primary bg-transparent border-none outline-none cursor-pointer"
//         >
//           <option value="current">This month</option>
//           <option value="previous">Previous month</option>
//         </select>
//       ),
//       icon: <FaHandHoldingUsd />,
//       color: "from-purple-500 to-pink-500",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//       {cards.map((card, index) => (
//         <div
//           key={index}
//           className="bg-white rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col gap-2 sm:gap-3"
//         >
//           <div className="flex justify-between items-center">
//             {card.customContent ? (
//               <div>{card.customContent}</div>
//             ) : (
//               <div className="text-2xl font-bold text-gray-800">
//                 {card.value}
//               </div>
//             )}
//             <div
//               className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white text-lg`}
//             >
//               {card.icon}
//             </div>
//           </div>
//           <div className="text-sm font-medium text-gray-500">{card.label}</div>
//           <div className="text-xs font-semibold text-primary">{card.diff}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default AdminSummaryCards;
