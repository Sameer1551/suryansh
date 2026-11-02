import { type ReactNode, useState, useEffect, useRef } from 'react';
import { Clapperboard, ChevronLeft, FileSpreadsheet, CheckCircle2, AlertTriangle, RefreshCw, Bell, Check, Calendar, ArrowRight, X, Clock, Sparkles } from 'lucide-react';
import { navItems, type ViewId } from './navigation';
import { useData } from '@/store/DataContext';

interface SidebarProps {
  active: ViewId;
  onNavigate: (id: ViewId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout?: () => void;
}

export function Sidebar({ active, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-bg-secondary border-r border-border-subtle transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-3.5 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-md shadow-amber-500/20 border border-amber-500/40 flex items-center justify-center bg-slate-950">
            <img src="/logo.jpg" alt="Suryansh.dp" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-semibold text-text-primary text-sm tracking-tight">
                Suryansh.<span className="text-xs font-medium text-text-secondary">dp</span>
              </div>
              <div className="text-3xs text-text-muted uppercase tracking-wider">
                Workspace
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10 font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card/60 border border-transparent'
                }`}
              >
                <span className={`shrink-0 transition-colors ${isActive ? 'text-amber-400' : 'text-text-muted group-hover:text-text-secondary'}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-18 w-6 h-6 rounded-full bg-bg-card border border-border flex items-center justify-center hover:border-border-strong transition-colors z-10"
      >
        <ChevronLeft size={14} className={`text-text-secondary transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </button>
    </aside>
  );
}

export function Topbar({
  onQuickAdd,
  onGlobalSearch,
  onNavigate,
}: {
  onQuickAdd: () => void;
  onGlobalSearch: (v: string) => void;
  onNavigate?: (v: ViewId) => void;
}) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const todayStr = new Date().toISOString().slice(0, 10);
  const { syncStatus, isFileLocked, lastSyncError, refreshData, followUps, activity, dispatch, addActivity } = useData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'activity'>('alerts');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  // Compute urgent alerts from real follow-ups
  const urgentFollowUps = followUps.filter((f) => {
    if (f.status === 'Completed' || f.status === 'Cancelled') return false;
    if (!f.scheduledDate) return false;
    return f.scheduledDate <= todayStr || f.alertStatus === 'OVERDUE' || f.alertStatus === 'DUE TODAY';
  });

  const alertCount = urgentFollowUps.length;

  const handleMarkDone = (e: React.MouseEvent, fId: string, contactName: string) => {
    e.stopPropagation();
    dispatch({
      type: 'UPDATE_FOLLOWUP',
      payload: { id: fId, status: 'Completed' },
    });
    addActivity('followup_completed', `Completed follow-up with ${contactName}`, 'Owner');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-bg-primary/85 backdrop-blur-md border-b border-border-subtle flex items-center justify-between gap-3 px-4 sm:px-6">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search contacts, organisations, opportunities..."
            onChange={(e) => onGlobalSearch(e.target.value)}
            className="w-full h-9 bg-bg-secondary border border-border rounded-lg pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:bg-bg-card focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Excel Sync Status Indicator */}
        <button
          onClick={() => refreshData()}
          title={lastSyncError || (isFileLocked ? 'File is open in Excel with exclusive lock. Click to retry.' : 'Excel connected. Click to refresh.')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            isFileLocked
              ? 'bg-status-error/15 text-status-error border-status-error/30 animate-pulse'
              : syncStatus === 'saving'
              ? 'bg-status-warning/15 text-status-warning border-status-warning/30'
              : syncStatus === 'error'
              ? 'bg-status-error/15 text-status-error border-status-error/30'
              : 'bg-bg-secondary/60 text-text-secondary border-border-subtle hover:text-text-primary hover:border-border'
          }`}
        >
          {isFileLocked ? (
            <>
              <AlertTriangle size={14} className="text-status-error shrink-0" />
              <span className="hidden md:inline">File Locked in Excel</span>
            </>
          ) : syncStatus === 'saving' ? (
            <>
              <RefreshCw size={14} className="text-status-warning shrink-0 animate-spin" />
              <span className="hidden md:inline">Saving to Excel...</span>
            </>
          ) : syncStatus === 'error' ? (
            <>
              <AlertTriangle size={14} className="text-status-error shrink-0" />
              <span className="hidden md:inline">Sync Error</span>
            </>
          ) : (
            <>
              <FileSpreadsheet size={14} className="text-status-success shrink-0" />
              <span className="hidden md:inline">Excel Synced</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:block text-xs text-text-secondary font-medium">
            <span className="text-text-muted">Today · </span>
            {today}
          </div>

          {/* Active Notifications Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className={`relative p-2 rounded-lg transition-all ${
                showNotifications
                  ? 'bg-bg-card text-accent border border-border-strong shadow-md'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary border border-transparent'
              }`}
              title={alertCount > 0 ? `${alertCount} urgent follow-ups need attention` : 'Notifications'}
              aria-label="Notifications"
            >
              <Bell size={18} className={alertCount > 0 ? 'text-amber-400' : 'text-text-secondary'} />
              {alertCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-rose-500/50 animate-pulse">
                  {alertCount}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              )}
            </button>

            {/* Notification Flyout Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-bg-card/95 border border-border-strong rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="p-3.5 border-b border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-heading font-semibold text-text-primary">Notifications</h4>
                    {alertCount > 0 ? (
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        {alertCount} Actionable
                      </span>
                    ) : (
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Check size={10} /> Up to date
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border-subtle text-xs bg-bg-secondary/40">
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className={`flex-1 py-2 font-medium text-center transition-colors border-b-2 ${
                      activeTab === 'alerts'
                        ? 'border-amber-500 text-amber-400 bg-amber-500/5 font-semibold'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Follow-ups ({alertCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`flex-1 py-2 font-medium text-center transition-colors border-b-2 ${
                      activeTab === 'activity'
                        ? 'border-amber-500 text-amber-400 bg-amber-500/5 font-semibold'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Recent Activity
                  </button>
                </div>

                {/* Body Content */}
                <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle/50">
                  {activeTab === 'alerts' ? (
                    urgentFollowUps.length === 0 ? (
                      <div className="p-6 text-center text-text-muted space-y-1">
                        <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                          <CheckCircle2 size={20} />
                        </div>
                        <p className="text-xs font-medium text-text-primary">All caught up!</p>
                        <p className="text-2xs">No follow-ups due or overdue right now.</p>
                      </div>
                    ) : (
                      urgentFollowUps.map((f) => {
                        const isOverdue = (f.scheduledDate && f.scheduledDate < todayStr) || f.alertStatus === 'OVERDUE';
                        return (
                          <div
                            key={f.id}
                            onClick={() => {
                              onNavigate?.('followups');
                              setShowNotifications(false);
                            }}
                            className="p-3 hover:bg-bg-hover/60 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                      isOverdue
                                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    }`}
                                  >
                                    {isOverdue ? 'Overdue' : 'Due Today'}
                                  </span>
                                  <span className="text-xs font-semibold text-text-primary truncate">
                                    {f.contactName || f.organisationName}
                                  </span>
                                </div>
                                <p className="text-xs text-text-secondary mt-1 line-clamp-1">{f.reason}</p>
                                <div className="flex items-center gap-2 mt-1.5 text-2xs text-text-muted">
                                  <span>{f.channel}</span>
                                  <span>·</span>
                                  <span>{f.scheduledDate}</span>
                                  {f.organisationName && (
                                    <>
                                      <span>·</span>
                                      <span className="truncate">{f.organisationName}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleMarkDone(e, f.id, f.contactName || f.organisationName)}
                                title="Mark completed"
                                className="px-2 py-1 text-2xs font-medium rounded-md bg-bg-secondary text-text-secondary hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 border border-border transition-colors flex items-center gap-1 shrink-0"
                              >
                                <Check size={12} />
                                <span>Done</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )
                  ) : (
                    activity.length === 0 ? (
                      <div className="p-6 text-center text-text-muted text-xs">No recent activity recorded yet.</div>
                    ) : (
                      activity.slice(0, 8).map((act) => (
                        <div key={act.id} className="p-3 hover:bg-bg-hover/40 transition-colors">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                              <Clock size={12} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-text-primary">{act.description}</p>
                              <div className="flex items-center gap-1.5 text-2xs text-text-muted mt-0.5">
                                <span>{act.actor}</span>
                                <span>·</span>
                                <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>

                {/* Footer */}
                <div className="p-2.5 bg-bg-secondary/60 border-t border-border-subtle flex items-center justify-between">
                  <button
                    onClick={() => {
                      onNavigate?.('followups');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors px-2 py-1 rounded"
                  >
                    <span>View all Follow-ups ({followUps.length})</span>
                    <ArrowRight size={12} />
                  </button>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-2xs text-text-muted hover:text-text-primary px-2 py-1 rounded transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onQuickAdd}
            className="inline-flex items-center gap-2 h-9 px-3.5 sm:px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold rounded-lg text-sm shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all"
          >
            <PlusIcon />
            <span className="hidden sm:inline">Quick Add</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
