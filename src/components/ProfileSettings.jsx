import useThemeStore from "../store/themeStore";
import { FiSun, FiMoon } from "react-icons/fi";
import Profile from "./Profile";

const ProfileSettings = () => {
  const { mode, toggleMode, palette, setPalette } = useThemeStore();

  const colorPalettes = {
    blue: "59, 130, 246",
    green: "34, 197, 94",
    red: "239, 68, 68",
    purple: "168, 85, 247",
    orange: "251, 146, 60",
    teal: "13, 148, 136",
    rose: "244, 63, 94",
    indigo: "99, 102, 241",
    pink: "236, 72, 153",
  };

  return (
    <div className="text-sm text-gray-800 dark:text-white space-y-6">
      <div>
        <Profile />
      </div>

      {/* Theme Mode */}

      <div className="mt-4">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
          Mode
        </h3>
        <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-full w-max">
          {/* Day Button */}
          <button
            onClick={() => mode !== "light" && toggleMode()}
            className={`flex items-center cursor-pointer gap-1 px-4 py-1 rounded-full text-sm font-medium transition-all duration-200
            ${
              mode === "light"
                ? "bg-primary text-white shadow"
                : "text-gray-700 dark:text-white"
            }
          `}
          >
            <FiSun />
            Day
          </button>

          {/* Night Button */}
          <button
            onClick={() => mode !== "dark" && toggleMode()}
            className={`flex items-center gap-1 cursor-pointer px-4 py-1 rounded-full text-sm font-medium transition-all duration-200
            ${
              mode === "dark"
                ? "bg-primary text-white shadow"
                : "text-gray-700 dark:text-white"
            }
          `}
          >
            <FiMoon />
            Night
          </button>
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
          Color Palette
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(colorPalettes).map(([name, value]) => (
            <button
              key={name}
              className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                palette === name
                  ? "border-black dark:border-white ring-2 ring-primary"
                  : "border-gray-300"
              } shadow-md hover:scale-110 transition-transform duration-200`}
              style={{ backgroundColor: `rgb(${value})` }}
              onClick={() => setPalette(name)}
              title={name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
