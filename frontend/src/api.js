import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1",
});

// ==== CITY TWIN ====
export const fetchBuildings = () => api.get("/city/buildings");
export const createBuilding = (data) => api.post("/city/buildings", data);

// ==== ENERGY ====
export const fetchEnergyForecast = (buildingId, horizon = 24) =>
  api.get(`/energy/forecast/${buildingId}`, {
    params: { horizon_hours: horizon },
  });

export const fetchEnergyIntensity = () => api.get("/energy/intensity");

// ==== EDUCATION ====
export const fetchInstitutionRisk = (institutionId) =>
  api.get(`/education/risk/${institutionId}`);

// ==== OPTIMIZATION ====
export const optimizeEnergy = (payload) =>
  api.post("/optimize/energy", payload);

// ==== DASHBOARD ====
export const fetchDashboardSummary = () => api.get("/analytics/dashboard-summary");

export default api;
