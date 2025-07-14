import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ⬅️ for redirect
import assets from "../../../assets/assets";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Spinner from "../../../components/Spinner";

const SignUpForm = ({ switchToSignIn }) => {
  const navigate = useNavigate(); // ⬅️ initialize navigation

  const [formData, setFormData] = useState({
    name: "",
    emailOrPhone: "",
    password: "",
    role: "SuperAdmin",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!formData.name || !formData.emailOrPhone || !formData.password) {
      toast.error("Please fill out all fields.");
      return;
    }

    // Email or phone validation
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      formData.emailOrPhone
    );
    const isValidPhone = /^\+?\d{10,15}$/.test(
      formData.emailOrPhone.replace(/\s/g, "")
    );

    if (!isValidEmail && !isValidPhone) {
      toast.error("Please enter a valid email or phone number.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/user-auth/signup", formData);

      toast.success("Account created! Redirecting for OTP verification...");

      // Save contact info to localStorage
      localStorage.setItem("pendingContact", formData.emailOrPhone);

      // Redirect to OTP page
      navigate("/verify-otp", {
        state: { emailOrPhone: formData.emailOrPhone },
      });

      // Optional: clear form
      setFormData({
        name: "",
        emailOrPhone: "",
        password: "",
        role: "SuperAdmin",
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm px-6 py-5 bg-white rounded-2xl shadow-lg"
    >
      <h2 className="text-2xl font-extrabold text-gray-800 mb-2 leading-tight">
        Create <span className="text-orange-500">Account</span>
      </h2>

      <p className="text-sm text-gray-600 mb-3">
        Already have an account?{" "}
        <button
          type="button"
          onClick={switchToSignIn}
          className="text-orange-500 font-medium hover:underline transition"
        >
          Login
        </button>
      </p>

      {/* Name */}
      <div className="mb-5">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
          className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-gray-50 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Email or Phone */}
      <div className="mb-5">
        <label
          htmlFor="emailOrPhone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email or Phone
        </label>
        <input
          type="text"
          id="emailOrPhone"
          value={formData.emailOrPhone}
          onChange={handleChange}
          placeholder="you@example.com or +91 9234567890"
          required
          className="w-full px-4 py-2.5 text-sm border border-gray-300 bg-gray-50 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Password */}
      <div className="mb-5 relative">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-300 bg-gray-50 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-9 text-gray-500 hover:text-orange-500"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* Submit */}
      <button
        disabled={loading}
        className={`w-full py-2 text-white font-semibold rounded-md flex justify-center items-center ${
          loading
            ? "bg-orange-300 cursor-not-allowed"
            : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        {loading ? <Spinner /> : "Create Account"}
      </button>

      {/* Divider */}
      <div className="flex items-center my-2">
        <div className="flex-grow h-px bg-gray-200" />
        <span className="mx-3 text-sm text-gray-400">or</span>
        <div className="flex-grow h-px bg-gray-200" />
      </div>

      {/* Google */}
      <button
        type="button"
        className="w-full flex items-center justify-center border border-gray-300 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-all font-medium text-gray-700"
      >
        <img src={assets.Google} alt="Google" className="w-5 h-5 mr-2" />
        Continue with Google
      </button>
    </form>
  );
};

export default SignUpForm;
