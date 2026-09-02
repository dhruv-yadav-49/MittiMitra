import {
  CheckCircle2, AlertTriangle, Droplets, Package, Calendar, TrendingUp,
  AlertOctagon, X
} from 'lucide-react';
import { PageHeader, DemoBadge, RiskBadge, InfoNote, SectionLabel } from '../../components/shared';
import { useFarm } from '../../context/FarmContext';
import { DEMO_PORTFOLIO, DEMO_RECOMMENDATIONS } from '../../data/recommendations';
import { formatCurrency } from '../../lib/utils';

const sections = [
  {
    id: 'plant',
    icon: CheckCircle2,
    title: 'PLANT',
    color: 'bg-emerald-50 border-emerald-300',
    iconColor: 'text-emerald-600',
    items: [
      { title: 'Wheat — 4 Acres', desc: 'Priority crop. High soil compatibility, reliable MSP, moderate water requirement.' },
      { title: 'Mustard — 3 Acres', desc: 'Recommended. Low water, strong market price trend, suitable for rabi season.' },
      { title: 'Chickpea — 2 Acres', desc: 'Recommended. Low water, nitrogen-fixing, good for crop rotation health.' },
      { title: 'Mixed Vegetables — 1 Acre', desc: 'Consider. High value but volatile. Limit to 1 acre to manage price risk.' },
    ],
  },
  {
    id: 'avoid',
    icon: X,
    title: 'AVOID',
    color: 'bg-red-50 border-red-300',
    iconColor: 'text-red-600',
    items: [
      { title: 'Rice', desc: 'Do Not Plant. Very high water requirement (1,200mm) significantly exceeds available water. High modeled water stress.' },
      { title: 'Maize (this season)', desc: 'High Risk. Kharif crop — season mismatch for rabi. Declining market price. Low profit margin vs alternatives.' },
    ],
  },
  {
    id: 'land',
    icon: CheckCircle2,
    title: 'LAND ALLOCATION',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    items: [
      { title: 'Wheat: 4 Acres (40%)', desc: 'Anchor crop — reliable yield, assured market procurement.' },
      { title: 'Mustard: 3 Acres (30%)', desc: 'Strong return per acre with lower water requirement.' },
      { title: 'Chickpea: 2 Acres (20%)', desc: 'Soil improvement + income diversification.' },
      { title: 'Vegetables: 1 Acre (10%)', desc: 'High value, limited to manage volatility risk.' },
    ],
  },
  {
    id: 'water',
    icon: Droplets,
    title: 'WATER GUIDANCE',
    color: 'bg-sky-50 border-sky-200',
    iconColor: 'text-sky-600',
    items: [
      { title: 'Prioritize low-water crops', desc: 'Mustard and Chickpea have low water requirements. Allocate borewell water primarily to Wheat.' },
      { title: 'Deficit irrigation for Wheat', desc: 'Apply irrigation at critical growth stages (sowing, tillering, grain filling) rather than flooding.' },
      { title: 'Avoid rice entirely', desc: 'Rice water demand (1,200mm) cannot be met with current water availability without extreme stress.' },
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
      { title: '⚠ Water Stress — Monitor', desc: 'Water stress score: 32/100. Borewell is the primary backup. Have a contingency plan if borewell yield falls.' },
      { title: '⚠ Vegetable Price Volatility', desc: 'Vegetable market risk is High. Limit area to 1 acre and secure a buyer before planting.' },
      { title: '⚠ Validate Soil Data', desc: 'Sensor readings are indicative. Get Soil Health Card or lab validation before applying fertilizers.' },
    ],
  },
];

export default function ActionPlanPage() {
  const { portfolio } = useFarm();
  const p = portfolio ?? DEMO_PORTFOLIO;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Farm Action Plan"
        subtitle="Farmer-friendly guidance based on AI portfolio recommendation"
        badge={<DemoBadge />}
      />
      <InfoNote variant="warning">
        This action plan is based on demo simulation data. Consult your local KVK, agriculture officer or certified agronomist before making major input and sowing decisions.
      </InfoNote>

      {/* Summary Banner */}
      <div className="card bg-gradient-to-r from-[#2D6A4F] to-[#40916C] text-white border-0">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <div className="text-[#B7E4C7] text-xs mb-0.5">Expected Portfolio Profit (demo)</div>
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
        {sections.map(({ id, icon: Icon, title, color, iconColor, items }) => (
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
