import { useState } from 'react';
import { Plus, Calendar, List, Download, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/ui/Common';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, Select, Input, Textarea, Checkbox, QuickDateIntervals } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { exportToCsv } from '@/utils/exportCsv';
import { type FollowUp, type FollowUpStatus, type Channel } from '@/types';

export function addIntervalToDate(baseDateStr: string | undefined, interval: '1w' | '2w' | '1m' | '3m' | '6m'): string {
  const base = baseDateStr ? new Date(baseDateStr) : new Date();
  const d = isNaN(base.getTime()) ? new Date() : new Date(base);
  if (interval === '1w') {
    d.setDate(d.getDate() + 7);
  } else if (interval === '2w') {
    d.setDate(d.getDate() + 14);
  } else if (interval === '1m') {
    d.setMonth(d.getMonth() + 1);
  } else if (interval === '3m') {
    d.setMonth(d.getMonth() + 3);
  } else if (interval === '6m') {
    d.setMonth(d.getMonth() + 6);
  }
  return d.toISOString().slice(0, 10);
}

function computeAlert(scheduledDate: string, status: FollowUpStatus): string {
  if (status === 'Completed') return 'COMPLETED';
  if (status === 'Cancelled') return 'CANCELLED';
  if (!scheduledDate) return 'UPCOMING';
  const today = new Date().toISOString().slice(0, 10);
  if (scheduledDate < today) return 'OVERDUE';
  if (scheduledDate === today) return 'DUE TODAY';
  return 'UPCOMING';
}

export function FollowUpsView() {
  const { followUps, dispatch, addActivity } = useData();
  const [mode, setMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FollowUp | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<FollowUp | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const filtered = followUps.filter((f) => {
    if (statusFilter === 'All') return true;
    const alert = f.alertStatus || computeAlert(f.scheduledDate, f.status || 'Pending');
    if (statusFilter === 'Overdue') return alert === 'OVERDUE';
    if (statusFilter === 'Due Today') return alert === 'DUE TODAY';
    if (statusFilter === 'Upcoming') return alert === 'UPCOMING';
    if (statusFilter === 'Completed') return f.status === 'Completed' || alert === 'COMPLETED';
    if (statusFilter === 'Snoozed') return f.status === 'Snoozed';
    return f.status === statusFilter;
  });

  const handleExport = () => {
    exportToCsv(
      'followups',
      filtered.map((f) => ({
        ID: f.id,
        ContactID: f.contactId,
        Contact: f.contactName,
        Organisation: f.organisationName,
        PreviousContactDate: f.previousContactDate,
        PreviousSummary: f.previousCommunicationSummary,
        FollowUpNumber: f.followUpNumber,
        FollowUpDate: f.scheduledDate,
        Channel: f.channel,
        Reason: f.reason,
        Status: f.status,
        ResponseReceived: f.responseReceived ? 'Yes' : 'No',
        ResponseSummary: f.responseSummary,
        NextFollowUpDate: f.nextFollowUpDate,
        AssignedTo: f.assignedTo,
        AlertStatus: f.alertStatus || computeAlert(f.scheduledDate, f.status),
        Notes: f.notes,
      }))
    );
  };

  const filterTabs = ['All', 'Due Today', 'Overdue', 'Upcoming', 'Completed', 'Snoozed'];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Follow-ups"
        subtitle={`${followUps.length} follow-ups in database`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<Download size={16} />} onClick={handleExport}>
              Export CSV
            </Button>
            <div className="flex items-center bg-bg-secondary border border-border rounded-lg p-0.5">
              <button
                onClick={() => setMode('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  mode === 'list' ? 'bg-bg-card text-text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <List size={14} /> List
              </button>
              <button
                onClick={() => setMode('calendar')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  mode === 'calendar' ? 'bg-bg-card text-text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Calendar size={14} /> Calendar
              </button>
            </div>
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
              Schedule Follow-up
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          let count = followUps.length;
          if (tab === 'Due Today') count = followUps.filter((f) => (f.alertStatus || computeAlert(f.scheduledDate, f.status)) === 'DUE TODAY').length;
          if (tab === 'Overdue') count = followUps.filter((f) => (f.alertStatus || computeAlert(f.scheduledDate, f.status)) === 'OVERDUE').length;
          if (tab === 'Upcoming') count = followUps.filter((f) => (f.alertStatus || computeAlert(f.scheduledDate, f.status)) === 'UPCOMING').length;
          if (tab === 'Completed') count = followUps.filter((f) => f.status === 'Completed').length;
          if (tab === 'Snoozed') count = followUps.filter((f) => f.status === 'Snoozed').length;

          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === tab
                  ? 'bg-bg-card text-text-primary border border-border'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {mode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {filtered.length === 0 ? (
            <Card className="col-span-full">
              <EmptyState title="No follow-ups" description="No follow-ups match the selected filter." />
            </Card>
          ) : (
            filtered.map((f) => (
              <FollowUpCard
                key={f.id}
                followUp={f}
                onDelete={() => setDeleteTarget(f)}
                onReschedule={() => {
                  setRescheduleTarget(f);
                  setRescheduleDate(f.scheduledDate);
                }}
              />
            ))
          )}
        </div>
      ) : (
        <CalendarView />
      )}

      <FollowUpAddModal open={addOpen} onClose={() => setAddOpen(false)} />

      {/* Reschedule Modal */}
      <Modal
        open={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule Follow-up"
        subtitle={rescheduleTarget ? rescheduleTarget.contactName : undefined}
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setRescheduleTarget(null)}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (!rescheduleTarget) return;
                dispatch({
                  type: 'UPDATE_FOLLOWUP',
                  payload: {
                    id: rescheduleTarget.id,
                    scheduledDate: rescheduleDate,
                    alertStatus: computeAlert(rescheduleDate, rescheduleTarget.status) as any,
                  },
                });
                setRescheduleTarget(null);
              }}
            >
              Save Date
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <Input label="New Follow-up Date" type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
            <QuickDateIntervals value={rescheduleDate} onChange={(date) => setRescheduleDate(date)} />
          </div>
        </div>
      </Modal>

      {/* Compact Delete Confirmation Modal (Always visible, no scrolling needed) */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Follow-up"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={13} />}
              onClick={async () => {
                if (!deleteTarget) return;
                const target = deleteTarget;
                setDeleteTarget(null);
                await dispatch({ type: 'DELETE_FOLLOWUP', payload: target.id });
                addActivity('followup_completed', `Follow-up with ${target.contactName} deleted`, 'Owner');
              }}
            >
              Delete Follow-up
            </Button>
          </div>
        }
      >
        <div className="space-y-2 py-1">
          <p className="text-sm text-text-primary">
            Delete follow-up with <strong className="text-accent">{deleteTarget?.contactName || 'this contact'}</strong>?
          </p>
          <p className="text-2xs text-text-muted">
            This permanently removes the follow-up from your workspace and Excel database. When you sync to Google Sheets, it will be removed from Google Sheets as well.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function FollowUpCard({
  followUp: f,
  onDelete,
  onReschedule,
}: {
  followUp: FollowUp;
  onDelete: () => void;
  onReschedule: () => void;
}) {
  const { dispatch, addActivity } = useData();
  const alert = f.alertStatus || computeAlert(f.scheduledDate, f.status || 'Pending');

  const handleComplete = () => {
    dispatch({
      type: 'UPDATE_FOLLOWUP',
      payload: { id: f.id, status: 'Completed', completed: true, alertStatus: 'COMPLETED' },
    });
    addActivity('followup_completed', `Follow-up with ${f.contactName} marked complete`, 'Assistant');
  };

  const handleSnooze = () => {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + 14);
    const dateStr = snoozeDate.toISOString().slice(0, 10);
    dispatch({
      type: 'UPDATE_FOLLOWUP',
      payload: { id: f.id, status: 'Snoozed', scheduledDate: dateStr, alertStatus: 'UPCOMING' },
    });
  };

  return (
    <Card hoverable className="p-2 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1 shrink-0">
            <Badge
              tone={
                alert === 'OVERDUE'
                  ? 'error'
                  : alert === 'DUE TODAY'
                  ? 'warning'
                  : alert === 'COMPLETED'
                  ? 'success'
                  : 'info'
              }
              size="xs"
              className="font-semibold"
            >
              {alert}
            </Badge>
            <Badge tone="default" size="xs">{f.status || 'Pending'}</Badge>
          </div>
          <div className="flex items-center gap-1 text-3xs">
            <span
              className={`font-semibold ${
                alert === 'OVERDUE'
                  ? 'text-status-error'
                  : alert === 'DUE TODAY'
                  ? 'text-status-warning'
                  : 'text-text-primary'
              }`}
            >
              {f.scheduledDate}
            </span>
            <span className="text-text-muted">· {f.channel}</span>
          </div>
        </div>

        <div>
          <div className="text-2xs font-semibold text-text-primary truncate leading-tight">{f.contactName}</div>
          <div className="text-3xs text-text-muted truncate leading-tight mt-0.5">{f.organisationName || '—'}</div>
          <p className="text-3xs text-text-secondary mt-1 line-clamp-1" title={f.reason}>{f.reason}</p>
          {(f.previousCommunicationSummary || f.notes) && (
            <p className="text-4xs text-text-muted mt-0.5 truncate italic" title={f.previousCommunicationSummary || f.notes}>
              {f.previousCommunicationSummary ? `Prev: ${f.previousCommunicationSummary}` : f.notes}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 mt-1 pt-1 border-t border-border-subtle">
        {f.status !== 'Completed' ? (
          <>
            <button
              type="button"
              onClick={handleComplete}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 text-4xs font-medium transition-colors"
              title="Mark Complete"
            >
              <CheckCircle size={10} /> Complete
            </button>
            <button
              type="button"
              onClick={handleSnooze}
              className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-bg-secondary hover:bg-border-subtle text-text-secondary text-4xs transition-colors"
              title="Snooze 14 days"
            >
              <Clock size={10} /> +14d
            </button>
            <button
              type="button"
              onClick={onReschedule}
              className="inline-flex items-center px-1 py-0.5 rounded bg-bg-secondary hover:bg-border-subtle text-text-secondary text-4xs transition-colors"
              title="Reschedule Date"
            >
              Date
            </button>
          </>
        ) : (
          <span className="text-4xs text-status-success font-medium flex items-center gap-0.5">
            <CheckCircle size={10} /> Completed
          </span>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="p-0.5 text-text-muted hover:text-status-error ml-auto rounded transition-colors"
          title="Delete Follow-up"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </Card>
  );
}

function FollowUpAddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch, genId, addActivity, contacts } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const [selectedInterval, setSelectedInterval] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [form, setForm] = useState({
    contactId: '',
    previousContactDate: '',
    previousCommunicationSummary: '',
    followUpNumber: '1' as '1' | '2' | '3' | '4+',
    scheduledDate: today,
    channel: 'Email' as Channel,
    reason: '',
    status: 'Pending' as FollowUpStatus,
    responseReceived: false,
    responseSummary: '',
    nextFollowUpDate: '',
    assignedTo: 'Assistant',
    notes: '',
  });

  const handleSubmit = () => {
    if (!form.contactId) return;
    const contact = contacts.find((c) => c.id === form.contactId);
    if (contact?.doNotContact) {
      alert('This contact is marked "Do Not Contact" and cannot be scheduled for follow-ups.');
      return;
    }

    const id = genId('FUP');
    const computedAlert = computeAlert(form.scheduledDate, form.status) as any;

    const followUp: FollowUp = {
      id,
      contactId: form.contactId,
      contactName: contact?.fullName ?? '',
      organisationName: contact?.organisationName ?? '',
      previousContactDate: form.previousContactDate,
      previousCommunicationSummary: form.previousCommunicationSummary.trim(),
      followUpNumber: form.followUpNumber,
      scheduledDate: form.scheduledDate,
      channel: form.channel,
      reason: form.reason.trim(),
      status: form.status,
      alertStatus: computedAlert,
      responseReceived: form.responseReceived,
      responseSummary: form.responseSummary.trim(),
      nextFollowUpDate: form.nextFollowUpDate,
      assignedTo: form.assignedTo,
      notes: form.notes.trim(),
      completed: form.status === 'Completed',
    };

    dispatch({ type: 'ADD_FOLLOWUP', payload: followUp });
    addActivity('org_updated', `Follow-up scheduled with ${contact?.fullName}`, form.assignedTo);
    setForm({
      contactId: '',
      previousContactDate: '',
      previousCommunicationSummary: '',
      followUpNumber: '1',
      scheduledDate: today,
      channel: 'Email',
      reason: '',
      status: 'Pending',
      responseReceived: false,
      responseSummary: '',
      nextFollowUpDate: '',
      assignedTo: 'Assistant',
      notes: '',
    });
    setSelectedInterval(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule Follow-up"
      subtitle="Schedule timely client & collaborator follow-ups"
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Schedule Follow-up</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Row 1: Contact, Channel, Reason */}
        <Select
          label="Contact *"
          value={form.contactId}
          onChange={(e) => {
            const c = contacts.find((item) => item.id === e.target.value);
            setForm({
              ...form,
              contactId: e.target.value,
              previousContactDate: c?.lastContactDate || '',
            });
          }}
        >
          <option value="">Select a contact...</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id} disabled={c.doNotContact}>
              {c.fullName} — {c.organisationName}
              {c.doNotContact ? ' (Do Not Contact)' : ''}
            </option>
          ))}
        </Select>
        <Select label="Follow-up Channel" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as Channel })}>
          <option>Email</option>
          <option>WhatsApp</option>
          <option>Instagram</option>
          <option>LinkedIn</option>
          <option>Phone</option>
          <option>In Person</option>
          <option>Other</option>
        </Select>
        <Input label="Follow-up Reason *" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Check on treatment review" />

        {/* Row 2: Follow-up Date (with intervals), Initial Status, Assigned To */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Follow-up Date *</label>
            {form.scheduledDate && (
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, scheduledDate: '' });
                  setSelectedInterval(null);
                }}
                className="text-2xs text-text-muted hover:text-status-error transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <Input
            type="date"
            value={form.scheduledDate}
            onChange={(e) => {
              setForm({ ...form, scheduledDate: e.target.value });
              setSelectedInterval(null);
            }}
          />
          <QuickDateIntervals
            value={form.scheduledDate}
            onChange={(date) => {
              setForm({ ...form, scheduledDate: date });
              setSelectedInterval(null);
            }}
          />
        </div>

        <Select label="Initial Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FollowUpStatus })}>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Snoozed">Snoozed</option>
          <option value="Cancelled">Cancelled</option>
        </Select>

        <Select label="Assigned To" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
          <option>Assistant</option>
          <option>DOP</option>
          <option>Owner</option>
        </Select>

        {/* Row 3: Follow-up Number, Next Follow-up Date (with intervals), Response Received */}
        <Select label="Follow-up Number" value={form.followUpNumber} onChange={(e) => setForm({ ...form, followUpNumber: e.target.value as any })}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4+">4+</option>
        </Select>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Next Follow-up Date</label>
            {form.nextFollowUpDate && (
              <button
                type="button"
                onClick={() => setForm({ ...form, nextFollowUpDate: '' })}
                className="text-2xs text-text-muted hover:text-status-error transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <Input
            type="date"
            value={form.nextFollowUpDate}
            onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })}
          />
          <QuickDateIntervals
            value={form.nextFollowUpDate}
            onChange={(date) => setForm({ ...form, nextFollowUpDate: date })}
            baseDate={form.scheduledDate}
          />
        </div>

        <div className="flex items-center pt-5">
          <Checkbox label="Response Received" checked={form.responseReceived} onChange={(v) => setForm({ ...form, responseReceived: v })} />
        </div>

        {/* Notes */}
        <div className="col-span-full">
          <Textarea label="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Key follow-up context or talking points..." />
        </div>

        {/* Additional Details Toggle */}
        <div className="col-span-full pt-2 border-t border-border-subtle/60 flex items-center justify-between">
          <span className="text-xs font-heading font-medium text-text-muted uppercase tracking-wider">Additional Information</span>
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {showMore ? '▲ Hide Details' : '▼ Show More (Previous Contact Date, Comm Summary, Response Summary)'}
          </button>
        </div>

        {showMore && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Previous Contact Date</label>
                <span className="text-2xs text-accent font-medium bg-accent/10 px-1.5 py-0.5 rounded">Automatic</span>
              </div>
              <Input type="date" value={form.previousContactDate} onChange={(e) => setForm({ ...form, previousContactDate: e.target.value })} />
            </div>
            <div className="col-span-full sm:col-span-2">
              <Input label="Previous Communication Summary" value={form.previousCommunicationSummary} onChange={(e) => setForm({ ...form, previousCommunicationSummary: e.target.value })} placeholder="e.g. Sent reel via email" />
            </div>
            {form.responseReceived && (
              <div className="col-span-full">
                <Input label="Response Summary" value={form.responseSummary} onChange={(e) => setForm({ ...form, responseSummary: e.target.value })} placeholder="Response details..." />
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

function CalendarView() {
  const { followUps } = useData();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getFollowUps = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return followUps.filter((f) => f.scheduledDate === dateStr);
  };

  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else setMonth(month + 1);
  };

  return (
    <Card>
      <CardHeader
        title={monthName}
        action={
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={prevMonth}>←</Button>
            <Button size="sm" variant="ghost" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}>
              Today
            </Button>
            <Button size="sm" variant="ghost" onClick={nextMonth}>→</Button>
          </div>
        }
      />
      <div className="px-5 pb-5">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-2xs font-medium uppercase tracking-wider text-text-muted py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="min-h-20 rounded-lg bg-bg-secondary/20" />;
            const dayFollowUps = getFollowUps(day);
            const isToday = isCurrentMonth && day === today.getDate();
            return (
              <div
                key={i}
                className={`min-h-20 rounded-lg border p-1.5 transition-colors ${
                  isToday
                    ? 'border-accent/40 bg-accent/5'
                    : 'border-border-subtle bg-bg-secondary/30 hover:border-border'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${isToday ? 'text-accent' : 'text-text-secondary'}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayFollowUps.slice(0, 2).map((f) => {
                    const alert = f.alertStatus || computeAlert(f.scheduledDate, f.status || 'Pending');
                    return (
                      <div
                        key={f.id}
                        className="text-2xs px-1.5 py-0.5 rounded bg-bg-card border border-border-subtle truncate"
                      >
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                            alert === 'OVERDUE'
                              ? 'bg-status-error'
                              : alert === 'DUE TODAY'
                              ? 'bg-status-warning'
                              : alert === 'COMPLETED'
                              ? 'bg-status-success'
                              : 'bg-status-info'
                          }`}
                        />
                        {f.contactName}
                      </div>
                    );
                  })}
                  {dayFollowUps.length > 2 && (
                    <div className="text-2xs text-text-muted px-1.5">+{dayFollowUps.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
