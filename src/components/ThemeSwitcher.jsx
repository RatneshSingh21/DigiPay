import useThemeStore from "../store/themeStore";

const ThemeSwitcher = () => {
  // Access the theme store
  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const palette = useThemeStore((state) => state.palette);
  const setPalette = useThemeStore((state) => state.setPalette);

  return (
    <div className="flex gap-4 items-center bg-surface text-surface p-3 rounded-xl shadow transition-colors">
      <button
        onClick={toggleMode}
        className="px-4 py-2 rounded bg-primary text-white font-medium transition-colors"
      >
        {mode === "light" ? "Dark Mode" : "Light Mode"}
      </button>

      <select
        value={palette}
        onChange={(e) => setPalette(e.target.value)}
        className="px-3 py-2 rounded bg-secondary text-white transition-colors"
      >
        <option value="blue">Blue</option>
        <option value="green">Green</option>
        <option value="purple">Purple</option>
      </select>
    </div>
  );
};

export default ThemeSwitcher;
