import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Spinner from "../../../components/Spinner";

export default function SignInEmployeeForm() {
  const navigate = useNavigate(); // for redirecting after login

  const [formData, setFormData] = useState({
    workEmail: "",
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

    const { workEmail, password } = formData;

    if (!workEmail || !password) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/employee-auth/login", {
        workEmail,
        password,
      });

      const { user, token, refreshToken } = response.data;
      useAuthStore.getState().login(user, token, refreshToken);
      toast.success("Login successful!");
      // Redirect user or update UI
      window.location.href = "/"; // or use useNavigate()
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm px-6 py-8 bg-white rounded-md shadow-sm"
    >
      <h2 className="text-2xl font-bold mb-1">
        Login to{" "}
        <span>
          Digi<span className="text-orange-500">Pay</span>
        </span>
      </h2>

      {/* Email / Phone */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="text"
          name="workEmail"
          value={formData.workEmail}
          onChange={handleChange}
          placeholder="you@example.com"
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
          className="absolute right-3 top-9 text-gray-500 hover:text-orange-500"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center py-2.5 mt-1 text-white rounded-lg font-semibold text-sm transition-all ${
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
          className="hover:underline"
          onClick={() => navigate("/login-otp")}
        >
          Login with OTP
        </button>
        <button
          type="button"
          className="hover:underline"
          onClick={() => navigate("/forget-password")}
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );
}
