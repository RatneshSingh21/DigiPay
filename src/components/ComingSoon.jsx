import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({});
  const launchDate = new Date("2025-09-27T00:00:00"); // Change launch date

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        clearInterval(timer);
        setTimeLeft({});
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center bg-white text-gray-800 p-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-6 max-w-2xl"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-gray-900">
          🚀 Coming Soon
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10">
          We’re crafting something special for you. Be the first to know when we launch!
        </p>

        {/* Countdown Timer */}
        <div className="flex justify-center gap-6 mb-12">
          {["days", "hours", "minutes", "seconds"].map((unit) => (
            <div
              key={unit}
              className="flex flex-col items-center bg-gray-100 px-5 py-4 rounded-2xl shadow-md"
            >
              <span className="text-3xl font-bold text-primary">
                {timeLeft[unit] ?? "00"}
              </span>
              <span className="uppercase text-xs text-gray-500">{unit}</span>
            </div>
          ))}
        </div>

        {/* Email Notify Form */}
        <form className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-secondary text-white font-semibold transition shadow-md"
          >
            Notify Me
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          We value your privacy. No spam ever. ✨
        </p>
      </motion.div>
    </div>
  );
}
