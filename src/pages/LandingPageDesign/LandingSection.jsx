import assets from "../../assets/assets";
import { SiPayloadcms, SiWebmoney } from "react-icons/si";
import { GrMoney } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

const LandingSection = () => {

  const navigate = useNavigate();

  return (
    <section
      className="py-16 mt-16 bg-no-repeat"
      style={{ backgroundImage: `url(${assets.Landingbg})` }}
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left Text Section */}
        <div className="md:w-1/2 text-center md:text-left">
          <p className="text-lg text-gray-900 font-medium mb-2">
            Payroll Software
          </p>
          <h1 className="text-2xl md:text-[30px] font-bold text-gray-900 leading-tight">
            Automated, Accurate & Hassle-Free{" "}
            <span className="text-secondary">Payroll</span> in Just a Few Clicks!
          </h1>
          <p className="text-gray-700 text-md mb-6">
            Say goodbye to manual errors and complex spreadsheets. Empower your
            team with real-time payroll processing that's secure, scalable, and
            100% compliant.
          </p>
          <div className="flex flex-col items-center justify-start  md:flex-row gap-2 mb-6">
            <div className="flex items-center gap-2">
              <SiPayloadcms className="w-6 h-6 text-secondary" />
              <SiWebmoney className="w-6 h-6 text-secondary" />
              <GrMoney className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-secondary text-sm font-bold ml-2">
              ⭐ 4.1 average ratings on global review platforms
            </p>
          </div>
          <button className="bg-primary text-white px-6 py-3 rounded-md shadow hover:opacity-90 transition"
          onClick={() => navigate("/auth")}>
            Get Started
          </button>
        </div>

        {/* Right Image Section */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={assets.LoginImage}
            alt="Illustration"
            className="rounded-lg w-full max-w-md"
          />
        </div>
      </div>
    </section>
  );
};

export default LandingSection;
