import { useState, useMemo } from 'react';

export const QUICK_DATE_PRESETS = [
  { id: '1w', label: '+1W', days: 7, months: 0, years: 0 },
  { id: '2w', label: '+2W', days: 14, months: 0, years: 0 },
  { id: '1m', label: '+1M', days: 0, months: 1, years: 0 },
  { id: '3m', label: '+3M', days: 0, months: 3, years: 0 },
  { id: '4m', label: '+4M', days: 0, months: 4, years: 0 },
  { id: '6m', label: '+6M', days: 0, months: 6, years: 0 },
  { id: '9m', label: '+9M', days: 0, months: 9, years: 0 },
  { id: '1y', label: '+1Y', days: 0, months: 0, years: 1 },
] as const;

export function calculateDateOffset(baseDate: Date, months = 0, years = 0, days = 0): string {
  const d = new Date(baseDate.getTime());
  if (days) {
    d.setDate(d.getDate() + days);
  }
  const totalMonths = (months || 0) + (years || 0) * 12;
  if (totalMonths !== 0) {
    const curDay = d.getDate();
    d.setMonth(d.getMonth() + totalMonths);
    if (d.getDate() !== curDay && d.getDate() < 4) {
      d.setDate(0);
    }
  }
  return d.toISOString().slice(0, 10);
}

export interface QuickDateIntervalsProps {
  value?: string;
  onChange: (date: string) => void;
  className?: string;
  baseDate?: string;
}

export function QuickDateIntervals({ value, onChange, className = '', baseDate }: QuickDateIntervalsProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customMonths, setCustomMonths] = useState('');
  const [customYears, setCustomYears] = useState('');

  const today = useMemo(() => {
    if (baseDate) {
      const parsed = new Date(baseDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  }, [baseDate]);

  const previewDate = useMemo(() => {
    const m = parseInt(customMonths, 10) || 0;
    const y = parseInt(customYears, 10) || 0;
    if (m === 0 && y === 0) return null;
    return calculateDateOffset(today, m, y, 0);
  }, [customMonths, customYears, today]);

  const handleApplyPreset = (preset: typeof QUICK_DATE_PRESETS[number]) => {
    const nextDate = calculateDateOffset(today, preset.months, preset.years, preset.days);
    onChange(nextDate);
  };

  const handleSetCustomReminder = () => {
    if (previewDate) {
      onChange(previewDate);
      setShowCustom(false);
    }
  };

  const hasCustomInput = Boolean(previewDate);

  return (
    <div className={`mt-1.5 ${className}`}>
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-2xs text-text-muted">Quick:</span>
        {QUICK_DATE_PRESETS.map((preset) => {
          const presetDate = calculateDateOffset(today, preset.months, preset.years, preset.days);
          const isSelected = value === presetDate;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className={`px-1.5 py-0.5 text-2xs rounded border transition-colors ${
                isSelected
                  ? 'border-accent text-accent bg-accent/15 font-semibold'
                  : 'border-border-subtle bg-bg-secondary/40 text-text-muted hover:text-accent hover:bg-bg-secondary'
              }`}
              title={`Set to ${presetDate}`}
            >
              {preset.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className={`px-1.5 py-0.5 text-2xs rounded border transition-colors ${
            showCustom
              ? 'border-accent text-accent bg-accent/15 font-semibold'
              : 'border-border-subtle bg-bg-secondary/40 text-text-muted hover:text-accent hover:bg-bg-secondary'
          }`}
          title="Custom months/years reminder"
        >
          {showCustom ? '▲ Custom' : '▼ Custom'}
        </button>
      </div>

      {showCustom && (
        <div className="mt-1.5 p-2 rounded-md bg-bg-secondary/80 border border-border-subtle space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-between text-2xs text-text-muted">
            <span className="font-medium uppercase tracking-wider">Set Custom Reminder</span>
            {previewDate && (
              <span className="text-accent font-medium">Target: {previewDate}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 flex-1">
              <input
                type="number"
                min="0"
                max="120"
                placeholder="0"
                value={customMonths}
                onChange={(e) => setCustomMonths(e.target.value)}
                className="input-base w-full text-xs py-1 px-1.5 text-center"
              />
              <span className="text-2xs text-text-secondary whitespace-nowrap">Months</span>
            </div>
            <div className="flex items-center gap-1 flex-1">
              <input
                type="number"
                min="0"
                max="30"
                placeholder="0"
                value={customYears}
                onChange={(e) => setCustomYears(e.target.value)}
                className="input-base w-full text-xs py-1 px-1.5 text-center"
              />
              <span className="text-2xs text-text-secondary whitespace-nowrap">Years</span>
            </div>
            <button
              type="button"
              onClick={handleSetCustomReminder}
              disabled={!hasCustomInput}
              className={`px-2 py-1 text-2xs font-semibold rounded shrink-0 transition-all ${
                hasCustomInput
                  ? 'bg-accent text-accent-contrast hover:bg-accent-hover shadow-sm active:scale-95'
                  : 'bg-bg-secondary text-text-muted border border-border-subtle cursor-not-allowed opacity-50'
              }`}
            >
              Set Reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
