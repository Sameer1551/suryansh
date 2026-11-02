import { useState } from 'react';
import { Plus, Clock, MapPin, User, Download, DollarSign } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/ui/Common';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, Select, Input, Textarea, QuickDateIntervals } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { exportToCsv } from '@/utils/exportCsv';
import {
  type Opportunity,
  type OpportunityStage,
  type OpportunityOutcome,
} from '@/types';

const stages: OpportunityStage[] = [
  'Enquiry',
  'Discussion',
  'Brief Received',
  'Negotiation',
  'Confirmed',
  'Lost',
  'On Hold',
];

const stageTone: Record<OpportunityStage, 'info' | 'warning' | 'accent' | 'success' | 'error' | 'default'> = {
  'Enquiry': 'info',
  'Discussion': 'info',
  'Brief Received': 'warning',
  'Negotiation': 'accent',
  'Confirmed': 'success',
  'Lost': 'error',
  'On Hold': 'default',
};

export function OpportunitiesView() {
  const { opportunities, contacts, organisations, dispatch, genId, addActivity } = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    name: '',
    contactId: '',
    organisationId: '',
    projectType: 'Advertisement / TVC',
    projectDescription: '',
    director: '',
    producer: '',
    expectedShootDate: '',
    shootLocation: '',
    expectedDuration: '',
    dopRequirement: '',
    estimatedBudget: '',
    budgetCurrency: 'INR',
    availability: 'Available',
    source: '',
    stage: 'Enquiry' as OpportunityStage,
    nextAction: '',
    nextActionDate: '',
    outcome: 'Pending' as OpportunityOutcome,
    lossReason: '',
    notes: '',
  });

  const handleDrop = (stage: OpportunityStage) => {
    if (!draggedId) return;
    const opp = opportunities.find((o) => o.id === draggedId);
    if (!opp) return;

    let outcome: OpportunityOutcome = opp.outcome;
    if (stage === 'Confirmed') outcome = 'Won';
    else if (stage === 'Lost') outcome = 'Lost';
    else if (stage === 'On Hold') outcome = 'Stalled';
    else outcome = 'Pending';

    dispatch({
      type: 'UPDATE_OPPORTUNITY',
      payload: { id: draggedId, stage, outcome, lastUpdate: today },
    });
    addActivity('opportunity_updated', `${opp.name} moved to ${stage}`, 'Owner');
    setDraggedId(null);
  };

  const handleAddSubmit = () => {
    if (!form.name.trim()) return;
    const contact = contacts.find((c) => c.id === form.contactId);
    const org = organisations.find((o) => o.id === form.organisationId || (contact && o.id === contact.organisationId));
    const id = genId('OPP');

    const newOpp: Opportunity = {
      id,
      name: form.name.trim(),
      contactId: form.contactId,
      contactName: contact?.fullName ?? '',
      organisationId: org?.id ?? contact?.organisationId ?? '',
      organisationName: org?.name ?? contact?.organisationName ?? '',
      projectType: form.projectType,
      projectDescription: form.projectDescription.trim(),
      director: form.director.trim(),
      producer: form.producer.trim(),
      expectedShootDate: form.expectedShootDate,
      shootLocation: form.shootLocation.trim(),
      expectedDuration: form.expectedDuration.trim(),
      dopRequirement: form.dopRequirement.trim(),
      estimatedBudget: form.estimatedBudget.trim(),
      budgetCurrency: form.budgetCurrency,
      availability: form.availability,
      source: form.source.trim(),
      stage: form.stage,
      lastUpdate: today,
      nextAction: form.nextAction.trim(),
      nextActionDate: form.nextActionDate,
      outcome: form.stage === 'Confirmed' ? 'Won' : form.stage === 'Lost' ? 'Lost' : form.outcome,
      lossReason: form.lossReason.trim(),
      notes: form.notes.trim(),
    };

    dispatch({ type: 'ADD_OPPORTUNITY', payload: newOpp });
    addActivity('opportunity_updated', `Opportunity ${newOpp.name} created`, 'Assistant');
    setForm({
      name: '',
      contactId: '',
      organisationId: '',
      projectType: 'Advertisement / TVC',
      projectDescription: '',
      director: '',
      producer: '',
      expectedShootDate: '',
      shootLocation: '',
      expectedDuration: '',
      dopRequirement: '',
      estimatedBudget: '',
      budgetCurrency: 'INR',
      availability: 'Available',
      source: '',
      stage: 'Enquiry',
      nextAction: '',
      nextActionDate: '',
      outcome: 'Pending',
      lossReason: '',
      notes: '',
    });
    setAddOpen(false);
  };

  const handleExport = () => {
    exportToCsv(
      'opportunities',
      opportunities.map((o) => ({
        ID: o.id,
        Name: o.name,
        ContactID: o.contactId,
        Contact: o.contactName,
        OrganisationID: o.organisationId,
        Organisation: o.organisationName,
        ProjectType: o.projectType,
        Brief: o.projectDescription,
        Director: o.director,
        Producer: o.producer,
        ExpectedShootDate: o.expectedShootDate,
        Location: o.shootLocation,
        Duration: o.expectedDuration,
        DOPRequirement: o.dopRequirement,
        Budget: o.estimatedBudget,
        Currency: o.budgetCurrency,
        Availability: o.availability,
        Source: o.source,
        Stage: o.stage,
        LastUpdate: o.lastUpdate,
        NextAction: o.nextAction,
        NextActionDate: o.nextActionDate,
        Outcome: o.outcome,
        LossReason: o.lossReason,
        Notes: o.notes,
      }))
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Opportunities"
        subtitle={`${opportunities.length} opportunities in pipeline (synced to Excel)`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<Download size={16} />} onClick={handleExport}>
              Export CSV
            </Button>
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
              Add Opportunity
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {stages.map((stage) => {
          const stageItems = opportunities.filter((o) => o.stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage)}
              className="space-y-2"
            >
              <div className="flex items-center justify-between px-1 pb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stageDot(stage)}`} />
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">{stage}</span>
                </div>
                <span className="text-xs text-text-muted">{stageItems.length}</span>
              </div>
              <div className="space-y-2 min-h-12">
                {stageItems.map((opp) => (
                  <Card
                    key={opp.id}
                    hoverable
                    className="p-3 cursor-grab active:cursor-grabbing"
                    {...({ draggable: true, onDragStart: () => setDraggedId(opp.id) } as any)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="text-sm font-medium text-text-primary leading-snug">{opp.name}</div>
                      <Badge tone={stageTone[opp.stage]}>{opp.stage}</Badge>
                    </div>
                    <div className="text-2xs text-text-muted mb-2">
                      {opp.id} {opp.organisationName ? `· ${opp.organisationName}` : ''}
                    </div>
                    <div className="space-y-1 text-2xs text-text-secondary">
                      {opp.contactName && (
                        <div className="flex items-center gap-1.5">
                          <User size={11} /> {opp.contactName}
                        </div>
                      )}
                      {opp.shootLocation && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={11} /> {opp.shootLocation}
                        </div>
                      )}
                      {opp.expectedShootDate && (
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} /> {opp.expectedShootDate}
                        </div>
                      )}
                    </div>
                    {opp.estimatedBudget && (
                      <div className="mt-2 pt-2 border-t border-border-subtle flex items-center justify-between">
                        <span className="text-2xs text-text-muted">Budget</span>
                        <span className="text-xs font-medium text-text-primary">
                          {opp.estimatedBudget} {opp.budgetCurrency}
                        </span>
                      </div>
                    )}
                    {opp.nextAction && (
                      <div className="mt-1.5 text-2xs text-accent truncate">Next: {opp.nextAction}</div>
                    )}
                  </Card>
                ))}
                {stageItems.length === 0 && (
                  <div className="text-center text-2xs text-text-muted py-4 border border-dashed border-border-subtle rounded-lg">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Opportunity"
        subtitle="Create pipeline opportunity synced with CRM"
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddSubmit}>Add Opportunity</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Row 1: Name, Contact, Organisation */}
          <Input
            label="Opportunity Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Nike India Campaign"
          />
          <Select
            label="Contact"
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

          {/* Row 2: Project Type, Current Stage, Outcome */}
          <Select
            label="Project Type"
            value={form.projectType}
            onChange={(e) => setForm({ ...form, projectType: e.target.value })}
          >
            <option>Advertisement / TVC</option>
            <option>Feature Film</option>
            <option>Short Film</option>
            <option>Music Video</option>
            <option>Documentary</option>
            <option>Digital Campaign</option>
            <option>Branded Content</option>
            <option>OTT / Series</option>
            <option>Other</option>
          </Select>
          <Select
            label="Current Stage"
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value as OpportunityStage })}
          >
            {stages.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select
            label="Outcome"
            value={form.outcome}
            onChange={(e) => setForm({ ...form, outcome: e.target.value as OpportunityOutcome })}
          >
            <option value="Pending">Pending</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
            <option value="On Hold">On Hold</option>
          </Select>

          {/* Row 3: Budget, Shoot Date, Shoot Location */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Input label="Estimated Budget" value={form.estimatedBudget} onChange={(e) => setForm({ ...form, estimatedBudget: e.target.value })} placeholder="e.g. 15L" />
            </div>
            <div>
              <Select
                label="Currency"
                value={form.budgetCurrency}
                onChange={(e) => setForm({ ...form, budgetCurrency: e.target.value })}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </div>
          <Input label="Expected Shoot Date" type="date" value={form.expectedShootDate} onChange={(e) => setForm({ ...form, expectedShootDate: e.target.value })} />
          <Input label="Shoot Location" value={form.shootLocation} onChange={(e) => setForm({ ...form, shootLocation: e.target.value })} placeholder="e.g. Mumbai, Ladakh" />

          {/* Row 4: Next Action, Next Action Date (with intervals), Availability */}
          <Input label="Next Action" value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="e.g. Send rate card" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Next Action Date</label>
              {form.nextActionDate && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, nextActionDate: '' })}
                  className="text-2xs text-text-muted hover:text-status-error transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <Input
              type="date"
              value={form.nextActionDate}
              onChange={(e) => setForm({ ...form, nextActionDate: e.target.value })}
            />
            <QuickDateIntervals
              value={form.nextActionDate}
              onChange={(date) => setForm({ ...form, nextActionDate: date })}
            />
          </div>
          <Select
            label="Availability"
            value={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
          >
            <option>Available</option>
            <option>Unavailable</option>
            <option>Pending</option>
            <option>Not Applicable</option>
          </Select>

          {/* Notes & Description */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-3">
            <Textarea label="Project Description / Brief" rows={2} value={form.projectDescription} onChange={(e) => setForm({ ...form, projectDescription: e.target.value })} placeholder="Creative brief, treatment, references..." />
            <Textarea label="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Commercial notes, deal status..." />
          </div>

          {/* Additional Details Toggle */}
          <div className="col-span-full pt-2 border-t border-border-subtle/60 flex items-center justify-between">
            <span className="text-xs font-heading font-medium text-text-muted uppercase tracking-wider">Additional Information</span>
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
            >
              {showMore ? '▲ Hide Details' : '▼ Show More (Director, Producer, Duration, DOP Requirement, Source, Loss Reason)'}
            </button>
          </div>

          {showMore && (
            <>
              <Input label="Director" value={form.director} onChange={(e) => setForm({ ...form, director: e.target.value })} placeholder="e.g. Anand Gandhi" />
              <Input label="Producer" value={form.producer} onChange={(e) => setForm({ ...form, producer: e.target.value })} placeholder="e.g. Line Producer name" />
              <Input label="Expected Duration (days)" value={form.expectedDuration} onChange={(e) => setForm({ ...form, expectedDuration: e.target.value })} placeholder="e.g. 3 days" />
              <Input label="DOP Requirement" value={form.dopRequirement} onChange={(e) => setForm({ ...form, dopRequirement: e.target.value })} placeholder="e.g. Cinematic landscape + macro" />
              <Input label="Opportunity Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g. Referral, Direct email" />
              <Input label="Loss Reason (if lost)" value={form.lossReason} onChange={(e) => setForm({ ...form, lossReason: e.target.value })} placeholder="Reason for losing project..." />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

function stageDot(stage: OpportunityStage) {
  switch (stage) {
    case 'Enquiry':
    case 'Discussion':
      return 'bg-status-info';
    case 'Brief Received':
      return 'bg-status-warning';
    case 'Negotiation':
      return 'bg-accent';
    case 'Confirmed':
      return 'bg-status-success';
    case 'Lost':
      return 'bg-status-error';
    case 'On Hold':
      return 'bg-text-muted';
    default:
      return 'bg-text-muted';
  }
}
