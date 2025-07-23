import { useEffect, useState } from "react";
import assets from "../assets/assets";
import SignInForm from "../pages/Admin/Auth/SignInForm";
import SignUpForm from "../pages/Admin/Auth/SignUpForm";
import SignInEmployeeForm from "../pages/EmployeePages/Auth/SignInEmployeeForm";

const AuthLayout = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("loginRole");
    setRole(storedRole);
  }, []);

  return (
    <div
      className="flex justify-center items-center min-h-screen px-4 bg-gray-100"
      style={{
        backgroundImage: `url(${assets.Landingbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative w-full max-w-5xl h-auto md:h-[500px] overflow-hidden bg-white rounded-3xl shadow-2xl">
        {/* Desktop Sliding Container */}
        <div
          className={`hidden md:flex w-[200%] h-full transition-transform duration-700 ease-in-out ${
            isSignIn ? "translate-x-0" : "-translate-x-1/2"
          }`}
        >
          {/* Sign In Panel Overview */}
          <div className="flex w-1/2 h-full">
            <div className="w-1/2 flex items-center justify-center bg-white p-4">
              {role === "SuperAdmin" ? (
                <SignInForm switchToSignUp={() => setIsSignIn(false)} />
              ) : (
                <SignInEmployeeForm />
              )}
            </div>
            <div className="w-1/2 bg-[#fff6ef] flex flex-col justify-center items-center p-8">
              <h1 className="text-3xl font-bold mb-4">Welcome</h1>
              <img
                src={assets.LoginImage}
                alt="Login"
                className="w-full max-w-xs transition-all duration-700"
              />
            </div>
          </div>

          {/* Sign Up Panel Overview */}
          <div className="flex w-1/2 h-full">
            <div className="w-1/2 bg-[#fff6ef] flex flex-col justify-center items-center p-8">
              <h1 className="text-3xl font-bold mb-4">Join Us</h1>
              <img
                src={assets.LoginImage}
                alt="Sign Up"
                className="w-full max-w-xs transition-all duration-700"
              />
            </div>
            <div className="w-1/2 flex items-center justify-center bg-white p-4">
              <SignUpForm switchToSignIn={() => setIsSignIn(true)} />
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="flex flex-col md:hidden w-full space-y-6 p-6">
          {isSignIn ? (
            <>
              <h1 className="text-center text-2xl font-bold">Welcome</h1>
              {role === "SuperAdmin" ? (
                <SignInForm switchToSignUp={() => setIsSignIn(false)} />
              ) : (
                <SignInEmployeeForm />
              )}
            </>
          ) : (
            <>
              <h1 className="text-center text-2xl font-bold">Join Us</h1>
              <SignUpForm switchToSignIn={() => setIsSignIn(true)} />
            </>
          )}
          <img
            src={assets.LoginImage}
            alt="Auth"
            className="w-full max-w-xs mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
