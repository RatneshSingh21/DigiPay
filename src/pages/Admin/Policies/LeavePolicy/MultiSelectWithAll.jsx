import React from "react";
import Select from "react-select";

const MultiSelectWithAll = ({
  label,
  list,
  labelKey,
  valueKey,
  selectedValues,
  onChange,
}) => {
  const safeList = Array.isArray(list) ? list : [];

  const options = safeList.map((i) => ({
    value: i[valueKey],
    label: i[labelKey],
  }));

  const allValues = options.map((x) => x.value);
  const isAllSelected = selectedValues.length === allValues.length;

  const selectAllOption = {
    value: "*",
    label: isAllSelected ? "Clear All" : "Select All",
  };

  const finalOptions = [selectAllOption, ...options];

  const handleSelect = (selected) => {
    if (selected?.some((s) => s.value === "*")) {
      onChange(isAllSelected ? [] : allValues);
      return;
    }
    onChange(selected.map((s) => s.value));
  };

  const selectedMapped = options.filter((opt) =>
    selectedValues.includes(opt.value)
  );

  return (
    <div>
      <label className="text-xs font-medium">{label}</label>
      <Select
        isMulti
        options={finalOptions}
        value={selectedMapped}
        onChange={handleSelect}
      />
    </div>
  );
};

export default MultiSelectWithAll;
