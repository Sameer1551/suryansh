// DOP WORKSPACE — Domain Types
export type Priority =
  | 'Lead'
  | 'Interested lead'
  | 'Ingaging'
  | 'Cold reply'
  | 'Not interested'
  | '1'
  | '2'
  | '3'
  | '4'
  | 'A'
  | 'B'
  | 'C'
  | string;

export type OrgType =
  | 'Director'
  | 'DOP'
  | 'Production House'
  | 'Agency'
  | 'Event Company'
  | 'Wedding'
  | 'Client'
  | 'Advertising Agency'
  | 'Creative Agency'
  | 'Film Studio'
  | 'Brand'
  | 'OTT / Streaming'
  | 'Post-production House'
  | 'Other'
  | string;

export type OrgStatus =
  | 'Not Contacted'
  | 'Contacted'
  | 'Replied'
  | 'Meeting'
  | 'Active Relationship'
  | 'Active'
  | 'Inactive'
  | 'Unknown';

export type ContactStatus =
  | 'Not Contacted'
  | 'Contacted'
  | 'Replied'
  | 'Meeting'
  | 'Active Relationship'
  | 'Inactive';

export type RelationshipStatus = 'Cold' | 'Warm' | 'Existing';

export type Channel =
  | 'Email'
  | 'Phone'
  | 'WhatsApp'
  | 'LinkedIn'
  | 'Instagram'
  | 'In Person'
  | 'Other';

export type OutreachType =
  | 'Introduction'
  | 'Portfolio Submission'
  | 'Showreel Submission'
  | 'Networking'
  | 'Follow-up'
  | 'Referral Request'
  | 'Reconnection'
  | 'Other';

export type DeliveryStatus = 'Sent' | 'Failed' | 'Bounced' | 'Unknown';

export type ResponseSentiment = 'Positive' | 'Neutral' | 'Negative' | '';

export type FollowUpStatus = 'Pending' | 'Completed' | 'Snoozed' | 'Cancelled';

export type FollowUpAlertStatus = 'OVERDUE' | 'DUE TODAY' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export type OpportunityStage =
  | 'Enquiry'
  | 'Discussion'
  | 'Brief Received'
  | 'Negotiation'
  | 'Confirmed'
  | 'Lost'
  | 'On Hold';

export type OpportunityOutcome = 'Pending' | 'Won' | 'Lost' | 'Stalled';

export type ResearchStatus = 'Not Started' | 'In Progress' | 'Completed';

export type Role = 'OWNER' | 'ASSISTANT';

// ── Organisations (Sheet 02, 25 columns) ───────────────────

export interface Organisation {
  id: string;
  name: string;
  type: OrgType;
  subcategory: string;
  website: string;
  city: string;
  state: string;
  country: string;
  officeAddress: string;
  generalEmail: string;
  officePhone: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  imdb: string;
  keyWork: string;
  industryFocus: string;
  relevantDepartments: string;
  priority: Priority;
  status: OrgStatus;
  contactStatus?: ContactStatus;
  researchSourceUrl: string;
  dateAdded: string;
  lastVerified: string;
  associatedContactIds: string[];
  notes: string;
  followUpReminder?: string;
  lastContactDate?: string;
}

// ── Contacts (Sheet 03, 48 columns) ────────────────────────

export interface Contact {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string;
  organisationId: string;
  organisationName: string;
  industryCategory: string;
  city: string;
  country: string;
  professionalEmail: string;
  alternativeEmail: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  linkedin: string;
  facebook: string;
  imdb: string;
  personalWebsite: string;
  experienceLevel: string;
  specialisation: string;
  notableProjects: string;
  currentOrganisation: string;
  previousOrganisation: string;
  professionalInterests: string;
  portfolioUrl: string;
  relevanceToDop: string;
  connectionType: string;
  introductionThrough: string;
  contactPriority: Priority;
  relationshipStatus: RelationshipStatus;
  contactStatus: ContactStatus;
  firstContactDate: string;
  lastContactDate: string;
  lastChannel: Channel;
  responseStatus: string;
  portfolioShared: boolean;
  showreelShared: boolean;
  nextFollowUpDate: string;
  followUpAlert: boolean;
  nextAction: string;
  relationshipNotes: string;
  doNotContact: boolean;
  contactOwner: string;
  sourceUrl: string;
  dateAdded: string;
  lastVerified: string;
  starred?: boolean;
}

// ── Outreach (Sheet 04, 22 columns) ────────────────────────

export interface Outreach {
  id: string;
  contactId: string;
  contactName: string;
  organisationId: string;
  organisationName: string;
  date: string;
  channel: Channel;
  type: OutreachType;
  messageTemplate: string;
  personalisationReason: string;
  portfolioSent: boolean;
  showreelSent: boolean;
  messageReference: string;
  deliveryStatus: DeliveryStatus;
  responseReceived: boolean;
  responseDate: string;
  responseSummary: string;
  responseSentiment: ResponseSentiment;
  nextAction: string;
  nextActionDate: string;
  handledBy: string;
  notes: string;
}

// ── Follow-ups (Sheet 05, 17 columns) ───────────────────────

export interface FollowUp {
  id: string;
  contactId: string;
  contactName: string;
  organisationName: string;
  previousContactDate: string;
  previousCommunicationSummary: string;
  followUpNumber: '1' | '2' | '3' | '4+' | number;
  scheduledDate: string;
  channel: Channel;
  reason: string;
  status: FollowUpStatus;
  alertStatus?: FollowUpAlertStatus;
  responseReceived: boolean;
  responseSummary: string;
  nextFollowUpDate: string;
  assignedTo: string;
  notes: string;
  // UI helpers
  completed?: boolean;
  contactOwner?: string;
  category?: FollowUpStatus | 'Due Today' | 'Upcoming' | 'Overdue' | 'Done';
}

// ── Opportunities (Sheet 06, 25 columns) ────────────────────

export interface Opportunity {
  id: string;
  name: string;
  contactId: string;
  contactName: string;
  organisationId: string;
  organisationName: string;
  projectType: string;
  projectDescription: string;
  director: string;
  producer: string;
  expectedShootDate: string;
  shootLocation: string;
  expectedDuration: string;
  dopRequirement: string;
  estimatedBudget: string;
  budgetCurrency: string;
  availability: string;
  source: string;
  stage: OpportunityStage;
  lastUpdate: string;
  nextAction: string;
  nextActionDate: string;
  outcome: OpportunityOutcome;
  lossReason: string;
  notes: string;
}

// ── Network & Referrals (Sheet 07, 15 columns) ──────────────

export interface NetworkReferral {
  id: string;
  contactId: string;
  contactName: string;
  organisationId: string;
  organisationName: string;
  relationshipType: string;
  connectionStrength: 'Weak' | 'Moderate' | 'Strong';
  industryReach: string;
  potentialIntroductions: string;
  previousReferrals: number;
  referralReceived: boolean;
  lastInteraction: string;
  maintenanceDate: string;
  assignedTo: string;
  notes: string;
}

// ── Research Queue (Sheet 08, 16 columns) ───────────────────

export interface ResearchEntry {
  id: string;
  name: string;
  category: string;
  discoverySource: string;
  discoveryUrl: string;
  city: string;
  status: ResearchStatus;
  missingInfo: string;
  assignedTo: string;
  priority: Priority;
  dateAdded: string;
  deadline: string;
  verified: boolean;
  finalContactId: string;
  finalOrganisationId: string;
  notes: string;
}

// ── Portfolio ───────────────────────────────────────────────

export type PortfolioCategory =
  | 'Commercials / Advertisements'
  | 'Feature Films'
  | 'Short Films'
  | 'Music Videos'
  | 'Documentary'
  | 'Experimental Work'
  | 'BTS / Stills'
  | 'Showreels';

export interface PortfolioProject {
  id: string;
  title: string;
  category: PortfolioCategory;
  year: string;
  role: string;
  director: string;
  productionHouse: string;
  cinematographer: string;
  projectLink: string;
  imdbLink: string;
  btsLink: string;
  stills: string;
  showreelSegment: string;
  websiteStatus: string;
  socialMediaStatus: string;
}

// ── Activity ────────────────────────────────────────────────

export type ActivityType =
  | 'contact_added'
  | 'contact_updated'
  | 'org_updated'
  | 'outreach_recorded'
  | 'followup_completed'
  | 'opportunity_updated';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  description: string;
  actor: string;
  timestamp: string;
}
