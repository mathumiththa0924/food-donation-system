// backend/services/smartMatchService.js

/**
 * Calculate distance using Haversine formula
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns distance in km
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Finds the top best-matching NGOs for a given food donation
 * @param {Object} parsedLocation - The parsed location of the donation { address, lat, lng }
 * @param {Array} ngos - List of active NGO users
 * @param {number} limit - Number of matches to return (default 5)
 * @returns {Array} Array of best matching NGOs
 */
const findBestMatches = (parsedLocation, ngos, limit = 5) => {
  if (!ngos || ngos.length === 0) return [];

  const donLat = parsedLocation?.lat;
  const donLng = parsedLocation?.lng;
  const donAddress = parsedLocation?.address ? parsedLocation.address.toLowerCase() : "";

  // Map NGOs with a computed score/distance
  let scoredNgos = ngos.map(ngo => {
    let distance = null;
    let stringMatch = false;

    // Check if we have coordinates for both
    if (donLat && donLng && ngo.officeLocation?.lat && ngo.officeLocation?.lng) {
      distance = getDistanceFromLatLonInKm(donLat, donLng, ngo.officeLocation.lat, ngo.officeLocation.lng);
    } 
    // Fallback to string matching (e.g. check if district/city exists in address)
    else if (donAddress && ngo.officeLocation?.address) {
      const ngoAddr = ngo.officeLocation.address.toLowerCase();
      // Basic string match: check if words from donation address appear in NGO address or vice versa
      const donParts = donAddress.split(',').map(s => s.trim()).filter(s => s.length > 3);
      for (const part of donParts) {
        if (ngoAddr.includes(part)) {
          stringMatch = true;
          break;
        }
      }
    }

    return {
      ngo,
      distance,
      stringMatch,
      // Tie-breaker: NGOs with less total donations received might be prioritized
      totalDonations: ngo.totalDonations || 0
    };
  });

  // Sort logic
  scoredNgos.sort((a, b) => {
    // 1. Both have distance: sort by shortest distance
    if (a.distance !== null && b.distance !== null) {
      return a.distance - b.distance;
    }
    // 2. Only A has distance -> prioritize A
    if (a.distance !== null && b.distance === null) return -1;
    // 3. Only B has distance -> prioritize B
    if (a.distance === null && b.distance !== null) return 1;

    // 4. Both lack distance. Check string matches.
    if (a.stringMatch && !b.stringMatch) return -1;
    if (!a.stringMatch && b.stringMatch) return 1;

    // 5. Fallback: distribute evenly to NGOs with fewer donations
    return a.totalDonations - b.totalDonations;
  });

  return scoredNgos.slice(0, limit).map(item => item.ngo);
};

module.exports = {
  findBestMatches,
  getDistanceFromLatLonInKm
};
