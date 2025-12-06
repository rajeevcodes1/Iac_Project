import React, { useEffect, useState } from "react";

const Topbar = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial = stored === "dark" ? "dark" : "light";
    setTheme(initial);
    document.body.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.body.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <header
      style={{
        padding: "10px 16px",
        borderBottom: "1px solid rgba(148, 163, 184, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontSize: "16px", fontWeight: 500 }}>
        SmartEd-City Nexus – Control Center
      </span>

      <button
        onClick={toggleTheme}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 10px",
          borderRadius: "999px",
          fontSize: "12px",
        }}
      >
        {theme === "light" ? (
          <>
            🌙 <span>Dark mode</span>
          </>
        ) : (
          <>
            ☀️ <span>Light mode</span>
          </>
        )}
      </button>
    </header>
  );
};

export default Topbar;
