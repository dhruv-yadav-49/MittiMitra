import { useState } from 'react';
import { History, Eye, X } from 'lucide-react';
import { PageHeader, DemoBadge, RiskBadge, ConfidenceScore, InfoNote } from '../../components/shared';
import { RECOMMENDATION_HISTORY } from '../../data/recommendations';
import { formatCurrency, cn } from '../../lib/utils';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function HistoryPage() {
  const [modal, setModal] = useState<string | null>(null);
  const selected = RECOMMENDATION_HISTORY.find(r => r.id === modal);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recommendation History"
        subtitle="Past AI analyses and farm portfolio recommendations"
        badge={<DemoBadge />}
      />
      <InfoNote variant="info">
        Demo history records. In production, this will show actual past analyses with outcome tracking for model improvement.
      </InfoNote>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E0D8]">
                {['Date', 'Farm', 'Recommended Portfolio', 'Expected Profit', 'Risk', 'Confidence', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECOMMENDATION_HISTORY.map((rec) => (
                <tr key={rec.id} className="border-b border-[#F0EDE8] hover:bg-[#F8F5F0]">
                  <td className="py-3 px-4 font-medium text-[#1A1A2E]">{rec.date}</td>
                  <td className="py-3 px-4 text-[#6B7280]">{rec.farmName}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {rec.portfolio.map(p => (
                        <span key={p.cropId} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: p.color + '30', color: p.color }}>
                          {p.cropName} {p.percentage}%
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#2D6A4F]">{formatCurrency(rec.expectedProfit)}</td>
                  <td className="py-3 px-4"><RiskBadge risk={rec.riskLevel} /></td>
                  <td className="py-3 px-4"><ConfidenceScore score={rec.confidenceScore} size="sm" /></td>
                  <td className="py-3 px-4">
                    <span className={cn('tag capitalize', STATUS_STYLES[rec.status])}>
                      {rec.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => setModal(rec.id)} className="flex items-center gap-1 text-xs text-[#2D6A4F] font-semibold hover:underline">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Loop Section */}
      <div className="card bg-[#E8F5EE] border-[#52B788]">
        <h3 className="font-semibold text-[#1A1A2E] mb-3">Feedback Loop — Actual Farm Outcomes</h3>
        <p className="text-sm text-[#4B5563] mb-4">
          Recording actual harvest data helps improve the AI model for future recommendations. This feature is designed for future ML retraining.
        </p>
        <div className="grid sm:grid-cols-4 gap-3 mb-4">
          {['Actual Yield (q/acre)', 'Actual Market Price (₹/q)', 'Actual Input Cost (₹/ac)', 'Overall Satisfaction'].map(f => (
            <div key={f}>
              <label className="block text-xs font-medium text-[#374151] mb-1">{f}</label>
              <input type="number" placeholder="—" className="w-full px-3 py-2 border border-[#E5E0D8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]" />
            </div>
          ))}
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-[#374151] mb-1">Farmer Feedback</label>
          <textarea placeholder="Any observations about this season's crop performance..." rows={2}
            className="w-full px-3 py-2 border border-[#E5E0D8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788] resize-none" />
        </div>
        <button className="btn-primary text-sm">Submit Outcome</button>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
            <button onClick={() => setModal(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] flex items-center justify-center">
                <History className="w-5 h-5 text-[#2D6A4F]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A1A2E]">Recommendation Detail</h3>
                <p className="text-xs text-[#6B7280]">{selected.farmName} · {selected.date}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#E8F5EE] rounded-xl p-3 text-center">
                  <div className="font-bold text-[#2D6A4F]">{formatCurrency(selected.expectedProfit)}</div>
                  <div className="text-[10px] text-[#6B7280]">Expected Profit</div>
                </div>
                <div className="bg-[#F8F5F0] rounded-xl p-3 text-center">
                  <RiskBadge risk={selected.riskLevel} />
                  <div className="text-[10px] text-[#6B7280] mt-1">Risk Level</div>
                </div>
                <div className="bg-[#F8F5F0] rounded-xl p-3 text-center">
                  <ConfidenceScore score={selected.confidenceScore} size="sm" />
                  <div className="text-[10px] text-[#6B7280] mt-1">AI Confidence</div>
                </div>
              </div>
              <h4 className="font-semibold text-[#1A1A2E] text-sm">Portfolio Allocation</h4>
              {selected.portfolio.map(p => (
                <div key={p.cropId} className="flex items-center gap-3 p-2.5 bg-[#F8F5F0] rounded-xl">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: p.color }} />
                  <span className="flex-1 text-sm font-medium text-[#1A1A2E]">{p.cropName}</span>
                  <span className="text-sm font-bold">{p.acres} acres</span>
                  <span className="text-xs text-[#6B7280]">{p.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
