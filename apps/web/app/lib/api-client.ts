/**
 * API client for communicating with the backend worker.
 * All auth is cookie-based — no tokens are stored in JS.
 */

/** Base URL for the backend API. Defaults to same origin. */
const API_BASE = '';

export interface ApiError {
  error: string;
  message: string;
  remainingAttempts?: number;
  retryAfter?: number;
}

export interface MagicLinkResponse {
  requestId: string;
  status: string;
  message: string;
  deliveryToken: string;
}

export interface VerifyResponse {
  redirectUrl: string;
}

export interface SessionInfo {
  user: {
    id: string;
    email: string;
    name: string | null;
    status: string;
  };
  roles: string[];
  permissions: string[];
  session: {
    createdAt: string;
    expiresAt: string;
  };
}

export interface DeliveryStatusResponse {
  status: 'sending' | 'sent' | 'delivered' | 'bounced' | 'failed';
}

export interface AdminStats {
  totalUsers: number;
  pendingApprovals: number;
  activeInvitations: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: string;
  roles: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminInvitation {
  id: string;
  email: string;
  status: string;
  role: string;
  invitedBy: string;
  deliveryStatus: string;
  createdAt: string;
  expiresAt: string;
}

export interface AdminInvitationListResponse {
  invitations: AdminInvitation[];
  total: number;
}

export interface PendingApproval {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuditLogEntryData {
  id: string;
  action: string;
  actorName?: string;
  subjectName?: string;
  details?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface AuditLogResponse {
  entries: AuditLogEntryData[];
  cursor?: string;
}

export interface EmailSuppression {
  id: string;
  email: string;
  reason: string;
  createdAt: string;
}

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T>(
  method: RequestMethod,
  path: string,
  body?: unknown,
): Promise<{ ok: true; data: T; status: number } | { ok: false; error: ApiError; status: number }> {
  const url = `${API_BASE}${path}`;
  const init: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  };

  if (body !== undefined) {
    init.headers = {
      ...init.headers,
      'Content-Type': 'application/json',
    };
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);

  if (res.ok) {
    const data = await res.json() as T;
    return { ok: true, data, status: res.status };
  }

  let error: ApiError;
  try {
    error = await res.json() as ApiError;
  } catch {
    error = { error: 'unknown', message: res.statusText || 'Request failed' };
  }

  return { ok: false, error, status: res.status };
}

/** Request a magic link (POST /v1/auth/magic-link) */
export function requestMagicLink(email: string) {
  return request<MagicLinkResponse>('POST', '/v1/auth/magic-link', { email });
}

/** Poll delivery status (GET /v1/auth/magic-link/:requestId/status) */
export function getDeliveryStatus(requestId: string) {
  return request<DeliveryStatusResponse>('GET', `/v1/auth/magic-link/${encodeURIComponent(requestId)}/status`);
}

/** Verify magic link token (GET /v1/auth/verify?token=...) */
export function verifyToken(token: string) {
  return request<VerifyResponse>('GET', `/v1/auth/verify?token=${encodeURIComponent(token)}`);
}

/** Verify magic code (POST /v1/auth/verify) */
export function verifyCode(email: string, code: string) {
  return request<VerifyResponse>('POST', '/v1/auth/verify', { email, code });
}

/** Logout (POST /v1/auth/logout) */
export function logout() {
  return request<{ message: string }>('POST', '/v1/auth/logout');
}

/** Get session info (GET /v1/auth/session) */
export function getSession() {
  return request<SessionInfo>('GET', '/v1/auth/session');
}

/** Update profile (PATCH /v1/auth/profile) */
export function updateProfile(data: { name: string }) {
  return request<{ message: string }>('PATCH', '/v1/auth/profile', data);
}

/** Get admin dashboard stats (GET /v1/admin/stats) */
export function getAdminStats() {
  return request<AdminStats>('GET', '/v1/admin/stats');
}

/** List users (GET /v1/admin/users) */
export function listUsers(params: { page?: number; search?: string; status?: string; sort?: string; order?: string }) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.order) searchParams.set('order', params.order);
  return request<AdminUserListResponse>('GET', `/v1/admin/users?${searchParams.toString()}`);
}

/** Get user detail (GET /v1/admin/users/:id) */
export function getUser(id: string) {
  return request<AdminUser>('GET', `/v1/admin/users/${encodeURIComponent(id)}`);
}

/** Get user audit log (GET /v1/admin/users/:id/audit-log) */
export function getUserAuditLog(userId: string) {
  return request<AuditLogResponse>('GET', `/v1/admin/users/${encodeURIComponent(userId)}/audit-log`);
}

/** Update user role (POST /v1/admin/users/:id/roles) */
export function addUserRole(userId: string, roleId: string) {
  return request<{ message: string }>('POST', `/v1/admin/users/${encodeURIComponent(userId)}/roles`, { roleId });
}

/** Remove user role (DELETE /v1/admin/users/:id/roles/:roleId) */
export function removeUserRole(userId: string, roleId: string) {
  return request<{ message: string }>('DELETE', `/v1/admin/users/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleId)}`);
}

/** Revoke user session (DELETE /v1/admin/users/:id/sessions/:sessionId) */
export function revokeUserSession(userId: string, sessionId: string) {
  return request<{ message: string }>('DELETE', `/v1/admin/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`);
}

/** List invitations (GET /v1/admin/invitations) */
export function listInvitations(params: { status?: string }) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  return request<AdminInvitationListResponse>('GET', `/v1/admin/invitations?${searchParams.toString()}`);
}

/** Create invitation (POST /v1/admin/invitations) */
export function createInvitation(data: { email: string; role: string; message: string }) {
  return request<AdminInvitation>('POST', '/v1/admin/invitations', data);
}

/** Resend invitation (POST /v1/admin/invitations/:id/resend) */
export function resendInvitation(id: string) {
  return request<{ message: string }>('POST', `/v1/admin/invitations/${encodeURIComponent(id)}/resend`);
}

/** Revoke invitation (POST /v1/admin/invitations/:id/revoke) */
export function revokeInvitation(id: string) {
  return request<{ message: string }>('POST', `/v1/admin/invitations/${encodeURIComponent(id)}/revoke`);
}

/** List pending approvals (GET /v1/admin/approvals) */
export function listPendingApprovals() {
  return request<{ approvals: PendingApproval[] }>('GET', '/v1/admin/approvals');
}

/** Approve user (POST /v1/admin/approvals/:id/approve) */
export function approveUser(id: string) {
  return request<{ message: string }>('POST', `/v1/admin/approvals/${encodeURIComponent(id)}/approve`);
}

/** Reject user (POST /v1/admin/approvals/:id/reject) */
export function rejectUser(id: string) {
  return request<{ message: string }>('POST', `/v1/admin/approvals/${encodeURIComponent(id)}/reject`);
}

/** List audit log (GET /v1/admin/audit-log) */
export function listAuditLog(params: { action?: string; actor?: string; cursor?: string; from?: string; to?: string }) {
  const searchParams = new URLSearchParams();
  if (params.action) searchParams.set('action', params.action);
  if (params.actor) searchParams.set('actor', params.actor);
  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);
  return request<AuditLogResponse>('GET', `/v1/admin/audit-log?${searchParams.toString()}`);
}

/** List email suppressions (GET /v1/admin/suppressions) */
export function listSuppressions() {
  return request<{ suppressions: EmailSuppression[] }>('GET', '/v1/admin/suppressions');
}

/** Remove email suppression (DELETE /v1/admin/suppressions/:id) */
export function removeSuppression(id: string) {
  return request<{ message: string }>('DELETE', `/v1/admin/suppressions/${encodeURIComponent(id)}`);
}

// --- Media API ---

/** Public asset shape returned by the API (uses publicPath, never localPath) */
export interface MediaAssetPublic {
  id: string;
  publicPath: string;
  alt: string;
  width: number;
  height: number;
  averageColor: string | null;
  photographer: string;
  photographerUrl: string | null;
  source: string;
  externalUrl: string | null;
  aiAssisted: boolean;
  aiGenerated: boolean;
  hasFirstNationsPermission: boolean;
  license: string;
  attributionText: string | null;
}

export interface MediaPairResponse {
  id: string;
  contentContext: string;
  light: MediaAssetPublic;
  dark: MediaAssetPublic;
}

/** Fetch a single media pair by content context (GET /v1/media/pairs/:contentContext) */
export function fetchMediaPair(contentContext: string, options?: { signal?: AbortSignal }) {
  const url = `/v1/media/pairs/${encodeURIComponent(contentContext)}`;
  const init: RequestInit = {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
    signal: options?.signal,
  };

  return fetch(`${API_BASE}${url}`, init).then(async (res) => {
    if (res.status === 404) return null;
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'unknown', message: res.statusText })) as ApiError;
      throw new Error(error.message);
    }
    return res.json() as Promise<MediaPairResponse>;
  });
}

/** Batch fetch media pairs (GET /v1/media/pairs?contexts=...) */
export function fetchMediaPairs(contexts: string[], options?: { signal?: AbortSignal }) {
  const params = new URLSearchParams();
  params.set('contexts', contexts.join(','));
  const url = `/v1/media/pairs?${params.toString()}`;
  const init: RequestInit = {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
    signal: options?.signal,
  };

  return fetch(`${API_BASE}${url}`, init).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'unknown', message: res.statusText })) as ApiError;
      throw new Error(error.message);
    }
    const data = await res.json() as { pairs: Record<string, MediaPairResponse> };
    return data.pairs;
  });
}

// --- Notifications API ---

export interface NotificationData {
  id: string;
  type: string;
  actorId: string | null;
  resourceType: string;
  resourceId: string;
  actionUrl: string | null;
  metadata: unknown;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationData[];
  unreadCount: number;
}

export interface NotificationPreference {
  channel: string;
  enabled: boolean;
}

/** List user's notifications (GET /v1/notifications) */
export function listNotifications(params?: { unreadOnly?: boolean }) {
  const searchParams = new URLSearchParams();
  if (params?.unreadOnly) searchParams.set('unreadOnly', 'true');
  const qs = searchParams.toString();
  return request<NotificationListResponse>('GET', `/v1/notifications${qs ? `?${qs}` : ''}`);
}

/** Mark notification as read (PATCH /v1/notifications/:id/read) */
export function markNotificationRead(id: string) {
  return request<{ message: string }>('PATCH', `/v1/notifications/${encodeURIComponent(id)}/read`);
}

/** Mark all notifications as read (POST /v1/notifications/mark-all-read) */
export function markAllNotificationsRead() {
  return request<{ message: string; count: number }>('POST', '/v1/notifications/mark-all-read');
}

/** Get notification preferences (GET /v1/notifications/preferences) */
export function getNotificationPreferences() {
  return request<{ preferences: NotificationPreference[] }>('GET', '/v1/notifications/preferences');
}

/** Update notification preference (PATCH /v1/notifications/preferences) */
export function updateNotificationPreference(data: { channel: string; enabled: boolean }) {
  return request<{ message: string }>('PATCH', '/v1/notifications/preferences', data);
}

// --- EOI Admin API ---

export interface EoiAdminItem {
  id: string;
  category: string;
  status: string;
  locale: string;
  name: string;
  email: string;
  message: string | null;
  metadata: unknown;
  sourcePage: string;
  sourceCategory: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  consentVersion: string;
  privacyAcceptedAt: string;
  marketingOptIn: boolean;
  confirmationSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface EoiAdminListResponse {
  data: EoiAdminItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EoiStatsResponse {
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byLocale: Record<string, number>;
  total: number;
}

/** List EOI submissions (GET /v1/admin/eoi) */
export function listEoi(params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  sort?: string;
  order?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.order) searchParams.set('order', params.order);
  return request<EoiAdminListResponse>('GET', `/v1/admin/eoi?${searchParams.toString()}`);
}

/** Get single EOI detail (GET /v1/admin/eoi/:id) */
export function getEoi(id: string) {
  return request<EoiAdminItem>('GET', `/v1/admin/eoi/${encodeURIComponent(id)}`);
}

/** Update EOI status (PATCH /v1/admin/eoi/:id) */
export function updateEoiStatus(id: string, status: string) {
  return request<{ message: string }>('PATCH', `/v1/admin/eoi/${encodeURIComponent(id)}`, { status });
}

/** Get EOI stats (GET /v1/admin/eoi/stats) */
export function getEoiStats() {
  return request<EoiStatsResponse>('GET', '/v1/admin/eoi/stats');
}

/** EOI submission payload. */
export interface EoiSubmitData {
  category: string;
  name: string;
  email: string;
  message?: string;
  sourcePage: string;
  locale: string;
  consentVersion: string;
  privacyAccepted: boolean;
  marketingOptIn: boolean;
}

/** Submit an expression of interest. */
export async function submitEoi(data: EoiSubmitData): Promise<{ id: string; message: string }> {
  const res = await fetch(`${API_BASE}/v1/eoi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'unknown', message: res.statusText })) as ApiError;
    throw new Error(error.message);
  }

  return res.json() as Promise<{ id: string; message: string }>;
}
