// ============================================================
// MittiMitra AI — 3-Season Farm Planner Engine
// ============================================================
//
// Label: "3-Season Planner — Simulated / Model Output"
//
// IMPORTANT:
// All outputs are SIMULATED projections, not agronomic guarantees.
// Soil impact coefficients are MODEL parameters for demo purposes.
// Rotation effects are illustrative, not field-validated science.
//
// This engine:
//  1. Calls runAIDecisionEngine() for each season
//  2. Applies rotation + soil effects between seasons
//  3. Calls optimizeCropPortfolio() for each season
//  4. Produces EngineSeasonPlan[] → ThreeSeasonPlan
//
// Does NOT: use Math.random(), duplicate existing calculations,
//           or contain UI logic.
// ============================================================

import type { SoilReading, WaterData, MarketData, CropHistory, Crop } from '../types';
import type {
  RotationEffect,
  SeasonSoilImpact,
  SeasonCropAllocation,
  EngineSeasonPlan,
  ThreeSeasonPlan,
  FarmState,
  PlanComparison,
  PlanComparisonMetric,
} from '../types/planner';
import { runAIDecisionEngine } from './engine';
import { optimizeCropPortfolio, type OptimizationPreferences } from './portfolioOptimizer';

// ── Optimization preset weights ───────────────────────────────

export const PROFIT_FOCUSED_PREFS: OptimizationPreferences = {
  profitWeight: 0.60,
  riskWeight: 0.15,
  waterWeight: 0.15,
  diversificationWeight: 0.10,
  minAllocationPct: 5,
  maxAllocationPct: 70,
};

export const RISK_BALANCED_PREFS: OptimizationPreferences = {
  profitWeight: 0.30,
  riskWeight: 0.30,
  waterWeight: 0.20,
  diversificationWeight: 0.20,
  minAllocationPct: 5,
  maxAllocationPct: 60,
};

// ── DEMO soil impact coefficients ────────────────────────────
// LABEL: "Demo model coefficients — not field-validated"
// These represent qualitative effects used for demo visualization.
// Positive = improvement to soil property, Negative = depletion.

const CROP_SOIL_IMPACT: Record<string, {
  nitrogenDelta: number;       // kg/ha (relative)
  phosphorusDelta: number;
  potassiumDelta: number;
  organicCarbonDelta: number;  // % absolute change (tiny)
  healthScore: number;         // -20 to +20 per season
}> = {
  wheat:      { nitrogenDelta: -25, phosphorusDelta: -8,  potassiumDelta: -15, organicCarbonDelta: -0.04, healthScore: -5 },
  mustard:    { nitrogenDelta: -15, phosphorusDelta: -5,  potassiumDelta: -10, organicCarbonDelta: -0.02, healthScore: 0  },
  chickpea:   { nitrogenDelta: +40, phosphorusDelta: +5,  potassiumDelta: +5,  organicCarbonDelta: +0.06, healthScore: +15 },
  rice:       { nitrogenDelta: -20, phosphorusDelta: -10, potassiumDelta: -20, organicCarbonDelta: -0.06, healthScore: -10 },
  maize:      { nitrogenDelta: -30, phosphorusDelta: -10, potassiumDelta: -25, organicCarbonDelta: -0.05, healthScore: -8  },
  vegetable:  { nitrogenDelta: -20, phosphorusDelta: -12, potassiumDelta: -18, organicCarbonDelta: +0.02, healthScore: 0   },
};

// ── Season metadata sequence ──────────────────────────────────

interface SeasonMeta {
  index: number;
  label: string;
  type: 'rabi' | 'kharif' | 'zaid';
  notes: string;
}

const SEASON_SEQUENCE: SeasonMeta[] = [
  { index: 1, label: 'Rabi 2024–25 (Oct–Mar)',  type: 'rabi',   notes: 'Current season — based on actual soil and weather data.' },
  { index: 2, label: 'Kharif 2025 (Jun–Oct)',    type: 'kharif', notes: 'Simulated projection. Values carry high uncertainty.' },
  { index: 3, label: 'Rabi 2025–26 (Oct–Mar)',   type: 'rabi',   notes: 'Long-range projection. Treat as indicative direction only.' },
];

const CROP_COLORS: Record<string, string> = {
  wheat:     '#52B788',
  mustard:   '#D4A017',
  chickpea:  '#74C69D',
  vegetable: '#95D5B2',
  rice:      '#E07070',
  maize:     '#F4A261',
};

// ── Helpers ───────────────────────────────────────────────────

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, isFinite(v) ? v : 0));
}

function roundInt(v: number): number {
  return Math.round(isFinite(v) ? v : 0);
}

function round1(v: number): number {
  return Math.round((isFinite(v) ? v : 0) * 10) / 10;
}

// ── 1. CALCULATE ROTATION EFFECT ─────────────────────────────

export function calculateRotationEffect(
  fromCropId: string,
  toCropId: string
): RotationEffect {
  // Rotation compatibility matrix: [from → to] benefit score
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    wheat:    { mustard: 75, chickpea: 85, maize: 60, vegetable: 70, rice: 30, wheat: 30 },
    mustard:  { wheat: 70,   chickpea: 80, maize: 65, vegetable: 75, rice: 25, mustard: 30 },
    chickpea: { wheat: 90,   mustard: 80,  maize: 75, vegetable: 80, rice: 40, chickpea: 35 },
    rice:     { wheat: 75,   mustard: 65,  chickpea: 60, maize: 55, vegetable: 60, rice: 30 },
    maize:    { wheat: 70,   chickpea: 80, mustard: 60, vegetable: 65, rice: 45, maize: 30 },
    vegetable:{ wheat: 65,   mustard: 60,  chickpea: 70, maize: 60, rice: 30, vegetable: 30 },
  };

  const benefitScore = compatibilityMatrix[fromCropId]?.[toCropId] ?? 50;
  const fromImpact = CROP_SOIL_IMPACT[fromCropId];
  const nitrogenImpact = fromImpact ? fromImpact.nitrogenDelta : 0;
  const soilHealthDelta = fromImpact ? fromImpact.healthScore : 0;

  let explanation = '';
  if (benefitScore >= 80) {
    explanation = `${toCropId.charAt(0).toUpperCase() + toCropId.slice(1)} after ${fromCropId} is a highly beneficial rotation in this model.`;
    if (fromCropId === 'chickpea') explanation += ' Chickpea nitrogen fixation improves soil for the next crop (simulated model).';
  } else if (benefitScore >= 65) {
    explanation = `${toCropId.charAt(0).toUpperCase() + toCropId.slice(1)} after ${fromCropId} provides a moderate rotation benefit in this model.`;
  } else if (fromCropId === toCropId) {
    explanation = `Repeated cultivation of ${toCropId} reduces rotation benefit — pathogen buildup and nutrient depletion risk (simulated model).`;
  } else {
    explanation = `This crop sequence has a neutral-to-low rotation effect in this model. Consider a legume rotation to restore soil fertility.`;
  }

  return {
    fromCropId,
    toCropId,
    benefitScore: clamp(benefitScore),
    nitrogenImpact,
    soilHealthDelta,
    explanation,
  };
}

// ── 2. CALCULATE SEASON SOIL IMPACT ──────────────────────────

export function calculateSeasonSoilImpact(
  seasonIndex: number,
  portfolioAllocations: { cropId: string; percentage: number }[],
  previousSoil: SoilReading
): SeasonSoilImpact {
  let nDelta = 0, pDelta = 0, kDelta = 0, ocDelta = 0, healthScore = 0;

  portfolioAllocations.forEach(a => {
    const pct = a.percentage / 100;
    const impact = CROP_SOIL_IMPACT[a.cropId];
    if (!impact) return;
    nDelta    += impact.nitrogenDelta * pct;
    pDelta    += impact.phosphorusDelta * pct;
    kDelta    += impact.potassiumDelta * pct;
    ocDelta   += impact.organicCarbonDelta * pct;
    healthScore += impact.healthScore * pct;
  });

  // Determine current overall soil score from soil reading (simple heuristic)
  const pHScore  = clamp(100 - Math.abs(previousSoil.pH - 6.75) * 20);
  const nScore   = clamp((previousSoil.nitrogen / 280) * 80);
  const ocScore  = clamp((previousSoil.organicCarbon / 1.0) * 70);
  const baseScore = roundInt((pHScore + nScore + ocScore) / 3);
  const overallScore = clamp(baseScore + roundInt(healthScore));

  const trend: 'improving' | 'stable' | 'declining' =
    healthScore > 3 ? 'improving' : healthScore < -3 ? 'declining' : 'stable';

  let explanation = `Season ${seasonIndex} soil impact (simulated model): `;
  explanation += `Nitrogen Δ${nDelta > 0 ? '+' : ''}${roundInt(nDelta)} kg/ha, `;
  explanation += `Organic Carbon Δ${ocDelta >= 0 ? '+' : ''}${round1(ocDelta)}%. `;
  explanation += trend === 'improving'
    ? 'Legume crops in this plan improve modeled soil nitrogen for the next season.'
    : trend === 'declining'
    ? 'Heavy cereal allocation depletes soil nutrients in this model — FYM application recommended.'
    : 'Soil health is projected to remain relatively stable in this model.';
  explanation += ' (Simulated model output — requires field validation.)';

  return {
    season: seasonIndex,
    nitrogenDelta: round1(nDelta),
    phosphorusDelta: round1(pDelta),
    potassiumDelta: round1(kDelta),
    organicCarbonDelta: round1(ocDelta),
    overallSoilScore: overallScore,
    trend,
    explanation,
  };
}

// ── 3. BUILD NEXT SEASON FARM STATE ──────────────────────────

export function buildNextSeasonState(
  currentFarmState: FarmState,
  seasonSoilImpact: SeasonSoilImpact,
  dominantCropId: string
): FarmState {
  const prevSoil = currentFarmState.soil;

  // Apply soil impact deltas to produce next season's starting soil
  const nextSoil: SoilReading = {
    ...prevSoil,
    nitrogen:      clamp(prevSoil.nitrogen + seasonSoilImpact.nitrogenDelta, 50, 600),
    phosphorus:    clamp(prevSoil.phosphorus + seasonSoilImpact.phosphorusDelta, 5, 150),
    potassium:     clamp(prevSoil.potassium + seasonSoilImpact.potassiumDelta, 50, 500),
    organicCarbon: clamp(prevSoil.organicCarbon + seasonSoilImpact.organicCarbonDelta, 0.2, 4.0),
    // pH is slow-changing — small drift only
    pH: clamp(
      prevSoil.pH + (seasonSoilImpact.nitrogenDelta > 20 ? 0.05 : -0.03),
      5.0,
      8.5
    ),
  };

  const newHealthScore = clamp(currentFarmState.soilHealthScore + seasonSoilImpact.overallSoilScore - 50);

  return {
    soil: nextSoil,
    cropHistory: dominantCropId,
    seasonIndex: currentFarmState.seasonIndex + 1,
    soilHealthScore: newHealthScore,
  };
}

// ── 4. GENERATE SINGLE SEASON PLAN ───────────────────────────

export function generateSeasonPlan(
  seasonMeta: SeasonMeta,
  farmState: FarmState,
  water: WaterData,
  market: MarketData,
  crops: Crop[],
  totalLand: number,
  prefs: OptimizationPreferences
): EngineSeasonPlan {
  // Build crop history from farm state
  const cropHistory: CropHistory = {
    farmId: farmState.soil.farmId,
    previousCrop: farmState.cropHistory || 'Soybean',
    previousSeason: `Season ${farmState.seasonIndex - 1}`,
    approximateYield: 8,
    cropRotation: farmState.cropHistory,
  };

  // Run AI Decision Engine with current season's soil state
  const recommendations = runAIDecisionEngine(
    farmState.soil,
    // Weather is reused — we don't have multi-season weather data
    // Real implementation would use season-specific IMD data
    {
      farmId: farmState.soil.farmId,
      currentTemp: seasonMeta.type === 'rabi' ? 22 : 30,
      currentHumidity: seasonMeta.type === 'rabi' ? 60 : 75,
      currentRainfall: seasonMeta.type === 'rabi' ? 5 : 12,
      rainfallForecast: seasonMeta.type === 'rabi' ? 65 : 150,
      weatherRisk: seasonMeta.index > 1 ? 'medium' : 'medium',
      source: 'mock',
      forecast: [],
    },
    water,
    market,
    cropHistory,
    crops
  );

  // Optimize portfolio
  const portfolio = optimizeCropPortfolio(totalLand, recommendations, water, prefs);

  // Build SeasonCropAllocation[] from portfolio
  const cropAllocations: SeasonCropAllocation[] = portfolio.allocations.map(alloc => {
    const rec = recommendations.find(r => r.cropId === alloc.cropId);
    const rotEffect = calculateRotationEffect(farmState.cropHistory, alloc.cropId);
    const yieldPerAcre = rec?.expectedYield ?? 10;
    const revenuePerAcre = rec ? rec.expectedRevenue : alloc.expectedProfit + 12000;
    const costPerAcre = rec?.estimatedCost ?? 12000;

    const cropImpact = CROP_SOIL_IMPACT[alloc.cropId];
    const soilImpact: 'positive' | 'neutral' | 'negative' =
      (cropImpact?.healthScore ?? 0) > 5 ? 'positive' :
      (cropImpact?.healthScore ?? 0) < -5 ? 'negative' : 'neutral';

    return {
      cropId: alloc.cropId,
      cropName: alloc.cropName,
      cropNameHi: alloc.cropNameHi,
      acres: alloc.acres,
      percentage: alloc.percentage,
      expectedYield: rec?.expectedYield ?? 10,
      totalYield: round1(yieldPerAcre * alloc.acres),
      expectedRevenue: roundInt(revenuePerAcre),
      totalRevenue: roundInt(revenuePerAcre * alloc.acres),
      estimatedCost: roundInt(costPerAcre * alloc.acres),
      expectedProfit: alloc.expectedProfit,
      waterRequirement: rec?.waterRequirement ?? 'medium',
      waterRequirementMM: rec?.waterRequirementMM ?? 400,
      riskScore: alloc.riskScore,
      riskLevel: alloc.riskLevel ?? (alloc.riskScore >= 55 ? 'high' : alloc.riskScore >= 35 ? 'medium' : 'low'),
      soilImpact,
      rotationBenefit: rotEffect.explanation,
      reasons: rec?.reasons.slice(0, 2) ?? [],
      color: CROP_COLORS[alloc.cropId] ?? '#6B7280',
    };
  });

  // Aggregate metrics
  const totalRevenue = cropAllocations.reduce((s, c) => s + c.totalRevenue, 0);
  const totalCost = cropAllocations.reduce((s, c) => s + c.estimatedCost, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalWaterMM = cropAllocations.reduce((s, c) => s + c.waterRequirementMM * (c.percentage / 100), 0);

  // Rotation score: average rotation benefit across allocations (weighted by pct)
  const rotationScore = clamp(roundInt(
    cropAllocations.reduce((s, c) => {
      const rot = calculateRotationEffect(farmState.cropHistory, c.cropId);
      return s + rot.benefitScore * (c.percentage / 100);
    }, 0)
  ));

  // Soil impact for this season
  const soilImpact = calculateSeasonSoilImpact(
    seasonMeta.index,
    portfolio.allocations.map(a => ({ cropId: a.cropId, percentage: a.percentage })),
    farmState.soil
  );

  // Explanations
  const explanations: string[] = [];
  if (seasonMeta.index > 1) {
    explanations.push(`Season ${seasonMeta.index} builds on Season ${seasonMeta.index - 1} soil and rotation state (simulated).`);
  }
  explanations.push(`Soil nitrogen entering this season: ${roundInt(farmState.soil.nitrogen)} kg/ha.`);
  if (portfolio.allocations.some(a => a.cropId === 'chickpea')) {
    explanations.push('Chickpea in the portfolio improves simulated soil nitrogen for the next season.');
  }
  const topCrop = cropAllocations[0];
  if (topCrop) {
    explanations.push(`${topCrop.cropName} received the largest allocation (${topCrop.percentage}%) based on optimizer scoring.`);
  }

  const warnings: string[] = [];
  if (seasonMeta.index > 1) {
    warnings.push('Future season projections carry increasing uncertainty. Treat as indicative direction only.');
  }
  if (soilImpact.trend === 'declining') {
    warnings.push('Modeled soil health is declining — consider increasing legume allocation next season.');
  }
  warnings.push('All values are simulated model projections. Consult agronomist for field decisions.');

  return {
    seasonIndex: seasonMeta.index,
    seasonLabel: seasonMeta.label,
    seasonType: seasonMeta.type,
    crops: cropAllocations,
    portfolio,
    totalExpectedRevenue: roundInt(totalRevenue),
    totalEstimatedCost: roundInt(totalCost),
    totalExpectedProfit: roundInt(totalProfit),
    totalWaterMM: roundInt(totalWaterMM),
    portfolioRisk: portfolio.portfolioRisk,
    waterStress: portfolio.waterStressScore,
    diversificationScore: portfolio.diversificationScore,
    rotationScore,
    soilImpact,
    explanations,
    warnings,
    notes: seasonMeta.notes,
  };
}

// ── 5. GENERATE THREE-SEASON PLAN ────────────────────────────

export function generateThreeSeasonPlan(
  initialSoil: SoilReading,
  initialCropHistory: CropHistory,
  water: WaterData,
  market: MarketData,
  crops: Crop[],
  totalLand: number,
  prefs: OptimizationPreferences,
  planType: 'profit_focused' | 'risk_balanced'
): ThreeSeasonPlan {
  const planName = planType === 'profit_focused' ? 'Plan A: Profit-Focused' : 'Plan B: Risk-Balanced';
  const planDescription = planType === 'profit_focused'
    ? 'Prioritizes projected profitability while respecting water, risk and safety constraints.'
    : 'Balances projected profitability with lower risk, water efficiency and greater crop diversification.';

  // ── Season 1: start from actual farm state ──────────────
  const farmState1: FarmState = {
    soil: initialSoil,
    cropHistory: initialCropHistory.previousCrop,
    seasonIndex: 1,
    soilHealthScore: 65, // baseline
  };

  const season1 = generateSeasonPlan(
    SEASON_SEQUENCE[0], farmState1, water, market, crops, totalLand, prefs
  );

  // ── Season 2: build state from Season 1 output ──────────
  const dominantCrop1 = season1.crops[0]?.cropId ?? 'wheat';
  const farmState2 = buildNextSeasonState(farmState1, season1.soilImpact, dominantCrop1);

  const season2 = generateSeasonPlan(
    SEASON_SEQUENCE[1], farmState2, water, market, crops, totalLand, prefs
  );

  // ── Season 3: build state from Season 2 output ──────────
  const dominantCrop2 = season2.crops[0]?.cropId ?? 'maize';
  const farmState3 = buildNextSeasonState(farmState2, season2.soilImpact, dominantCrop2);

  const season3 = generateSeasonPlan(
    SEASON_SEQUENCE[2], farmState3, water, market, crops, totalLand, prefs
  );

  const seasons: [EngineSeasonPlan, EngineSeasonPlan, EngineSeasonPlan] = [season1, season2, season3];

  // Cross-season aggregates
  const totalProjectedRevenue = seasons.reduce((s, p) => s + p.totalExpectedRevenue, 0);
  const totalProjectedProfit = seasons.reduce((s, p) => s + p.totalExpectedProfit, 0);
  const totalWaterMM = seasons.reduce((s, p) => s + p.totalWaterMM, 0);

  const riskMap = { low: 20, medium: 50, high: 75 };
  const avgRiskScore = roundInt(seasons.reduce((s, p) => s + riskMap[p.portfolioRisk], 0) / 3);
  const avgWaterStress = roundInt(seasons.reduce((s, p) => s + p.waterStress, 0) / 3);
  const avgDiversification = roundInt(seasons.reduce((s, p) => s + p.diversificationScore, 0) / 3);
  const avgRotationScore = roundInt(seasons.reduce((s, p) => s + p.rotationScore, 0) / 3);

  const soilTrajectory = seasons.map(s => s.soilImpact);
  const lastSoilTrend = season3.soilImpact.trend;

  const planExplanation = planType === 'profit_focused'
    ? `Plan A prioritized crops with stronger projected profitability (weight: 60%). This typically concentrates more land on high-return crops, accepting higher risk. Simulated 3-season profit: ₹${totalProjectedProfit.toLocaleString('en-IN')} (model output, not guaranteed).`
    : `Plan B distributed the optimization weight more evenly between profit (30%), risk (30%), water (20%) and diversification (20%). This typically produces lower peak profit but reduces concentration risk. Simulated 3-season profit: ₹${totalProjectedProfit.toLocaleString('en-IN')} (model output, not guaranteed).`;

  return {
    planId: `plan-${planType}-${Date.now()}`,
    planName,
    planDescription,
    planType,
    seasons,
    totalProjectedProfit,
    totalProjectedRevenue,
    totalWaterMM,
    avgRiskScore,
    avgWaterStress,
    avgDiversification,
    avgRotationScore,
    soilTrend: lastSoilTrend,
    planExplanation,
    soilTrajectory,
    isDemo: true,
    generatedAt: new Date().toISOString(),
  };
}

// ── 6. COMPARE PLANS ─────────────────────────────────────────

export function compareSeasonPlans(planA: ThreeSeasonPlan, planB: ThreeSeasonPlan): PlanComparison {
  const metrics: PlanComparisonMetric[] = [
    {
      metric: '3-Season Projected Profit',
      unit: '₹',
      planA: planA.totalProjectedProfit,
      planB: planB.totalProjectedProfit,
      better: planA.totalProjectedProfit >= planB.totalProjectedProfit ? 'A' : 'B',
      tradeoffNote: 'Higher profit in Plan A typically comes with higher concentration risk.',
    },
    {
      metric: 'Average Risk Score',
      unit: '/100',
      planA: planA.avgRiskScore,
      planB: planB.avgRiskScore,
      better: planA.avgRiskScore <= planB.avgRiskScore ? 'A' : 'B',
      tradeoffNote: 'Lower score = lower modeled risk. Plan B typically achieves lower risk through diversification.',
    },
    {
      metric: 'Average Water Stress',
      unit: '%',
      planA: planA.avgWaterStress,
      planB: planB.avgWaterStress,
      better: planA.avgWaterStress <= planB.avgWaterStress ? 'A' : 'B',
      tradeoffNote: 'Lower water stress is more resilient to drought conditions.',
    },
    {
      metric: 'Average Diversification',
      unit: '/100',
      planA: planA.avgDiversification,
      planB: planB.avgDiversification,
      better: planA.avgDiversification >= planB.avgDiversification ? 'A' : 'B',
      tradeoffNote: 'Higher diversification reduces concentration risk across crops.',
    },
    {
      metric: 'Average Rotation Score',
      unit: '/100',
      planA: planA.avgRotationScore,
      planB: planB.avgRotationScore,
      better: planA.avgRotationScore >= planB.avgRotationScore ? 'A' : 'B',
      tradeoffNote: 'A higher rotation score means better crop sequence for simulated soil health.',
    },
    {
      metric: 'Total Water Requirement',
      unit: 'mm (weighted)',
      planA: planA.totalWaterMM,
      planB: planB.totalWaterMM,
      better: planA.totalWaterMM <= planB.totalWaterMM ? 'A' : 'B',
      tradeoffNote: 'Lower total water demand reduces irrigation pressure across 3 seasons.',
    },
    {
      metric: 'Soil Health Trend',
      unit: '',
      planA: planA.soilTrend,
      planB: planB.soilTrend,
      better: planA.soilTrend === 'improving' ? 'A' : planB.soilTrend === 'improving' ? 'B' : 'equal',
      tradeoffNote: 'Improving soil trend (model output) suggests better long-term farm productivity.',
    },
  ];

  const aWins = metrics.filter(m => m.better === 'A').length;
  const bWins = metrics.filter(m => m.better === 'B').length;

  const tradeoffSummary = aWins > bWins
    ? `Plan A produces higher projected profit but carries higher projected risk. Plan B sacrifices some projected profit for lower risk, better diversification and potentially better soil health. Neither is universally "better" — choose based on your risk tolerance. (Simulated model output.)`
    : aWins < bWins
    ? `Plan B outperforms Plan A across more metrics including risk, water and diversification. Plan A may produce higher projected profit in some seasons. Neither is universally "better" — consider your risk tolerance. (Simulated model output.)`
    : `Plan A and Plan B perform similarly across metrics. Key trade-off: Plan A offers higher projected profit concentration; Plan B offers better risk distribution. (Simulated model output.)`;

  return { planA, planB, metrics, tradeoffSummary };
}
