import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Spinner from "../../../components/Spinner";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";

export default function SignInEmployeeForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
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

    const { email, password } = formData;

    if (!email || !password) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/user-auth/employee-authenaticqtio",
        { email, password }
      );

      const {
        employeeId,
        fullName,
        email: backendEmail,
        token,
        message,
      } = response.data;

      useAuthStore.getState().login(
        {
          userId: employeeId, //  primary
          id: employeeId, //  alias
          name: fullName,
          fullName: fullName,
          emailOrPhone: backendEmail,
          role: "Employee",
          profileImageUrl: null,
        },
        token,
        null
      );

      toast.success(message || "Login successful!");
      navigate("/");
    } catch (err) {
      console.error("Backend error:", err.response.data);
      toast.error(err.response.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm px-6 pt-4 pb-8 bg-white rounded-md shadow-sm"
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center cursor-pointer text-sm text-orange-500 hover:text-orange-600 bg-orange-100 hover:bg-orange-200 border border-orange-300 font-semibold rounded-md px-3 py-1 mb-4"
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

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoFocus
          required
          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>

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
          className="absolute right-3 cursor-pointer top-9 text-gray-500 hover:text-orange-500"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

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
    </form>
  );
}
