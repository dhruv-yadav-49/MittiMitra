import { useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { PieChartIcon, RefreshCw, Info, CheckCircle2 } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import {
  PageHeader, DemoBadge, RiskBadge, ConfidenceScore, ScoreBar, InfoNote, SectionLabel
} from '../../components/shared';
import { formatCurrency, formatFullCurrency, cn } from '../../lib/utils';
import { DEMO_PORTFOLIO } from '../../data/recommendations';

const SINGLE_CROP = {
  name: 'Single Crop (Wheat only)',
  profit: 301000,
  risk: 'medium' as const,
  water: 450,
  diversification: 0,
  color: '#E76F51',
};

export default function PortfolioPage() {
  const { portfolio } = useFarm();
  const p = portfolio ?? DEMO_PORTFOLIO;
  const [allocations, setAllocations] = useState(p.allocations.map(a => ({ ...a })));
  const [showExplanation, setShowExplanation] = useState(false);

  const totalAcres = allocations.reduce((s, a) => s + a.acres, 0);
  const totalProfit = allocations.reduce((s, a) => s + (a.expectedProfit * a.acres / (p.totalLand * a.percentage / 100)), 0);

  const updateAcres = (cropId: string, delta: number) => {
    setAllocations(prev => {
      const updated = prev.map(a => a.cropId === cropId ? { ...a, acres: Math.max(0.5, Math.round((a.acres + delta) * 2) / 2) } : a);
      return updated;
    });
  };

  const recalculate = () => setAllocations(p.allocations.map(a => ({ ...a })));

  const pieData = allocations.map(a => ({ name: a.cropName, value: a.acres, color: a.color }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Farm Portfolio Optimizer"
        subtitle="Optimized multi-crop land allocation to balance profit, water and risk"
        badge={<DemoBadge />}
        actions={
          <button onClick={recalculate} className="btn-secondary text-sm flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Recalculate
          </button>
        }
      />
      <InfoNote variant="warning">
        This is an illustrative demo optimization. Expected profit values are model simulations — not guaranteed financial outcomes. Actual results depend on field conditions, weather, market and input management.
      </InfoNote>

      {/* Portfolio Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-sm text-center">
          <div className="text-2xl font-bold text-[#2D6A4F]">{formatCurrency(p.expectedTotalProfit)}</div>
          <div className="text-xs text-[#6B7280] mt-0.5">Expected Total Profit</div>
          <div className="text-[10px] text-amber-600">(demo projection)</div>
        </div>
        <div className="card-sm text-center">
          <div className="flex items-center justify-center gap-1">
            <RiskBadge risk={p.portfolioRisk} />
          </div>
          <div className="text-xs text-[#6B7280] mt-2">Portfolio Risk</div>
        </div>
        <div className="card-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{p.waterStressScore}</div>
          <div className="text-xs text-[#6B7280] mt-0.5">Water Stress Score</div>
          <div className="text-[10px] text-[#6B7280]">0–100 (lower = better)</div>
        </div>
        <div className="card-sm text-center">
          <ConfidenceScore score={p.confidenceScore} />
          <div className="text-xs text-[#6B7280] mt-1">AI Confidence</div>
          <div className="text-[10px] text-amber-600">(demo simulation)</div>
        </div>
      </div>

      {/* Main Portfolio View */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>Land Allocation</SectionLabel>
            <DemoBadge />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={3}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} acres`, '']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Controls */}
        <div className="card">
          <SectionLabel>Adjust Allocation</SectionLabel>
          <div className="space-y-4">
            {allocations.map((a) => (
              <div key={a.cropId}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: a.color }} />
                    <span className="text-sm font-semibold text-[#1A1A2E]">{a.cropName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateAcres(a.cropId, -0.5)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-bold flex items-center justify-center">−</button>
                    <span className="text-sm font-bold w-16 text-center">{a.acres} acres</span>
                    <button onClick={() => updateAcres(a.cropId, 0.5)} className="w-6 h-6 rounded-full bg-[#E8F5EE] hover:bg-[#D1FAE5] text-[#2D6A4F] text-sm font-bold flex items-center justify-center">+</button>
                  </div>
                </div>
                <ScoreBar value={a.acres} max={totalAcres} color={a.color} height={8} />
                <div className="text-xs text-[#6B7280] mt-0.5">{Math.round((a.acres / totalAcres) * 100)}% · {formatCurrency(a.expectedProfit / (p.totalLand * a.percentage / 100) * a.acres)} profit</div>
              </div>
            ))}
            <div className="pt-3 border-t border-[#E5E0D8] flex justify-between text-sm font-bold">
              <span>Total</span>
              <span className={totalAcres !== p.totalLand ? 'text-red-500' : 'text-emerald-600'}>{totalAcres} / {p.totalLand} acres</span>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio vs Single Crop Comparison */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Portfolio vs. Single Crop Strategy</SectionLabel>
          <DemoBadge />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { strategy: 'Single Crop\n(Wheat)', profit: SINGLE_CROP.profit, water: SINGLE_CROP.water, risk: 60, color: '#E76F51' },
                { strategy: 'AI Portfolio', profit: p.expectedTotalProfit, water: 380, risk: 35, color: '#2D6A4F' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
                <XAxis dataKey="strategy" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
                <Tooltip formatter={(v) => [formatFullCurrency(Number(v)), 'Exp. Profit']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                  <Cell fill="#E76F51" />
                  <Cell fill="#2D6A4F" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Expected Profit', single: formatCurrency(SINGLE_CROP.profit), portfolio: formatCurrency(p.expectedTotalProfit), better: 'portfolio' },
              { label: 'Risk Level', single: 'Concentrated', portfolio: 'Diversified', better: 'portfolio' },
              { label: 'Diversification', single: 'None', portfolio: `${p.diversificationScore}% score`, better: 'portfolio' },
              { label: 'Water Stress', single: 'Medium (wheat only)', portfolio: 'Lower (mixed crops)', better: 'portfolio' },
            ].map(({ label, single, portfolio, better }) => (
              <div key={label} className="grid grid-cols-3 gap-2 text-xs">
                <div className="font-medium text-[#6B7280]">{label}</div>
                <div className={cn('text-center px-2 py-1 rounded-lg', better === 'single' ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-red-50 text-red-600')}>{single}</div>
                <div className={cn('text-center px-2 py-1 rounded-lg', better === 'portfolio' ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-red-50 text-red-600')}>{portfolio}</div>
              </div>
            ))}
            <div className="text-[10px] text-[#6B7280] pt-2 border-t border-[#E5E0D8]">
              Column comparison: Single Crop vs AI Portfolio (demo simulation)
            </div>
          </div>
        </div>
      </div>

      {/* Why This Allocation */}
      <div className="card border-l-4 border-l-[#2D6A4F]">
        <button className="w-full flex items-center justify-between" onClick={() => setShowExplanation(!showExplanation)}>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[#2D6A4F]" />
            <span className="font-semibold text-[#1A1A2E]">Why This Allocation?</span>
          </div>
          <span className="text-xs text-[#2D6A4F]">{showExplanation ? 'Hide' : 'Show'}</span>
        </button>
        {showExplanation && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-[#4B5563]">{p.explanation}</p>
            <div className="space-y-2 mt-3">
              {[
                { icon: CheckCircle2, text: 'Wheat (40%) — High suitability, reliable MSP price floor, moderate water use' },
                { icon: CheckCircle2, text: 'Mustard (30%) — Low water requirement, favorable market trend, good profit margin' },
                { icon: CheckCircle2, text: 'Chickpea (20%) — Low water, nitrogen fixing for soil health, market diversification' },
                { icon: CheckCircle2, text: 'Vegetables (10%) — High value but limited to 1 acre to manage price volatility risk' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-[#4B5563]">
                  <Icon className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" /> {text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
