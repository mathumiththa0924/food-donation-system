import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';

// Removed require() calls for leaflet icons as they break in Vite

const ngoIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204121.png', // Car icon
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const donorIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png', // Home/Pin icon
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

export default function LiveTracker({ roomId, currentUserRole, donorLocation }) {
  // donorLocation expects { lat: Number, lng: Number }
  
  const [ngoLocation, setNgoLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [socket, setSocket] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:5000`);
    setSocket(newSocket);
    
    newSocket.emit("join_room", roomId);

    newSocket.on("receive_location", (data) => {
      // If Donor or NGO is watching, update location based on who is travelling (NGO or Volunteer)
      if ((currentUserRole === 'donor' || currentUserRole === 'ngo') && (data.role === 'ngo' || data.role === 'volunteer')) {
        setNgoLocation({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, currentUserRole]);

  // If currentUser is NGO or Volunteer, watch their location and emit
  useEffect(() => {
    if ((currentUserRole === 'ngo' || currentUserRole === 'volunteer') && socket) {
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newLoc = { lat: latitude, lng: longitude };
            setNgoLocation(newLoc);
            
            socket.emit("send_location", {
              roomId,
              lat: latitude,
              lng: longitude,
              role: currentUserRole
            });
          },
          (err) => console.error("Geolocation Error: ", err),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      } else {
        console.warn("Geolocation is not supported by this browser.");
      }
    }

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [currentUserRole, socket, roomId]);

  // Fetch Route from OSRM
  useEffect(() => {
    if (ngoLocation && donorLocation) {
      const url = `https://router.project-osrm.org/route/v1/driving/${ngoLocation.lng},${ngoLocation.lat};${donorLocation.lng},${donorLocation.lat}?overview=full&geometries=geojson`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            // GeoJSON coordinates are [lng, lat], Leaflet polyline requires [lat, lng]
            const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            setRouteCoords(coords);
          }
        })
        .catch(err => console.error("Failed to fetch route:", err));
    }
  }, [ngoLocation, donorLocation]);

  const mapCenter = ngoLocation || donorLocation || { lat: 6.9271, lng: 79.8612 }; // Default Colombo

  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "2px solid rgba(255,255,255,0.1)", background: "#111" }}>
      <MapContainer center={mapCenter} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw the Route Line (Uber Style) */}
        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="#2ecc71" weight={6} opacity={0.8} />
        )}

        {/* Donor Pin (Static) */}
        {donorLocation && (
          <Marker position={[donorLocation.lat, donorLocation.lng]} icon={donorIcon}>
            <Popup>Donor Location (Food is here)</Popup>
          </Marker>
        )}

        {/* NGO Pin (Moving) */}
        {ngoLocation && (
          <Marker position={[ngoLocation.lat, ngoLocation.lng]} icon={ngoIcon}>
            <Popup>NGO / Volunteer (Moving)</Popup>
          </Marker>
        )}

        {/* Auto-center map to moving NGO location or Donor Location */}
        <MapUpdater center={ngoLocation || donorLocation} />
      </MapContainer>
    </div>
  );
}
