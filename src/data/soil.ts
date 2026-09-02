// ============================================================
// MittiMitra AI — Mock Soil Data
// ============================================================

import type { SoilReading } from '../types';

export const DEMO_SOIL: SoilReading = {
  farmId: 'demo-farm-1',
  timestamp: new Date().toISOString(),
  pH: 6.8,
  nitrogen: 240,
  phosphorus: 32,
  potassium: 210,
  ec: 0.8,
  moisture: 42,
  organicCarbon: 0.72,
  temperature: 24,
  source: 'demo',
  isValidated: false,
};

export const SOIL_OPTIMAL_RANGES = {
  pH: { low: 5.5, optimal_low: 6.0, optimal_high: 7.5, high: 8.5 },
  nitrogen: { low: 100, optimal_low: 200, optimal_high: 400, high: 600 },
  phosphorus: { low: 10, optimal_low: 25, optimal_high: 60, high: 100 },
  potassium: { low: 100, optimal_low: 150, optimal_high: 300, high: 450 },
  ec: { low: 0.2, optimal_low: 0.5, optimal_high: 1.2, high: 2.0 },
  moisture: { low: 20, optimal_low: 35, optimal_high: 60, high: 80 },
  organicCarbon: { low: 0.3, optimal_low: 0.6, optimal_high: 1.5, high: 3.0 },
  temperature: { low: 10, optimal_low: 18, optimal_high: 30, high: 40 },
};

export function getSoilParameterStatus(
  param: keyof typeof SOIL_OPTIMAL_RANGES,
  value: number
): 'low' | 'optimal' | 'high' | 'moderate' {
  const range = SOIL_OPTIMAL_RANGES[param];
  if (value < range.low) return 'low';
  if (value < range.optimal_low) return 'moderate';
  if (value <= range.optimal_high) return 'optimal';
  if (value <= range.high) return 'moderate';
  return 'high';
}

// Historical soil health trend (demo)
export const SOIL_HEALTH_HISTORY = [
  { month: 'May', score: 58 },
  { month: 'Jun', score: 62 },
  { month: 'Jul', score: 65 },
  { month: 'Aug', score: 68 },
  { month: 'Sep', score: 72 },
  { month: 'Oct', score: 74 },
];

export const NPK_CHART_DATA = [
  { name: 'N', actual: 240, optimal: 280, unit: 'kg/ha' },
  { name: 'P', actual: 32, optimal: 40, unit: 'kg/ha' },
  { name: 'K', actual: 210, optimal: 220, unit: 'kg/ha' },
];
