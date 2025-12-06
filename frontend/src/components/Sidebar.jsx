import React from "react";
import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px 16px",
  textDecoration: "none",
  color: isActive ? "#bbf7d0" : "var(--sidebar-text)",
  background: isActive ? "rgba(34,197,94,0.18)" : "transparent",
  borderRadius: "8px",
  marginBottom: "4px",
  fontSize: "14px",
});

const Sidebar = () => {
  return (
    <aside
      style={{
        width: "220px",
        background: "var(--sidebar-bg)",
        color: "var(--sidebar-text)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ marginBottom: "24px", fontSize: "18px", color: "#ecfdf5" }}>
        SmartEd-City
      </h2>
      <NavLink to="/" style={linkStyle} end>
        Dashboard
      </NavLink>
      <NavLink to="/city" style={linkStyle}>
        City Twin
      </NavLink>
      <NavLink to="/energy" style={linkStyle}>
        Energy Analytics
      </NavLink>
      <NavLink to="/education" style={linkStyle}>
        Education Analytics
      </NavLink>
      <NavLink to="/optimization" style={linkStyle}>
        Optimization
      </NavLink>
    </aside>
  );
};

export default Sidebar;
