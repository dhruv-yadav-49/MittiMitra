// ============================================================
// MittiMitra AI — TypeScript Type Definitions
// ============================================================

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  preferredLanguage: 'en' | 'hi';
  state: string;
  district: string;
  createdAt: string;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  totalLand: number;
  landUnit: 'acre' | 'hectare';
  soilType: string;
  irrigationAvailability: 'high' | 'moderate' | 'low' | 'rainfed';
  waterSource: string;
  location?: { lat: number; lng: number };
  isDemo: boolean;
}

export interface CropHistory {
  farmId: string;
  previousCrop: string;
  previousSeason: string;
  approximateYield: number;
  cropRotation: string;
}

export interface SoilReading {
  farmId: string;
  timestamp: string;
  pH: number;
  nitrogen: number;       // kg/ha
  phosphorus: number;     // kg/ha
  potassium: number;      // kg/ha
  ec: number;             // dS/m
  moisture: number;       // %
  organicCarbon: number;  // %
  temperature: number;    // °C
  source: 'sensor' | 'lab' | 'shc' | 'demo';
  isValidated: boolean;
}

export interface WeatherDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  rainfall: number;
  humidity: number;
  weatherCondition: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy' | 'stormy';
}

export interface WeatherData {
  farmId: string;
  currentTemp: number;
  currentHumidity: number;
  currentRainfall: number;
  rainfallForecast: number;
  weatherRisk: 'low' | 'medium' | 'high';
  forecast: WeatherDay[];
  source: 'imd' | 'mock';
}

export interface WaterData {
  farmId: string;
  availability: 'low' | 'moderate' | 'high';
  source: string;
  irrigationType: string;
  stressScore: number;     // 0-100 (0=no stress, 100=extreme stress)
  recommendation: string;
}

export interface MarketPrice {
  cropId: string;
  cropName: string;
  currentPrice: number;   // ₹/quintal
  previousPrice: number;
  priceChange: number;    // %
  demand: 'low' | 'moderate' | 'high';
  marketRisk: 'low' | 'medium' | 'high';
  trend: 'rising' | 'stable' | 'falling';
  priceHistory: { month: string; price: number }[];
}

export interface MarketData {
  region: string;
  updatedAt: string;
  source: 'agmarknet' | 'mock';
  prices: MarketPrice[];
}

export interface Crop {
  id: string;
  name: string;
  nameHi: string;
  category: 'cereal' | 'oilseed' | 'pulse' | 'vegetable' | 'cash_crop';
  season: 'rabi' | 'kharif' | 'zaid' | 'all';
  waterRequirement: 'low' | 'medium' | 'high' | 'very_high';
  waterRequirementMM: number;
  optimalPH: { min: number; max: number };
  optimalN: { min: number; max: number };
  optimalP: { min: number; max: number };
  optimalK: { min: number; max: number };
  growthDays: number;
  yieldRange: { min: number; max: number }; // quintal/acre
  inputCostPerAcre: number;                 // ₹
  msp: number;                              // ₹/quintal (minimum support price)
}

export interface CropRecommendation {
  cropId: string;
  cropName: string;
  cropNameHi: string;
  rank: number;
  suitabilityScore: number;     // 0-100
  expectedYield: number;        // quintal/acre
  estimatedCost: number;        // ₹/acre
  expectedRevenue: number;      // ₹/acre
  expectedProfit: number;       // ₹/acre
  waterRequirement: 'low' | 'medium' | 'high' | 'very_high';
  riskScore: number;            // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  confidenceScore: number;      // 0-100
  action: 'recommended' | 'consider' | 'high_risk' | 'do_not_plant';
  reasons: string[];
  warnings: string[];
  soilCompatibility: number;
  weatherCompatibility: number;
  marketCompatibility: number;
}

export interface RiskAssessment {
  overall: 'low' | 'medium' | 'high';
  overallScore: number;
  waterRisk: number;
  weatherRisk: number;
  marketRisk: number;
  soilRisk: number;
  diseaseRisk: number;
  factors: string[];
}

export interface PortfolioAllocation {
  cropId: string;
  cropName: string;
  cropNameHi: string;
  acres: number;
  percentage: number;
  expectedProfit: number;
  waterStress: number;
  riskScore: number;
  color: string;
}

export interface Portfolio {
  id: string;
  farmId: string;
  totalLand: number;
  allocations: PortfolioAllocation[];
  expectedTotalProfit: number;
  portfolioRisk: 'low' | 'medium' | 'high';
  waterStressScore: number;
  diversificationScore: number;
  confidenceScore: number;
  explanation: string;
  createdAt: string;
  isDemo: boolean;
}

export interface ScenarioInput {
  rainfallChange: number;       // -20 to +20 %
  priceChange: number;          // -20 to +20 %
  waterAvailability: 'low' | 'moderate' | 'high';
  temperatureChange: number;    // -5 to +5 °C
}

export interface ScenarioResult {
  scenarioInput: ScenarioInput;
  cropRankings: CropRecommendation[];
  portfolio: Portfolio;
  expectedProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  keyChanges: string[];
  explanation: string;
}

export interface SeasonPlan {
  season: 'Season 1' | 'Season 2' | 'Season 3';
  seasonName: string;
  crops: {
    cropId: string;
    cropName: string;
    acres: number;
    expectedYield: number;
    expectedProfit: number;
    waterRequirement: 'low' | 'medium' | 'high' | 'very_high';
    risk: 'low' | 'medium' | 'high';
    soilImpact: 'positive' | 'neutral' | 'negative';
  }[];
  totalExpectedProfit: number;
  soilHealth: 'improving' | 'stable' | 'declining';
  cropRotationBenefit: string;
  notes: string;
}

export interface FarmOutcome {
  farmId: string;
  recommendationId: string;
  season: string;
  actualYield: number;
  actualPrice: number;
  actualCost: number;
  actualProfit: number;
  farmerFeedback: string;
  rating: number;
}

export interface RecommendationRecord {
  id: string;
  farmId: string;
  farmName: string;
  date: string;
  portfolio: PortfolioAllocation[];
  expectedProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidenceScore: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export type Language = 'en' | 'hi';
export type LandUnit = 'acre' | 'hectare';
