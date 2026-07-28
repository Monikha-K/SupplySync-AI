import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Route Coordinates Dictionary ────────────────────────────────────────────
const ROUTE_COORDINATES = {
  SHP1001: [
    { name: 'Chennai Depot', lat: 13.0827, lng: 80.2707, status: 'completed' },
    { name: 'Vellore Checkpoint', lat: 12.9165, lng: 79.1325, status: 'completed' },
    { name: 'Salem (Current)', lat: 11.6643, lng: 78.1460, status: 'current' },
    { name: 'Erode Bypass', lat: 11.3410, lng: 77.7172, status: 'upcoming' },
    { name: 'Coimbatore Hub', lat: 11.0168, lng: 76.9558, status: 'destination' },
  ],
  SHP1002: [
    { name: 'Bengaluru Hub', lat: 12.9716, lng: 77.5946, status: 'completed' },
    { name: 'Chikkaballapur', lat: 13.4355, lng: 77.7315, status: 'completed' },
    { name: 'Anantapur (Current)', lat: 14.6819, lng: 77.6006, status: 'current' },
    { name: 'Kurnool Checkpoint', lat: 15.8281, lng: 78.0373, status: 'upcoming' },
    { name: 'Hyderabad Hub', lat: 17.3850, lng: 78.4867, status: 'destination' },
  ],
  SHP1003: [
    { name: 'Madurai Depot', lat: 9.9252, lng: 78.1198, status: 'completed' },
    { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, status: 'completed' },
    { name: 'Viluppuram', lat: 11.9401, lng: 79.4861, status: 'completed' },
    { name: 'Tambaram', lat: 12.9249, lng: 80.1000, status: 'completed' },
    { name: 'Chennai Port ✅', lat: 13.0969, lng: 80.2969, status: 'destination' },
  ],
  SHP1004: [
    { name: 'Kochi Port', lat: 9.9312, lng: 76.2673, status: 'completed' },
    { name: 'Thrissur', lat: 10.5276, lng: 76.2144, status: 'completed' },
    { name: 'Palakkad (Current)', lat: 10.7867, lng: 76.6548, status: 'current' },
    { name: 'Coimbatore Hub', lat: 11.0168, lng: 76.9558, status: 'upcoming' },
    { name: 'Bengaluru South', lat: 12.9716, lng: 77.5946, status: 'destination' },
  ],
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  completed:   { emoji: '✅', color: '#22c55e', border: '#16a34a', label: 'Completed' },
  current:     { emoji: '🚚', color: '#2563eb', border: '#60a5fa', label: 'Current Location', pulse: true },
  upcoming:    { emoji: '○',  color: '#334155', border: '#475569', label: 'Upcoming' },
  destination: { emoji: '🏁', color: '#dc2626', border: '#ef4444', label: 'Destination' },
};

function buildPinHTML(wp, shipment) {
  const cfg = STATUS_CONFIG[wp.status] || STATUS_CONFIG.upcoming;
  const animation = cfg.pulse
    ? 'animation: map-pin-pulse 1.8s ease-in-out infinite;'
    : '';
  return `
    <div style="
      background: rgba(15,23,42,0.95);
      border: 2px solid ${cfg.border};
      border-radius: 20px;
      padding: 5px 11px;
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 0 3px ${cfg.color}22;
      white-space: nowrap;
      font-family: Inter, sans-serif;
      backdrop-filter: blur(8px);
      ${animation}
    ">
      <span>${cfg.emoji}</span>
      <span style="color: ${cfg.border}">${wp.name}</span>
    </div>`;
}

function buildPopupHTML(wp, shipment) {
  const cfg = STATUS_CONFIG[wp.status] || STATUS_CONFIG.upcoming;
  return `
    <div style="background:#1e293b;color:#f8fafc;font-family:Inter,sans-serif;padding:14px 16px;border-radius:10px;min-width:210px;border:1px solid #334155;box-shadow:0 8px 24px rgba(0,0,0,0.5);">
      <div style="font-size:13px;font-weight:800;color:${cfg.border};margin-bottom:6px;">📍 ${wp.name}</div>
      <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;">${cfg.label}</div>
      <div style="font-size:11px;color:#cbd5e1;border-top:1px solid #334155;padding-top:8px;display:flex;flex-direction:column;gap:4px;">
        <div>🚚 <strong>${shipment.shipmentId}</strong> — ${shipment.driverName}</div>
        <div>📊 Progress: <strong>${shipment.progress}%</strong> &nbsp;|&nbsp; ETA: <strong>${shipment.eta}</strong></div>
        <div>⚡ Speed: <strong>${shipment.telemetry?.speed || 'N/A'}</strong></div>
        <div>🌡️ Temp: <strong>${shipment.telemetry?.temperature || 'N/A'}</strong></div>
      </div>
    </div>`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MapView({ shipment }) {
  const mapRef = useRef(null);       // holds L.Map instance
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    initMap();
    return () => {
      // cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) updateRoute();
  }, [shipment]);

  function getWaypoints() {
    return ROUTE_COORDINATES[shipment.shipmentId] || [
      { name: shipment.pickup, lat: 13.0827, lng: 80.2707, status: 'completed' },
      { name: shipment.currentLocation, lat: 11.6643, lng: 78.1460, status: 'current' },
      { name: shipment.destination, lat: 11.0168, lng: 76.9558, status: 'destination' },
    ];
  }

  function initMap() {
    if (mapRef.current) return;

    const waypoints = getWaypoints();
    const currentWp = waypoints.find(w => w.status === 'current') || waypoints[Math.floor(waypoints.length / 2)];

    // Create Leaflet map
    const map = L.map('leaflet-map', {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    }).setView([currentWp.lat, currentWp.lng], 7);

    mapRef.current = map;

    // ESRI World Imagery — free satellite tiles, no API key needed
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
      }
    ).addTo(map);

    // Overlay: ESRI World Boundaries & Labels on top of satellite for city names
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, opacity: 0.85 }
    ).addTo(map);

    updateRoute();
  }

  function updateRoute() {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing layers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) map.removeLayer(polylineRef.current);

    const waypoints = getWaypoints();
    const latLngs = [];

    waypoints.forEach((wp) => {
      const pos = [wp.lat, wp.lng];
      latLngs.push(pos);

      // Custom DivIcon pin
      const icon = L.divIcon({
        className: 'custom-map-pin',
        html: buildPinHTML(wp, shipment),
        iconSize: [160, 36],
        iconAnchor: [80, 18],
        popupAnchor: [0, -20],
      });

      const marker = L.marker(pos, { icon, zIndexOffset: wp.status === 'current' ? 1000 : 0 })
        .addTo(map)
        .bindPopup(buildPopupHTML(wp, shipment), {
          maxWidth: 260,
          className: 'dark-popup',
        });

      // Auto-open current location popup
      if (wp.status === 'current') {
        setTimeout(() => marker.openPopup(), 600);
      }

      markersRef.current.push(marker);
    });

    // Draw route polyline — bright yellow/orange so it stands out on satellite
    polylineRef.current = L.polyline(latLngs, {
      color: '#facc15',
      weight: 5,
      opacity: 0.95,
      lineJoin: 'round',
    }).addTo(map);

    // Add a subtle shadow polyline beneath for contrast on satellite
    L.polyline(latLngs, {
      color: '#000',
      weight: 9,
      opacity: 0.35,
      lineJoin: 'round',
    }).addTo(map).bringToBack();

    // Fit map to show all waypoints
    if (latLngs.length > 1) {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] });
    }

    // Force re-render of tiles after resize
    setTimeout(() => map.invalidateSize(), 250);
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-title">
          <span>🗺️</span> Live Route Map &amp; Telemetry
        </div>
        <div className="section-badge" style={{ color: '#facc15', fontWeight: 700 }}>
        🛰️ Satellite View • ESRI World Imagery
      </div>
      </div>

      <div className="map-wrapper">
        <div id="leaflet-map" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
