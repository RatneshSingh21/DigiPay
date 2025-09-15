import { Link } from "react-router-dom";
import assets from "../assets/assets";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-white dark:bg-gray-900 dark:text-white">
      <img src={assets.StopGif} alt="Page Not Found" className="w-48 h-48" />
      <h1 className="text-7xl font-bold text-gray-800 dark:text-white">404</h1>
      <p className="text-2xl mt-4 text-gray-600 dark:text-gray-300">
        Oops! Page Not Found
      </p>
      <p className="mt-2 text-gray-500 dark:text-gray-300 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block px-6 py-3 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
