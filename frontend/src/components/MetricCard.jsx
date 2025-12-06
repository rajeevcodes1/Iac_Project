import React from "react";

const MetricCard = ({ title, value, subtitle }) => {
  return (
    <div
      className="card"
      style={{
        minWidth: "180px",
        transition: "transform 0.12s ease, box-shadow 0.12s ease",
      }}
    >
      <div className="muted-text" style={{ fontSize: "12px" }}>
        {title}
      </div>
      <div style={{ fontSize: "20px", fontWeight: 600, marginTop: "4px" }}>
        {value}
      </div>
      {subtitle && (
        <div className="muted-text" style={{ fontSize: "11px", marginTop: "4px" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
