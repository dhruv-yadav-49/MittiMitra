import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { PageHeader, DemoBadge, RiskBadge, SectionLabel, InfoNote } from '../../components/shared';
import { DEMO_MARKET } from '../../data/market';
import { formatFullCurrency, cn } from '../../lib/utils';

export default function MarketPage() {
  const [selected, setSelected] = useState('wheat');
  const selectedCrop = DEMO_MARKET.prices.find(p => p.cropId === selected) ?? DEMO_MARKET.prices[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Market Intelligence"
        subtitle="Mandi prices, trends and revenue projections"
        badge={<DemoBadge label="Mock Agmarknet Data" />}
      />
      <InfoNote variant="warning">
        All market data shown is mock/demo data for demonstration purposes only. Replace with live Agmarknet API integration in production.
      </InfoNote>

      {/* Price Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>Current Mandi Prices</SectionLabel>
          <div className="text-xs text-[#6B7280]">Jaipur, Rajasthan · {new Date().toLocaleDateString()}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E0D8]">
                {['Crop', 'Current Price', 'Change', 'Demand', 'Market Risk'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_MARKET.prices.map((p) => (
                <tr
                  key={p.cropId}
                  onClick={() => setSelected(p.cropId)}
                  className={cn(
                    'border-b border-[#F0EDE8] hover:bg-[#F8F5F0] cursor-pointer transition-colors',
                    selected === p.cropId && 'bg-[#E8F5EE]'
                  )}
                >
                  <td className="py-3 px-3 font-semibold text-[#1A1A2E]">{p.cropName}</td>
                  <td className="py-3 px-3 font-bold">₹{p.currentPrice}/q</td>
                  <td className="py-3 px-3">
                    <span className={cn('flex items-center gap-1 font-medium', p.priceChange >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                      {p.priceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(p.priceChange).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={cn('tag', p.demand === 'high' ? 'bg-emerald-100 text-emerald-700' : p.demand === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>
                      {p.demand.charAt(0).toUpperCase() + p.demand.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-3"><RiskBadge risk={p.marketRisk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Crop Price Trend */}
      {selectedCrop && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Price Trend — {selectedCrop.cropName}</SectionLabel>
              <div className={cn('flex items-center gap-1 text-sm font-bold', selectedCrop.priceChange >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                {selectedCrop.trend === 'rising' ? <TrendingUp className="w-4 h-4" /> : selectedCrop.trend === 'falling' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                {selectedCrop.priceChange >= 0 ? '+' : ''}{selectedCrop.priceChange.toFixed(1)}%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={selectedCrop.priceHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EDE8" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={60} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E0D8', fontSize: 12 }} formatter={(v) => [`₹${v}/q`, 'Price']} />
                <Line dataKey="price" stroke={selectedCrop.priceChange >= 0 ? '#2D6A4F' : '#D62828'} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4 pt-4 border-t border-[#E5E0D8]">
              <div>
                <div className="text-xs text-[#6B7280]">Current Price</div>
                <div className="font-bold text-[#1A1A2E]">₹{selectedCrop.currentPrice}/q</div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280]">Previous</div>
                <div className="font-semibold text-[#6B7280]">₹{selectedCrop.previousPrice}/q</div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280]">Market Risk</div>
                <RiskBadge risk={selectedCrop.marketRisk} />
              </div>
            </div>
          </div>

          {/* Revenue Comparison */}
          <div className="card">
            <SectionLabel>Expected Revenue Comparison (per acre)</SectionLabel>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={DEMO_MARKET.prices.map(p => ({
                name: p.cropName,
                revenue: Math.round(p.currentPrice * (p.cropId === 'wheat' ? 18 : p.cropId === 'mustard' ? 10 : p.cropId === 'chickpea' ? 9 : p.cropId === 'rice' ? 20 : p.cropId === 'maize' ? 14 : 55)),
                risk: p.marketRisk,
              }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0EDE8" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E0D8', fontSize: 12 }} formatter={(v) => [formatFullCurrency(Number(v)), 'Est. Revenue/acre']} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                  {DEMO_MARKET.prices.map((p, i) => (
                    <Cell key={i} fill={p.marketRisk === 'low' ? '#52B788' : p.marketRisk === 'medium' ? '#D4A017' : '#E76F51'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Buyer Before Sowing */}
      <div className="card border-l-4 border-l-[#2D6A4F]">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-[#1A1A2E] mb-2">Buyer Before Sowing</h3>
            <div className="space-y-2 text-sm text-[#4B5563]">
              {[
                'Mustard currently shows favorable market conditions in the selected demo region. Consider exploring forward linkages with local mustard oil mills.',
                'Wheat procurement through FCI/state agencies is reliable in Rajasthan — MSP of ₹2,275/q provides a price floor.',
                'Vegetable prices are volatile — explore contract farming or FPO-level aggregation before allocating larger area.',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#2D6A4F]" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
