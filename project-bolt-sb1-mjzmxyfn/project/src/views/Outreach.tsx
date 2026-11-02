import { useState } from 'react';
import { Plus, Download, Trash2 } from 'lucide-react';
import { PageHeader, SearchInput, EmptyState } from '@/components/ui/Common';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, Select, Input, Textarea, Checkbox, QuickDateIntervals } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { exportToCsv } from '@/utils/exportCsv';
import { type Outreach, type Channel, type OutreachType, type DeliveryStatus, type ResponseSentiment } from '@/types';

export function OutreachView() {
  const { outreach, dispatch, addActivity } = useData();
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');
  const [responseFilter, setResponseFilter] = useState('All');
  const [handlerFilter, setHandlerFilter] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [outreachToDelete, setOutreachToDelete] = useState<Outreach | null>(null);

  const filtered = outreach.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      if (!o.contactName.toLowerCase().includes(q) && !o.organisationName.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (channelFilter !== 'All' && o.channel !== channelFilter) return false;
    if (responseFilter === 'Responded' && !o.responseReceived) return false;
    if (responseFilter === 'No Response' && o.responseReceived) return false;
    if (handlerFilter !== 'All' && o.handledBy !== handlerFilter) return false;
    return true;
  });

  const handleExport = () => {
    exportToCsv(
      'outreach',
      filtered.map((o) => ({
        ID: o.id,
        ContactID: o.contactId,
        Contact: o.contactName,
        OrganisationID: o.organisationId,
        Organisation: o.organisationName,
        Date: o.date,
        Channel: o.channel,
        Type: o.type,
        MessageTemplate: o.messageTemplate,
        PersonalisationReason: o.personalisationReason,
        PortfolioSent: o.portfolioSent ? 'Yes' : 'No',
        ShowreelSent: o.showreelSent ? 'Yes' : 'No',
        MessageReference: o.messageReference,
        DeliveryStatus: o.deliveryStatus,
        ResponseReceived: o.responseReceived ? 'Yes' : 'No',
        ResponseDate: o.responseDate,
        ResponseSummary: o.responseSummary,
        ResponseSentiment: o.responseSentiment,
        NextAction: o.nextAction,
        NextActionDate: o.nextActionDate,
        HandledBy: o.handledBy,
        Notes: o.notes,
      }))
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Outreach"
        subtitle={`${outreach.length} communications recorded`}
        action={
          <>
            <Button variant="secondary" icon={<Download size={16} />} onClick={handleExport}>
              Export CSV
            </Button>
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
              Record Outreach
            </Button>
          </>
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
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-auto min-w-[120px] text-xs py-2"
            >
              <option value="All">All Channels</option>
              <option value="Email">Email</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Phone">Phone</option>
              <option value="In Person">In Person</option>
              <option value="Other">Other</option>
            </Select>
            <Select
              value={responseFilter}
              onChange={(e) => setResponseFilter(e.target.value)}
              className="w-auto min-w-[120px] text-xs py-2"
            >
              <option value="All">All Responses</option>
              <option value="Responded">Responded</option>
              <option value="No Response">No Response</option>
            </Select>
            <Select
              value={handlerFilter}
              onChange={(e) => setHandlerFilter(e.target.value)}
              className="w-auto min-w-[120px] text-xs py-2"
            >
              <option value="All">All Handlers</option>
              <option value="Assistant">Assistant</option>
              <option value="DOP">DOP</option>
              <option value="Owner">Owner</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            title="No outreach found"
            description="Try adjusting your filters or record a new outreach activity."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-3">ID</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-3">Contact</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-3 hidden md:table-cell">Organisation</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-3">Date</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-3 hidden lg:table-cell">Channel</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-3 hidden lg:table-cell">Type</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-3">Delivery</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-3">Response</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-3 hidden xl:table-cell">Handled By</th>
                  <th className="w-12 px-3 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="group border-b border-border-subtle last:border-0 hover:bg-bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-2xs text-text-muted">{o.id}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{o.contactName}</td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{o.organisationName}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{o.date}</td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">{o.channel}</td>
                    <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">{o.type}</td>
                    <td className="px-4 py-3">
                      <Badge tone={o.deliveryStatus === 'Sent' ? 'success' : o.deliveryStatus === 'Bounced' || o.deliveryStatus === 'Failed' ? 'error' : 'default'}>
                        {o.deliveryStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {o.responseReceived ? (
                        <Badge tone={o.responseSentiment === 'Positive' ? 'success' : o.responseSentiment === 'Negative' ? 'error' : 'default'}>
                          {o.responseSentiment || 'Yes'}
                        </Badge>
                      ) : (
                        <Badge tone="default">Pending</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs hidden xl:table-cell">{o.handledBy}</td>
                    <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setOutreachToDelete(o)}
                        className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/15 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title={`Delete outreach ${o.id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <OutreachAddModal open={addOpen} onClose={() => setAddOpen(false)} />

      <Modal open={!!outreachToDelete} onClose={() => setOutreachToDelete(null)} title="Delete Outreach Record" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete this outreach record (<strong>{outreachToDelete?.id}</strong> for <strong>{outreachToDelete?.contactName}</strong>)? This will permanently remove it from your workspace and Excel sheet.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setOutreachToDelete(null)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={() => {
                if (outreachToDelete) {
                  dispatch({ type: 'DELETE_OUTREACH', payload: outreachToDelete.id });
                  addActivity('outreach_recorded', `Deleted outreach record ${outreachToDelete.id}`, 'Owner');
                  setOutreachToDelete(null);
                }
              }}
            >
              Delete Outreach
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function OutreachAddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch, genId, addActivity, contacts } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const [showMore, setShowMore] = useState(false);
  const [form, setForm] = useState({
    contactId: '',
    channel: 'Email' as Channel,
    type: 'Introduction' as OutreachType,
    messageTemplate: '',
    personalisationReason: '',
    messageReference: '',
    deliveryStatus: 'Sent' as DeliveryStatus,
    portfolioSent: false,
    showreelSent: false,
    responseReceived: false,
    responseDate: '',
    responseSummary: '',
    responseSentiment: '' as ResponseSentiment,
    nextAction: '',
    nextActionDate: '',
    handledBy: 'Assistant',
    notes: '',
  });

  const handleSubmit = () => {
    if (!form.contactId) return;
    const contact = contacts.find((c) => c.id === form.contactId);
    const id = genId('OUT');

    const record: Outreach = {
      id,
      contactId: form.contactId,
      contactName: contact?.fullName ?? '',
      organisationId: contact?.organisationId ?? '',
      organisationName: contact?.organisationName ?? '',
      date: today,
      channel: form.channel,
      type: form.type,
      messageTemplate: form.messageTemplate || 'Manual entry',
      personalisationReason: form.personalisationReason.trim(),
      portfolioSent: form.portfolioSent,
      showreelSent: form.showreelSent,
      messageReference: form.messageReference.trim(),
      deliveryStatus: form.deliveryStatus,
      responseReceived: form.responseReceived,
      responseDate: form.responseReceived ? form.responseDate : '',
      responseSummary: form.responseSummary.trim(),
      responseSentiment: form.responseSentiment,
      nextAction: form.nextAction.trim(),
      nextActionDate: form.nextActionDate,
      handledBy: form.handledBy,
      notes: form.notes.trim(),
    };

    dispatch({ type: 'ADD_OUTREACH', payload: record });
    if (contact) {
      dispatch({
        type: 'UPDATE_CONTACT',
        payload: {
          ...contact,
          lastContactDate: today,
          lastChannel: form.channel,
          responseStatus: form.responseReceived ? 'Replied' : 'Pending',
          contactStatus: form.responseReceived ? 'Replied' : 'Contacted',
          portfolioShared: contact.portfolioShared || form.portfolioSent,
          showreelShared: contact.showreelShared || form.showreelSent,
          nextAction: form.nextAction || contact.nextAction,
          nextFollowUpDate: form.nextActionDate || contact.nextFollowUpDate,
        },
      });
    }

    addActivity('outreach_recorded', `${form.type} recorded for ${contact?.fullName}`, form.handledBy);
    setForm({
      contactId: '',
      channel: 'Email',
      type: 'Introduction',
      messageTemplate: '',
      personalisationReason: '',
      messageReference: '',
      deliveryStatus: 'Sent',
      portfolioSent: false,
      showreelSent: false,
      responseReceived: false,
      responseDate: '',
      responseSummary: '',
      responseSentiment: '',
      nextAction: '',
      nextActionDate: '',
      handledBy: 'Assistant',
      notes: '',
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Outreach"
      subtitle="Save outreach interaction directly to CRM"
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Record</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Row 1: Contact, Outreach Date (Auto), Channel */}
        <div className="sm:col-span-1">
          <Select label="Contact *" value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })}>
            <option value="">Select a contact...</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — {c.organisationName}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Date of Outreach</label>
            <span className="text-2xs text-accent font-medium bg-accent/10 px-1.5 py-0.5 rounded">Automatic</span>
          </div>
          <Input type="date" value={today} readOnly />
        </div>
        <Select label="Communication Channel" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as Channel })}>
          <option>Email</option>
          <option>WhatsApp</option>
          <option>Instagram</option>
          <option>LinkedIn</option>
          <option>Phone</option>
          <option>In Person</option>
          <option>Other</option>
        </Select>

        {/* Row 2: Outreach Type, Delivery Status, Handled By */}
        <Select label="Outreach Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as OutreachType })}>
          <option>Introduction</option>
          <option>Portfolio Submission</option>
          <option>Showreel Submission</option>
          <option>Networking</option>
          <option>Follow-up</option>
          <option>Referral Request</option>
          <option>Reconnection</option>
          <option>Other</option>
        </Select>
        <Select label="Delivery Status" value={form.deliveryStatus} onChange={(e) => setForm({ ...form, deliveryStatus: e.target.value as DeliveryStatus })}>
          <option>Sent</option>
          <option>Failed</option>
          <option>Bounced</option>
          <option>Unknown</option>
        </Select>
        <Select label="Handled By" value={form.handledBy} onChange={(e) => setForm({ ...form, handledBy: e.target.value })}>
          <option>Assistant</option>
          <option>DOP</option>
          <option>Owner</option>
        </Select>

        {/* Row 3: Next Action, Next Action Date (with intervals), Sentiment */}
        <Input label="Next Action" value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="e.g. Follow up on pitch" />
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
        <Select label="Response Sentiment" value={form.responseSentiment} onChange={(e) => setForm({ ...form, responseSentiment: e.target.value as ResponseSentiment })}>
          <option value="">None / Blank</option>
          <option value="Positive">Positive</option>
          <option value="Neutral">Neutral</option>
          <option value="Negative">Negative</option>
        </Select>

        {/* Checkboxes */}
        <div className="col-span-full flex flex-wrap gap-6 py-1">
          <Checkbox label="Response Received" checked={form.responseReceived} onChange={(v) => setForm({ ...form, responseReceived: v })} />
          <Checkbox label="Portfolio Sent" checked={form.portfolioSent} onChange={(v) => setForm({ ...form, portfolioSent: v })} />
          <Checkbox label="Showreel Sent" checked={form.showreelSent} onChange={(v) => setForm({ ...form, showreelSent: v })} />
        </div>

        {/* Response fields if received */}
        {form.responseReceived && (
          <>
            <Input label="Response Date" type="date" value={form.responseDate || today} onChange={(e) => setForm({ ...form, responseDate: e.target.value })} />
            <div className="col-span-full sm:col-span-2">
              <Input label="Response Summary" value={form.responseSummary} onChange={(e) => setForm({ ...form, responseSummary: e.target.value })} placeholder="What did they respond with?" />
            </div>
          </>
        )}

        {/* Notes */}
        <div className="col-span-full">
          <Textarea label="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Key outreach context or follow-up notes..." />
        </div>

        {/* Additional Details Toggle */}
        <div className="col-span-full pt-2 border-t border-border-subtle/60 flex items-center justify-between">
          <span className="text-xs font-heading font-medium text-text-muted uppercase tracking-wider">Additional Information</span>
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {showMore ? '▲ Hide Details' : '▼ Show More (Message Template, Personalisation, Email Reference)'}
          </button>
        </div>

        {showMore && (
          <>
            <Input label="Message Template / Version" value={form.messageTemplate} onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })} placeholder="Template or subject" />
            <Input label="Personalisation / Reason" value={form.personalisationReason} onChange={(e) => setForm({ ...form, personalisationReason: e.target.value })} placeholder="Why reached out now..." />
            <Input label="Message / Email Reference" value={form.messageReference} onChange={(e) => setForm({ ...form, messageReference: e.target.value })} placeholder="Subject line, thread ID..." />
          </>
        )}
      </div>
    </Modal>
  );
}
