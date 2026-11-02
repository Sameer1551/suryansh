import { useState } from 'react';
import { Network as NetworkIcon, Plus, Download } from 'lucide-react';
import { PageHeader, SearchInput, EmptyState } from '@/components/ui/Common';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, Select, Input, Textarea, Checkbox, QuickDateIntervals } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { exportToCsv } from '@/utils/exportCsv';
import { type NetworkReferral } from '@/types';

const strengthTone: Record<string, 'default' | 'info' | 'success'> = {
  'Weak': 'default',
  'Moderate': 'info',
  'Strong': 'success',
};

export function NetworkView() {
  const { network, contacts, organisations, dispatch, genId, addActivity } = useData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [strengthFilter, setStrengthFilter] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    contactId: '',
    organisationId: '',
    relationshipType: 'Professional',
    connectionStrength: 'Moderate' as NetworkReferral['connectionStrength'],
    industryReach: '',
    potentialIntroductions: '',
    previousReferrals: 0,
    referralReceived: false,
    lastInteraction: today,
    maintenanceDate: '',
    assignedTo: 'Assistant',
    notes: '',
  });

  const filtered = network.filter((n) => {
    if (search) {
      const q = search.toLowerCase();
      if (!n.contactName.toLowerCase().includes(q) && !n.organisationName.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (typeFilter !== 'All' && n.relationshipType !== typeFilter) return false;
    if (strengthFilter !== 'All' && n.connectionStrength !== strengthFilter) return false;
    return true;
  });

  const types = ['All', ...Array.from(new Set(network.map((n) => n.relationshipType).filter(Boolean)))];

  const handleExport = () => {
    exportToCsv(
      'network_referrals',
      network.map((n) => ({
        ID: n.id,
        ContactID: n.contactId,
        Contact: n.contactName,
        OrganisationID: n.organisationId,
        Organisation: n.organisationName,
        RelationshipType: n.relationshipType,
        ConnectionStrength: n.connectionStrength,
        IndustryReach: n.industryReach,
        PotentialIntroductions: n.potentialIntroductions,
        PreviousReferrals: n.previousReferrals,
        ReferralReceived: n.referralReceived ? 'Yes' : 'No',
        LastInteraction: n.lastInteraction,
        MaintenanceDate: n.maintenanceDate,
        AssignedTo: n.assignedTo,
        Notes: n.notes,
      }))
    );
  };

  const handleAddSubmit = () => {
    if (!form.contactId) return;
    const contact = contacts.find((c) => c.id === form.contactId);
    const org = organisations.find((o) => o.id === form.organisationId || (contact && o.id === contact.organisationId));
    const id = genId('NET');

    const newNet: NetworkReferral = {
      id,
      contactId: form.contactId,
      contactName: contact?.fullName ?? '',
      organisationId: org?.id ?? contact?.organisationId ?? '',
      organisationName: org?.name ?? contact?.organisationName ?? '',
      relationshipType: form.relationshipType,
      connectionStrength: form.connectionStrength,
      industryReach: form.industryReach.trim(),
      potentialIntroductions: form.potentialIntroductions.trim(),
      previousReferrals: Number(form.previousReferrals) || 0,
      referralReceived: form.referralReceived,
      lastInteraction: form.lastInteraction,
      maintenanceDate: form.maintenanceDate,
      assignedTo: form.assignedTo,
      notes: form.notes.trim(),
    };

    dispatch({ type: 'ADD_NETWORK', payload: newNet });
    addActivity('org_updated', `Relationship mapped with ${newNet.contactName}`, form.assignedTo);
    setForm({
      contactId: '',
      organisationId: '',
      relationshipType: 'Professional',
      connectionStrength: 'Moderate',
      industryReach: '',
      potentialIntroductions: '',
      previousReferrals: 0,
      referralReceived: false,
      lastInteraction: today,
      maintenanceDate: '',
      assignedTo: 'Assistant',
      notes: '',
    });
    setAddOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Network & Referrals"
        subtitle={`${network.length} relationships mapped (synced to Excel)`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<Download size={16} />} onClick={handleExport}>
              Export CSV
            </Button>
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
              Add Relationship
            </Button>
          </div>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4">
          <SearchInput
            placeholder="Search by contact or organisation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <div className="flex flex-wrap gap-2">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-auto min-w-[130px] text-xs py-2"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Types' : t}
                </option>
              ))}
            </Select>
            <Select
              value={strengthFilter}
              onChange={(e) => setStrengthFilter(e.target.value)}
              className="w-auto min-w-[140px] text-xs py-2"
            >
              <option value="All">All Strength</option>
              <option value="Strong">Strong</option>
              <option value="Moderate">Moderate</option>
              <option value="Weak">Weak</option>
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<NetworkIcon size={32} />}
            title="No relationships found"
            description="Try adjusting your filters or map a new relationship."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {filtered.map((n) => (
            <Card key={n.id} hoverable className="p-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="min-w-0 flex-1 flex items-center gap-1.5">
                    <span className="text-2xs font-semibold text-text-primary truncate">{n.contactName}</span>
                    <Badge tone={strengthTone[n.connectionStrength] || 'default'} size="xs" className="shrink-0">
                      {n.connectionStrength}
                    </Badge>
                  </div>
                  <Badge size="xs" className="shrink-0">{n.relationshipType}</Badge>
                </div>
                <div className="text-3xs text-text-muted truncate mb-1">
                  {n.organisationName || 'Independent'}
                </div>

                <div className="space-y-0.5 text-3xs border-t border-border-subtle pt-1">
                  {n.industryReach && (
                    <div className="flex items-center gap-1 text-text-secondary truncate">
                      <span className="text-text-muted shrink-0 text-4xs uppercase tracking-wider">Reach:</span>
                      <span className="text-text-primary truncate">{n.industryReach}</span>
                    </div>
                  )}
                  {n.potentialIntroductions && (
                    <div className="flex items-center gap-1 text-text-secondary truncate">
                      <span className="text-text-muted shrink-0 text-4xs uppercase tracking-wider">Intros:</span>
                      <span className="text-text-primary truncate">{n.potentialIntroductions}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-text-muted pt-0.5 text-3xs">
                    <span>Refs: <strong className="text-text-primary font-medium">{n.previousReferrals}</strong>{n.referralReceived ? ' (Recv)' : ''}</span>
                    <span>{n.assignedTo || 'Assistant'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-1 pt-1 border-t border-border-subtle/80 flex items-center justify-between text-4xs text-text-muted">
                <span className="truncate">Maintain: {n.maintenanceDate || n.lastInteraction || '—'}</span>
                {n.notes && (
                  <span className="truncate max-w-[120px] text-text-secondary italic ml-1" title={n.notes}>
                    "{n.notes}"
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Relationship"
        subtitle="Manage professional network connections in CRM"
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddSubmit}>Save Relationship</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Row 1: Contact, Organisation, Relationship Type */}
          <Select
            label="Contact *"
            value={form.contactId}
            onChange={(e) => {
              const c = contacts.find((contact) => contact.id === e.target.value);
              setForm({
                ...form,
                contactId: e.target.value,
                organisationId: c?.organisationId || form.organisationId,
              });
            }}
          >
            <option value="">Select a contact...</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — {c.organisationName}
              </option>
            ))}
          </Select>

          <Select
            label="Organisation"
            value={form.organisationId}
            onChange={(e) => setForm({ ...form, organisationId: e.target.value })}
          >
            <option value="">Select organisation...</option>
            {organisations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>

          <Select
            label="Relationship Type"
            value={form.relationshipType}
            onChange={(e) => setForm({ ...form, relationshipType: e.target.value })}
          >
            <option>Friend</option>
            <option>Professional</option>
            <option>Mentor</option>
            <option>Collaborator</option>
            <option>Former Colleague</option>
            <option>Referral Partner</option>
            <option>Other</option>
          </Select>

          {/* Row 2: Connection Strength, Industry Reach, Assigned To */}
          <Select
            label="Connection Strength"
            value={form.connectionStrength}
            onChange={(e) => setForm({ ...form, connectionStrength: e.target.value as any })}
          >
            <option value="Strong">Strong</option>
            <option value="Moderate">Moderate</option>
            <option value="Weak">Weak</option>
          </Select>

          <Input
            label="Industry Reach"
            value={form.industryReach}
            onChange={(e) => setForm({ ...form, industryReach: e.target.value })}
            placeholder="e.g. Commercials, Mumbai + Bangalore"
          />

          <Select
            label="Assigned To"
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
          >
            <option>Assistant</option>
            <option>DOP</option>
            <option>Owner</option>
            <option>Other</option>
          </Select>

          {/* Row 3: Last Interaction (Auto), Maintenance Date (with intervals), Referral Received */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Last Interaction Date</label>
              <span className="text-2xs text-accent font-medium bg-accent/10 px-1.5 py-0.5 rounded">Automatic</span>
            </div>
            <Input
              type="date"
              value={form.lastInteraction}
              onChange={(e) => setForm({ ...form, lastInteraction: e.target.value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Relationship Maintenance Date</label>
              {form.maintenanceDate && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, maintenanceDate: '' })}
                  className="text-2xs text-text-muted hover:text-status-error transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <Input
              type="date"
              value={form.maintenanceDate}
              onChange={(e) => setForm({ ...form, maintenanceDate: e.target.value })}
            />
            <QuickDateIntervals
              value={form.maintenanceDate}
              onChange={(date) => setForm({ ...form, maintenanceDate: date })}
            />
          </div>

          <div className="flex items-center pt-5">
            <Checkbox
              label="Referral Received?"
              checked={form.referralReceived}
              onChange={(v) => setForm({ ...form, referralReceived: v })}
            />
          </div>

          {/* Notes */}
          <div className="col-span-full">
            <Textarea
              label="Notes"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Relationship history, connection background, context..."
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
              {showMore ? '▲ Hide Details' : '▼ Show More (Potential Introductions, Referral Count)'}
            </button>
          </div>

          {showMore && (
            <>
              <div className="col-span-full sm:col-span-2">
                <Input
                  label="Potential Introductions"
                  value={form.potentialIntroductions}
                  onChange={(e) => setForm({ ...form, potentialIntroductions: e.target.value })}
                  placeholder="e.g. Directors, Creative Leads"
                />
              </div>
              <Input
                label="Previous Referrals (Count)"
                type="number"
                value={String(form.previousReferrals)}
                onChange={(e) => setForm({ ...form, previousReferrals: Number(e.target.value) || 0 })}
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
