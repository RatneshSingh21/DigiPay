import React, { useState } from "react";
import Select from "react-select";
import { FaPlusCircle } from "react-icons/fa";

const WorkLocationSelect = () => {
  const [options, setOptions] = useState([
    {
      value: "head_office",
      label: "Head Office ( noida,gr noida,Uttar Pradesh-201306 )",
    },
  ]);

  const [selectedOption, setSelectedOption] = useState(null);

  const handleAddNew = () => {
    const newLocation = prompt("Enter new work location:");
    if (newLocation) {
      const newOption = {
        value: newLocation.toLowerCase().replace(/\s+/g, "_"),
        label: newLocation,
      };
      setOptions([...options, newOption]);
      setSelectedOption(newOption);
    }
  };

  const customMenuList = (props) => {
    return (
      <div>
        {props.children}
        <div
          className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-blue-600"
          onClick={handleAddNew}
        >
          <FaPlusCircle className="mr-2" />
          <span>New Work Location</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-[300px]">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Work Location<span className="text-red-500">*</span>
      </label>
      <Select
        options={options}
        value={selectedOption}
        onChange={setSelectedOption}
        placeholder="Select Work Location"
        isSearchable
        components={{ MenuList: customMenuList }}
      />
    </div>
  );
};

export default WorkLocationSelect;
