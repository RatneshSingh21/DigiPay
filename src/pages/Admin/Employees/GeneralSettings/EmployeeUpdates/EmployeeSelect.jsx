import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../../../axiosInstance/axiosInstance";
import Select from "react-select";

const EMP_LIST_ENDPOINT = "/Employee";

const EmployeeSelect = ({ value, onSelect }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(EMP_LIST_ENDPOINT);
        // Expecting an array of employees. Map to uniform shape for react-select
        const items = (res.data?.items || res.data || []).map((e) => ({
          value: e.id || e.employeeId || e.EmployeeId,
          label: `${e.fullName} ${e.employeeCode ? `(${e.employeeCode})` : ""}`,
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
      <label className="text-sm font-medium text-gray-700">Select Employee</label>
      <Select
        options={list}
        value={list.find((opt) => opt.value === value) || null}
        onChange={(selected) => onSelect?.(selected || null)}
        isLoading={loading}
        isClearable
        autoFocus
        placeholder={loading ? "Loading…" : "Choose an employee"}
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
