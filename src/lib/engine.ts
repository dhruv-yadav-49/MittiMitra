// ============================================================
// MittiMitra AI — Decision Engine (MVP Simulation)
// ============================================================
//
// Label: "AI Decision Engine — MVP Simulation"
//
// This is a DETERMINISTIC, RULE-BASED scoring engine.
// It is NOT a trained ML model.
// Same inputs always produce same outputs (no Math.random).
//
// Architecture is designed so this module can be replaced
// by a FastAPI / XGBoost / Random Forest backend in the future
// by simply swapping out `runAIDecisionEngine()`.
//
// ============================================================

import type {
  SoilReading,
  WeatherData,
  WaterData,
  MarketData,
  CropHistory,
  Crop,
  CropRecommendation,
} from '../types';

// ============================================================
// HELPER: Safe clamp & round
// ============================================================

function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, val));
}

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

function roundInt(val: number): number {
  return Math.round(val);
}

/**
 * Range-based scoring: returns 0–100 based on how far `value` is from the
 * optimal [optLow, optHigh] range.
 *
 * optLow..optHigh  → 100
 * slightly outside → 70–99
 * moderately       → 40–69
 * severely         → 0–39
 */
function rangeScore(
  value: number,
  optLow: number,
  optHigh: number,
  absLow: number,
  absHigh: number
): number {
  if (value >= optLow && value <= optHigh) return 100;

  const span = optHigh - optLow;
  const tolerance = span * 0.5; // 50% outside = moderate

  if (value < optLow) {
    const deficit = optLow - value;
    if (deficit <= tolerance * 0.3) return 90;
    if (deficit <= tolerance * 0.6) return 75;
    if (deficit <= tolerance) return 55;
    if (value >= absLow) return 30;
    return 10;
  } else {
    const excess = value - optHigh;
    if (excess <= tolerance * 0.3) return 90;
    if (excess <= tolerance * 0.6) return 75;
    if (excess <= tolerance) return 55;
    if (value <= absHigh) return 30;
    return 10;
  }
}

// ============================================================
// 1. SOIL SUITABILITY
// ============================================================

export interface SoilSuitabilityResult {
  score: number; // 0-100
  breakdown: {
    pH: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ec: number;
    moisture: number;
    organicCarbon: number;
  };
  explanations: string[];
}

export function calculateSoilSuitability(
  soil: SoilReading,
  crop: Crop
): SoilSuitabilityResult {
  const explanations: string[] = [];

  // pH
  const phScore = rangeScore(soil.pH, crop.optimalPH.min, crop.optimalPH.max, 4.5, 9.0);
  if (phScore >= 90) explanations.push(`Soil pH (${soil.pH}) is within the optimal range for ${crop.name}.`);
  else if (phScore >= 70) explanations.push(`Soil pH (${soil.pH}) is slightly outside the optimal range (${crop.optimalPH.min}–${crop.optimalPH.max}).`);
  else explanations.push(`⚠ Soil pH (${soil.pH}) is outside the suitable range for ${crop.name} — soil amendment recommended.`);

  // Nitrogen
  const nScore = rangeScore(soil.nitrogen, crop.optimalN.min, crop.optimalN.max, 0, 800);
  if (nScore >= 90) explanations.push(`Nitrogen (${soil.nitrogen} kg/ha) is adequate for ${crop.name}.`);
  else if (soil.nitrogen < crop.optimalN.min) explanations.push(`Nitrogen (${soil.nitrogen} kg/ha) is below the optimal range — top-dress fertilizer may be needed.`);
  else explanations.push(`Nitrogen (${soil.nitrogen} kg/ha) is above the optimal range — monitor for lodging.`);

  // Phosphorus
  const pScore = rangeScore(soil.phosphorus, crop.optimalP.min, crop.optimalP.max, 0, 150);
  if (pScore >= 90) explanations.push(`Phosphorus (${soil.phosphorus} kg/ha) is adequate.`);
  else if (soil.phosphorus < crop.optimalP.min) explanations.push(`Phosphorus (${soil.phosphorus} kg/ha) is slightly low — DAP application recommended.`);

  // Potassium
  const kScore = rangeScore(soil.potassium, crop.optimalK.min, crop.optimalK.max, 0, 600);
  if (kScore >= 90) explanations.push(`Potassium (${soil.potassium} kg/ha) is in the suitable range.`);
  else if (soil.potassium < crop.optimalK.min) explanations.push(`Potassium (${soil.potassium} kg/ha) is slightly below optimal — MOP supplement may help.`);

  // EC
  const maxEC = crop.id === 'rice' ? 2.0 : crop.id === 'vegetable' ? 1.5 : 2.5;
  const ecScore = rangeScore(soil.ec, 0.3, maxEC, 0, 5);
  if (soil.ec > maxEC) explanations.push(`⚠ EC (${soil.ec} dS/m) may indicate salinity stress for ${crop.name}.`);

  // Moisture
  const moistureScore = rangeScore(soil.moisture, 35, 65, 10, 90);
  if (moistureScore >= 90) explanations.push(`Soil moisture (${soil.moisture}%) is adequate.`);
  else if (soil.moisture < 35) explanations.push(`Soil moisture (${soil.moisture}%) is low — pre-sowing irrigation recommended.`);

  // Organic Carbon
  const ocOptLow = crop.id === 'vegetable' ? 0.8 : 0.5;
  const ocScore = rangeScore(soil.organicCarbon, ocOptLow, 2.0, 0, 4);
  if (soil.organicCarbon < ocOptLow) explanations.push(`Organic carbon (${soil.organicCarbon}%) is below optimal — incorporate FYM before sowing.`);

  const breakdown = {
    pH: roundInt(phScore),
    nitrogen: roundInt(nScore),
    phosphorus: roundInt(pScore),
    potassium: roundInt(kScore),
    ec: roundInt(ecScore),
    moisture: roundInt(moistureScore),
    organicCarbon: roundInt(ocScore),
  };

  // Weighted composite
  const score = roundInt(
    phScore * 0.25 +
    nScore * 0.20 +
    pScore * 0.15 +
    kScore * 0.15 +
    ecScore * 0.10 +
    moistureScore * 0.10 +
    ocScore * 0.05
  );

  return { score: clamp(score), breakdown, explanations };
}

// ============================================================
// 2. WEATHER SUITABILITY
// ============================================================

export interface WeatherSuitabilityResult {
  score: number;
  explanations: string[];
}

export function calculateWeatherSuitability(
  weather: WeatherData,
  crop: Crop
): WeatherSuitabilityResult {
  const explanations: string[] = [];
  let score = 100;

  // Temperature suitability
  const optTemp: Record<string, { min: number; max: number }> = {
    wheat: { min: 10, max: 25 },
    mustard: { min: 10, max: 25 },
    chickpea: { min: 10, max: 28 },
    rice: { min: 20, max: 35 },
    maize: { min: 18, max: 35 },
    vegetable: { min: 15, max: 30 },
  };
  const tempRange = optTemp[crop.id] ?? { min: 15, max: 30 };
  const tempScore = rangeScore(weather.currentTemp, tempRange.min, tempRange.max, 0, 50);
  if (tempScore >= 90) {
    explanations.push(`Current temperature (${weather.currentTemp}°C) is within the preferred range for ${crop.name}.`);
  } else if (weather.currentTemp > tempRange.max) {
    const penalty = (weather.currentTemp - tempRange.max) * 3;
    score -= penalty;
    explanations.push(`⚠ Temperature (${weather.currentTemp}°C) is above the optimal range — heat stress risk for ${crop.name}.`);
  } else {
    const penalty = (tempRange.min - weather.currentTemp) * 2;
    score -= penalty;
    explanations.push(`⚠ Temperature (${weather.currentTemp}°C) is below the optimal range — frost risk may affect germination.`);
  }

  // Rainfall forecast vs crop need
  const rainfallNeed: Record<string, number> = {
    wheat: 50, mustard: 30, chickpea: 30, rice: 120, maize: 60, vegetable: 45,
  };
  const cropRainNeed = rainfallNeed[crop.id] ?? 50;
  if (weather.rainfallForecast >= cropRainNeed) {
    explanations.push(`Rainfall forecast (${weather.rainfallForecast}mm) meets the expected need for ${crop.name}.`);
  } else {
    const shortfall = cropRainNeed - weather.rainfallForecast;
    const penalty = Math.min(30, shortfall * 0.5);
    score -= penalty;
    explanations.push(`Lower rainfall forecast (${weather.rainfallForecast}mm vs ${cropRainNeed}mm needed) may increase irrigation dependency.`);
  }

  // Humidity
  const optHumid: Record<string, { min: number; max: number }> = {
    wheat: { min: 40, max: 70 },
    mustard: { min: 35, max: 65 },
    chickpea: { min: 35, max: 60 },
    rice: { min: 60, max: 90 },
    maize: { min: 50, max: 80 },
    vegetable: { min: 50, max: 80 },
  };
  const humRange = optHumid[crop.id] ?? { min: 40, max: 75 };
  if (weather.currentHumidity >= humRange.min && weather.currentHumidity <= humRange.max) {
    explanations.push(`Humidity (${weather.currentHumidity}%) is within the suitable range.`);
  } else if (weather.currentHumidity > humRange.max) {
    score -= 10;
    explanations.push(`⚠ High humidity (${weather.currentHumidity}%) increases disease risk (fungal/blight) for ${crop.name}.`);
  }

  // Weather risk penalty
  if (weather.weatherRisk === 'high') {
    score -= 25;
    explanations.push(`⚠ High weather risk flagged — adverse conditions are forecast this season.`);
  } else if (weather.weatherRisk === 'medium') {
    score -= 10;
    explanations.push(`Moderate weather uncertainty exists — monitor IMD advisories before sowing.`);
  } else {
    explanations.push(`Weather conditions are generally favorable for the current season.`);
  }

  return { score: clamp(roundInt(score)), explanations };
}

// ============================================================
// 3. WATER FIT
// ============================================================

export interface WaterFitResult {
  score: number;
  availableWaterMM: number;
  requiredWaterMM: number;
  stressPct: number;
  explanations: string[];
}

export function calculateWaterFit(
  water: WaterData,
  crop: Crop
): WaterFitResult {
  const availMap: Record<string, number> = {
    low: 200,
    moderate: 380,
    high: 620,
  };
  const availableWaterMM = availMap[water.availability] ?? 380;
  const requiredWaterMM = crop.waterRequirementMM;
  const explanations: string[] = [];

  let score: number;
  let stressPct: number;

  if (requiredWaterMM <= availableWaterMM) {
    // surplus — full score, no stress
    score = 100;
    stressPct = 0;
    explanations.push(`Water availability (${availableWaterMM}mm) fully covers the crop's requirement (${requiredWaterMM}mm).`);
  } else {
    const ratio = availableWaterMM / requiredWaterMM;
    stressPct = roundInt((1 - ratio) * 100);
    score = roundInt(ratio * 100);
    if (score < 50) {
      explanations.push(`⚠ Crop water requirement (${requiredWaterMM}mm) significantly exceeds available water (${availableWaterMM}mm) — high irrigation stress expected.`);
    } else {
      explanations.push(`Crop water requirement (${requiredWaterMM}mm) slightly exceeds availability (${availableWaterMM}mm) — supplemental irrigation needed.`);
    }
  }

  // Water source bonus
  if (water.source?.toLowerCase().includes('canal') || water.source?.toLowerCase().includes('drip')) {
    score = clamp(score + 5);
    explanations.push(`Canal or drip irrigation availability provides additional water reliability.`);
  }

  // Pre-existing stress score impact
  if (water.stressScore > 60) {
    score = clamp(score - 15);
    explanations.push(`⚠ Farm water stress index (${water.stressScore}/100) is elevated — irrigation planning is critical.`);
  } else if (water.stressScore > 30) {
    score = clamp(score - 5);
  }

  return {
    score: clamp(roundInt(score)),
    availableWaterMM,
    requiredWaterMM,
    stressPct: clamp(stressPct),
    explanations,
  };
}

// ============================================================
// 4. MARKET SCORE
// ============================================================

export interface MarketScoreResult {
  score: number;
  currentPrice: number;
  priceAttractivenessScore: number;
  trendScore: number;
  demandScore: number;
  riskScore: number;
  explanations: string[];
}

export function calculateMarketScore(
  market: MarketData,
  crop: Crop
): MarketScoreResult {
  const marketEntry = market.prices.find((p) => p.cropId === crop.id);
  const explanations: string[] = [];

  if (!marketEntry) {
    explanations.push(`Market data not available for ${crop.name} — using MSP as reference.`);
    return {
      score: 55,
      currentPrice: crop.msp,
      priceAttractivenessScore: 55,
      trendScore: 50,
      demandScore: 50,
      riskScore: 50,
      explanations,
    };
  }

  // Price attractiveness: compare to MSP (40% weight)
  const premiumOverMSP = ((marketEntry.currentPrice - crop.msp) / crop.msp) * 100;
  let priceScore: number;
  if (premiumOverMSP >= 20) { priceScore = 100; }
  else if (premiumOverMSP >= 10) { priceScore = 85; }
  else if (premiumOverMSP >= 0) { priceScore = 70; }
  else if (premiumOverMSP >= -10) { priceScore = 50; }
  else { priceScore = 30; }

  if (premiumOverMSP >= 5) {
    explanations.push(`Market price (₹${marketEntry.currentPrice}/q) is ${premiumOverMSP.toFixed(0)}% above MSP — favorable price environment.`);
  } else if (premiumOverMSP >= 0) {
    explanations.push(`Market price (₹${marketEntry.currentPrice}/q) is near MSP — moderate profitability.`);
  } else {
    explanations.push(`⚠ Market price (₹${marketEntry.currentPrice}/q) is below MSP — price risk exists.`);
  }

  // Price trend (20% weight)
  let trendScore: number;
  if (marketEntry.trend === 'rising') {
    trendScore = 90;
    explanations.push(`Price trend is rising — favorable for end-of-season sales.`);
  } else if (marketEntry.trend === 'stable') {
    trendScore = 65;
    explanations.push(`Price trend is stable — predictable revenue outlook.`);
  } else {
    trendScore = 35;
    explanations.push(`⚠ Price trend is declining — revenue projections carry downside risk.`);
  }

  // Demand (20% weight)
  let demandScore: number;
  if (marketEntry.demand === 'high') {
    demandScore = 90;
    explanations.push(`Market demand is high — good chance of quick off-take.`);
  } else if (marketEntry.demand === 'moderate') {
    demandScore = 65;
    explanations.push(`Market demand is moderate.`);
  } else {
    demandScore = 35;
    explanations.push(`⚠ Market demand is low — off-take may be slow.`);
  }

  // Market risk (20% weight — inverted: lower risk = higher score)
  let riskPenaltyScore: number;
  if (marketEntry.marketRisk === 'low') {
    riskPenaltyScore = 90;
  } else if (marketEntry.marketRisk === 'medium') {
    riskPenaltyScore = 60;
    explanations.push(`⚠ Medium market risk — price volatility is possible.`);
  } else {
    riskPenaltyScore = 25;
    explanations.push(`⚠ High market risk — price volatility is significant.`);
  }

  const composite = roundInt(
    priceScore * 0.40 +
    trendScore * 0.20 +
    demandScore * 0.20 +
    riskPenaltyScore * 0.20
  );

  return {
    score: clamp(composite),
    currentPrice: marketEntry.currentPrice,
    priceAttractivenessScore: roundInt(priceScore),
    trendScore: roundInt(trendScore),
    demandScore: roundInt(demandScore),
    riskScore: roundInt(riskPenaltyScore),
    explanations,
  };
}

// ============================================================
// 5. HISTORY SCORE
// ============================================================

export interface HistoryScoreResult {
  score: number;
  explanations: string[];
}

export function calculateHistoryScore(
  history: CropHistory,
  crop: Crop
): HistoryScoreResult {
  const explanations: string[] = [];
  let score = 65; // neutral starting point

  // Crop rotation compatibility
  const goodAfter: Record<string, string[]> = {
    wheat: ['soybean', 'chickpea', 'lentil', 'mung', 'groundnut'],
    mustard: ['wheat', 'soybean', 'chickpea'],
    chickpea: ['wheat', 'maize', 'sorghum'],
    rice: ['wheat', 'mustard'],
    maize: ['soybean', 'chickpea', 'cotton'],
    vegetable: ['cereal', 'wheat', 'maize', 'soybean'],
  };

  const prevCropLower = history.previousCrop.toLowerCase();
  const beneficialPrev = goodAfter[crop.id] ?? [];
  const isGoodRotation = beneficialPrev.some((c) => prevCropLower.includes(c));

  if (isGoodRotation) {
    score += 20;
    explanations.push(`Previous crop (${history.previousCrop}) creates a beneficial rotation for ${crop.name}.`);
  } else if (prevCropLower.includes(crop.id.toLowerCase())) {
    // Same crop — continuous cropping penalty
    score -= 15;
    explanations.push(`⚠ Continuous cropping of ${crop.name} reduces rotation benefit and may increase pest pressure.`);
  } else {
    explanations.push(`Previous crop (${history.previousCrop}) is a neutral predecessor for ${crop.name}.`);
  }

  // Previous yield as a productivity signal
  if (history.approximateYield > 0) {
    score += 10;
    explanations.push(`Previous farm yield (${history.approximateYield} q/ac) indicates reasonable productivity on this land.`);
  }

  // No history penalty
  if (!history.previousCrop || history.previousCrop === '') {
    score -= 10;
    explanations.push(`No historical crop data available — history signal is neutral.`);
  }

  return { score: clamp(roundInt(score)), explanations };
}

// ============================================================
// 6. YIELD ESTIMATION
// ============================================================

export function estimateYield(
  crop: Crop,
  soilScore: number,
  weatherScore: number,
  waterFitScore: number
): number {
  // adjustmentFactor based on soil (40%), weather (25%), water (35%)
  const adjustmentFactor =
    (soilScore * 0.40 + weatherScore * 0.25 + waterFitScore * 0.35) / 100;

  const baseYield = crop.yieldRange.min +
    (crop.yieldRange.max - crop.yieldRange.min) * adjustmentFactor * 0.90;

  return round1(clamp(baseYield, crop.yieldRange.min * 0.5, crop.yieldRange.max));
}

// ============================================================
// 7. FINANCIAL CALCULATIONS
// ============================================================

export interface FinancialResult {
  estimatedCost: number;
  expectedRevenue: number;
  expectedProfit: number;
  profitMargin: number; // %
}

export function calculateFinancials(
  crop: Crop,
  expectedYield: number,
  marketPrice: number
): FinancialResult {
  const estimatedCost = crop.inputCostPerAcre;
  const expectedRevenue = roundInt(expectedYield * marketPrice);
  const expectedProfit = expectedRevenue - estimatedCost;
  const profitMargin = expectedRevenue > 0
    ? roundInt((expectedProfit / expectedRevenue) * 100)
    : 0;

  return { estimatedCost, expectedRevenue, expectedProfit, profitMargin };
}

// ============================================================
// 8. RISK ENGINE
// ============================================================

export interface RiskResult {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  waterRisk: number;
  weatherRisk: number;
  marketRisk: number;
  soilRisk: number;
  explanations: string[];
}

export function calculateRisk(
  waterFitResult: WaterFitResult,
  weatherData: WeatherData,
  marketData: MarketData,
  soilSuitabilityResult: SoilSuitabilityResult,
  crop: Crop
): RiskResult {
  const explanations: string[] = [];

  // Water risk: inverse of water fit score (35% weight)
  const waterRisk = 100 - waterFitResult.score;

  // Weather risk (25% weight)
  const weatherRiskMap: Record<string, number> = { low: 15, medium: 45, high: 80 };
  const weatherRiskNum = weatherRiskMap[weatherData.weatherRisk] ?? 45;

  // Market risk (25% weight)
  const marketEntry = marketData.prices.find((p) => p.cropId === crop.id);
  const marketRiskMap: Record<string, number> = { low: 10, medium: 45, high: 80 };
  const marketRiskNum = marketRiskMap[marketEntry?.marketRisk ?? 'medium'] ?? 45;

  // Soil risk (15% weight): inverse of soil score
  const soilRisk = clamp(100 - soilSuitabilityResult.score);

  const composite = roundInt(
    waterRisk * 0.35 +
    weatherRiskNum * 0.25 +
    marketRiskNum * 0.25 +
    soilRisk * 0.15
  );

  const riskScore = clamp(composite);
  const riskLevel = riskScore >= 55 ? 'high' : riskScore >= 35 ? 'medium' : 'low';

  if (waterRisk > 50) explanations.push(`High water stress risk — crop water requirement significantly exceeds availability.`);
  if (weatherRiskNum > 50) explanations.push(`Elevated weather risk this season.`);
  if (marketRiskNum > 50) explanations.push(`High market price volatility — revenue projections are sensitive to price swings.`);
  if (soilRisk > 50) explanations.push(`Soil conditions are partially unsuitable — yields may be below average.`);

  return {
    riskScore,
    riskLevel,
    waterRisk: clamp(roundInt(waterRisk)),
    weatherRisk: clamp(roundInt(weatherRiskNum)),
    marketRisk: clamp(roundInt(marketRiskNum)),
    soilRisk: clamp(roundInt(soilRisk)),
    explanations,
  };
}

// ============================================================
// 9. CONFIDENCE SCORE
// ============================================================

export function calculateConfidence(
  soil: SoilReading,
  weather: WeatherData,
  water: WaterData,
  market: MarketData,
  history: CropHistory,
  crop: Crop
): number {
  let score = 0;

  // Soil: 25%
  const soilComplete = [soil.pH, soil.nitrogen, soil.phosphorus, soil.potassium, soil.ec, soil.moisture, soil.organicCarbon].every(
    (v) => v !== undefined && v !== null && !isNaN(v)
  );
  score += soilComplete ? 25 : 15;

  // Weather: 25%
  score += weather.source === 'imd' ? 25 : 20;

  // Water: 20%
  score += water.availability ? 20 : 10;

  // Market: 20%
  const hasMarket = market.prices.some((p) => p.cropId === crop.id);
  score += hasMarket ? 20 : 10;

  // History: 10%
  score += history.previousCrop ? 10 : 5;

  return clamp(roundInt(score));
}

// ============================================================
// 10. OVERALL SCORE
// ============================================================

export function calculateOverallScore(
  soilScore: number,
  weatherScore: number,
  waterFitScore: number,
  marketScore: number,
  historyScore: number,
  riskScore: number
): number {
  // Weighted base (sums to 85% leaving 15% for risk adjustment)
  const base = roundInt(
    soilScore * 0.25 +
    weatherScore * 0.15 +
    waterFitScore * 0.20 +
    marketScore * 0.15 +
    waterFitScore * 0.05 +   // extra emphasis on water (practical importance)
    historyScore * 0.10 +
    (100 - riskScore) * 0.10 // risk-awareness embedded
  );

  // Risk penalty: higher risk reduces the overall score
  const riskPenalty = roundInt(riskScore * 0.15);
  return clamp(base - riskPenalty);
}

// ============================================================
// 11. RECOMMENDATION STATUS
// ============================================================

export function deriveRecommendationStatus(
  overallScore: number,
  riskScore: number,
  waterFitResult: WaterFitResult,
  crop: Crop
): 'recommended' | 'consider' | 'high_risk' | 'do_not_plant' {
  // Force DO NOT PLANT if water stress is extreme
  const waterStressExtreme =
    waterFitResult.stressPct > 60 &&
    (crop.waterRequirement === 'very_high' || crop.waterRequirement === 'high');

  if (waterStressExtreme || (overallScore < 35 && riskScore > 70)) {
    return 'do_not_plant';
  }
  if (overallScore >= 72 && riskScore < 40) return 'recommended';
  if (overallScore >= 58) return 'consider';
  if (overallScore >= 42) return 'high_risk';
  return 'do_not_plant';
}

// ============================================================
// 12. EXPLANATION GENERATION
// ============================================================

export function generateReasons(
  soilResult: SoilSuitabilityResult,
  weatherResult: WeatherSuitabilityResult,
  waterResult: WaterFitResult,
  marketResult: MarketScoreResult,
  historyResult: HistoryScoreResult,
  financials: FinancialResult
): string[] {
  const reasons: string[] = [];

  if (soilResult.score >= 75) reasons.push(`Soil conditions (score: ${soilResult.score}/100) are suitable for this crop.`);
  if (weatherResult.score >= 75) reasons.push(`Weather conditions are favorable for this crop.`);
  if (waterResult.score >= 80) reasons.push(`Water availability is sufficient — low irrigation stress expected.`);
  if (marketResult.score >= 70) reasons.push(`Market conditions are acceptable — price and demand support a positive outlook.`);
  if (historyResult.score >= 75) reasons.push(`Crop rotation from the previous season benefits this crop.`);
  if (financials.expectedProfit > 0) {
    reasons.push(`Estimated profit of ₹${financials.expectedProfit.toLocaleString('en-IN')}/acre is positive under current conditions.`);
  }
  if (marketResult.currentPrice > 0) {
    reasons.push(`Current market price is ₹${marketResult.currentPrice.toLocaleString('en-IN')}/quintal.`);
  }

  // Add specific explanations from sub-engines (top 2)
  reasons.push(...soilResult.explanations.filter(e => !e.startsWith('⚠')).slice(0, 1));
  reasons.push(...waterResult.explanations.filter(e => !e.startsWith('⚠')).slice(0, 1));

  // Deduplicate and limit
  return [...new Set(reasons)].slice(0, 6);
}

export function generateWarnings(
  soilResult: SoilSuitabilityResult,
  weatherResult: WeatherSuitabilityResult,
  waterResult: WaterFitResult,
  marketResult: MarketScoreResult,
  riskResult: RiskResult,
  financials: FinancialResult,
  crop: Crop
): string[] {
  const warnings: string[] = [];

  if (waterResult.stressPct > 40) warnings.push(`High water requirement — ${waterResult.stressPct}% irrigation stress expected.`);
  if (waterResult.stressPct > 20 && waterResult.stressPct <= 40) warnings.push(`Moderate water stress — supplemental irrigation will be needed.`);
  if (soilResult.score < 60) warnings.push(`Low soil suitability (${soilResult.score}/100) — yields may be below average.`);
  if (marketResult.score < 55) warnings.push(`High market volatility or declining prices — revenue projections carry risk.`);
  if (riskResult.weatherRisk > 50) warnings.push(`Elevated weather risk — monitor IMD forecasts before sowing.`);
  if (riskResult.marketRisk > 60) warnings.push(`High market price volatility — consider MSP procurement or FPO linkage.`);
  if (financials.profitMargin < 20 && financials.expectedProfit > 0) warnings.push(`Thin profit margin (${financials.profitMargin}%) — cost management is important.`);
  if (financials.expectedProfit <= 0) warnings.push(`Estimated profit is negative under current price and yield assumptions.`);
  if (crop.waterRequirement === 'very_high') warnings.push(`Very high water crop — not recommended where water is scarce.`);

  // Include ⚠ items from sub-engines
  warnings.push(...soilResult.explanations.filter(e => e.startsWith('⚠')).map(e => e.replace('⚠ ', '')).slice(0, 2));
  warnings.push(...waterResult.explanations.filter(e => e.startsWith('⚠')).map(e => e.replace('⚠ ', '')).slice(0, 1));
  warnings.push(...riskResult.explanations.slice(0, 2));

  // Deduplicate and limit
  return [...new Set(warnings)].slice(0, 6);
}

// ============================================================
// 13. DATA QUALITY
// ============================================================

export interface DataQuality {
  soilCompleteness: number;
  weatherCompleteness: number;
  waterCompleteness: number;
  marketCompleteness: number;
  historyCompleteness: number;
  overall: number;
}

export function assessDataQuality(
  soil: SoilReading,
  weather: WeatherData,
  water: WaterData,
  market: MarketData,
  history: CropHistory
): DataQuality {
  const soilFields = [soil.pH, soil.nitrogen, soil.phosphorus, soil.potassium, soil.ec, soil.moisture, soil.organicCarbon];
  const soilComplete = soilFields.filter((v) => v !== undefined && v !== null && !isNaN(v)).length;
  const soilCompleteness = roundInt((soilComplete / soilFields.length) * 100);

  const weatherCompleteness = weather.currentTemp && weather.currentHumidity && weather.rainfallForecast ? 100 : 70;
  const waterCompleteness = water.availability ? 90 : 50;
  const marketCompleteness = market.prices.length > 0 ? 100 : 60;
  const historyCompleteness = history.previousCrop ? 80 : 50;

  const overall = roundInt(
    soilCompleteness * 0.30 +
    weatherCompleteness * 0.25 +
    waterCompleteness * 0.20 +
    marketCompleteness * 0.15 +
    historyCompleteness * 0.10
  );

  return {
    soilCompleteness,
    weatherCompleteness,
    waterCompleteness,
    marketCompleteness,
    historyCompleteness,
    overall,
  };
}

// ============================================================
// 14. MAIN ENGINE: runAIDecisionEngine
// ============================================================

/**
 * AI Decision Engine — MVP Simulation
 *
 * Processes all farm inputs and returns ranked crop recommendations.
 * This function is the single source of truth for all recommendation pages.
 *
 * Replace the body of this function with an API call to FastAPI/XGBoost/RF
 * when real ML models are available — the return type stays the same.
 */
export function runAIDecisionEngine(
  soil: SoilReading,
  weather: WeatherData,
  water: WaterData,
  market: MarketData,
  history: CropHistory,
  crops: Crop[]
): CropRecommendation[] {
  const results: CropRecommendation[] = crops.map((crop) => {
    // --- Sub-engine calculations ---
    const soilResult = calculateSoilSuitability(soil, crop);
    const weatherResult = calculateWeatherSuitability(weather, crop);
    const waterResult = calculateWaterFit(water, crop);
    const marketResult = calculateMarketScore(market, crop);
    const historyResult = calculateHistoryScore(history, crop);

    // --- Yield & Financials ---
    const expectedYield = estimateYield(crop, soilResult.score, weatherResult.score, waterResult.score);
    const financials = calculateFinancials(crop, expectedYield, marketResult.currentPrice);

    // --- Risk ---
    const riskResult = calculateRisk(waterResult, weather, market, soilResult, crop);

    // --- Overall score ---
    const overallScore = calculateOverallScore(
      soilResult.score,
      weatherResult.score,
      waterResult.score,
      marketResult.score,
      historyResult.score,
      riskResult.riskScore
    );

    // --- Confidence ---
    const confidenceScore = calculateConfidence(soil, weather, water, market, history, crop);

    // --- Action status ---
    const action = deriveRecommendationStatus(overallScore, riskResult.riskScore, waterResult, crop);

    // --- Reasons & Warnings ---
    const reasons = generateReasons(soilResult, weatherResult, waterResult, marketResult, historyResult, financials);
    const warnings = generateWarnings(soilResult, weatherResult, waterResult, marketResult, riskResult, financials, crop);

    return {
      // Identity
      cropId: crop.id,
      cropName: crop.name,
      cropNameHi: crop.nameHi,

      // Scores
      rank: 0, // assigned after sort
      suitabilityScore: overallScore,
      overallScore,
      soilCompatibility: soilResult.score,
      weatherCompatibility: weatherResult.score,
      waterFitScore: waterResult.score,
      marketCompatibility: marketResult.score,
      historyScore: historyResult.score,
      soilBreakdown: soilResult.breakdown,

      // Yield & Financials
      expectedYield,
      estimatedCost: financials.estimatedCost,
      expectedRevenue: financials.expectedRevenue,
      expectedProfit: financials.expectedProfit,
      profitMargin: financials.profitMargin,

      // Water
      waterRequirement: crop.waterRequirement,
      waterRequirementMM: waterResult.requiredWaterMM,
      waterStressPct: waterResult.stressPct,

      // Risk
      riskScore: riskResult.riskScore,
      riskLevel: riskResult.riskLevel,
      riskBreakdown: {
        water: riskResult.waterRisk,
        weather: riskResult.weatherRisk,
        market: riskResult.marketRisk,
        soil: riskResult.soilRisk,
      },

      // Confidence
      confidenceScore,

      // Action
      action,

      // Explainability
      reasons,
      warnings,

      // Market price used
      marketCompatibility_price: marketResult.currentPrice,
    } satisfies CropRecommendation;
  });

  // Sort: DO NOT PLANT crops go last, rest by overallScore descending
  results.sort((a, b) => {
    if (a.action === 'do_not_plant' && b.action !== 'do_not_plant') return 1;
    if (a.action !== 'do_not_plant' && b.action === 'do_not_plant') return -1;
    return b.overallScore - a.overallScore;
  });

  // Assign ranks
  results.forEach((r, i) => {
    r.rank = i + 1;
  });

  return results;
}

// ============================================================
// 15. SCENARIO RUNNER: runScenario
// ============================================================

export interface ScenarioParams {
  rainfallChangePct: number;     // e.g. -20 means 20% less rainfall
  priceChangePct: number;        // e.g. +10 means 10% higher price
  temperatureChangeDeg: number;  // e.g. +2 means 2°C warmer
  waterAvailability?: 'low' | 'moderate' | 'high';
}

/**
 * Run a What-If scenario by modifying the base inputs and calling the engine.
 * The UI must call this function — it must NOT contain separate calculation logic.
 */
export function runScenario(
  soil: SoilReading,
  baseWeather: WeatherData,
  baseWater: WaterData,
  baseMarket: MarketData,
  history: CropHistory,
  crops: Crop[],
  scenario: ScenarioParams
): CropRecommendation[] {
  // Modify weather
  const scenarioWeather: WeatherData = {
    ...baseWeather,
    rainfallForecast: clamp(
      roundInt(baseWeather.rainfallForecast * (1 + scenario.rainfallChangePct / 100)),
      0,
      500
    ),
    currentTemp: round1(baseWeather.currentTemp + scenario.temperatureChangeDeg),
    weatherRisk:
      scenario.rainfallChangePct < -15 || Math.abs(scenario.temperatureChangeDeg) > 3
        ? 'high'
        : scenario.rainfallChangePct < -5 || Math.abs(scenario.temperatureChangeDeg) > 1
        ? 'medium'
        : baseWeather.weatherRisk,
  };

  // Modify water availability
  const scenarioWater: WaterData = {
    ...baseWater,
    availability: scenario.waterAvailability ?? baseWater.availability,
  };

  // Modify market prices
  const scenarioMarket: MarketData = {
    ...baseMarket,
    prices: baseMarket.prices.map((p) => ({
      ...p,
      currentPrice: roundInt(p.currentPrice * (1 + scenario.priceChangePct / 100)),
      trend:
        scenario.priceChangePct > 5
          ? 'rising'
          : scenario.priceChangePct < -5
          ? 'falling'
          : p.trend,
      marketRisk:
        Math.abs(scenario.priceChangePct) > 15
          ? 'high'
          : Math.abs(scenario.priceChangePct) > 5
          ? 'medium'
          : p.marketRisk,
    })),
  };

  return runAIDecisionEngine(soil, scenarioWeather, scenarioWater, scenarioMarket, history, crops);
}
