// ============================================================
// MittiMitra AI — Mock Weather Data
// ============================================================

import type { WeatherData, WaterData } from '../types';

export const DEMO_WEATHER: WeatherData = {
  farmId: 'demo-farm-1',
  currentTemp: 24,
  currentHumidity: 62,
  currentRainfall: 3.2,
  rainfallForecast: 68,
  weatherRisk: 'medium',
  source: 'mock',
  forecast: [
    { date: '2024-11-01', maxTemp: 26, minTemp: 14, rainfall: 0, humidity: 58, weatherCondition: 'sunny' },
    { date: '2024-11-02', maxTemp: 25, minTemp: 13, rainfall: 2, humidity: 65, weatherCondition: 'partly_cloudy' },
    { date: '2024-11-03', maxTemp: 22, minTemp: 12, rainfall: 8, humidity: 74, weatherCondition: 'rainy' },
    { date: '2024-11-04', maxTemp: 20, minTemp: 11, rainfall: 5, humidity: 78, weatherCondition: 'cloudy' },
    { date: '2024-11-05', maxTemp: 23, minTemp: 13, rainfall: 0, humidity: 62, weatherCondition: 'partly_cloudy' },
    { date: '2024-11-06', maxTemp: 26, minTemp: 15, rainfall: 0, humidity: 56, weatherCondition: 'sunny' },
    { date: '2024-11-07', maxTemp: 27, minTemp: 16, rainfall: 1, humidity: 54, weatherCondition: 'sunny' },
  ],
};

export const DEMO_WATER: WaterData = {
  farmId: 'demo-farm-1',
  availability: 'moderate',
  source: 'Borewell + Canal',
  irrigationType: 'Flood + Drip (partial)',
  stressScore: 32,
  recommendation: 'Prefer crops with low-to-moderate water requirements. Borewell supplementation available for dry spells.',
};

export const RAINFALL_TREND = [
  { month: 'Jun', actual: 120, average: 110 },
  { month: 'Jul', actual: 185, average: 200 },
  { month: 'Aug', actual: 160, average: 180 },
  { month: 'Sep', actual: 95, average: 100 },
  { month: 'Oct', actual: 22, average: 30 },
  { month: 'Nov', actual: 8, average: 10 },
];

export const TEMP_TREND = [
  { month: 'Jun', max: 40, min: 28 },
  { month: 'Jul', max: 36, min: 26 },
  { month: 'Aug', max: 34, min: 24 },
  { month: 'Sep', max: 32, min: 22 },
  { month: 'Oct', max: 28, min: 16 },
  { month: 'Nov', max: 24, min: 12 },
];

export const CROP_WATER_COMPARISON = [
  { crop: 'Wheat', required: 450, available: 380, stress: 16 },
  { crop: 'Mustard', required: 280, available: 380, stress: 0 },
  { crop: 'Chickpea', required: 300, available: 380, stress: 0 },
  { crop: 'Rice', required: 1200, available: 380, stress: 68 },
  { crop: 'Maize', required: 500, available: 380, stress: 24 },
  { crop: 'Vegetable', required: 400, available: 380, stress: 5 },
];
