import React, { useRef, useState } from "react";
import EditTemplateModal from "../AttendanceReport/EditTemplateModal";
import { FiDownload, FiEdit2 } from "react-icons/fi";
import assets from "../../../assets/assets";

const dummyTemplates = [
  {
    id: 1,
    name: "Single Employee Salary Register",
    description: "Download this Excel template to report any employee.",
    fileUrl: "#",
    imageUrl: assets.SingleEmployeeSalaryReport,
  },
  {
    id: 2,
    name: "All Employees Salary Register",
    description: "Use this for all employees submission format.",
    fileUrl: "#",
    imageUrl: assets.AllEmployeesSalaryReport,
  },
];

const allEmployeesData = [
  {
    EmpCode: "EMP001",
    EmployeeName: "Rahul Verma",
    Branch: "Mumbai",
    Department: "Development",
    Designation: "Frontend Developer",
    Gender: "Male",
    PANNo: "ABCDE1234F",
    PFNo: "PF001",
    UANNo: "UAN001",
    ESICNo: "ESIC001",
    PayMode: "Bank Transfer",
    EmployerBank: "HDFC",
    EmployeeBank: "SBI",
    AccNo: "1234567890",
    IFSCCode: "SBIN0001234",
    BankBranch: "Andheri West",
    Rate: {
      basic: "25000",
      DA: "5000",
      HRA: "40%",
      conveyance: "15%",
      med: "500",
      ot: "20%",
      total: "50000",
    },
    Earnings: {
      basic: 25000,
      DA: 5000,
      HRA: 10000,
      conveyance: 4000,
      med: 2000,
      ot: 3200,
      total: 49200,
      specialAllowance: 3000,
    },
    Deductions: {
      TDS: 1000,
      PF: 1800,
      ESIC: 400,
      Loan: 2000,
      Advanced: 1000,
      total: 6200,
    },
    NetPay: 46000,
  },
  {
    EmpCode: "EMP002",
    EmployeeName: "Sneha Sharma",
    Branch: "Bangalore",
    Department: "Marketing",
    Designation: "Marketing Manager",
    Gender: "Female",
    PANNo: "XYZAB6789K",
    PFNo: "PF002",
    UANNo: "UAN002",
    ESICNo: "ESIC002",
    PayMode: "Cheque",
    EmployerBank: "ICICI",
    EmployeeBank: "Axis Bank",
    AccNo: "9876543210",
    IFSCCode: "UTIB0004567",
    BankBranch: "MG Road",
    Rate: {
      basic: "30000",
      DA: "6000",
      HRA: "35%",
      conveyance: "10%",
      med: "800",
      ot: "15%",
      total: "55000",
    },
    Earnings: {
      basic: 30000,
      DA: 6000,
      HRA: 10500,
      conveyance: 3000,
      med: 1500,
      ot: 2500,
      total: 53500,
      specialAllowance: 2000,
    },
    Deductions: {
      TDS: 1500,
      PF: 2000,
      ESIC: 500,
      Loan: 1500,
      Advanced: 800,
      total: 6300,
    },
    NetPay: 47200,
  },
  {
    EmpCode: "EMP003",
    EmployeeName: "Amit Patel",
    Branch: "Ahmedabad",
    Department: "Sales",
    Designation: "Sales Executive",
    Gender: "Male",
    PANNo: "AMTPX1234L",
    PFNo: "PF003",
    UANNo: "UAN003",
    ESICNo: "ESIC003",
    PayMode: "UPI",
    EmployerBank: "SBI",
    EmployeeBank: "Kotak",
    AccNo: "3216549870",
    IFSCCode: "KKBK0001234",
    BankBranch: "Navrangpura",
    Rate: {
      basic: "22000",
      DA: "3000",
      HRA: "30%",
      conveyance: "8%",
      med: "400",
      ot: "10%",
      total: "40000",
    },
    Earnings: {
      basic: 22000,
      DA: 3000,
      HRA: 6600,
      conveyance: 1600,
      med: 1200,
      ot: 2200,
      total: 36600,
      specialAllowance: 2400,
    },
    Deductions: {
      TDS: 800,
      PF: 1600,
      ESIC: 300,
      Loan: 1000,
      Advanced: 500,
      total: 4200,
    },
    NetPay: 34800,
  },
  {
    EmpCode: "EMP004",
    EmployeeName: "Priya Desai",
    Branch: "Pune",
    Department: "HR",
    Designation: "HR Executive",
    Gender: "Female",
    PANNo: "PRYD5678Z",
    PFNo: "PF004",
    UANNo: "UAN004",
    ESICNo: "ESIC004",
    PayMode: "Cash",
    EmployerBank: "Yes Bank",
    EmployeeBank: "HDFC",
    AccNo: "5678901234",
    IFSCCode: "HDFC0004321",
    BankBranch: "Shivajinagar",
    Rate: {
      basic: "28000",
      DA: "4000",
      HRA: "38%",
      conveyance: "12%",
      med: "600",
      ot: "18%",
      total: "47000",
    },
    Earnings: {
      basic: 28000,
      DA: 4000,
      HRA: 10640,
      conveyance: 3360,
      med: 1800,
      ot: 3240,
      total: 50040,
      specialAllowance: 1500,
    },
    Deductions: {
      TDS: 1200,
      PF: 1700,
      ESIC: 350,
      Loan: 1800,
      Advanced: 700,
      total: 5750,
    },
    NetPay: 45500,
  },
  {
    EmpCode: "EMP005",
    EmployeeName: "Rohan Gupta",
    Branch: "Delhi",
    Department: "IT",
    Designation: "Backend Developer",
    Gender: "Male",
    PANNo: "ROHG8901A",
    PFNo: "PF005",
    UANNo: "UAN005",
    ESICNo: "ESIC005",
    PayMode: "Bank Transfer",
    EmployerBank: "BOB",
    EmployeeBank: "PNB",
    AccNo: "4567890123",
    IFSCCode: "PUNB0123456",
    BankBranch: "Connaught Place",
    Rate: {
      basic: "27000",
      DA: "5500",
      HRA: "32%",
      conveyance: "14%",
      med: "700",
      ot: "12%",
      total: "48000",
    },
    Earnings: {
      basic: 27000,
      DA: 5500,
      HRA: 8640,
      conveyance: 3780,
      med: 1600,
      ot: 2880,
      total: 49300,
      specialAllowance: 1200,
    },
    Deductions: {
      TDS: 1100,
      PF: 1750,
      ESIC: 450,
      Loan: 1600,
      Advanced: 600,
      total: 5500,
    },
    NetPay: 43800,
  },
];

const SalaryRegister = () => {
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplateData, setSelectedTemplateData] = useState([]);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [viewType, setViewType] = useState("");

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      // You can add upload logic here (e.g., upload to server)
      console.log("Selected file:", file.name);
    }
  };

  const handleEdit = (templateId) => {
    const type = templateId === 1 ? "salary" : "allSalary";

    setViewType(type);
    setSelectedTemplateData(allEmployeesData);

    setFieldOptions([
      "EmpCode",
      "EmployeeName",
      "Branch",
      "Department",
      "Designation",
      "Gender",
      "PANNo",
      "PFNo",
      "UANNo",
      "ESICNo",
      "PayMode",
      "EmployerBank",
      "EmployeeBank",
      "AccNo",
      "IFSCCode",
      "BankBranch",
      "Rate",
      "Earnings",
      "Deductions",
      "NetPay",
    ]);

    setShowModal(true);
  };

  const handleTemplateDownload = (template) => {
    switch (template.id) {
      case 1:
        if (assets.SingleEmployeeSalaryReport) {
          triggerDownload(
            assets.SingleEmployeeSalaryReport,
            "Salary_Report_Template.jpg"
          );
        }
        break;

      case 2:
        if (assets.AllEmployeesSalaryReport) {
          triggerDownload(
            assets.AllEmployeesSalaryReport,
            "Salary_Report_Template.jpg"
          );
        }
        break;

      default:
        if (template.fileUrl) {
          window.open(template.fileUrl, "_blank");
        }
        break;
    }
  };

  const triggerDownload = (fileUrl, filename) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="p-4 shadow mb-5 sticky top-14 bg-white z-10">
        <h2 className="font-semibold text-xl">Salary Register Templates</h2>
      </div>

      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {dummyTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white p-4 shadow rounded-xl border border-gray-100 flex flex-col justify-between"
          >
            <img
              src={template.imageUrl}
              alt="Template Preview"
              className="rounded-md mb-3 w-full h-40 object-cover"
            />
            <div>
              <h3 className="text-lg font-medium mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
            <button
              onClick={() => handleTemplateDownload(template)}
              className="mt-4 flex items-center justify-center gap-2 text-primary font-medium border border-primary hover:bg-primary hover:text-white transition px-3 py-2 rounded-md"
            >
              <FiDownload />
              Download Preview
            </button>
            <button
              className="mt-4 flex items-center gap-2 justify-center text-primary font-medium border border-primary hover:bg-primary hover:text-white transition px-3 py-2 rounded-md"
              onClick={() => handleEdit(template.id)}
            >
              <FiEdit2 className="inline mr-0.5" />
              Edit Template
            </button>
          </div>
        ))}
        {showModal && (
          <EditTemplateModal
            onClose={() => setShowModal(false)}
            templateData={selectedTemplateData}
            fieldOptions={fieldOptions}
            viewType={viewType}
          />
        )}
      </div>
    </>
  );
};

export default SalaryRegister;
