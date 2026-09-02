// ============================================================
// MittiMitra AI — Utility Functions
// ============================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatFullCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
  if (risk === 'low') return 'text-emerald-600';
  if (risk === 'medium') return 'text-amber-600';
  return 'text-red-600';
}

export function getRiskBg(risk: 'low' | 'medium' | 'high'): string {
  if (risk === 'low') return 'bg-emerald-100 text-emerald-800';
  if (risk === 'medium') return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export function getStatusBg(status: 'optimal' | 'low' | 'moderate' | 'high'): string {
  if (status === 'optimal') return 'bg-emerald-100 text-emerald-800';
  if (status === 'moderate') return 'bg-amber-100 text-amber-800';
  if (status === 'low') return 'bg-blue-100 text-blue-800';
  return 'bg-red-100 text-red-800';
}

export function getActionBg(action: string): string {
  switch (action) {
    case 'recommended': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'consider': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'high_risk': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'do_not_plant': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getActionLabel(action: string): string {
  switch (action) {
    case 'recommended': return 'Recommended';
    case 'consider': return 'Consider';
    case 'high_risk': return 'High Risk';
    case 'do_not_plant': return 'Do Not Plant';
    default: return action;
  }
}

export function getWaterLabel(req: string): string {
  switch (req) {
    case 'low': return 'Low';
    case 'medium': return 'Medium';
    case 'high': return 'High';
    case 'very_high': return 'Very High';
    default: return req;
  }
}

export function getConfidenceLabel(score: number): string {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Moderate';
  return 'Low';
}

export function getDayOfWeek(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(dateStr).getDay()];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
