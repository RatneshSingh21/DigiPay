import { Link } from "react-router-dom";
import assets from "../assets/assets";

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 text-center max-w-lg w-full border border-red-100">
        {/* Professional Animation GIF */}
        <img
        src={assets.Unauthorize}
          alt="Access Denied"
          className="mx-auto mb-6 w-48 h-48 object-contain rounded-3xl shadow-lg"
        />

        <h1 className="text-3xl font-extrabold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-500 text-lg mb-6">
          Sorry, you do not have the required permissions to view this page.
        </p>

        <Link
          to="/"
          className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full shadow-lg transition"
        >
          <span className="mr-2">🔙</span> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
