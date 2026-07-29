import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/LiveRouteMap.css";
import "../styles/Cards.css";
import CITY_COORDS from "./cityCoords";
import { getTrafficBadge, getWeatherBadge } from "./badgeHelpers";

// Fix leaflet default icon path broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom SVG pin factory
function makePinIcon(color, label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <ellipse cx="16" cy="40" rx="6" ry="2.5" fill="rgba(0,0,0,0.25)"/>
      <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 42 16 42 C16 42 32 28 32 16 C32 7.16 24.84 0 16 0Z"
            fill="${color}" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
      <text x="16" y="20" text-anchor="middle" font-size="13" font-family="Arial" fill="white" font-weight="bold">${label}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
  });
}

// Truck icon for current location
const truckIcon = L.divIcon({
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 6px rgba(6,182,212,0.7))">🚚</div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

const pickupIcon  = makePinIcon("#22C55E", "P");
const destIcon    = makePinIcon("#EF4444", "D");

// Auto-fit map bounds to all markers
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [48, 48] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 10);
    }
  }, [map, positions]);
  return null;
}

function LiveRouteMap({ shipment, eta }) {
  const { pickup, currentLocation, destination, traffic, weather, status, remainingDistance } = shipment;

  const pickupCoord  = CITY_COORDS[pickup];
  const currentCoord = CITY_COORDS[currentLocation];
  const destCoord    = CITY_COORDS[destination];

  const unknownCities = [pickup, currentLocation, destination].filter(
    (c) => !CITY_COORDS[c]
  );

  // Build positions array for polyline and bounds (skip unknowns)
  const positions = [pickupCoord, currentCoord, destCoord].filter(Boolean);

  // Deduplicate consecutive identical coords (e.g. pickup === currentLocation)
  const polylinePoints = positions.filter(
    (p, i, arr) => i === 0 || p[0] !== arr[i - 1][0] || p[1] !== arr[i - 1][1]
  );

  const defaultCenter = positions[0] ?? [12.9716, 77.5946];

  const infoItems = [
    { label: "Remaining Distance", value: `${remainingDistance} km`,  cls: "cyan" },
    { label: "ETA",                value: eta.formatted,              cls: "cyan" },
    { label: "Traffic",            value: traffic,                    badge: getTrafficBadge(traffic) },
    { label: "Weather",            value: weather,                    badge: getWeatherBadge(weather) },
    { label: "Status",             value: status,                     cls: "green" },
  ];

  return (
    <div className="route-progress-wrapper">
      <div className="map-card">
        <div className="card-header">
          <span className="card-icon">🗺️</span>
          <h2>Live Route Tracking</h2>
        </div>

        <div className="leaflet-wrapper">
          <MapContainer center={defaultCenter} zoom={7} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitBounds positions={positions} />

            {/* Polyline connecting all known points */}
            {polylinePoints.length > 1 && (
              <Polyline
                positions={polylinePoints}
                pathOptions={{ color: "#3B82F6", weight: 4, opacity: 0.85, dashArray: "8 4" }}
              />
            )}

            {/* Pickup marker */}
            {pickupCoord && (
              <Marker position={pickupCoord} icon={pickupIcon}>
                <Popup>
                  <strong>📦 Pickup</strong><br />{pickup}
                </Popup>
              </Marker>
            )}

            {/* Current location — truck icon (only if different from pickup/dest) */}
            {currentCoord && currentLocation !== pickup && currentLocation !== destination && (
              <Marker position={currentCoord} icon={truckIcon}>
                <Popup>
                  <strong>🚚 Current Location</strong><br />{currentLocation}
                </Popup>
              </Marker>
            )}

            {/* If at pickup, show truck on pickup marker via popup note */}
            {currentCoord && currentLocation === pickup && pickupCoord && (
              <Marker position={[pickupCoord[0] + 0.04, pickupCoord[1]]} icon={truckIcon}>
                <Popup>
                  <strong>🚚 Current Location</strong><br />{currentLocation} (at Pickup)
                </Popup>
              </Marker>
            )}

            {/* Destination marker */}
            {destCoord && (
              <Marker position={destCoord} icon={destIcon}>
                <Popup>
                  <strong>🏁 Destination</strong><br />{destination}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {unknownCities.length > 0 && (
          <div className="map-fallback-notice">
            ⚠️ Coordinates not available for: {unknownCities.join(", ")}. Map shows known locations only.
          </div>
        )}

        {/* Info strip */}
        <div className="map-info-strip">
          {infoItems.map(({ label, value, cls, badge }) => (
            <div className="map-info-item" key={label}>
              <span className="map-info-label">{label}</span>
              {badge
                ? <span className={`badge ${badge}`}>{value}</span>
                : <span className={`map-info-value ${cls ?? ""}`}>{value}</span>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LiveRouteMap;
