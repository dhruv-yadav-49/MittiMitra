// ============================================================
// MittiMitra AI — Shared UI Components
// ============================================================

import { cn, getRiskBg, getStatusBg, getActionBg, getActionLabel, getConfidenceLabel } from '../../lib/utils';
import { AlertTriangle, CheckCircle2, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ── DemoBadge ───────────────────────────────────────────────
export function DemoBadge({ label = 'Demo Data' }: { label?: string }) {
  return (
    <span className="demo-badge">
      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block" />
      {label}
    </span>
  );
}

// ── StatusBadge ─────────────────────────────────────────────
interface StatusBadgeProps {
  status: 'optimal' | 'low' | 'moderate' | 'high';
  className?: string;
}
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const labels: Record<string, string> = {
    optimal: 'Optimal', low: 'Low', moderate: 'Moderate', high: 'High',
  };
  return (
    <span className={cn('tag', getStatusBg(status), className)}>
      {labels[status]}
    </span>
  );
}

// ── RiskBadge ───────────────────────────────────────────────
interface RiskBadgeProps {
  risk: 'low' | 'medium' | 'high';
  className?: string;
}
export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const labels = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk' };
  return (
    <span className={cn('tag', getRiskBg(risk), className)}>
      {risk === 'high' && <AlertTriangle className="w-2.5 h-2.5" />}
      {labels[risk]}
    </span>
  );
}

// ── ActionBadge ─────────────────────────────────────────────
interface ActionBadgeProps {
  action: 'recommended' | 'consider' | 'high_risk' | 'do_not_plant';
  className?: string;
}
export function ActionBadge({ action, className }: ActionBadgeProps) {
  return (
    <span className={cn('tag border', getActionBg(action), className)}>
      {action === 'recommended' && <CheckCircle2 className="w-2.5 h-2.5" />}
      {action === 'do_not_plant' && <AlertTriangle className="w-2.5 h-2.5" />}
      {getActionLabel(action)}
    </span>
  );
}

// ── ConfidenceScore ─────────────────────────────────────────
interface ConfidenceScoreProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}
export function ConfidenceScore({ score, showLabel = true, size = 'md' }: ConfidenceScoreProps) {
  const color = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-500';
  const label = getConfidenceLabel(score);
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('font-bold', color, size === 'sm' ? 'text-sm' : 'text-base')}>
        {score}%
      </span>
      {showLabel && (
        <span className={cn('text-xs font-medium', color)}>{label}</span>
      )}
    </div>
  );
}

// ── ScoreBar ────────────────────────────────────────────────
interface ScoreBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
}
export function ScoreBar({ value, max = 100, color = '#2D6A4F', height = 8 }: ScoreBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress-track" style={{ height }}>
      <div
        className="progress-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ── KpiCard ─────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  subLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  className?: string;
  valueColor?: string;
}
export function KpiCard({ label, value, subLabel, icon, trend, trendValue, className, valueColor }: KpiCardProps) {
  return (
    <div className={cn('card-sm flex flex-col gap-2', className)}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{label}</span>
        {icon && <div className="text-[#2D6A4F]">{icon}</div>}
      </div>
      <div className={cn('text-2xl font-bold text-[#1A1A2E]', valueColor)}>{value}</div>
      <div className="flex items-center gap-2">
        {subLabel && <span className="text-xs text-[#6B7280]">{subLabel}</span>}
        {trend && trendValue && (
          <span className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
          )}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'stable' && <Minus className="w-3 h-3" />}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}

// ── PageHeader ──────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}
export function PageHeader({ title, subtitle, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-[#6B7280]">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// ── InfoNote ────────────────────────────────────────────────
interface InfoNoteProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success';
}
export function InfoNote({ children, variant = 'info' }: InfoNoteProps) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };
  return (
    <div className={cn('flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs', styles[variant])}>
      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

// ── SectionLabel ────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
      {children}
    </h2>
  );
}

// ── EmptyState ──────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-[#6B7280] mb-3">{icon}</div>}
      <h3 className="font-semibold text-[#1A1A2E] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#6B7280] max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ── Tooltip wrapper ─────────────────────────────────────────
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}
export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  );
}
