import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import Select from "react-select";
import { Eye, EyeOff } from "lucide-react";

const CreateAdminForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    emailOrPhone: "",
    password: "",
    role: "SuperAdmin",
  });

  const roleOptions = [
    { value: "SuperAdmin", label: "SuperAdmin" },
    { value: "Admin", label: "Admin" },
    { value: "User", label: "User" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      role: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post("/user-auth/superadmin-create-user", formData);
      toast.success("Superadmin User Created Successfully");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      emailOrPhone: "",
      password: "",
      role: "",
    });
  };

  const inputClass =
    "w-full px-3 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#93c5fd",
      minHeight: "36px",
      fontSize: "0.875rem",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#3b82f6" : "white",
      color: state.isSelected ? "white" : "black",
      fontSize: "0.875rem",
    }),
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute cursor-pointer top-4 right-4 text-gray-600 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Create Admin
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Name"
              autoFocus
              required
              className={inputClass}
            />
          </div>

          {/* Email or Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email or Phone<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              placeholder="Enter Email or Phone"
              required
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-1">
              Password<span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password"
              required
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute cursor-pointer right-3 top-9 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Role<span className="text-red-500">*</span>
            </label>
            <Select
              options={roleOptions}
              value={roleOptions.find((opt) => opt.value === formData.role)}
              onChange={handleRoleChange}
              placeholder="Select Role"
              styles={customSelectStyles}
              isClearable
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-start gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 cursor-pointer rounded-lg text-sm text-white ${
                loading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-primary hover:bg-secondary"
              }`}
            >
              {loading ? <Spinner /> : "Save"}
            </button>

            <button
              type="reset"
              onClick={handleReset}
              className="border text-sm cursor-pointer border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100"
            >
              Clear
            </button>
          </div>

          <p className="text-sm text-red-500 mt-1">
            * Indicates mandatory fields
          </p>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminForm;
