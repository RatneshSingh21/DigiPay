// normalizeLeaveTypeKey.js

export const normalizeLeaveTypeKey = (leave) => {
  if (!leave) return null;

  // 1️⃣ If backend already sends a code (best case)
  if (leave.leaveCode) {
    return leave.leaveCode.toUpperCase();
  }

  // 2️⃣ Normalize from leave name (fallback)
  const name = (leave.leaveName || leave.name || "").toLowerCase();

  if (name.includes("casual")) return "CL";
  if (name.includes("sick")) return "SL";
  if (name.includes("earned")) return "EL";
  if (name.includes("without pay") || name.includes("lop")) return "LWP";
  if (name.includes("comp")) return "CO";
  if (name.includes("maternity")) return "ML";
  if (name.includes("paternity")) return "PL";
  if (name.includes("restricted")) return "RH";
  if (name.includes("bereavement")) return "BL";
  if (name.includes("marriage")) return "MRL";
  if (name.includes("adoption")) return "AL";

  // 3️⃣ Unknown / future leave
  return null;
};