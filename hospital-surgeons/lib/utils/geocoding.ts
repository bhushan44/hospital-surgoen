export interface GeocodedLocation {
  latitude: number;
  longitude: number;
}

/**
 * Simple geocoding helper using OpenStreetMap Nominatim.
 * Given a free-text address/location, returns latitude/longitude or null on failure.
 */
export async function geocodeLocation(query: string): Promise<GeocodedLocation | null> {
  if (!query || !query.trim()) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim(),
    )}&limit=1`;

    const res = await fetch(url, {
      headers: {
        // Nominatim requires a valid User-Agent identifying the application
        'User-Agent': 'hospital-surgeons-app/1.0 (contact: admin@hospital-surgeons.local)',
      },
    });

    if (!res.ok) {
      console.error('Geocoding request failed with status', res.status);
      return null;
    }

    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(data) || !data[0]) return null;

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

    return { latitude: lat, longitude: lon };
  } catch (err) {
    console.error('Error during geocoding:', err);
    return null;
  }
}


