import { useState, useRef, useEffect, useMemo } from "react";

const SRI_LANKA_LOCATIONS = {
  "COLOMBO": [
    "Avissawella", "Bambalapitiya", "Battaramulla", "Borella", "Cinnamon Gardens",
    "Colombo 1", "Colombo 2", "Colombo 3", "Colombo 4", "Colombo 5", "Colombo 6", "Colombo 7",
    "Dehiwala", "Fort", "Homagama", "Kollupitiya", "Koswatta", "Kottawa", "Kotte", "Maharagama",
    "Malabe", "Moratuwa", "Mount Lavinia", "Nawala", "Nugegoda", "Padukka", "Pelawatte", "Pettah",
    "Rajagiriya", "Ratmalana", "Thalawathugoda", "Wellawatte"
  ],
  "GAMPAHA": ["Biyagama", "Delgoda", "Divulapitiya", "Dompe", "Gampaha", "Ja-Ela", "Kadawatha", "Kandana", "Katunayake", "Kelaniya", "Kiribathgoda", "Minuwangoda", "Mirigama", "Negombo", "Nittambuwa", "Peliyagoda", "Ragama", "Veyangoda", "Wattala"],
  "KALUTARA": ["Agalawatta", "Aluthgama", "Baduraliya", "Bandaragama", "Beruwala", "Bulathsinhala", "Dodangoda", "Horana", "Ingiriya", "Kalutara", "Matugama", "Panadura", "Wadduwa"],
  "KANDY": ["Akurana", "Gampola", "Gelioya", "Galaha", "Kadugannawa", "Kandy", "Katugastota", "Kundasale", "Madawala", "Nawalapitiya", "Peradeniya", "Pilimathalawa", "Wattegama"],
  "MATALE": ["Dambulla", "Galewela", "Matale", "Naula", "Palapathwela", "Rattota", "Sigiriya", "Ukuwela", "Yatawatta"],
  "NUWARA ELIYA": ["Agarapathana", "Bogawantalawa", "Dayagama", "Dickoya", "Ginigathena", "Hatton", "Kotagala", "Maskeliya", "Nanu Oya", "Nuwara Eliya", "Pundaluoya", "Talawakele"],
  "GALLE": ["Ahangama", "Ambalangoda", "Baddegama", "Batapola", "Bentota", "Boossa", "Elpitiya", "Galle", "Habaraduwa", "Hikkaduwa", "Karapitiya", "Karandeniya", "Koggala", "Unawatuna"],
  "MATARA": ["Akuressa", "Deniyaya", "Dickwella", "Hakmana", "Kamburupitiya", "Matara", "Morawaka", "Weligama"],
  "HAMBANTOTA": ["Ambalantota", "Beliatta", "Hambantota", "Middaramulla", "Tangalle", "Tissamaharama", "Walasmulla", "Weeraketiya"],
  "JAFFNA": ["Chavakachcheri", "Chunnakam", "Jaffna", "Kankesanthurai", "Karainagar", "Kopay", "Nallur", "Point Pedro", "Tellippalai", "Velanai"],
  "KILINOCHCHI": ["Kilinochchi", "Pallai", "Paranthan", "Pooneryn"],
  "MANNAR": ["Adampan", "Mannar", "Murunkan", "Nanaddan", "Pesalai", "Thalaimannar"],
  "VAVUNIYA": ["Cheddikulam", "Nedunkeni", "Omanthai", "Vavuniya"],
  "MULLAITIVU": ["Mallavi", "Mankulam", "Mullaitivu", "Oddusuddan", "Puthukkudiyiruppu", "Welioya"],
  "BATTICALOA": ["Araiyampathy", "Batticaloa", "Chenkalady", "Eravur", "Kalkudah", "Kaluwanchikudy", "Kattankudy", "Vakarai", "Valaichchenai"],
  "AMPARA": ["Akkaraipattu", "Ampara", "Dehiattakandiya", "Kalmunai", "Maha Oya", "Nintavur", "Padiyathalawa", "Pottuvil", "Samanthurai", "Uhana"],
  "TRINCOMALEE": ["Gomarankadawala", "Kantale", "Kinniya", "Kuchchaveli", "Mutur", "Nilaveli", "Thampalakamam", "Trincomalee"],
  "KURUNEGALA": ["Alawwa", "Bingiriya", "Galgamuwa", "Giriulla", "Hettipola", "Kuliyapitiya", "Kurunegala", "Mawathagama", "Narammala", "Nikaweratiya", "Pannala", "Polgahawela", "Wariyapola"],
  "PUTTALAM": ["Anamaduwa", "Chilaw", "Dankotuwa", "Kalpitiya", "Madampe", "Mahawewa", "Marawila", "Mundel", "Nattandiya", "Puttalam", "Wennappuwa"],
  "ANURADHAPURA": ["Anuradhapura", "Eppawala", "Galenbindunuwewa", "Galnewa", "Habarana", "Kekirawa", "Medawachchiya", "Mihintale", "Nochchiyagama", "Padaviya", "Tambuttegama"],
  "POLONNARUWA": ["Dimbulagala", "Hingurakgoda", "Kaduruwela", "Medirigiriya", "Polonnaruwa", "Welikanda"],
  "BADULLA": ["Badulla", "Bandarawela", "Diyatalawa", "Ella", "Haldummulla", "Hali-ela", "Haputale", "Mahiyanganaya", "Meegahakiula", "Passara", "Welimada"],
  "MONARAGALA": ["Badalkumbura", "Bibile", "Buttala", "Kataragama", "Medagama", "Monaragala", "Siyambalanduwa", "Wellawaya"],
  "RATNAPURA": ["Ayagama", "Balangoda", "Eheliyagoda", "Elapatha", "Embilipitiya", "Godakawela", "Kahangama", "Kuruwita", "Nivitigala", "Opanayaka", "Pelmadulla", "Rakwana", "Ratnapura"],
  "KEGALLE": ["Aranayaka", "Bulathkohupitiya", "Dehiowita", "Deraniyagala", "Galigamuwa", "Kegalle", "Kitulgala", "Mawanella", "Ruwanwella", "Warakapola", "Yatiyantota"]
};

const DISTRICT_ALIASES = {
  "cmb": "COLOMBO",
  "kdy": "KANDY",
  "gle": "GALLE",
  "mta": "MATARA",
  "hbt": "HAMBANTOTA",
  "jfn": "JAFFNA",
  "tco": "TRINCOMALEE",
  "bad": "BADULLA",
  "kln": "KILINOCHCHI",
  "kga": "KEGALLE"
};

export default function LocationSelector({ district, setDistrict, place, setPlace, districtError, placeError, label = "Pickup Location" }) {
  const [districtSearch, setDistrictSearch] = useState("");
  const [showDistricts, setShowDistricts] = useState(false);
  
  const [placeSearch, setPlaceSearch] = useState("");
  const [showPlaces, setShowPlaces] = useState(false);

  const [detecting, setDetecting] = useState(false);

  const districts = Object.keys(SRI_LANKA_LOCATIONS).sort((a, b) => a.localeCompare(b));
  const filteredDistricts = districts.filter(d => {
    const q = districtSearch.toLowerCase();
    if (d.toLowerCase().includes(q)) return true;
    for (const [alias, realName] of Object.entries(DISTRICT_ALIASES)) {
      if (alias.includes(q) && realName === d) return true;
    }
    return false;
  });

  // Dynamically deduplicate and sort places alphabetically for better UX
  const places = useMemo(() => {
    if (!district) return [];
    const rawPlaces = SRI_LANKA_LOCATIONS[district] || [];
    const uniquePlaces = [];
    const lowerCaseSet = new Set();
    
    rawPlaces.forEach(p => {
      if (!lowerCaseSet.has(p.toLowerCase())) {
        lowerCaseSet.add(p.toLowerCase());
        uniquePlaces.push(p);
      }
    });
    
    return uniquePlaces.sort((a, b) => a.localeCompare(b));
  }, [district]);

  const filteredPlaces = places.filter(p => p.toLowerCase().includes(placeSearch.toLowerCase()));

  const dropdownRef = useRef(null);
  const placeRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDistricts(false);
      }
      if (placeRef.current && !placeRef.current.contains(event.target)) {
        setShowPlaces(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const data = await res.json();
        if (data && data.address) {
          const detectedString = [data.address.state_district, data.address.county, data.address.city, data.address.state].join(" ").toUpperCase();
          const match = Object.keys(SRI_LANKA_LOCATIONS).find(d => detectedString.includes(d));
          if (match) {
            setDistrict(match);
            setPlace(""); // Reset place as it's harder to match exact village names
          } else {
            alert("Could not map your location to a Sri Lankan district.");
          }
        }
      } catch (err) {
        console.error("GPS detect error:", err);
      } finally {
        setDetecting(false);
      }
    }, () => {
      setDetecting(false);
      alert("Location permission denied.");
    });
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "1.2px", textTransform: "uppercase" }}>{label}</label>
        <button 
          onClick={handleGPSDetect} 
          disabled={detecting}
          style={{
            background: "transparent",
            border: "none",
            color: "#e8923a",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          {detecting ? "📍 Detecting..." : "📍 Auto Detect"}
        </button>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* District Selector */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <div 
            onClick={() => setShowDistricts(!showDistricts)}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: district ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.07)",
              border: districtError ? "1px solid #e74c3c" : (showDistricts ? "1px solid rgba(232,146,58,0.7)" : "1px solid rgba(255,255,255,0.15)"),
              borderRadius: 12,
              color: district ? "white" : "rgba(255,255,255,0.45)",
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "all 0.2s ease"
            }}
          >
            {district || "Select District..."}
            <span style={{ fontSize: "12px", opacity: 0.8 }}>▼</span>
          </div>
          {districtError && <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "6px", fontWeight: 500 }}>{districtError}</div>}

          {showDistricts && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 4,
              background: "#1a3a2a", 
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              zIndex: 9999,
              maxHeight: "40vh",
              overflowY: "auto",
              boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
              boxSizing: "border-box"
            }}>
              <div style={{ padding: 10, borderBottom: "1px solid rgba(255,255,255,0.1)", position: "sticky", top: 0, background: "#1a3a2a", zIndex: 10000 }}>
                <input 
                  type="text" 
                  placeholder="Search district..." 
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.05)",
                    color: "white",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  autoFocus
                />
              </div>
              <div style={{ padding: "4px 0" }}>
                {filteredDistricts.length === 0 ? (
                  <div style={{ 
                    padding: "16px 12px", 
                    color: "rgba(255,255,255,0.45)", 
                    fontSize: "14px",
                    textAlign: "center"
                  }}>
                    No districts found
                  </div>
                ) : (
                  filteredDistricts.map(d => (
                    <div 
                      key={d}
                      onClick={() => {
                        setDistrict(d);
                        setPlace(""); 
                        setShowDistricts(false);
                        setDistrictSearch("");
                      }}
                      style={{
                        padding: "12px 16px",
                        color: district === d ? "white" : "white",
                        background: district === d ? "#0078d7" : "transparent", // Blue to match native select highlight
                        cursor: "pointer",
                        fontSize: "15px",
                      }}
                      onMouseEnter={(e) => {
                        if (district !== d) e.target.style.background = "#0078d7"; // Blue hover
                      }}
                      onMouseLeave={(e) => {
                        if (district !== d) e.target.style.background = "transparent";
                      }}
                    >
                      {d}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Place Selector */}
        <div ref={placeRef} style={{ position: "relative" }}>
          <div 
            onClick={() => {
              if (district) setShowPlaces(!showPlaces);
            }}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: district ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.02)",
              border: placeError ? "1px solid #e74c3c" : (showPlaces ? "1px solid rgba(232,146,58,0.7)" : "1px solid rgba(255,255,255,0.15)"),
              borderRadius: 12,
              color: place ? "white" : "rgba(255,255,255,0.45)",
              fontSize: 15,
              cursor: district ? "pointer" : "not-allowed",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "all 0.2s ease",
              opacity: district ? 1 : 0.6
            }}
          >
            {place || "Select area..."}
            <span style={{ fontSize: "12px", opacity: 0.8 }}>▼</span>
          </div>
          {placeError && <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "6px", fontWeight: 500 }}>{placeError}</div>}

          {showPlaces && district && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 4,
              background: "#1a3a2a", 
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              zIndex: 9999,
              maxHeight: "40vh",
              overflowY: "auto",
              boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
              boxSizing: "border-box"
            }}>
              <div style={{ padding: 10, borderBottom: "1px solid rgba(255,255,255,0.1)", position: "sticky", top: 0, background: "#1a3a2a", zIndex: 10000 }}>
                <input 
                  type="text" 
                  placeholder="Search area..." 
                  value={placeSearch}
                  onChange={(e) => setPlaceSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.05)",
                    color: "white",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  autoFocus
                />
              </div>
              <div style={{ padding: "4px 0" }}>
                {filteredPlaces.length === 0 ? (
                  <div style={{ 
                    padding: "16px 12px", 
                    color: "rgba(255,255,255,0.45)", 
                    fontSize: "14px",
                    textAlign: "center"
                  }}>
                    No areas found
                  </div>
                ) : (
                  filteredPlaces.map(p => (
                    <div 
                      key={p}
                      onClick={() => {
                        setPlace(p); 
                        setShowPlaces(false);
                        setPlaceSearch("");
                      }}
                      style={{
                        padding: "12px 16px",
                        color: place === p ? "white" : "white",
                        background: place === p ? "#0078d7" : "transparent",
                        cursor: "pointer",
                        fontSize: "15px",
                      }}
                      onMouseEnter={(e) => {
                        if (place !== p) e.target.style.background = "#0078d7";
                      }}
                      onMouseLeave={(e) => {
                        if (place !== p) e.target.style.background = "transparent";
                      }}
                    >
                      {p}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
