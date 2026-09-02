import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { CalendarDays, Leaf, TrendingUp, Droplets } from 'lucide-react';
import { PageHeader, DemoBadge, RiskBadge, InfoNote, SectionLabel } from '../../components/shared';
import { formatCurrency, cn } from '../../lib/utils';
import { DEMO_SEASON_PLANS } from '../../data/scenarios';

const SEASON_COLORS = ['#2D6A4F', '#52B788', '#D4A017'];

export default function SeasonPlannerPage() {
  const [activeTab, setActiveTab] = useState(0);
  const plan = DEMO_SEASON_PLANS[activeTab];

  const timelineData = DEMO_SEASON_PLANS.map((s, i) => ({
    season: `S${i + 1}`,
    profit: s.totalExpectedProfit,
    label: s.seasonName,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="3-Season Farm Planner"
        subtitle="Multi-season crop rotation plan with profit and soil impact projections"
        badge={<DemoBadge />}
      />
      <InfoNote variant="warning">
        Future season projections are model simulations with high uncertainty. Treat Season 2 and Season 3 values as indicative directions only — not financial projections.
      </InfoNote>

      {/* Timeline visual */}
      <div className="card">
        <SectionLabel>Profit Outlook — 3 Seasons</SectionLabel>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
            <XAxis dataKey="season" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E0D8', fontSize: 12 }}
              formatter={(v) => [formatCurrency(Number(v)), 'Projected Profit']} />
            <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
              {timelineData.map((_, i) => (
                <Bar key={i} dataKey="profit" fill={SEASON_COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-3 mt-3 flex-wrap">
          {DEMO_SEASON_PLANS.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <div className="w-3 h-3 rounded-sm" style={{ background: SEASON_COLORS[i] }} />
              {s.seasonName}
            </div>
          ))}
        </div>
      </div>

      {/* Season Tabs */}
      <div className="flex gap-2">
        {DEMO_SEASON_PLANS.map((s, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={cn('flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all',
              activeTab === i ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]' : 'bg-white text-[#6B7280] border-[#E5E0D8] hover:border-[#52B788]'
            )}>
            {s.season}
          </button>
        ))}
      </div>

      {/* Season Detail */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#2D6A4F]" />
              <h2 className="font-bold text-[#1A1A2E] text-lg">{plan.seasonName}</h2>
              {activeTab > 0 && <DemoBadge label="Projected" />}
            </div>
            <p className="text-sm text-[#6B7280] mt-0.5">{plan.notes}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#2D6A4F]">{formatCurrency(plan.totalExpectedProfit)}</div>
            <div className="text-xs text-[#6B7280]">Total projected profit</div>
          </div>
        </div>

        {/* Crop rows */}
        <div className="space-y-3 mb-4">
          {plan.crops.map((crop) => (
            <div key={crop.cropId} className="p-4 bg-[#F8F5F0] rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-[#1A1A2E]">{crop.cropName}</div>
                  <div className="text-xs text-[#6B7280]">{crop.acres} acres · {crop.waterRequirement} water</div>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge risk={crop.risk} />
                  <span className={cn('tag text-[10px]',
                    crop.soilImpact === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                    crop.soilImpact === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {crop.soilImpact === 'positive' ? '↑ Soil' : crop.soilImpact === 'negative' ? '↓ Soil' : '= Soil'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Yield', value: `${crop.expectedYield} q` },
                  { label: 'Profit', value: formatCurrency(crop.expectedProfit) },
                  { label: 'Water', value: crop.waterRequirement.charAt(0).toUpperCase() + crop.waterRequirement.slice(1) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white rounded-lg p-2 text-center">
                    <div className="text-[10px] text-[#6B7280]">{label}</div>
                    <div className="text-xs font-bold text-[#1A1A2E]">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rotation benefit */}
        <div className="p-3 bg-[#E8F5EE] rounded-xl flex items-start gap-2">
          <Leaf className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-[#2D6A4F]">Crop Rotation Benefit</div>
            <div className="text-xs text-[#4B5563] mt-0.5">{plan.cropRotationBenefit}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 p-3 bg-[#F8F5F0] rounded-xl">
          <span className="text-sm text-[#6B7280]">Soil Health Outlook:</span>
          <span className={cn('font-semibold text-sm',
            plan.soilHealth === 'improving' ? 'text-emerald-600' :
            plan.soilHealth === 'declining' ? 'text-red-500' : 'text-amber-600'
          )}>
            {plan.soilHealth.charAt(0).toUpperCase() + plan.soilHealth.slice(1)}
          </span>
        </div>
      </div>

      {/* Comparison: Profit-focused vs Risk-balanced */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card border-l-4 border-l-[#D4A017]">
          <h3 className="font-semibold text-[#1A1A2E] mb-3">Profit-Focused Plan</h3>
          <p className="text-sm text-[#4B5563] mb-3">Maximize expected revenue by concentrating on highest-profit crops per acre, accepting higher concentration risk.</p>
          <div className="text-2xl font-bold text-[#D4A017]">{formatCurrency(420000)}</div>
          <div className="text-xs text-[#6B7280]">3-season projection (demo)</div>
          <RiskBadge risk="high" className="mt-2" />
        </div>
        <div className="card border-l-4 border-l-[#2D6A4F] ring-2 ring-[#52B788]">
          <h3 className="font-semibold text-[#1A1A2E] mb-3">AI Risk-Balanced Plan ✓</h3>
          <p className="text-sm text-[#4B5563] mb-3">Balance profitability, water use, soil health and crop diversification across 3 seasons.</p>
          <div className="text-2xl font-bold text-[#2D6A4F]">{formatCurrency(DEMO_SEASON_PLANS.reduce((s, p) => s + p.totalExpectedProfit, 0))}</div>
          <div className="text-xs text-[#6B7280]">3-season projection (demo)</div>
          <RiskBadge risk="medium" className="mt-2" />
        </div>
      </div>
    </div>
  );
}
