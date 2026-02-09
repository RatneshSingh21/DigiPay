import React from "react";
import Select from "react-select";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const BlackoutStep = ({
  blackoutDates,
  setBlackoutDates,
  leaveTypes = [],
  departments = [],
}) => {
  const addBlackout = () => {
    setBlackoutDates([
      ...blackoutDates,
      {
        title: "",
        fromDate: "",
        toDate: "",
        isFullBlock: true,
        applicableLeaveTypeIds: [],
        applicableDepartmentIds: [],
      },
    ]);
  };

  const update = (index, field, value) => {
    setBlackoutDates((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  };

  const remove = (index) => {
    setBlackoutDates((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Add */}
      <button
        type="button"
        onClick={addBlackout}
        className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100"
      >
        + Add Blackout Period
      </button>

      {blackoutDates.map((bd, index) => (
        <div key={index} className="border border-gray-200 rounded-md p-4 space-y-3 bg-gray-50">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={bd.title}
                onChange={(e) => update(index, "title", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={bd.fromDate}
                onChange={(e) => update(index, "fromDate", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={bd.toDate}
                onChange={(e) => update(index, "toDate", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={bd.isFullBlock}
                onChange={(e) => update(index, "isFullBlock", e.target.checked)}
                className="h-4 w-4"
              />
              <span>Full Block (No Leave Allowed)</span>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Applicable Leave Types
              </label>
              <Select
                isMulti
                options={leaveTypes.map((lt) => ({
                  value: lt.leaveTypeId,
                  label: lt.leaveName,
                }))}
                value={leaveTypes
                  .filter((lt) =>
                    bd.applicableLeaveTypeIds.includes(lt.leaveTypeId)
                  )
                  .map((lt) => ({
                    value: lt.leaveTypeId,
                    label: lt.leaveName,
                  }))}
                onChange={(opts) =>
                  update(
                    index,
                    "applicableLeaveTypeIds",
                    opts.map((o) => o.value)
                  )
                }
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Applicable Departments
              </label>
              <Select
                isMulti
                options={departments.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
                value={departments
                  .filter((d) =>
                    bd.applicableDepartmentIds.includes(d.id)
                  )
                  .map((d) => ({
                    value: d.id,
                    label: d.name,
                  }))}
                onChange={(opts) =>
                  update(
                    index,
                    "applicableDepartmentIds",
                    opts.map((o) => o.value)
                  )
                }
              />
            </div>
          </div>

          {/* Remove */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => remove(index)}
              className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlackoutStep;
