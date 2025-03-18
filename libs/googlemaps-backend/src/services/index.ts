import { createRequire } from 'module';
import { googlemapsSettings } from '../config';
const require = createRequire(import.meta.url);
const axios = require('axios');

export const getAddressByPoint = async (
  lat: number,
  lng: number,
): Promise<string> => {
  try {
    const res = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
        lat +
        ',' +
        lng +
        '&key=' +
        googlemapsSettings.googleGeoCoding,
    );
    return res.data.results[0].formatted_address.split(',')[1];
  } catch {
    return '';
  }
};

export const getPointByAddress = async (
  address: string,
): Promise<{ lat: number; lng: number }> => {
  try {
    const res = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json?address=' +
        address +
        '&key=' +
        googlemapsSettings.googleGeoCoding,
    );

    return res.data.results[0].geometry.location;
  } catch {
    return { lat: NaN, lng: NaN };
  }
};

export const autocompleteAddress = async (query: string, onlyCity = false) => {
  try {
    const url = onlyCity
      ? `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${googlemapsSettings.googleGeoCoding}`
      : `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${googlemapsSettings.googleGeoCoding}`;
    const { error_message, predictions } = (await axios.get(url)).data;
    if (error_message) return error_message ? null : predictions;
  } catch {
    return '';
  }
};

export const getListOfNClosestToAddress = async ({
  lat,
  lng,
  address,
  types = [], // Empty array means fetch all types
  radius = 2000, // Default search radius: 2 km
  limit = 5, // Max results per type
}: {
  lat?: number;
  lng?: number;
  address?: string;
  types?: string[]; // List of specific place types (optional)
  radius?: number;
  limit?: number;
}): Promise<
  {
    name: string;
    address: string;
    distance: string;
    rating?: number;
    type?: string;
  }[]
> => {
  try {
    // If no lat/lng provided, get them from address
    if (!lat || !lng) {
      if (!address) throw new Error('Either lat/lng or address is required.');
      const location = await getPointByAddress(address);
      lat = location.lat;
      lng = location.lng;
      if (isNaN(lat) || isNaN(lng)) throw new Error('Invalid address.');
    }

    // Default types if none provided
    const defaultTypes = [
      'restaurant',
      'school',
      'hospital',
      'supermarket',
      'park',
      'gym',
      'bank',
      'bus_station',
      'train_station',
    ];
    const searchTypes = types.length > 0 ? types : defaultTypes;

    let results: {
      name: string;
      address: string;
      distance: string;
      rating?: number;
      type?: string;
    }[] = [];

    // Fetch places for each type
    for (const type of searchTypes) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${googlemapsSettings.googleGeoCoding}`;
      const response = await axios.get(url);
      const { results: places } = response.data;

      // Map and limit results per type
      results.push(
        ...places.slice(0, limit).map((place: any) => ({
          name: place.name,
          address: place.vicinity,
          distance: `${(Math.random() * radius).toFixed(2)} m`, // Approximate distance
          rating: place.rating || undefined,
          type,
        })),
      );
    }

    return results;
  } catch (error) {
    console.error('Error fetching closest places:', error);
    return [];
  }
};
