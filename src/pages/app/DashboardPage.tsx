import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TestTube2, CloudSun, TrendingUp, Brain, Droplets, BarChart3,
  AlertTriangle, CheckCircle2, ArrowRight, Zap, Leaf
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { useAuth } from '../../context/AuthContext';
import { KpiCard, DemoBadge, RiskBadge, ScoreBar, InfoNote } from '../../components/shared';
import { formatCurrency, getScoreColor } from '../../lib/utils';
import { calcSoilHealthScore } from '../../lib/calculations';
import { DEMO_WEATHER } from '../../data/weather';

const ANALYSIS_STEPS = [
  'Analyzing Soil Data...',
  'Checking Weather Conditions...',
  'Evaluating Water Availability...',
  'Analyzing Market Prices...',
  'Predicting Crop Yields...',
  'Estimating Profitability...',
  'Calculating Risk Scores...',
  'Optimizing Farm Portfolio...',
];

export default function DashboardPage() {
  const { farm, soil, recommendations, portfolio, analysisRun, setAnalysisRun, loadDemoFarm } = useFarm();
  const { farmer } = useAuth();
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisStep(0);
    setAnalysisProgress(0);
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      setAnalysisStep(i);
      setAnalysisProgress(Math.round(((i + 1) / ANALYSIS_STEPS.length) * 100));
      await new Promise((r) => setTimeout(r, 600));
    }
    setAnalyzing(false);
    setAnalysisRun(true);
    navigate('/ai-analysis');
  };

  const soilScore = soil ? calcSoilHealthScore(soil) : 0;
  const soilLabel = soilScore >= 70 ? 'Good' : soilScore >= 50 ? 'Moderate' : 'Poor';

  if (!farm) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Leaf className="w-16 h-16 text-[#52B788] mb-4 opacity-60" />
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">No farm selected</h2>
        <p className="text-sm text-[#6B7280] mb-6 max-w-xs">Add your farm details or load the demo farm to get started.</p>
        <div className="flex gap-3">
          <button onClick={loadDemoFarm} className="btn-primary">Load Demo Farm</button>
          <button onClick={() => navigate('/field-setup')} className="btn-secondary">Add My Farm</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-sm text-[#6B7280]">{greeting}, {farmer?.name ?? 'Farmer'}</p>
          <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {farm.name} — {farm.totalLand} {farm.landUnit}s
          </h1>
        </div>
        <DemoBadge label="Demo Farm" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Soil Health"
          value={soilLabel}
          subLabel={`Score: ${soilScore}/100`}
          icon={<TestTube2 className="w-4 h-4" />}
          valueColor={soilScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}
        />
        <KpiCard
          label="Water Availability"
          value="Moderate"
          subLabel="Stress: 32/100"
          icon={<Droplets className="w-4 h-4" />}
          valueColor="text-amber-600"
        />
        <KpiCard
          label="Expected Profit"
          value={portfolio ? formatCurrency(portfolio.expectedTotalProfit) : '₹3.88L'}
          subLabel="Portfolio (demo)"
          icon={<BarChart3 className="w-4 h-4" />}
          trend="up"
          trendValue="vs single crop"
          valueColor="text-emerald-600"
        />
        <KpiCard
          label="Overall Risk"
          value={portfolio?.portfolioRisk ?? 'Medium'}
          subLabel="Portfolio risk"
          icon={<AlertTriangle className="w-4 h-4" />}
          valueColor="text-amber-600"
        />
        <KpiCard
          label="AI Confidence"
          value={`${portfolio?.confidenceScore ?? 83}%`}
          subLabel="Simulation"
          icon={<Brain className="w-4 h-4" />}
          valueColor={getScoreColor(portfolio?.confidenceScore ?? 83)}
        />
      </div>
      <InfoNote variant="warning">
        * Demo values — based on mock data simulation. Not validated field or market data.
      </InfoNote>

      {/* Analysis CTA */}
      {!analyzing ? (
        <div className="card bg-gradient-to-r from-[#2D6A4F] to-[#40916C] text-white border-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-[#74C69D]" />
                <span className="font-semibold text-[#74C69D] text-sm uppercase tracking-wider">AI Decision Engine</span>
              </div>
              <h2 className="text-xl font-bold mb-1">Run AI Farm Analysis</h2>
              <p className="text-[#B7E4C7] text-sm">
                Combine soil, weather, water and market data to generate your optimized crop portfolio.
              </p>
            </div>
            <button
              onClick={runAnalysis}
              className="shrink-0 btn-accent text-base px-6 py-3 shadow-lg"
            >
              Analyze My Farm <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="card bg-gradient-to-r from-[#2D6A4F] to-[#40916C] text-white border-0">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#74C69D]" />
                <span className="font-semibold text-[#74C69D] text-sm">AI Decision Engine</span>
              </div>
              <span className="text-sm font-bold text-white">{analysisProgress}%</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-1">
              {ANALYSIS_STEPS[analysisStep]}
            </h2>
            <div className="w-full bg-white/20 rounded-full h-2 mt-3">
              <div
                className="h-2 rounded-full bg-[#D4A017] transition-all duration-500"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ANALYSIS_STEPS.map((s, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i <= analysisStep ? 'bg-[#74C69D]' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      )}

      {/* Dashboard grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Soil Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <TestTube2 className="w-4 h-4 text-amber-700" />
              </div>
              <h3 className="font-semibold text-[#1A1A2E]">Soil Intelligence</h3>
            </div>
            <DemoBadge />
          </div>
          {soil && (
            <div className="space-y-3">
              {[
                { label: 'pH', value: soil.pH, max: 14, display: soil.pH.toFixed(1), color: '#52B788' },
                { label: 'Nitrogen', value: soil.nitrogen, max: 400, display: `${soil.nitrogen} kg/ha`, color: '#2D6A4F' },
                { label: 'Phosphorus', value: soil.phosphorus, max: 100, display: `${soil.phosphorus} kg/ha`, color: '#D4A017' },
                { label: 'Potassium', value: soil.potassium, max: 300, display: `${soil.potassium} kg/ha`, color: '#52B788' },
                { label: 'Moisture', value: soil.moisture, max: 100, display: `${soil.moisture}%`, color: '#40916C' },
                { label: 'Org. Carbon', value: soil.organicCarbon, max: 3, display: `${soil.organicCarbon}%`, color: '#95D5B2' },
              ].map(({ label, value, max, display, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#6B7280] font-medium">{label}</span>
                    <span className="font-semibold text-[#1A1A2E]">{display}</span>
                  </div>
                  <ScoreBar value={value} max={max} color={color} height={6} />
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate('/soil')} className="mt-4 text-xs text-[#2D6A4F] font-semibold flex items-center gap-1 hover:underline">
            View Soil Intelligence <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Weather Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <CloudSun className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-[#1A1A2E]">Weather & Water</h3>
            </div>
            <DemoBadge />
          </div>
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Temp', value: `${DEMO_WEATHER.currentTemp}°C` },
                { label: 'Humidity', value: `${DEMO_WEATHER.currentHumidity}%` },
                { label: 'Rainfall', value: `${DEMO_WEATHER.currentRainfall}mm` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-blue-50 rounded-xl p-2.5 text-center">
                  <div className="text-xs text-[#6B7280]">{label}</div>
                  <div className="font-bold text-[#1A1A2E] text-sm">{value}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl">
              <span className="text-xs text-[#6B7280]">Weather Risk</span>
              <RiskBadge risk="medium" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#F8F5F0] rounded-xl">
              <span className="text-xs text-[#6B7280]">Water Stress Score</span>
              <span className="font-bold text-[#1A1A2E] text-sm">32/100</span>
            </div>
            <div className="text-xs text-[#6B7280] bg-[#E8F5EE] p-2.5 rounded-xl">
              💧 Prefer crops with low-to-moderate water requirements
            </div>
          </div>
          <button onClick={() => navigate('/weather-water')} className="text-xs text-[#2D6A4F] font-semibold flex items-center gap-1 hover:underline">
            View Weather & Water <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* AI Recommendation Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
                <Brain className="w-4 h-4 text-[#2D6A4F]" />
              </div>
              <h3 className="font-semibold text-[#1A1A2E]">AI Recommendation</h3>
            </div>
            <DemoBadge />
          </div>

          {analysisRun && portfolio ? (
            <>
              <div className="space-y-2.5 mb-4">
                {portfolio.allocations.map((a) => (
                  <div key={a.cropId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8F5F0]">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-[#1A1A2E]">{a.cropName}</span>
                        <span className="text-xs font-bold text-[#2D6A4F]">{a.percentage}%</span>
                      </div>
                      <div className="text-xs text-[#6B7280]">{a.acres} acres · {formatCurrency(a.expectedProfit)} profit</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#E8F5EE] rounded-xl p-3 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#2D6A4F] font-medium">Total Expected Profit</span>
                  <span className="font-bold text-[#2D6A4F]">{formatCurrency(portfolio.expectedTotalProfit)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-[#6B7280]">Portfolio Risk</span>
                  <RiskBadge risk={portfolio.portfolioRisk} />
                </div>
              </div>
              <button onClick={() => navigate('/portfolio')} className="text-xs text-[#2D6A4F] font-semibold flex items-center gap-1 hover:underline">
                View Portfolio Optimizer <ArrowRight className="w-3 h-3" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Brain className="w-12 h-12 text-[#52B788] opacity-40 mb-3" />
              <p className="text-sm text-[#6B7280] mb-4">Run AI Analysis to see your crop portfolio recommendation</p>
              <button onClick={runAnalysis} className="btn-primary text-sm py-2">
                Run Analysis
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Quick Navigation</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Soil', icon: TestTube2, to: '/soil', color: 'bg-amber-50 text-amber-700' },
            { label: 'Weather', icon: CloudSun, to: '/weather-water', color: 'bg-blue-50 text-blue-700' },
            { label: 'Market', icon: TrendingUp, to: '/market', color: 'bg-purple-50 text-purple-700' },
            { label: 'AI Analysis', icon: Brain, to: '/ai-analysis', color: 'bg-[#E8F5EE] text-[#2D6A4F]' },
            { label: 'Portfolio', icon: BarChart3, to: '/portfolio', color: 'bg-[#E8F5EE] text-[#40916C]' },
            { label: 'Action Plan', icon: CheckCircle2, to: '/action-plan', color: 'bg-emerald-50 text-emerald-700' },
          ].map(({ label, icon: Icon, to, color }) => (
            <button key={to} onClick={() => navigate(to)} className={`card-sm flex flex-col items-center gap-2 hover:shadow-md transition-all cursor-pointer ${color}`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
