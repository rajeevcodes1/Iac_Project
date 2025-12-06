import React, { useEffect, useState } from "react";
import { fetchBuildings, createBuilding, fetchEnergyIntensity } from "../api";
import CityMap from "../components/CityMap";

const CityTwin = () => {
  const [buildings, setBuildings] = useState([]);
  const [energyIntensity, setEnergyIntensity] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "school",
    latitude: "",
    longitude: "",
    city_zone: "",
  });

  const load = async () => {
    const [bRes, iRes] = await Promise.all([
      fetchBuildings(),
      fetchEnergyIntensity().catch(() => ({ data: [] })),
    ]);
    setBuildings(bRes.data);
    setEnergyIntensity(iRes.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    };
    await createBuilding(payload);
    setForm({
      name: "",
      type: "school",
      latitude: "",
      longitude: "",
      city_zone: "",
    });
    load();
  };

  return (
    <div>
      <h1 style={{ fontSize: "22px", marginBottom: "16px" }}>City Digital Twin</h1>

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        {/* Left panel – form */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#ffffff",
            padding: "16px",
            borderRadius: "12px",
            minWidth: "260px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>Add Building</h2>

          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "12px" }}>Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                width: "100%",
                padding: "6px",
                marginTop: "4px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
              }}
              placeholder="e.g. Govt High School, Whitefield"
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "12px" }}>Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={{
                width: "100%",
                padding: "6px",
                marginTop: "4px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
              }}
            >
              <option value="school">School</option>
              <option value="college">College</option>
              <option value="office">Office</option>
              <option value="residential">Residential</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px" }}>Latitude</label>
              <input
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginTop: "4px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                }}
                placeholder="12.97..."
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px" }}>Longitude</label>
              <input
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginTop: "4px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                }}
                placeholder="77.59..."
              />
            </div>
          </div>

          <div style={{ margin: "8px 0" }}>
            <label style={{ fontSize: "12px" }}>City Zone</label>
            <input
              value={form.city_zone}
              onChange={(e) => setForm({ ...form, city_zone: e.target.value })}
              style={{
                width: "100%",
                padding: "6px",
                marginTop: "4px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
              }}
              placeholder="e.g. Whitefield"
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              background: "#4f46e5",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Save
          </button>

          <p
            style={{
              marginTop: "8px",
              fontSize: "11px",
              color: "#9ca3af",
            }}
          >
            Tip: Use realistic Bengaluru coordinates like{" "}
            <code>12.9698, 77.7500</code> (Whitefield) or{" "}
            <code>12.9784, 77.6408</code> (Indiranagar).
          </p>
        </form>

        {/* Right panel – map + table */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Map card */}
          <div
            style={{
              background: "#ffffff",
              padding: "12px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>
              Bengaluru Map – Building Energy Hotspots
            </h2>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>
              Marker color = building type. Marker size = 24h total energy (kWh).
            </p>
            <CityMap buildings={buildings} energyIntensity={energyIntensity} />
          </div>

          {/* Table card */}
          <div
            style={{
              background: "#ffffff",
              padding: "16px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>
              Registered Buildings
            </h2>
            <table
              style={{
                width: "100%",
                fontSize: "13px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th align="left">ID</th>
                  <th align="left">Name</th>
                  <th align="left">Type</th>
                  <th align="left">Zone</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.name}</td>
                    <td>{b.type}</td>
                    <td>{b.city_zone || "-"}</td>
                  </tr>
                ))}
                {buildings.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ paddingTop: "12px", color: "#6b7280" }}>
                      No buildings yet. Add one using the form.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityTwin;
