import { type ReactNode } from 'react';

type Tone = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  variant?: 'solid' | 'soft' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const toneSolid: Record<Tone, string> = {
  default: 'bg-slate-800 text-slate-300',
  accent: 'bg-amber-500 text-slate-950 font-semibold',
  success: 'bg-emerald-500 text-slate-950 font-semibold',
  warning: 'bg-amber-500 text-slate-950 font-semibold',
  error: 'bg-rose-500 text-white font-semibold',
  info: 'bg-sky-500 text-slate-950 font-semibold',
};

const toneSoft: Record<Tone, string> = {
  default: 'bg-slate-800/70 text-slate-400 border border-slate-700/60',
  accent: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  error: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  info: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
};

const toneOutline: Record<Tone, string> = {
  default: 'border-border text-text-secondary',
  accent: 'border-amber-500/40 text-amber-400',
  success: 'border-emerald-500/40 text-emerald-400',
  warning: 'border-amber-500/40 text-amber-400',
  error: 'border-rose-500/40 text-rose-400',
  info: 'border-sky-500/40 text-sky-400',
};

export function Badge({ children, tone = 'default', variant = 'soft', size = 'md', className = '' }: BadgeProps) {
  const styles = variant === 'solid' ? toneSolid[tone] : variant === 'outline' ? toneOutline[tone] : toneSoft[tone];
  const sizeStyles = size === 'xs'
    ? 'px-1.5 py-0 text-3xs'
    : size === 'sm'
    ? 'px-2 py-0.5 text-2xs'
    : 'px-2.5 py-0.5 text-2xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold tracking-wide ${sizeStyles} ${styles} ${className}`}>
      {children}
    </span>
  );
}

export const PRIORITY_OPTIONS = [
  'Lead',
  'Interested lead',
  'Ingaging',
  'Cold reply',
  'Not interested',
] as const;

export type PriorityOption = typeof PRIORITY_OPTIONS[number];

export const PRIORITY_RANK: Record<PriorityOption, number> = {
  'Lead': 1,
  'Interested lead': 2,
  'Ingaging': 3,
  'Cold reply': 4,
  'Not interested': 5,
};

export function normalizePriority(priority: unknown): PriorityOption {
  const s = String(priority ?? '').trim().toLowerCase();
  if (!s) return 'Lead';

  // Direct name matching
  if (s === 'lead') return 'Lead';
  if (s.includes('interested lead') || s === 'interested') return 'Interested lead';
  if (s.includes('ingaging') || s.includes('engaging')) return 'Ingaging';
  if (s.includes('cold')) return 'Cold reply';
  if (s.includes('not interested') || s === 'not_interested') return 'Not interested';

  // Legacy numeric / code mappings
  if (s === '1' || s === 'a' || s.startsWith('priority 1') || s.startsWith('p1')) return 'Lead';
  if (s === '2' || s === 'b' || s.startsWith('priority 2') || s.startsWith('p2')) return 'Interested lead';
  if (s === '3' || s === 'c' || s.startsWith('priority 3') || s.startsWith('p3')) return 'Ingaging';
  if (s === '4' || s === 'd' || s.startsWith('priority 4') || s.startsWith('p4')) return 'Cold reply';
  if (s === '5' || s === 'e' || s.startsWith('priority 5') || s.startsWith('p5')) return 'Not interested';

  return 'Lead';
}

export function getPriorityRowClasses(priority: unknown): string {
  const p = normalizePriority(priority);
  switch (p) {
    case 'Lead':
      return 'bg-rose-950/25 hover:bg-rose-950/40 transition-colors';
    case 'Interested lead':
      return 'bg-amber-950/25 hover:bg-amber-950/40 transition-colors';
    case 'Ingaging':
      return 'bg-sky-950/25 hover:bg-sky-950/40 transition-colors';
    case 'Cold reply':
      return 'bg-slate-900/40 hover:bg-slate-900/60 transition-colors';
    case 'Not interested':
      return 'bg-slate-950/20 hover:bg-slate-950/35 opacity-75 hover:opacity-100 transition-colors';
    default:
      return 'hover:bg-bg-secondary/50 transition-colors';
  }
}

export function getPriorityFirstCellBorder(priority: unknown): string {
  const p = normalizePriority(priority);
  switch (p) {
    case 'Lead':
      return 'border-l-4 border-l-rose-500';
    case 'Interested lead':
      return 'border-l-4 border-l-amber-500';
    case 'Ingaging':
      return 'border-l-4 border-l-sky-500';
    case 'Cold reply':
      return 'border-l-4 border-l-amber-500/60';
    case 'Not interested':
      return 'border-l-4 border-l-slate-600';
    default:
      return 'border-l-4 border-l-transparent';
  }
}

export function PriorityBadge({ priority, compact = false, size = 'md' }: { priority: unknown; compact?: boolean; size?: 'xs' | 'sm' | 'md' }) {
  const p = normalizePriority(priority);
  const toneMap: Record<PriorityOption, Tone> = {
    'Lead': 'error',
    'Interested lead': 'warning',
    'Ingaging': 'info',
    'Cold reply': 'accent',
    'Not interested': 'default',
  };
  return (
    <Badge tone={toneMap[p] ?? 'default'} size={size}>
      {p}
    </Badge>
  );
}

export function getContactStatusTone(status: string | undefined): Tone {
  switch (status) {
    case 'Active Relationship':
    case 'Active':
      return 'success';
    case 'Meeting':
      return 'info';
    case 'Replied':
      return 'warning';
    case 'Contacted':
      return 'accent';
    case 'Not Contacted':
    case 'Inactive':
    default:
      return 'default';
  }
}

export function ContactStatusBadge({ status }: { status: string | undefined }) {
  const displayStatus = status || 'Not Contacted';
  return <Badge tone={getContactStatusTone(displayStatus)}>{displayStatus}</Badge>;
}
