import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import assets from "../../../assets/assets";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const resetToken = state?.resetToken;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  // If session is invalid, redirect
  if (!resetToken) {
    toast.error("Invalid password reset session.");
    navigate("/auth/forgot-password");
  }

  const validatePassword = (password) => {
    const strongRegex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return strongRegex.test(password);
  };

  // Live validation for password
  useEffect(() => {
    if (!newPassword) {
      setPasswordError("");
    } else if (!validatePassword(newPassword)) {
      setPasswordError(
        "At least 8 characters, 1 uppercase letter, 1 number, and 1 special character."
      );
    } else {
      setPasswordError("");
    }
  }, [newPassword]);

  // Live validation for confirm password
  useEffect(() => {
    if (!confirmPassword) {
      setConfirmError("");
    } else if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match.");
    } else {
      setConfirmError("");
    }
  }, [confirmPassword, newPassword]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError || confirmError) return;

    try {
      setLoading(true);

      await axiosInstance.post("/user-auth/reset-password-with-token", {
        resetToken,
        newPassword,
      });

      toast.success("Password reset successfully! Please log in.");
      navigate("/auth");
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.response?.data?.title ||
          "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center"
      style={{
        backgroundImage: `url(${assets.Landingbg})`,
        backgroundSize: "cover",
      }}
    >
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl z-10">
        <img
          src={assets.ResetImage || assets.ForgetImage}
          alt="Reset Password"
          className="w-24 mx-auto mb-4"
        />

        <h2 className="text-xl font-semibold text-center mb-1">
          Reset Password
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6 px-2">
          Enter and confirm your new password.
        </p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="mb-2 relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              className={`w-full py-2 pl-4 pr-10 border ${
                passwordError ? "border-red-500" : "border-gray-300"
              } rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-red-500 mb-3">{passwordError}</p>
          )}

          {/* Confirm Password */}
          <div className="mb-2 relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className={`w-full py-2 pl-4 pr-10 border ${
                confirmError ? "border-red-500" : "border-gray-300"
              } rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {confirmError && (
            <p className="text-xs text-red-500 mb-4">{confirmError}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-orange-500 text-white py-2 rounded-full shadow-md hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {loading ? <Spinner /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
