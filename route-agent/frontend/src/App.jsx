import { useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RouteForm from "./components/RouteForm";
import RouteCard from "./components/RouteCard";
import AlternativeRoutes from "./components/AlternativeRoutes";
import RouteMap from "./components/RouteMap";

function App() {
  const [routeData, setRouteData] = useState(null);

  return (
    <>
      <Navbar />

      <Hero />

      <RouteForm setRouteData={setRouteData} />

      {routeData && (
        <>
          <RouteCard routeData={routeData} />

          <AlternativeRoutes routes={routeData.alternative_routes} />

          <RouteMap routeData={routeData} />
        </>
      )}
    </>
  );
}

export default App;
