import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, ChevronRight, AlertTriangle, X, Droplets, BarChart3,
  Brain, ArrowRight, TrendingUp, Shield
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from 'recharts';
import { useFarm } from '../../context/FarmContext';
import {
  PageHeader, DemoBadge, RiskBadge, ActionBadge, ConfidenceScore,
  ScoreBar, InfoNote, SectionLabel
} from '../../components/shared';
import { formatCurrency, getWaterLabel, cn } from '../../lib/utils';
import { DEMO_RECOMMENDATIONS } from '../../data/recommendations';

const PIPELINE_STEPS = [
  'Data Fusion', 'Data Validation', 'Feature Engineering', 'Crop Suitability',
  'Yield Prediction', 'Profit Estimation', 'Risk Assessment', 'Portfolio Optimization'
];

export default function AiAnalysisPage() {
  const { recommendations } = useFarm();
  const navigate = useNavigate();
  const recs = recommendations.length > 0 ? recommendations : DEMO_RECOMMENDATIONS;
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);
  const [doNotPlantModal, setDoNotPlantModal] = useState(false);

  const doNotPlant = recs.filter(r => r.action === 'do_not_plant');
  const ranked = recs.filter(r => r.action !== 'do_not_plant');

  const radarData = (rec: typeof recs[0]) => [
    { axis: 'Soil', value: rec.soilCompatibility },
    { axis: 'Weather', value: rec.weatherCompatibility },
    { axis: 'Market', value: rec.marketCompatibility },
    { axis: 'Yield', value: Math.round(rec.suitabilityScore * 0.9) },
    { axis: 'Water', value: rec.waterRequirement === 'low' ? 90 : rec.waterRequirement === 'medium' ? 70 : 40 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Crop Decision Engine"
        subtitle="Multi-source data fusion → suitability → yield → profit → risk → portfolio"
        badge={<DemoBadge label="MVP Simulation" />}
      />
      <InfoNote variant="warning">
        AI Decision Engine — MVP Simulation. This uses deterministic scoring, not a production-trained ML model. Results are demo values based on mock data.
      </InfoNote>

      {/* Pipeline Visual */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-[#2D6A4F]" />
          <h3 className="font-semibold text-[#1A1A2E]">AI Processing Pipeline</h3>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {PIPELINE_STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="px-3 py-1.5 bg-[#E8F5EE] border border-[#52B788] rounded-lg text-xs font-semibold text-[#2D6A4F]">
                {s}
              </div>
              {i < PIPELINE_STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-[#52B788] shrink-0" />}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#E5E0D8]">
          {[
            { icon: CheckCircle2, label: 'Soil', color: 'text-amber-600' },
            { icon: CheckCircle2, label: 'Weather', color: 'text-blue-500' },
            { icon: CheckCircle2, label: 'Water', color: 'text-[#2D6A4F]' },
            { icon: CheckCircle2, label: 'Location', color: 'text-purple-500' },
            { icon: CheckCircle2, label: 'Crop History', color: 'text-emerald-600' },
            { icon: CheckCircle2, label: 'Market', color: 'text-[#D4A017]' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </div>
          ))}
        </div>
      </div>

      {/* DO NOT PLANT Warning */}
      {doNotPlant.length > 0 && (
        <div className="card border-2 border-red-300 bg-red-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-red-700 text-lg">⛔ DO NOT PLANT</div>
              {doNotPlant.map(crop => (
                <div key={crop.cropId} className="mt-2">
                  <span className="font-bold text-red-700 text-base">{crop.cropName}</span>
                  <div className="mt-1 space-y-1">
                    {crop.warnings.map((w, i) => (
                      <div key={i} className="text-sm text-red-600 flex items-start gap-1.5">
                        <X className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {w}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setDoNotPlantModal(true)}
              className="shrink-0 btn-secondary text-xs py-1.5 px-3 text-red-600 border-red-300 hover:bg-red-100"
            >
              View Explanation
            </button>
          </div>
        </div>
      )}

      {/* Crop Ranking Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Crop Ranking</SectionLabel>
          <DemoBadge />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E0D8]">
                {['Rank', 'Crop', 'Suitability', 'Yield (q/ac)', 'Profit/ac', 'Water', 'Risk', 'Confidence', 'Action'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((rec) => (
                <tr key={rec.cropId} className="border-b border-[#F0EDE8] hover:bg-[#F8F5F0] cursor-pointer" onClick={() => setExpandedCrop(expandedCrop === rec.cropId ? null : rec.cropId)}>
                  <td className="py-3 px-3">
                    <div className="w-7 h-7 rounded-full bg-[#E8F5EE] flex items-center justify-center text-xs font-bold text-[#2D6A4F]">
                      {rec.rank}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#1A1A2E]">{rec.cropName}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <ScoreBar value={rec.suitabilityScore} max={100} height={6} color="#52B788" />
                      <span className="text-xs font-bold text-[#2D6A4F] w-8">{rec.suitabilityScore}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium">{rec.expectedYield}</td>
                  <td className="py-3 px-3 font-bold text-[#2D6A4F]">{formatCurrency(rec.expectedProfit)}</td>
                  <td className="py-3 px-3">
                    <span className={cn('tag', rec.waterRequirement === 'low' ? 'bg-emerald-100 text-emerald-700' : rec.waterRequirement === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700')}>
                      {getWaterLabel(rec.waterRequirement)}
                    </span>
                  </td>
                  <td className="py-3 px-3"><RiskBadge risk={rec.riskLevel} /></td>
                  <td className="py-3 px-3"><ConfidenceScore score={rec.confidenceScore} size="sm" /></td>
                  <td className="py-3 px-3"><ActionBadge action={rec.action} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crop Detail Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {ranked.slice(0, 4).map((rec) => (
          <div key={rec.cropId} className={cn('card transition-all', expandedCrop === rec.cropId && 'ring-2 ring-[#52B788]')}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-[#E8F5EE] flex items-center justify-center text-xs font-bold text-[#2D6A4F]">
                    {rec.rank}
                  </span>
                  <h3 className="font-bold text-[#1A1A2E] text-base">{rec.cropName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <ActionBadge action={rec.action} />
                  <RiskBadge risk={rec.riskLevel} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#2D6A4F]">{rec.suitabilityScore}%</div>
                <div className="text-xs text-[#6B7280]">Suitability</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Yield', value: `${rec.expectedYield} q/ac` },
                { label: 'Cost/ac', value: formatCurrency(rec.estimatedCost) },
                { label: 'Profit/ac', value: formatCurrency(rec.expectedProfit) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#F8F5F0] rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-[#6B7280]">{label}</div>
                  <div className="font-bold text-[#1A1A2E] text-xs mt-0.5">{value}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mb-4">
              <div>
                <div className="text-xs text-[#6B7280]">Water</div>
                <div className="text-xs font-semibold text-[#1A1A2E]">{getWaterLabel(rec.waterRequirement)}</div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280]">AI Confidence</div>
                <ConfidenceScore score={rec.confidenceScore} size="sm" />
              </div>
            </div>

            {/* Radar mini */}
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData(rec)}>
                  <PolarGrid stroke="#E5E0D8" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: '#6B7280' }} />
                  <Radar dataKey="value" fill="#52B788" fillOpacity={0.2} stroke="#2D6A4F" strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Reasons */}
            <div className="mt-3 pt-3 border-t border-[#E5E0D8]">
              <div className="text-xs font-semibold text-[#6B7280] mb-2">Why Recommended</div>
              <div className="space-y-1">
                {rec.reasons.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-[#4B5563]">
                    <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5 text-emerald-500" /> {r}
                  </div>
                ))}
                {rec.warnings.slice(0, 2).map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-amber-600">
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> {w}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigate to Portfolio */}
      <div className="card bg-[#E8F5EE] border-[#52B788]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#1A1A2E]">Ready to optimize your land allocation?</h3>
            <p className="text-sm text-[#2D6A4F]">View the AI-optimized multi-crop portfolio for your 10 acres.</p>
          </div>
          <button onClick={() => navigate('/portfolio')} className="btn-primary shrink-0">
            View Portfolio <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Do Not Plant Modal */}
      {doNotPlantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button onClick={() => setDoNotPlantModal(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="font-bold text-red-700 text-lg">DO NOT PLANT — Rice</div>
                <div className="text-xs text-[#6B7280]">AI Decision Engine Explanation</div>
              </div>
            </div>
            <div className="space-y-3">
              {doNotPlant[0]?.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-red-50 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{w}</p>
                </div>
              ))}
              <InfoNote variant="info">
                The AI engine applies a "Do Not Plant" classification when the combined water stress, weather risk and soil incompatibility score exceeds the decision threshold. This is a demo simulation — consult your local KVK or agriculture officer before making final decisions.
              </InfoNote>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setDoNotPlantModal(false)} className="btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
