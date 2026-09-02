import {
  CheckCircle2, AlertTriangle, Droplets, Package, Calendar, TrendingUp,
  AlertOctagon, X
} from 'lucide-react';
import { PageHeader, DemoBadge, RiskBadge, InfoNote } from '../../components/shared';
import { useFarm } from '../../context/FarmContext';
import { DEMO_PORTFOLIO, DEMO_RECOMMENDATIONS } from '../../data/recommendations';
import { formatCurrency } from '../../lib/utils';

export default function ActionPlanPage() {
  const { portfolio } = useFarm();
  const p = portfolio ?? DEMO_PORTFOLIO;
  const recs = DEMO_RECOMMENDATIONS;

  // Dynamically build PLANT items from optimizer allocations
  const plantItems = p.allocations.map((a) => {
    const rec = recs.find(r => r.cropId === a.cropId);
    const reason = rec?.reasons[0] ?? 'Recommended by AI Portfolio Optimizer.';
    return {
      title: `${a.cropName} — ${a.acres} Acres (${a.percentage}%)`,
      desc: reason,
    };
  });

  // Dynamically build AVOID items from do_not_plant + high risk crops
  const avoidItems = recs
    .filter(r => r.action === 'do_not_plant' || r.action === 'high_risk')
    .map(r => ({
      title: `${r.cropName} — ${r.action === 'do_not_plant' ? 'Do Not Plant' : 'High Risk'}`,
      desc: r.warnings.slice(0, 2).join(' '),
    }));

  // Land allocation items from portfolio
  const landItems = p.allocations.map((a) => ({
    title: `${a.cropName}: ${a.acres} Acres (${a.percentage}%)`,
    desc: `Est. profit: ${formatCurrency(a.expectedProfit)}. Risk score: ${a.riskScore}/100.`,
  }));

  const dynamicSections = [
    {
      id: 'plant',
      icon: CheckCircle2,
      title: 'PLANT',
      color: 'bg-emerald-50 border-emerald-300',
      iconColor: 'text-emerald-600',
      items: plantItems,
    },
    {
      id: 'avoid',
      icon: X,
      title: 'AVOID',
      color: 'bg-red-50 border-red-300',
      iconColor: 'text-red-600',
      items: avoidItems,
    },
    {
      id: 'land',
      icon: CheckCircle2,
      title: 'LAND ALLOCATION',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      items: landItems,
    },
  ];

  const staticSections = [
    {
      id: 'water',
      icon: Droplets,
      title: 'WATER GUIDANCE',
      color: 'bg-sky-50 border-sky-200',
      iconColor: 'text-sky-600',
      items: [
        { title: 'Prioritize low-water crops', desc: 'Mustard and Chickpea have low water requirements. Allocate borewell water primarily to Wheat.' },
        { title: 'Deficit irrigation for Wheat', desc: 'Apply irrigation at critical growth stages (sowing, tillering, grain filling) rather than flooding.' },
        { title: 'Avoid high water stress crops', desc: 'Crops with water stress > 60% have been excluded from the portfolio by the optimizer.' },
      ],
    },
    {
      id: 'inputs',
      icon: Package,
      title: 'INPUT GUIDANCE',
      color: 'bg-amber-50 border-amber-200',
      iconColor: 'text-amber-600',
      items: [
        { title: 'Phosphorus supplement', desc: 'Phosphorus (32 kg/ha) is slightly below optimal. Apply DAP at recommended rates for Wheat and Chickpea.' },
        { title: 'Basal nitrogen for Wheat', desc: 'Apply urea/DAP split dosing — 50% at sowing, 50% at tillering stage.' },
        { title: 'FYM incorporation', desc: 'Incorporate 2–3 tonnes/acre of well-decomposed farmyard manure to improve organic carbon before sowing.' },
        { title: 'Avoid excess nitrogen for Mustard', desc: 'Mustard requires moderate nitrogen (80–150 kg/ha). Excess promotes vegetative growth over oil content.' },
      ],
    },
    {
      id: 'timing',
      icon: Calendar,
      title: 'CROP TIMING',
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
      items: [
        { title: 'Wheat Sowing', desc: 'Optimal window: 15 Oct – 15 Nov (Rajasthan). Delay beyond November reduces yield.' },
        { title: 'Mustard Sowing', desc: 'Optimal window: 1 Oct – 15 Oct. Earlier sowing generally improves oil yield.' },
        { title: 'Chickpea Sowing', desc: 'Optimal window: 20 Oct – 30 Nov. Allow 2–3 weeks after wheat sowing for field preparation.' },
        { title: 'Vegetable Planting', desc: 'Stagger planting for continuous harvest. Begin after kharif harvest, approximately October.' },
      ],
    },
    {
      id: 'market',
      icon: TrendingUp,
      title: 'MARKET CONSIDERATIONS',
      color: 'bg-[#E8F5EE] border-[#52B788]',
      iconColor: 'text-[#2D6A4F]',
      items: [
        { title: 'Wheat — MSP protection', desc: 'Wheat MSP is ₹2,275/q. Register for MSP procurement with local APMC/FCI before sowing.' },
        { title: 'Mustard — explore oil mill linkage', desc: 'Current mandi price ₹5,800/q. Explore pre-season contract with local mustard oil mills for price certainty.' },
        { title: 'Chickpea — monitor price trend', desc: 'Chickpea prices currently declining. Monitor before sowing. FPO-level aggregation can improve bargaining.' },
        { title: 'Vegetables — identify buyers early', desc: 'Vegetable prices are volatile. Identify local mandis, FPOs or direct institutional buyers before planting.' },
      ],
    },
    {
      id: 'alerts',
      icon: AlertOctagon,
      title: 'RISK ALERTS',
      color: 'bg-orange-50 border-orange-300',
      iconColor: 'text-orange-600',
      items: [
        { title: '⚠ Weather Risk — Medium', desc: 'Moderate weather uncertainty for the season. Monitor IMD forecasts before final sowing decisions.' },
        { title: `⚠ Portfolio Water Stress — ${p.waterStressScore}/100`, desc: 'Monitor borewell availability. Have a contingency plan if borewell yield falls.' },
        { title: '⚠ Validate Soil Data', desc: 'Sensor readings are indicative. Get Soil Health Card or lab validation before applying fertilizers.' },
        { title: `⚠ AI Confidence: ${p.confidenceScore}%`, desc: 'Confidence reflects data completeness, not prediction accuracy. Consult your local KVK before major decisions.' },
      ],
    },
  ];

  const allSections = [...dynamicSections, ...staticSections];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Farm Action Plan"
        subtitle="Farmer-friendly guidance based on AI Portfolio Optimizer recommendation"
        badge={<DemoBadge />}
      />
      <InfoNote variant="warning">
        This action plan is based on the AI Portfolio Optimizer — MVP Simulation. Consult your local KVK, agriculture officer or certified agronomist before making major input and sowing decisions.
      </InfoNote>

      {/* Summary Banner */}
      <div className="card bg-gradient-to-r from-[#2D6A4F] to-[#40916C] text-white border-0">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <div className="text-[#B7E4C7] text-xs mb-0.5">Estimated Portfolio Profit (demo)</div>
            <div className="text-2xl font-bold">{formatCurrency(p.expectedTotalProfit)}</div>
          </div>
          <div>
            <div className="text-[#B7E4C7] text-xs mb-0.5">Portfolio Risk</div>
            <RiskBadge risk={p.portfolioRisk} className="mt-1" />
          </div>
          <div>
            <div className="text-[#B7E4C7] text-xs mb-0.5">AI Confidence</div>
            <div className="text-2xl font-bold">{p.confidenceScore}%</div>
          </div>
        </div>
      </div>

      {/* Action Sections */}
      <div className="grid md:grid-cols-2 gap-4">
        {allSections.map(({ id, icon: Icon, title, color, iconColor, items }) => (
          <div key={id} className={`card border-2 ${color}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#1A1A2E] text-sm uppercase tracking-wider">{title}</h3>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-3">
                  <div className="text-sm font-semibold text-[#1A1A2E]">{item.title}</div>
                  <div className="text-xs text-[#6B7280] mt-0.5">{item.desc}</div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="bg-white rounded-xl p-3 text-xs text-[#6B7280]">No crops in this category based on current analysis.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
