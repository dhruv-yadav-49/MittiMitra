import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line
} from 'recharts';
import { TestTube2, Cpu, FlaskConical } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { PageHeader, DemoBadge, StatusBadge, InfoNote, SectionLabel, ScoreBar, EmptyState } from '../../components/shared';
import { calcSoilHealthScore } from '../../lib/calculations';
import { NPK_CHART_DATA, SOIL_HEALTH_HISTORY, getSoilParameterStatus } from '../../data/soil';
import type { SoilReading } from '../../types';

function calcSoilHealth(soil: SoilReading) {
  return calcSoilHealthScore(soil);
}

function getStatus(param: string, value: number) {
  const validParams = ['pH', 'nitrogen', 'phosphorus', 'potassium', 'ec', 'moisture', 'organicCarbon', 'temperature'];
  if (!validParams.includes(param)) return 'moderate';
  return getSoilParameterStatus(param as Parameters<typeof getSoilParameterStatus>[0], value);
}


const CROP_COMPAT = [
  { crop: 'Wheat', score: 92, color: '#52B788' },
  { crop: 'Mustard', score: 88, color: '#D4A017' },
  { crop: 'Chickpea', score: 82, color: '#74C69D' },
  { crop: 'Maize', score: 72, color: '#95D5B2' },
  { crop: 'Vegetable', score: 76, color: '#40916C' },
  { crop: 'Rice', score: 45, color: '#E76F51' },
];

const RADAR_DATA = [
  { param: 'pH', value: 82 },
  { param: 'Nitrogen', value: 75 },
  { param: 'Phosphorus', value: 68 },
  { param: 'Potassium', value: 80 },
  { param: 'Moisture', value: 72 },
  { param: 'Org.Carbon', value: 65 },
];

export default function SoilPage() {
  const { soil } = useFarm();

  if (!soil) {
    return (
      <EmptyState
        icon={<TestTube2 className="w-16 h-16" />}
        title="No soil data available"
        description="Add soil information in Field Setup or load the Demo Farm."
      />
    );
  }

  const healthScore = calcSoilHealth(soil);
  const healthLabel = healthScore >= 70 ? 'Good' : healthScore >= 50 ? 'Moderate' : 'Poor';
  const healthColor = healthScore >= 70 ? '#2D6A4F' : healthScore >= 50 ? '#D4A017' : '#D62828';

  const params = [
    { label: 'pH', value: soil.pH, display: soil.pH.toFixed(1), max: 14, param: 'pH' },
    { label: 'Nitrogen', value: soil.nitrogen, display: `${soil.nitrogen} kg/ha`, max: 400, param: 'nitrogen' },
    { label: 'Phosphorus', value: soil.phosphorus, display: `${soil.phosphorus} kg/ha`, max: 100, param: 'phosphorus' },
    { label: 'Potassium', value: soil.potassium, display: `${soil.potassium} kg/ha`, max: 300, param: 'potassium' },
    { label: 'EC', value: soil.ec, display: `${soil.ec.toFixed(1)} dS/m`, max: 3, param: 'ec' },
    { label: 'Moisture', value: soil.moisture, display: `${soil.moisture}%`, max: 100, param: 'moisture' },
    { label: 'Org. Carbon', value: soil.organicCarbon, display: `${soil.organicCarbon.toFixed(2)}%`, max: 3, param: 'organicCarbon' },
    { label: 'Temperature', value: soil.temperature, display: `${soil.temperature}°C`, max: 50, param: 'temperature' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Soil Intelligence"
        subtitle="Detailed soil health analysis and crop compatibility"
        badge={<DemoBadge />}
      />

      {/* Sensor Source */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E0D8] rounded-xl text-sm">
          <Cpu className="w-4 h-4 text-[#2D6A4F]" />
          <span className="text-[#6B7280]">Data Source:</span>
          <span className="font-semibold text-[#1A1A2E]">ESP32 Soil Kit — Demo Reading</span>
          <DemoBadge />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <FlaskConical className="w-4 h-4 text-amber-600" />
          <span className="text-amber-700 font-medium">Lab/SHC Validation: Not done</span>
        </div>
      </div>
      <InfoNote variant="warning">
        Indicative sensor reading. Low-cost sensors do not provide laboratory-grade nutrient measurement. Validate against Soil Health Card or laboratory data before making major input decisions.
      </InfoNote>

      {/* Health Score */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card text-center">
          <SectionLabel>Soil Health Score</SectionLabel>
          <div className="flex items-center justify-center mb-3">
            <svg className="w-28 h-28" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={healthColor} strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 42 * healthScore / 100} 999`}
                strokeLinecap="round" transform="rotate(-90 50 50)" />
              <text x="50" y="45" textAnchor="middle" fontSize="18" fontWeight="bold" fill={healthColor}>{healthScore}</text>
              <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#6B7280">/ 100</text>
            </svg>
          </div>
          <div className="font-bold text-lg text-[#1A1A2E]">{healthLabel}</div>
          <div className="text-xs text-[#6B7280] mt-1">Overall soil health — demo simulation</div>
        </div>

        {/* Radar */}
        <div className="card col-span-2">
          <SectionLabel>Nutrient Radar</SectionLabel>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#E5E0D8" />
              <PolarAngleAxis dataKey="param" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Radar dataKey="value" fill="#52B788" fillOpacity={0.25} stroke="#2D6A4F" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NPK Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>NPK vs Optimal</SectionLabel>
          <DemoBadge />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={NPK_CHART_DATA} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E0D8', fontSize: 12 }} />
            <Bar dataKey="actual" name="Actual" fill="#52B788" radius={[6, 6, 0, 0]} />
            <Bar dataKey="optimal" name="Optimal" fill="#D4A017" radius={[6, 6, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Soil Health Trend */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Health Score Trend</SectionLabel>
          <DemoBadge />
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={SOIL_HEALTH_HISTORY}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E0D8', fontSize: 12 }} />
            <Line dataKey="score" stroke="#2D6A4F" strokeWidth={2.5} dot={{ r: 4, fill: '#2D6A4F' }} name="Health Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Parameter Details */}
      <div className="card">
        <SectionLabel>Soil Parameters — Current Status</SectionLabel>
        <div className="grid sm:grid-cols-2 gap-4">
          {params.map(({ label, value, display, max, param }) => {
            const status = getStatus(param, value) as 'optimal' | 'low' | 'moderate' | 'high';
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="w-20 shrink-0">
                  <div className="text-xs font-medium text-[#6B7280]">{label}</div>
                  <div className="font-bold text-[#1A1A2E] text-sm">{display}</div>
                </div>
                <div className="flex-1">
                  <ScoreBar value={value} max={max} height={8} color={status === 'optimal' ? '#52B788' : status === 'low' ? '#60A5FA' : status === 'high' ? '#EF4444' : '#F59E0B'} />
                </div>
                <StatusBadge status={status} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Crop Compatibility */}
      <div className="card">
        <SectionLabel>Crop Compatibility (Soil-based)</SectionLabel>
        <div className="space-y-3">
          {CROP_COMPAT.map(({ crop, score, color }) => (
            <div key={crop} className="flex items-center gap-3">
              <div className="w-24 text-sm font-medium text-[#1A1A2E] shrink-0">{crop}</div>
              <div className="flex-1">
                <div className="progress-track" style={{ height: 10 }}>
                  <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
                </div>
              </div>
              <div className="text-sm font-bold w-10 text-right" style={{ color }}>{score}%</div>
            </div>
          ))}
        </div>
        <InfoNote variant="info">
          Soil compatibility scores are computed from pH, NPK and EC parameters. Weather, water and market factors are incorporated in the full AI analysis.
        </InfoNote>
      </div>

      {/* Improvement Suggestions */}
      <div className="card">
        <SectionLabel>Soil Improvement Suggestions</SectionLabel>
        <div className="space-y-3">
          {[
            { title: 'Phosphorus supplementation', desc: 'Phosphorus is slightly below optimal range. Consider DAP application at recommended rates before sowing.', priority: 'medium' },
            { title: 'Organic carbon enhancement', desc: 'Incorporate crop residue or well-decomposed FYM to improve organic carbon from 0.72% towards 0.8%+.', priority: 'low' },
            { title: 'Continue pH management', desc: 'Soil pH of 6.8 is in the good range for most rabi crops. Monitor after kharif harvest.', priority: 'low' },
          ].map(({ title, desc, priority }, i) => (
            <div key={i} className="flex gap-3 p-3 bg-[#F8F5F0] rounded-xl">
              <div className={`w-2 rounded-full shrink-0 ${priority === 'high' ? 'bg-red-400' : priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <div>
                <div className="text-sm font-semibold text-[#1A1A2E]">{title}</div>
                <div className="text-xs text-[#6B7280] mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
