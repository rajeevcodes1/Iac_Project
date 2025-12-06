import React, { useState } from "react";
import { fetchInstitutionRisk } from "../api";

const EducationAnalytics = () => {
  const [institutionId, setInstitutionId] = useState("");
  const [risk, setRisk] = useState(null);

  const handleFetch = async () => {
    if (!institutionId) return;
    const res = await fetchInstitutionRisk(institutionId);
    setRisk(res.data);
  };

  return (
    <div>
      <h1 style={{ fontSize: "22px", marginBottom: "16px" }}>Education Analytics</h1>
      <div
        style={{
          background: "#ffffff",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: "12px" }}>Institution ID</label>
            <input
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              style={{ padding: "6px", marginTop: "4px" }}
              placeholder="e.g. 1"
            />
          </div>
          <button
            onClick={handleFetch}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              background: "#4f46e5",
              color: "white",
              cursor: "pointer",
            }}
          >
            Fetch Risk
          </button>
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          padding: "16px",
          borderRadius: "12px",
        }}
      >
        <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>Institution Risk</h2>
        {!risk ? (
          <p style={{ fontSize: "13px", color: "#6b7280" }}>
            No risk data yet. Enter an institution ID and click Fetch.
          </p>
        ) : (
          <div>
            <p style={{ fontSize: "14px" }}>
              <strong>Risk Level:</strong> {(risk.risk_level * 100).toFixed(1)}%
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280" }}>{risk.notes}</p>
            <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
              Timestamp: {risk.timestamp}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationAnalytics;
