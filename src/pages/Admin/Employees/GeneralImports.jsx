import React, { useRef } from "react";
import { FiDownload, FiUpload, FiUsers } from "react-icons/fi";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const data = [
  {
    id: 1,
    name: "Basic Detail",
    importApi: "/Employee/importley",
    exportApi: "/Employee/export",
  },
  {
    id: 2,
    name: "Salary Details",
    importApi: "/Salary/ImportSalary",
    exportApi: "/Salary/ExportAllSalaries",
  },
  {
    id: 3,
    name: "Personal Details",
    importApi: "/Employee/import-personal",
    exportApi: "/Employee/export-personal",
  },
  {
    id: 4,
    name: "Payment Info",
    importApi: "/Employee/import-payment",
    exportApi: "/Employee/export-payment",
  },
];

export default function GeneralImports() {
  const fileInputRef = useRef(null);

  const handleImport = (item) => {
    fileInputRef.current.click();2
    fileInputRef.current.dataset.fieldName = item.name;
    fileInputRef.current.dataset.importApi = item.importApi;
  };
  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fieldName = event.target.dataset.fieldName;
      const importApi = event.target.dataset.importApi;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosInstance.post(importApi, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(`"${file.name}" imported successfully for ${fieldName}`);
        console.log("Import response:", response.data);
      } catch (error) {
      console.error("Import failed:", error);

      let errorMsg = "Failed to import file.";
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          errorMsg = parsed.message || parsed.error || text;
        } catch {
          errorMsg = await error.response.data.text();
        }
      } else {
        errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data ||
          error.message;
      }

      toast.error(`Import failed for ${fieldName}: ${errorMsg}`);
    }
    }
    event.target.value = "";
  };

  const handleExport = async (exportApi, fieldName) => {
    try {
      const response = await axiosInstance.get(exportApi, {
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      let fileName = `${fieldName}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename\*=UTF-8''(.+)|filename="?([^"]+)"?/
        );
        if (match) {
          fileName = decodeURIComponent(match[1] || match[2]);
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`"${fileName}" exported successfully`);
    } catch (error) {
    console.error("Export failed:", error);

    let errorMsg = "Failed to export data.";
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const parsed = JSON.parse(text);
        errorMsg = parsed.message || parsed.error || text;
      } catch {
        errorMsg = await error.response.data.text();
      }
    } else {
      errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data ||
        error.message;
    }

    toast.error(`Export failed for ${fieldName}: ${errorMsg}`);
  }
  };
  return (
    <div className="bg-white">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      {/* Header */}
      <div className="px-4 py-3 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
        <h2 className="font-semibold text-xl flex items-center gap-2">
          <FiUsers className="text-primary" /> General Imports
        </h2>
      </div>

      {/* Table */}
      <div className="p-4">
        <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left w-1/2">Field Name</th>
              <th className="p-3 text-center w-1/4">Import</th>
              <th className="p-3 text-center w-1/4">Export</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 1 ? "bg-gray-50" : "bg-white"}
              >
                <td className="p-3">{item.name}</td>
                <td className="p-3 text-center flex justify-center">
                  <button
                    onClick={() => handleImport(item)}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md shadow-sm transition"
                  >
                    <FiDownload className="h-4 w-4" />
                    Import
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleExport(item.exportApi, item.name)}
                    className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md shadow-sm transition"
                  >
                    <FiUpload className="h-4 w-4" />
                    Export
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// import React, { useRef } from "react";
// import { FiDownload, FiUpload, FiUsers } from "react-icons/fi";

// const data = [
//   { id: 1, name: "Basic Detail" },
//   { id: 2, name: "Salary Details" },
//   { id: 3, name: "Personal Details" },
//   { id: 4, name: "Payment Info" },
// ];

// export default function GeneralImports() {
//   const fileInputRef = useRef(null);

//   const handleImport = (name) => {
//     // Open file picker
//     fileInputRef.current.click();

//     // Store the name for later processing if needed
//     fileInputRef.current.dataset.fieldName = name;
//   };

//   const onFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const fieldName = event.target.dataset.fieldName;
//       alert(`File "${file.name}" imported for ${fieldName}`);
//       // You can add your actual import logic here (read file, send to API, etc.)
//     }
//     event.target.value = ""; // reset so same file can be chosen again
//   };

//   const handleExport = (name) => {
//     // Example: create and download a dummy file
//     const content = `This is exported data for ${name}`;
//     const blob = new Blob([content], { type: "text/plain" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `${name.replace(/\s+/g, "_")}.txt`;
//     link.click();
//   };

//   return (
//     <div className="bg-white">
//       {/* Hidden file input for import */}
//       <input
//         type="file"
//         ref={fileInputRef}
//         style={{ display: "none" }}
//         onChange={onFileChange}
//       />

//       {/* Header */}
//       <div className="px-4 py-3 shadow sticky top-14 bg-white z-10 flex justify-between items-center">
//         <h2 className="font-semibold text-xl flex items-center gap-2">
//           <FiUsers className="text-primary" /> General Imports
//         </h2>
//       </div>

//       {/* Table */}
//       <div className="p-4">
//         <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
//           <thead>
//             <tr className="bg-gray-100 text-gray-700">
//               <th className="p-3 text-left w-1/2">Field Name</th>
//               <th className="p-3 text-center w-1/4">Import</th>
//               <th className="p-3 text-center w-1/4">Export</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((item, index) => (
//               <tr
//                 key={item.id}
//                 className={index % 2 === 1 ? "bg-gray-50" : "bg-white"}
//               >
//                 <td className="p-3 ">{item.name}</td>
//                 <td className="p-3 text-center flex justify-center">
//                   <button
//                     onClick={() => handleImport(item.name)}
//                     className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md shadow-sm transition"
//                   >
//                     <FiDownload className="h-4 w-4" />
//                     Import
//                   </button>
//                 </td>
//                 <td className="p-3 text-center ">
//                   <button
//                     onClick={() => handleExport(item.name)}
//                     className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md shadow-sm transition"
//                   >
//                     <FiUpload className="h-4 w-4" />
//                     Export
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
