import { useState } from "react";
import assets from "../assets/assets";
import SignInForm from "../pages/Admin/Auth/SignInForm";
import SignUpForm from "../pages/Admin/Auth/SignUpForm";

const AuthLayout = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div
      className="flex justify-center items-center min-h-screen px-4 bg-gray-100"
      style={{
        backgroundImage: `url(${assets.Landingbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative w-full max-w-5xl h-[500px] overflow-hidden bg-white rounded-3xl shadow-2xl">
        {/* Sliding Container */}
        <div
          className={`flex md:flex-row flex-col w-full md:w-[200%] h-full transition-transform duration-700 ease-in-out ${
            isSignIn ? "md:translate-x-0" : "md:-translate-x-1/2"
          }`}
        >
          {/* Sign In Panel: Form Left + Image Right */}
          <div className="flex w-full md:w-1/2 h-full">
            {/* Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-4">
              <SignInForm switchToSignUp={() => setIsSignIn(false)} />
            </div>
            {/* Image */}
            <div className="hidden md:flex w-1/2 bg-[#fff6ef] flex-col justify-center items-center p-8">
              <h1 className="text-3xl font-bold mb-4">Welcome Back</h1>
              <img
                src={assets.LoginImage}
                alt="Login"
                className="w-full max-w-xs transition-all duration-700"
              />
            </div>
          </div>

          {/* Sign Up Panel: Image Left + Form Right */}
          <div className="flex w-full md:w-1/2 h-full">
            {/* Image */}
            <div className="hidden md:flex w-1/2 bg-[#fff6ef] flex-col justify-center items-center p-8">
              <h1 className="text-3xl font-bold mb-4">Join Us</h1>
              <img
                src={assets.LoginImage}
                alt="Sign Up"
                className="w-full max-w-xs transition-all duration-700"
              />
            </div>
            {/* Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-4">
              <SignUpForm switchToSignIn={() => setIsSignIn(true)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;