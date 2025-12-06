import React, { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const CityMap = ({ buildings, energyIntensity }) => {
  const blrCenter = [12.9716, 77.5946];

  const buildingsWithCoords = buildings.filter(
    (b) =>
      b.latitude !== null &&
      b.latitude !== undefined &&
      b.longitude !== null &&
      b.longitude !== undefined
  );

  const intensityMap = useMemo(() => {
    const map = {};
    (energyIntensity || []).forEach((item) => {
      map[item.building_id] = item.total_kwh_24h;
    });
    return map;
  }, [energyIntensity]);

  const maxIntensity = useMemo(() => {
    if (!energyIntensity || energyIntensity.length === 0) return 0;
    return energyIntensity.reduce(
      (max, item) => (item.total_kwh_24h > max ? item.total_kwh_24h : max),
      0
    );
  }, [energyIntensity]);

  const getColorForType = (type) => {
    switch (type) {
      case "school":
        return "#3b82f6";
      case "college":
        return "#a855f7";
      case "office":
        return "#f97316";
      case "residential":
        return "#22c55e";
      default:
        return "#6b7280";
    }
  };

  const getRadiusForBuilding = (buildingId) => {
    const baseRadius = 6;
    const intensity = intensityMap[buildingId];
    if (!intensity || !maxIntensity) {
      return baseRadius;
    }
    const scale = intensity / maxIntensity;
    return baseRadius + scale * 12;
  };

  return (
    <div
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <MapContainer
        center={blrCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {buildingsWithCoords.map((b) => {
          const color = getColorForType(b.type);
          const radius = getRadiusForBuilding(b.id);
          const totalKwh = intensityMap[b.id];

          return (
            <CircleMarker
              key={b.id}
              center={[b.latitude, b.longitude]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.75,
                weight: 1,
              }}
            >
              <Popup>
                <div style={{ fontSize: "12px" }}>
                  <strong>{b.name}</strong>
                  <br />
                  Type: {b.type}
                  <br />
                  Zone: {b.city_zone || "N/A"}
                  <br />
                  Lat: {b.latitude.toFixed(4)}, Lon: {b.longitude.toFixed(4)}
                  {typeof totalKwh === "number" && (
                    <>
                      <br />
                      24h Energy: {totalKwh.toFixed(1)} kWh
                    </>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default CityMap;
