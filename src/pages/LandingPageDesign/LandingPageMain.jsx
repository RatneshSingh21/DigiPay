import LandingNavbar from "./LandingNavbar";
import LandingSection from "./LandingSection";
import LandingFooter from "./LandingFooter";

const LandingPageMain = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden overflow-y-hidden">
      <LandingNavbar />
      <main className="flex-grow">
        <LandingSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPageMain;
