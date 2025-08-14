import { Link, useNavigate } from "react-router-dom";
import assets from "../assets/assets";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Navigate back if there is history, else go to home
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-white dark:bg-gray-900">
      {/* Animated Illustration */}
      <img
        src={assets.LostGif}
        alt="Access Denied"
        className="w-56 h-56 mb-6"
      />

      {/* Title */}
      <h1 className="text-5xl font-bold text-red-600 dark:text-red-400">
        Access Denied
      </h1>

      {/* Subtitle */}
      <p className="text-lg mt-4 text-gray-600 dark:text-gray-300 max-w-md">
        Sorry, you don’t have the required permissions to view this page.
      </p>

      {/* Description */}
      <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">
        You can try going back or head over to the homepage.
      </p>

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="mt-6 inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105 shadow-lg"
      >
        Back to Home
      </button>
    </div>
  );
};

export default Unauthorized;
