import React from "react";

const EmployeeDashboard = () => {
  // This would be real fetched data from API in production
  // const { user } = useAuth(); 

  const dummyUser = {
    name: "John Doe",
    position: "Software Engineer",
    department: "Engineering",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome, {dummyUser.name} 👋</h1>
      <p><strong>Position:</strong> {dummyUser.position}</p>
      <p><strong>Department:</strong> {dummyUser.department}</p>
    </div>
  );
};

export default EmployeeDashboard;
