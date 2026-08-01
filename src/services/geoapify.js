const GEOAPIFY_API_URL = 'https://api.geoapify.com/v1/geocode';

export const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY?.trim() || '';

export class GeoapifyRequestError extends Error {
  /**
   * Create a provider error that preserves the HTTP status for UI recovery.
   *
   * @param {string} message Human-readable provider failure description.
   * @param {number} status HTTP status returned by Geoapify, or zero without one.
   */
  constructor(message, status = 0) {
    super(message);
    this.name = 'GeoapifyRequestError';
    this.status = status;
  }
}

/**
 * Request a Geoapify geocoding endpoint with the configured browser key.
 *
 * @param {string} endpoint Geoapify endpoint name appended to the API base URL.
 * @param {Object} params Query parameters required by the endpoint.
 * @param {AbortSignal} [signal] Optional signal used to cancel obsolete requests.
 *
 * @returns {Promise<Object>} Parsed provider response payload.
 */
const requestGeoapify = async (endpoint, params, signal) => {
  if(!geoapifyApiKey) {
    throw new GeoapifyRequestError('Geoapify API key belum dikonfigurasi.', 401);
  }

  const query = new URLSearchParams({
    ...params,
    format: 'json',
    apiKey: geoapifyApiKey,
  });
  const response = await fetch(`${GEOAPIFY_API_URL}/${endpoint}?${query.toString()}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if(!response.ok) {
    throw new GeoapifyRequestError('Layanan lokasi belum dapat digunakan.', response.status);
  }

  return response.json();
};

/**
 * Search only Indonesian addresses and optionally bias results to the map center.
 *
 * @param {string} text Address text entered by the user.
 * @param {Object} options Optional map center and request cancellation settings.
 *
 * @returns {Promise<Array<Object>>} Provider suggestions restricted to Indonesia.
 */
export const autocompleteAddress = async (text, options = {}) => {
  const params = {
    text,
    filter: 'countrycode:id',
    lang: 'id',
    limit: '5',
  };

  if(Number.isFinite(options.longitude) && Number.isFinite(options.latitude)) {
    params.bias = `proximity:${options.longitude},${options.latitude}`;
  }

  const response = await requestGeoapify('autocomplete', params, options.signal);
  return response.results || [];
};

/**
 * Convert a confirmed marker coordinate to a human-readable Indonesian address.
 *
 * @param {number} latitude Latitude selected on the map.
 * @param {number} longitude Longitude selected on the map.
 * @param {AbortSignal} [signal] Optional signal used to cancel obsolete requests.
 *
 * @returns {Promise<Object|null>} First matching address or null when none exists.
 */
export const reverseGeocode = async (latitude, longitude, signal) => {
  const response = await requestGeoapify('reverse', {
    lat: String(latitude),
    lon: String(longitude),
    lang: 'id',
    limit: '1',
  }, signal);

  return response.results?.[0] || null;
};
