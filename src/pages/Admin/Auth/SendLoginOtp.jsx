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
      toast.error(
        err?.response?.data?.message || "Failed to send OTP. Try again."
      );
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
        <div className="relative z-10 bg-white shadow-md rounded-2xl px-8 pt-3 pb-10 text-center">
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
          <div className="flex justify-center mb-4">
            <video
              src={assets.LoginWithOtp}
              autoPlay
              loop
              muted
              playsInline
              className="h-32 mx-auto"
            >
              Your browser does not support the video tag.
            </video>
            {/* <img
              src={assets.OtpLogin}
              alt="Illustration"
              className="h-32 mx-auto"
            /> */}
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Login with OTP
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Enter your registered email or phone number. We'll send you an OTP
            to log in securely.
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
              className="w-full flex items-center cursor-pointer justify-center py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50"
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
