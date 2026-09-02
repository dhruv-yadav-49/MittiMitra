// ============================================================
// MittiMitra AI — Mock Farm & Farmer Data
// ============================================================

import type { Farm, Farmer, CropHistory } from '../types';

export const DEMO_FARMER: Farmer = {
  id: 'demo-farmer-1',
  name: 'Dhruv Patel',
  phone: '+91 98765 43210',
  preferredLanguage: 'en',
  state: 'Rajasthan',
  district: 'Jaipur',
  createdAt: '2024-10-01T00:00:00Z',
};

export const DEMO_FARM: Farm = {
  id: 'demo-farm-1',
  farmerId: 'demo-farmer-1',
  name: 'Demo Farm',
  totalLand: 10,
  landUnit: 'acre',
  soilType: 'Sandy Loam',
  irrigationAvailability: 'moderate',
  waterSource: 'Borewell + Canal',
  location: { lat: 26.9124, lng: 75.7873 },
  isDemo: true,
};

export const DEMO_CROP_HISTORY: CropHistory = {
  farmId: 'demo-farm-1',
  previousCrop: 'Soybean',
  previousSeason: 'Kharif 2024',
  approximateYield: 8,
  cropRotation: 'Soybean → Wheat → Chickpea',
};
