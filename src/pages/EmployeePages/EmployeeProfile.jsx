import React from "react";

const EmployeeProfile = () => {
  // In real scenario, fetch user profile data
  // const { userProfile } = useEmployeeProfile(); 

  const dummyProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    address: "123 Street, New Delhi, India",
    dob: "1995-04-15",
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Employee Profile</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {dummyProfile.name}</p>
        <p><strong>Email:</strong> {dummyProfile.email}</p>
        <p><strong>Phone:</strong> {dummyProfile.phone}</p>
        <p><strong>Address:</strong> {dummyProfile.address}</p>
        <p><strong>Date of Birth:</strong> {dummyProfile.dob}</p>
      </div>
    </div>
  );
};

export default EmployeeProfile;
