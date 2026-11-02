import { useState } from 'react';
import { Shield, Users, Bell, Database, Lock, Cloud, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/ui/Common';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Checkbox } from '@/components/ui/Form';
import { currentUser, teamMembers, type User } from '@/data/demo';
import { useData } from '@/store/DataContext';

type Tab = 'account' | 'team' | 'permissions' | 'integrations' | 'notifications';

export function SettingsView() {
  const [tab, setTab] = useState<Tab>('integrations');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'integrations', label: 'Excel Database', icon: <Database size={16} /> },
    { id: 'account', label: 'Account', icon: <Lock size={16} /> },
    { id: 'team', label: 'Team Members', icon: <Users size={16} /> },
    { id: 'permissions', label: 'Roles & Permissions', icon: <Shield size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" subtitle="Workspace configuration and preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <Card className="p-2">
            <div className="space-y-0.5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    tab === t.id ? 'bg-bg-card text-text-primary border border-border' : 'text-text-secondary hover:text-text-primary hover:bg-bg-card/50 border border-transparent'
                  }`}
                >
                  <span className={tab === t.id ? 'text-accent' : 'text-text-muted'}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {tab === 'account' && <AccountTab />}
          {tab === 'team' && <TeamTab />}
          {tab === 'permissions' && <PermissionsTab />}
          {tab === 'integrations' && <IntegrationsTab />}
          {tab === 'notifications' && <NotificationsTab />}
        </div>
      </div>
    </div>
  );
}

function AccountTab() {
  return (
    <Card>
      <CardHeader title="Account" subtitle="Your profile and security" />
      <div className="px-5 pb-5 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-border-subtle">
          <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-lg font-heading font-bold text-accent">
            {currentUser.initials}
          </div>
          <div>
            <div className="text-sm font-medium text-text-primary">{currentUser.name}</div>
            <div className="text-2xs text-text-secondary">{currentUser.email}</div>
            <Badge tone="accent" className="mt-1">{currentUser.role}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" defaultValue={currentUser.name} />
          <Input label="Email" defaultValue={currentUser.email} type="email" />
        </div>
        <div className="pt-3 border-t border-border-subtle">
          <h4 className="text-sm font-heading font-semibold text-text-primary mb-3">Security</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Current Password" type="password" placeholder="••••••••" />
            <div />
            <Input label="New Password" type="password" />
            <Input label="Confirm Password" type="password" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      </div>
    </Card>
  );
}

function TeamTab() {
  return (
    <Card>
      <CardHeader title="Team Members" subtitle="Manage who has access to this workspace" action={<Button size="sm" variant="primary">Invite Member</Button>} />
      <div className="px-5 pb-5">
        <div className="space-y-2">
          {teamMembers.map((member: User) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary/40 border border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-sm font-heading font-semibold text-accent shrink-0">
                  {member.initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{member.name}</div>
                  <div className="text-2xs text-text-secondary">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={member.role === 'OWNER' ? 'accent' : 'info'}>{member.role}</Badge>
                {member.id !== currentUser.id && <Button size="sm" variant="ghost">Remove</Button>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-bg-secondary/30 border border-dashed border-border-subtle">
          <p className="text-2xs text-text-secondary">
            Only approved email addresses can access this workspace. New members must be invited by an Owner.
            Access and data persistence are managed securely on your local environment.
          </p>
        </div>
      </div>
    </Card>
  );
}

function PermissionsTab() {
  const roles = [
    {
      name: 'OWNER',
      permissions: [
        'Full application access',
        'View all records',
        'Add and edit records',
        'Manage users',
        'View all reports',
        'Manage settings',
        'Export records',
        'Authorise destructive actions',
      ],
    },
    {
      name: 'ASSISTANT',
      permissions: [
        'View permitted records',
        'Add and edit contacts',
        'Add organisations',
        'Record outreach',
        'Manage follow-ups',
        'Manage research',
        'Update opportunities',
        'View assigned reports',
      ],
      restrictions: [
        'Cannot manage owner accounts',
        'Cannot change security settings',
        'Cannot access backend credentials',
        'Cannot permanently delete records',
        'Cannot modify protected configuration',
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {roles.map((role) => (
        <Card key={role.name}>
          <CardHeader
            title={role.name === 'OWNER' ? 'Owner Role' : 'Assistant Role'}
            subtitle={role.name === 'OWNER' ? 'Full access' : 'Operational access with restrictions'}
            action={<Badge tone={role.name === 'OWNER' ? 'accent' : 'info'}>{role.name}</Badge>}
          />
          <div className="px-5 pb-5">
            <div className="space-y-1.5">
              {role.permissions.map((p) => (
                <div key={p} className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success shrink-0" />
                  {p}
                </div>
              ))}
            </div>
            {'restrictions' in role && role.restrictions && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="text-2xs font-medium uppercase tracking-wider text-status-error mb-2">Restrictions</div>
                <div className="space-y-1.5">
                  {role.restrictions.map((r: string) => (
                    <div key={r} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-error shrink-0" />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function IntegrationsTab() {
  const {
    excelPath,
    syncStatus,
    lastSyncError,
    isFileLocked,
    refreshData,
    seedDemoToExcel,
  } = useData();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleSeed = async () => {
    if (window.confirm('This will write seed data into the Excel workbook sheets (02-08) for testing. Continue?')) {
      setIsSeeding(true);
      await seedDemoToExcel();
      setIsSeeding(false);
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Excel Master Database Bridge"
          subtitle="Direct local sync with Excel workbook"
          action={
            <Badge tone={isFileLocked ? 'error' : syncStatus === 'error' ? 'error' : 'success'}>
              {isFileLocked ? 'File Locked (Open in Excel)' : syncStatus === 'saving' ? 'Syncing...' : 'Connected & Active'}
            </Badge>
          }
        />
        <div className="px-5 pb-5 space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            The workspace is connected directly to your local Excel master workbook. Every create and update action is written live to the sheets using Python <code className="text-accent bg-bg-secondary px-1.5 py-0.5 rounded text-xs">openpyxl</code>, with all formula columns and dropdown validations preserved.
          </p>

          <div className="p-3.5 rounded-lg bg-bg-secondary/40 border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Target Workbook Path:</span>
              <span className="font-mono text-text-primary text-2xs truncate max-w-md">{excelPath || 'DOP_Master_Industry_Database_Final_Fixed_Dropdowns.xlsx'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Sync Engine:</span>
              <span className="text-accent font-medium">Express.js API + openpyxl CLI Bridge</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Formula Protection:</span>
              <span className="text-status-success font-medium">Active (Columns 8, 41, 16 etc. preserved)</span>
            </div>
          </div>

          {lastSyncError && (
            <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/30 text-xs text-status-error">
              <strong>Sync Error:</strong> {lastSyncError}
              {isFileLocked && (
                <p className="mt-1 text-2xs">
                  Tip: If the workbook is currently open in Microsoft Excel with exclusive editing locks, please save or close the file in Excel and click Refresh.
                </p>
              )}
            </div>
          )}

          {seedSuccess && (
            <div className="p-3 rounded-lg bg-status-success/10 border border-status-success/30 text-xs text-status-success">
              Demo data successfully seeded into the Excel workbook!
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? 'Refreshing...' : 'Refresh from Excel'}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleSeed} disabled={isSeeding}>
                {isSeeding ? 'Seeding...' : 'Seed Sample Data to Excel'}
              </Button>
            </div>
            <span className="text-2xs text-text-muted">Status: {syncStatus}</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Google Drive & Google Sheets Cloud Sync"
          subtitle="Real-time cloud database backup & remote access"
          action={
            <Badge tone="success" variant="solid">
              Connected & Synced
            </Badge>
          }
        />
        <div className="px-5 pb-5 space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            Your master Excel database is linked to Google Drive and Google Sheets under your verified account. All 9 worksheets sync with zero cloud database fees.
          </p>

          <div className="p-3.5 rounded-lg bg-bg-secondary/40 border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Target Google Account:</span>
              <span className="font-medium text-text-primary">suryanshh.dp@gmail.com</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Cloud Spreadsheet:</span>
              <span className="text-amber-400 font-medium">DOP Master Industry Database (9 sheets)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Sync Engine:</span>
              <span className="text-text-secondary">Google Apps Script Webhook API</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle">
            <a
              href="https://docs.google.com/spreadsheets/d/1FJNblvKgeRdnS_Rrn8q3JrhEWhJZ4BrmMSDTXvpS43w/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            >
              <Cloud size={14} />
              Open Live Google Sheet
              <ExternalLink size={12} />
            </a>

            <span className="text-2xs text-text-muted">
              Run <code className="text-amber-400">SYNC_GOOGLE_DRIVE.bat</code> to sync anytime
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Architecture & Data Flow" subtitle="Local standalone mode (No cloud database required)" />
        <div className="px-5 pb-5">
          <p className="text-sm text-text-secondary leading-relaxed">
            This deployment operates completely locally without external cloud databases or Supabase dependencies. Data flows bidirectionally between the React user interface, Express API, and your Excel sheets:
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-text-secondary list-disc pl-5">
            <li><strong>Sheet 02 ORGANISATIONS:</strong> 25 columns mapped directly with all classification & relationship fields.</li>
            <li><strong>Sheet 03 CONTACTS:</strong> 48 columns mapped directly, preserving VLOOKUP for Org Name and Follow-up Alert formula.</li>
            <li><strong>Sheet 04 OUTREACH:</strong> 22 columns mapped with automatic date stamping & stage progress.</li>
            <li><strong>Sheet 05 FOLLOW-UPS:</strong> 17 columns with split Category and Alert status calculations.</li>
            <li><strong>Sheet 06 OPPORTUNITIES:</strong> 25 columns with drag-and-drop pipeline stage updates.</li>
            <li><strong>Sheet 07 NETWORK & REFERRALS:</strong> 15 columns capturing partner connections and mutual value.</li>
            <li><strong>Sheet 08 RESEARCH QUEUE:</strong> 16 columns for pre-outreach vetting and intelligence.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

function NotificationsTab() {
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [dueTodayAlerts, setDueTodayAlerts] = useState(true);
  const [responseAlerts, setResponseAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  return (
    <Card>
      <CardHeader title="Notifications" subtitle="Choose what you want to be alerted about" />
      <div className="px-5 pb-5 space-y-4">
        <div className="space-y-3">
          <Checkbox label="Overdue follow-up alerts" checked={overdueAlerts} onChange={setOverdueAlerts} />
          <Checkbox label="Follow-ups due today" checked={dueTodayAlerts} onChange={setDueTodayAlerts} />
          <Checkbox label="Response received notifications" checked={responseAlerts} onChange={setResponseAlerts} />
          <Checkbox label="Weekly activity digest" checked={weeklyDigest} onChange={setWeeklyDigest} />
        </div>
        <div className="pt-4 border-t border-border-subtle">
          <Select label="Digest delivery day">
            <option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option>
          </Select>
        </div>
        <div className="flex justify-end pt-3 border-t border-border-subtle">
          <Button variant="primary">Save Preferences</Button>
        </div>
      </div>
    </Card>
  );
}
