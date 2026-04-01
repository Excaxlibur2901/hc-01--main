import axios from 'axios';

const AI_URL = process.env.AI_URL || 'http://localhost:8001';



// ── Update AI model with completion data ──
export const updateAiData = async (token) => {
  try {
    if (!token.calledAt || !token.completedAt) return;
    await axios.post(`${AI_URL}/update-data`, {
      token_number: token.tokenNumber,
      called_at: token.calledAt.toISOString(),
      completed_at: token.completedAt.toISOString(),
    }, { timeout: 3000 });
  } catch (error) {
    console.warn('AI update skipped (service unavailable)');
  }
};

// ── Mock nearby hospitals database ──
const MOCK_HOSPITALS = [
  { id: 1, name: 'City General Hospital', lat: 28.6200, lng: 77.2100, specializations: ['emergency', 'trauma', 'cardiology', 'general'], availability: 85, beds: 200, phone: '+91-11-2345-6789', address: '123 Main Road, Central Delhi' },
  { id: 2, name: 'Apollo Emergency Center', lat: 28.5500, lng: 77.2500, specializations: ['emergency', 'neurology', 'orthopedics'], availability: 72, beds: 150, phone: '+91-11-9876-5432', address: '456 Ring Road, South Delhi' },
  { id: 3, name: 'Max Super Specialty Hospital', lat: 28.6300, lng: 77.1800, specializations: ['cardiology', 'oncology', 'emergency'], availability: 60, beds: 300, phone: '+91-11-5555-1234', address: '789 Medical Lane, West Delhi' },
  { id: 4, name: 'Fortis Healthcare', lat: 28.5700, lng: 77.3200, specializations: ['orthopedics', 'pediatrics', 'general'], availability: 90, beds: 250, phone: '+91-11-4444-5678', address: '321 Health Ave, East Delhi' },
  { id: 5, name: 'AIIMS Trauma Center', lat: 28.5600, lng: 77.2100, specializations: ['trauma', 'emergency', 'neurology', 'burns'], availability: 45, beds: 500, phone: '+91-11-2222-3333', address: 'Ansari Nagar, South Delhi' },
  { id: 6, name: 'Safdarjung Hospital', lat: 28.5700, lng: 77.2000, specializations: ['general', 'emergency', 'pediatrics'], availability: 55, beds: 400, phone: '+91-11-6666-7777', address: 'Ring Road, South Delhi' },
  { id: 7, name: 'Sir Ganga Ram Hospital', lat: 28.6400, lng: 77.1900, specializations: ['gastroenterology', 'cardiology', 'emergency'], availability: 78, beds: 180, phone: '+91-11-8888-9999', address: 'Rajinder Nagar, Central Delhi' },
  { id: 8, name: 'Medanta - The Medicity', lat: 28.4400, lng: 77.0400, specializations: ['cardiology', 'oncology', 'neurology', 'emergency'], availability: 82, beds: 350, phone: '+91-124-111-2222', address: 'Sector 38, Gurugram' },
];

// ── Calculate distance between two lat/lng points (Haversine) ──
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // km, 1 decimal
}

// ── Map condition text to specialization keywords ──
function detectSpecialization(condition) {
  const lower = (condition || '').toLowerCase();
  if (/heart|chest|cardiac|bp|blood pressure/i.test(lower)) return 'cardiology';
  if (/brain|head|stroke|neuro|seizure/i.test(lower)) return 'neurology';
  if (/bone|fracture|joint|spine|ortho/i.test(lower)) return 'orthopedics';
  if (/child|baby|infant|pediatr/i.test(lower)) return 'pediatrics';
  if (/cancer|tumor|oncol/i.test(lower)) return 'oncology';
  if (/accident|trauma|injury|burn/i.test(lower)) return 'trauma';
  if (/stomach|liver|digest|gastro/i.test(lower)) return 'gastroenterology';
  return 'emergency'; // default for emergencies
}

// ── AI Emergency Redirect: Find & rank nearby hospitals ──
export const findNearbyHospitals = async ({ condition, lat, lng }) => {
  const patientLat = lat || 28.6139;
  const patientLng = lng || 77.2090;
  const neededSpec = detectSpecialization(condition);

  // Weights for scoring
  const W_DISTANCE = 0.35;
  const W_AVAILABILITY = 0.40;
  const W_SPECIALIZATION = 0.25;

  const scored = MOCK_HOSPITALS.map((hospital) => {
    const distance = haversineDistance(patientLat, patientLng, hospital.lat, hospital.lng);
    const maxDist = 30; // normalize within 30km range
    const distScore = Math.max(0, 1 - distance / maxDist) * 100;
    const availScore = hospital.availability;
    const specScore = hospital.specializations.includes(neededSpec) ? 100 : 30;

    const totalScore = Math.round(
      W_DISTANCE * distScore + W_AVAILABILITY * availScore + W_SPECIALIZATION * specScore
    );

    return {
      name: hospital.name,
      distance,
      availability: hospital.availability,
      specialization: neededSpec,
      hasSpecialization: hospital.specializations.includes(neededSpec),
      score: totalScore,
      address: hospital.address,
      phone: hospital.phone,
      beds: hospital.beds,
    };
  });

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 5); // Return top 5
};

// ── Get all nearby hospitals (unranked) ──
export const getAllNearbyHospitals = async ({ lat, lng }) => {
  const patientLat = lat || 28.6139;
  const patientLng = lng || 77.2090;

  return MOCK_HOSPITALS.map((h) => ({
    ...h,
    distance: haversineDistance(patientLat, patientLng, h.lat, h.lng),
  })).sort((a, b) => a.distance - b.distance);
};
