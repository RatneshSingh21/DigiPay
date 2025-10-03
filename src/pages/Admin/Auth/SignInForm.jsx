import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import assets from "../../../assets/assets";
import Spinner from "../../../components/Spinner"; // assuming you already have this
import { useNavigate } from "react-router-dom";

export default function SignInForm({ switchToSignUp }) {
  const navigate = useNavigate(); // for redirecting after login

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { emailOrPhone, password } = formData;

    if (!emailOrPhone || !password) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/user-auth/login", {
        emailOrPhone,
        password,
      });

      const { user, token, refreshToken } = response.data;
      useAuthStore.getState().login(user, token, refreshToken);

      toast.success("Login successful!");

      // Direct role-based navigation
      if (user.role === "SuperAdmin" || user.role === "Admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/unauthorized");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm px-6 pb-8 bg-white rounded-md shadow-sm"
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center cursor-pointer text-sm text-orange-500 hover:text-orange-600 bg-orange-100 hover:bg-orange-200 border border-orange-300 font-semibold rounded-md -ml-5 px-3 py-1"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>
      <h2 className="text-2xl font-bold mb-1">
        Login to{" "}
        <span>
          Digi<span className="text-orange-500">Pay</span>
        </span>
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        Don't have an account?{" "}
        <button
          onClick={switchToSignUp}
          type="button"
          className="text-orange-500 cursor-pointer font-semibold hover:underline"
        >
          Sign Up
        </button>
      </p>

      {/* Email / Phone */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Email or Phone
        </label>
        <input
          type="text"
          name="emailOrPhone"
          value={formData.emailOrPhone}
          onChange={handleChange}
          placeholder="you@example.com or 9876543210"
          autoFocus
          required
          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Password */}
      <div className="mb-4 relative">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute cursor-pointer right-3 top-9 text-gray-500 hover:text-orange-500"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center cursor-pointer py-2.5 mt-1 text-white rounded-lg font-semibold text-sm transition-all ${
          loading
            ? "bg-orange-300 cursor-not-allowed"
            : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        {loading ? <Spinner /> : "Login"}
      </button>

      {/* Extra links */}
      <div className="flex justify-between text-xs text-orange-500 font-semibold mt-3">
        <button
          type="button"
          className="hover:underline cursor-pointer"
          onClick={() => navigate("/login-otp")}
        >
          Login with OTP
        </button>
        <button
          type="button"
          className="hover:underline cursor-pointer"
          onClick={() => navigate("/forget-password")}
        >
          Forgot Password?
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center my-5">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="mx-3 text-sm text-gray-400">or</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>

      {/* Google Login */}
      {/* <button
        type="button"
        className="w-full flex items-center cursor-pointer justify-center gap-2 border text-sm py-2 rounded hover:bg-gray-50 transition-all"
      >
        <img src={assets.Google} alt="Google" className="w-6 h-6" />
        Continue with Google
      </button> */}
    </form>
  );
}
