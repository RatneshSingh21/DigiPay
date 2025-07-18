import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import assets from "../../../assets/assets";

const SendLoginOtp = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailOrPhone.trim()) {
      toast.error("Please enter your email or phone number.");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/user-auth/send-login-otp", {
        emailOrPhone,
      });

      toast.success(res?.data?.message || "OTP sent successfully!");
      navigate("/verify-otp", {
        state: { emailOrPhone, flow: "login" },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(${assets.Landingbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative w-full max-w-md">
        <div className="relative z-10 bg-white shadow-md rounded-2xl px-8 py-10 text-center">
          <div className="flex justify-center mb-4">
            <img src={assets.OtpLogin} alt="Illustration" className="h-32" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Login with OTP</h2>
          <p className="text-sm text-gray-600 mb-6">
            Enter your registered email or phone number. We'll send you an OTP to log in securely.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="Email or phone number"
                className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
              <FaEnvelope className="absolute right-4 top-2.5 text-gray-500" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? <Spinner /> : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendLoginOtp;
