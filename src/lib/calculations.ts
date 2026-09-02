// ============================================================
// MittiMitra AI — Deterministic Scoring Calculations
// ============================================================

import type { SoilReading, WeatherData, WaterData, Crop } from '../types';

/** Compute 0-100 soil compatibility score for a crop */
export function calcSoilCompatibility(soil: SoilReading, crop: Crop): number {
  let score = 100;
  // pH
  if (soil.pH < crop.optimalPH.min || soil.pH > crop.optimalPH.max) score -= 20;
  else if (soil.pH < crop.optimalPH.min + 0.3 || soil.pH > crop.optimalPH.max - 0.3) score -= 5;
  // Nitrogen
  if (soil.nitrogen < crop.optimalN.min) score -= Math.min(15, (crop.optimalN.min - soil.nitrogen) / 10);
  // Phosphorus
  if (soil.phosphorus < crop.optimalP.min) score -= Math.min(10, (crop.optimalP.min - soil.phosphorus) * 0.5);
  // Potassium
  if (soil.potassium < crop.optimalK.min) score -= Math.min(10, (crop.optimalK.min - soil.potassium) / 10);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Compute 0-100 weather compatibility score */
export function calcWeatherCompatibility(weather: WeatherData, crop: Crop): number {
  let score = 100;
  if (weather.weatherRisk === 'high') score -= 25;
  if (weather.weatherRisk === 'medium') score -= 10;
  if (crop.waterRequirement === 'very_high' && weather.rainfallForecast < 60) score -= 30;
  if (crop.waterRequirement === 'high' && weather.rainfallForecast < 50) score -= 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Compute 0-100 water stress index (lower = less stress) */
export function calcWaterStress(water: WaterData, crop: Crop): number {
  const availMap: Record<string, number> = { low: 200, moderate: 380, high: 600 };
  const avail = availMap[water.availability] ?? 380;
  const required = crop.waterRequirementMM;
  if (required <= avail) return 0;
  const stress = Math.round(((required - avail) / required) * 100);
  return Math.min(100, stress);
}

/** Compute overall suitability score */
export function calcSuitability(
  soilScore: number,
  weatherScore: number,
  waterStress: number,
  marketRisk: 'low' | 'medium' | 'high'
): number {
  const marketPenalty = marketRisk === 'high' ? 15 : marketRisk === 'medium' ? 7 : 0;
  const waterPenalty = Math.min(40, waterStress * 0.4);
  const raw = soilScore * 0.35 + weatherScore * 0.30 + (100 - waterPenalty) * 0.25 - marketPenalty;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/** Estimate yield in quintal/acre */
export function calcExpectedYield(crop: Crop, suitabilityScore: number): number {
  const range = crop.yieldRange.max - crop.yieldRange.min;
  const factor = suitabilityScore / 100;
  return Math.round((crop.yieldRange.min + range * factor * 0.85) * 10) / 10;
}

/** Estimate profit per acre */
export function calcProfit(yield_qa: number, price: number, cost: number): number {
  return Math.round(yield_qa * price - cost);
}

/** Soil health score 0-100 */
export function calcSoilHealthScore(soil: SoilReading): number {
  let score = 0;
  // pH (ideal 6.0-7.5)
  const pHScore = soil.pH >= 6.0 && soil.pH <= 7.5 ? 20 : soil.pH >= 5.5 && soil.pH <= 8.0 ? 12 : 5;
  // N (ideal 200-400)
  const nScore = soil.nitrogen >= 200 ? 20 : soil.nitrogen >= 100 ? 12 : 5;
  // P (ideal 25-60)
  const pScore = soil.phosphorus >= 25 ? 15 : soil.phosphorus >= 10 ? 9 : 3;
  // K (ideal 150-300)
  const kScore = soil.potassium >= 150 ? 15 : soil.potassium >= 80 ? 9 : 3;
  // OC (ideal 0.6-1.5)
  const ocScore = soil.organicCarbon >= 0.6 ? 15 : soil.organicCarbon >= 0.3 ? 9 : 3;
  // EC (ideal 0.5-1.2)
  const ecScore = soil.ec >= 0.5 && soil.ec <= 1.2 ? 10 : soil.ec < 2.0 ? 6 : 2;
  // Moisture (ideal 35-60)
  const mScore = soil.moisture >= 35 && soil.moisture <= 60 ? 5 : 2;
  score = pHScore + nScore + pScore + kScore + ocScore + ecScore + mScore;
  return Math.min(100, score);
}

/** Risk score 0-100 */
export function calcRiskScore(
  waterStress: number,
  weatherRisk: 'low' | 'medium' | 'high',
  marketRisk: 'low' | 'medium' | 'high'
): number {
  const weatherNum = weatherRisk === 'high' ? 30 : weatherRisk === 'medium' ? 15 : 5;
  const marketNum = marketRisk === 'high' ? 30 : marketRisk === 'medium' ? 15 : 5;
  return Math.min(100, Math.round(waterStress * 0.4 + weatherNum + marketNum));
}
