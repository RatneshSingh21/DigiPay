import React from "react";
import SalaryConfig from "../Salary/SalaryConfig";

const Salary = () => {
  return (
    <>
      <div className="px-4 py-3 shadow sticky top-14 bg-white z-10">
        <h2 className="font-semibold text-xl">Salary Configuration</h2>
      </div>
      <div>
        <SalaryConfig/>
      </div>
    </>
  );
};

export default Salary;
