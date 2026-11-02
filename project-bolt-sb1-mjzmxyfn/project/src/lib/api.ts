import type {
  Organisation,
  Contact,
  Outreach,
  FollowUp,
  Opportunity,
  NetworkReferral,
  ResearchEntry,
} from '@/types';

export interface ExcelAllData {
  organisations: Organisation[];
  contacts: Contact[];
  outreach: Outreach[];
  followups: FollowUp[];
  opportunities: Opportunity[];
  network: NetworkReferral[];
  research: ResearchEntry[];
  dropdowns: Record<string, string[]>;
}

export interface ApiStatus {
  success: boolean;
  exists: boolean;
  locked: boolean;
  path: string;
}

export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(`Server responded with HTTP ${res.status}`);
  }

  if (!res.ok || json.success === false) {
    const errorMsg = json.message || `API error (${res.status})`;
    const errorCode = json.error || (res.status === 423 ? 'FILE_LOCKED' : undefined);
    throw new ApiError(errorMsg, errorCode);
  }

  return json;
}

export async function fetchExcelStatus(): Promise<ApiStatus> {
  const res = await fetch('/api/status');
  return handleResponse<ApiStatus>(res);
}

export async function fetchAllExcelData(): Promise<{ success: boolean; data: ExcelAllData }> {
  const res = await fetch('/api/data');
  return handleResponse<{ success: boolean; data: ExcelAllData }>(res);
}

export async function fetchDropdowns(): Promise<{ success: boolean; data: Record<string, string[]> }> {
  const res = await fetch('/api/dropdowns');
  return handleResponse<{ success: boolean; data: Record<string, string[]> }>(res);
}

export async function seedExcelWithDemo(payload: Partial<ExcelAllData>): Promise<{ success: boolean; counts: Record<string, number> }> {
  const res = await fetch('/api/seed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ success: boolean; counts: Record<string, number> }>(res);
}

export async function addRecordToExcel<T>(entity: string, record: Partial<T>): Promise<{ success: boolean; data: T }> {
  const res = await fetch(`/api/${entity}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  return handleResponse<{ success: boolean; data: T }>(res);
}

export async function updateRecordInExcel<T>(entity: string, id: string, record: Partial<T>): Promise<{ success: boolean; data: T }> {
  const res = await fetch(`/api/${entity}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  return handleResponse<{ success: boolean; data: T }>(res);
}

export async function deleteRecordFromExcel(entity: string, id: string): Promise<{ success: boolean; id: string }> {
  const res = await fetch(`/api/${entity}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean; id: string }>(res);
}

export async function triggerGoogleSync(): Promise<{ success: boolean; message: string; spreadsheetUrl?: string }> {
  const res = await fetch('/api/sync-google-sheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<{ success: boolean; message: string; spreadsheetUrl?: string }>(res);
}

export async function clearAllDataFromExcel(): Promise<{ success: boolean; cleared: Record<string, number> }> {
  const res = await fetch('/api/clear-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<{ success: boolean; cleared: Record<string, number> }>(res);
}

