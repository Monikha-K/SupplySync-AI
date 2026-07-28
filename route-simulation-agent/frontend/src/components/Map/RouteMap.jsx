import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom div icons using emojis to match the design request
const createEmojiIcon = (emoji, className) => L.divIcon({
  html: `<div class="${className}">${emoji}</div>`,
  className: 'custom-emoji-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const vehicleIcon = createEmojiIcon('🚚', 'vehicle-marker-icon');
const destIcon    = createEmojiIcon('📍', 'dest-marker-icon');
const srcIcon     = createEmojiIcon('⭕', 'src-marker-icon');

// Component to recenter map to fit bounds
const MapBounds = ({ waypoints }) => {
  const map = useMap();
  useEffect(() => {
    if (waypoints && waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, waypoints]);
  return null;
};

const RouteMap = ({ srcCoords, destCoords, waypoints, currentLocation, source, destination }) => {
  if (!srcCoords || !destCoords) return null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-header">
        <div className="card-title">🗺️ Route Map</div>
      </div>
      <div className="map-wrapper" style={{ flex: 1, minHeight: '480px' }}>
        <MapContainer 
          center={srcCoords} 
          zoom={7} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <MapBounds waypoints={waypoints} />
          
          <Polyline positions={waypoints} color="#2563EB" weight={4} opacity={0.6} dashArray="8, 8" />
          
          <Marker position={srcCoords} icon={srcIcon}>
            <Popup>Source: {source}</Popup>
          </Marker>
          <Marker position={destCoords} icon={destIcon}>
            <Popup>Destination: {destination}</Popup>
          </Marker>
          
          <Marker position={currentLocation} icon={vehicleIcon} zIndexOffset={1000}>
            <Popup>Current Location</Popup>
          </Marker>
        </MapContainer>
        <div className="map-overlay-label">
          {source} → {destination}
        </div>
      </div>
    </div>
  );
};

export default RouteMap;
