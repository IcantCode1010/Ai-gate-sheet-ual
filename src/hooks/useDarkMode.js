import { useState, useEffect } from "react";

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("hmc-dark-mode") === "true";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("hmc-dark-mode", String(dark));
  }, [dark]);

  return [dark, () => setDark(d => !d)];
}
