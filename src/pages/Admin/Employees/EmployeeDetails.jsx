import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiHome,
  FiCreditCard,
  FiDollarSign,
  FiShield,
  FiAlertCircle,
  FiUsers,
} from "react-icons/fi";

const EMP_LIST_ENDPOINT = "/Employee";

const EmployeeDetails = () => {
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  const [basic, setBasic] = useState(null);
  const [personal, setPersonal] = useState(null);
  const [bank, setBank] = useState([]);
  const [salary, setSalary] = useState(null);
  const [pf, setPf] = useState(null);
  const [esi, setEsi] = useState(null);

  const [apiError, setApiError] = useState({
    basic: false,
    personal: false,
    bank: false,
    salary: false,
    pf: false,
    esi: false,
  });

  /* ---------------- EMP LIST ---------------- */
  useEffect(() => {
    axiosInstance
      .get(EMP_LIST_ENDPOINT)
      .then((res) => {
        const items = (res.data?.items || res.data || []).map((e) => ({
          value: e.id || e.employeeId,
          label: `${e.fullName} (${e.employeeCode})`,
        }));
        setEmployeeList(items);
      })
      .catch(() => toast.error("Failed to load employees"));
  }, []);

  const resetEmployeeData = () => {
    setBasic(null);
    setPersonal(null);
    setBank([]);
    setSalary(null);
    setPf(null);
    setEsi(null);

    setApiError({
      basic: false,
      personal: false,
      bank: false,
      salary: false,
      pf: false,
      esi: false,
    });
  };

  /* ---------------- FETCH DETAILS (SAFE) ---------------- */
  const fetchEmployeeDetails = async (employeeId) => {
    setLoading(true);

    const safeFetch = async (key, api, setter) => {
      try {
        const res = await api();
        setter(res);
        setApiError((s) => ({ ...s, [key]: false }));
      } catch {
        setApiError((s) => ({ ...s, [key]: true }));
      }
    };

    await safeFetch(
      "basic",
      () => axiosInstance.get(`/Employee/${employeeId}`),
      (res) => setBasic(res.data?.data || null)
    );

    await safeFetch(
      "personal",
      () => axiosInstance.get(`/PersonalDetails/${employeeId}`),
      (res) => setPersonal(res.data || null)
    );

    await safeFetch(
      "bank",
      () => axiosInstance.get(`/BankDetails/employee/${employeeId}`),
      (res) => setBank(res.data || [])
    );

    await safeFetch(
      "salary",
      () => axiosInstance.get(`/EmployeeSalary/employee/${employeeId}`),
      (res) => setSalary(res.data?.data || null)
    );

    await safeFetch(
      "pf",
      () => axiosInstance.get(`/PFEmployeeMapping`),
      (res) =>
        setPf(
          res.data?.response?.find((p) => p.employeeId === employeeId) || null
        )
    );

    await safeFetch(
      "esi",
      () => axiosInstance.get(`/EmployeeESIDetails`),
      (res) =>
        setEsi(res.data?.data?.find((e) => e.employeeId === employeeId) || null)
    );

    setLoading(false);
  };

  /* ---------------- UI HELPERS ---------------- */

  const Detail = ({ icon: Icon, label, value }) => (
    <div className="flex gap-3">
      <Icon className="text-gray-400 mt-1" />
      <div>
        <p className="text-xs uppercase text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
      </div>
    </div>
  );

  const EmptyState = ({ icon: Icon, title, subtitle }) => (
    <div className="col-span-full flex flex-col items-center py-10 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="text-2xl text-gray-400" />
      </div>
      <p className="font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
    </div>
  );

  const Section = ({ title, icon: Icon, color, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border-l-4 border-${color}-500 p-6`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg bg-${color}-50`}>
          <Icon className={`text-${color}-600`} />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </motion.div>
  );

  const Money = ({ label, value }) => (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">
        ₹ {Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );

  /* ---------------- RENDER ---------------- */

  return (
    <>
      <div className="px-4 py-2 shadow mb-5 sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl">EMPLOYEE DATA</h2>
      </div>
      <div className="px-6 pb-6 space-y-4">
        <div className="max-w-sm">
          <label className="text-sm font-medium mb-1 block">
            Select Employee
          </label>
          <Select
            options={employeeList}
            value={selectedEmployee}
            onChange={(e) => {
              setSelectedEmployee(e);

              resetEmployeeData(); // 🔥 IMPORTANT

              if (e?.value) {
                fetchEmployeeDetails(e.value);
              }
            }}
            isClearable
            placeholder="Choose employee"
          />
        </div>

        {loading && (
          <div className="flex flex-col items-center py-20 text-gray-500">
            <FiUsers className="text-3xl animate-pulse mb-2" />
            Loading employee profile…
          </div>
        )}

        {!loading && !basic && (
          <EmptyState
            icon={FiUser}
            title="No Employee Selected"
            subtitle="Select an employee to view details"
          />
        )}

        {!loading && basic && (
          <div className="space-y-8">
            {/* BASIC DETAILS – UNCHANGED DATA */}
            <Section title="Basic Details" icon={FiUser} color="blue">
              <Detail
                icon={FiUser}
                label="Employee Code"
                value={basic.employeeCode}
              />
              <Detail icon={FiUser} label="Full Name" value={basic.fullName} />
              <Detail icon={FiMail} label="Email" value={basic.workEmail} />
              <Detail
                icon={FiPhone}
                label="Mobile"
                value={basic.mobileNumber}
              />
              <Detail icon={FiUser} label="Gender" value={basic.gender} />
              <Detail
                icon={FiCalendar}
                label="Date of Joining"
                value={
                  basic?.dateOfJoining
                    ? new Date(basic.dateOfJoining).toLocaleDateString("en-GB")
                    : "—"
                }
              />
              <Detail
                icon={FiCalendar}
                label="Aadhar Number"
                value={basic.aadhaarCardNumber}
              />

              {/* NEW ADDITIONS */}
              <Detail
                icon={FiShield}
                label="PAN Number"
                value={personal?.pan}
              />
              <Detail icon={FiShield} label="PF Number" value={pf?.pfNumber} />
              <Detail
                icon={FiAlertCircle}
                label="ESI Number"
                value={esi?.esiNumber}
              />
            </Section>

            {/* PERSONAL – UNCHANGED DATA */}
            <Section title="Personal Details" icon={FiHome} color="purple">
              {personal ? (
                <>
                  <Detail
                    icon={FiCalendar}
                    label="DOB"
                    value={personal.dateOfBirth?.slice(0, 10)}
                  />
                  <Detail
                    icon={FiUser}
                    label="Father Name"
                    value={personal.fatherName}
                  />
                  <Detail icon={FiShield} label="PAN" value={personal.pan} />
                  <Detail
                    icon={FiMail}
                    label="Personal Email"
                    value={personal.personalEmailAddress}
                  />
                  <Detail icon={FiHome} label="State" value={personal.state} />
                  <Detail icon={FiHome} label="City" value={personal.city} />
                </>
              ) : apiError.personal ? (
                <EmptyState
                  icon={FiAlertCircle}
                  title="Failed to Load"
                  subtitle="Personal Details Not Added"
                />
              ) : (
                <EmptyState
                  icon={FiHome}
                  title="No Personal Data"
                  subtitle="Personal info not added"
                />
              )}
            </Section>

            {/* BANK – UNCHANGED DATA */}
            <Section title="Bank Details" icon={FiCreditCard} color="indigo">
              {bank.length ? (
                bank.map((b) => (
                  <React.Fragment key={b.bankDetailId}>
                    <Detail
                      icon={FiCreditCard}
                      label="Bank Name"
                      value={b.bankName}
                    />
                    <Detail
                      icon={FiCreditCard}
                      label="Account No"
                      value={b.accountNumber}
                    />
                    <Detail icon={FiShield} label="IFSC" value={b.ifscCode} />
                    <Detail icon={FiHome} label="Branch" value={b.branchName} />
                  </React.Fragment>
                ))
              ) : apiError.bank ? (
                <EmptyState
                  icon={FiAlertCircle}
                  title="Failed to Load"
                  subtitle="No Data Found"
                />
              ) : (
                <EmptyState
                  icon={FiCreditCard}
                  title="No Bank Details"
                  subtitle="Bank details not added"
                />
              )}
            </Section>

            {/* SALARY – FULL ORIGINAL STRUCTURE */}
            <Section title="Salary Details" icon={FiDollarSign} color="green">
              {salary ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 col-span-full">
                  <div className="bg-green-50 rounded-lg p-4 border">
                    <h4 className="font-semibold text-green-700 mb-3">
                      Earnings
                    </h4>
                    <Money label="Basic Salary" value={salary.basicSalary} />
                    <Money label="HRA" value={salary.hra} />
                    <Money
                      label="Special Allowance"
                      value={salary.specialAllowance}
                    />
                    <Money
                      label="Conveyance"
                      value={salary.conveyanceAllowance}
                    />
                    <Money label="Bonus" value={salary.bonus} />
                    <Money label="Arrears" value={salary.arrears} />
                    <Money
                      label="Leave Encashment"
                      value={salary.leaveEncashment}
                    />
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border">
                    <h4 className="font-semibold text-red-700 mb-3">
                      Deductions
                    </h4>
                    <Money label="PF" value={salary.pfEmployee} />
                    <Money label="ESIC" value={salary.esicEmployee} />
                    <Money
                      label="Professional Tax"
                      value={salary.professionalTax}
                    />
                    <Money label="TDS" value={salary.tds} />
                    <Money
                      label="Loan Repayment"
                      value={salary.loanRepayment}
                    />
                    <Money
                      label="Other Deductions"
                      value={salary.otherDeductions}
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <h4 className="font-semibold mb-3">Salary Summary</h4>
                    <Money
                      label="Gross Earnings"
                      value={salary.grossEarnings}
                    />
                    <Money
                      label="Total Deductions"
                      value={salary.totalDeductions}
                    />
                    <div className="pt-2 border-t mt-2 flex justify-between font-bold text-green-700">
                      <span>Net Salary</span>
                      <span>₹ {salary.netSalary.toLocaleString("en-IN")}</span>
                    </div>
                    <Money label="CTC" value={salary.ctc} />
                  </div>
                </div>
              ) : apiError.salary ? (
                <EmptyState
                  icon={FiAlertCircle}
                  title="Failed to Load"
                  subtitle="Salary API error"
                />
              ) : (
                <EmptyState
                  icon={FiDollarSign}
                  title="Salary Not Configured"
                  subtitle="Salary not assigned"
                />
              )}
            </Section>

            {/* PF */}
            <Section title="PF Details" icon={FiShield} color="orange">
              {pf ? (
                <>
                  <Detail
                    icon={FiShield}
                    label="PF Number"
                    value={pf.pfNumber}
                  />
                  <Detail
                    icon={FiAlertCircle}
                    label="Opted Out"
                    value={pf.isOptedOut ? "Yes" : "No"}
                  />
                </>
              ) : apiError.pf ? (
                <EmptyState
                  icon={FiAlertCircle}
                  title="Failed to Load"
                  subtitle="PF API error"
                />
              ) : (
                <EmptyState
                  icon={FiShield}
                  title="PF Not Mapped"
                  subtitle="PF details missing"
                />
              )}
            </Section>

            {/* ESI */}
            <Section title="ESI Details" icon={FiAlertCircle} color="teal">
              {esi ? (
                <>
                  <Detail
                    icon={FiAlertCircle}
                    label="ESI Number"
                    value={esi.esiNumber}
                  />
                  <Detail
                    icon={FiAlertCircle}
                    label="Applicable"
                    value={esi.isApplicable ? "Yes" : "No"}
                  />
                </>
              ) : apiError.esi ? (
                <EmptyState
                  icon={FiAlertCircle}
                  title="Failed to Load"
                  subtitle="ESI API error"
                />
              ) : (
                <EmptyState
                  icon={FiAlertCircle}
                  title="ESI Not Applicable"
                  subtitle="Not enrolled under ESI"
                />
              )}
            </Section>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeDetails;
