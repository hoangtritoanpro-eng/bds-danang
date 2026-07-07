// src/utils/geocode.js
const GEOCODE_CACHE_KEY = 'bds_geocode_cache';
const RATE_LIMIT_MS = 1500; // 1.5 seconds to be safe with Nominatim
let lastRequestTime = 0;
let queue = [];
let isProcessing = false;

// Load cache from localStorage
const getCache = () => {
  try {
    const cached = localStorage.getItem(GEOCODE_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    return {};
  }
};

const saveCache = (cache) => {
  try {
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {}
};

const processQueue = async () => {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;

  while (queue.length > 0) {
    const now = Date.now();
    const timeToWait = Math.max(0, lastRequestTime + RATE_LIMIT_MS - now);
    
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }

    const { address, resolve, reject } = queue.shift();
    
    // Check cache again just in case
    const cache = getCache();
    if (cache[address]) {
      resolve(cache[address]);
      continue;
    }

    try {
      lastRequestTime = Date.now();
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      let coords = null;
      if (data && data.length > 0) {
        coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }

      // Save to cache even if null to prevent re-querying failed addresses immediately
      cache[address] = coords;
      saveCache(cache);
      
      resolve(coords);
    } catch (error) {
      // If error, don't cache, just reject so we can try again later
      reject(error);
    }
  }

  isProcessing = false;
};

export const geocodeAddress = (address) => {
  return new Promise((resolve, reject) => {
    const cache = getCache();
    // Use !== undefined because we might cache null if not found
    if (cache[address] !== undefined) {
      resolve(cache[address]);
      return;
    }

    queue.push({ address, resolve, reject });
    processQueue();
  });
};
