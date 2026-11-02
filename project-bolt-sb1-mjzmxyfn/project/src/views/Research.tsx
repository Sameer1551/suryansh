import { useState } from 'react';
import { Plus, CheckCircle2, Circle, Clock, Download, ExternalLink } from 'lucide-react';
import { PageHeader, SearchInput, EmptyState } from '@/components/ui/Common';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, PriorityBadge, normalizePriority, getPriorityRowClasses, getPriorityFirstCellBorder } from '@/components/ui/Badge';
import { Modal, Select, Input, Textarea, Checkbox, QuickDateIntervals } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { exportToCsv } from '@/utils/exportCsv';
import { type ResearchEntry, type ResearchStatus, type Priority } from '@/types';

const statusConfig: Record<ResearchStatus, { icon: React.ReactNode; tone: 'default' | 'info' | 'success' }> = {
  'Not Started': { icon: <Circle size={14} />, tone: 'default' },
  'In Progress': { icon: <Clock size={14} />, tone: 'info' },
  'Completed': { icon: <CheckCircle2 size={14} />, tone: 'success' },
};

export function ResearchView() {
  const { research, contacts, organisations, dispatch, genId, addActivity } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    name: '',
    category: '',
    discoverySource: 'LinkedIn',
    discoveryUrl: '',
    city: '',
    status: 'Not Started' as ResearchStatus,
    missingInfo: '',
    assignedTo: 'Assistant',
    priority: '2' as any,
    deadline: '',
    verified: false,
    finalContactId: '',
    finalOrganisationId: '',
    notes: '',
  });

  const filtered = research.filter((r) => {
    if (search) {
      const q = search.toLowerCase();
      if (!r.name.toLowerCase().includes(q) && !r.category.toLowerCase().includes(q) && !r.city.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    return true;
  });

  const handleExport = () => {
    exportToCsv(
      'research_queue',
      research.map((r) => ({
        ID: r.id,
        Name: r.name,
        Category: r.category,
        DiscoverySource: r.discoverySource,
        DiscoveryURL: r.discoveryUrl,
        City: r.city,
        Status: r.status,
        MissingInfo: r.missingInfo,
        AssignedTo: r.assignedTo,
        Priority: r.priority,
        DateAdded: r.dateAdded,
        Deadline: r.deadline,
        Verified: r.verified ? 'Yes' : 'No',
        FinalContactID: r.finalContactId,
        FinalOrganisationID: r.finalOrganisationId,
        Notes: r.notes,
      }))
    );
  };

  const handleAddSubmit = () => {
    if (!form.name.trim()) return;
    const id = genId('RES');

    const newEntry: ResearchEntry = {
      id,
      name: form.name.trim(),
      category: form.category.trim(),
      discoverySource: form.discoverySource.trim(),
      discoveryUrl: form.discoveryUrl.trim(),
      city: form.city.trim(),
      status: form.status,
      missingInfo: form.missingInfo.trim(),
      assignedTo: form.assignedTo,
      priority: form.priority,
      dateAdded: today,
      deadline: form.deadline,
      verified: form.verified,
      finalContactId: form.finalContactId.trim(),
      finalOrganisationId: form.finalOrganisationId.trim(),
      notes: form.notes.trim(),
    };

    dispatch({ type: 'ADD_RESEARCH', payload: newEntry });
    addActivity('org_updated', `Research entry added: ${newEntry.name}`, form.assignedTo);
    setForm({
      name: '',
      category: '',
      discoverySource: 'LinkedIn',
      discoveryUrl: '',
      city: '',
      status: 'Not Started',
      missingInfo: '',
      assignedTo: 'Assistant',
      priority: '2',
      deadline: '',
      verified: false,
      finalContactId: '',
      finalOrganisationId: '',
      notes: '',
    });
    setAddOpen(false);
  };

  const handleStatusChange = (entry: ResearchEntry, newStatus: ResearchStatus) => {
    dispatch({
      type: 'UPDATE_RESEARCH',
      payload: { id: entry.id, status: newStatus },
    });
    addActivity('org_updated', `${entry.name} status updated to ${newStatus}`, 'Assistant');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Research Queue"
        subtitle={`${research.length} entries · Assistant workspace (synced to Excel)`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<Download size={16} />} onClick={handleExport}>
              Export CSV
            </Button>
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
              Add Research
            </Button>
          </div>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4">
          <SearchInput
            placeholder="Search research entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-auto min-w-[140px] text-xs py-2"
          >
            <option value="All">All Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </Select>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState title="No research entries" description="Add a new research task or adjust filters." />
        ) : (
          <div className="divide-y divide-border-subtle">
            {filtered.map((r) => (
              <div
                key={r.id}
                className={`flex items-start gap-3 px-3.5 py-2.5 ${getPriorityRowClasses(r.priority)} border-l-4 ${getPriorityFirstCellBorder(r.priority)}`}
              >
                <div
                  className={`shrink-0 mt-0.5 ${
                    r.status === 'Completed'
                      ? 'text-status-success'
                      : r.status === 'In Progress'
                      ? 'text-status-info'
                      : 'text-text-muted'
                  }`}
                >
                  {statusConfig[r.status].icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="text-xs font-semibold text-text-primary leading-tight">{r.name}</div>
                    <PriorityBadge priority={r.priority} size="xs" />
                    <Badge tone={statusConfig[r.status].tone} size="xs">{r.status}</Badge>
                    {r.verified && <Badge tone="success" size="xs">Verified</Badge>}
                  </div>
                  <div className="text-3xs text-text-muted mt-0.5 leading-tight">
                    {r.id} {r.category ? `· ${r.category}` : ''} {r.city ? `· ${r.city}` : ''}
                  </div>
                  {r.missingInfo && <div className="text-3xs text-status-warning mt-0.5">Missing: {r.missingInfo}</div>}
                  {r.notes && <div className="text-3xs text-text-muted mt-0.5 line-clamp-1">{r.notes}</div>}
                  <div className="flex items-center gap-2 mt-0.5 text-4xs text-text-muted flex-wrap">
                    <span>Source: {r.discoverySource}</span>
                    {r.discoveryUrl && (
                      <>
                        <span>·</span>
                        <a
                          href={r.discoveryUrl.startsWith('http') ? r.discoveryUrl : `https://${r.discoveryUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline flex items-center gap-0.5"
                        >
                          Link <ExternalLink size={8} />
                        </a>
                      </>
                    )}
                    <span>·</span>
                    <span>Added: {r.dateAdded}</span>
                    {r.deadline && (
                      <>
                        <span>·</span>
                        <span>Deadline: {r.deadline}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>By: {r.assignedTo}</span>
                    {r.finalContactId && <span>· Contact: {r.finalContactId}</span>}
                    {r.finalOrganisationId && <span>· Org: {r.finalOrganisationId}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {r.status !== 'Completed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-3xs px-2"
                      onClick={() => handleStatusChange(r, r.status === 'Not Started' ? 'In Progress' : 'Completed')}
                    >
                      {r.status === 'Not Started' ? 'Start' : 'Complete'}
                    </Button>
                  )}
                  {r.status === 'Completed' && !r.verified && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => dispatch({ type: 'UPDATE_RESEARCH', payload: { id: r.id, verified: true } })}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Research Entry"
        subtitle="Track prospective targets in research queue"
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddSubmit}>Save Entry</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Row 1: Name, Category, Priority */}
          <Input
            label="Name / Entity *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Verve Talent Agency"
          />
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. Production House, Agency"
          />
          <Select
            label="Priority"
            value={normalizePriority(form.priority)}
            onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
          >
            <option value="Lead">Lead</option>
            <option value="Interested lead">Interested lead</option>
            <option value="Ingaging">Ingaging</option>
            <option value="Cold reply">Cold reply</option>
            <option value="Not interested">Not interested</option>
          </Select>

          {/* Row 2: Discovery Source, Discovery URL, City */}
          <Select
            label="Discovery Source"
            value={form.discoverySource}
            onChange={(e) => setForm({ ...form, discoverySource: e.target.value })}
          >
            <option>LinkedIn</option>
            <option>Instagram</option>
            <option>IMDb</option>
            <option>Google</option>
            <option>YouTube</option>
            <option>Website</option>
            <option>Referral</option>
            <option>Industry Event</option>
            <option>Other</option>
          </Select>
          <Input
            label="Discovery URL"
            value={form.discoveryUrl}
            onChange={(e) => setForm({ ...form, discoveryUrl: e.target.value })}
            placeholder="https://..."
          />
          <Input
            label="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="e.g. Mumbai, London"
          />

          {/* Row 3: Initial Status, Deadline (with intervals), Assigned To */}
          <Select
            label="Initial Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as ResearchStatus })}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </Select>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Deadline</label>
              {form.deadline && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, deadline: '' })}
                  className="text-2xs text-text-muted hover:text-status-error transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
            <QuickDateIntervals
              value={form.deadline}
              onChange={(date) => setForm({ ...form, deadline: date })}
            />
          </div>

          <Select
            label="Assigned To"
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
          >
            <option>Assistant</option>
            <option>DOP</option>
            <option>Owner</option>
          </Select>

          {/* Row 4: Verified Checkbox & Notes */}
          <div className="col-span-full flex items-center py-1">
            <Checkbox
              label="Verified Record?"
              checked={form.verified}
              onChange={(v) => setForm({ ...form, verified: v })}
            />
          </div>

          <div className="col-span-full">
            <Textarea
              label="Notes"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Key intel, verified details, references..."
            />
          </div>

          {/* Additional Details Toggle */}
          <div className="col-span-full pt-2 border-t border-border-subtle/60 flex items-center justify-between">
            <span className="text-xs font-heading font-medium text-text-muted uppercase tracking-wider">Additional Information</span>
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
            >
              {showMore ? '▲ Hide Details' : '▼ Show More (Missing Info, Converted Contact & Org)'}
            </button>
          </div>

          {showMore && (
            <>
              <div className="col-span-full">
                <Textarea
                  label="Missing Information"
                  rows={2}
                  value={form.missingInfo}
                  onChange={(e) => setForm({ ...form, missingInfo: e.target.value })}
                  placeholder="What data still needs to be found?"
                />
              </div>

              <Select
                label="Converted Contact ID (optional)"
                value={form.finalContactId}
                onChange={(e) => setForm({ ...form, finalContactId: e.target.value })}
              >
                <option value="">None</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.fullName}
                  </option>
                ))}
              </Select>

              <Select
                label="Converted Organisation ID (optional)"
                value={form.finalOrganisationId}
                onChange={(e) => setForm({ ...form, finalOrganisationId: e.target.value })}
              >
                <option value="">None</option>
                {organisations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} - {o.name}
                  </option>
                ))}
              </Select>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
