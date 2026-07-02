import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import toast from "react-hot-toast";

// Fix default Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// A component to center the map when location changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// A component to handle map clicks
function LocationClick({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapComponent({ 
  location, 
  onChange, 
  readOnly = false, 
  height = "300px",
  markers = [] // For NgoDashboard to pass multiple markers
}) {
  const defaultCenter = [6.9271, 79.8612]; // Colombo, Sri Lanka
  
  const [center, setCenter] = useState(
    location?.lat && location?.lng ? [location.lat, location.lng] : defaultCenter
  );
  
  const [markerPos, setMarkerPos] = useState(
    location?.lat && location?.lng ? [location.lat, location.lng] : null
  );

  const [searchQuery, setSearchQuery] = useState(location?.address || "");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Perform Address Search (Forward Geocoding)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=LK`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      toast.error("Failed to search location");
    } finally {
      setSearching(false);
    }
  };

  // Perform Reverse Geocoding when clicking on map
  const handleMapClick = async (lat, lng) => {
    if (readOnly) return;
    setMarkerPos([lat, lng]);
    setCenter([lat, lng]);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const address = data.display_name || "Unknown Location";
      setSearchQuery(address);
      if (onChange) {
        onChange({ address, lat, lng });
      }
    } catch (err) {
      toast.error("Could not fetch address for this location");
    }
  };

  const selectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setCenter([lat, lng]);
    setMarkerPos([lat, lng]);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    if (onChange) {
      onChange({ address: result.display_name, lat, lng });
    }
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      {!readOnly && (
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input 
              type="text" 
              placeholder="Search address or click on the map..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.2)",
                fontSize: 14,
                color: "#333",
                background: "#fff"
              }}
            />
            <button 
              type="button"
              onClick={handleSearch}
              disabled={searching}
              style={{
                padding: "0 16px",
                background: "#2e9b4e",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              {searching ? "..." : "Search"}
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "white",
              border: "1px solid #ddd",
              borderRadius: 8,
              marginTop: 4,
              maxHeight: 200,
              overflowY: "auto",
              zIndex: 1000,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              {searchResults.map((res, i) => (
                <div 
                  key={i}
                  onClick={() => selectResult(res)}
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#333"
                  }}
                >
                  {res.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ height, width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)", zIndex: 1 }}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={center} zoom={13} />
          {!readOnly && <LocationClick onLocationSelect={handleMapClick} />}
          
          {/* Single Marker Mode (For Donor Dashboard) */}
          {markerPos && !readOnly && (
            <Marker position={markerPos}>
              <Popup>Selected Location</Popup>
            </Marker>
          )}

          {/* Multiple Markers Mode (For NGO Dashboard Browse) */}
          {markers.length > 0 && markers.map((m, i) => (
            <Marker key={i} position={[m.lat, m.lng]}>
              <Popup>
                <div style={{ padding: "0" }}>
                  <strong style={{display: "block", fontSize: "14px"}}>{m.title}</strong>
                  <span style={{fontSize: "12px", color: "#666"}}>{m.subtitle}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {!readOnly && (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0 }}>
          💡 Tip: You can drag the map and click anywhere to set the exact pin.
        </p>
      )}
    </div>
  );
}
