// ============================================================
// MittiMitra AI — 3-Season Farm Planner Page
// Prompt 5
// ============================================================
//
// All business logic lives in src/lib/seasonPlanner.ts
// This component only renders data — no calculations here.
// ============================================================

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, Area, AreaChart,
} from 'recharts';
import {
  CalendarDays, Leaf, TrendingUp, Droplets, Shield, Info,
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Zap, BarChart2
} from 'lucide-react';
import {
  PageHeader, DemoBadge, RiskBadge, InfoNote, SectionLabel
} from '../../components/shared';
import { formatCurrency, cn } from '../../lib/utils';
import { THREE_SEASON_PLAN_A, THREE_SEASON_PLAN_B, SEASON_PLAN_COMPARISON } from '../../data/planner';
import type { EngineSeasonPlan, ThreeSeasonPlan } from '../../types/planner';

// ── Season node colors ──────────────────────────────────────
const SEASON_COLORS = ['#2D6A4F', '#D4A017', '#8B5CF6'];

// ── Plan toggle ─────────────────────────────────────────────
type ActivePlan = 'A' | 'B' | 'compare';

// ── Small allocation bar ─────────────────────────────────────
function MiniAllocBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex-1 h-2 bg-[#F0EDE8] rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ── Season Detail Card ───────────────────────────────────────
function SeasonDetailPanel({
  plan,
  seasonIndex,
  planLabel,
}: {
  plan: ThreeSeasonPlan;
  seasonIndex: number;
  planLabel: string;
}) {
  const s: EngineSeasonPlan = plan.seasons[seasonIndex - 1];
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);

  const soilColor = s.soilImpact.trend === 'improving' ? 'text-emerald-600' : s.soilImpact.trend === 'declining' ? 'text-red-500' : 'text-amber-600';
  const soilIcon = s.soilImpact.trend === 'improving' ? '↑' : s.soilImpact.trend === 'declining' ? '↓' : '=';

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Est. Profit', value: formatCurrency(s.totalExpectedProfit), sub: 'simulated projection', color: 'text-[#2D6A4F]' },
          { label: 'Portfolio Risk', value: <RiskBadge risk={s.portfolioRisk} />, sub: `Score: ${s.waterStress}/100`, color: '' },
          { label: 'Water Stress', value: `${s.waterStress}/100`, sub: `${s.totalWaterMM}mm weighted`, color: 'text-blue-600' },
          { label: 'Diversification', value: `${s.diversificationScore}/100`, sub: `Rotation: ${s.rotationScore}/100`, color: 'text-purple-600' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card-sm text-center">
            <div className={cn('text-xl font-bold', color)}>{value}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">{label}</div>
            <div className="text-[10px] text-[#9CA3AF]">{sub}</div>
          </div>
        ))}
      </div>

      {/* Crop allocations */}
      <div className="card">
        <SectionLabel>Crop Allocation — {planLabel} Season {seasonIndex}</SectionLabel>
        <div className="space-y-3 mt-2">
          {s.crops.map(c => (
            <div key={c.cropId}>
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-[#F8F5F0] rounded-lg p-1.5 -ml-1.5 transition-colors"
                onClick={() => setExpandedCrop(expandedCrop === c.cropId ? null : c.cropId)}
              >
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="text-sm font-semibold text-[#1A1A2E] flex-1">{c.cropName}</span>
                <span className="text-xs text-[#6B7280]">{c.acres}ac</span>
                <span className="text-xs font-bold text-[#2D6A4F] w-8">{c.percentage}%</span>
                <MiniAllocBar pct={c.percentage} color={c.color} />
                <span className="text-xs text-[#6B7280]">{formatCurrency(c.expectedProfit)}</span>
                {expandedCrop === c.cropId ? <ChevronUp className="w-3.5 h-3.5 text-[#6B7280]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />}
              </div>

              {expandedCrop === c.cropId && (
                <div className="ml-6 mt-2 mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Est. Yield', value: `${c.totalYield} q total` },
                    { label: 'Est. Revenue', value: formatCurrency(c.totalRevenue) },
                    { label: 'Est. Cost', value: formatCurrency(c.estimatedCost) },
                    { label: 'Water Req', value: `${c.waterRequirementMM}mm` },
                    { label: 'Risk', value: `${c.riskScore}/100` },
                    { label: 'Soil Impact', value: c.soilImpact, color: c.soilImpact === 'positive' ? 'text-emerald-600' : c.soilImpact === 'negative' ? 'text-red-500' : 'text-amber-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[#F8F5F0] rounded-lg p-2">
                      <div className="text-[10px] text-[#6B7280]">{label}</div>
                      <div className={cn('text-xs font-bold text-[#1A1A2E] capitalize', color ?? '')}>{value}</div>
                    </div>
                  ))}
                  {c.reasons.length > 0 && (
                    <div className="col-span-2 sm:col-span-4 text-xs text-[#4B5563] mt-1">
                      {c.reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-0.5">
                          <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5 text-emerald-500" /> {r}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="col-span-2 sm:col-span-4 text-xs text-[#6B7280] italic border-t border-[#E5E0D8] pt-1 mt-1">
                    Rotation: {c.rotationBenefit}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Soil Impact */}
      <div className="card bg-[#F8F5F0]">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-4 h-4 text-[#2D6A4F]" />
          <span className="text-sm font-semibold text-[#1A1A2E]">Simulated Soil Impact</span>
          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Model Output</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
          {[
            { label: 'N Δ', value: `${s.soilImpact.nitrogenDelta > 0 ? '+' : ''}${s.soilImpact.nitrogenDelta} kg/ha` },
            { label: 'P Δ', value: `${s.soilImpact.phosphorusDelta > 0 ? '+' : ''}${s.soilImpact.phosphorusDelta}` },
            { label: 'K Δ', value: `${s.soilImpact.potassiumDelta > 0 ? '+' : ''}${s.soilImpact.potassiumDelta}` },
            { label: 'OC Δ', value: `${s.soilImpact.organicCarbonDelta > 0 ? '+' : ''}${s.soilImpact.organicCarbonDelta}%` },
            { label: 'Soil Score', value: `${s.soilImpact.overallSoilScore}/100` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-lg p-2 text-center">
              <div className="text-[10px] text-[#6B7280]">{label}</div>
              <div className="text-xs font-bold text-[#1A1A2E]">{value}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#6B7280]">Trend:</span>
          <span className={cn('font-bold capitalize', soilColor)}>{soilIcon} {s.soilImpact.trend}</span>
        </div>
        <p className="text-xs text-[#6B7280] mt-2 italic">{s.soilImpact.explanation}</p>
      </div>

      {/* Explanations */}
      <div className="card border-l-4 border-l-[#2D6A4F]">
        <button className="w-full flex items-center justify-between" onClick={() => setShowExplanations(e => !e)}>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2D6A4F]" />
            <span className="text-sm font-semibold text-[#1A1A2E]">Why These Crops?</span>
          </div>
          {showExplanations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showExplanations && (
          <div className="mt-3 space-y-2">
            {[...s.explanations, ...s.warnings].map((e, i) => (
              <div key={i} className={cn('flex items-start gap-2 text-xs',
                s.warnings.includes(e) ? 'text-amber-600' : 'text-[#4B5563]'
              )}>
                {s.warnings.includes(e)
                  ? <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  : <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
                }
                {e}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────

export default function SeasonPlannerPage() {
  const [activePlan, setActivePlan] = useState<ActivePlan>('compare');
  const [activeSeason, setActiveSeason] = useState(1);

  const planA = THREE_SEASON_PLAN_A;
  const planB = THREE_SEASON_PLAN_B;
  const comparison = SEASON_PLAN_COMPARISON;

  const displayPlan = activePlan === 'A' ? planA : activePlan === 'B' ? planB : planA;

  // Chart data
  const profitChartData = [1, 2, 3].map(i => ({
    season: `S${i}`,
    planA: planA.seasons[i - 1].totalExpectedProfit,
    planB: planB.seasons[i - 1].totalExpectedProfit,
  }));

  const riskChartData = [1, 2, 3].map(i => ({
    season: `S${i}`,
    riskA: planA.seasons[i - 1].waterStress,
    riskB: planB.seasons[i - 1].waterStress,
  }));

  const waterChartData = [1, 2, 3].map(i => ({
    season: `S${i}`,
    waterA: planA.seasons[i - 1].totalWaterMM,
    waterB: planB.seasons[i - 1].totalWaterMM,
  }));

  const soilChartData = [1, 2, 3].map(i => ({
    season: `S${i}`,
    soilA: planA.seasons[i - 1].soilImpact.overallSoilScore,
    soilB: planB.seasons[i - 1].soilImpact.overallSoilScore,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan My Farm — 3 Seasons"
        subtitle="Simulate how crop choices, risk, water demand and rotation may affect your farm over time"
        badge={<DemoBadge label="Simulated Projection" />}
      />
      <InfoNote variant="warning">
        <strong>3-Season Planner — Simulated / Model Output.</strong> All future season values are AI engine projections using demo data. They are NOT guaranteed outcomes. Season 2 and 3 carry high uncertainty. Consult your local KVK or agronomist before any financial decisions.
      </InfoNote>

      {/* ── PLAN TOGGLE ────────────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-3">
        {([
          { id: 'A' as ActivePlan, label: 'Plan A: Profit-Focused', icon: TrendingUp, desc: 'Profit 60% · Risk 15% · Water 15% · Div 10%', color: '#2D6A4F' },
          { id: 'B' as ActivePlan, label: 'Plan B: Risk-Balanced', icon: Shield, desc: 'Profit 30% · Risk 30% · Water 20% · Div 20%', color: '#8B5CF6' },
          { id: 'compare' as ActivePlan, label: 'Compare Plans', icon: BarChart2, desc: 'Side-by-side comparison of both plans', color: '#D4A017' },
        ]).map(({ id, label, icon: Icon, desc, color }) => (
          <button
            key={id}
            onClick={() => setActivePlan(id)}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              activePlan === id ? 'ring-2 ring-offset-1' : 'border-[#E5E0D8] hover:border-[#52B788]'
            )}
            style={activePlan === id ? { borderColor: color, '--tw-ring-color': color, backgroundColor: `${color}10` } as React.CSSProperties : {}}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="font-bold text-sm text-[#1A1A2E]">{label}</span>
            </div>
            <div className="text-[10px] text-[#6B7280]">{desc}</div>
          </button>
        ))}
      </div>

      {/* ── TIMELINE NODES ─────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-[#2D6A4F]" />
          <span className="font-semibold text-[#1A1A2E]">3-Season Timeline</span>
          <span className="text-xs text-[#6B7280] ml-auto">Click a season to explore</span>
        </div>
        <div className="flex items-start gap-2">
          {displayPlan.seasons.map((s, i) => {
            const isActive = activeSeason === i + 1;
            const color = SEASON_COLORS[i];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                {/* Node */}
                <button
                  onClick={() => setActiveSeason(i + 1)}
                  className={cn(
                    'w-full p-3 rounded-xl border-2 text-center transition-all',
                    isActive ? 'border-current' : 'border-[#E5E0D8] hover:border-[#52B788]'
                  )}
                  style={isActive ? { borderColor: color, backgroundColor: `${color}15` } : {}}
                >
                  <div className="text-lg font-bold" style={{ color }}>{i + 1}</div>
                  <div className="text-xs font-semibold text-[#1A1A2E] leading-tight">{s.seasonType.toUpperCase()}</div>
                  <div className="text-[10px] text-[#6B7280] leading-tight mt-0.5">{s.seasonLabel.split(' (')[0]}</div>
                  <div className="mt-2 text-xs font-bold" style={{ color }}>{formatCurrency(s.totalExpectedProfit)}</div>
                  <div className="text-[10px] text-[#6B7280]">est. profit</div>
                  <div className="mt-1.5">
                    <RiskBadge risk={s.portfolioRisk} className="text-[9px] py-0 px-1.5 mx-auto" />
                  </div>
                </button>
                {/* Connector arrow (not last) */}
                {i < 2 && (
                  <div className="hidden sm:flex items-center justify-center w-full text-[#C4B5A0] text-lg font-bold absolute" style={{ left: '100%', top: '40%' }}>
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Flow labels */}
        <div className="hidden sm:flex justify-between text-[10px] text-[#6B7280] mt-2 px-1">
          <span>Start from current farm state →</span>
          <span>← Season 1 rotation + soil impact →</span>
          <span>← Season 2 rotation + soil impact</span>
        </div>
      </div>

      {/* ── SEASON DETAIL ──────────────────────────────────── */}
      {activePlan !== 'compare' && (
        <div>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map(i => (
              <button
                key={i}
                onClick={() => setActiveSeason(i)}
                className={cn('flex-1 py-2 rounded-xl text-sm font-semibold border transition-all',
                  activeSeason === i ? 'text-white border-transparent' : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:border-[#52B788]'
                )}
                style={activeSeason === i ? { background: SEASON_COLORS[i - 1] } : {}}
              >
                Season {i}
              </button>
            ))}
          </div>
          <SeasonDetailPanel
            plan={displayPlan}
            seasonIndex={activeSeason}
            planLabel={activePlan === 'A' ? 'Plan A' : 'Plan B'}
          />
        </div>
      )}

      {/* ── COMPARISON VIEW ────────────────────────────────── */}
      {activePlan === 'compare' && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[planA, planB].map((plan, pi) => {
              const color = pi === 0 ? '#2D6A4F' : '#8B5CF6';
              return (
                <div key={pi} className="card border-2" style={{ borderColor: color }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <span className="font-bold text-[#1A1A2E]">{plan.planName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '3-Season Profit', value: formatCurrency(plan.totalProjectedProfit), sub: 'simulated' },
                      { label: 'Avg Risk', value: `${plan.avgRiskScore}/100`, sub: 'lower = better' },
                      { label: 'Avg Water Stress', value: `${plan.avgWaterStress}%`, sub: '' },
                      { label: 'Avg Diversification', value: `${plan.avgDiversification}/100`, sub: '' },
                    ].map(({ label, value, sub }) => (
                      <div key={label} className="bg-[#F8F5F0] rounded-lg p-2">
                        <div className="text-[10px] text-[#6B7280]">{label}</div>
                        <div className="text-sm font-bold" style={{ color }}>{value}</div>
                        {sub && <div className="text-[10px] text-[#9CA3AF]">{sub}</div>}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#6B7280] mt-3 italic">{plan.planDescription}</p>
                </div>
              );
            })}
          </div>

          {/* Trade-off summary */}
          <div className="card bg-[#E8F5EE] border-[#52B788]">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-[#2D6A4F] mb-1">Trade-Off Summary</div>
                <p className="text-xs text-[#4B5563]">{comparison.tradeoffSummary}</p>
              </div>
            </div>
          </div>

          {/* Metrics table */}
          <div className="card">
            <SectionLabel>Detailed Plan Comparison</SectionLabel>
            <div className="overflow-x-auto">
              <table className="w-full text-xs mt-2">
                <thead>
                  <tr className="border-b border-[#E5E0D8]">
                    {['Metric', 'Plan A', 'Plan B', 'Better', 'Trade-Off'].map(h => (
                      <th key={h} className="text-left py-2 px-2 font-semibold text-[#6B7280] uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.metrics.map((m, i) => (
                    <tr key={i} className="border-b border-[#F0EDE8] hover:bg-[#F8F5F0]">
                      <td className="py-2 px-2 font-medium text-[#1A1A2E]">{m.metric}</td>
                      <td className={cn('py-2 px-2 font-bold', m.better === 'A' ? 'text-emerald-600' : 'text-[#6B7280]')}>
                        {typeof m.planA === 'number' && m.metric.includes('Profit')
                          ? formatCurrency(m.planA as number)
                          : `${m.planA}${m.unit && !String(m.planA).includes(m.unit) ? m.unit : ''}`}
                      </td>
                      <td className={cn('py-2 px-2 font-bold', m.better === 'B' ? 'text-purple-600' : 'text-[#6B7280]')}>
                        {typeof m.planB === 'number' && m.metric.includes('Profit')
                          ? formatCurrency(m.planB as number)
                          : `${m.planB}${m.unit && !String(m.planB).includes(m.unit) ? m.unit : ''}`}
                      </td>
                      <td className="py-2 px-2">
                        <span className={cn('font-bold px-1.5 py-0.5 rounded text-[10px]',
                          m.better === 'A' ? 'bg-emerald-100 text-emerald-700' :
                          m.better === 'B' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-600'
                        )}>
                          {m.better === 'equal' ? '=' : `Plan ${m.better}`}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-[#6B7280] max-w-xs">{m.tradeoffNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Season-by-season breakdown table */}
          <div className="card">
            <SectionLabel>Season-by-Season Profit Breakdown</SectionLabel>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E5E0D8]">
                    {['Season', 'Plan A Profit', 'Plan B Profit', 'Δ', 'Plan A Risk', 'Plan B Risk'].map(h => (
                      <th key={h} className="text-left py-2 px-2 font-semibold text-[#6B7280] uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2].map(i => {
                    const sA = planA.seasons[i];
                    const sB = planB.seasons[i];
                    const delta = sA.totalExpectedProfit - sB.totalExpectedProfit;
                    return (
                      <tr key={i} className="border-b border-[#F0EDE8] hover:bg-[#F8F5F0]">
                        <td className="py-2 px-2 font-semibold" style={{ color: SEASON_COLORS[i] }}>Season {i + 1}</td>
                        <td className="py-2 px-2 font-bold text-[#2D6A4F]">{formatCurrency(sA.totalExpectedProfit)}</td>
                        <td className="py-2 px-2 font-bold text-purple-700">{formatCurrency(sB.totalExpectedProfit)}</td>
                        <td className={cn('py-2 px-2 font-bold', delta >= 0 ? 'text-[#2D6A4F]' : 'text-purple-600')}>
                          {delta >= 0 ? 'A +' : 'B +'}{formatCurrency(Math.abs(delta))}
                        </td>
                        <td className="py-2 px-2"><RiskBadge risk={sA.portfolioRisk} className="text-[9px]" /></td>
                        <td className="py-2 px-2"><RiskBadge risk={sB.portfolioRisk} className="text-[9px]" /></td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#F8F5F0] font-bold">
                    <td className="py-2 px-2 text-[#1A1A2E]">Total (3 Seasons)</td>
                    <td className="py-2 px-2 text-[#2D6A4F]">{formatCurrency(planA.totalProjectedProfit)}</td>
                    <td className="py-2 px-2 text-purple-700">{formatCurrency(planB.totalProjectedProfit)}</td>
                    <td className={cn('py-2 px-2', planA.totalProjectedProfit >= planB.totalProjectedProfit ? 'text-[#2D6A4F]' : 'text-purple-600')}>
                      {planA.totalProjectedProfit >= planB.totalProjectedProfit ? 'A +' : 'B +'}{formatCurrency(Math.abs(planA.totalProjectedProfit - planB.totalProjectedProfit))}
                    </td>
                    <td colSpan={2} className="py-2 px-2 text-[10px] text-[#6B7280]">Simulated model output only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── CHARTS ─────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Profit chart */}
        <div className="card">
          <SectionLabel>Est. Profit per Season</SectionLabel>
          <DemoBadge />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={profitChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
              <XAxis dataKey="season" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v)), '']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="planA" name="Plan A" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="planB" name="Plan B" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk / Water stress */}
        <div className="card">
          <SectionLabel>Water Stress per Season</SectionLabel>
          <DemoBadge />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={riskChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
              <XAxis dataKey="season" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="riskA" name="Plan A" fill="#52B788" radius={[4, 4, 0, 0]} />
              <Bar dataKey="riskB" name="Plan B" fill="#C084FC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Water requirement */}
        <div className="card">
          <SectionLabel>Water Requirement (mm weighted)</SectionLabel>
          <DemoBadge />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={waterChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
              <XAxis dataKey="season" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}mm`} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="waterA" name="Plan A" stroke="#2D6A4F" fill="#E8F5EE" strokeWidth={2} />
              <Area type="monotone" dataKey="waterB" name="Plan B" stroke="#8B5CF6" fill="#EDE9FE" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Soil health trend */}
        <div className="card">
          <SectionLabel>Simulated Soil Score Trend</SectionLabel>
          <div className="flex items-center gap-1.5 mb-2">
            <DemoBadge />
            <span className="text-[10px] text-[#6B7280]">Model output — requires field validation</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={soilChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
              <XAxis dataKey="season" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="soilA" name="Plan A" stroke="#2D6A4F" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="soilB" name="Plan B" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── WHY THIS PLAN? ─────────────────────────────────── */}
      {activePlan !== 'compare' && (
        <div className="card border-l-4 border-l-[#2D6A4F]">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#1A1A2E] mb-1">
                Why This Plan? — {displayPlan.planName}
              </div>
              <p className="text-sm text-[#4B5563]">{displayPlan.planExplanation}</p>
              <p className="text-xs text-[#9CA3AF] mt-2">
                Weights are configurable demo parameters, not universal agricultural recommendations.
                Simulated / Model Output — AI Decision Engine + Portfolio Optimizer — MVP Simulation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
