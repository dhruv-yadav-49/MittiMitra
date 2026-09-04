// ============================================================
// MittiMitra AI — 3-Season Planner Pre-computed Data
// ============================================================
//
// Label: "3-Season Planner — Simulated / Model Output"
//
// This file calls generateThreeSeasonPlan() for both plan types.
// The results are computed once at module load time and exported.
// Pages import these — no business logic in UI components.
// ============================================================

import { generateThreeSeasonPlan, compareSeasonPlans, PROFIT_FOCUSED_PREFS, RISK_BALANCED_PREFS } from '../lib/seasonPlanner';
import { DEMO_SOIL } from './soil';
import { DEMO_WATER } from './weather';
import { DEMO_MARKET } from './market';
import { DEMO_CROP_HISTORY, DEMO_FARM } from './farms';
import { CROPS } from './crops';

const TOTAL_LAND = DEMO_FARM.totalLand; // 10 acres

export const THREE_SEASON_PLAN_A = generateThreeSeasonPlan(
  DEMO_SOIL,
  DEMO_CROP_HISTORY,
  DEMO_WATER,
  DEMO_MARKET,
  CROPS,
  TOTAL_LAND,
  PROFIT_FOCUSED_PREFS,
  'profit_focused'
);

export const THREE_SEASON_PLAN_B = generateThreeSeasonPlan(
  DEMO_SOIL,
  DEMO_CROP_HISTORY,
  DEMO_WATER,
  DEMO_MARKET,
  CROPS,
  TOTAL_LAND,
  RISK_BALANCED_PREFS,
  'risk_balanced'
);

export const SEASON_PLAN_COMPARISON = compareSeasonPlans(THREE_SEASON_PLAN_A, THREE_SEASON_PLAN_B);
