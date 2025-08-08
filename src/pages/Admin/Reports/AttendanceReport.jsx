import React, { useRef, useState } from "react";
import { FiDownload, FiUpload, FiEdit2 } from "react-icons/fi";
import EditTemplateModal from "../AttendanceReport/EditTemplateModal";
import assets from "../../../assets/assets";

const dummyTemplates = [
  {
    id: 1,
    name: "Daily Attendance Template",
    description: "Download this Excel template to report daily attendance.",
    fileUrl: "#",
    imageUrl: assets.SampleAttendance,
  },
  {
    id: 2,
    name: "Weekly Attendance Template",
    description: "Use this for Weekly attendance submission format.",
    fileUrl: "#",
    imageUrl: "https://placehold.co/400x200?text=Weekly+Template",
  },
  {
    id: 3,
    name: "Monthly Record Template",
    description: "Use this for monthly attendance submission format.",
    fileUrl: "#",
    imageUrl: "https://placehold.co/400x200?text=Overtime+Template",
  },
  {
    id: 4,
    name: "Leave Summary Template",
    description: "Document employee leave usage by period.",
    fileUrl: "#",
    imageUrl: "https://placehold.co/400x200?text=Leave+Summary",
  },
];

const AttendanceReport = () => {
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
      console.log("Selected file:", file.name);
    }
  };

  const handleEdit = (templateId) => {
    let dummyData = [];
    let dynamicFields = [];
    let type = "";

    switch (templateId) {
      case 1: // Daily Attendance
        type = "daily";
        dummyData = [
          {
            EmpCode: "EMP001",
            EmpName: "Akrit Ujjainiya",
            Dept: "IT",
            EmpType: "Full Time",
            Shift: "Morning",
            inTime: "09:30",
            OutTime: "18:30",
            WorkingHours: "6",
            Status: "Present",
            OTHours: "0",
          },
          {
            EmpCode: "EMP002",
            EmpName: "Nitish Yadav",
            Dept: "IT",
            EmpType: "Full Time",
            Shift: "Morning",
            inTime: "09:00",
            OutTime: "18:00",
            WorkingHours: "9",
            Status: "Present",
            OTHours: "1",
          },
          {
            EmpCode: "EMP003",
            EmpName: "Rahul Sharma",
            Dept: "HR",
            EmpType: "Part Time",
            Shift: "Evening",
            inTime: "13:00",
            OutTime: "19:00",
            WorkingHours: "6",
            Status: "Present",
            OTHours: "0",
          },
          {
            EmpCode: "EMP001",
            EmpName: "Amit Verma",
            Dept: "Engineering",
            EmpType: "Full Time",
            Shift: "Morning",
            inTime: "09:00",
            OutTime: "17:00",
            WorkingHours: "8",
            Status: "Present",
            OTHours: "1",
          },
          {
            EmpCode: "EMP002",
            EmpName: "Priya Singh",
            Dept: "Sales",
            EmpType: "Full Time",
            Shift: "Morning",
            inTime: "09:30",
            OutTime: "18:00",
            WorkingHours: "8.5",
            Status: "Late",
            OTHours: "0",
          },
          {
            EmpCode: "EMP003",
            EmpName: "Rahul Sharma",
            Dept: "HR",
            EmpType: "Part Time",
            Shift: "Evening",
            inTime: "13:00",
            OutTime: "19:00",
            WorkingHours: "6",
            Status: "Present",
            OTHours: "0",
          },
          {
            EmpCode: "EMP004",
            EmpName: "Sneha Patel",
            Dept: "Finance",
            EmpType: "Full Time",
            Shift: "Morning",
            inTime: "08:45",
            OutTime: "17:15",
            WorkingHours: "8.5",
            Status: "Present",
            OTHours: "0.5",
          },
          {
            EmpCode: "EMP005",
            EmpName: "Ravi Kumar",
            Dept: "Support",
            EmpType: "Contract",
            Shift: "Night",
            inTime: "21:00",
            OutTime: "05:00",
            WorkingHours: "8",
            Status: "Present",
            OTHours: "2",
          },
          {
            EmpCode: "EMP006",
            EmpName: "Divya Mehta",
            Dept: "Marketing",
            EmpType: "Full Time",
            Shift: "Morning",
            inTime: "10:00",
            OutTime: "18:00",
            WorkingHours: "8",
            Status: "Late",
            OTHours: "0",
          },
          {
            EmpCode: "EMP007",
            EmpName: "Anil Joshi",
            Dept: "Engineering",
            EmpType: "Full Time",
            Shift: "Morning",
            inTime: "09:00",
            OutTime: "17:00",
            WorkingHours: "8",
            Status: "Present",
            OTHours: "1",
          },
          {
            EmpCode: "EMP008",
            EmpName: "Nisha Rana",
            Dept: "HR",
            EmpType: "Intern",
            Shift: "Morning",
            inTime: "10:30",
            OutTime: "16:30",
            WorkingHours: "6",
            Status: "Present",
            OTHours: "0",
          },
          {
            EmpCode: "EMP009",
            EmpName: "Kunal Bhatia",
            Dept: "Engineering",
            EmpType: "Full Time",
            Shift: "Morning",
            inTime: "09:10",
            OutTime: "17:10",
            WorkingHours: "8",
            Status: "Late",
            OTHours: "0.5",
          },
          {
            EmpCode: "EMP010",
            EmpName: "Meera Iyer",
            Dept: "Sales",
            EmpType: "Full Time",
            Shift: "Morning",
            inTime: "09:00",
            OutTime: "17:00",
            WorkingHours: "8",
            Status: "Present",
            OTHours: "0",
          },
        ];
        dynamicFields = [
          "EmpCode",
          "EmpName",
          "Dept",
          "EmpType",
          "Shift",
          "inTime",
          "OutTime",
          "WorkingHours",
          "Status",
          "OTHours",
        ];
        break;

      case 2: // Weekly Attendance
        type = "weekly";
        dummyData = [
          /* Weekly dummy data */
        ];
        dynamicFields = [
          "EmpCode",
          "EmpName",
          "Dept",
          "EmpType",
          "Shift",
          "inTime",
          "OutTime",
          "WorkingHours",
          "Status",
          "OTHours",
        ];
        break;

      case 3: // Monthly Record
        type = "monthly";
        dummyData = [
          {
            EmpCode: "EMP001",
            EmpName: "Akrit Ujjainiya",
            Dept: "IT",
            Designation: "Developer",
            "01": "P",
            "02": "P",
            "03": "P",
            "04": "A",
            "05": "P",
            "06": "L",
            Pres: 20,
            Wee: 4,
            Holi: 2,
            Lea: 1,
            Abs: 3,
            P_Day: 26,
            OTHour: 5,
            // ... up to "31" if needed
          },
        ];
        dynamicFields = [
          "EmpCode",
          "EmpName",
          "Dept",
          "Designation",
          "Pres",
          "Wee",
          "Holi",
          "Lea",
          "Abs",
          "P_Day",
          "OTHour",
          // (date-wise values like "01", "02", etc. can be excluded intentionally)
        ];
        break;

      case 4: // Leave Summary
        dummyData = [
          /* Leave Summary data */
        ];
        break;

      default:
        type = "";
        dummyData = [];
        dynamicFields = [];
    }

    setViewType(type);
    setSelectedTemplateData(dummyData);
    setFieldOptions(dynamicFields);
    setShowModal(true);
  };

  const handleTemplateDownload = (template) => {
    switch (template.id) {
      case 1:
        if (assets.SampleAttendance) {
          triggerDownload(
            assets.SampleAttendance,
            "Daily_Attendance_Template.jpg"
          );
        }
        break;

      case 2:
        if (assets.sampleShift) {
          triggerDownload(assets.sampleShift, "Shift_Template.xlsx");
        }
        break;

      case 3:
        if (assets.sampleHoliday) {
          triggerDownload(assets.sampleHoliday, "Holiday_Template.jpg");
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
        <h2 className="font-semibold text-xl">Attendance Report Templates</h2>
      </div>

      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
              className="mt-4 flex items-center gap-2 text-primary font-medium border border-primary hover:bg-primary hover:text-white transition px-3 py-2 rounded-md"
            >
              <FiDownload />
              Download Template
            </button>
            <button
              className="mt-4 flex items-center gap-2 text-primary font-medium border border-primary hover:bg-primary hover:text-white transition px-3 py-2 rounded-md"
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

export default AttendanceReport;