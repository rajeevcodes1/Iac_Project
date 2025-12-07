import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="app-shell">
      {/* Animated global background (from your theme-green.css) */}
      <div className="app-bg-animated" />
      <div className="app-bg-overlay" />

      {/* Foreground app content */}
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          color: "var(--text-main)",
        }}
      >
        <Navbar />
        <main
          style={{
            padding: "16px",
            background: "transparent",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
