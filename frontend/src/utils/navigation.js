export const HOME_ORIGIN_COORDS = {
  lat: 7.231289,
  lng: 81.845351,
};

/**
 * Returns a high-precision search query string for Google Maps that matches
 * the exact business or attraction name, avoiding fuzzy misdirection to neighboring shops.
 */
export function getPlaceSearchQuery(place) {
  if (!place) return 'Akkaraipattu, Sri Lanka';
  const cleanName = (place.name || '').trim();
  const rawAddr = place.address || '';
  const cleanAddress = rawAddr
    .replace(/^[0-9A-Z]{4}\+[0-9A-Z]{2,4}\s*,?\s*/i, '')
    .split('(')[0]
    .trim();

  if (cleanAddress && !cleanName.toLowerCase().includes(cleanAddress.toLowerCase())) {
    return `${cleanName}, ${cleanAddress}`;
  }
  if (
    !cleanName.toLowerCase().includes('akkaraipattu') &&
    !cleanName.toLowerCase().includes('oluvil') &&
    !cleanName.toLowerCase().includes('addalaichenai')
  ) {
    return `${cleanName}, Akkaraipattu`;
  }
  return cleanName;
}

/**
 * View on Google Maps பட்டனுக்கான துல்லியமான URL
 * காலாவதியான Firebase Dynamic Link பிழையை (maps.app.goo.gl 404) முற்றிலும் தடுக்கிறது.
 */
export function getSafeGoogleMapsUrl(place) {
  if (!place) return 'https://www.google.com/maps';

  if (
    place.googleMapsUrl &&
    typeof place.googleMapsUrl === 'string' &&
    !place.googleMapsUrl.includes('maps.app.goo.gl') &&
    place.googleMapsUrl.startsWith('http')
  ) {
    return place.googleMapsUrl;
  }

  if (place.coordinates?.lat && place.coordinates?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getPlaceSearchQuery(place))}`;
}

/**
 * Generates an accurate single-stop Google Maps Directions URL
 * starting strictly from the Home Location (7.231289, 81.845351).
 */
export function getGoogleMapsDirectionsUrl(
  place,
  originLat = HOME_ORIGIN_COORDS.lat,
  originLng = HOME_ORIGIN_COORDS.lng
) {
  if (!place) return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}`;
  const destinationQuery = getPlaceSearchQuery(place);
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${encodeURIComponent(destinationQuery)}&travelmode=driving`;
}

/**
 * Generates a multi-stop Google Maps Directions URL for the entire itinerary.
 * - Starting point is strictly the Home Origin (7.231289, 81.845351).
 * - Intermediate stops are passed as waypoints using exact place queries.
 * - Final stop is passed as the destination.
 * - Exactly matches the number and order of places selected in the planner.
 */
export function getMultiStopDirectionsUrl(
  stops,
  originLat = HOME_ORIGIN_COORDS.lat,
  originLng = HOME_ORIGIN_COORDS.lng
) {
  if (!stops || stops.length === 0) {
    return `https://www.google.com/maps/search/?api=1&query=${originLat},${originLng}`;
  }

  const queries = stops.map((place) => getPlaceSearchQuery(place));

  if (stops.length === 1) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${encodeURIComponent(queries[0])}&travelmode=driving`;
  }

  const destination = queries[queries.length - 1];
  const waypoints = queries.slice(0, -1).join('|');

  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
}