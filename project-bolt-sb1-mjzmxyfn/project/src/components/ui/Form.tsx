import { type ReactNode } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && <label className="label-base">{label}</label>}
      <input className={`input-base ${className}`} {...props} />
      {hint && <p className="text-2xs text-text-muted mt-1">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function Textarea({ label, hint, className = '', ...props }: TextareaProps) {
  return (
    <div>
      {label && <label className="label-base">{label}</label>}
      <textarea className={`input-base resize-none ${className}`} {...props} />
      {hint && <p className="text-2xs text-text-muted mt-1">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  children: ReactNode;
}

export function Select({ label, hint, className = '', children, ...props }: SelectProps) {
  return (
    <div>
      {label && <label className="label-base">{label}</label>}
      <select className={`input-base appearance-none cursor-pointer ${className}`} {...props}>
        {children}
      </select>
      {hint && <p className="text-2xs text-text-muted mt-1">{hint}</p>}
    </div>
  );
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-accent border-accent' : 'border-border group-hover:border-border-strong'}`}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="#171918" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
    </label>
  );
}
