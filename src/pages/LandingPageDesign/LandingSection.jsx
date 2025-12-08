import assets from "../../assets/assets";
import { SiPayloadcms, SiWebmoney } from "react-icons/si";
import { GrMoney } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

const LandingSection = () => {
  const navigate = useNavigate();

  const handleAuthNavigation = (role) => {
    localStorage.setItem("loginRole", role); // 'SuperAdmin' or 'Employee'
    navigate("/auth");
  };

  return (
    <section
      className="flex-grow flex items-center justify-center bg-no-repeat bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url(${assets.Landingbg})`,
        backgroundSize: "cover", // ensures it covers the screen
        backgroundPosition: "center", // keeps center focus
        backgroundRepeat: "no-repeat",
        height: "90vh",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-20 py-16">
        <div className="md:w-1/2 text-center md:text-left">
          <p className="text-lg text-gray-900 font-medium mb-2">
            HRMS Software
          </p>
          <h1 className="text-2xl md:text-[30px] font-bold text-gray-900 leading-tight">
            Automated, Accurate & Hassle-Free{" "}
            <span className="text-[#CF6C12]">Payroll</span> in Just a Few
            Clicks!
          </h1>
          <p className="text-gray-700 text-md mb-6">
            Say goodbye to manual errors and complex spreadsheets. Empower your
            team with real-time payroll processing that's secure, scalable, and
            100% compliant.
          </p>

          <div className="flex flex-col items-center justify-start md:flex-row gap-2 mt-6">
            <div className="flex items-center gap-2">
              <SiPayloadcms className="w-6 h-6 text-[#CF6C12]" />
              <SiWebmoney className="w-6 h-6 text-[#CF6C12]" />
              <GrMoney className="w-6 h-6 text-[#CF6C12]" />
            </div>
            <p className="text-[#CF6C12] text-sm font-bold ml-2">
              ⭐ 4.1 average ratings on review platforms
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-5">
            <button
              className="bg-[#F08A2E] text-white px-6 py-3 rounded-md shadow cursor-pointer hover:opacity-90 transition"
              onClick={() => handleAuthNavigation("SuperAdmin")}
            >
              Continue as Admin
            </button>
            <button
              className="bg-[#CF6C12] text-white px-6 py-3 rounded-md shadow cursor-pointer hover:opacity-90 transition"
              onClick={() => handleAuthNavigation("Employee")}
            >
              Login as Employee
            </button>
          </div>
        </div>

        <div className="md:w-1/2 flex justify-center">
          <img
            src={assets.LoginImage}
            alt="Illustration"
            className="rounded-lg w-full max-w-md object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default LandingSection;
