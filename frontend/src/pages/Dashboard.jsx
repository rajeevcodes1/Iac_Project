import React, { useEffect, useState } from "react";
import MetricCard from "../components/MetricCard";
import { fetchDashboardSummary } from "../api";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetchDashboardSummary();
      setSummary(res.data);
    } catch (e) {
      console.error("Failed to load dashboard summary", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const s = summary;

  return (
    <div>
      <h1 style={{ fontSize: "22px", marginBottom: "16px" }}>City Overview</h1>

      {loading && (
        <p className="muted-text" style={{ fontSize: "14px" }}>
          Loading live metrics...
        </p>
      )}

      {!loading && s && (
        <>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <MetricCard
              title="Monitored Buildings"
              value={s.monitored_buildings}
              subtitle="Schools, colleges & offices"
            />
            <MetricCard
              title="Avg. Daily Energy (kWh)"
              value={s.avg_daily_energy_kwh.toLocaleString()}
              subtitle="Last 7-day rolling avg"
            />
            <MetricCard
              title="At-Risk Institutions"
              value={s.at_risk_institutions}
              subtitle="Based on education risk model"
            />
            <MetricCard
              title="Potential Energy Savings"
              value={`${s.potential_energy_savings_percent}%`}
              subtitle="Estimated from recent load profile"
            />
          </div>

          <p
            className="muted-text"
            style={{ marginTop: "24px", fontSize: "14px" }}
          >
            Use the sidebar to explore <strong>City Twin, Energy Analytics,
            Education Analytics</strong> and <strong>Optimization</strong>{" "}
            modules.
          </p>
        </>
      )}
    </div>
  );
};

export default Dashboard;
