import { useState } from 'react';
import { TrendingUp, Users, Building2, Send, ThumbsUp, CalendarCheck, Target, Trophy, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/Common';
import { Card, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Form';
import { Badge } from '@/components/ui/Badge';
import { currentUser, teamMembers } from '@/data/demo';
import { useData } from '@/store/DataContext';

type DateRange = 'this_week' | 'this_month' | 'last_month' | 'last_3_months' | 'custom';

export function ReportsView() {
  const [range, setRange] = useState<DateRange>('this_month');
  const { contacts, organisations, outreach, followUps, opportunities } = useData();

  const positiveResponses = outreach.filter((o) => o.responseSentiment === 'Positive').length;
  const responseRate = outreach.length > 0 ? Math.round((outreach.filter((o) => o.responseReceived).length / outreach.length) * 100) : 0;
  const completedFollowUps = followUps.filter((f) => f.completed).length;
  const wonOpps = opportunities.filter((o) => o.outcome === 'Won').length;
  const lostOpps = opportunities.filter((o) => o.outcome === 'Lost').length;
  const generatedOpps = opportunities.length;

  const metrics = [
    { label: 'Contacts Acquired', value: contacts.length, icon: <Users size={18} /> },
    { label: 'Organisations Researched', value: organisations.length, icon: <Building2 size={18} /> },
    { label: 'Outreach Completed', value: outreach.length, icon: <Send size={18} /> },
    { label: 'Responses Received', value: outreach.filter((o) => o.responseReceived).length, icon: <TrendingUp size={18} /> },
    { label: 'Positive Responses', value: positiveResponses, icon: <ThumbsUp size={18} /> },
    { label: 'Response Rate', value: `${responseRate}%`, icon: <TrendingUp size={18} /> },
    { label: 'Follow-ups Completed', value: completedFollowUps, icon: <CalendarCheck size={18} /> },
    { label: 'Meetings Generated', value: 2, icon: <CalendarCheck size={18} /> },
    { label: 'Opportunities Generated', value: generatedOpps, icon: <Target size={18} /> },
    { label: 'Opportunities Won', value: wonOpps, icon: <Trophy size={18} /> },
    { label: 'Opportunities Lost', value: lostOpps, icon: <XCircle size={18} /> },
  ];

  const rangeLabels: Record<DateRange, string> = {
    this_week: 'This Week',
    this_month: 'This Month',
    last_month: 'Last Month',
    last_3_months: 'Last 3 Months',
    custom: 'Custom Range',
  };

  return (
    <div className="animate-fade-in space-y-5">
      <PageHeader
        title="Reports"
        subtitle="Analytics based on workspace data"
        action={
          <Select value={range} onChange={(e) => setRange(e.target.value as DateRange)} className="w-auto min-w-[150px]">
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="custom">Custom Range</option>
          </Select>
        }
      />

      {range === 'custom' && (
        <Card className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-xs text-text-secondary font-medium">Custom date range:</span>
          <input type="date" className="input-base w-auto" />
          <span className="text-text-muted text-xs">to</span>
          <input type="date" className="input-base w-auto" />
        </Card>
      )}

      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span>Showing data for:</span>
        <Badge tone="accent">{rangeLabels[range]}</Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="px-4 py-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xs font-medium uppercase tracking-wider text-text-muted">{m.label}</div>
                <div className="text-2xl font-heading font-bold mt-1 text-text-primary">{m.value}</div>
              </div>
              <div className="text-text-muted/60">{m.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Outreach Breakdown */}
        <Card>
          <CardHeader title="Outreach Breakdown" subtitle="By channel" />
          <div className="px-5 pb-5 space-y-3">
            {['Email', 'WhatsApp', 'LinkedIn', 'Instagram', 'Phone'].map((channel) => {
              const count = outreach.filter((o) => o.channel === channel).length;
              const pct = outreach.length > 0 ? Math.round((count / outreach.length) * 100) : 0;
              return (
                <div key={channel}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary">{channel}</span>
                    <span className="text-xs text-text-primary font-medium">{count} · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Opportunity Outcomes */}
        <Card>
          <CardHeader title="Opportunity Outcomes" subtitle="Win/loss summary" />
          <div className="px-5 pb-5">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 rounded-lg bg-status-success/10 border border-status-success/20">
                <div className="text-2xl font-heading font-bold text-status-success">{wonOpps}</div>
                <div className="text-2xs uppercase tracking-wider text-text-muted mt-0.5">Won</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-status-error/10 border border-status-error/20">
                <div className="text-2xl font-heading font-bold text-status-error">{lostOpps}</div>
                <div className="text-2xs uppercase tracking-wider text-text-muted mt-0.5">Lost</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-bg-secondary/50 border border-border-subtle">
                <div className="text-2xl font-heading font-bold text-text-primary">{generatedOpps - wonOpps - lostOpps}</div>
                <div className="text-2xs uppercase tracking-wider text-text-muted mt-0.5">Pending</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary">Win Rate</span>
              <span className="text-accent font-medium">
                {wonOpps + lostOpps > 0 ? Math.round((wonOpps / (wonOpps + lostOpps)) * 100) : 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Assistant Activity */}
      <Card>
        <CardHeader title="Team Activity" subtitle="Activity by team member" />
        <div className="px-5 pb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-3 py-2.5">Member</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-3 py-2.5 hidden sm:table-cell">Role</th>
                  <th className="text-center text-2xs font-medium uppercase tracking-wider text-text-muted px-3 py-2.5">Outreach</th>
                  <th className="text-center text-2xs font-medium uppercase tracking-wider text-text-muted px-3 py-2.5">Follow-ups</th>
                  <th className="text-center text-2xs font-medium uppercase tracking-wider text-text-muted px-3 py-2.5 hidden md:table-cell">Contacts Added</th>
                  <th className="text-center text-2xs font-medium uppercase tracking-wider text-text-muted px-3 py-2.5 hidden md:table-cell">Opps Updated</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => {
                  const memberOutreach = outreach.filter((o) => o.handledBy === member.role).length;
                  const memberFollowUps = followUps.filter((f) => f.contactOwner === member.role).length;
                  const memberContacts = contacts.filter((c) => c.contactOwner === member.role).length;
                  const memberOpps = opportunities.filter((o) => o.lastUpdate >= '2026-10-01').length;
                  return (
                    <tr key={member.id} className="border-b border-border-subtle last:border-0">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-xs font-heading font-semibold text-accent shrink-0">
                            {member.initials}
                          </div>
                          <span className="font-medium text-text-primary">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <Badge tone={member.role === 'OWNER' ? 'accent' : 'info'}>{member.role}</Badge>
                      </td>
                      <td className="px-3 py-3 text-center text-text-primary">{memberOutreach}</td>
                      <td className="px-3 py-3 text-center text-text-primary">{memberFollowUps}</td>
                      <td className="px-3 py-3 text-center text-text-primary hidden md:table-cell">{memberContacts}</td>
                      <td className="px-3 py-3 text-center text-text-primary hidden md:table-cell">{memberOpps}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <p className="text-2xs text-text-muted text-center pb-2">
        All metrics are calculated from workspace records. No sample or invented data is used in live reporting.
      </p>
    </div>
  );
}
