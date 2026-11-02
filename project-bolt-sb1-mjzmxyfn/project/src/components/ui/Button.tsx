import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-slate-950 font-semibold shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/35 active:scale-[0.98]',
  secondary: 'bg-bg-secondary text-text-primary border border-border hover:bg-bg-card hover:border-border-strong hover:text-white active:scale-[0.98]',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/80 active:scale-[0.98]',
  danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 active:scale-[0.98]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-md',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-lg',
  lg: 'text-sm px-5 py-3 gap-2 rounded-lg',
};

export function Button({ variant = 'secondary', size = 'md', icon, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
