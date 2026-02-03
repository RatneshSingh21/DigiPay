import React, { useMemo } from "react";
import Select from "react-select";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const LeaveFilterCards = ({
  filters,
  setFilters,
  leaveTypes = [],
  statuses = [],
  employees = [],
}) => {
  const employeeOptions = useMemo(
    () =>
      employees.map((e) => ({
        value: e.id,
        label: `${e.fullName} (${e.employeeCode})`,
      })),
    [employees]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* EMPLOYEE SEARCH */}
      <div className="bg-white rounded-xl shadow p-4">
        <label className="text-sm font-medium text-gray-600">
          Employee
        </label>

        <Select
          className="mt-1 text-sm"
          options={employeeOptions}
          value={
            employeeOptions.find(
              (o) => o.value === filters.employeeId
            ) || null
          }
          onChange={(opt) =>
            setFilters((f) => ({
              ...f,
              employeeId: opt?.value || null,
              page: 1,
            }))
          }
          isClearable
          placeholder="Search employee…"
        />
      </div>
      {/* LEAVE TYPE */}
      <div className="bg-white rounded-xl shadow p-4">
        <label className="text-sm font-medium text-gray-600">
          Leave Type
        </label>

        <select
          className={inputClass}
          value={filters.leaveTypeId ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              leaveTypeId: e.target.value
                ? Number(e.target.value)
                : null,
              page: 1,
            }))
          }
        >
          <option value="">All Leave Types</option>
          {leaveTypes.map((lt) => (
            <option key={lt.leaveTypeId} value={lt.leaveTypeId}>
              {lt.leaveName}
            </option>
          ))}
        </select>
      </div>

      {/* STATUS */}
      <div className="bg-white rounded-xl shadow p-4">
        <label className="text-sm font-medium text-gray-600">
          Status
        </label>

        <select
          className={inputClass}
          value={filters.statusId ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              statusId: e.target.value
                ? Number(e.target.value)
                : null,
              page: 1,
            }))
          }
        >
          <option value="">All Status</option>
          {statuses.map((s) => (
            <option key={s.statusId} value={s.statusId}>
              {s.statusName}
            </option>
          ))}
        </select>
      </div>

      {/* FROM DATE */}
      <div className="bg-white rounded-xl shadow p-4">
        <label className="text-sm font-medium text-gray-600">
          From Date
        </label>
        <input
          type="date"
          className={inputClass}
          value={filters.fromDate ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              fromDate: e.target.value || null,
              page: 1,
            }))
          }
        />
      </div>

      

      
    </div>
  );
};

export default LeaveFilterCards;
