import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CityTwin from "./pages/CityTwin";
import EnergyAnalytics from "./pages/EnergyAnalytics";
import EducationAnalytics from "./pages/EducationAnalytics";
import Optimization from "./pages/Optimization";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout wraps all pages */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/city" element={<CityTwin />} />
          <Route path="/energy" element={<EnergyAnalytics />} />
          <Route path="/education" element={<EducationAnalytics />} />
          <Route path="/optimization" element={<Optimization />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
