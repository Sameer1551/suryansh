import { useState } from 'react';
import { Plus, ArrowLeft, Mail, Phone, MapPin, Ban, Star, Download, Trash2 } from 'lucide-react';
import { PageHeader, SearchInput, EmptyState } from '@/components/ui/Common';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, PriorityBadge, normalizePriority, getPriorityRowClasses, getPriorityFirstCellBorder, PRIORITY_RANK } from '@/components/ui/Badge';
import { Modal, Select, Input, Textarea, Checkbox, QuickDateIntervals } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { exportToCsv } from '@/utils/exportCsv';
import { type Contact, type Outreach } from '@/types';

interface Props {
  onOpenProfile: (id: string) => void;
}

export function ContactsView({ onOpenProfile }: Props) {
  const { contacts, dispatch, addActivity } = useData();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'priority'>('recent');
  const [addOpen, setAddOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  let filtered = contacts.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      const haystack = [c.fullName, c.firstName, c.lastName, c.organisationName, c.professionalEmail, c.phone, c.designation, c.department, c.city].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (priorityFilter !== 'All' && normalizePriority(c.contactPriority) !== priorityFilter) return false;
    if (statusFilter !== 'All' && c.contactStatus !== statusFilter) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    const aStarred = Boolean(a.starred ?? (normalizePriority(a.contactPriority) === 'Lead'));
    const bStarred = Boolean(b.starred ?? (normalizePriority(b.contactPriority) === 'Lead'));
    if (aStarred !== bStarred) {
      return aStarred ? -1 : 1;
    }
    if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
    if (sortBy === 'priority') {
      return (PRIORITY_RANK[normalizePriority(a.contactPriority)] || 99) - (PRIORITY_RANK[normalizePriority(b.contactPriority)] || 99);
    }
    return new Date(b.lastContactDate).getTime() - new Date(a.lastContactDate).getTime();
  });

  const handleExport = () => {
    exportToCsv('contacts', filtered.map((c) => ({
      ID: c.id, Name: c.fullName, Designation: c.designation, Organisation: c.organisationName,
      City: c.city, Country: c.country, Email: c.professionalEmail, Phone: c.phone,
      Priority: c.contactPriority, RelationshipStatus: c.relationshipStatus, ContactStatus: c.contactStatus,
      LastContact: c.lastContactDate, NextFollowUp: c.nextFollowUpDate, Owner: c.contactOwner,
      DoNotContact: c.doNotContact ? 'Yes' : 'No',
    })));
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length} contacts in your network`}
        action={
          <>
            <Button variant="secondary" icon={<Download size={16} />} onClick={handleExport}>Export CSV</Button>
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>Add Contact</Button>
          </>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4">
          <SearchInput placeholder="Search by name, organisation, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
          <div className="flex flex-wrap gap-2">
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-auto min-w-[145px] text-xs py-2">
              <option value="All">All Priority</option>
              <option value="Lead">Lead</option>
              <option value="Interested lead">Interested lead</option>
              <option value="Ingaging">Ingaging</option>
              <option value="Cold reply">Cold reply</option>
              <option value="Not interested">Not interested</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto min-w-[140px] text-xs py-2">
              <option value="All">All Status</option>
              <option value="Not Contacted">Not Contacted</option>
              <option value="Contacted">Contacted</option>
              <option value="Replied">Replied</option>
              <option value="Meeting">Meeting</option>
              <option value="Active Relationship">Active Relationship</option>
              <option value="Inactive">Inactive</option>
            </Select>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'priority')} className="w-auto min-w-[120px] text-xs py-2">
              <option value="recent">Recent Contact</option>
              <option value="name">Name A–Z</option>
              <option value="priority">Priority</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState title="No contacts found" description="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="w-10 px-3 py-2 text-center"></th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2">Name</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2 hidden md:table-cell">Designation</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2 hidden lg:table-cell">Organisation</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2 hidden lg:table-cell">City</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2">Priority</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2 hidden md:table-cell">Status</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2 hidden xl:table-cell">Last Contact</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2 hidden xl:table-cell">Next Follow-up</th>
                  <th className="w-12 px-3 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const isStarred = Boolean(c.starred ?? (normalizePriority(c.contactPriority) === 'Lead'));
                  return (
                  <tr
                    key={c.id}
                    onClick={() => onOpenProfile(c.id)}
                    className={`group border-b border-border-subtle last:border-0 cursor-pointer ${getPriorityRowClasses(c.contactPriority)}`}
                  >
                    <td className={`px-3 py-1.5 text-center ${getPriorityFirstCellBorder(c.contactPriority)}`} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          dispatch({ type: 'TOGGLE_STAR_CONTACT', payload: c.id });
                          addActivity('contact_updated', `${isStarred ? 'Unstarred' : 'Starred'} ${c.fullName}`, 'Owner');
                        }}
                        className="p-1 text-text-muted hover:text-status-warning transition-colors"
                        title={isStarred ? 'Starred - Click to unstar' : 'Click to star'}
                      >
                        <Star
                          size={14}
                          className={isStarred ? 'fill-status-warning text-status-warning' : 'text-text-muted/40 hover:text-status-warning transition-colors'}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-1.5">
                      <div className="flex items-center gap-2">
                        {c.doNotContact && <Ban size={13} className="text-status-error shrink-0" />}
                        <div className="min-w-0">
                          <div className="font-medium text-text-primary leading-snug truncate">{c.fullName}</div>
                          <div className="text-3xs text-text-muted leading-tight">{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-1.5 text-text-secondary text-xs hidden md:table-cell truncate max-w-[150px]">{c.designation}</td>
                    <td className="px-4 py-1.5 text-text-secondary text-xs hidden lg:table-cell truncate max-w-[150px]">{c.organisationName}</td>
                    <td className="px-4 py-1.5 text-text-secondary text-xs hidden lg:table-cell">{c.city}</td>
                    <td className="px-4 py-1.5"><PriorityBadge priority={c.contactPriority} /></td>
                    <td className="px-4 py-1.5 hidden md:table-cell">
                      <Badge tone={c.contactStatus === 'Active Relationship' ? 'success' : c.contactStatus === 'Meeting' ? 'info' : c.contactStatus === 'Replied' ? 'warning' : 'default'}>
                        {c.contactStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-1.5 text-text-secondary text-xs hidden xl:table-cell">{c.lastContactDate}</td>
                    <td className="px-4 py-1.5 text-xs hidden xl:table-cell">
                      {c.nextFollowUpDate ? (
                        <span className={c.followUpAlert ? 'text-status-warning' : 'text-text-secondary'}>{c.nextFollowUpDate}</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setContactToDelete(c)}
                        className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title={`Delete ${c.fullName}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ContactAddModal open={addOpen} onClose={() => setAddOpen(false)} />

      <Modal
        open={!!contactToDelete}
        onClose={() => setContactToDelete(null)}
        title="Delete Contact"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setContactToDelete(null)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={13} />}
              onClick={() => {
                if (contactToDelete) {
                  dispatch({ type: 'DELETE_CONTACT', payload: contactToDelete.id });
                  addActivity('org_updated', `Deleted contact ${contactToDelete.fullName}`, 'Owner');
                  setContactToDelete(null);
                }
              }}
            >
              Delete Contact
            </Button>
          </div>
        }
      >
        <div className="space-y-2 py-1">
          <p className="text-sm text-text-primary">
            Are you sure you want to delete <strong className="text-accent">{contactToDelete?.fullName}</strong>?
          </p>
          <p className="text-2xs text-text-muted">
            This permanently removes the contact from your workspace and Excel sheet. Syncing to Google Sheets will also remove it from Google Sheets.
          </p>
        </div>
      </Modal>
    </div>
  );
}

// ── Department Configuration ────────────────────────────────

export const DEPARTMENT_OPTIONS = [
  'DIRECTOR',
  'DP',
  'CLIENT',
  'PRODUCER',
  'AGENCY',
  'EXECUTIVE PRODUCER',
  'LINE PRODUCER',
  'AC',
  'GRIPS',
  'GAFFER',
] as const;

interface DepartmentFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function DepartmentField({ value, onChange, label = 'Department' }: DepartmentFieldProps) {
  const trimmed = (value || '').trim();
  const matchedOption = DEPARTMENT_OPTIONS.find((opt) => opt.toLowerCase() === trimmed.toLowerCase());
  const selectedDropdownValue = matchedOption ? matchedOption : (trimmed ? '__custom__' : '');

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="label-base">{label}</label>
        {trimmed && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-2xs text-text-muted hover:text-status-error transition-colors"
            title="Clear department"
          >
            Clear
          </button>
        )}
      </div>
      <div className="space-y-1.5">
        <select
          className="input-base appearance-none cursor-pointer w-full text-xs py-2"
          value={selectedDropdownValue}
          onChange={(e) => {
            const next = e.target.value;
            if (next === '__custom__') {
              // keep current custom value
            } else {
              onChange(next);
            }
          }}
        >
          <option value="">Select Department...</option>
          {DEPARTMENT_OPTIONS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
          {trimmed && !matchedOption && (
            <option value="__custom__">Custom: {trimmed}</option>
          )}
        </select>
        <input
          type="text"
          className="input-base w-full text-xs py-1.5 placeholder:text-text-muted/60"
          placeholder="Directly enter department..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ── Add Contact Modal ───────────────────────────────────────

function ContactAddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch, genId, addActivity, organisations } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const [showMore, setShowMore] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    designation: '',
    department: '',
    organisationId: '',
    contactPriority: 'Lead' as any,
    phone: '',
    whatsapp: '',
    professionalEmail: '',
    instagram: '',
    linkedin: '',
    city: '',
    country: 'India',
    nextFollowUpDate: '',
    contactStatus: 'Not Contacted' as Contact['contactStatus'],
    relationshipStatus: 'Cold' as 'Cold' | 'Warm' | 'Existing',
    nextAction: '',
    lastContactDate: today,
    contactOwner: 'Assistant',
    relationshipNotes: '',
    alternativeEmail: '',
    facebook: '',
    imdb: '',
    personalWebsite: '',
    experienceLevel: 'Mid-level',
    specialisation: 'Commercials',
    notableProjects: '',
    previousOrganisation: '',
    professionalInterests: '',
    portfolioUrl: '',
    relevanceToDop: '',
    connectionType: 'Direct',
    introductionThrough: '',
    firstContactDate: today,
    lastChannel: 'Email' as Contact['lastChannel'],
    portfolioShared: false,
    showreelShared: false,
    doNotContact: false,
    sourceUrl: '',
  });

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return;
    const org = organisations.find((o) => o.id === form.organisationId);
    const id = genId('CON');
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;

    const contact: Contact = {
      id,
      fullName,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      designation: form.designation.trim(),
      department: form.department.trim(),
      organisationId: form.organisationId,
      organisationName: org?.name ?? '',
      industryCategory: org?.industryFocus ?? '',
      city: form.city.trim(),
      country: form.country.trim(),
      professionalEmail: form.professionalEmail.trim(),
      alternativeEmail: form.alternativeEmail.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim(),
      instagram: form.instagram.trim(),
      linkedin: form.linkedin.trim(),
      facebook: form.facebook.trim(),
      imdb: form.imdb.trim(),
      personalWebsite: form.personalWebsite.trim(),
      experienceLevel: form.experienceLevel.trim(),
      specialisation: form.specialisation.trim(),
      notableProjects: form.notableProjects.trim(),
      currentOrganisation: org?.name ?? '',
      previousOrganisation: form.previousOrganisation.trim(),
      professionalInterests: form.professionalInterests.trim(),
      portfolioUrl: form.portfolioUrl.trim(),
      relevanceToDop: form.relevanceToDop.trim(),
      connectionType: form.connectionType,
      introductionThrough: form.introductionThrough.trim(),
      contactPriority: form.contactPriority,
      relationshipStatus: form.relationshipStatus,
      contactStatus: form.contactStatus,
      firstContactDate: form.firstContactDate,
      lastContactDate: form.lastContactDate,
      lastChannel: form.lastChannel,
      responseStatus: 'No Response',
      portfolioShared: form.portfolioShared,
      showreelShared: form.showreelShared,
      nextFollowUpDate: form.nextFollowUpDate,
      followUpAlert: Boolean(form.nextFollowUpDate && form.nextFollowUpDate <= today),
      nextAction: form.nextAction.trim(),
      relationshipNotes: form.relationshipNotes.trim(),
      doNotContact: form.doNotContact,
      contactOwner: form.contactOwner,
      sourceUrl: form.sourceUrl.trim(),
      dateAdded: today,
      lastVerified: today,
    };

    dispatch({ type: 'ADD_CONTACT', payload: contact });
    addActivity('contact_added', `${contact.fullName} added${org ? ' from ' + org.name : ''}`, 'Assistant');

    if (form.nextFollowUpDate) {
      const fupId = genId('FUP');
      dispatch({
        type: 'ADD_FOLLOWUP',
        payload: {
          id: fupId,
          contactId: id,
          contactName: fullName,
          organisationName: org?.name ?? '',
          previousContactDate: form.lastContactDate || today,
          previousCommunicationSummary: 'Initial contact entry',
          followUpNumber: 1,
          scheduledDate: form.nextFollowUpDate,
          channel: form.lastChannel || 'Email',
          reason: form.nextAction || `Follow-up with ${fullName}`,
          status: 'Pending',
          responseReceived: false,
          responseSummary: '',
          nextFollowUpDate: '',
          assignedTo: form.contactOwner || 'Assistant',
          notes: form.relationshipNotes || '',
        },
      });
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Contact"
      subtitle="Quickly add contact with live Excel synchronization"
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Add Contact</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Row 1: Names & Specialisation (moved UP) */}
        <Input label="First Name *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="e.g. Vikram" required />
        <Input label="Last Name *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="e.g. Malhotra" required />
        <Select label="Specialisation" value={form.specialisation} onChange={(e) => setForm({ ...form, specialisation: e.target.value })}>
          <option>Commercials</option><option>Feature Films</option><option>Short Films</option><option>Music Videos</option><option>Documentary</option><option>Digital Content</option><option>Branded Content</option><option>Television</option><option>OTT</option><option>Other</option>
        </Select>

        {/* Row 2: Organisation, Department (updated options + direct text box), Experience Level (moved UP) */}
        <Select label="Organisation" value={form.organisationId} onChange={(e) => setForm({ ...form, organisationId: e.target.value })}>
          <option value="">Select Organisation...</option>
          {organisations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </Select>
        <DepartmentField value={form.department} onChange={(val) => setForm({ ...form, department: val })} />
        <Select label="Experience Level" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
          <option>Senior</option><option>Mid-level</option><option>Emerging</option><option>Unknown</option>
        </Select>

        {/* Row 3: Priority, Phone, Professional Email */}
        <Select label="Priority" value={normalizePriority(form.contactPriority)} onChange={(e) => setForm({ ...form, contactPriority: e.target.value as any })}>
          <option value="Lead">Lead</option>
          <option value="Interested lead">Interested lead</option>
          <option value="Ingaging">Ingaging</option>
          <option value="Cold reply">Cold reply</option>
          <option value="Not interested">Not interested</option>
        </Select>
        <Input label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." />
        <Input label="Professional Email" type="email" value={form.professionalEmail} onChange={(e) => setForm({ ...form, professionalEmail: e.target.value })} placeholder="name@company.com" />

        {/* Row 4: Introduction Through (moved UP), Contact Status, Relationship Status */}
        <Input label="Introduction Through" value={form.introductionThrough} onChange={(e) => setForm({ ...form, introductionThrough: e.target.value })} placeholder="e.g. Industry Event, Name" />
        <Select label="Contact Status" value={form.contactStatus} onChange={(e) => setForm({ ...form, contactStatus: e.target.value as Contact['contactStatus'] })}>
          <option value="Not Contacted">Not Contacted</option>
          <option value="Contacted">Contacted</option>
          <option value="Replied">Replied</option>
          <option value="Meeting">Meeting</option>
          <option value="Active Relationship">Active Relationship</option>
          <option value="Inactive">Inactive</option>
        </Select>
        <Select label="Relationship Status" value={form.relationshipStatus} onChange={(e) => setForm({ ...form, relationshipStatus: e.target.value as 'Cold' | 'Warm' | 'Existing' })}>
          <option value="Cold">Cold</option>
          <option value="Warm">Warm</option>
          <option value="Existing">Existing</option>
        </Select>

        {/* Row 5: Next Follow-up (with quick intervals), Next Action, Contact Owner */}
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
          />
        </div>

        <Input label="Next Action" value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="e.g. Send updated reel" />

        <Select label="Contact Owner" value={form.contactOwner} onChange={(e) => setForm({ ...form, contactOwner: e.target.value })}>
          <option value="Assistant">Assistant</option><option value="DOP">DOP</option><option value="Owner">Owner</option>
        </Select>

        {/* Row 6: Last Contact Date (Auto) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Last Contact Date</label>
            <span className="text-2xs text-accent font-medium bg-accent/10 px-1.5 py-0.5 rounded">Automatic</span>
          </div>
          <Input type="date" value={form.lastContactDate} onChange={(e) => setForm({ ...form, lastContactDate: e.target.value })} />
        </div>

        {/* Row 7: Notes */}
        <div className="col-span-full">
          <Textarea label="Relationship Notes" rows={2} value={form.relationshipNotes} onChange={(e) => setForm({ ...form, relationshipNotes: e.target.value })} placeholder="Context, mutual interests, conversation notes..." />
        </div>

        {/* Additional Information Toggle */}
        <div className="col-span-full pt-2 border-t border-border-subtle/60 flex items-center justify-between">
          <span className="text-xs font-heading font-medium text-text-muted uppercase tracking-wider">Additional Information</span>
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {showMore ? '▲ Hide Details' : '▼ Show More (Designation, Location, Socials, WhatsApp & Background)'}
          </button>
        </div>

        {showMore && (
          <>
            <div className="col-span-full flex flex-wrap gap-6 py-1">
              <Checkbox label="Portfolio Shared" checked={form.portfolioShared} onChange={(v) => setForm({ ...form, portfolioShared: v })} />
              <Checkbox label="Showreel Shared" checked={form.showreelShared} onChange={(v) => setForm({ ...form, showreelShared: v })} />
              <Checkbox label="Do Not Contact" checked={form.doNotContact} onChange={(v) => setForm({ ...form, doNotContact: v })} />
            </div>

            {/* Hidden / Down: Professional Designation, WhatsApp, City & Country */}
            <Input label="Professional Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Executive Producer / Director" />
            <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+91 ..." />
            <div className="grid grid-cols-2 gap-2">
              <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" />
              <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="India" />
            </div>

            {/* Hidden / Down: Instagram URL, LinkedIn URL */}
            <Input label="Instagram URL" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/..." />
            <Input label="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />

            <Input label="Alternative Email" type="email" value={form.alternativeEmail} onChange={(e) => setForm({ ...form, alternativeEmail: e.target.value })} />
            <Input label="Personal Website" value={form.personalWebsite} onChange={(e) => setForm({ ...form, personalWebsite: e.target.value })} placeholder="https://..." />
            <Input label="IMDb URL" value={form.imdb} onChange={(e) => setForm({ ...form, imdb: e.target.value })} placeholder="https://imdb.com/..." />
            <Input label="Facebook URL" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
            <Input label="Portfolio URL" value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} placeholder="Drive or web portfolio..." />
            <Input label="Source URL" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://..." />

            <Select label="Connection Type" value={form.connectionType} onChange={(e) => setForm({ ...form, connectionType: e.target.value })}>
              <option>Direct</option><option>Referral</option><option>Cold</option><option>Existing Relationship</option><option>Other</option>
            </Select>

            <Input label="Previous Organisation" value={form.previousOrganisation} onChange={(e) => setForm({ ...form, previousOrganisation: e.target.value })} />
            <Input label="Relevance to DOP" value={form.relevanceToDop} onChange={(e) => setForm({ ...form, relevanceToDop: e.target.value })} placeholder="e.g. Direct hiring authority" />

            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Notable Projects" value={form.notableProjects} onChange={(e) => setForm({ ...form, notableProjects: e.target.value })} placeholder="e.g. Nike Campaign, Aurora" />
              <Input label="Professional Interests" value={form.professionalInterests} onChange={(e) => setForm({ ...form, professionalInterests: e.target.value })} placeholder="e.g. Anamorphic lenses, Sci-Fi" />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ── Edit Contact Modal ─────────────────────────────────────

function ContactEditModal({ contact, open, onClose }: { contact: Contact; open: boolean; onClose: () => void }) {
  const { dispatch, addActivity, organisations } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const hasExtra = Boolean(
    contact.alternativeEmail || contact.facebook || contact.imdb || contact.personalWebsite ||
    contact.notableProjects || contact.previousOrganisation || contact.professionalInterests ||
    contact.portfolioUrl || contact.relevanceToDop || contact.sourceUrl ||
    contact.designation || contact.whatsapp || contact.city || contact.instagram || contact.linkedin
  );
  const [showMore, setShowMore] = useState(hasExtra);
  const [form, setForm] = useState<Contact>(contact);

  const handleSubmit = () => {
    dispatch({ type: 'UPDATE_CONTACT', payload: form });
    addActivity('org_updated', `Contact ${form.fullName} updated`, 'Owner');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Contact"
      subtitle={contact.fullName}
      size="xl"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit}>Save Changes</Button></>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Row 1: Names & Specialisation (moved UP) */}
        <Input label="First Name *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value, fullName: `${e.target.value} ${form.lastName}`.trim() })} />
        <Input label="Last Name *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value, fullName: `${form.firstName} ${e.target.value}`.trim() })} />
        <Select label="Specialisation" value={form.specialisation} onChange={(e) => setForm({ ...form, specialisation: e.target.value })}>
          <option>Commercials</option><option>Feature Films</option><option>Short Films</option><option>Music Videos</option><option>Documentary</option><option>Digital Content</option><option>Branded Content</option><option>Television</option><option>OTT</option><option>Other</option>
        </Select>

        {/* Row 2: Organisation, Department (updated options + direct text box), Experience Level (moved UP) */}
        <Select label="Organisation" value={form.organisationId} onChange={(e) => {
          const org = organisations.find((o) => o.id === e.target.value);
          setForm({ ...form, organisationId: e.target.value, organisationName: org?.name ?? '', currentOrganisation: org?.name ?? '', industryCategory: org?.industryFocus ?? '' });
        }}>
          <option value="">None</option>
          {organisations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </Select>
        <DepartmentField value={form.department} onChange={(val) => setForm({ ...form, department: val })} />
        <Select label="Experience Level" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
          <option>Senior</option><option>Mid-level</option><option>Emerging</option><option>Unknown</option>
        </Select>

        {/* Row 3: Priority, Phone, Professional Email */}
        <Select label="Priority" value={normalizePriority(form.contactPriority)} onChange={(e) => setForm({ ...form, contactPriority: e.target.value as any })}>
          <option value="Lead">Lead</option>
          <option value="Interested lead">Interested lead</option>
          <option value="Ingaging">Ingaging</option>
          <option value="Cold reply">Cold reply</option>
          <option value="Not interested">Not interested</option>
        </Select>
        <Input label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="Professional Email" type="email" value={form.professionalEmail} onChange={(e) => setForm({ ...form, professionalEmail: e.target.value })} />

        {/* Row 4: Introduction Through (moved UP), Contact Status, Relationship Status */}
        <Input label="Introduction Through" value={form.introductionThrough} onChange={(e) => setForm({ ...form, introductionThrough: e.target.value })} />
        <Select label="Contact Status" value={form.contactStatus} onChange={(e) => setForm({ ...form, contactStatus: e.target.value as Contact['contactStatus'] })}>
          <option value="Not Contacted">Not Contacted</option>
          <option value="Contacted">Contacted</option>
          <option value="Replied">Replied</option>
          <option value="Meeting">Meeting</option>
          <option value="Active Relationship">Active Relationship</option>
          <option value="Inactive">Inactive</option>
        </Select>
        <Select label="Relationship Status" value={form.relationshipStatus} onChange={(e) => setForm({ ...form, relationshipStatus: e.target.value as 'Cold' | 'Warm' | 'Existing' })}>
          <option value="Cold">Cold</option>
          <option value="Warm">Warm</option>
          <option value="Existing">Existing</option>
        </Select>

        {/* Row 5: Next Follow-up (with quick intervals), Next Action, Contact Owner */}
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
            value={form.nextFollowUpDate || ''}
            onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })}
          />
          <QuickDateIntervals
            value={form.nextFollowUpDate || ''}
            onChange={(date) => setForm({ ...form, nextFollowUpDate: date })}
          />
        </div>

        <Input label="Next Action" value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} />

        <Select label="Contact Owner" value={form.contactOwner} onChange={(e) => setForm({ ...form, contactOwner: e.target.value })}>
          <option value="Assistant">Assistant</option><option value="DOP">DOP</option><option value="Owner">Owner</option>
        </Select>

        {/* Row 6: Last Contact Date (Auto) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Last Contact Date</label>
            <span className="text-2xs text-accent font-medium bg-accent/10 px-1.5 py-0.5 rounded">Automatic</span>
          </div>
          <Input type="date" value={form.lastContactDate || today} onChange={(e) => setForm({ ...form, lastContactDate: e.target.value })} />
        </div>

        {/* Row 7: Notes */}
        <div className="col-span-full">
          <Textarea label="Relationship Notes" rows={2} value={form.relationshipNotes} onChange={(e) => setForm({ ...form, relationshipNotes: e.target.value })} />
        </div>

        {/* Additional Information Toggle */}
        <div className="col-span-full pt-2 border-t border-border-subtle/60 flex items-center justify-between">
          <span className="text-xs font-heading font-medium text-text-muted uppercase tracking-wider">Additional Information</span>
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {showMore ? '▲ Hide Details' : '▼ Show More (Designation, Location, Socials, WhatsApp & Details)'}
          </button>
        </div>

        {showMore && (
          <>
            <div className="col-span-full flex flex-wrap gap-6 py-1">
              <Checkbox label="Portfolio Shared" checked={form.portfolioShared} onChange={(v) => setForm({ ...form, portfolioShared: v })} />
              <Checkbox label="Showreel Shared" checked={form.showreelShared} onChange={(v) => setForm({ ...form, showreelShared: v })} />
              <Checkbox label="Do Not Contact" checked={form.doNotContact} onChange={(v) => setForm({ ...form, doNotContact: v })} />
            </div>

            {/* Hidden / Down: Professional Designation, WhatsApp, City & Country */}
            <Input label="Professional Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>

            {/* Hidden / Down: Instagram URL, LinkedIn URL */}
            <Input label="Instagram URL" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
            <Input label="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />

            <Input label="Alternative Email" type="email" value={form.alternativeEmail} onChange={(e) => setForm({ ...form, alternativeEmail: e.target.value })} />
            <Input label="Personal Website" value={form.personalWebsite} onChange={(e) => setForm({ ...form, personalWebsite: e.target.value })} />
            <Input label="IMDb URL" value={form.imdb} onChange={(e) => setForm({ ...form, imdb: e.target.value })} />
            <Input label="Facebook URL" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
            <Input label="Portfolio URL" value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} />
            <Input label="Source URL" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} />

            <Select label="Connection Type" value={form.connectionType} onChange={(e) => setForm({ ...form, connectionType: e.target.value })}>
              <option>Direct</option><option>Referral</option><option>Cold</option><option>Existing Relationship</option><option>Other</option>
            </Select>

            <Input label="Previous Organisation" value={form.previousOrganisation} onChange={(e) => setForm({ ...form, previousOrganisation: e.target.value })} />
            <Input label="Relevance to DOP" value={form.relevanceToDop} onChange={(e) => setForm({ ...form, relevanceToDop: e.target.value })} />

            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Notable Projects" value={form.notableProjects} onChange={(e) => setForm({ ...form, notableProjects: e.target.value })} />
              <Input label="Professional Interests" value={form.professionalInterests} onChange={(e) => setForm({ ...form, professionalInterests: e.target.value })} />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ── Log Outreach Modal ─────────────────────────────────────

function LogOutreachModal({ contactId, open, onClose }: { contactId: string; open: boolean; onClose: () => void }) {
  const { dispatch, genId, addActivity, contacts } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const contact = contacts.find((c) => c.id === contactId);
  const [showMore, setShowMore] = useState(false);
  const [form, setForm] = useState({
    channel: 'Email' as Contact['lastChannel'],
    type: 'Introduction' as Outreach['type'],
    messageTemplate: 'Manual entry',
    personalisationReason: '',
    messageReference: '',
    deliveryStatus: 'Sent' as Outreach['deliveryStatus'],
    responseReceived: false,
    responseDate: '',
    responseSummary: '',
    responseSentiment: '' as Outreach['responseSentiment'],
    portfolioSent: false,
    showreelSent: false,
    nextAction: '',
    nextActionDate: '',
    handledBy: 'Assistant',
    notes: '',
  });

  const handleSubmit = () => {
    const id = genId('OUT');
    const outreach: Outreach = {
      id,
      contactId,
      contactName: contact?.fullName ?? '',
      organisationId: contact?.organisationId ?? '',
      organisationName: contact?.organisationName ?? '',
      date: today,
      channel: form.channel,
      type: form.type,
      messageTemplate: form.messageTemplate || 'Manual entry',
      personalisationReason: form.personalisationReason,
      portfolioSent: form.portfolioSent,
      showreelSent: form.showreelSent,
      messageReference: form.messageReference,
      deliveryStatus: form.deliveryStatus,
      responseReceived: form.responseReceived,
      responseDate: form.responseDate,
      responseSummary: form.responseSummary,
      responseSentiment: form.responseSentiment,
      nextAction: form.nextAction,
      nextActionDate: form.nextActionDate,
      handledBy: form.handledBy,
      notes: form.notes,
    };
    dispatch({ type: 'ADD_OUTREACH', payload: outreach });
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
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log Outreach"
      subtitle={contact?.fullName}
      size="xl"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={handleSubmit}>Record</Button></>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Row 1: Channel, Type, Delivery */}
        <Select label="Communication Channel" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as typeof form.channel })}>
          <option>Email</option><option>WhatsApp</option><option>Instagram</option><option>LinkedIn</option><option>Phone</option><option>In Person</option><option>Other</option>
        </Select>
        <Select label="Outreach Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}>
          <option>Introduction</option>
          <option>Portfolio Submission</option>
          <option>Showreel Submission</option>
          <option>Networking</option>
          <option>Follow-up</option>
          <option>Referral Request</option>
          <option>Reconnection</option>
          <option>Other</option>
        </Select>
        <Select label="Delivery Status" value={form.deliveryStatus} onChange={(e) => setForm({ ...form, deliveryStatus: e.target.value as typeof form.deliveryStatus })}>
          <option>Sent</option><option>Failed</option><option>Bounced</option><option>Unknown</option>
        </Select>

        {/* Row 2: Next Action, Next Action Date (with intervals), Handled By */}
        <Input label="Next Action" value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="e.g. Follow up on proposal" />
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
        <Select label="Handled By" value={form.handledBy} onChange={(e) => setForm({ ...form, handledBy: e.target.value })}>
          <option>Assistant</option><option>DOP</option><option>Owner</option>
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
            <Select label="Response Sentiment" value={form.responseSentiment} onChange={(e) => setForm({ ...form, responseSentiment: e.target.value as typeof form.responseSentiment })}>
              <option value="">None / Blank</option><option value="Positive">Positive</option><option value="Neutral">Neutral</option><option value="Negative">Negative</option>
            </Select>
            <div className="col-span-full">
              <Textarea label="Response Summary" rows={2} value={form.responseSummary} onChange={(e) => setForm({ ...form, responseSummary: e.target.value })} placeholder="What did they say?" />
            </div>
          </>
        )}

        {/* Notes */}
        <div className="col-span-full">
          <Textarea label="Outreach Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Key details, conversation points..." />
        </div>

        {/* Additional Details Toggle */}
        <div className="col-span-full pt-2 border-t border-border-subtle/60 flex items-center justify-between">
          <span className="text-xs font-heading font-medium text-text-muted uppercase tracking-wider">Additional Information</span>
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {showMore ? '▲ Hide Details' : '▼ Show More (Message Template, Reason, Subject Reference)'}
          </button>
        </div>

        {showMore && (
          <>
            <Input label="Message Template / Version" value={form.messageTemplate} onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })} />
            <Input label="Personalisation / Reason" value={form.personalisationReason} onChange={(e) => setForm({ ...form, personalisationReason: e.target.value })} placeholder="Why reached out now..." />
            <Input label="Message / Email Reference" value={form.messageReference} onChange={(e) => setForm({ ...form, messageReference: e.target.value })} placeholder="Email subject or ref..." />
          </>
        )}
      </div>
    </Modal>
  );
}

// ── Contact 360 Profile ─────────────────────────────────────

type Tab = 'overview' | 'professional' | 'communication' | 'followups' | 'opportunities' | 'notes';

export function ContactProfile({ id, onBack }: { id: string; onBack: () => void }) {
  const { contacts, outreach, followUps, opportunities, dispatch, addActivity } = useData();
  const [tab, setTab] = useState<Tab>('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const contact = contacts.find((c) => c.id === id);
  if (!contact) return <EmptyState title="Contact not found" />;

  const contactOutreach = outreach.filter((o) => o.contactId === id);
  const contactFollowUps = followUps.filter((f) => f.contactId === id);
  const contactOpps = opportunities.filter((o) => o.contactId === id);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'professional', label: 'Professional Details' },
    { id: 'communication', label: 'Communication', count: contactOutreach.length },
    { id: 'followups', label: 'Follow-ups', count: contactFollowUps.length },
    { id: 'opportunities', label: 'Opportunities', count: contactOpps.length },
    { id: 'notes', label: 'Notes' },
  ];

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    const updatedNote = contact.relationshipNotes
      ? `${contact.relationshipNotes}\n\n[${new Date().toISOString().slice(0, 10)}] ${noteText}`
      : `[${new Date().toISOString().slice(0, 10)}] ${noteText}`;
    dispatch({ type: 'UPDATE_CONTACT', payload: { ...contact, relationshipNotes: updatedNote } });
    addActivity('org_updated', `Note added to ${contact.fullName}`, 'Owner');
    setNoteText('');
  };

  return (
    <div className="animate-fade-in space-y-5">
      <button onClick={onBack} className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5">
        ← Back to Contacts
      </button>

      <Card className={`${getPriorityRowClasses(contact.contactPriority)} border-l-4 ${getPriorityFirstCellBorder(contact.contactPriority)}`}>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-xl font-heading font-bold text-accent shrink-0">
                {contact.firstName[0]}{contact.lastName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-heading font-bold tracking-tight text-text-primary">{contact.fullName}</h1>
                  <PriorityBadge priority={contact.contactPriority} />
                  {contact.doNotContact && <Badge tone="error">Do Not Contact</Badge>}
                </div>
                <p className="text-sm text-text-secondary mt-0.5">{contact.designation} · {contact.organisationName}</p>
                <div className="flex items-center gap-3 mt-1.5 text-2xs text-text-muted">
                  <span>{contact.id}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><MapPin size={11} /> {contact.city}, {contact.country}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const isStarred = Boolean(contact.starred ?? (normalizePriority(contact.contactPriority) === 'Lead'));
                  dispatch({ type: 'TOGGLE_STAR_CONTACT', payload: contact.id });
                  addActivity('contact_updated', `${isStarred ? 'Unstarred' : 'Starred'} ${contact.fullName}`, 'Owner');
                }}
                className={`p-2 rounded-lg border transition-all ${
                  (contact.starred ?? (normalizePriority(contact.contactPriority) === 'Lead'))
                    ? 'border-status-warning/50 bg-status-warning/15 text-status-warning hover:bg-status-warning/25'
                    : 'border-border-subtle bg-bg-secondary/40 text-text-muted hover:text-status-warning hover:border-status-warning/40'
                }`}
                title={(contact.starred ?? (normalizePriority(contact.contactPriority) === 'Lead')) ? 'Starred - Click to unstar' : 'Click to star'}
                aria-label="Toggle star"
              >
                <Star
                  size={16}
                  className={(contact.starred ?? (normalizePriority(contact.contactPriority) === 'Lead')) ? 'fill-status-warning text-status-warning' : ''}
                />
              </button>
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
              <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setDeleteConfirmOpen(true)}>Delete</Button>
              <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setOutreachOpen(true)}>Log Outreach</Button>
            </div>
          </div>
        </div>
        <div className="border-t border-border-subtle px-4 sm:px-6 flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {t.label}
              {t.count !== undefined && <span className="ml-1.5 text-2xs text-text-muted">({t.count})</span>}
              {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
            </button>
          ))}
        </div>
      </Card>

      {tab === 'overview' && <OverviewTab contact={contact} />}
      {tab === 'professional' && <ProfessionalTab contact={contact} />}
      {tab === 'communication' && <CommunicationTab records={contactOutreach} />}
      {tab === 'followups' && <FollowUpsTab records={contactFollowUps} />}
      {tab === 'opportunities' && <OpportunitiesTab records={contactOpps} />}
      {tab === 'notes' && (
        <Card>
          <CardHeader title="Notes" />
          <div className="px-5 pb-5">
            <div className="p-4 rounded-lg bg-bg-secondary/40 border border-border-subtle mb-3 max-h-60 overflow-y-auto">
              <div className="text-2xs font-medium uppercase tracking-wider text-text-muted mb-1">Relationship Notes</div>
              <p className="text-sm text-text-primary whitespace-pre-wrap">{contact.relationshipNotes || 'No notes recorded.'}</p>
            </div>
            <Textarea label="Add a note" rows={3} placeholder="Write a new note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            <div className="mt-2 flex justify-end"><Button size="sm" variant="primary" onClick={handleSaveNote}>Save Note</Button></div>
          </div>
        </Card>
      )}

      <ContactEditModal contact={contact} open={editOpen} onClose={() => setEditOpen(false)} />
      <LogOutreachModal contactId={id} open={outreachOpen} onClose={() => setOutreachOpen(false)} />

      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Contact"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={13} />}
              onClick={() => {
                dispatch({ type: 'DELETE_CONTACT', payload: contact.id });
                addActivity('org_updated', `Deleted contact ${contact.fullName}`, 'Owner');
                setDeleteConfirmOpen(false);
                onBack();
              }}
            >
              Delete Contact
            </Button>
          </div>
        }
      >
        <div className="space-y-2 py-1">
          <p className="text-sm text-text-primary">
            Are you sure you want to delete <strong className="text-accent">{contact.fullName}</strong>?
          </p>
          <p className="text-2xs text-text-muted">
            This permanently removes the contact from your workspace and Excel sheet. Syncing to Google Sheets will also remove it from Google Sheets.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function OverviewTab({ contact }: { contact: Contact }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="lg:col-span-2">
        <CardHeader title="Contact Information" />
        <div className="px-5 pb-5 grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label="Professional Email" value={contact.professionalEmail} icon={<Mail size={12} />} mailto />
          <Field label="Alternative Email" value={contact.alternativeEmail || '—'} mailto />
          <Field label="Phone" value={contact.phone} icon={<Phone size={12} />} tel />
          <Field label="WhatsApp" value={contact.whatsapp || '—'} tel />
          <Field label="Instagram" value={contact.instagram || '—'} />
          <Field label="LinkedIn" value={contact.linkedin || '—'} />
          <Field label="Facebook" value={contact.facebook || '—'} />
          <Field label="IMDb" value={contact.imdb || '—'} />
          <Field label="Personal Website" value={contact.personalWebsite || '—'} link />
        </div>
      </Card>
      <Card>
        <CardHeader title="Relationship Management" />
        <div className="px-5 pb-5 space-y-2.5">
          <Row label="Relationship Status" value={contact.relationshipStatus} />
          <Row label="Contact Status">
            <Badge tone={contact.contactStatus === 'Active Relationship' ? 'success' : contact.contactStatus === 'Meeting' ? 'accent' : contact.contactStatus === 'Replied' ? 'info' : 'default'}>
              {contact.contactStatus}
            </Badge>
          </Row>
          <Row label="Response Status" value={contact.responseStatus} />
          <Row label="Portfolio Shared" value={contact.portfolioShared ? 'Yes' : 'No'} />
          <Row label="Showreel Shared" value={contact.showreelShared ? 'Yes' : 'No'} />
          <Row label="First Contact" value={contact.firstContactDate} />
          <Row label="Last Contact" value={contact.lastContactDate} />
          <Row label="Last Channel" value={contact.lastChannel} />
          <Row label="Next Follow-up" value={contact.nextFollowUpDate || '—'} />
          <Row label="Next Action" value={contact.nextAction || '—'} />
          <Row label="Contact Owner" value={contact.contactOwner} />
          <Row label="Do Not Contact">
            <Badge tone={contact.doNotContact ? 'error' : 'success'}>{contact.doNotContact ? 'Yes' : 'No'}</Badge>
          </Row>
        </div>
      </Card>
    </div>
  );
}

function ProfessionalTab({ contact }: { contact: Contact }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card>
        <CardHeader title="Professional Background" />
        <div className="px-5 pb-5 space-y-2.5">
          <Row label="Experience Level" value={contact.experienceLevel} />
          <Row label="Specialisation" value={contact.specialisation} />
          <Row label="Notable Projects" value={contact.notableProjects} />
          <Row label="Current Organisation" value={contact.currentOrganisation} />
          <Row label="Previous Organisation" value={contact.previousOrganisation} />
          <Row label="Professional Interests" value={contact.professionalInterests} />
          <Row label="Portfolio URL" value={contact.portfolioUrl || '—'} />
        </div>
      </Card>
      <Card>
        <CardHeader title="Connection Details" />
        <div className="px-5 pb-5 space-y-2.5">
          <Row label="Relevance to DOP" value={contact.relevanceToDop} />
          <Row label="Connection Type" value={contact.connectionType} />
          <Row label="Introduction Through" value={contact.introductionThrough} />
          <Row label="Industry Category" value={contact.industryCategory} />
          <Row label="Department" value={contact.department} />
          <Row label="Source URL" value={contact.sourceUrl || '—'} />
          <Row label="Date Added" value={contact.dateAdded} />
          <Row label="Last Verified" value={contact.lastVerified} />
        </div>
      </Card>
    </div>
  );
}

function CommunicationTab({ records }: { records: ReturnType<typeof useData>['outreach'] }) {
  if (records.length === 0) return <EmptyState title="No communication history" description="No outreach has been recorded for this contact yet." />;
  return (
    <Card>
      <CardHeader title="Communication History" subtitle={`${records.length} recorded interactions`} />
      <div className="px-5 pb-5">
        <div className="space-y-3">
          {records.map((rec) => (
            <div key={rec.id} className="flex gap-3 py-3 border-b border-border-subtle last:border-0">
              <div className="w-10 h-10 rounded-lg bg-bg-secondary border border-border-subtle flex items-center justify-center shrink-0 text-2xs font-medium text-text-secondary">
                {rec.channel.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-text-primary">{rec.type}</span>
                  <Badge tone={rec.deliveryStatus === 'Sent' ? 'success' : rec.deliveryStatus === 'Failed' || rec.deliveryStatus === 'Bounced' ? 'error' : 'info'}>{rec.deliveryStatus}</Badge>
                  <Badge tone={rec.responseSentiment === 'Positive' ? 'success' : rec.responseSentiment === 'Negative' ? 'error' : 'default'}>{rec.responseSentiment}</Badge>
                </div>
                <p className="text-xs text-text-secondary mt-1">{rec.messageTemplate}</p>
                {rec.responseSummary && (
                  <div className="mt-1.5 p-2 rounded-md bg-bg-secondary/50 border border-border-subtle">
                    <span className="text-2xs font-medium uppercase tracking-wider text-text-muted">Response</span>
                    <p className="text-xs text-text-primary mt-0.5">{rec.responseSummary}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-2xs text-text-muted">
                  <span>{rec.date}</span><span>·</span><span>{rec.channel}</span>
                  {rec.portfolioSent && <><span>·</span><span>Portfolio sent</span></>}
                  {rec.showreelSent && <><span>·</span><span>Showreel sent</span></>}
                  <span>·</span><span>by {rec.handledBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function FollowUpsTab({ records }: { records: ReturnType<typeof useData>['followUps'] }) {
  if (records.length === 0) return <EmptyState title="No follow-ups" description="No follow-ups scheduled for this contact." />;
  return (
    <Card>
      <CardHeader title="Follow-ups" subtitle={`${records.length} records`} />
      <div className="px-5 pb-5 space-y-2">
        {records.map((f) => (
          <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary/40 border border-border-subtle">
            <div>
              <div className="text-sm text-text-primary">{f.reason}</div>
              <div className="text-2xs text-text-muted mt-0.5">{f.scheduledDate} · {f.channel} · {f.id}</div>
            </div>
            <Badge tone={f.completed ? 'success' : f.category === 'Overdue' ? 'error' : f.category === 'Due Today' ? 'warning' : 'info'}>{f.category}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

function OpportunitiesTab({ records }: { records: ReturnType<typeof useData>['opportunities'] }) {
  if (records.length === 0) return <EmptyState title="No opportunities" description="No opportunities linked to this contact." />;
  return (
    <Card>
      <CardHeader title="Opportunities" subtitle={`${records.length} linked`} />
      <div className="px-5 pb-5 space-y-2">
        {records.map((o) => (
          <div key={o.id} className="p-3 rounded-lg bg-bg-secondary/40 border border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-text-primary">{o.name}</div>
              <Badge tone={o.stage === 'Confirmed' ? 'success' : o.stage === 'Lost' ? 'error' : 'info'}>{o.stage}</Badge>
            </div>
            <div className="text-2xs text-text-muted mt-1">{o.id} · {o.organisationName} · Shoot: {o.expectedShootDate}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Field({ label, value, icon, link, mailto, tel }: { label: string; value: string; icon?: React.ReactNode; link?: boolean; mailto?: boolean; tel?: boolean }) {
  return (
    <div>
      <div className="text-2xs font-medium uppercase tracking-wider text-text-muted mb-0.5">{label}</div>
      {mailto && value !== '—' ? (
        <a href={`mailto:${value}`} className="text-sm text-accent hover:text-accent-hover flex items-center gap-1.5">{icon && <span className="text-text-muted">{icon}</span>}{value}</a>
      ) : tel && value !== '—' ? (
        <a href={`tel:${value}`} className="text-sm text-accent hover:text-accent-hover flex items-center gap-1.5">{icon && <span className="text-text-muted">{icon}</span>}{value}</a>
      ) : link && value !== '—' ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent-hover flex items-center gap-1.5">{value}</a>
      ) : (
        <div className="text-sm text-text-primary flex items-center gap-1.5">{icon && <span className="text-text-muted">{icon}</span>}{value}</div>
      )}
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-text-secondary">{label}</span>
      {children ?? <span className="text-sm text-text-primary">{value}</span>}
    </div>
  );
}
