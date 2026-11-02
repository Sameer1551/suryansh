import { type ReactNode } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export function SearchInput({ placeholder = 'Search...', className = '', ...props }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      <input
        className="input-base pl-9"
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-text-muted mb-3">{icon}</div>}
      <h3 className="text-sm font-heading font-semibold text-text-primary">{title}</h3>
      {description && <p className="text-xs text-text-secondary mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
}

export function SectionTitle({ children, className = '' }: SectionTitleProps) {
  return (
    <h2 className={`text-xl font-heading font-semibold tracking-tight text-text-primary ${className}`}>
      {children}
    </h2>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 ${className}`}>
      <div>
        <h1 className="text-lg sm:text-xl font-heading font-bold tracking-tight text-text-primary leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-text-secondary mt-0.5 leading-normal">{subtitle}</p>}
      </div>
      {action && (
        <div className="flex items-center gap-2 shrink-0 [&_button]:text-xs [&_button]:py-1.5 [&_button]:px-3 [&_button]:h-8 [&_button]:rounded-md [&_button]:gap-1.5 [&_svg]:size-3.5 [&_select]:text-xs [&_select]:py-1 [&_select]:h-8">
          {action}
        </div>
      )}
    </div>
  );
}
