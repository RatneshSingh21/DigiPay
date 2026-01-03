export const idsToNames = (ids = [], map = {}) => {
  if (!Array.isArray(ids) || ids.length === 0) return "-";
  if (!map || Object.keys(map).length === 0) return ids.join(", ");

  return ids.map((id) => map[String(id)] ?? id).join(", ");
};