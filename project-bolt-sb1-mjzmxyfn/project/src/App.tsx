import { useState } from 'react';
import { Sidebar, Topbar } from '@/components/Sidebar';
import { type ViewId } from '@/components/navigation';
import { Modal, Button } from '@/components/ui';
import { Select } from '@/components/ui/Form';
import { DataProvider } from '@/store/DataContext';
import { OverviewView } from '@/views/Overview';
import { OrganisationsView, OrganisationProfile } from '@/views/Organisations';
import { ContactsView, ContactProfile } from '@/views/Contacts';
import { OutreachView } from '@/views/Outreach';
import { FollowUpsView } from '@/views/FollowUps';
import { OpportunitiesView } from '@/views/Opportunities';
import { NetworkView } from '@/views/Network';
import { ResearchView } from '@/views/Research';
import { PortfolioView } from '@/views/Portfolio';
import { ReportsView } from '@/views/Reports';
import { SettingsView } from '@/views/Settings';

export default function App() {
  const [view, setView] = useState<ViewId>('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const handleNavigate = (id: ViewId) => {
    setView(id);
    setDetailId(null);
  };

  const renderView = () => {
    switch (view) {
      case 'overview': return <OverviewView onNavigate={handleNavigate} />;
      case 'organisations':
        return detailId
          ? <OrganisationProfile id={detailId} onBack={() => setDetailId(null)} onOpenContact={(id) => { setView('contacts'); setDetailId(id); }} />
          : <OrganisationsView onOpenProfile={(id) => setDetailId(id)} />;
      case 'contacts':
        return detailId
          ? <ContactProfile id={detailId} onBack={() => setDetailId(null)} />
          : <ContactsView onOpenProfile={(id) => setDetailId(id)} />;
      case 'outreach': return <OutreachView />;
      case 'followups': return <FollowUpsView />;
      case 'opportunities': return <OpportunitiesView />;
      case 'network': return <NetworkView />;
      case 'research': return <ResearchView />;
      case 'portfolio': return <PortfolioView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      default: return <OverviewView onNavigate={handleNavigate} />;
    }
  };

  const [quickAddType, setQuickAddType] = useState<string>('contact');

  const handleQuickAddContinue = () => {
    const viewMap: Record<string, ViewId> = {
      contact: 'contacts',
      organisation: 'organisations',
      outreach: 'outreach',
      followup: 'followups',
      opportunity: 'opportunities',
      research: 'research',
    };
    if (viewMap[quickAddType]) {
      handleNavigate(viewMap[quickAddType]);
    }
    setQuickAddOpen(false);
  };

  return (
    <DataProvider>
    <div className="min-h-screen bg-bg-primary">
      <Sidebar
        active={view}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        onLogout={() => alert('Logout — authentication will be implemented in Phase 3')}
      />
      <div className={`transition-all duration-200 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        <Topbar
          onQuickAdd={() => setQuickAddOpen(true)}
          onGlobalSearch={() => {}}
          onNavigate={handleNavigate}
        />
        <main className="px-4 sm:px-6 py-6 max-w-[1600px] mx-auto">
          {renderView()}
        </main>
      </div>

      <Modal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        title="Quick Add"
        subtitle="Create a new record"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setQuickAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleQuickAddContinue}>Go to Form</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Record Type"
            value={quickAddType}
            onChange={(e) => setQuickAddType(e.target.value)}
          >
            <option value="contact">Contact</option>
            <option value="organisation">Organisation</option>
            <option value="outreach">Outreach Activity</option>
            <option value="followup">Follow-up</option>
            <option value="opportunity">Opportunity</option>
            <option value="research">Research Entry</option>
          </Select>
          <p className="text-xs text-text-secondary">
            Select a record type and continue to open the relevant view and form. All new records will be written live to your Excel master database.
          </p>
        </div>
      </Modal>
    </div>
    </DataProvider>
  );
}
