import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import useThemeStore from "./store/themeStore.js";

function ThemeWrapper() {
  const mode = useThemeStore((state) => state.mode);
  const palette = useThemeStore((state) => state.palette);

  useEffect(() => {
    const html = document.documentElement;

    html.classList.toggle("dark", mode === "dark");

    html.classList.remove(
      "theme-orange",
      "theme-blue",
      "theme-green",
      "theme-red",
      "theme-purple",
      "theme-teal",
      "theme-rose",
      "theme-indigo",
      "theme-pink"
    );

    html.classList.add(`theme-${palette}`);
  }, [mode, palette]);

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeWrapper />
  </StrictMode>
);
