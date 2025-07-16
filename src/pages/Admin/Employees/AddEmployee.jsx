import assets from "../../../assets/assets";

const AddEmployee = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-white px-4 mb-3 py-20">
      <img
        src={assets.EmployeeIllustration}
        alt="Employee Onboarding"
        className="w-64 h-auto mb-6"
      />
      <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 text-center">
        Get your employees onboard
      </h1>
      <p className="text-center text-gray-600 pb-6">
        Easily onboard employees and manage payroll, benefits, and
        reimbursements—all in one place.
      </p>
      <div className="flex gap-4">
        <button className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium transition duration-200">
          Add Employee
        </button>
        <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition duration-200">
          Import Employees
        </button>
      </div>
    </div>
  );
};

export default AddEmployee;
