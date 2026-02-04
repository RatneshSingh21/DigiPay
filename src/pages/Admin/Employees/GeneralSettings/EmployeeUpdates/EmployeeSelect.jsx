import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import Select from "react-select";

const EMP_LIST_ENDPOINT = "/Employee";

const EmployeeSelect = ({ value, onSelect }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const filterOption = (option, inputValue) => {
    if (!inputValue) return true;

    const search = inputValue.toLowerCase();

    const name = option.data.employeeName?.toLowerCase() || "";
    const code = option.data.employeeCode?.toLowerCase() || "";
    const combined = `${name} ${code}`;

    return (
      name.includes(search) ||
      code.includes(search) ||
      combined.includes(search)
    );
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(EMP_LIST_ENDPOINT);

        const items = (res.data?.items || res.data || []).map((e) => ({
          value: e.id || e.employeeId || e.EmployeeId,
          label: e.fullName, // NAME ONLY
          employeeName: e.fullName, // explicit
          employeeCode: e.employeeCode, // explicit
        }));

        setList(items);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex flex-col gap-2 w-fit">
      <label className="text-sm font-medium text-gray-700">
        Select Employee
      </label>

      <Select
        options={list}
        value={list.find((opt) => opt.value === value) || null}
        onChange={(selected) => onSelect?.(selected || null)}
        isLoading={loading}
        isClearable
        autoFocus
        placeholder={loading ? "Loading…" : "Choose an employee"}
        className="z-10"
        filterOption={filterOption} //  THIS IS THE FIX
        formatOptionLabel={(opt) => (
          <div className="flex gap-2">
            <span>{opt.employeeName}</span>
            <span className="text-gray-500">({opt.employeeCode})</span>
          </div>
        )}
        styles={{
          control: (base) => ({
            ...base,
            minWidth: "280px",
            borderColor: "#d1d5db",
          }),
        }}
      />
    </div>
  );
};

export default EmployeeSelect;
