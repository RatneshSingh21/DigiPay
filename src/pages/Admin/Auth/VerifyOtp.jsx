import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance/axiosInstance";
import useAuthStore from "../../../store/authStore";
import Spinner from "../../../components/Spinner";
import assets from "../../../assets/assets";

const OTP_LENGTH = 4;
const RESEND_TIME = 120;

const VerifyOtp = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const flow = state?.flow || "signup";

  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState("");
  const [resendTimer, setResendTimer] = useState(RESEND_TIME);
  const timerRef = useRef(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    const fromState = state?.emailOrPhone;
    const fromStorage = localStorage.getItem("pendingContact");

    if (fromState) {
      setContact(fromState);
      localStorage.setItem("pendingContact", fromState);
    } else if (fromStorage) {
      setContact(fromStorage);
    } else {
      toast.error("Missing contact info.");
      navigate("/auth/login");
    }

    inputRefs.current[0]?.focus();
    startResendTimer();

    return () => clearInterval(timerRef.current);
  }, [state, navigate]);

  const startResendTimer = () => {
    setResendTimer(RESEND_TIME);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updatedOtp = [...otpValues];
    updatedOtp[index] = value;
    setOtpValues(updatedOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = otpValues.join("").trim();
    if (otp.length !== OTP_LENGTH) {
      toast.error("Enter the 4-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      if (flow === "login") {
        const res = await axiosInstance.post("/user-auth/login-with-otp", {
          emailOrPhone: contact.trim(),
          otp,
        });

        const { user, token, refreshToken } = res.data;
        useAuthStore.getState().login(user, token, refreshToken);
        localStorage.removeItem("pendingContact");

        toast.success("Login successful!");
        navigate("/");
      } else if (flow === "forgot") {
        const res = await axiosInstance.post("/user-auth/verify-reset-otp", {
          emailOrPhone: contact.trim(),
          otp,
        });
        const { resetToken } = res.data;
        toast.success("OTP verified. Proceed to reset password.");
        navigate("/reset-password", {
          state: { resetToken },
        });
      } else {
        const res = await axiosInstance.post("/user-auth/verify-otp", {
          emailOrPhone: contact.trim(),
          otp,
        });

        const { user, token, refreshToken } = res.data;
        useAuthStore.getState().login(user, token, refreshToken);
        localStorage.removeItem("pendingContact");

        toast.success("Signup completed!");
        navigate("/");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axiosInstance.post("/user-auth/resend-otp", {
        emailOrPhone: contact.trim(),
      });
      toast.success("OTP resent successfully!");
      startResendTimer();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-end relative px-4"
      style={{
        backgroundImage: `url(${assets.Landingbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 w-[350px] bg-white p-6 rounded-3xl shadow-lg mb-24 text-center">
        <img
          src={assets.Otpgif}
          alt="OTP Verification"
          className="w-32 mx-auto mb-4"
        />
        <h2 className="text-xl font-semibold text-gray-800">Verify OTP</h2>
        <p className="text-sm text-gray-500 mb-6">
          We've sent a code to your {contact.includes("@") ? "email" : "phone"}:{" "}
          <span className="font-medium text-gray-700">{contact}</span>
        </p>

        <div className="flex justify-between gap-3 mb-4 px-3">
          {otpValues.map((digit, idx) => (
            <input
              key={idx}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              ref={(el) => (inputRefs.current[idx] = el)}
              className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none"
            />
          ))}
        </div>

        <p className="text-xs text-gray-500 mb-5">
          Didn’t get the code?{" "}
          {resendTimer > 0 ? (
            <span className="text-gray-400">{formatTime(resendTimer)}</span>
          ) : (
            <button
              onClick={handleResend}
              className="text-orange-500 font-medium hover:underline"
            >
              Resend
            </button>
          )}
        </p>

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full py-2 rounded-full text-white font-medium shadow-md flex justify-center items-center ${
            loading
              ? "bg-orange-300 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          {loading ? <Spinner /> : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
