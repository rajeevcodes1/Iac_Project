import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const linkBaseStyle = {
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "13px",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  transition: "background 0.15s ease, color 0.15s ease",
};

const Navbar = () => {
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
        background: "var(--topbar-bg)",
        color: "#f9fafb",
        padding: "8px 16px",
        borderBottom: "1px solid rgba(148,163,184,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Left: title */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "16px", fontWeight: 600 }}>
          SmartEd-City Nexus
        </span>
      </div>

      {/* Center: nav links */}
      <nav
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          margin: "0 16px",
          flex: 1,
        }}
      >
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            ...linkBaseStyle,
            backgroundColor: isActive
              ? "rgba(15,118,110,0.25)"
              : "transparent",
            color: isActive ? "#ecfdf5" : "#e5e7eb",
          })}
        >
          🏠 Dashboard
        </NavLink>

        <NavLink
          to="/city"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            backgroundColor: isActive
              ? "rgba(15,118,110,0.25)"
              : "transparent",
            color: isActive ? "#ecfdf5" : "#e5e7eb",
          })}
        >
          🗺 City Twin
        </NavLink>

        <NavLink
          to="/energy"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            backgroundColor: isActive
              ? "rgba(15,118,110,0.25)"
              : "transparent",
            color: isActive ? "#ecfdf5" : "#e5e7eb",
          })}
        >
          ⚡ Energy
        </NavLink>

        <NavLink
          to="/education"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            backgroundColor: isActive
              ? "rgba(15,118,110,0.25)"
              : "transparent",
            color: isActive ? "#ecfdf5" : "#e5e7eb",
          })}
        >
          🎓 Education
        </NavLink>

        <NavLink
          to="/optimization"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            backgroundColor: isActive
              ? "rgba(15,118,110,0.25)"
              : "transparent",
            color: isActive ? "#ecfdf5" : "#e5e7eb",
          })}
        >
          🔧 Optimization
        </NavLink>
      </nav>

      {/* Right: dark/light toggle */}
      <button
        onClick={toggleTheme}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          background: "rgba(15,23,42,0.4)",
          border: "1px solid rgba(148,163,184,0.6)",
        }}
      >
        {theme === "light" ? (
          <>
            🌙 <span>Dark</span>
          </>
        ) : (
          <>
            ☀️ <span>Light</span>
          </>
        )}
      </button>
    </header>
  );
};

export default Navbar;
