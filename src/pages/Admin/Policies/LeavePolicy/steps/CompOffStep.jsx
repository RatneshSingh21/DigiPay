import React from "react";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const CompOffStep = ({ compOffRule, setCompOffRule }) => {
  return (
    <div>
      {/* ENABLE COMP OFF */}
      <label className="flex items-center gap-2 mb-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={compOffRule.isEnabled}
          onChange={(e) =>
            setCompOffRule({ ...compOffRule, isEnabled: e.target.checked })
          }
        />
        Enable Comp Off
      </label>

      {/* COMP OFF RULES */}
      {compOffRule.isEnabled && (
        <div className="flex flex-col gap-4 mt-2">
          {/* EXPIRY DAYS */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <label className="text-sm text-gray-600">Expiry Days</label>
            <input
              type="number"
              value={compOffRule.expiryInDays}
              onChange={(e) =>
                setCompOffRule({
                  ...compOffRule,
                  expiryInDays: +e.target.value,
                })
              }
              className={inputClass}
            />
          </div>

          {/* ALLOW ON HOLIDAY */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={compOffRule.allowOnHoliday}
              onChange={(e) =>
                setCompOffRule({
                  ...compOffRule,
                  allowOnHoliday: e.target.checked,
                })
              }
            />
            Allow on Holiday
          </label>

          {/* ALLOW ON WEEKEND */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={compOffRule.allowOnWeekend}
              onChange={(e) =>
                setCompOffRule({
                  ...compOffRule,
                  allowOnWeekend: e.target.checked,
                })
              }
            />
            Allow on Weekend
          </label>
        </div>
      )}
    </div>
  );
};

export default CompOffStep;
