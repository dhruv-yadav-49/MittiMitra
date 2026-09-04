// ============================================================
// MittiMitra AI — What-If Farm Scenario Decision Engine
// Prompt 4: Simulator + Portfolio Re-optimization
// ============================================================
//
// Architecture:
//   User Input
//     ↓
//   runScenario()          (engine.ts)
//     ↓
//   CropRecommendation[]
//     ↓
//   optimizeCropPortfolio() (portfolioOptimizer.ts)
//     ↓
//   Scenario Portfolio
//     ↓
//   Compare vs Baseline
//
// No business logic lives in this file.
// All calculations are in engine.ts + portfolioOptimizer.ts.
// ============================================================

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Sliders, RotateCcw, AlertTriangle, TrendingUp, TrendingDown,
  CheckCircle2, Info, ChevronDown, ChevronUp, Zap, CloudRain,
  Thermometer, Droplets, BarChart2, DollarSign
} from 'lucide-react';
import { PageHeader, DemoBadge, InfoNote, SectionLabel, RiskBadge } from '../../components/shared';
import { formatCurrency, cn } from '../../lib/utils';
import { runScenario, type ScenarioParams } from '../../lib/engine';
import { optimizeCropPortfolio, DEFAULT_PREFERENCES } from '../../lib/portfolioOptimizer';
import { DEMO_SOIL } from '../../data/soil';
import { DEMO_WEATHER, DEMO_WATER } from '../../data/weather';
import { DEMO_MARKET } from '../../data/market';
import { DEMO_CROP_HISTORY, DEMO_FARM } from '../../data/farms';
import { CROPS } from '../../data/crops';
import { DEMO_RECOMMENDATIONS, DEMO_PORTFOLIO } from '../../data/recommendations';
import type { WaterData, Portfolio } from '../../types';

// ── Types ──────────────────────────────────────────────────────

interface ScenarioConfig {
  rainfallChangePct: number;    // -50 to +50
  priceChangePct: number;       // -30 to +30
  temperatureChangeDeg: number; // -5 to +5
  waterChangePct: number;       // -50 to +50 (shifts base water availability)
}

const INITIAL_SCENARIO: ScenarioConfig = {
  rainfallChangePct: 0,
  priceChangePct: 0,
  temperatureChangeDeg: 0,
  waterChangePct: 0,
};

// ── Scenario Presets ──────────────────────────────────────────

interface Preset {
  id: string;
  label: string;
  icon: string;
  description: string;
  config: ScenarioConfig;
}

const PRESETS: Preset[] = [
  {
    id: 'normal',
    label: 'Normal Season',
    icon: '🌤',
    description: 'Baseline conditions — no change from current data.',
    config: { rainfallChangePct: 0, priceChangePct: 0, temperatureChangeDeg: 0, waterChangePct: 0 },
  },
  {
    id: 'drought',
    label: 'Drought',
    icon: '☀️',
    description: 'Rainfall -40%, water availability -40%, temperature +2°C.',
    config: { rainfallChangePct: -40, priceChangePct: 0, temperatureChangeDeg: 2, waterChangePct: -40 },
  },
  {
    id: 'heavy_rain',
    label: 'Heavy Rain',
    icon: '🌧',
    description: 'Rainfall +40%, water availability +30%, temperature -2°C.',
    config: { rainfallChangePct: 40, priceChangePct: 0, temperatureChangeDeg: -2, waterChangePct: 30 },
  },
  {
    id: 'high_price',
    label: 'High Market Price',
    icon: '📈',
    description: 'Market prices +25% — bumper year for cash crops.',
    config: { rainfallChangePct: 0, priceChangePct: 25, temperatureChangeDeg: 0, waterChangePct: 0 },
  },
];

// ── Water availability mapper ──────────────────────────────────

function computeWaterAvailability(baseAvail: 'low' | 'moderate' | 'high', waterChangePct: number): 'low' | 'moderate' | 'high' {
  const order = ['low', 'moderate', 'high'];
  const baseIdx = order.indexOf(baseAvail);
  const scoreMap = { low: 20, moderate: 50, high: 80 };
  const base = scoreMap[baseAvail];
  const newScore = Math.max(0, Math.min(100, base + waterChangePct * 0.6));
  if (newScore >= 65) return 'high';
  if (newScore >= 35) return 'moderate';
  return 'low';
}

// ── Deterministic explanation generator ──────────────────────

function generateScenarioExplanations(
  cfg: ScenarioConfig,
  baseP: Portfolio,
  scenP: Portfolio
): string[] {
  const lines: string[] = [];

  if (cfg.rainfallChangePct <= -20) {
    lines.push('Lower rainfall increased modeled water stress for high-water-demand crops, reducing their suitability scores and portfolio allocation.');
  } else if (cfg.rainfallChangePct >= 20) {
    lines.push('Increased rainfall reduced irrigation dependency, improving suitability scores for rain-fed crops.');
  }

  if (cfg.waterChangePct <= -25) {
    lines.push('Reduced water availability caused the optimizer to exclude or reduce allocation to water-intensive crops.');
  } else if (cfg.waterChangePct >= 25) {
    lines.push('Higher water availability expanded the eligible crop set, allowing more water-dependent crops into the portfolio.');
  }

  if (cfg.priceChangePct >= 15) {
    lines.push('Higher market prices increased the financial attractiveness of all crops, raising expected profit projections and portfolio revenue.');
  } else if (cfg.priceChangePct <= -15) {
    lines.push('Market price decline reduced revenue projections. Lower-cost, drought-tolerant crops became relatively more competitive.');
  }

  if (cfg.temperatureChangeDeg >= 3) {
    lines.push('Temperature increase reduced suitability scores for heat-sensitive rabi crops. The optimizer shifted allocation toward heat-tolerant varieties.');
  } else if (cfg.temperatureChangeDeg <= -3) {
    lines.push('Temperature drop improved conditions for cool-season crops like Wheat and Chickpea, increasing their suitability scores.');
  }

  const profitDelta = scenP.expectedTotalProfit - baseP.expectedTotalProfit;
  if (Math.abs(profitDelta) > 5000) {
    lines.push(
      profitDelta > 0
        ? `Portfolio estimated profit increased by ${formatCurrency(profitDelta)} under this scenario.`
        : `Portfolio estimated profit decreased by ${formatCurrency(Math.abs(profitDelta))} — higher risk conditions reduced yield and revenue projections.`
    );
  }

  const riskDelta = (scenP as any).portfolioRiskScore - (baseP as any).portfolioRiskScore;
  if (riskDelta > 8) {
    lines.push('Portfolio risk increased because the scenario forced allocation toward higher-risk crops as safer options became ineligible.');
  } else if (riskDelta < -8) {
    lines.push('Portfolio risk decreased — the scenario made lower-risk crops more dominant in the optimized allocation.');
  }

  lines.push(
    'Portfolio allocation changed because the risk-water-profit balance shifted under the new scenario inputs. The same AI optimizer ran on updated engine outputs.'
  );

  return lines.slice(0, 5);
}

// ── Main Component ────────────────────────────────────────────

const TOTAL_LAND = DEMO_FARM.totalLand;

export default function SimulatorPage() {
  const [config, setConfig] = useState<ScenarioConfig>(INITIAL_SCENARIO);
  const [activePreset, setActivePreset] = useState<string>('normal');
  const [showExplanation, setShowExplanation] = useState(true);

  // ── Baseline (never changes — built from DEMO_RECOMMENDATIONS) ──
  const baselineRecs = useMemo(() => DEMO_RECOMMENDATIONS, []);
  const baselinePortfolio: Portfolio = useMemo(() => DEMO_PORTFOLIO, []);

  // ── Scenario (recalculates on every config change) ──────────
  const scenarioWater: WaterData = useMemo(() => ({
    ...DEMO_WATER,
    availability: computeWaterAvailability(DEMO_WATER.availability, config.waterChangePct),
  }), [config.waterChangePct]);

  const scenarioParams: ScenarioParams = useMemo(() => ({
    rainfallChangePct: config.rainfallChangePct,
    priceChangePct: config.priceChangePct,
    temperatureChangeDeg: config.temperatureChangeDeg,
    waterAvailability: scenarioWater.availability,
  }), [config, scenarioWater.availability]);

  const scenarioRecs = useMemo(() =>
    runScenario(DEMO_SOIL, DEMO_WEATHER, DEMO_WATER, DEMO_MARKET, DEMO_CROP_HISTORY, CROPS, scenarioParams),
  [scenarioParams]);

  const scenarioPortfolio: Portfolio = useMemo(() =>
    optimizeCropPortfolio(TOTAL_LAND, scenarioRecs, scenarioWater, DEFAULT_PREFERENCES),
  [scenarioRecs, scenarioWater]);

  // ── Apply preset ──────────────────────────────────────────────
  const applyPreset = (preset: Preset) => {
    setConfig(preset.config);
    setActivePreset(preset.id);
  };

  const update = (key: keyof ScenarioConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setActivePreset('custom');
  };

  const reset = () => {
    setConfig(INITIAL_SCENARIO);
    setActivePreset('normal');
  };

  // ── Derived metrics for comparison ───────────────────────────
  const baseProfit = baselinePortfolio.expectedTotalProfit;
  const scenProfit = scenarioPortfolio.expectedTotalProfit;
  const profitDelta = scenProfit - baseProfit;
  const profitDeltaPct = baseProfit > 0 ? ((profitDelta / baseProfit) * 100).toFixed(1) : '0.0';

  const baseRiskScore = (baselinePortfolio as any).portfolioRiskScore ?? 35;
  const scenRiskScore = (scenarioPortfolio as any).portfolioRiskScore ?? 35;
  const riskDelta = scenRiskScore - baseRiskScore;

  const baseWaterStress = baselinePortfolio.waterStressScore;
  const scenWaterStress = scenarioPortfolio.waterStressScore;
  const waterDelta = scenWaterStress - baseWaterStress;

  const baseDiversification = baselinePortfolio.diversificationScore;
  const scenDiversification = scenarioPortfolio.diversificationScore;
  const divDelta = scenDiversification - baseDiversification;

  // ── All crops for the allocation table ───────────────────────
  const allCropIds = [...new Set([
    ...baselineRecs.map(r => r.cropId),
    ...scenarioRecs.map(r => r.cropId),
  ])];

  // ── Explanations ──────────────────────────────────────────────
  const explanations = useMemo(() =>
    generateScenarioExplanations(config, baselinePortfolio, scenarioPortfolio),
  [config, scenarioPortfolio, baselinePortfolio]);

  // ── Chart data ────────────────────────────────────────────────
  const profitChartData = [
    { name: 'Baseline', profit: baseProfit },
    { name: 'Scenario', profit: scenProfit },
  ];

  const riskChartData = [
    { name: 'Baseline', risk: baseRiskScore, water: baseWaterStress },
    { name: 'Scenario', risk: scenRiskScore, water: scenWaterStress },
  ];

  const allocationChartData = baselineRecs
    .filter(r => r.action !== 'do_not_plant')
    .slice(0, 5)
    .map(r => {
      const baseAlloc = baselinePortfolio.allocations.find(a => a.cropId === r.cropId);
      const scenAlloc = scenarioPortfolio.allocations.find(a => a.cropId === r.cropId);
      return {
        crop: r.cropName.length > 8 ? r.cropName.slice(0, 8) + '…' : r.cropName,
        baseline: baseAlloc?.percentage ?? 0,
        scenario: scenAlloc?.percentage ?? 0,
      };
    });

  const isScenarioChanged = activePreset !== 'normal' ||
    Object.values(config).some(v => v !== 0);

  const sliders = [
    {
      key: 'rainfallChangePct' as const,
      label: 'Rainfall Change',
      icon: CloudRain,
      min: -50, max: 50, step: 5, unit: '%',
      color: '#60A5FA',
    },
    {
      key: 'temperatureChangeDeg' as const,
      label: 'Temperature Change',
      icon: Thermometer,
      min: -5, max: 5, step: 1, unit: '°C',
      color: '#F97316',
    },
    {
      key: 'priceChangePct' as const,
      label: 'Market Price Change',
      icon: DollarSign,
      min: -30, max: 30, step: 5, unit: '%',
      color: '#8B5CF6',
    },
    {
      key: 'waterChangePct' as const,
      label: 'Water Availability Change',
      icon: Droplets,
      min: -50, max: 50, step: 10, unit: '%',
      color: '#2D6A4F',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="What-If Farm Scenario Engine"
        subtitle="Change conditions → AI recalculates crop ranking → Portfolio Optimizer re-allocates your entire farm"
        badge={<DemoBadge />}
        actions={
          <button onClick={reset} className="btn-secondary text-sm flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        }
      />
      <InfoNote variant="info">
        <strong>AI Decision Engine + Portfolio Optimizer — MVP Simulation.</strong> Every scenario change re-runs <code>runScenario()</code> + <code>optimizeCropPortfolio()</code>. No separate calculation logic. All values are illustrative estimates.
      </InfoNote>

      {/* ── HOW IT WORKS banner ───────────────────────── */}
      <div className="card bg-gradient-to-r from-[#1A1A2E] to-[#2D6A4F] text-white border-0 p-4">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-center">
          {[
            'Change Conditions',
            '→',
            'runScenario()',
            '→',
            'Crop Re-ranking',
            '→',
            'optimizeCropPortfolio()',
            '→',
            'New Farm Plan',
          ].map((step, i) => (
            <span key={i} className={cn(
              'px-2 py-1 rounded-lg',
              step === '→' ? 'text-[#B7E4C7] text-base' : 'bg-white/10 text-white'
            )}>{step}</span>
          ))}
        </div>
      </div>

      {/* ── SCENARIO PRESETS ──────────────────────────── */}
      <div className="card">
        <div className="mb-3"><SectionLabel>Quick Presets</SectionLabel></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={cn(
                'p-3 rounded-xl border-2 text-left transition-all',
                activePreset === preset.id
                  ? 'border-[#2D6A4F] bg-[#E8F5EE]'
                  : 'border-[#E5E0D8] bg-white hover:border-[#52B788]'
              )}
            >
              <div className="text-2xl mb-1">{preset.icon}</div>
              <div className={cn('text-xs font-bold', activePreset === preset.id ? 'text-[#2D6A4F]' : 'text-[#1A1A2E]')}>{preset.label}</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── SCENARIO CONTROLS ─────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Sliders className="w-5 h-5 text-[#2D6A4F]" />
          <h3 className="font-semibold text-[#1A1A2E]">Custom Scenario Controls</h3>
          {activePreset !== 'normal' && activePreset !== 'custom' && (
            <span className="ml-auto text-xs bg-[#E8F5EE] text-[#2D6A4F] font-bold px-2 py-0.5 rounded-full">
              {PRESETS.find(p => p.id === activePreset)?.label ?? ''} Preset Active
            </span>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {sliders.map(sl => {
            const val = config[sl.key];
            return (
              <div key={sl.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#1A1A2E] flex items-center gap-1.5">
                    <sl.icon className="w-3.5 h-3.5" style={{ color: sl.color }} />
                    {sl.label}
                  </label>
                  <span className={cn('text-sm font-bold tabular-nums',
                    val > 0 ? 'text-emerald-600' : val < 0 ? 'text-red-500' : 'text-[#6B7280]'
                  )}>
                    {val > 0 ? '+' : ''}{val}{sl.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={sl.min}
                  max={sl.max}
                  step={sl.step}
                  value={val}
                  onChange={e => update(sl.key, Number(e.target.value))}
                  className="w-full accent-[#2D6A4F]"
                />
                <div className="flex justify-between text-[10px] text-[#6B7280] mt-1">
                  <span>{sl.min}{sl.unit}</span>
                  <span className="font-medium">Baseline</span>
                  <span>+{sl.max}{sl.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className={cn(
            'text-xs font-medium px-3 py-1.5 rounded-full border',
            isScenarioChanged
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          )}>
            {isScenarioChanged ? '⚡ Scenario active — portfolio re-optimized' : '✓ Baseline conditions'}
          </div>
          <div className="text-[10px] text-[#6B7280]">
            Water: {scenarioWater.availability}
          </div>
        </div>
      </div>

      {/* ── KPI COMPARISON ROW ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Est. Portfolio Profit',
            base: formatCurrency(baseProfit),
            scen: formatCurrency(scenProfit),
            delta: `${profitDelta >= 0 ? '+' : ''}${formatCurrency(Math.abs(profitDelta))}`,
            positive: profitDelta >= 0,
            icon: TrendingUp,
          },
          {
            label: 'Portfolio Risk Score',
            base: `${baseRiskScore}/100`,
            scen: `${scenRiskScore}/100`,
            delta: `${riskDelta >= 0 ? '+' : ''}${riskDelta}`,
            positive: riskDelta <= 0, // lower risk = better
            icon: BarChart2,
          },
          {
            label: 'Water Stress',
            base: `${baseWaterStress}/100`,
            scen: `${scenWaterStress}/100`,
            delta: `${waterDelta >= 0 ? '+' : ''}${waterDelta}`,
            positive: waterDelta <= 0,
            icon: Droplets,
          },
          {
            label: 'Diversification',
            base: `${baseDiversification}/100`,
            scen: `${scenDiversification}/100`,
            delta: `${divDelta >= 0 ? '+' : ''}${divDelta}`,
            positive: divDelta >= 0,
            icon: Zap,
          },
        ].map(({ label, base, scen, delta, positive, icon: Icon }) => (
          <div key={label} className="card-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className="w-3.5 h-3.5 text-[#6B7280]" />
              <div className="text-[10px] text-[#6B7280] font-medium">{label}</div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] text-[#6B7280]">Baseline</div>
                <div className="text-sm font-bold text-[#1A1A2E]">{base}</div>
              </div>
              <div className="text-center">
                <div className={cn('text-xs font-bold', positive ? 'text-emerald-600' : 'text-red-500')}>
                  {delta}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#6B7280]">Scenario</div>
                <div className={cn('text-sm font-bold', positive ? 'text-emerald-600' : 'text-red-500')}>{scen}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── LAND ALLOCATION COMPARISON ────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Baseline Portfolio */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Baseline Farm Plan</SectionLabel>
            <span className="text-xs text-[#6B7280]">AI Optimized · {TOTAL_LAND} acres</span>
          </div>
          <div className="space-y-3">
            {baselinePortfolio.allocations.map(a => (
              <div key={a.cropId}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                    <span className="text-sm font-medium text-[#1A1A2E]">{a.cropName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[#2D6A4F]">{a.percentage}%</span>
                    <span className="text-[#6B7280]">{a.acres}ac</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#F0EDE8] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${a.percentage}%`, background: a.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5E0D8] flex justify-between text-sm font-bold">
            <span>Est. Profit</span>
            <span className="text-[#2D6A4F]">{formatCurrency(baseProfit)}</span>
          </div>
          <div className="flex justify-between text-xs text-[#6B7280] mt-1">
            <span>Risk: <RiskBadge risk={baselinePortfolio.portfolioRisk} className="inline text-[9px]" /></span>
            <span>Diversification: {baseDiversification}/100</span>
          </div>
        </div>

        {/* Scenario Portfolio */}
        <div className="card border-2 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Scenario Farm Plan</SectionLabel>
            <span className={cn('text-xs font-bold', isScenarioChanged ? 'text-amber-600' : 'text-[#6B7280]')}>
              {isScenarioChanged ? '⚡ Re-optimized' : 'Same as baseline'} · {TOTAL_LAND} acres
            </span>
          </div>
          <div className="space-y-3">
            {/* Show all base crops and any new scenario crops */}
            {(() => {
              const allIds = [...new Set([
                ...baselinePortfolio.allocations.map(a => a.cropId),
                ...scenarioPortfolio.allocations.map(a => a.cropId),
              ])];
              return allIds.map(cropId => {
                const baseAlloc = baselinePortfolio.allocations.find(a => a.cropId === cropId);
                const scenAlloc = scenarioPortfolio.allocations.find(a => a.cropId === cropId);
                const scenRec = scenarioRecs.find(r => r.cropId === cropId);
                const pct = scenAlloc?.percentage ?? 0;
                const color = scenAlloc?.color ?? baseAlloc?.color ?? '#6B7280';
                const name = scenAlloc?.cropName ?? baseAlloc?.cropName ?? cropId;
                const basePct = baseAlloc?.percentage ?? 0;
                const change = pct - basePct;
                const isExcluded = !scenAlloc || pct === 0;
                return (
                  <div key={cropId}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: isExcluded ? '#D1D5DB' : color }} />
                        <span className={cn('text-sm font-medium', isExcluded ? 'text-[#9CA3AF] line-through' : 'text-[#1A1A2E]')}>{name}</span>
                        {scenRec?.action === 'do_not_plant' && (
                          <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">DO NOT PLANT</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={cn('font-bold', isExcluded ? 'text-[#9CA3AF]' : 'text-amber-700')}>{pct}%</span>
                        {change !== 0 && (
                          <span className={cn('text-[10px] font-bold', change > 0 ? 'text-emerald-600' : 'text-red-500')}>
                            {change > 0 ? `↑${change}` : `↓${Math.abs(change)}`}pp
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[#F0EDE8] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: isExcluded ? '#E5E7EB' : color }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5E0D8] flex justify-between text-sm font-bold">
            <span>Est. Profit</span>
            <span className={cn(profitDelta >= 0 ? 'text-emerald-600' : 'text-red-500')}>
              {formatCurrency(scenProfit)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-[#6B7280] mt-1">
            <span>Risk: <RiskBadge risk={scenarioPortfolio.portfolioRisk} className="inline text-[9px]" /></span>
            <span>Diversification: {scenDiversification}/100</span>
          </div>
        </div>
      </div>

      {/* ── ALLOCATION CHANGE TABLE ────────────────────── */}
      <div className="card">
        <SectionLabel>Land Allocation Change</SectionLabel>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E0D8]">
                {['Crop', 'Baseline %', 'Scenario %', 'Change', 'Base Score', 'Scenario Score', 'Status'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[#6B7280] uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allCropIds.map(cropId => {
                const baseAlloc = baselinePortfolio.allocations.find(a => a.cropId === cropId);
                const scenAlloc = scenarioPortfolio.allocations.find(a => a.cropId === cropId);
                const baseRec = baselineRecs.find(r => r.cropId === cropId);
                const scenRec = scenarioRecs.find(r => r.cropId === cropId);
                const basePct = baseAlloc?.percentage ?? 0;
                const scenPct = scenAlloc?.percentage ?? 0;
                const change = scenPct - basePct;
                const name = baseRec?.cropName ?? scenRec?.cropName ?? cropId;
                return (
                  <tr key={cropId} className="border-b border-[#F0EDE8] hover:bg-[#F8F5F0]">
                    <td className="py-2 px-3 font-semibold text-[#1A1A2E]">{name}</td>
                    <td className="py-2 px-3 text-[#2D6A4F] font-bold">{basePct}%</td>
                    <td className="py-2 px-3 font-bold text-amber-700">{scenPct}%</td>
                    <td className={cn('py-2 px-3 font-bold tabular-nums', change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-500' : 'text-[#6B7280]')}>
                      {change > 0 ? `↑ +${change}` : change < 0 ? `↓ ${change}` : '—'}pp
                    </td>
                    <td className="py-2 px-3 text-[#2D6A4F]">{baseRec?.overallScore ?? '—'}</td>
                    <td className={cn('py-2 px-3 font-bold',
                      (scenRec?.overallScore ?? 0) >= (baseRec?.overallScore ?? 0) ? 'text-emerald-600' : 'text-red-500'
                    )}>
                      {scenRec?.overallScore ?? '—'}
                    </td>
                    <td className="py-2 px-3">
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded',
                        scenRec?.action === 'recommended' ? 'bg-emerald-100 text-emerald-700' :
                        scenRec?.action === 'consider' ? 'bg-amber-100 text-amber-700' :
                        scenRec?.action === 'high_risk' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {scenRec?.action?.replace('_', ' ').toUpperCase() ?? '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CROP RANKING COMPARISON ────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="mb-2"><SectionLabel>Baseline Crop Ranking</SectionLabel></div>
          <div className="space-y-2 mt-3">
            {baselineRecs.slice(0, 5).map((r, i) => (
              <div key={r.cropId} className="flex items-center gap-3">
                <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  r.action === 'recommended' ? 'bg-emerald-100 text-emerald-700' :
                  r.action === 'do_not_plant' ? 'bg-red-100 text-red-600' : 'bg-[#F0EDE8] text-[#6B7280]'
                )}>
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-[#1A1A2E]">{r.cropName}</span>
                <span className="text-xs font-bold text-[#2D6A4F]">{r.overallScore}%</span>
                <span className="text-[10px] text-[#6B7280]">{formatCurrency(r.expectedProfit)}/ac</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card border-amber-200">
          <div className="mb-2"><SectionLabel>Scenario Crop Ranking</SectionLabel></div>
          <div className="space-y-2 mt-3">
            {scenarioRecs.slice(0, 5).map((r, i) => {
              const baseRank = baselineRecs.findIndex(b => b.cropId === r.cropId);
              const rankChange = baseRank >= 0 ? baseRank - i : 0;
              return (
                <div key={r.cropId} className="flex items-center gap-3">
                  <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    r.action === 'recommended' ? 'bg-emerald-100 text-emerald-700' :
                    r.action === 'do_not_plant' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                  )}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-[#1A1A2E]">{r.cropName}</span>
                  <span className="text-xs font-bold text-amber-700">{r.overallScore}%</span>
                  {rankChange !== 0 && (
                    <span className={cn('text-[10px] font-bold', rankChange > 0 ? 'text-emerald-600' : 'text-red-500')}>
                      {rankChange > 0 ? `↑${rankChange}` : `↓${Math.abs(rankChange)}`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CHARTS ───────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Chart 1 — Profit */}
        <div className="card">
          <SectionLabel>Estimated Profit</SectionLabel>
          <DemoBadge />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={profitChartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Est. Profit']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="profit" radius={[6, 6, 0, 0]} fill="#52B788">
                {profitChartData.map((entry, i) => (
                  <rect key={i} fill={i === 1 ? (profitDelta >= 0 ? '#2D6A4F' : '#E76F51') : '#52B788'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 — Risk & Water */}
        <div className="card">
          <SectionLabel>Risk & Water Stress</SectionLabel>
          <DemoBadge />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={riskChartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="risk" name="Risk" fill="#E76F51" radius={[4, 4, 0, 0]} />
              <Bar dataKey="water" name="Water Stress" fill="#60A5FA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3 — Allocation */}
        <div className="card">
          <SectionLabel>Land Allocation %</SectionLabel>
          <DemoBadge />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={allocationChartData} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
              <XAxis dataKey="crop" tick={{ fontSize: 9, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="baseline" name="Baseline" fill="#52B788" radius={[3, 3, 0, 0]} />
              <Bar dataKey="scenario" name="Scenario" fill="#D4A017" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── DECISION EXPLANATION ─────────────────────────── */}
      <div className="card border-l-4 border-l-[#2D6A4F]">
        <button
          className="w-full flex items-center justify-between"
          onClick={() => setShowExplanation(e => !e)}
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[#2D6A4F]" />
            <span className="font-semibold text-[#1A1A2E]">AI Decision Changed Because…</span>
          </div>
          {showExplanation ? <ChevronUp className="w-4 h-4 text-[#2D6A4F]" /> : <ChevronDown className="w-4 h-4 text-[#2D6A4F]" />}
        </button>
        {showExplanation && (
          <div className="mt-4 space-y-2">
            {explanations.map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-[#4B5563]">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" /> {e}
              </div>
            ))}
            {/* DO NOT PLANT explanations */}
            {scenarioRecs.filter(r => r.action === 'do_not_plant').map(r => (
              <div key={r.cropId} className="flex items-start gap-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span><strong>{r.cropName}</strong> received 0% allocation — {r.action === 'do_not_plant' ? r.warnings.slice(0, 1).join(' ') : 'risk or water stress exceeded threshold.'}</span>
              </div>
            ))}
            <p className="text-[10px] text-[#9CA3AF] mt-2 border-t border-[#F0EDE8] pt-2">
              AI Portfolio Optimizer — MVP Simulation. All explanations are deterministic rule-based outputs, not LLM/AI-generated text.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
