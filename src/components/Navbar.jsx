import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import { IoSettings } from "react-icons/io5";
import useThemeStore from "../store/themeStore";
import useAuthStore from "../store/authStore";
import SettingsDrawer from "./SettingsDrawer";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mode, toggleMode } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [showSettings, setShowSettings] = useState(false);
  const isAuthenticated = !!token;

  const links = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-primary dark:text-white"
          >
            MyApp
          </Link>

          <ul className="hidden md:flex gap-6 items-center text-gray-700 dark:text-white">
            {links.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className="hover:text-primary transition-colors duration-300"
                >
                  {link.name}
                </Link>
              </li>
            ))}

            <li>
              <button
                onClick={toggleMode}
                aria-label="Toggle theme"
                className={`relative flex items-center w-16 h-10 rounded-full border-2 transition-all duration-300 overflow-hidden
                  ${
                    mode === "dark"
                      ? "bg-black border-white"
                      : "bg-gray-200 border-gray-400"
                  }
                `}
              >
                <div
                  className={`absolute top-1 left-1 w-7 h-7 rounded-full flex items-center justify-center text-lg transition-all duration-300
                    ${
                      mode === "dark"
                        ? "translate-x-7 bg-white text-black"
                        : "bg-white text-yellow-500"
                    }
                  `}
                >
                  {mode === "dark" ? <FiMoon /> : <FiSun />}
                </div>
              </button>
            </li>

            {isAuthenticated ? (
              <>
                <li className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
                    <img
                      src="/profile.jpg"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-semibold hidden sm:block">
                    {user?.name || user?.emailOrPhone}
                  </span>
                </li>

                <li>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 rounded-md font-medium transition-all duration-300 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-md font-medium transition-all duration-300 border border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-md font-medium transition-all duration-300 bg-primary text-white hover:bg-primary/90"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}

            <li>
              <button
                title="Settings"
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 group"
              >
                <IoSettings className="text-xl transition-transform duration-300 group-hover:rotate-45" />
              </button>
            </li>
          </ul>

          {/* Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-2xl text-gray-700 dark:text-white focus:outline-none"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 px-4 pb-4">
            <ul className="flex flex-col gap-4 text-gray-700 dark:text-white">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="block w-full hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    toggleMode();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1 border rounded-full"
                >
                  <div className="text-xl">
                    {mode === "dark" ? <FiMoon /> : <FiSun />}
                  </div>
                  <span className="font-semibold">
                    {mode === "dark" ? "Nightmode" : "Daymode"}
                  </span>
                </button>
              </li>
              <li>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-4 py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white dark:text-primary dark:border-primary dark:hover:bg-primary dark:hover:text-white"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default Navbar;
