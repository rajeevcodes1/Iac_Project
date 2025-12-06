import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      {/* Animated global background */}
      <div className="app-bg-animated" />
      <div className="app-bg-overlay" />

      {/* Actual app content */}
      <div
        style={{
          display: "flex",
          height: "100vh",
          position: "relative",
          zIndex: 0,
          color: "var(--text-main)",
        }}
      >
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Topbar />
          <main
            style={{
              padding: "16px",
              background: "transparent",
              overflow: "auto",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
