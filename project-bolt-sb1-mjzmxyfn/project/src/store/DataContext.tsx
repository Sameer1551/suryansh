import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  organisations as seedOrgs,
  contacts as seedContacts,
  outreach as seedOutreach,
  followUps as seedFollowUps,
  opportunities as seedOpps,
  networkReferrals as seedNetwork,
  researchQueue as seedResearch,
  portfolioProjects as seedPortfolio,
  activity as seedActivity,
} from '@/data/demo';
import type {
  Organisation,
  Contact,
  Outreach,
  FollowUp,
  Opportunity,
  NetworkReferral,
  ResearchEntry,
  PortfolioProject,
  ActivityEntry,
} from '@/types';
import {
  fetchAllExcelData,
  fetchExcelStatus,
  addRecordToExcel,
  updateRecordInExcel,
  deleteRecordFromExcel,
  seedExcelWithDemo,
  triggerGoogleSync,
  type ExcelAllData,
  ApiError,
} from '@/lib/api';

// ── State ───────────────────────────────────────────────────

export type SyncStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error' | 'offline';

interface AppState {
  organisations: Organisation[];
  contacts: Contact[];
  outreach: Outreach[];
  followUps: FollowUp[];
  opportunities: Opportunity[];
  network: NetworkReferral[];
  research: ResearchEntry[];
  portfolio: PortfolioProject[];
  activity: ActivityEntry[];
  dropdowns: Record<string, string[]>;
}

function loadInitialPortfolio(): PortfolioProject[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('suryansh_portfolio');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const fakeTitles = new Set([
            'Aurora',
            'Nike Himalaya',
            'The Last Wave',
            'Monsoon Tide',
            'Riverlines',
            'Cold Harbour',
            'Midnight Bloom',
            'Tanishq Diwali',
            'Showreel 2026',
          ]);
          return parsed.filter((p) => !fakeTitles.has(p.title) && !p.id?.startsWith('PF-00'));
        }
      } catch {}
    }
  }
  return seedPortfolio;
}

const initialState: AppState = {
  organisations: seedOrgs,
  contacts: seedContacts,
  outreach: seedOutreach,
  followUps: seedFollowUps,
  opportunities: seedOpps,
  network: seedNetwork,
  research: seedResearch,
  portfolio: loadInitialPortfolio(),
  activity: seedActivity,
  dropdowns: {},
};

// ── Actions ─────────────────────────────────────────────────

export type Action =
  | { type: 'SET_ALL_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_ORG'; payload: Organisation }
  | { type: 'UPDATE_ORG'; payload: Organisation }
  | { type: 'DELETE_ORG'; payload: string }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: Contact }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'TOGGLE_STAR_CONTACT'; payload: string }
  | { type: 'ADD_OUTREACH'; payload: Outreach }
  | { type: 'DELETE_OUTREACH'; payload: string }
  | { type: 'ADD_FOLLOWUP'; payload: FollowUp }
  | { type: 'UPDATE_FOLLOWUP'; payload: Partial<FollowUp> & { id: string } }
  | { type: 'DELETE_FOLLOWUP'; payload: string }
  | { type: 'ADD_OPPORTUNITY'; payload: Opportunity }
  | { type: 'UPDATE_OPPORTUNITY'; payload: Partial<Opportunity> & { id: string } }
  | { type: 'ADD_NETWORK'; payload: NetworkReferral }
  | { type: 'ADD_RESEARCH'; payload: ResearchEntry }
  | { type: 'UPDATE_RESEARCH'; payload: Partial<ResearchEntry> & { id: string } }
  | { type: 'ADD_PORTFOLIO'; payload: PortfolioProject }
  | { type: 'DELETE_PORTFOLIO'; payload: string }
  | { type: 'CLEAR_PORTFOLIO' }
  | { type: 'ADD_ACTIVITY'; payload: ActivityEntry };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ALL_DATA':
      return {
        ...state,
        ...action.payload,
      };
    case 'ADD_ORG':
      return { ...state, organisations: [action.payload, ...state.organisations.filter((o) => o.id !== action.payload.id)] };
    case 'UPDATE_ORG':
      return { ...state, organisations: state.organisations.map((o) => o.id === action.payload.id ? { ...o, ...action.payload } : o) };
    case 'DELETE_ORG':
      return { ...state, organisations: state.organisations.filter((o) => o.id !== action.payload) };
    case 'ADD_CONTACT':
      return { ...state, contacts: [action.payload, ...state.contacts.filter((c) => c.id !== action.payload.id)] };
    case 'UPDATE_CONTACT':
      return { ...state, contacts: state.contacts.map((c) => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'DELETE_CONTACT':
      return { ...state, contacts: state.contacts.filter((c) => c.id !== action.payload) };
    case 'TOGGLE_STAR_CONTACT': {
      const contact = state.contacts.find((c) => c.id === action.payload);
      if (!contact) return state;
      const isStarred = Boolean(contact.starred ?? (contact.contactPriority === 'Lead' || contact.contactPriority === '1' || contact.contactPriority === 'A'));
      return {
        ...state,
        contacts: state.contacts.map((c) =>
          c.id === action.payload
            ? { ...c, starred: !isStarred }
            : c
        ),
      };
    }
    case 'ADD_OUTREACH':
      return { ...state, outreach: [action.payload, ...state.outreach.filter((o) => o.id !== action.payload.id)] };
    case 'DELETE_OUTREACH':
      return { ...state, outreach: state.outreach.filter((o) => o.id !== action.payload) };
    case 'ADD_FOLLOWUP':
      return { ...state, followUps: [action.payload, ...state.followUps.filter((f) => f.id !== action.payload.id)] };
    case 'UPDATE_FOLLOWUP':
      return { ...state, followUps: state.followUps.map((f) => f.id === action.payload.id ? { ...f, ...action.payload } : f) };
    case 'DELETE_FOLLOWUP':
      return { ...state, followUps: state.followUps.filter((f) => f.id !== action.payload) };
    case 'ADD_OPPORTUNITY':
      return { ...state, opportunities: [action.payload, ...state.opportunities.filter((o) => o.id !== action.payload.id)] };
    case 'UPDATE_OPPORTUNITY':
      return { ...state, opportunities: state.opportunities.map((o) => o.id === action.payload.id ? { ...o, ...action.payload } : o) };
    case 'ADD_NETWORK':
      return { ...state, network: [action.payload, ...state.network.filter((n) => n.id !== action.payload.id)] };
    case 'ADD_RESEARCH':
      return { ...state, research: [action.payload, ...state.research.filter((r) => r.id !== action.payload.id)] };
    case 'UPDATE_RESEARCH':
      return { ...state, research: state.research.map((r) => r.id === action.payload.id ? { ...r, ...action.payload } : r) };
    case 'ADD_PORTFOLIO': {
      const updated = [action.payload, ...state.portfolio.filter((p) => p.id !== action.payload.id)];
      try {
        localStorage.setItem('suryansh_portfolio', JSON.stringify(updated));
      } catch {}
      return { ...state, portfolio: updated };
    }
    case 'DELETE_PORTFOLIO': {
      const updated = state.portfolio.filter((p) => p.id !== action.payload);
      try {
        localStorage.setItem('suryansh_portfolio', JSON.stringify(updated));
      } catch {}
      return { ...state, portfolio: updated };
    }
    case 'CLEAR_PORTFOLIO': {
      try {
        localStorage.setItem('suryansh_portfolio', JSON.stringify([]));
      } catch {}
      return { ...state, portfolio: [] };
    }
    case 'ADD_ACTIVITY':
      return { ...state, activity: [action.payload, ...state.activity] };
    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────

export interface DataContextValue extends AppState {
  dispatch: (action: Action) => Promise<void>;
  genId: (prefix: string) => string;
  addActivity: (type: ActivityEntry['type'], description: string, actor: string) => void;
  syncStatus: SyncStatus;
  lastSyncError: string | null;
  isFileLocked: boolean;
  excelPath: string;
  refreshData: () => Promise<void>;
  seedDemoToExcel: () => Promise<void>;
  dismissError: () => void;
  googleSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  googleSyncMessage: string | null;
  syncToGoogleSheets: () => Promise<boolean>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, baseDispatch] = useReducer(reducer, initialState);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [isFileLocked, setIsFileLocked] = useState(false);
  const [excelPath, setExcelPath] = useState(
    'd:\\suryansh\\project-bolt-sb1-mjzmxyfn\\project\\DOP_Master_Industry_Database_Final_Fixed_Dropdowns.xlsx'
  );
  const [googleSyncStatus, setGoogleSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [googleSyncMessage, setGoogleSyncMessage] = useState<string | null>(null);

  const syncToGoogleSheets = useCallback(async () => {
    try {
      setGoogleSyncStatus('syncing');
      setGoogleSyncMessage('Syncing to Google Sheets...');
      const res = await triggerGoogleSync();
      if (res.success) {
        setGoogleSyncStatus('success');
        setGoogleSyncMessage(res.message || 'Successfully synced to Google Sheets!');
        setTimeout(() => {
          setGoogleSyncStatus('idle');
          setGoogleSyncMessage(null);
        }, 5000);
        return true;
      } else {
        setGoogleSyncStatus('error');
        setGoogleSyncMessage(res.message || 'Google sync failed');
        setTimeout(() => {
          setGoogleSyncStatus('idle');
          setGoogleSyncMessage(null);
        }, 6000);
        return false;
      }
    } catch (err: any) {
      setGoogleSyncStatus('error');
      setGoogleSyncMessage(err.message || 'Failed to trigger Google sync');
      setTimeout(() => {
        setGoogleSyncStatus('idle');
        setGoogleSyncMessage(null);
      }, 6000);
      return false;
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setSyncStatus('loading');
      const statusRes = await fetchExcelStatus();
      if (statusRes.path) {
        setExcelPath(statusRes.path);
      }
      setIsFileLocked(statusRes.locked);

      const res = await fetchAllExcelData();
      if (res.success && res.data) {
        const d = res.data;
        const totalRows =
          d.organisations.length +
          d.contacts.length +
          d.outreach.length +
          d.followups.length +
          d.opportunities.length +
          d.network.length +
          d.research.length;

        if (totalRows === 0) {
          // Auto-seed Excel so the spreadsheet is never completely blank
          try {
            await seedExcelWithDemo({
              organisations: seedOrgs,
              contacts: seedContacts,
              outreach: seedOutreach,
              followups: seedFollowUps,
              opportunities: seedOpps,
              network: seedNetwork,
              research: seedResearch,
            });
            const recheck = await fetchAllExcelData();
            if (recheck.success && recheck.data) {
              const rd = recheck.data;
              baseDispatch({
                type: 'SET_ALL_DATA',
                payload: {
                  organisations: rd.organisations,
                  contacts: rd.contacts,
                  outreach: rd.outreach,
                  followUps: rd.followups,
                  opportunities: rd.opportunities,
                  network: rd.network,
                  research: rd.research,
                  dropdowns: rd.dropdowns || {},
                },
              });
              setSyncStatus('saved');
              setLastSyncError(null);
              return;
            }
          } catch (seedErr) {
            console.warn('Auto-seed to Excel failed:', seedErr);
          }
        }

        baseDispatch({
          type: 'SET_ALL_DATA',
          payload: {
            organisations: d.organisations.length > 0 ? d.organisations : seedOrgs,
            contacts: d.contacts.length > 0 ? d.contacts : seedContacts,
            outreach: d.outreach.length > 0 ? d.outreach : seedOutreach,
            followUps: d.followups.length > 0 ? d.followups : seedFollowUps,
            opportunities: d.opportunities.length > 0 ? d.opportunities : seedOpps,
            network: d.network.length > 0 ? d.network : seedNetwork,
            research: d.research.length > 0 ? d.research : seedResearch,
            dropdowns: d.dropdowns || {},
          },
        });
        setSyncStatus('saved');
        setLastSyncError(null);
      }
    } catch (err: any) {
      console.warn('Backend Excel API not available or errored:', err);
      setSyncStatus('offline');
      setLastSyncError(err.message || 'Cannot connect to Excel bridge');
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const syncToExcel = async (action: Action) => {
    setSyncStatus('saving');
    try {
      switch (action.type) {
        case 'ADD_ORG':
          await addRecordToExcel('organisations', action.payload);
          break;
        case 'UPDATE_ORG':
          await updateRecordInExcel('organisations', action.payload.id, action.payload);
          break;
        case 'DELETE_ORG':
          await deleteRecordFromExcel('organisations', action.payload);
          break;
        case 'ADD_CONTACT':
          await addRecordToExcel('contacts', action.payload);
          break;
        case 'UPDATE_CONTACT':
          await updateRecordInExcel('contacts', action.payload.id, action.payload);
          break;
        case 'DELETE_CONTACT':
          await deleteRecordFromExcel('contacts', action.payload);
          break;
        case 'TOGGLE_STAR_CONTACT': {
          const contact = state.contacts.find((c) => c.id === action.payload);
          if (contact) {
            const isStarred = Boolean(contact.starred ?? (contact.contactPriority === 'Lead' || contact.contactPriority === '1' || contact.contactPriority === 'A'));
            await updateRecordInExcel('contacts', action.payload, {
              ...contact,
              starred: !isStarred,
            });
          }
          break;
        }
        case 'ADD_OUTREACH':
          await addRecordToExcel('outreach', action.payload);
          break;
        case 'DELETE_OUTREACH':
          await deleteRecordFromExcel('outreach', action.payload);
          break;
        case 'ADD_FOLLOWUP':
          await addRecordToExcel('followups', action.payload);
          break;
        case 'UPDATE_FOLLOWUP':
          await updateRecordInExcel('followups', action.payload.id, action.payload);
          break;
        case 'DELETE_FOLLOWUP':
          await deleteRecordFromExcel('followups', action.payload);
          break;
        case 'ADD_OPPORTUNITY':
          await addRecordToExcel('opportunities', action.payload);
          break;
        case 'UPDATE_OPPORTUNITY':
          await updateRecordInExcel('opportunities', action.payload.id, action.payload);
          break;
        case 'ADD_NETWORK':
          await addRecordToExcel('network', action.payload);
          break;
        case 'ADD_RESEARCH':
          await addRecordToExcel('research', action.payload);
          break;
        case 'UPDATE_RESEARCH':
          await updateRecordInExcel('research', action.payload.id, action.payload);
          break;
        default:
          break;
      }
      setSyncStatus('saved');
      setLastSyncError(null);
      setIsFileLocked(false);
    } catch (err: any) {
      console.error('Failed to sync to Excel:', err);
      setSyncStatus('error');
      setLastSyncError(err.message || 'Failed to sync record to Excel');
      if (err instanceof ApiError && err.code === 'FILE_LOCKED') {
        setIsFileLocked(true);
      }
    }
  };

  const dispatch = async (action: Action) => {
    baseDispatch(action);
    if (action.type !== 'SET_ALL_DATA' && action.type !== 'ADD_ACTIVITY' && action.type !== 'ADD_PORTFOLIO') {
      await syncToExcel(action);
    }
  };

  const genId = (prefix: string) => {
    let num = 1;
    const all = [
      ...state.organisations,
      ...state.contacts,
      ...state.outreach,
      ...state.followUps,
      ...state.opportunities,
      ...state.network,
      ...state.research,
    ];
    while (all.some((r) => r.id === `${prefix}-${String(num).padStart(3, '0')}`)) {
      num++;
    }
    return `${prefix}-${String(num).padStart(3, '0')}`;
  };

  const addActivity = (type: ActivityEntry['type'], description: string, actor: string) => {
    const entry: ActivityEntry = {
      id: `ACT-${Date.now()}`,
      type,
      description,
      actor,
      timestamp: new Date().toISOString(),
    };
    baseDispatch({ type: 'ADD_ACTIVITY', payload: entry });
  };

  const seedDemoToExcel = async () => {
    setSyncStatus('saving');
    try {
      const payload: Partial<ExcelAllData> = {
        organisations: seedOrgs,
        contacts: seedContacts,
        outreach: seedOutreach,
        followups: seedFollowUps,
        opportunities: seedOpps,
        network: seedNetwork,
        research: seedResearch,
      };
      await seedExcelWithDemo(payload);
      setSyncStatus('saved');
      setLastSyncError(null);
      await refreshData();
    } catch (err: any) {
      console.error('Seed demo failed:', err);
      setSyncStatus('error');
      setLastSyncError(err.message || 'Failed to seed demo data to Excel');
      if (err.code === 'FILE_LOCKED') {
        setIsFileLocked(true);
      }
    }
  };

  const dismissError = () => {
    setLastSyncError(null);
    setIsFileLocked(false);
  };

  return (
    <DataContext.Provider
      value={{
        ...state,
        dispatch,
        genId,
        addActivity,
        syncStatus,
        lastSyncError,
        isFileLocked,
        excelPath,
        refreshData,
        seedDemoToExcel,
        dismissError,
        googleSyncStatus,
        googleSyncMessage,
        syncToGoogleSheets,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
