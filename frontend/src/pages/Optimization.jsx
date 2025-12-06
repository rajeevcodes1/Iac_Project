import React, { useState } from "react";
import { optimizeEnergy } from "../api";

const Optimization = () => {
  const [buildingId, setBuildingId] = useState("");
  const [maxLoad, setMaxLoad] = useState("");
  const [hours, setHours] = useState(24);
  const [mode, setMode] = useState("peak");
  const [dayTariff, setDayTariff] = useState(8);
  const [nightTariff, setNightTariff] = useState(5);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleOptimize = async () => {
    setError("");
    setResult(null);

    if (!buildingId || !maxLoad) {
      setError("Please provide Building ID and Max Load (kW).");
      return;
    }

    const payload = {
      building_id: Number(buildingId),
      max_load_kw: Number(maxLoad),
      hours: Number(hours),
      mode,
    };

    if (mode === "cost") {
      payload.day_tariff = Number(dayTariff);
      payload.night_tariff = Number(nightTariff);
    }

    try {
      const res = await optimizeEnergy(payload);
      setResult(res.data);
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.detail ||
          "Failed to compute optimized schedule. Check backend logs."
      );
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "22px", marginBottom: "16px" }}>
        Process Optimization – Energy Scheduling
      </h1>

      {/* Input card */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "flex-end",
          }}
        >
          <div>
            <label style={{ fontSize: "12px" }}>Building ID</label>
            <input
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
              style={{ marginTop: "4px", width: "120px" }}
              placeholder="e.g. 1"
            />
          </div>

          <div>
            <label style={{ fontSize: "12px" }}>Max Load (kW)</label>
            <input
              type="number"
              value={maxLoad}
              onChange={(e) => setMaxLoad(e.target.value)}
              style={{ marginTop: "4px", width: "130px" }}
              placeholder="e.g. 80"
            />
          </div>

          <div>
            <label style={{ fontSize: "12px" }}>Hours</label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              style={{ marginTop: "4px", width: "90px" }}
              min={1}
              max={48}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px" }}>Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={{ marginTop: "4px", width: "170px" }}
            >
              <option value="peak">Minimize Peak Load</option>
              <option value="cost">Minimize Cost</option>
              <option value="emissions">Minimize Emissions</option>
            </select>
          </div>

          {mode === "cost" && (
            <>
              <div>
                <label style={{ fontSize: "12px" }}>Day Tariff (₹/kWh)</label>
                <input
                  type="number"
                  value={dayTariff}
                  onChange={(e) => setDayTariff(e.target.value)}
                  style={{ marginTop: "4px", width: "130px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px" }}>Night Tariff (₹/kWh)</label>
                <input
                  type="number"
                  value={nightTariff}
                  onChange={(e) => setNightTariff(e.target.value)}
                  style={{ marginTop: "4px", width: "130px" }}
                />
              </div>
            </>
          )}

          <button onClick={handleOptimize}>Optimize Schedule</button>
        </div>

        <p className="muted-text" style={{ marginTop: "8px", fontSize: "12px" }}>
          The optimizer uses forecasted loads for this building, keeps at least
          90% of baseline energy, and adjusts per-hour load to minimize peak,
          total cost, or emissions.
        </p>

        {error && (
          <p style={{ marginTop: "8px", color: "#dc2626", fontSize: "13px" }}>
            {error}
          </p>
        )}
      </div>

      {/* Result card */}
      {result && (
        <div className="card">
          <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>
            Optimized Schedule (Building {result.building_id})
          </h2>
          <p className="muted-text" style={{ fontSize: "13px", marginBottom: "8px" }}>
            Mode: <strong>{result.mode}</strong> | Horizon:{" "}
            <strong>{result.hours} hours</strong>
          </p>

          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            <div>
              <div className="muted-text" style={{ fontSize: "12px" }}>
                Baseline Energy (24h)
              </div>
              <div style={{ fontWeight: 600 }}>
                {result.total_baseline_kwh.toFixed(2)} kWh
              </div>
            </div>
            <div>
              <div className="muted-text" style={{ fontSize: "12px" }}>
                Optimized Energy (24h)
              </div>
              <div style={{ fontWeight: 600 }}>
                {result.total_optimized_kwh.toFixed(2)} kWh
              </div>
            </div>

            {result.estimated_cost_baseline != null && (
              <div>
                <div className="muted-text" style={{ fontSize: "12px" }}>
                  Cost (Baseline)
                </div>
                <div style={{ fontWeight: 600 }}>
                  ₹ {result.estimated_cost_baseline.toFixed(2)}
                </div>
              </div>
            )}
            {result.estimated_cost_optimized != null && (
              <div>
                <div className="muted-text" style={{ fontSize: "12px" }}>
                  Cost (Optimized)
                </div>
                <div style={{ fontWeight: 600 }}>
                  ₹ {result.estimated_cost_optimized.toFixed(2)}
                </div>
              </div>
            )}

            {result.estimated_emissions_baseline_kg != null && (
              <div>
                <div className="muted-text" style={{ fontSize: "12px" }}>
                  Emissions (Baseline)
                </div>
                <div style={{ fontWeight: 600 }}>
                  {result.estimated_emissions_baseline_kg.toFixed(2)} kg CO₂
                </div>
              </div>
            )}
            {result.estimated_emissions_optimized_kg != null && (
              <div>
                <div className="muted-text" style={{ fontSize: "12px" }}>
                  Emissions (Optimized)
                </div>
                <div style={{ fontWeight: 600 }}>
                  {result.estimated_emissions_optimized_kg.toFixed(2)} kg CO₂
                </div>
              </div>
            )}
          </div>

          <div style={{ maxHeight: "340px", overflow: "auto" }}>
            <table style={{ width: "100%", fontSize: "13px" }}>
              <thead>
                <tr>
                  <th align="left">Hour</th>
                  <th align="left">Timestamp (UTC)</th>
                  <th align="left">Baseline kW</th>
                  <th align="left">Optimized kW</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.hour_index}>
                    <td>{row.hour_index + 1}</td>
                    <td>{row.timestamp}</td>
                    <td>{row.baseline_kw.toFixed(2)}</td>
                    <td>{row.optimized_kw.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Optimization;
