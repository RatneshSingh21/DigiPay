import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import Spinner from "../../../components/Spinner";
import assets from "../../../assets/assets";

const EmpForgetPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailOrPhone.trim()) {
      toast.error("Please enter your registered email or phone number.");
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.post("/user-auth/employee/forgot-password", {
        emailOrPhone: emailOrPhone.trim(),
      });

      toast.success("Reset instructions have been sent.");

      // Redirect to login after short delay
      setTimeout(() => {
        navigate("/auth");
      }, 1500);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to process request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !emailOrPhone.trim();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover"
      style={{ backgroundImage: `url(${assets.Landingbg})` }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg px-5 pt-3 pb-5 text-center z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center cursor-pointer text-sm text-orange-500 hover:text-orange-600 bg-orange-100 hover:bg-orange-200 border border-orange-300 font-semibold rounded-md -ml-2 px-3 py-1"
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

        <img
          src={assets.ForgetGif}
          alt="Forgot Password"
          className="mx-auto w-32 h-32 mb-3"
        />

        <h2 className="text-xl font-semibold mb-2">Forgot Password?</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your registered email or phone number and we’ll help you reset
          your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Email / Phone Number"
              className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-400 focus:outline-none"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              autoFocus
              required
            />
            <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="w-full flex items-center justify-center cursor-pointer bg-orange-500 text-white py-2 rounded-full hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? <Spinner /> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmpForgetPassword;
