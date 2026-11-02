import {
  Building2, Users, Star, UserPlus, Send, ThumbsUp,
  CalendarClock, AlertCircle, Target, CalendarDays,
} from 'lucide-react';
import { KpiCard, PrioritySection, PriorityPill } from './components';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, normalizePriority } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionTitle } from '@/components/ui/Common';
import { type ViewId } from '@/components/navigation';
import { useData } from '@/store/DataContext';

interface Props {
  onNavigate: (id: ViewId) => void;
}

export function OverviewView({ onNavigate }: Props) {
  const {
    organisations,
    contacts,
    outreach,
    followUps,
    opportunities,
    activity,
  } = useData();

  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();

  const leadContacts = contacts.filter((c) => normalizePriority(c.contactPriority) === 'Lead').length;
  const newThisMonth = contacts.filter((c) => {
    if (!c.dateAdded) return false;
    const d = new Date(c.dateAdded);
    return !isNaN(d.getTime()) && d.getMonth() === curMonth && d.getFullYear() === curYear;
  }).length;
  const curMonthPrefix = `${curYear}-${String(curMonth + 1).padStart(2, '0')}`;
  const outreachThisMonth = outreach.filter((o) => o.date && (o.date.startsWith(curMonthPrefix) || o.date.startsWith('2026-10'))).length;
  const positiveResponses = outreach.filter((o) => o.responseSentiment === 'Positive').length;
  const dueToday = followUps.filter((f) => f.category === 'Due Today' || f.alertStatus === 'DUE TODAY');
  const overdue = followUps.filter((f) => f.category === 'Overdue' || f.alertStatus === 'OVERDUE');
  const activeOpps = opportunities.filter((o) => !['Lost', 'Confirmed'].includes(o.stage));
  const completedOpps = opportunities.filter((o) => o.outcome === 'Won');

  const kpis = [
    { label: 'Organisations', value: organisations.length, icon: <Building2 size={18} /> },
    { label: 'Contacts', value: contacts.length, icon: <Users size={18} /> },
    { label: 'Lead Contacts', value: leadContacts, tone: 'accent' as const, icon: <Star size={18} /> },
    { label: 'New This Month', value: newThisMonth, icon: <UserPlus size={18} /> },
    { label: 'Outreach This Month', value: outreachThisMonth, icon: <Send size={18} /> },
    { label: 'Positive Responses', value: positiveResponses, tone: 'success' as const, icon: <ThumbsUp size={18} /> },
    { label: 'Follow-ups Due Today', value: dueToday.length, tone: 'warning' as const, icon: <CalendarClock size={18} /> },
    { label: 'Overdue Follow-ups', value: overdue.length, tone: 'error' as const, icon: <AlertCircle size={18} /> },
    { label: 'Active Opportunities', value: activeOpps.length, icon: <Target size={18} /> },
    { label: 'Meetings Scheduled', value: 2, tone: 'accent' as const, icon: <CalendarDays size={18} /> },
  ];

  const quickActions = [
    { label: 'Add Contact', view: 'contacts' as ViewId },
    { label: 'Add Organisation', view: 'organisations' as ViewId },
    { label: 'Record Outreach', view: 'outreach' as ViewId },
    { label: 'Schedule Follow-up', view: 'followups' as ViewId },
    { label: 'Add Opportunity', view: 'opportunities' as ViewId },
    { label: 'Add Research', view: 'research' as ViewId },
  ];

  const stages = ['Enquiry', 'Discussion', 'Brief Received', 'Negotiation', 'Confirmed', 'On Hold', 'Lost'] as const;
  const pipeline = stages.map((stage) => ({
    stage,
    count: opportunities.filter((o) => o.stage === stage).length,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Priorities */}
        <Card className="lg:col-span-1">
          <CardHeader title="Today's Priorities" subtitle="What needs attention" />
          <div className="px-5 pb-5 space-y-4">
            <PrioritySection
              label="Overdue Follow-ups"
              count={overdue.length}
              tone="error"
              items={overdue.map((f) => ({
                name: f.contactName,
                detail: f.reason,
                date: f.scheduledDate,
              }))}
              onViewAll={() => onNavigate('followups')}
            />
            <PrioritySection
              label="Due Today"
              count={dueToday.length}
              tone="warning"
              items={dueToday.map((f) => ({
                name: f.contactName,
                detail: f.reason,
                date: f.scheduledDate,
              }))}
              onViewAll={() => onNavigate('followups')}
            />
            <PrioritySection
              label="Pending Outreach"
              count={outreach.filter((o) => !o.responseReceived).length}
              tone="info"
              items={outreach.filter((o) => !o.responseReceived).slice(0, 3).map((o) => ({
                name: o.contactName,
                detail: `${o.channel} · ${o.type}`,
                date: o.date,
              }))}
              onViewAll={() => onNavigate('outreach')}
            />
            <PrioritySection
              label="Upcoming Meetings"
              count={2}
              tone="success"
              items={[
                { name: 'Priya Nair — Northwind', detail: 'Nike shoot confirmation', date: 'Nov 02' },
                { name: 'Sara Colaco — Kepler', detail: 'Intro call', date: 'Nov 02' },
              ]}
            />
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader title="Recent Activity" subtitle="Last actions across the workspace" />
          <div className="px-5 pb-5">
            <div className="space-y-0">
              {activity.slice(0, 7).map((act, i) => (
                <div key={act.id} className="flex gap-3 py-2.5">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-accent/60 mt-1.5 shrink-0" />
                    {i < 6 && <div className="w-px flex-1 bg-border-subtle mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <p className="text-sm text-text-primary leading-snug">{act.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xs text-text-muted">{act.actor}</span>
                      <span className="text-2xs text-text-muted">·</span>
                      <span className="text-2xs text-text-muted">{formatTime(act.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Outreach Performance */}
        <Card className="lg:col-span-1">
          <CardHeader title="Outreach Performance" subtitle="This month" />
          <div className="px-5 pb-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total Outreach" value={outreachThisMonth} />
              <Stat label="Responses" value={outreach.filter((o) => o.responseReceived).length} />
              <Stat label="Positive" value={positiveResponses} tone="success" />
              <Stat
                label="Response Rate"
                value={outreach.length > 0 ? `${Math.round((outreach.filter((o) => o.responseReceived).length / outreach.length) * 100)}%` : '0%'}
                tone="accent"
              />
            </div>
            <div className="pt-2 border-t border-border-subtle">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Portfolio Submissions</span>
                <span className="text-text-primary font-medium">{outreach.filter((o) => o.portfolioSent).length}</span>
              </div>
              <div className="mt-2 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{
                    width: `${outreach.length > 0 ? Math.min(100, Math.round((outreach.filter((o) => o.portfolioSent).length / outreach.length) * 100)) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Opportunity Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Opportunity Pipeline"
            subtitle={`${activeOpps.length} active · ${completedOpps.length} won`}
            action={<Button size="sm" variant="ghost" onClick={() => onNavigate('opportunities')}>View Pipeline</Button>}
          />
          <div className="px-5 pb-5">
            <div className="grid grid-cols-7 gap-2">
              {pipeline.map((p) => (
                <div key={p.stage} className="text-center">
                  <div className="relative h-28 bg-bg-secondary/50 rounded-lg flex items-end overflow-hidden border border-border-subtle">
                    <div
                      className="w-full bg-accent/20 border-t border-accent/40 transition-all duration-300"
                      style={{ height: `${Math.max(p.count * 28, 4)}px` }}
                    >
                      <div className="flex items-center justify-center h-full">
                        <span className="text-sm font-heading font-bold text-accent">{p.count}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-2xs font-medium uppercase tracking-wider text-text-muted mt-1.5 leading-tight">{p.stage}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader title="Quick Actions" />
          <div className="px-5 pb-5">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => onNavigate(action.view)}
                  className="flex items-center justify-center px-3 py-3 rounded-lg bg-bg-secondary/50 border border-border-subtle text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card hover:border-border transition-all duration-150"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Contacts */}
      <Card>
        <CardHeader
          title="Recent Contacts"
          subtitle="Recently added to the workspace"
          action={<Button size="sm" variant="ghost" onClick={() => onNavigate('contacts')}>View All</Button>}
        />
        <div className="px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {contacts.slice(0, 4).map((contact) => (
              <button
                key={contact.id}
                onClick={() => onNavigate('contacts')}
                className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary/40 border border-border-subtle hover:bg-bg-card hover:border-border transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-sm font-heading font-semibold text-accent shrink-0">
                  {contact.firstName[0]}{contact.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-text-primary truncate">{contact.fullName}</div>
                  <div className="text-2xs text-text-secondary truncate">{contact.designation}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <PriorityPill priority={contact.contactPriority} />
                    <span className="text-2xs text-text-muted truncate">{contact.organisationName}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone = 'default' }: { label: string; value: string | number; tone?: 'default' | 'success' | 'accent' }) {
  const color = tone === 'success' ? 'text-status-success' : tone === 'accent' ? 'text-accent' : 'text-text-primary';
  return (
    <div className="bg-bg-secondary/40 rounded-lg p-3 border border-border-subtle">
      <div className="text-2xs font-medium uppercase tracking-wider text-text-muted">{label}</div>
      <div className={`text-xl font-heading font-bold mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date('2026-10-30');
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
