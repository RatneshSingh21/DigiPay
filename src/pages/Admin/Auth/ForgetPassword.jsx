import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import assets from "../../../assets/assets";
import Spinner from "../../../components/Spinner";

const ForgetPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailOrPhone.trim()) {
      toast.error("Please enter a valid email or phone number.");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post("/user-auth/forgot-password", {
        emailOrPhone: emailOrPhone.trim(),
      });

      toast.success(
        response.data.message || "Verification code sent successfully."
      );

      // ✅ Navigate to VerifyOtp with contact and flow
      navigate("/verify-otp", {
        state: {
          emailOrPhone: emailOrPhone.trim(),
          flow: "forgot",
        },
      });
    } catch (error) {
      const errMsg =
        error.response?.data?.detail ||
        error.response?.data?.title ||
        "Something went wrong. Please try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${assets.Landingbg})`,
        backgroundSize: "cover",
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-5 text-center z-10">
        {/* Illustration */}
        <img
          src={assets.ForgetImage}
          alt="Forgot Password Illustration"
          className="mx-auto mb-4 w-32 h-32"
        />

        {/* Heading */}
        <h2 className="text-xl font-semibold mb-2">Forget Password</h2>
        <p className="text-sm text-gray-500 mb-6 px-4">
          Please enter your registered email or phone number. We'll send you a
          verification code to confirm your identity.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="E-Mail / Phone no."
              className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              required
            />
            <FaEnvelope className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-orange-500 text-white py-2 rounded-full shadow-md hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {loading ? <Spinner /> : "Send Code"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
