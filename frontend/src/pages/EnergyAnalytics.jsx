import React, { useState, useMemo } from "react";
import { fetchEnergyForecast } from "../api";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const EnergyAnalytics = () => {
  const [buildingId, setBuildingId] = useState("");
  const [data, setData] = useState([]);

  const handleFetch = async () => {
    if (!buildingId) return;
    try {
      const res = await fetchEnergyForecast(buildingId);
      setData(res.data || []);
    } catch (e) {
      console.error(e);
      setData([]);
    }
  };

  // Group by horizon_hours buckets
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const buckets = [
      { label: "Hours 1–6 (Night)", total: 0 },
      { label: "Hours 7–12 (Morning)", total: 0 },
      { label: "Hours 13–18 (Afternoon)", total: 0 },
      { label: "Hours 19–24 (Evening)", total: 0 },
    ];

    data.forEach((row) => {
      const h = row.horizon_hours;
      const val = row.predicted_value || 0;

      if (h >= 1 && h <= 6) buckets[0].total += val;
      else if (h >= 7 && h <= 12) buckets[1].total += val;
      else if (h >= 13 && h <= 18) buckets[2].total += val;
      else if (h >= 19 && h <= 24) buckets[3].total += val;
    });

    return buckets
      .filter((b) => b.total > 0)
      .map((b) => ({
        name: b.label,
        value: Number(b.total.toFixed(2)),
      }));
  }, [data]);

  const PRIORITY_COLORS = ["#ff4d4d", "#ffd93b", "#34d399", "#065f46"];

  return (
    <div>
      <h1 style={{ fontSize: "22px", marginBottom: "16px" }}>Energy Analytics</h1>

      {/* Input card */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label style={{ fontSize: "12px" }}>Building ID</label>
            <input
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
              style={{ marginTop: "4px" }}
              placeholder="e.g. 1"
            />
          </div>
          <button onClick={handleFetch}>Fetch Forecast</button>
        </div>
      </div>

      {/* Table + chart */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {/* Table */}
        <div className="card" style={{ flex: "1 1 320px" }}>
          <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>
            Next 24h Forecast
          </h2>
          {data.length === 0 ? (
            <p className="muted-text" style={{ fontSize: "13px" }}>
              No forecast yet. Enter a valid building ID and click Fetch.
            </p>
          ) : (
            <div style={{ maxHeight: "320px", overflow: "auto" }}>
              <table style={{ width: "100%", fontSize: "13px" }}>
                <thead>
                  <tr>
                    <th align="left">Hour Horizon</th>
                    <th align="left">Timestamp (UTC)</th>
                    <th align="left">Predicted kWh</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={`${row.building_id}-${row.horizon_hours}`}>
                      <td>{row.horizon_hours}</td>
                      <td>{row.timestamp}</td>
                      <td>{row.predicted_value.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card" style={{ flex: "1 1 320px" }}>
          <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>
            Predicted Energy Split (Next 24h)
          </h2>
          {chartData.length === 0 ? (
            <p className="muted-text" style={{ fontSize: "13px" }}>
              Forecast is required to display the chart.
            </p>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {(() => {
                      const sorted = [...chartData].sort(
                        (a, b) => b.value - a.value
                      );
                      const colorMap = {};
                      sorted.forEach((entry, index) => {
                        colorMap[entry.name] =
                          PRIORITY_COLORS[index] || "#999999";
                      });
                      return chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colorMap[entry.name]}
                          stroke="var(--page-bg)"
                          strokeWidth={2}
                        />
                      ));
                    })()}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} kWh`, "Energy"]}
                    contentStyle={{
                      backgroundColor: "var(--card-bg)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-main)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      color: "var(--text-main)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <p
            className="muted-text"
            style={{ fontSize: "12px", marginTop: "8px" }}
          >
            Colours show highest to lowest consumption: red (max), yellow,
            green, dark green (min).
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnergyAnalytics;
