// ============================================================
// MittiMitra AI — Mock Scenarios & Season Planner Data
// ============================================================

import type { ScenarioResult, SeasonPlan } from '../types';

export const BASELINE_SCENARIO: ScenarioResult = {
  scenarioInput: {
    rainfallChange: 0,
    priceChange: 0,
    waterAvailability: 'moderate',
    temperatureChange: 0,
  },
  cropRankings: [],   // populated at runtime by simulationService
  portfolio: {} as never,
  expectedProfit: 388000,
  riskLevel: 'medium',
  keyChanges: [],
  explanation: 'Baseline scenario using current demo conditions.',
};

export const DEMO_SEASON_PLANS: SeasonPlan[] = [
  {
    season: 'Season 1',
    seasonName: 'Rabi 2024–25 (Oct–Mar)',
    crops: [
      { cropId: 'wheat', cropName: 'Wheat', acres: 4, expectedYield: 72, expectedProfit: 120400, waterRequirement: 'medium', risk: 'low', soilImpact: 'neutral' },
      { cropId: 'mustard', cropName: 'Mustard', acres: 3, expectedYield: 30, expectedProfit: 147000, waterRequirement: 'low', risk: 'low', soilImpact: 'neutral' },
      { cropId: 'chickpea', cropName: 'Chickpea', acres: 2, expectedYield: 18, expectedProfit: 76600, waterRequirement: 'low', risk: 'medium', soilImpact: 'positive' },
      { cropId: 'vegetable', cropName: 'Mixed Vegetables', acres: 1, expectedYield: 55, expectedProfit: 44000, waterRequirement: 'medium', risk: 'high', soilImpact: 'neutral' },
    ],
    totalExpectedProfit: 388000,
    soilHealth: 'stable',
    cropRotationBenefit: 'Chickpea will fix nitrogen, improving soil fertility for next season',
    notes: 'Recommended AI-optimized portfolio for rabi season. Diversified across cereals, oilseeds, pulses and vegetables.',
  },
  {
    season: 'Season 2',
    seasonName: 'Kharif 2025 (Jun–Oct)',
    crops: [
      { cropId: 'maize', cropName: 'Maize', acres: 5, expectedYield: 70, expectedProfit: 83500, waterRequirement: 'medium', risk: 'medium', soilImpact: 'neutral' },
      { cropId: 'vegetable', cropName: 'Mixed Vegetables', acres: 3, expectedYield: 165, expectedProfit: 132000, waterRequirement: 'medium', risk: 'high', soilImpact: 'neutral' },
      { cropId: 'chickpea', cropName: 'Chickpea', acres: 2, expectedYield: 18, expectedProfit: 76600, waterRequirement: 'low', risk: 'medium', soilImpact: 'positive' },
    ],
    totalExpectedProfit: 292100,
    soilHealth: 'improving',
    cropRotationBenefit: 'Rotating from rabi wheat to kharif maize reduces pathogen buildup and improves soil structure',
    notes: 'Projected season plan — values are model simulations. Actual conditions will vary. Chickpea again recommended to continue nitrogen-fixing rotation.',
  },
  {
    season: 'Season 3',
    seasonName: 'Rabi 2025–26 (Oct–Mar)',
    crops: [
      { cropId: 'wheat', cropName: 'Wheat', acres: 5, expectedYield: 90, expectedProfit: 150500, waterRequirement: 'medium', risk: 'low', soilImpact: 'neutral' },
      { cropId: 'mustard', cropName: 'Mustard', acres: 3, expectedYield: 30, expectedProfit: 147000, waterRequirement: 'low', risk: 'low', soilImpact: 'neutral' },
      { cropId: 'vegetable', cropName: 'Mixed Vegetables', acres: 2, expectedYield: 110, expectedProfit: 88000, waterRequirement: 'medium', risk: 'high', soilImpact: 'neutral' },
    ],
    totalExpectedProfit: 385500,
    soilHealth: 'improving',
    cropRotationBenefit: 'Improved soil nitrogen from two seasons of chickpea should support higher wheat yield potential',
    notes: 'Long-range projection. High uncertainty — treat as indicative direction only.',
  },
];
