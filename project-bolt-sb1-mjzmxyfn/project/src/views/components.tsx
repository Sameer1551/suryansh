import { type ReactNode } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, normalizePriority } from '@/components/ui/Badge';
import { type Priority } from '@/types';

interface KpiProps {
  label: string;
  value: string | number;
  tone?: 'default' | 'accent' | 'warning' | 'error' | 'success';
  delta?: string;
  icon?: ReactNode;
}

export function KpiCard({ label, value, tone = 'default', delta, icon }: KpiProps) {
  const toneColor: Record<string, string> = {
    default: 'text-text-primary',
    accent: 'text-accent',
    warning: 'text-status-warning',
    error: 'text-status-error',
    success: 'text-status-success',
  };

  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-2xs font-medium uppercase tracking-wider text-text-muted truncate">{label}</div>
          <div className={`text-2xl font-heading font-bold mt-1 tracking-tight ${toneColor[tone]}`}>{value}</div>
        </div>
        {icon && <div className="text-text-muted/60 shrink-0 ml-2">{icon}</div>}
      </div>
      {delta && (
        <div className="text-2xs text-text-secondary mt-1.5">{delta}</div>
      )}
    </Card>
  );
}

interface PriorityItemProps {
  label: string;
  count: number;
  tone?: 'warning' | 'error' | 'default' | 'info' | 'success';
  items: { name: string; detail: string; date?: string }[];
  onViewAll?: () => void;
}

export function PrioritySection({ label, count, tone = 'default', items, onViewAll }: PriorityItemProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${toneDot(tone)}`} />
          <span className="text-sm font-medium text-text-primary">{label}</span>
          {count > 0 && <Badge>{count}</Badge>}
        </div>
        {onViewAll && (
          <button onClick={onViewAll} className="text-2xs text-text-muted hover:text-accent transition-colors uppercase tracking-wider">
            View all
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-text-muted py-2">Nothing here.</p>
      ) : (
        <div className="space-y-1">
          {items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-bg-secondary/50 hover:bg-bg-secondary transition-colors">
              <div className="min-w-0">
                <div className="text-sm text-text-primary truncate">{item.name}</div>
                <div className="text-2xs text-text-secondary truncate">{item.detail}</div>
              </div>
              {item.date && <div className="text-2xs text-text-muted shrink-0 ml-2">{item.date}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function toneDot(tone: string) {
  switch (tone) {
    case 'warning': return 'bg-status-warning';
    case 'error': return 'bg-status-error';
    case 'info': return 'bg-status-info';
    case 'success': return 'bg-status-success';
    default: return 'bg-text-muted';
  }
}

export { Card, CardHeader, Badge };

export function PriorityPill({ priority }: { priority: unknown }) {
  const p = normalizePriority(priority);
  const styles: Record<string, string> = {
    'Lead': 'bg-status-error/15 text-status-error border-status-error/30',
    'Interested lead': 'bg-status-warning/15 text-status-warning border-status-warning/30',
    'Ingaging': 'bg-status-info/15 text-status-info border-status-info/30',
    'Cold reply': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Not interested': 'bg-slate-800/70 text-slate-400 border-slate-700/60',
  };
  return (
    <span className={`inline-flex items-center justify-center px-1.5 h-5 rounded text-2xs font-semibold border ${styles[p] || styles['Interested lead']}`}>
      {p}
    </span>
  );
}
