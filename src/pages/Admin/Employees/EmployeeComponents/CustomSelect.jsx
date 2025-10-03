import { useEffect, useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import Select from "react-select";

const CustomSelect = ({
  label,
  name,
  required,
  value,
  onChange,
  options = [],
  allowAddOption = false,
  onAddNewOption = () => {},
}) => {
  const [localOptions, setLocalOptions] = useState([]);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const handleAddNew = () => {
    onAddNewOption(name); // notify parent with field name
  };

  const CustomMenuList = (props) => (
    <div>
      {props.children}
      {allowAddOption && (
        <div
          className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-blue-600"
          onClick={handleAddNew}
        >
          <FaPlusCircle className="mr-2" />
          <span>Add New</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select
        name={name}
        options={localOptions}
        value={value}
        onChange={(selected) =>
          onChange(
            selected ? { ...selected, name } : { name, value: "", label: "" }
          )
        }
        placeholder={`Select ${label || "option"}`}
        isSearchable
        required
        // isClearable
        components={{ MenuList: CustomMenuList }}
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default CustomSelect;
