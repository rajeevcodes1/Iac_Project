import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { fetchBuildings, createBuilding } from "../api";

// Fix Leaflet default icon paths for bundlers like Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Bengaluru coordinates
const BLR_CENTER = {
  lat: 12.9716,
  lng: 77.5946,
};

const CityTwin = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    type: "school",
    latitude: "",
    longitude: "",
    city_zone: "",
  });
  const [error, setError] = useState("");

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const res = await fetchBuildings();
      setBuildings(res.data || []);
    } catch (e) {
      console.error("Failed to fetch buildings", e);
      setError("Unable to load buildings. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.type) {
      setError("Name and type are required.");
      return;
    }

    const payload = {
      name: form.name,
      type: form.type,
      latitude:
        form.latitude !== "" ? parseFloat(form.latitude) : BLR_CENTER.lat,
      longitude:
        form.longitude !== "" ? parseFloat(form.longitude) : BLR_CENTER.lng,
      city_zone: form.city_zone || "Central",
    };

    try {
      await createBuilding(payload);
      setForm({
        name: "",
        type: "school",
        latitude: "",
        longitude: "",
        city_zone: "",
      });
      loadBuildings();
    } catch (e) {
      console.error("Failed to create building", e);
      setError(
        e.response?.data?.detail || "Failed to create building. Try again."
      );
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "22px", marginBottom: "16px" }}>City Twin</h1>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        {/* LEFT: form + registered buildings */}
        <div
          style={{
            flex: "1 1 320px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Form card */}
          <form
            onSubmit={handleSubmit}
            className="card"
            style={{
              background: "var(--card-bg)",
            }}
          >
            <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>
              Register Building
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div>
                <label style={{ fontSize: "12px" }}>Name</label>
                <input
                  value={form.name}
                  onChange={handleChange("name")}
                  style={{ marginTop: "4px", width: "100%" }}
                  placeholder="e.g. Govt High School Indiranagar"
                />
              </div>

              <div>
                <label style={{ fontSize: "12px" }}>Type</label>
                <select
                  value={form.type}
                  onChange={handleChange("type")}
                  style={{ marginTop: "4px", width: "100%" }}
                >
                  <option value="school">School</option>
                  <option value="college">College</option>
                  <option value="office">Office</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 120px" }}>
                  <label style={{ fontSize: "12px" }}>Latitude</label>
                  <input
                    value={form.latitude}
                    onChange={handleChange("latitude")}
                    style={{ marginTop: "4px", width: "100%" }}
                    placeholder={`${BLR_CENTER.lat}`}
                  />
                </div>
                <div style={{ flex: "1 1 120px" }}>
                  <label style={{ fontSize: "12px" }}>Longitude</label>
                  <input
                    value={form.longitude}
                    onChange={handleChange("longitude")}
                    style={{ marginTop: "4px", width: "100%" }}
                    placeholder={`${BLR_CENTER.lng}`}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px" }}>City Zone</label>
                <input
                  value={form.city_zone}
                  onChange={handleChange("city_zone")}
                  style={{ marginTop: "4px", width: "100%" }}
                  placeholder="e.g. East, Central, Whitefield"
                />
              </div>
            </div>

            {error && (
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#dc2626",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              style={{
                marginTop: "12px",
                alignSelf: "flex-start",
              }}
            >
              Save Building
            </button>
          </form>

          {/* Registered buildings (no inner scroll – use page scroll) */}
          <div
            className="card"


            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <h2 style={{ fontSize: "17px", marginBottom: "4px" }}>
              Registered Buildings
            </h2>

            {loading ? (
              <p className="muted-text" style={{ fontSize: "13px" }}>
                Loading buildings...
              </p>
            ) : (
              <>
                <p
                  className="muted-text"
                  style={{ fontSize: "13px", marginBottom: "4px" }}
                >
                  Total: <strong>{buildings.length}</strong>
                </p>

                {buildings.length === 0 ? (
                  <p
                    className="muted-text"
                    style={{ fontSize: "14px", marginTop: "4px" }}
                  >
                    No buildings registered yet. Use the form above to add one.
                  </p>
                ) : (
                  buildings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--border-subtle)",
                        padding: "14px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "15px",
                          marginBottom: "4px",
                        }}
                      >
                        {b.name}
                      </div>
                      <div
                        className="muted-text"
                        style={{ fontSize: "13px" }}
                      >
                        Type: <strong>{b.type || "-"}</strong>
                      </div>
                      <div
                        className="muted-text"
                        style={{ fontSize: "13px" }}
                      >
                        Zone: <strong>{b.city_zone || "N/A"}</strong>
                      </div>
                      {b.latitude != null && b.longitude != null && (
                        <div
                          className="muted-text"
                          style={{ fontSize: "12px", marginTop: "3px" }}
                        >
                          Lat/Lng: {b.latitude.toFixed(4)},{" "}
                          {b.longitude.toFixed(4)}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT: Map view */}
        <div
          className="card"
          style={{
            flex: "1 1 220px",
            minHeight: "200px",
          }}
        >
          <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>City Map</h2>
          <p
            className="muted-text"
            style={{ fontSize: "12px", marginBottom: "8px" }}
          >
            Visual twin of monitored buildings in Bengaluru.
          </p>
          <div style={{ width: "100%", height: "220px" }}>
            <MapContainer
              center={[BLR_CENTER.lat, BLR_CENTER.lng]}
              zoom={12}
              style={{ width: "100%", height: "100%", borderRadius: "12px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {buildings.map((b) =>
                b.latitude != null && b.longitude != null ? (
                  <Marker
                    key={b.id}
                    position={[b.latitude, b.longitude]}
                    title={b.name}
                  >
                    <Popup>
                      <strong>{b.name}</strong>
                      <br />
                      Type: {b.type}
                      <br />
                      Zone: {b.city_zone || "N/A"}
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityTwin;
