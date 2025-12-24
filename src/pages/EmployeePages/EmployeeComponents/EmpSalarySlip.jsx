import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import { useReactToPrint } from "react-to-print";
import { payslipTemplateMap } from "../EmpPayslip/payslipTemplateRegistry";

const EmpSalarySlip = () => {
  const { user } = useAuthStore();
  const slipRef = useRef();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => currentDate.getFullYear() - i
  );

  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);

  const getTemplateConfig = (template) => {
    // 1️⃣ API config
    if (template?.configJson) {
      try {
        return JSON.parse(template.configJson);
      } catch (e) {
        console.error("Invalid configJson", e);
      }
    }

    // 2️⃣ LocalStorage fallback
    try {
      const localConfigs = JSON.parse(
        localStorage.getItem("templateConfigs") || "{}"
      );

      const key = template?.name?.toLowerCase(); // "Standard" -> "standard"
      if (key && localConfigs[key]) {
        return localConfigs[key];
      }
    } catch (e) {
      console.error("Invalid localStorage templateConfigs", e);
    }

    // 3️⃣ Final fallback
    return {};
  };

  // Load config once
  // Fetch payslip templates & select default
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axiosInstance.get("/PayslipTemplate");
        const list = res.data || [];

        setTemplates(list);

        // pick default template
        const defaultTemplate = list.find((t) => t.isDefault);

        if (defaultTemplate) {
          setActiveTemplate({
            ...defaultTemplate,
            config: getTemplateConfig(defaultTemplate),
          });
        } else if (list.length > 0) {
          // fallback if no default is marked
          setActiveTemplate({
            ...list[0],
            config: getTemplateConfig(list[0]),
          });
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
      }
    };

    fetchTemplates();
  }, []);

  // Fetch salary slip
  useEffect(() => {
    if (!user) return;
    const fetchSlip = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/EmployeeSalarySlip/get", {
          params: {
            employeeId: user.userId,
            year,
            month,
          },
        });
        if (res.data?.length > 0) setData(res.data[0]);
        else setData(null);
      } catch (err) {
        console.error("Error fetching payslip:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlip();
  }, [user, month, year]);

  const handlePrint = useReactToPrint({
    contentRef: slipRef,
    documentTitle: "Salary Slip",
  });

  if (!activeTemplate) {
    return <p className="text-center text-gray-500">Loading salary slip...</p>;
  }

  const config = activeTemplate.config;
  const TemplateComponent =
    payslipTemplateMap[activeTemplate.name] || payslipTemplateMap.Standard;
  // Extract data safely

  return (
    <div className="p-4">
      {/* Header with filter on right */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-700">
          Employee Salary Slip
        </h2>

        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {months.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {data && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-secondary transition cursor-pointer"
            >
              Print Slip
            </button>
          )}
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <p className="text-center text-gray-500 mt-10">Loading payslip...</p>
      )}

      {/* No Slip Available */}
      {!loading && !data && (
        <div className="bg-white p-8 my-10 shadow-md max-w-md mx-auto text-center border rounded-md">
          <div className="flex flex-col items-center space-y-4">
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
            <h2 className="text-lg font-semibold text-gray-700">
              No Payslip Available
            </h2>
            <p className="text-sm text-gray-500">
              No salary slip found for the selected month/year.
            </p>
          </div>
        </div>
      )}
      {/* Slip Display */}
      {!loading && data && (
        <div ref={slipRef}>
          <TemplateComponent
            config={config}
            data={data}
            month={month}
            year={year}
          />
        </div>
      )}
    </div>
  );
};

export default EmpSalarySlip;
