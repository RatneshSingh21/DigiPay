import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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

const EmpResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [passwordErrors, setPasswordErrors] = useState([]);
  const [confirmError, setConfirmError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* 🔹 Extract resetToken from URL */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      toast.error("Invalid or expired reset link.");
      navigate("/auth");
      return;
    }

    setResetToken(token);
  }, [location, navigate]);

  /* 🔹 Live validation */
  useEffect(() => {
    const errors = passwordRules
      .filter((rule) => !rule.test(password))
      .map((rule) => rule.message);

    setPasswordErrors(errors);

    if (confirmPassword && password !== confirmPassword) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  }, [password, confirmPassword]);

  /* 🔹 Submit handler */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordErrors.length > 0 || confirmError) {
      toast.error("Please fix the password issues.");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post(
        "/user-auth/employee/reset-password",
        {
          resetToken,
          newPassword: password,
        },
      );

      toast.success(res.data?.message || "Password reset successful!");

      localStorage.setItem("loginRole", "Employee");

      setTimeout(() => {
        navigate("/auth");
      }, 1500);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Reset link expired or invalid. Please request again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    loading ||
    passwordErrors.length > 0 ||
    !password ||
    !confirmPassword ||
    confirmError;

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${assets.Landingbg})` }}
    >
      <div className="w-11/12 max-w-md bg-white shadow-2xl rounded-2xl p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
          Reset Password
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Create a strong password to secure your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* Rules */}
            <ul className="mt-3 space-y-1 text-xs">
              {passwordRules.map((rule, i) => {
                const passed = !passwordErrors.includes(rule.message);
                return (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center ${
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

          {/* Confirm */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {confirmError && (
              <p className="text-red-500 text-xs mt-1">{confirmError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-2 bg-orange-500 text-white rounded-lg cursor-pointer flex justify-center gap-2 hover:bg-orange-600 disabled:opacity-50"
          >
            {loading && <Spinner />}
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmpResetPassword;
