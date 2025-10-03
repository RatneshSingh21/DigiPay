import assets from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";

const LandingNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer">
            <img src={assets.logo} alt="DigiCode Logo" className="w-10 h-10" />
            <Link
              to="/"
              className="text-gray-900 text-xl sm:text-2xl font-bold hover:text-gray-700"
            >
              Digi<span className="text-orange-600 font-bold">Pay</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* <img src={assets.Atul} className="w-10 h-10 rounded-full" alt="" /> */}
            <button
              className="bg-[#CF6C12] text-white px-4 py-2 text-sm sm:text-base cursor-pointer rounded-md hover:opacity-90 transition duration-200"
              onClick={() => navigate("/auth")}
            >
              Access DigiPay
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
