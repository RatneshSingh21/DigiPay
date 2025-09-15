import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👈 import icons
import Spinner from "../../../components/Spinner";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import assets from "../../../assets/assets";

const passwordRules = [
  { test: (pwd) => pwd.length >= 8, message: "At least 8 characters" },
  { test: (pwd) => /[A-Z]/.test(pwd), message: "At least 1 uppercase letter" },
  { test: (pwd) => /[a-z]/.test(pwd), message: "At least 1 lowercase letter" },
  { test: (pwd) => /[0-9]/.test(pwd), message: "At least 1 number" },
  {
    test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
    message: "At least 1 special character",
  },
];

const EmpCreatePassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState(null);

  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmError, setConfirmError] = useState("");

  // 👇 states for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Extract email & token from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      toast.error("Invalid or missing setup link.");
      navigate("/auth");
    } else {
      setToken(tokenParam);
    }
  }, [location, navigate]);

  // Validate password live
  useEffect(() => {
    const errors = passwordRules
      .filter((rule) => !rule.test(password))
      .map((rule) => rule.message);
    setPasswordErrors(errors);

    if (confirmPassword) {
      if (password !== confirmPassword) {
        setConfirmError("Passwords do not match");
      } else {
        setConfirmError("");
      }
    }
  }, [password, confirmPassword]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordErrors.length > 0) {
      toast.error("Please fix password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post("/user-auth/employee-setup-password", {
        token: token,
        newPassword: password,
      });

      toast.success(
        response.data?.message ||
          "Password created successfully! Redirecting..."
      );

      localStorage.setItem("loginRole", "Employee");
      navigate("/auth");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to setup password. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${assets.Landingbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Card */}
      <div className="relative w-11/12 max-w-md bg-white shadow-2xl rounded-2xl p-6 sm:p-8 z-10">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 text-gray-800">
          Create Your Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Enter Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} 
                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Password validation messages */}
            <div className="mt-2 text-xs">
              <p className="mb-2 font-medium text-gray-700">
                Password must contain:
              </p>
              <ul className="space-y-1">
                {passwordRules.map((rule, i) => {
                  const passed = !passwordErrors.includes(rule.message);
                  return (
                    <li key={i} className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 flex items-center justify-center rounded-full text-white text-[10px] ${
                          passed ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {passed ? "✓" : "✕"}
                      </span>
                      <span
                        className={passed ? "text-green-600" : "text-red-500"}
                      >
                        {rule.message}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"} 
                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {confirmError && (
              <p className="text-red-500 text-sm mt-1">{confirmError}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-orange-500 text-white rounded-lg flex items-center cursor-pointer justify-center gap-2 hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading && <Spinner />}
            Create Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmpCreatePassword;