import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./RouteMap.css";

// Fix default marker icons broken by Webpack/Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ROUTE_COLORS = ["#2563eb", "#16a34a", "#ea580c"];

// ORS geometry is [lon, lat] — Leaflet needs [lat, lon]
function toLatLng(coords) {
  return coords.map(([lon, lat]) => [lat, lon]);
}

function FitBounds({ positions }) {
  const map = useMap();
  if (positions.length > 0) {
    map.fitBounds(positions, { padding: [40, 40] });
  }
  return null;
}

function RouteMap({ routeData }) {
  const { pickup, delivery, recommended_route, alternative_routes } = routeData;

  const allRoutes = [recommended_route, ...alternative_routes];

  const pickupPos = [pickup.latitude, pickup.longitude];
  const deliveryPos = [delivery.latitude, delivery.longitude];

  // Use recommended route geometry for initial bounds fit
  const boundsPositions =
    recommended_route.geometry.length > 0
      ? toLatLng(recommended_route.geometry)
      : [pickupPos, deliveryPos];

  return (
    <div className="map-wrapper">
      <h2>🗺 Route Map</h2>

      <MapContainer
        center={pickupPos}
        zoom={7}
        className="leaflet-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds positions={boundsPositions} />

        {/* Draw all routes */}
        {allRoutes.map((route, index) => {
          const positions = toLatLng(route.geometry);
          const isRecommended = index === 0;
          const color = ROUTE_COLORS[index % ROUTE_COLORS.length];

          return (
            <Polyline
              key={index}
              positions={positions}
              pathOptions={{
                color,
                weight: isRecommended ? 6 : 3,
                opacity: isRecommended ? 1 : 0.65,
                dashArray: isRecommended ? null : "8 4",
              }}
            >
              <Popup>
                <div className="map-popup">
                  {isRecommended && <span className="popup-badge">⭐ Recommended</span>}
                  <strong>{route.route_name}</strong>
                  <p>📏 {route.distance_km} km</p>
                  <p>⏱ {route.duration_hr} hrs</p>
                  <p>🚦 Traffic: {route.traffic}</p>
                  <p>💰 Toll: ₹{route.toll_cost}</p>
                  <p>🏆 Score: {route.score}</p>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Pickup marker */}
        <Marker position={pickupPos}>
          <Popup>
            <strong>📦 Pickup</strong>
          </Popup>
        </Marker>

        {/* Delivery marker */}
        <Marker position={deliveryPos}>
          <Popup>
            <strong>🏁 Delivery</strong>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Legend */}
      <div className="map-legend">
        {allRoutes.map((route, index) => (
          <div key={index} className="legend-item">
            <span
              className="legend-dot"
              style={{ background: ROUTE_COLORS[index % ROUTE_COLORS.length] }}
            />
            <span>{index === 0 ? "⭐ " : ""}{route.route_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RouteMap;
