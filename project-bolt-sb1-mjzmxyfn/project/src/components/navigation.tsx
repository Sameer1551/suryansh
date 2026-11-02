import {
  LayoutDashboard, Building2, Users, Send, CalendarCheck,
  Target, Network, FlaskConical, Clapperboard, BarChart3,
  Settings,
} from 'lucide-react';
import { type ReactNode } from 'react';

export type ViewId =
  | 'overview' | 'organisations' | 'contacts' | 'outreach'
  | 'followups' | 'opportunities' | 'network' | 'research'
  | 'portfolio' | 'reports' | 'settings';

export interface NavItem {
  id: ViewId;
  label: string;
  icon: ReactNode;
  group?: string;
}

export const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'organisations', label: 'Organisations', icon: <Building2 size={18} /> },
  { id: 'contacts', label: 'Contacts', icon: <Users size={18} /> },
  { id: 'outreach', label: 'Outreach', icon: <Send size={18} /> },
  { id: 'followups', label: 'Follow-ups', icon: <CalendarCheck size={18} /> },
  { id: 'opportunities', label: 'Opportunities', icon: <Target size={18} /> },
  { id: 'network', label: 'Network & Referrals', icon: <Network size={18} /> },
  { id: 'research', label: 'Research Queue', icon: <FlaskConical size={18} /> },
  { id: 'portfolio', label: 'Portfolio', icon: <Clapperboard size={18} /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];
