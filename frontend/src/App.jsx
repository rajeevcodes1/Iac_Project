import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CityTwin from "./pages/CityTwin";
import EnergyAnalytics from "./pages/EnergyAnalytics";
import EducationAnalytics from "./pages/EducationAnalytics";
import Optimization from "./pages/Optimization";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/city" element={<CityTwin />} />
        <Route path="/energy" element={<EnergyAnalytics />} />
        <Route path="/education" element={<EducationAnalytics />} />
        <Route path="/optimization" element={<Optimization />} />
      </Routes>
    </Layout>
  );
};

export default App;
