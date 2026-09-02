// ============================================================
// MittiMitra AI — i18n English Dictionary
// ============================================================

export const en = {
  // App
  appName: 'MittiMitra AI',
  tagline: 'Soil-to-Profit Decision Support System',

  // Nav
  nav: {
    dashboard: 'Dashboard',
    fieldSetup: 'Field Setup',
    soil: 'Soil Intelligence',
    weather: 'Weather & Water',
    market: 'Market Intelligence',
    aiAnalysis: 'AI Crop Analysis',
    portfolio: 'Crop Portfolio',
    simulator: 'What-If Simulator',
    seasonPlanner: '3-Season Planner',
    actionPlan: 'Action Plan',
    history: 'Recommendation History',
    settings: 'Settings',
    logout: 'Logout',
  },

  // Dashboard
  dashboard: {
    greeting: 'Good Morning',
    runAnalysis: 'Run AI Farm Analysis',
    analyzeBtn: 'Analyze My Farm',
    soilHealth: 'Soil Health',
    waterAvailability: 'Water Availability',
    expectedProfit: 'Expected Farm Profit',
    overallRisk: 'Overall Risk',
    aiConfidence: 'AI Confidence',
    demoNote: '* Demo values — based on mock data simulation',
  },

  // Status labels
  status: {
    optimal: 'Optimal',
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    good: 'Good',
    medium: 'Medium',
    poor: 'Poor',
  },

  // Risk
  risk: {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  },

  // Action labels
  action: {
    recommended: 'Recommended',
    consider: 'Consider',
    high_risk: 'High Risk',
    do_not_plant: 'Do Not Plant',
  },

  // Water
  water: {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    very_high: 'Very High',
  },

  // Buttons
  btn: {
    loadDemo: 'Try Demo Farm',
    login: 'Login',
    register: 'Create Account',
    next: 'Next',
    back: 'Back',
    finish: 'Complete Setup',
    runAnalysis: 'Run AI Analysis',
    viewDetails: 'View Details',
    viewExplanation: 'View Explanation',
    recalculate: 'Recalculate Portfolio',
    apply: 'Apply Scenario',
    reset: 'Reset',
    save: 'Save Scenario',
  },

  // Demo notice
  demo: {
    notice: 'Demo Mode',
    soilNotice: 'Indicative sensor reading — validate against Soil Health Card or laboratory measurement',
    marketNotice: 'Mock market data — replace with live Agmarknet integration in production',
    confidenceNotice: 'Demo confidence score based on data completeness and model-simulation consistency',
    projectionNotice: 'Projected value — treat as indicative simulation, not guaranteed outcome',
  },
};

export type TranslationKey = typeof en;
