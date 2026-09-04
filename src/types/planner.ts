// ============================================================
// MittiMitra AI — New SeasonPlan Types for Planner Engine
// ============================================================
//
// Extends src/types/index.ts types for the 3-Season Planner.
// Kept in a separate file to avoid polluting the main type file.
//
// Label: "3-Season Planner — Simulated / Model Output"
// ============================================================

import type { Portfolio, SoilReading } from './index';

// ── Crop Rotation Effect ─────────────────────────────────────

export interface RotationEffect {
  fromCropId: string;
  toCropId: string;
  benefitScore: number;       // 0–100: 100 = excellent rotation
  nitrogenImpact: number;     // relative change to soil N (normalized delta)
  soilHealthDelta: number;    // -20 to +20 points
  explanation: string;
}

// ── Soil Impact per Season ───────────────────────────────────

export interface SeasonSoilImpact {
  season: number;             // 1, 2, 3
  nitrogenDelta: number;      // kg/ha change (simulated)
  phosphorusDelta: number;
  potassiumDelta: number;
  organicCarbonDelta: number;
  overallSoilScore: number;   // 0–100
  trend: 'improving' | 'stable' | 'declining';
  explanation: string;
}

// ── Per-Crop Season Data ──────────────────────────────────────

export interface SeasonCropAllocation {
  cropId: string;
  cropName: string;
  cropNameHi: string;
  acres: number;
  percentage: number;
  expectedYield: number;      // quintal/acre
  totalYield: number;         // quintal total
  expectedRevenue: number;    // ₹/acre
  totalRevenue: number;       // ₹ total
  estimatedCost: number;      // ₹ total
  expectedProfit: number;     // ₹ total
  waterRequirement: 'low' | 'medium' | 'high' | 'very_high';
  waterRequirementMM: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  soilImpact: 'positive' | 'neutral' | 'negative';
  rotationBenefit: string;
  reasons: string[];
  color: string;
}

// ── Season Plan ───────────────────────────────────────────────

export interface EngineSeasonPlan {
  seasonIndex: number;        // 1, 2, 3
  seasonLabel: string;        // 'Rabi 2024–25'
  seasonType: 'rabi' | 'kharif' | 'zaid';
  crops: SeasonCropAllocation[];
  portfolio: Portfolio;

  // Aggregated metrics
  totalExpectedRevenue: number;
  totalEstimatedCost: number;
  totalExpectedProfit: number;
  totalWaterMM: number;
  portfolioRisk: 'low' | 'medium' | 'high';
  waterStress: number;
  diversificationScore: number;
  rotationScore: number;      // 0–100
  soilImpact: SeasonSoilImpact;

  // Explainability
  explanations: string[];
  warnings: string[];
  notes: string;
}

// ── Three Season Plan ─────────────────────────────────────────

export interface ThreeSeasonPlan {
  planId: string;
  planName: string;
  planDescription: string;
  planType: 'profit_focused' | 'risk_balanced';
  seasons: [EngineSeasonPlan, EngineSeasonPlan, EngineSeasonPlan];

  // Cross-season aggregates
  totalProjectedProfit: number;
  totalProjectedRevenue: number;
  totalWaterMM: number;
  avgRiskScore: number;
  avgWaterStress: number;
  avgDiversification: number;
  avgRotationScore: number;
  soilTrend: 'improving' | 'stable' | 'declining';
  planExplanation: string;

  // 3-season soil trajectory
  soilTrajectory: SeasonSoilImpact[];

  isDemo: true;
  generatedAt: string;
}

// ── Plan Comparison Metrics ───────────────────────────────────

export interface PlanComparisonMetric {
  metric: string;
  unit: string;
  planA: number | string;
  planB: number | string;
  better: 'A' | 'B' | 'equal';
  tradeoffNote: string;
}

export interface PlanComparison {
  planA: ThreeSeasonPlan;
  planB: ThreeSeasonPlan;
  metrics: PlanComparisonMetric[];
  tradeoffSummary: string;
}

// ── Farm State passed between seasons ────────────────────────

export interface FarmState {
  soil: SoilReading;
  cropHistory: string;        // last planted crop IDs (comma-separated)
  seasonIndex: number;
  soilHealthScore: number;    // 0–100
}
