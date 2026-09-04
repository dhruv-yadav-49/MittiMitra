// ============================================================
// MittiMitra AI — Crop Portfolio Optimizer (MVP Simulation)
// ============================================================
//
// Label: "AI Portfolio Optimizer — MVP Simulation"
//
// This is a DETERMINISTIC, rule-based optimizer.
// It is NOT a linear programming or ML optimizer.
// Same inputs → same output (no Math.random).
//
// This module CONSUMES CropRecommendation[] from the AI
// Decision Engine. It does NOT recalculate crop scores.
//
// Architecture is designed so the allocation algorithm can
// later be replaced by a proper LP/MIP solver or CVXPY call.
// ============================================================

import type { CropRecommendation, WaterData, Portfolio, PortfolioAllocation } from '../types';

// ============================================================
// TYPES
// ============================================================

export interface OptimizationPreferences {
  profitWeight: number;         // default 0.35
  riskWeight: number;           // default 0.25
  waterWeight: number;          // default 0.20
  diversificationWeight: number; // default 0.20
  minAllocationPct: number;     // default 5% of total land
  maxAllocationPct: number;     // default 60% of total land
}

export interface CropPortfolioScore {
  cropId: string;
  cropName: string;
  profitScore: number;       // 0–100, normalized
  riskFitScore: number;      // 0–100 (100 - riskScore)
  waterFitScore: number;     // 0–100 from engine
  overallScore: number;      // from engine
  compositeScore: number;    // weighted portfolio score
}

export interface SingleCropStrategy {
  cropId: string;
  cropName: string;
  expectedProfit: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  waterStress: number;
  diversificationScore: number;
}

export interface PortfolioComparison {
  singleCrop: SingleCropStrategy;
  portfolio: {
    expectedTotalProfit: number;
    portfolioRiskScore: number;
    portfolioRisk: 'low' | 'medium' | 'high';
    waterStress: number;
    diversificationScore: number;
  };
  // Note: portfolio profit may not always exceed single-crop profit.
  // Portfolio benefit is risk reduction, not guaranteed higher profit.
}

// ============================================================
// DEFAULT PREFERENCES
// ============================================================

export const DEFAULT_PREFERENCES: OptimizationPreferences = {
  profitWeight: 0.35,
  riskWeight: 0.25,
  waterWeight: 0.20,
  diversificationWeight: 0.20,
  minAllocationPct: 5,
  maxAllocationPct: 60,
};

// ============================================================
// CROP COLORS
// ============================================================

const CROP_COLORS: Record<string, string> = {
  wheat: '#52B788',
  mustard: '#D4A017',
  chickpea: '#74C69D',
  vegetable: '#95D5B2',
  rice: '#E07070',
  maize: '#F4A261',
};

function getCropColor(cropId: string): string {
  return CROP_COLORS[cropId] ?? '#6B7280';
}

// ============================================================
// HELPERS
// ============================================================

function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, isFinite(val) ? val : 0));
}

function roundHalf(val: number): number {
  return Math.round(val * 2) / 2; // round to 0.5
}

function roundInt(val: number): number {
  return Math.round(isFinite(val) ? val : 0);
}

// ============================================================
// STEP 1: FILTER ELIGIBLE CROPS
// ============================================================

export function filterEligibleCrops(
  recommendations: CropRecommendation[]
): CropRecommendation[] {
  return recommendations.filter((r) => {
    // Exclude DO NOT PLANT
    if (r.action === 'do_not_plant') return false;
    // Exclude extreme risk
    if (r.riskScore >= 75) return false;
    // Exclude extreme water stress
    if ((r.waterStressPct ?? 0) >= 70) return false;
    // Exclude very low overall score
    if (r.overallScore < 45) return false;
    return true;
  });
}

// ============================================================
// STEP 2: CALCULATE PORTFOLIO SCORES
// ============================================================

export function calculatePortfolioScores(
  eligible: CropRecommendation[],
  prefs: OptimizationPreferences
): CropPortfolioScore[] {
  if (eligible.length === 0) return [];

  // Normalize profit (per acre) to 0–100
  const profits = eligible.map((r) => r.expectedProfit);
  const maxProfit = Math.max(...profits);
  const minProfit = Math.min(...profits);
  const profitRange = maxProfit - minProfit;

  return eligible.map((r) => {
    const profitScore = profitRange > 0
      ? clamp(((r.expectedProfit - minProfit) / profitRange) * 100)
      : 70; // all crops equal → neutral score

    const riskFitScore = clamp(100 - r.riskScore);
    const waterFitScore = clamp(r.waterFitScore ?? (100 - (r.waterStressPct ?? 0)));
    const overallScore = clamp(r.overallScore);

    const compositeScore = clamp(
      profitScore * prefs.profitWeight +
      riskFitScore * prefs.riskWeight +
      waterFitScore * prefs.waterWeight +
      overallScore * prefs.diversificationWeight
    );

    return {
      cropId: r.cropId,
      cropName: r.cropName,
      profitScore: roundInt(profitScore),
      riskFitScore: roundInt(riskFitScore),
      waterFitScore: roundInt(waterFitScore),
      overallScore: roundInt(overallScore),
      compositeScore: roundInt(compositeScore),
    };
  });
}

// ============================================================
// STEP 3: ALLOCATE LAND (DETERMINISTIC)
// ============================================================

/**
 * Allocates total land among crops proportionally to composite score,
 * subject to min/max constraints and diversification goals.
 *
 * Algorithm:
 * 1. Score-proportional raw allocation
 * 2. Apply max cap (60%)
 * 3. Apply min floor (5%) for selected crops
 * 4. Normalize to total land exactly
 * 5. Clean round to 0.5-acre increments
 * 6. Fix rounding residual on top crop
 */
export function allocateLand(
  scored: CropPortfolioScore[],
  totalLand: number,
  prefs: OptimizationPreferences
): { cropId: string; pct: number; acres: number }[] {
  if (scored.length === 0) return [];
  if (totalLand <= 0) return [];

  const n = scored.length;
  const minPct = prefs.minAllocationPct / 100;
  const maxPct = prefs.maxAllocationPct / 100;

  // Single eligible crop → gets all land
  if (n === 1) {
    return [{ cropId: scored[0].cropId, pct: 1, acres: totalLand }];
  }

  // Step 1: score-proportional raw allocation
  const totalScore = scored.reduce((s, c) => s + c.compositeScore, 0);
  let rawPcts = scored.map((c) =>
    totalScore > 0 ? c.compositeScore / totalScore : 1 / n
  );

  // Step 2: apply max cap — redistribute excess to lower-ranked crops
  let iterations = 0;
  let anyExceeded = true;
  while (anyExceeded && iterations < 20) {
    anyExceeded = false;
    let excess = 0;
    let capCount = 0;
    rawPcts = rawPcts.map((p) => {
      if (p > maxPct) { excess += p - maxPct; capCount++; anyExceeded = true; return maxPct; }
      return p;
    });
    if (excess > 0) {
      const freeCrops = rawPcts.filter((p) => p < maxPct).length;
      if (freeCrops > 0) {
        rawPcts = rawPcts.map((p) => (p < maxPct ? p + excess / freeCrops : p));
      }
    }
    iterations++;
  }

  // Step 3: apply min floor
  let allocPcts = rawPcts.map((p) => Math.max(minPct, p));

  // Re-normalize so they sum to 1
  const sumAllocPcts = allocPcts.reduce((s, p) => s + p, 0);
  allocPcts = allocPcts.map((p) => p / sumAllocPcts);

  // Step 4: convert to acres, round to 0.5-acre increments
  let acres = allocPcts.map((p) => roundHalf(p * totalLand));
  let sumAcres = acres.reduce((s, a) => s + a, 0);

  // Step 5: fix rounding residual — add/subtract from highest-scored crop
  const topIdx = scored.reduce(
    (maxI, c, i) => (c.compositeScore > scored[maxI].compositeScore ? i : maxI),
    0
  );
  const residual = Math.round((totalLand - sumAcres) * 2) / 2; // round to 0.5
  acres[topIdx] = Math.max(0.5, acres[topIdx] + residual);

  // Final pass: ensure no negatives
  acres = acres.map((a) => Math.max(0, a));

  // Recompute final percentages
  const finalSum = acres.reduce((s, a) => s + a, 0);
  const pcts = acres.map((a) => (finalSum > 0 ? a / finalSum : 0));

  return scored.map((c, i) => ({
    cropId: c.cropId,
    pct: pcts[i],
    acres: acres[i],
  }));
}

// ============================================================
// STEP 4: DIVERSIFICATION SCORE (Shannon entropy, normalized)
// ============================================================

export function calculateDiversificationScore(
  allocations: { pct: number }[]
): number {
  if (allocations.length <= 1) return allocations.length === 1 ? 0 : 0;

  const nonZero = allocations.filter((a) => a.pct > 0);
  if (nonZero.length === 0) return 0;

  // Shannon entropy: H = -Σ(p * ln(p))
  const H = nonZero.reduce((sum, a) => {
    const p = a.pct;
    return sum - (p > 0 ? p * Math.log(p) : 0);
  }, 0);

  // Max entropy = ln(n) when all equal
  const Hmax = Math.log(nonZero.length);
  if (Hmax === 0) return 0;

  return clamp(roundInt((H / Hmax) * 100));
}

// ============================================================
// STEP 5: PORTFOLIO RISK (weighted average)
// ============================================================

export function calculatePortfolioRisk(
  allocations: { pct: number; riskScore: number }[]
): { score: number; level: 'low' | 'medium' | 'high' } {
  const score = roundInt(
    allocations.reduce((s, a) => s + a.riskScore * a.pct, 0)
  );
  const level: 'low' | 'medium' | 'high' =
    score >= 55 ? 'high' : score >= 35 ? 'medium' : 'low';
  return { score: clamp(score), level };
}

// ============================================================
// STEP 6: PORTFOLIO WATER STRESS (weighted average)
// ============================================================

export function calculatePortfolioWaterStress(
  allocations: { pct: number; waterStressPct: number }[]
): number {
  return clamp(
    roundInt(allocations.reduce((s, a) => s + a.waterStressPct * a.pct, 0))
  );
}

// ============================================================
// STEP 7: PORTFOLIO EXPLANATION
// ============================================================

export function generatePortfolioExplanation(
  allocations: PortfolioAllocation[],
  excluded: CropRecommendation[],
  scored: CropPortfolioScore[]
): string[] {
  const explanations: string[] = [];

  if (allocations.length > 1) {
    explanations.push(
      'Land was distributed across multiple suitable crops to reduce concentration risk.'
    );
  }

  const topCrop = allocations[0];
  if (topCrop) {
    const topScore = scored.find((s) => s.cropId === topCrop.cropId);
    explanations.push(
      `${topCrop.cropName} received the highest allocation (${topCrop.percentage}%) because it combines strong suitability, expected profit, and water compatibility. Portfolio score: ${topScore?.compositeScore ?? '—'}/100.`
    );
  }

  allocations.slice(1).forEach((a) => {
    const s = scored.find((sc) => sc.cropId === a.cropId);
    if (!s) return;
    const reasons: string[] = [];
    if (s.profitScore >= 70) reasons.push('favorable market return');
    if (s.waterFitScore >= 80) reasons.push('low water stress');
    if (s.riskFitScore >= 75) reasons.push('manageable risk');
    if (reasons.length > 0) {
      explanations.push(
        `${a.cropName} (${a.percentage}%) was selected for: ${reasons.join(', ')}.`
      );
    }
  });

  excluded.forEach((r) => {
    if (r.action === 'do_not_plant') {
      explanations.push(
        `${r.cropName} was excluded (DO NOT PLANT) due to: ${r.warnings.slice(0, 1).join('; ')}`
      );
    } else if ((r.waterStressPct ?? 0) >= 70) {
      explanations.push(
        `${r.cropName} was excluded — modeled water stress (${r.waterStressPct}%) exceeded the allowed threshold.`
      );
    } else if (r.riskScore >= 75) {
      explanations.push(
        `${r.cropName} was excluded — risk score (${r.riskScore}/100) is too high for portfolio inclusion.`
      );
    }
  });

  explanations.push(
    'Allocation is generated by the AI Portfolio Optimizer — MVP Simulation. This is a demo estimate, not a guaranteed financial outcome.'
  );

  return explanations;
}

// ============================================================
// STEP 8: PORTFOLIO WARNINGS
// ============================================================

export function generatePortfolioWarnings(
  allocations: PortfolioAllocation[],
  waterStress: number,
  riskLevel: 'low' | 'medium' | 'high'
): string[] {
  const warnings: string[] = [];

  if (riskLevel === 'high') {
    warnings.push('Portfolio risk is high — consider reducing allocation to volatile crops.');
  }
  if (waterStress > 30) {
    warnings.push('Moderate portfolio water stress — ensure supplemental irrigation planning.');
  }
  if (waterStress > 50) {
    warnings.push('High portfolio water stress — water availability should be confirmed before sowing.');
  }
  const highRiskAllocs = allocations.filter((a) => a.riskScore > 55);
  if (highRiskAllocs.length > 0) {
    warnings.push(
      `${highRiskAllocs.map((a) => a.cropName).join(', ')} carry elevated individual risk — monitor market conditions.`
    );
  }

  warnings.push('Expected profit estimates are sensitive to market price changes.');
  warnings.push('Weather conditions may alter crop suitability and yield projections.');
  warnings.push('Consult a local KVK or agriculture officer before making final sowing decisions.');

  return warnings;
}

// ============================================================
// STEP 9: SINGLE-CROP COMPARISON
// ============================================================

export function buildSingleCropComparison(
  recommendations: CropRecommendation[],
  totalLand: number
): SingleCropStrategy {
  const eligible = recommendations.filter((r) => r.action !== 'do_not_plant');
  const top = eligible[0] ?? recommendations[0];
  if (!top) {
    return {
      cropId: 'none',
      cropName: 'None',
      expectedProfit: 0,
      riskScore: 100,
      riskLevel: 'high',
      waterStress: 100,
      diversificationScore: 0,
    };
  }
  return {
    cropId: top.cropId,
    cropName: top.cropName,
    expectedProfit: top.expectedProfit * totalLand,
    riskScore: top.riskScore,
    riskLevel: top.riskLevel,
    waterStress: top.waterStressPct ?? 0,
    diversificationScore: 0,
  };
}

// ============================================================
// MAIN: optimizeCropPortfolio
// ============================================================

/**
 * AI Portfolio Optimizer — MVP Simulation
 *
 * Consumes CropRecommendation[] from runAIDecisionEngine() and
 * allocates farm land to maximize the balance of:
 *   Expected Profit + Risk Reduction + Water Fit + Diversification
 *
 * This function is the single source of truth for portfolio allocation.
 * Replace its internals with a FastAPI/LP solver call in the future —
 * the return type (Portfolio) stays the same.
 */
export function optimizeCropPortfolio(
  totalLand: number,
  recommendations: CropRecommendation[],
  water: WaterData,
  prefs: Partial<OptimizationPreferences> = {}
): Portfolio {
  const preferences: OptimizationPreferences = { ...DEFAULT_PREFERENCES, ...prefs };

  // ── Edge cases ──────────────────────────────────────────
  if (totalLand <= 0 || recommendations.length === 0) {
    return buildEmptyPortfolio(totalLand);
  }

  // ── Step 1: filter eligible ──────────────────────────────
  const eligible = filterEligibleCrops(recommendations);
  const excluded = recommendations.filter(
    (r) => !eligible.some((e) => e.cropId === r.cropId)
  );

  if (eligible.length === 0) {
    return buildEmptyPortfolio(totalLand);
  }

  // ── Step 2: score ────────────────────────────────────────
  const scored = calculatePortfolioScores(eligible, preferences);

  // Sort by composite score descending
  const sortedScored = [...scored].sort((a, b) => b.compositeScore - a.compositeScore);
  const sortedEligible = sortedScored.map(
    (s) => eligible.find((e) => e.cropId === s.cropId)!
  );

  // ── Step 3: allocate ─────────────────────────────────────
  const landAlloc = allocateLand(sortedScored, totalLand, preferences);

  // ── Step 4: build PortfolioAllocation[] ──────────────────
  const allocations: PortfolioAllocation[] = landAlloc.map((la, i) => {
    const rec = sortedEligible[i];
    const sc = sortedScored[i];
    return {
      cropId: rec.cropId,
      cropName: rec.cropName,
      cropNameHi: rec.cropNameHi,
      acres: la.acres,
      percentage: roundInt(la.pct * 100),
      expectedProfit: roundInt(rec.expectedProfit * la.acres),
      waterStress: rec.waterStressPct ?? 0,
      riskScore: rec.riskScore,
      color: getCropColor(rec.cropId),
      // Extra fields for UI
      profitPerAcre: rec.expectedProfit,
      riskLevel: rec.riskLevel,
      waterRequirement: rec.waterRequirement,
      overallScore: sc.overallScore,
      compositeScore: sc.compositeScore,
      profitScore: sc.profitScore,
      waterFitScore: sc.waterFitScore,
      marketCompatibility: rec.marketCompatibility,
    } as PortfolioAllocation;
  });

  // Fix percentage rounding so they sum to 100
  const pctSum = allocations.reduce((s, a) => s + a.percentage, 0);
  if (pctSum !== 100 && allocations.length > 0) {
    allocations[0].percentage += 100 - pctSum;
  }

  // ── Step 5: metrics ──────────────────────────────────────
  const expectedTotalProfit = allocations.reduce((s, a) => s + a.expectedProfit, 0);
  const riskResult = calculatePortfolioRisk(
    allocations.map((a) => ({ pct: a.percentage / 100, riskScore: a.riskScore }))
  );
  const waterStress = calculatePortfolioWaterStress(
    allocations.map((a) => ({ pct: a.percentage / 100, waterStressPct: a.waterStress }))
  );
  const diversification = calculateDiversificationScore(
    allocations.map((a) => ({ pct: a.percentage / 100 }))
  );

  // Optimization score = weighted average of diversification, risk-fitness, water
  const topRec = sortedEligible[0];
  const optimizationScore = clamp(roundInt(
    diversification * 0.30 +
    (100 - riskResult.score) * 0.40 +
    (100 - waterStress) * 0.30
  ));

  const confidenceScore = topRec?.confidenceScore ?? 75;

  // ── Step 6: explanations & warnings ─────────────────────
  const explanationArr = generatePortfolioExplanation(allocations, excluded, sortedScored);
  const warningsArr = generatePortfolioWarnings(allocations, waterStress, riskResult.level);

  return {
    id: 'portfolio-optimizer-1',
    farmId: 'demo-farm-1',
    totalLand,
    allocations,
    expectedTotalProfit,
    portfolioRisk: riskResult.level,
    waterStressScore: waterStress,
    diversificationScore: diversification,
    confidenceScore,
    explanation: explanationArr.join(' '),
    // Extended fields consumed by PortfolioPage
    optimizationScore,
    explanations: explanationArr,
    warnings: warningsArr,
    portfolioRiskScore: riskResult.score,
    createdAt: new Date().toISOString(),
    isDemo: true,
  } as Portfolio;
}

// ============================================================
// EMPTY PORTFOLIO (edge case)
// ============================================================

function buildEmptyPortfolio(totalLand: number): Portfolio {
  return {
    id: 'portfolio-empty',
    farmId: 'demo-farm-1',
    totalLand,
    allocations: [],
    expectedTotalProfit: 0,
    portfolioRisk: 'high',
    waterStressScore: 0,
    diversificationScore: 0,
    confidenceScore: 0,
    explanation:
      'No suitable crop portfolio could be generated with the current data. Please consult an agricultural expert and verify soil/water information.',
    createdAt: new Date().toISOString(),
    isDemo: true,
  } as Portfolio;
}

// ============================================================
// COMPARISON BUILDER
// ============================================================

export function buildPortfolioComparison(
  recommendations: CropRecommendation[],
  portfolio: Portfolio,
  totalLand: number
): PortfolioComparison {
  const singleCrop = buildSingleCropComparison(recommendations, totalLand);
  return {
    singleCrop,
    portfolio: {
      expectedTotalProfit: portfolio.expectedTotalProfit,
      portfolioRiskScore: (portfolio as any).portfolioRiskScore ?? 35,
      portfolioRisk: portfolio.portfolioRisk,
      waterStress: portfolio.waterStressScore,
      diversificationScore: portfolio.diversificationScore,
    },
  };
}
