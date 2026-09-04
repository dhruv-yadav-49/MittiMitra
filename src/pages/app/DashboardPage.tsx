// ============================================================
// MittiMitra AI — Dashboard (AI Farm Decision Command Center)
// Prompt 6
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, AlertTriangle, CheckCircle2, ArrowRight, Zap,
  TestTube2, CloudSun, Droplets, TrendingUp, CalendarDays,
  ShieldAlert, Activity, ChevronRight
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useFarm } from '../../context/FarmContext';
import { useAuth } from '../../context/AuthContext';
import { KpiCard, DemoBadge, RiskBadge, ScoreBar, InfoNote, SectionLabel } from '../../components/shared';
import { formatCurrency, getScoreColor } from '../../lib/utils';
import { calcSoilHealthScore } from '../../lib/calculations';
import { DEMO_WEATHER, DEMO_WATER } from '../../data/weather';
import { DEMO_MARKET } from '../../data/market';
import { THREE_SEASON_PLAN_A } from '../../data/planner';

// ── Components ──────────────────────────────────────────────

function DecisionFlow() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-4 bg-[#F8F5F0] rounded-xl text-xs font-semibold text-[#6B7280] text-center w-full overflow-x-auto">
      <div className="flex items-center gap-1 shrink-0">
        <span>Soil</span><span className="text-[#C4B5A0]">+</span>
        <span>Weather</span><span className="text-[#C4B5A0]">+</span>
        <span>Water</span><span className="text-[#C4B5A0]">+</span>
        <span>Market</span>
      </div>
      <ArrowRight className="w-4 h-4 shrink-0 text-[#C4B5A0] hidden sm:block" />
      <div className="shrink-0 bg-[#E8F5EE] text-[#2D6A4F] px-2 py-1 rounded">AI Engine</div>
      <ArrowRight className="w-4 h-4 shrink-0 text-[#C4B5A0] hidden sm:block" />
      <div className="shrink-0 bg-blue-50 text-blue-700 px-2 py-1 rounded">Crop Ranking</div>
      <ArrowRight className="w-4 h-4 shrink-0 text-[#C4B5A0] hidden sm:block" />
      <div className="shrink-0 bg-purple-50 text-purple-700 px-2 py-1 rounded">Optimizer</div>
      <ArrowRight className="w-4 h-4 shrink-0 text-[#C4B5A0] hidden sm:block" />
      <div className="shrink-0 bg-[#2D6A4F] text-white px-2 py-1 rounded">Farm Plan</div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────

export default function DashboardPage() {
  const { farm, soil, recommendations, portfolio, analysisRun, setAnalysisRun, loadDemoFarm } = useFarm();
  const { farmer } = useAuth();
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisProgress(0);
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      setAnalysisProgress(Math.round((i / steps) * 100));
      await new Promise(r => setTimeout(r, 150));
    }
    setAnalyzing(false);
    setAnalysisRun(true);
    navigate('/ai-analysis');
  };

  const soilScore = soil ? calcSoilHealthScore(soil) : 0;
  
  // Find "Do Not Plant" or High Risk crops
  const dangerousCrops = recommendations?.filter(r => 
    r.action === 'do_not_plant' || r.riskScore >= 75 || (r.waterStressPct ?? 0) >= 70
  ) || [];

  if (!farm) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Brain className="w-16 h-16 text-[#52B788] mb-4 opacity-60" />
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">No farm selected</h2>
        <div className="flex gap-3">
          <button onClick={loadDemoFarm} className="btn-primary">Load Demo Farm</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ── 1. AI DECISION STATUS & FLOW ───────────────────── */}
      {analysisRun && portfolio ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg flex items-center justify-between text-sm font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            AI analysis complete — portfolio optimized.
          </div>
          <DemoBadge label="Simulation Ready" />
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Run AI Farm Analysis to generate your farm plan.
        </div>
      )}

      <DecisionFlow />

      {/* ── 2. HERO / TOP SECTION ─────────────────────────── */}
      <div className="card bg-gradient-to-br from-[#2D6A4F] to-[#40916C] text-white border-0 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="text-[#B7E4C7] font-semibold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" /> AI Farm Decision Command Center
            </div>
            <h1 className="text-3xl font-bold mb-2">Your Farm Decision</h1>
            <p className="text-[#E8F5EE] max-w-xl opacity-90">
              AI-powered crop, risk and land allocation recommendations for your farm.
              Integrating soil, weather, market, and water data into one actionable plan.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
            <button 
              onClick={runAnalysis} 
              disabled={analyzing}
              className="btn bg-[#D4A017] hover:bg-[#b8860b] text-white font-bold py-3.5 px-6 shadow-xl w-full flex items-center justify-center gap-2 text-lg"
            >
              {analyzing ? `Analyzing... ${analysisProgress}%` : 'Run AI Farm Analysis'}
              {!analyzing && <ArrowRight className="w-5 h-5" />}
            </button>
            {analysisRun && (
              <button onClick={() => navigate('/portfolio')} className="text-center text-sm text-[#B7E4C7] hover:text-white font-semibold flex items-center justify-center gap-1">
                View Full Analysis <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. KEY FARM KPIs ──────────────────────────────── */}
      {analysisRun && portfolio && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Expected Profit"
            value={formatCurrency(portfolio.expectedTotalProfit)}
            subLabel="Simulated projection"
            icon={<TrendingUp className="w-5 h-5" />}
            valueColor="text-emerald-700"
            className="border-t-4 border-t-emerald-500"
          />
          <KpiCard
            label="Risk"
            value={<RiskBadge risk={portfolio.portfolioRisk} className="text-sm py-0.5 px-2" />}
            subLabel="Portfolio risk"
            icon={<ShieldAlert className="w-5 h-5" />}
            className="border-t-4 border-t-amber-500"
          />
          <KpiCard
            label="Water Stress"
            value={`${portfolio.waterStressScore}/100`}
            subLabel="Projected water stress"
            icon={<Droplets className="w-5 h-5" />}
            valueColor={portfolio.waterStressScore > 50 ? 'text-red-500' : 'text-blue-600'}
            className="border-t-4 border-t-blue-500"
          />
          <KpiCard
            label="Data Confidence"
            value={`${portfolio.confidenceScore}%`}
            subLabel="Data completeness"
            icon={<Activity className="w-5 h-5" />}
            valueColor={getScoreColor(portfolio.confidenceScore)}
            className="border-t-4 border-t-purple-500"
          />
        </div>
      )}

      {/* ── 4. FARM DECISION SUMMARY ──────────────────────── */}
      {analysisRun && portfolio && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card shadow-md border-emerald-100">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-[#2D6A4F]" />
                <h2 className="text-lg font-bold text-[#1A1A2E]">Recommended Portfolio</h2>
                <DemoBadge label="Model Output" />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="w-48 h-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolio.allocations}
                        dataKey="percentage"
                        nameKey="cropName"
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={80}
                        paddingAngle={2}
                      >
                        {portfolio.allocations.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: any) => [`${val}%`, 'Allocation']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex-1 w-full space-y-3">
                  {portfolio.allocations.map(a => (
                    <div key={a.cropId} className="flex items-center justify-between p-2 hover:bg-[#F8F5F0] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: a.color }} />
                        <div>
                          <div className="font-bold text-[#1A1A2E]">{a.cropName}</div>
                          <div className="text-xs text-[#6B7280]">{a.acres} acres</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#2D6A4F]">{a.percentage}%</div>
                        <div className="text-xs text-[#6B7280]">{formatCurrency(a.expectedProfit)} profit</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Why this recommendation */}
            <div className="card bg-[#E8F5EE] border-[#52B788]">
              <div className="flex items-start gap-3">
                <div className="bg-[#2D6A4F] p-2 rounded-lg text-white mt-1">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A2E] mb-2">Why this recommendation?</h3>
                  <ul className="space-y-2">
                    {portfolio.explanations?.slice(0, 4).map((expl, i) => (
                      <li key={i} className="text-sm text-[#4B5563] flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#52B788] shrink-0 mt-0.5" />
                        {expl}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* DO NOT PLANT */}
            {dangerousCrops.length > 0 ? (
              <div className="card border-red-200 bg-red-50">
                <div className="flex items-center gap-2 mb-3 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold">DO NOT PLANT WARNING</h3>
                </div>
                <div className="space-y-3">
                  {dangerousCrops.map(c => (
                    <div key={c.cropId} className="bg-white p-3 rounded border border-red-100 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-[#1A1A2E]">{c.cropName}</span>
                        <RiskBadge risk={c.riskLevel} />
                      </div>
                      <p className="text-xs text-red-600 mb-2">
                        {c.warnings[0] || 'High risk or water stress detected.'}
                      </p>
                      <div className="text-[10px] text-[#6B7280] flex gap-3">
                        <span>Risk Score: {c.riskScore}/100</span>
                        <span>Water Stress: {c.waterStressPct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <InfoNote variant="success">No extreme high-risk crops detected in the current candidate list.</InfoNote>
            )}
            
            {/* Judge Demo CTA */}
            <div className="card bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">Test a Different Future</h3>
                  <p className="text-xs text-amber-700 max-w-md">
                    See how your farm plan changes when rainfall, water or market conditions change.
                  </p>
                </div>
                <button onClick={() => navigate('/simulator')} className="btn-accent shrink-0 text-sm py-2">
                  Run What-If Scenario
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Score Chart */}
            <div className="card">
              <SectionLabel>Crop Decision Score</SectionLabel>
              <div className="h-48 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recommendations?.slice(0, 5) || []} layout="vertical" margin={{ left: -20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0EDE8" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="cropName" type="category" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: '#F8F5F0' }} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="overallScore" fill="#52B788" radius={[0, 4, 4, 0]} barSize={16}>
                      {recommendations?.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.overallScore >= 70 ? '#2D6A4F' : entry.overallScore >= 50 ? '#52B788' : '#D4A017'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <SectionLabel>Farm Decision Tools</SectionLabel>
              <div className="space-y-2 mt-3">
                {[
                  { label: 'AI Crop Analysis', to: '/ai-analysis', icon: Brain },
                  { label: 'Crop Portfolio', to: '/portfolio', icon: PieChart },
                  { label: 'What-If Simulator', to: '/simulator', icon: Zap },
                  { label: '3-Season Planner', to: '/season-planner', icon: CalendarDays },
                ].map(tool => (
                  <button key={tool.to} onClick={() => navigate(tool.to)} className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E5E0D8] hover:border-[#52B788] hover:bg-[#F8F5F0] transition-colors group">
                    <div className="flex items-center gap-3 text-sm font-semibold text-[#1A1A2E]">
                      <tool.icon className="w-4 h-4 text-[#6B7280] group-hover:text-[#2D6A4F]" />
                      {tool.label}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#C4B5A0] group-hover:text-[#2D6A4F]" />
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Season Preview */}
            <div className="card bg-[#F8F5F0]">
              <div className="flex justify-between items-center mb-3">
                <SectionLabel>Long-Term Farm Plan</SectionLabel>
                <DemoBadge label="Preview" />
              </div>
              <div className="space-y-2">
                {THREE_SEASON_PLAN_A.seasons.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white rounded border border-[#E5E0D8]">
                    <div>
                      <div className="text-[10px] text-[#6B7280] font-bold">SEASON {i + 1}</div>
                      <div className="text-xs font-semibold text-[#1A1A2E]">{s.crops[0]?.cropName} ({s.crops[0]?.percentage}%)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#2D6A4F]">{formatCurrency(s.totalExpectedProfit)}</div>
                      <RiskBadge risk={s.portfolioRisk} className="text-[9px] py-0 px-1" />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/season-planner')} className="w-full mt-3 text-xs text-[#2D6A4F] font-semibold text-center hover:underline">
                View 3-Season Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. FOUNDATIONAL DATA CARDS ────────────────────── */}
      <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-[#E5E0D8]">
        
        {/* Soil Health */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <TestTube2 className="w-4 h-4 text-amber-700" />
            <h3 className="font-semibold text-sm">Soil Health</h3>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs"><span>Score</span><span className="font-bold">{soilScore}/100</span></div>
            <div className="flex justify-between text-xs"><span>pH</span><span className="font-bold">{soil?.pH.toFixed(1) || '-'}</span></div>
            <div className="flex justify-between text-xs"><span>Nitrogen</span><span className="font-bold">{soil?.nitrogen || '-'}</span></div>
            <div className="flex justify-between text-xs"><span>Moisture</span><span className="font-bold">{soil?.moisture || '-'}%</span></div>
          </div>
          <button onClick={() => navigate('/soil')} className="text-xs text-[#2D6A4F] font-semibold hover:underline">View Soil Intelligence →</button>
        </div>

        {/* Weather */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <CloudSun className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-sm">Weather Outlook</h3>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs"><span>Temp</span><span className="font-bold">{DEMO_WEATHER.currentTemp}°C</span></div>
            <div className="flex justify-between text-xs"><span>Rainfall</span><span className="font-bold">{DEMO_WEATHER.currentRainfall}mm</span></div>
            <div className="flex justify-between text-xs"><span>Risk</span><span className="font-bold capitalize text-amber-600">{DEMO_WEATHER.weatherRisk}</span></div>
          </div>
          <p className="text-[10px] text-[#6B7280] mb-3">{DEMO_WEATHER.forecast[0]?.weatherCondition}</p>
          <button onClick={() => navigate('/weather-water')} className="text-xs text-[#2D6A4F] font-semibold hover:underline">View Weather & Water →</button>
        </div>

        {/* Water */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-4 h-4 text-cyan-600" />
            <h3 className="font-semibold text-sm">Water Availability</h3>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs"><span>Availability</span><span className="font-bold capitalize">{DEMO_WATER.availability}</span></div>
            <div className="flex justify-between text-xs"><span>Source</span><span className="font-bold capitalize">{DEMO_WATER.source}</span></div>
            <div className="flex justify-between text-xs"><span>Irrigation</span><span className="font-bold capitalize">{DEMO_WATER.irrigationType}</span></div>
          </div>
          {portfolio && (
            <div className="text-[10px] bg-blue-50 text-blue-700 p-1.5 rounded mb-3">
              Stress: {portfolio.waterStressScore}%
            </div>
          )}
          <button onClick={() => navigate('/simulator')} className="text-xs text-amber-700 font-semibold hover:underline">Check What-If Drought →</button>
        </div>

        {/* Market */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-sm">Market Intel</h3>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs"><span>Wheat</span><span className="font-bold">₹{DEMO_MARKET.prices[0]?.currentPrice}/q</span></div>
            <div className="flex justify-between text-xs"><span>Mustard</span><span className="font-bold">₹{DEMO_MARKET.prices[1]?.currentPrice}/q</span></div>
            <div className="flex justify-between text-xs"><span>Trend</span><span className="font-bold text-emerald-600 capitalize">{DEMO_MARKET.prices[0]?.trend}</span></div>
          </div>
          <p className="text-[10px] text-[#6B7280] mb-3">Updated: Today (Mock)</p>
          <button onClick={() => navigate('/market')} className="text-xs text-[#2D6A4F] font-semibold hover:underline">View Market Intelligence →</button>
        </div>

      </div>
    </div>
  );
}
