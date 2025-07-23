import { motion } from "framer-motion";

export default function PreviewModal({ visible, onClose, title, data, step }) {
  if (!visible) return null;

  let lines = [];
  if (step === "basic") {
    lines = [
      `Employee Name: ${data.firstName || ""} ${data.lastName || ""}`,
      `Employee ID: ${data.employeeId || ""}`,
      `Date of Joining: ${data.dateOfJoining}`,
      `Work Email: ${data.workEmail || ""}`,
      `Mobile Number: ${data.mobileNumber || ""}`,
      `Gender: ${data.gender?.value || ""}`,
      `Work Location: ${data.workLocation?.value || ""}`,
      `Designation: ${data.designation?.value || ""}`,
      `Department: ${data.department?.value || ""}`,
    ];
  } else if (step === "salary") {
    lines = [
      `CTC: ₹${data.ctc || ""}`,
      `Basic: ₹${data.basic?.toFixed(0) || ""}`,
      `HRA: ₹${data.hra?.toFixed(0) || ""}`,
      // etc.
    ];
  } else if (step === "personal") {
    lines = [
      `DOB: ${data.dob || ""}`,
      `Father's Name: ${data.fatherName || ""}`,
      `PAN: ${data.pan || ""}`,
      // etc.
    ];
  }

  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    className="bg-gradient-to-br from-white to-gray-100 p-8 rounded-2xl shadow-2xl max-w-2xl w-full relative border border-gray-200"
  >
    <button
      onClick={onClose}
      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition duration-200 text-2xl"
      aria-label="Close"
    >
      &times;
    </button>

    <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">{title}</h3>

    <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      {lines.map((line, i) => (
        <li
          key={i}
          className="text-base text-gray-700 hover:bg-gray-100 px-3 py-2 rounded transition duration-200"
        >
          {line}
        </li>
      ))}
    </ul>
  </motion.div>
</div>

  );
}
