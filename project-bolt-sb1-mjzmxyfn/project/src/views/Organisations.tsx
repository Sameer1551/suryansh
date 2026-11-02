import { useState } from 'react';
import { Plus, ExternalLink, Download, Trash2 } from 'lucide-react';
import { PageHeader, SearchInput, EmptyState } from '@/components/ui/Common';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, PriorityBadge, ContactStatusBadge, normalizePriority, getPriorityRowClasses, getPriorityFirstCellBorder, PRIORITY_RANK } from '@/components/ui/Badge';
import { Modal, Select, Input, Textarea, QuickDateIntervals } from '@/components/ui';
import { useData } from '@/store/DataContext';
import { exportToCsv } from '@/utils/exportCsv';
import { type Organisation, type OrgType } from '@/types';

interface Props {
  onOpenProfile: (id: string) => void;
}

const typeFilters: ('All' | OrgType)[] = [
  'All',
  'Director',
  'DOP',
  'Production House',
  'Agency',
  'Event Company',
  'Wedding',
  'Client',
  'Advertising Agency',
  'Creative Agency',
  'Film Studio',
  'Brand',
  'OTT / Streaming',
  'Post-production House',
  'Other',
];

export function OrganisationsView({ onOpenProfile }: Props) {
  const { organisations, dispatch, addActivity } = useData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'priority'>('date');
  const [addOpen, setAddOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organisation | null>(null);

  const cities = ['All', ...Array.from(new Set(organisations.map((o) => o.city).filter(Boolean)))];

  let filtered = organisations.filter((o) => {
    if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.keyWork.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'All' && o.type !== typeFilter) return false;
    if (cityFilter !== 'All' && o.city !== cityFilter) return false;
    if (priorityFilter !== 'All' && normalizePriority(o.priority) !== priorityFilter) return false;
    if (statusFilter !== 'All' && (o.contactStatus || o.status) !== statusFilter) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'priority') return (PRIORITY_RANK[normalizePriority(a.priority)] || 99) - (PRIORITY_RANK[normalizePriority(b.priority)] || 99);
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });

  const handleExport = () => {
    exportToCsv('organisations', filtered.map((o) => ({
      ID: o.id, Name: o.name, Type: o.type, Subcategory: o.subcategory, Website: o.website,
      City: o.city, State: o.state, Country: o.country, Address: o.officeAddress, Email: o.generalEmail, Phone: o.officePhone,
      Instagram: o.instagram, LinkedIn: o.linkedin, YouTube: o.youtube, IMDb: o.imdb, KeyWork: o.keyWork, Industry: o.industryFocus,
      Departments: o.relevantDepartments, Priority: o.priority, ContactStatus: o.contactStatus || o.status, ResearchSource: o.researchSourceUrl,
      DateAdded: o.dateAdded, LastVerified: o.lastVerified, AssociatedContacts: (o.associatedContactIds || []).join(', '),
      Notes: o.notes,
    })));
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Organisations"
        subtitle={`${organisations.length} organisations tracked`}
        action={
          <>
            <Button variant="secondary" icon={<Download size={16} />} onClick={handleExport}>Export CSV</Button>
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setAddOpen(true)}>Add Organisation</Button>
          </>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4">
          <SearchInput placeholder="Search organisations..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-auto min-w-[140px] text-xs py-2">
              {typeFilters.map((t) => <option key={t} value={t}>{t === 'All' ? 'All Categories' : t}</option>)}
            </Select>
            <Select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="w-auto min-w-[110px] text-xs py-2">
              {cities.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>)}
            </Select>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-auto min-w-[145px] text-xs py-2">
              <option value="All">All Priority</option>
              <option value="Lead">Lead</option>
              <option value="Interested lead">Interested lead</option>
              <option value="Ingaging">Ingaging</option>
              <option value="Cold reply">Cold reply</option>
              <option value="Not interested">Not interested</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto min-w-[130px] text-xs py-2">
              <option value="All">All Status</option>
              <option value="Not Contacted">Not Contacted</option>
              <option value="Contacted">Contacted</option>
              <option value="Replied">Replied</option>
              <option value="Meeting">Meeting</option>
              <option value="Active Relationship">Active Relationship</option>
              <option value="Inactive">Inactive</option>
            </Select>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'priority')} className="w-auto min-w-[120px] text-xs py-2">
              <option value="date">Newest First</option><option value="name">Name A–Z</option><option value="priority">Priority</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState title="No organisations found" description="Try adjusting your filters or add a new organisation." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2">Organisation</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2 hidden md:table-cell">Category / Project Type</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2 hidden lg:table-cell">City</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2 hidden lg:table-cell">Industry</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2">Priority</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2 hidden md:table-cell">Contact Status</th>
                  <th className="text-left text-2xs font-medium uppercase tracking-wider text-text-muted px-4 py-2 hidden xl:table-cell">Added</th>
                  <th className="w-12 px-3 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((org) => (
                  <tr
                    key={org.id}
                    onClick={() => onOpenProfile(org.id)}
                    className={`group border-b border-border-subtle last:border-0 cursor-pointer ${getPriorityRowClasses(org.priority)}`}
                  >
                    <td className={`px-4 py-1.5 ${getPriorityFirstCellBorder(org.priority)}`}>
                      <div className="font-medium text-text-primary leading-snug truncate">{org.name}</div>
                      <div className="text-3xs text-text-muted leading-tight">{org.id}</div>
                    </td>
                    <td className="px-4 py-1.5 text-text-secondary hidden md:table-cell">
                      <div className="font-medium text-text-primary text-xs leading-snug">{org.type}</div>
                      {org.subcategory && <div className="text-3xs text-text-muted leading-tight">{org.subcategory}</div>}
                    </td>
                    <td className="px-4 py-1.5 text-text-secondary text-xs hidden lg:table-cell">{org.city}</td>
                    <td className="px-4 py-1.5 text-text-secondary text-xs hidden lg:table-cell">{org.industryFocus}</td>
                    <td className="px-4 py-1.5"><PriorityBadge priority={org.priority} /></td>
                    <td className="px-4 py-1.5 hidden md:table-cell">
                      <ContactStatusBadge status={org.contactStatus || org.status} />
                    </td>
                    <td className="px-4 py-1.5 text-text-secondary text-xs hidden xl:table-cell">{org.dateAdded}</td>
                    <td className="px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setOrgToDelete(org)}
                        className="p-1 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title={`Delete ${org.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <OrgAddModal open={addOpen} onClose={() => setAddOpen(false)} />

      <Modal
        open={!!orgToDelete}
        onClose={() => setOrgToDelete(null)}
        title="Delete Organisation"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setOrgToDelete(null)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={13} />}
              onClick={() => {
                if (orgToDelete) {
                  dispatch({ type: 'DELETE_ORG', payload: orgToDelete.id });
                  addActivity('org_updated', `Deleted organisation ${orgToDelete.name}`, 'Owner');
                  setOrgToDelete(null);
                }
              }}
            >
              Delete Organisation
            </Button>
          </div>
        }
      >
        <div className="space-y-2 py-1">
          <p className="text-sm text-text-primary">
            Are you sure you want to delete <strong className="text-accent">{orgToDelete?.name}</strong>?
          </p>
          <p className="text-2xs text-text-muted">
            This permanently removes the organisation from your workspace and Excel sheet. Syncing to Google Sheets will also remove it from Google Sheets.
          </p>
        </div>
      </Modal>
    </div>
  );
}

// ── Add Org Modal ───────────────────────────────────────────

function OrgAddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch, genId, addActivity } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const [showMore, setShowMore] = useState(false);
  const [form, setForm] = useState({
    type: 'Director' as OrgType,
    name: '',
    subcategory: '',
    followUpReminder: '',
    researchSourceUrl: '',
    status: 'Not Contacted' as Organisation['status'],
    contactStatus: 'Not Contacted' as any,
    generalEmail: '',
    officePhone: '',
    instagram: '',
    website: '',
    city: '',
    state: '',
    country: 'India',
    lastContactDate: today,
    notes: '',
    priority: '2' as any,
    industryFocus: '',
    relevantDepartments: '',
    officeAddress: '',
    linkedin: '',
    youtube: '',
    imdb: '',
    associatedContactIds: '',
    keyWork: '',
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const id = genId('ORG');
    const contactsArray = form.associatedContactIds
      ? form.associatedContactIds.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const org: Organisation = {
      id,
      name: form.name.trim(),
      type: form.type,
      subcategory: form.subcategory.trim(),
      website: form.website.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      officeAddress: form.officeAddress.trim(),
      generalEmail: form.generalEmail.trim(),
      officePhone: form.officePhone.trim(),
      instagram: form.instagram.trim(),
      linkedin: form.linkedin.trim(),
      youtube: form.youtube.trim(),
      imdb: form.imdb.trim(),
      keyWork: form.keyWork.trim(),
      industryFocus: form.industryFocus.trim(),
      relevantDepartments: form.relevantDepartments.trim(),
      priority: form.priority,
      status: (form.contactStatus || form.status) as any,
      contactStatus: (form.contactStatus || form.status) as any,
      researchSourceUrl: form.researchSourceUrl.trim(),
      dateAdded: today,
      lastVerified: today,
      associatedContactIds: contactsArray,
      notes: form.notes.trim(),
      followUpReminder: form.followUpReminder || undefined,
      lastContactDate: form.lastContactDate || today,
    };
    dispatch({ type: 'ADD_ORG', payload: org });
    addActivity('org_updated', `${org.name} added`, 'Assistant');

    if (form.followUpReminder) {
      const fupId = genId('FUP');
      dispatch({
        type: 'ADD_FOLLOWUP',
        payload: {
          id: fupId,
          contactId: '',
          contactName: org.name,
          organisationName: org.name,
          previousContactDate: form.lastContactDate || today,
          previousCommunicationSummary: 'Organisation creation follow-up',
          followUpNumber: 1,
          scheduledDate: form.followUpReminder,
          channel: 'Email',
          reason: `Follow-up with ${org.name}`,
          status: 'Pending',
          responseReceived: false,
          responseSummary: '',
          nextFollowUpDate: '',
          assignedTo: 'Owner',
          notes: form.notes || '',
        },
      });
    }

    setForm({
      type: 'Director',
      name: '',
      subcategory: '',
      followUpReminder: '',
      researchSourceUrl: '',
      status: 'Not Contacted',
      contactStatus: 'Not Contacted',
      generalEmail: '',
      officePhone: '',
      instagram: '',
      website: '',
      city: '',
      state: '',
      country: 'India',
      lastContactDate: today,
      notes: '',
      priority: '2',
      industryFocus: '',
      relevantDepartments: '',
      officeAddress: '',
      linkedin: '',
      youtube: '',
      imdb: '',
      associatedContactIds: '',
      keyWork: '',
    });
    setShowMore(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Organisation"
      subtitle="A new organisation will be assigned a unique ID"
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Add Organisation</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Row 1: Category, Organisation Name, Project Type */}
        <Select label="Category *" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as OrgType })}>
          <option value="Director">Director</option>
          <option value="DOP">DOP</option>
          <option value="Production House">Production House</option>
          <option value="Agency">Agency</option>
          <option value="Event Company">Event Company</option>
          <option value="Wedding">Wedding</option>
          <option value="Client">Client</option>
          <option value="Advertising Agency">Advertising Agency</option>
          <option value="Creative Agency">Creative Agency</option>
          <option value="Film Studio">Film Studio</option>
          <option value="Brand">Brand</option>
          <option value="OTT / Streaming">OTT / Streaming</option>
          <option value="Post-production House">Post-production House</option>
          <option value="Other">Other</option>
        </Select>
        <Input label="Organisation Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Riverside Films" required />
        <Input label="Project Type" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder="e.g. Commercials / TVCs, Feature Films" />

        {/* Row 2: Follow up Reminder, Source, Status */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Follow up Reminder</label>
            {form.followUpReminder && (
              <button
                type="button"
                onClick={() => setForm({ ...form, followUpReminder: '' })}
                className="text-2xs text-text-muted hover:text-status-error transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <Input
            type="date"
            value={form.followUpReminder}
            onChange={(e) => setForm({ ...form, followUpReminder: e.target.value })}
          />
          <QuickDateIntervals
            value={form.followUpReminder}
            onChange={(date) => setForm({ ...form, followUpReminder: date })}
          />
        </div>

        <Input label="Source" value={form.researchSourceUrl} onChange={(e) => setForm({ ...form, researchSourceUrl: e.target.value })} placeholder="e.g. Instagram, Referral, Website, Google" />
        <Select
          label="Contact Status"
          value={form.contactStatus || form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as any, contactStatus: e.target.value as any })}
        >
          <option value="Not Contacted">Not Contacted</option>
          <option value="Contacted">Contacted</option>
          <option value="Replied">Replied</option>
          <option value="Meeting">Meeting</option>
          <option value="Active Relationship">Active Relationship</option>
          <option value="Inactive">Inactive</option>
        </Select>

        {/* Row 3: Email, Phone Number, Instagram URL */}
        <Input label="Email" type="email" value={form.generalEmail} onChange={(e) => setForm({ ...form, generalEmail: e.target.value })} placeholder="contact@company.com" />
        <Input label="Phone Number" value={form.officePhone} onChange={(e) => setForm({ ...form, officePhone: e.target.value })} placeholder="+91 ..." />
        <Input label="Instagram URL" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/..." />

        {/* Row 4: Website URL, City, State / Country */}
        <Input label="Website URL" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
        <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Mumbai" />
        <div className="grid grid-cols-2 gap-2">
          <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. MH" />
          <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="India" />
        </div>

        {/* Row 5: Last Contact Date (Automatic) & Priority */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Last Contact Date</label>
            <span className="text-2xs text-accent font-medium bg-accent/10 px-1.5 py-0.5 rounded">Automatic</span>
          </div>
          <Input
            type="date"
            value={form.lastContactDate}
            onChange={(e) => setForm({ ...form, lastContactDate: e.target.value })}
          />
        </div>

        <Select label="Priority" value={normalizePriority(form.priority)} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
          <option value="Lead">Lead</option>
          <option value="Interested lead">Interested lead</option>
          <option value="Ingaging">Ingaging</option>
          <option value="Cold reply">Cold reply</option>
          <option value="Not interested">Not interested</option>
        </Select>
        <Input label="Industry Focus" value={form.industryFocus} onChange={(e) => setForm({ ...form, industryFocus: e.target.value })} placeholder="e.g. Advertising, Cinema" />

        {/* Row 6: Notes */}
        <div className="col-span-full">
          <Textarea label="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Initial notes, conversation summary, or context..." />
        </div>

        {/* Row 7: Additional Details Toggle */}
        <div className="col-span-full pt-2 border-t border-border-subtle/60 flex items-center justify-between">
          <span className="text-xs font-heading font-medium text-text-muted uppercase tracking-wider">Additional Information</span>
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {showMore ? '▲ Hide Details' : '▼ Show More (Address, Socials, Clients)'}
          </button>
        </div>

        {showMore && (
          <>
            <Input label="Office Address" value={form.officeAddress} onChange={(e) => setForm({ ...form, officeAddress: e.target.value })} placeholder="Office address..." />
            <Input label="Relevant Departments" value={form.relevantDepartments} onChange={(e) => setForm({ ...form, relevantDepartments: e.target.value })} placeholder="e.g. Production, Creative" />
            <Input label="Associated Contact IDs" value={form.associatedContactIds} onChange={(e) => setForm({ ...form, associatedContactIds: e.target.value })} placeholder="CON-001, CON-002" />
            <Input label="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/..." />
            <Input label="YouTube URL" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} placeholder="https://youtube.com/..." />
            <Input label="IMDb URL" value={form.imdb} onChange={(e) => setForm({ ...form, imdb: e.target.value })} placeholder="https://imdb.com/..." />
            <div className="col-span-full">
              <Textarea label="Key Work / Clients" rows={2} value={form.keyWork} onChange={(e) => setForm({ ...form, keyWork: e.target.value })} placeholder="Notable campaigns, films, clients..." />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ── Edit Org Modal ──────────────────────────────────────────

function OrgEditModal({ org, open, onClose }: { org: Organisation; open: boolean; onClose: () => void }) {
  const { dispatch, addActivity, outreach, contacts } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const orgOutreach = outreach.filter((o) => o.organisationId === org.id || o.organisationName === org.name);
  const orgContacts = contacts.filter((c) => c.organisationId === org.id);
  const latestOutreachDate = orgOutreach.map((o) => o.date).sort().reverse()[0];
  const latestContactDate = orgContacts.map((c) => c.lastContactDate).filter(Boolean).sort().reverse()[0];
  const autoContactDate = latestOutreachDate || latestContactDate || org.lastContactDate || org.dateAdded || today;

  const hasExtra = Boolean(
    org.officeAddress || org.linkedin || org.youtube || org.imdb || org.keyWork || org.relevantDepartments || org.associatedContactIds?.length
  );
  const [showMore, setShowMore] = useState(hasExtra);
  const [form, setForm] = useState<Organisation>({
    ...org,
    lastContactDate: org.lastContactDate || autoContactDate,
  });
  const [contactIdsStr, setContactIdsStr] = useState((org.associatedContactIds || []).join(', '));

  const handleSubmit = () => {
    const contactsArray = contactIdsStr.split(',').map((s) => s.trim()).filter(Boolean);
    const currentContactStatus = (form.contactStatus || form.status || 'Not Contacted') as any;
    const updated: Organisation = {
      ...form,
      status: currentContactStatus,
      contactStatus: currentContactStatus,
      associatedContactIds: contactsArray,
      subcategory: form.subcategory.trim(),
      researchSourceUrl: form.researchSourceUrl.trim(),
      notes: form.notes.trim(),
      followUpReminder: form.followUpReminder || undefined,
      lastContactDate: form.lastContactDate || autoContactDate,
    };
    dispatch({ type: 'UPDATE_ORG', payload: updated });
    addActivity('org_updated', `${updated.name} updated`, 'Owner');

    if (form.followUpReminder && form.followUpReminder !== org.followUpReminder) {
      const fupId = `${org.id}-FUP`;
      dispatch({
        type: 'ADD_FOLLOWUP',
        payload: {
          id: fupId,
          contactId: '',
          contactName: updated.name,
          organisationName: updated.name,
          previousContactDate: form.lastContactDate || today,
          previousCommunicationSummary: 'Organisation reminder updated',
          followUpNumber: 1,
          scheduledDate: form.followUpReminder,
          channel: 'Email',
          reason: `Follow-up with ${updated.name}`,
          status: 'Pending',
          responseReceived: false,
          responseSummary: '',
          nextFollowUpDate: '',
          assignedTo: 'Owner',
          notes: form.notes || '',
        },
      });
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Organisation"
      subtitle={org.name}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Row 1: Category, Organisation Name, Project Type */}
        <Select label="Category *" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as OrgType })}>
          <option value="Director">Director</option>
          <option value="DOP">DOP</option>
          <option value="Production House">Production House</option>
          <option value="Agency">Agency</option>
          <option value="Event Company">Event Company</option>
          <option value="Wedding">Wedding</option>
          <option value="Client">Client</option>
          <option value="Advertising Agency">Advertising Agency</option>
          <option value="Creative Agency">Creative Agency</option>
          <option value="Film Studio">Film Studio</option>
          <option value="Brand">Brand</option>
          <option value="OTT / Streaming">OTT / Streaming</option>
          <option value="Post-production House">Post-production House</option>
          <option value="Other">Other</option>
        </Select>
        <Input label="Organisation Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Project Type" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder="e.g. Commercials / TVCs, Feature Films" />

        {/* Row 2: Follow up Reminder, Source, Status */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Follow up Reminder</label>
            {form.followUpReminder && (
              <button
                type="button"
                onClick={() => setForm({ ...form, followUpReminder: '' })}
                className="text-2xs text-text-muted hover:text-status-error transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <Input
            type="date"
            value={form.followUpReminder || ''}
            onChange={(e) => setForm({ ...form, followUpReminder: e.target.value })}
          />
          <QuickDateIntervals
            value={form.followUpReminder || ''}
            onChange={(date) => setForm({ ...form, followUpReminder: date })}
          />
        </div>

        <Input label="Source" value={form.researchSourceUrl} onChange={(e) => setForm({ ...form, researchSourceUrl: e.target.value })} placeholder="e.g. Instagram, Referral, Website, Google" />
        <Select
          label="Contact Status"
          value={form.contactStatus || form.status || 'Not Contacted'}
          onChange={(e) => setForm({ ...form, status: e.target.value as any, contactStatus: e.target.value as any })}
        >
          <option value="Not Contacted">Not Contacted</option>
          <option value="Contacted">Contacted</option>
          <option value="Replied">Replied</option>
          <option value="Meeting">Meeting</option>
          <option value="Active Relationship">Active Relationship</option>
          <option value="Inactive">Inactive</option>
        </Select>

        {/* Row 3: Email, Phone Number, Instagram URL */}
        <Input label="Email" type="email" value={form.generalEmail} onChange={(e) => setForm({ ...form, generalEmail: e.target.value })} />
        <Input label="Phone Number" value={form.officePhone} onChange={(e) => setForm({ ...form, officePhone: e.target.value })} />
        <Input label="Instagram URL" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />

        {/* Row 4: Website URL, City, State / Country */}
        <Input label="Website URL" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>

        {/* Row 5: Last Contact Date (Automatic) & Priority */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">Last Contact Date</label>
            <span className="text-2xs text-accent font-medium bg-accent/10 px-1.5 py-0.5 rounded">Automatic</span>
          </div>
          <Input
            type="date"
            value={form.lastContactDate || autoContactDate}
            onChange={(e) => setForm({ ...form, lastContactDate: e.target.value })}
          />
        </div>

        <Select label="Priority" value={normalizePriority(form.priority)} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
          <option value="Lead">Lead</option>
          <option value="Interested lead">Interested lead</option>
          <option value="Ingaging">Ingaging</option>
          <option value="Cold reply">Cold reply</option>
          <option value="Not interested">Not interested</option>
        </Select>
        <Input label="Industry Focus" value={form.industryFocus} onChange={(e) => setForm({ ...form, industryFocus: e.target.value })} />

        {/* Row 6: Notes */}
        <div className="col-span-full">
          <Textarea label="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        {/* Additional Details Toggle */}
        <div className="col-span-full pt-2 border-t border-border-subtle/60 flex items-center justify-between">
          <span className="text-xs font-heading font-medium text-text-muted uppercase tracking-wider">Additional Information</span>
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {showMore ? '▲ Hide Details' : '▼ Show More (Address, Socials, Clients)'}
          </button>
        </div>

        {showMore && (
          <>
            <Input label="Office Address" value={form.officeAddress} onChange={(e) => setForm({ ...form, officeAddress: e.target.value })} />
            <Input label="Relevant Departments" value={form.relevantDepartments} onChange={(e) => setForm({ ...form, relevantDepartments: e.target.value })} />
            <Input label="Associated Contact IDs" value={contactIdsStr} onChange={(e) => setContactIdsStr(e.target.value)} />
            <Input label="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
            <Input label="YouTube URL" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} />
            <Input label="IMDb URL" value={form.imdb} onChange={(e) => setForm({ ...form, imdb: e.target.value })} />
            <div className="col-span-full">
              <Textarea label="Key Work / Clients" rows={2} value={form.keyWork} onChange={(e) => setForm({ ...form, keyWork: e.target.value })} />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ── Organisation Profile ────────────────────────────────────

export function OrganisationProfile({ id, onBack, onOpenContact }: { id: string; onBack: () => void; onOpenContact: (id: string) => void }) {
  const { organisations, contacts, opportunities, outreach, dispatch, addActivity } = useData();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const org = organisations.find((o) => o.id === id);
  if (!org) return <EmptyState title="Organisation not found" />;

  const orgContacts = contacts.filter((c) => c.organisationId === id);
  const orgOpps = opportunities.filter((o) => o.organisationName === org.name);
  const orgOutreach = outreach.filter((o) => o.organisationId === id || o.organisationName === org.name);
  const latestOutreachDate = orgOutreach.map((o) => o.date).sort().reverse()[0];
  const latestContactDate = orgContacts.map((c) => c.lastContactDate).filter(Boolean).sort().reverse()[0];
  const autoLastContactDate = latestOutreachDate || latestContactDate || org.lastContactDate || 'Never';

  return (
    <div className="animate-fade-in space-y-5">
      <button onClick={onBack} className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5">
        ← Back to Organisations
      </button>

      <Card className={`${getPriorityRowClasses(org.priority)} border-l-4 ${getPriorityFirstCellBorder(org.priority)}`}>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-heading font-bold tracking-tight text-text-primary">{org.name}</h1>
                <PriorityBadge priority={org.priority} />
                <ContactStatusBadge status={org.contactStatus || org.status} />
              </div>
              <p className="text-sm text-text-secondary">
                <span className="font-medium text-text-primary">{org.type}</span>
                {org.subcategory && <span> · Project Type: <span className="text-text-primary">{org.subcategory}</span></span>}
                {org.industryFocus && <span> · {org.industryFocus}</span>}
              </p>
              <p className="text-2xs text-text-muted mt-1">{org.id} · Added {org.dateAdded}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
              <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setDeleteConfirmOpen(true)}>Delete</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5 pb-3"><h3 className="text-sm font-heading font-semibold">Details</h3></div>
          <div className="px-5 pb-5 grid grid-cols-2 gap-x-4 gap-y-3">
            <Field label="Category" value={org.type} />
            <Field label="Project Type" value={org.subcategory || '—'} />
            <Field label="Follow up Reminder" value={org.followUpReminder || 'None set'} />
            <Field label="Source" value={org.researchSourceUrl || '—'} link={org.researchSourceUrl?.startsWith('http')} />
            <Field label="Contact Status" value={org.contactStatus || org.status || 'Not Contacted'} />
            <Field label="Email" value={org.generalEmail || '—'} mailto />
            <Field label="Phone Number" value={org.officePhone || '—'} tel />
            <Field label="Instagram" value={org.instagram || '—'} />
            <Field label="Website" value={org.website || '—'} link />
            <Field label="City / State / Country" value={`${org.city}${org.state ? ', ' + org.state : ''}, ${org.country}`} />
            <Field label="Last Contact Date (Automatic)" value={autoLastContactDate} />
            <Field label="Notes" value={org.notes || '—'} full />
            <Field label="Priority" value={normalizePriority(org.priority)} />
            <Field label="Office Address" value={org.officeAddress || '—'} />
            <Field label="Industry Focus" value={org.industryFocus || '—'} />
            <Field label="Relevant Departments" value={org.relevantDepartments || '—'} />
            <Field label="LinkedIn" value={org.linkedin || '—'} />
            <Field label="YouTube" value={org.youtube || '—'} />
            <Field label="IMDb" value={org.imdb || '—'} link />
            <Field label="Key Work" value={org.keyWork || '—'} full />
            <Field label="Last Verified" value={org.lastVerified} />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-heading font-semibold">Associated Contacts</h3>
              <Badge>{orgContacts.length}</Badge>
            </div>
            <div className="px-5 pb-5 space-y-2">
              {orgContacts.length === 0 ? (
                <p className="text-xs text-text-muted py-2">No contacts linked yet.</p>
              ) : orgContacts.map((c) => (
                <button key={c.id} onClick={() => onOpenContact(c.id)} className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-bg-secondary/40 hover:bg-bg-secondary border border-border-subtle transition-colors text-left">
                  <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-xs font-heading font-semibold text-accent shrink-0">
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-text-primary truncate">{c.fullName}</div>
                    <div className="text-2xs text-text-secondary truncate">{c.designation}</div>
                  </div>
                  <PriorityBadge priority={c.contactPriority} />
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-heading font-semibold">Related Opportunities</h3>
              <Badge>{orgOpps.length}</Badge>
            </div>
            <div className="px-5 pb-5 space-y-2">
              {orgOpps.length === 0 ? (
                <p className="text-xs text-text-muted py-2">No opportunities linked.</p>
              ) : orgOpps.map((o) => (
                <div key={o.id} className="p-2.5 rounded-lg bg-bg-secondary/40 border border-border-subtle">
                  <div className="text-sm font-medium text-text-primary truncate">{o.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge tone={o.stage === 'Confirmed' ? 'success' : o.stage === 'Lost' ? 'error' : 'info'}>{o.stage}</Badge>
                    <span className="text-2xs text-text-muted">{o.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <OrgEditModal org={org} open={editOpen} onClose={() => setEditOpen(false)} />

      <Modal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Organisation"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={13} />}
              onClick={() => {
                dispatch({ type: 'DELETE_ORG', payload: org.id });
                addActivity('org_updated', `Deleted organisation ${org.name}`, 'Owner');
                setDeleteConfirmOpen(false);
                onBack();
              }}
            >
              Delete Organisation
            </Button>
          </div>
        }
      >
        <div className="space-y-2 py-1">
          <p className="text-sm text-text-primary">
            Are you sure you want to delete <strong className="text-accent">{org.name}</strong>?
          </p>
          <p className="text-2xs text-text-muted">
            This permanently removes the organisation from your workspace and Excel sheet. Syncing to Google Sheets will also remove it from Google Sheets.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, value, link, mailto, tel, full }: { label: string; value: string; link?: boolean; mailto?: boolean; tel?: boolean; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <div className="text-2xs font-medium uppercase tracking-wider text-text-muted mb-0.5">{label}</div>
      {mailto ? (
        <a href={`mailto:${value}`} className="text-sm text-accent hover:text-accent-hover flex items-center gap-1">{value}<ExternalLink size={12} /></a>
      ) : tel ? (
        <a href={`tel:${value}`} className="text-sm text-accent hover:text-accent-hover">{value}</a>
      ) : link && value !== '—' ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent-hover flex items-center gap-1">{value}<ExternalLink size={12} /></a>
      ) : (
        <div className="text-sm text-text-primary">{value}</div>
      )}
    </div>
  );
}
