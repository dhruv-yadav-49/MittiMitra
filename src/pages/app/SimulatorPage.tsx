import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Sliders, RefreshCw, RotateCcw, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { PageHeader, DemoBadge, RiskBadge, InfoNote, SectionLabel } from '../../components/shared';
import { formatCurrency, cn } from '../../lib/utils';
import { DEMO_RECOMMENDATIONS } from '../../data/recommendations';

interface SliderConfig { label: string; key: string; min: number; max: number; step: number; unit: string; value: number }

const INITIAL_SLIDERS: SliderConfig[] = [
  { label: 'Rainfall', key: 'rainfall', min: -20, max: 20, step: 5, unit: '%', value: 0 },
  { label: 'Market Price', key: 'price', min: -20, max: 20, step: 5, unit: '%', value: 0 },
  { label: 'Temperature', key: 'temp', min: -5, max: 5, step: 1, unit: '°C', value: 0 },
];

function computeScenarioRanking(rainfall: number, price: number, temp: number) {
  return DEMO_RECOMMENDATIONS.map(rec => {
    let suitability = rec.suitabilityScore;
    // Rainfall impact on water-heavy crops
    if (rec.waterRequirement === 'very_high') suitability += rainfall * 0.6;
    if (rec.waterRequirement === 'high') suitability += rainfall * 0.4;
    if (rec.waterRequirement === 'medium') suitability += rainfall * 0.15;
    // Price impact
    const profitAdj = rec.expectedProfit * (1 + price / 100);
    // Temperature impact
    if (temp > 2) suitability -= Math.abs(temp) * 2;
    if (temp < -2) suitability -= Math.abs(temp) * 1.5;
    return {
      ...rec,
      suitabilityScore: Math.max(0, Math.min(100, Math.round(suitability))),
      expectedProfit: Math.round(profitAdj),
    };
  }).sort((a, b) => {
    if (a.action === 'do_not_plant') return 1;
    if (b.action === 'do_not_plant') return -1;
    return b.suitabilityScore - a.suitabilityScore;
  }).map((r, i) => ({ ...r, rank: i + 1 }));
}

type WaterLevel = 'low' | 'moderate' | 'high';

export default function SimulatorPage() {
  const [sliders, setSliders] = useState(INITIAL_SLIDERS);
  const [water, setWater] = useState<WaterLevel>('moderate');
  const [applied, setApplied] = useState(false);

  const rainfall = sliders.find(s => s.key === 'rainfall')!.value;
  const price = sliders.find(s => s.key === 'price')!.value;
  const temp = sliders.find(s => s.key === 'temp')!.value;

  const baseline = useMemo(() => computeScenarioRanking(0, 0, 0).filter(r => r.action !== 'do_not_plant'), []);
  const scenario = useMemo(() => computeScenarioRanking(rainfall, price, temp).filter(r => r.action !== 'do_not_plant'), [rainfall, price, temp]);

  const setSlider = (key: string, value: number) => setSliders(s => s.map(sl => sl.key === key ? { ...sl, value } : sl));
  const reset = () => { setSliders(INITIAL_SLIDERS); setWater('moderate'); setApplied(false); };

  const baselineProfit = baseline.slice(0, 4).reduce((s, r) => s + r.expectedProfit, 0);
  const scenarioProfit = scenario.slice(0, 4).reduce((s, r) => s + r.expectedProfit, 0);
  const profitChange = ((scenarioProfit - baselineProfit) / baselineProfit * 100).toFixed(1);

  const explanations = [];
  if (rainfall < -10) explanations.push('Reduced rainfall increases modeled water stress for high-water-demand crops.');
  if (rainfall > 10) explanations.push('Increased rainfall reduces irrigation need and improves suitability for cereals.');
  if (price < -10) explanations.push('Market price decline reduces revenue projections. Low-cost crops become more competitive.');
  if (price > 10) explanations.push('Higher market prices improve revenue projections across all crops.');
  if (temp > 2) explanations.push('Temperature increase may reduce crop compatibility scores for heat-sensitive crops.');
  if (temp < -2) explanations.push('Temperature drop may benefit rabi crops but risk frost damage in extreme cases.');
  if (water === 'low') explanations.push('Low water availability significantly favors low-water-demand crops like Mustard and Chickpea.');
  if (water === 'high') explanations.push('High water availability opens options for moderate-to-high water demand crops.');

  return (
    <div className="space-y-6">
      <PageHeader
        title="What-If Simulator"
        subtitle="Model the impact of rainfall, price, water and temperature changes on crop decisions"
        badge={<DemoBadge />}
      />
      <InfoNote variant="info">
        The simulator uses deterministic adjustments to the baseline ranking. All outputs are illustrative demo values. Results are not predictions of actual farm outcomes.
      </InfoNote>

      {/* Controls */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Sliders className="w-5 h-5 text-[#2D6A4F]" />
          <h3 className="font-semibold text-[#1A1A2E]">Scenario Controls</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {sliders.map((sl) => (
            <div key={sl.key}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[#1A1A2E]">{sl.label}</label>
                <span className={cn('text-sm font-bold', sl.value > 0 ? 'text-emerald-600' : sl.value < 0 ? 'text-red-500' : 'text-[#6B7280]')}>
                  {sl.value > 0 ? '+' : ''}{sl.value}{sl.unit}
                </span>
              </div>
              <input
                type="range"
                min={sl.min}
                max={sl.max}
                step={sl.step}
                value={sl.value}
                onChange={(e) => setSlider(sl.key, Number(e.target.value))}
                className="w-full accent-[#2D6A4F]"
              />
              <div className="flex justify-between text-xs text-[#6B7280] mt-1">
                <span>{sl.min}{sl.unit}</span>
                <span>Baseline</span>
                <span>+{sl.max}{sl.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Water toggle */}
        <div className="mb-5">
          <label className="text-sm font-medium text-[#1A1A2E] mb-2 block">Water Availability</label>
          <div className="flex gap-2">
            {(['low', 'moderate', 'high'] as WaterLevel[]).map(w => (
              <button key={w} onClick={() => setWater(w)}
                className={cn('flex-1 py-2 rounded-xl text-sm font-semibold capitalize border transition-all',
                  water === w ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]' : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:border-[#52B788]'
                )}>
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setApplied(true)} className="btn-primary">Apply Scenario</button>
          <button onClick={reset} className="btn-secondary flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Explanations */}
      {explanations.length > 0 && (
        <div className="card bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-[#1A1A2E] mb-2">Scenario Impact Analysis</h3>
          <div className="space-y-2">
            {explanations.map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {e}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Baseline vs Scenario */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Baseline Ranking</SectionLabel>
            <span className="text-xs text-[#6B7280]">Rainfall: 0%, Price: 0%</span>
          </div>
          <div className="space-y-3">
            {baseline.slice(0, 4).map((r, i) => (
              <div key={r.cropId} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#E8F5EE] flex items-center justify-center text-xs font-bold text-[#2D6A4F] shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm font-medium text-[#1A1A2E]">{r.cropName}</span>
                <span className="text-sm font-bold text-[#2D6A4F]">{r.suitabilityScore}%</span>
                <span className="text-xs text-[#6B7280]">{formatCurrency(r.expectedProfit)}/ac</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5E0D8] flex justify-between text-sm font-bold">
            <span>Portfolio Profit (top 4)</span>
            <span className="text-[#2D6A4F]">{formatCurrency(baselineProfit)}</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Scenario Ranking</SectionLabel>
            <span className={cn('text-xs font-bold flex items-center gap-1', Number(profitChange) >= 0 ? 'text-emerald-600' : 'text-red-500')}>
              {Number(profitChange) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {profitChange}% vs baseline
            </span>
          </div>
          <div className="space-y-3">
            {scenario.slice(0, 4).map((r, i) => {
              const baseRank = baseline.findIndex(b => b.cropId === r.cropId) + 1;
              const rankChange = baseRank - (i + 1);
              return (
                <div key={r.cropId} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">{i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-[#1A1A2E]">{r.cropName}</span>
                  <span className="text-sm font-bold text-amber-700">{r.suitabilityScore}%</span>
                  {rankChange !== 0 && (
                    <span className={cn('text-[10px] font-bold', rankChange > 0 ? 'text-emerald-600' : 'text-red-500')}>
                      {rankChange > 0 ? `↑${rankChange}` : `↓${Math.abs(rankChange)}`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-[#E5E0D8] flex justify-between text-sm font-bold">
            <span>Portfolio Profit (top 4)</span>
            <span className={Number(profitChange) >= 0 ? 'text-emerald-600' : 'text-red-500'}>{formatCurrency(scenarioProfit)}</span>
          </div>
        </div>
      </div>

      {/* Chart comparison */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Suitability Score Comparison</SectionLabel>
          <DemoBadge />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={baseline.slice(0, 5).map((b, i) => ({
            crop: b.cropName,
            baseline: b.suitabilityScore,
            scenario: scenario.find(s => s.cropId === b.cropId)?.suitabilityScore ?? b.suitabilityScore,
          }))}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
            <XAxis dataKey="crop" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E0D8', fontSize: 12 }} formatter={(v) => [`${v}%`, '']} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="baseline" name="Baseline" fill="#52B788" radius={[4, 4, 0, 0]} />
            <Bar dataKey="scenario" name="Scenario" fill="#D4A017" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
