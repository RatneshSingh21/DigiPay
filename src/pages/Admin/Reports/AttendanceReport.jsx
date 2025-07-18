import React, { useRef, useState } from "react";
import { FiDownload, FiUpload } from "react-icons/fi";

const dummyTemplates = [
  {
    id: 1,
    name: "Monthly Attendance Template",
    description: "Download this Excel template to report monthly attendance.",
    fileUrl: "#",
    imageUrl: "https://placehold.co/400x200?text=Monthly+Template",
  },
  {
    id: 2,
    name: "Weekly Attendance Template",
    description: "Use this for weekly attendance submission format.",
    fileUrl: "#",
    imageUrl: "https://placehold.co/400x200?text=Weekly+Template",
  },
  {
    id: 3,
    name: "Overtime Record Template",
    description: "Tracks overtime hours for employees.",
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
            <a
              href={template.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-primary font-medium border border-primary hover:bg-primary hover:text-white transition px-3 py-2 rounded-md"
            >
              <FiDownload />
              Download Template
            </a>
          </div>
        ))}
      </div>

    </>
  );
};

export default AttendanceReport;
