/**
 * API client for communicating with the backend worker.
 * All auth is cookie-based — no tokens are stored in JS.
 */

/**
 * Base URL for the backend API.
 * Production: https://api.production.city (backend Worker on api subdomain)
 * Dev/other: same origin (empty string)
 */
const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "production.city"
    ? "https://api.production.city"
    : "";

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
    hasPhone: boolean;
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
    // Handle 204 No Content (e.g. DELETE responses)
    if (res.status === 204) {
      return { ok: true, data: undefined as T, status: res.status };
    }
    const data = await res.json() as T;
    return { ok: true, data, status: res.status };
  }

  let error: ApiError;
  try {
    error = await res.json() as ApiError;
  } catch {
    error = { error: 'unknown', message: res.statusText || 'Request failed' };
  }

  // Dispatch session-expired event on 401 (Issue #353)
  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("pc:session-expired"));
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

/** List user's active sessions (GET /v1/auth/sessions) */
export interface SessionItem {
  id: string;
  browser: string;
  os: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export function listSessions() {
  return request<{ sessions: SessionItem[] }>('GET', '/v1/auth/sessions');
}

/** Revoke a session (DELETE /v1/auth/sessions/:sessionId) */
export function revokeSession(sessionId: string) {
  return request<{ message: string }>('DELETE', `/v1/auth/sessions/${encodeURIComponent(sessionId)}`);
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

// --- Announcements Public API ---

export interface PublicAnnouncementCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PublicAnnouncementTag {
  id: string;
  name: string;
  slug: string;
}

export interface PublicAnnouncement {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentBlocks: unknown[];
  visibility: string;
  categories: PublicAnnouncementCategory[];
  tags: PublicAnnouncementTag[];
  author: { id: string; name: string | null };
  publishedAt: string | null;
  lastEditedAt: string | null;
}

export interface AnnouncementListResponse {
  announcements: PublicAnnouncement[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/** List published announcements (GET /v1/announcements) */
export function listAnnouncements(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.search) searchParams.set('search', params.search);
  const qs = searchParams.toString();
  return request<AnnouncementListResponse>('GET', `/v1/announcements${qs ? `?${qs}` : ''}`);
}

/** Get published announcement by slug (GET /v1/announcements/:slug) */
export function getAnnouncement(slug: string) {
  return request<PublicAnnouncement>('GET', `/v1/announcements/${encodeURIComponent(slug)}`);
}

/** List active categories (GET /v1/categories) */
export function listCategories() {
  return request<{ categories: PublicAnnouncementCategory[] }>('GET', '/v1/categories');
}

// --- Subscription API ---

export interface SubscriptionItem {
  id: string;
  category: PublicAnnouncementCategory;
  channel: string;
  status: string;
  confirmedAt: string | null;
  createdAt: string;
}

export interface SubscriptionListResponse {
  subscriptions: SubscriptionItem[];
}

/** List my subscriptions (GET /v1/me/subscriptions) */
export function listMySubscriptions() {
  return request<SubscriptionListResponse>('GET', '/v1/me/subscriptions');
}

/** Subscribe to a category (POST /v1/me/subscriptions) */
export function createSubscription(categoryId: string, channels: string[]) {
  return request<{ subscriptions: SubscriptionItem[]; message: string }>(
    'POST', '/v1/me/subscriptions', { categoryId, channels }
  );
}

/** Unsubscribe (DELETE /v1/me/subscriptions/:id) */
export function deleteSubscription(id: string) {
  return request<{ message: string }>('DELETE', `/v1/me/subscriptions/${encodeURIComponent(id)}`);
}

/** Resend confirmation (POST /v1/me/subscriptions/:id/resend) */
export function resendSubscriptionConfirmation(id: string) {
  return request<{ message: string }>('POST', `/v1/me/subscriptions/${encodeURIComponent(id)}/resend`);
}

/** Confirm subscription (POST /v1/subscriptions/confirm) */
export function confirmSubscription(token: string) {
  return request<{ message: string; subscription: SubscriptionItem }>(
    'POST', '/v1/subscriptions/confirm', { token }
  );
}

/** Decline subscription (POST /v1/subscriptions/decline) */
export function declineSubscription(token: string) {
  return request<{ message: string }>('POST', '/v1/subscriptions/decline', { token });
}

/** Unsubscribe via token (POST /v1/subscriptions/unsubscribe) */
export function unsubscribeByToken(token: string) {
  return request<{ message: string }>('POST', '/v1/subscriptions/unsubscribe', { token });
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

// --- Announcement Admin API ---

export interface AdminAnnouncementItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentBlocks: unknown[];
  status: string;
  visibility: string;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  roleVisibility: { id: string; name: string }[];
  author: { id: string; name: string | null };
  publishedAt: string | null;
  lastEditedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deliveryStats?: {
    queued: number;
    sent: number;
    delivered: number;
    opened: number;
    failed: number;
    suppressed: number;
  };
}

export interface AdminAnnouncementListResponse {
  announcements: AdminAnnouncementItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function listAdminAnnouncements(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  visibility?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.pageSize) sp.set('pageSize', String(params.pageSize));
  if (params?.status) sp.set('status', params.status);
  if (params?.visibility) sp.set('visibility', params.visibility);
  if (params?.category) sp.set('category', params.category);
  if (params?.search) sp.set('search', params.search);
  if (params?.sortBy) sp.set('sortBy', params.sortBy);
  if (params?.sortOrder) sp.set('sortOrder', params.sortOrder);
  return request<AdminAnnouncementListResponse>('GET', `/v1/admin/announcements?${sp.toString()}`);
}

export function getAdminAnnouncement(id: string) {
  return request<AdminAnnouncementItem>('GET', `/v1/admin/announcements/${encodeURIComponent(id)}`);
}

export interface CreateAnnouncementData {
  title: string;
  summary: string;
  contentBlocks: unknown[];
  visibility: 'public' | 'private';
  categoryIds: string[];
  tagIds?: string[];
  roleIds?: string[];
}

export function createAnnouncement(data: CreateAnnouncementData) {
  return request<AdminAnnouncementItem>('POST', '/v1/admin/announcements', data);
}

export function updateAnnouncement(id: string, data: Partial<CreateAnnouncementData>) {
  return request<AdminAnnouncementItem>('PATCH', `/v1/admin/announcements/${encodeURIComponent(id)}`, data);
}

export function publishAnnouncement(id: string) {
  return request<{ message: string }>('POST', `/v1/admin/announcements/${encodeURIComponent(id)}/publish`);
}

export function unpublishAnnouncement(id: string) {
  return request<{ message: string }>('POST', `/v1/admin/announcements/${encodeURIComponent(id)}/unpublish`);
}

export function archiveAnnouncement(id: string) {
  return request<{ message: string }>('POST', `/v1/admin/announcements/${encodeURIComponent(id)}/archive`);
}

// --- Category Admin API ---

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { announcements: number; subscriptions: number };
}

export function listAdminCategories() {
  return request<{ categories: AdminCategory[] }>('GET', '/v1/categories');
}

export function createCategory(data: { name: string; description?: string }) {
  return request<AdminCategory>('POST', '/v1/admin/categories', data);
}

export function updateCategory(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
  return request<AdminCategory>('PATCH', `/v1/admin/categories/${encodeURIComponent(id)}`, data);
}

export function reorderCategories(order: string[]) {
  return request<{ message: string }>('POST', '/v1/admin/categories/reorder', { order });
}

export function deleteCategory(id: string) {
  return request<{ message: string }>('DELETE', `/v1/admin/categories/${encodeURIComponent(id)}`);
}

// --- Tag Admin API ---

export interface AdminTag {
  id: string;
  name: string;
  slug: string;
  _count?: { announcements: number };
}

export function listAdminTags() {
  return request<{ tags: AdminTag[] }>('GET', '/v1/tags');
}

export function createTag(data: { name: string }) {
  return request<AdminTag>('POST', '/v1/admin/tags', data);
}

export function updateTag(id: string, data: { name: string }) {
  return request<AdminTag>('PATCH', `/v1/admin/tags/${encodeURIComponent(id)}`, data);
}

export function deleteTag(id: string) {
  return request<{ message: string }>('DELETE', `/v1/admin/tags/${encodeURIComponent(id)}`);
}

// --- Subscription Admin API ---

export interface AdminSubscriptionItem {
  id: string;
  categoryId: string;
  channel: string;
  status: string;
  userName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  categoryName: string;
}

export interface AdminSubscriptionListResponse {
  subscriptions: AdminSubscriptionItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SubscriptionStatsResponse {
  stats: {
    categoryId: string;
    categoryName: string;
    emailConfirmed: number;
    smsConfirmed: number;
    pending: number;
    total: number;
  }[];
}

export function listAdminSubscriptions(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  channel?: string;
  category?: string;
  search?: string;
}) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.pageSize) sp.set('pageSize', String(params.pageSize));
  if (params?.status) sp.set('status', params.status);
  if (params?.channel) sp.set('channel', params.channel);
  if (params?.category) sp.set('category', params.category);
  if (params?.search) sp.set('search', params.search);
  return request<AdminSubscriptionListResponse>('GET', `/v1/admin/subscriptions?${sp.toString()}`);
}

export function getSubscriptionStats() {
  return request<SubscriptionStatsResponse>('GET', '/v1/admin/subscriptions/stats');
}

export function adminCreateSubscription(data: { userId: string; categoryId: string; channel: string }) {
  return request<{ message: string }>('POST', '/v1/admin/subscriptions', data);
}

export function adminDeleteSubscription(id: string) {
  return request<{ message: string }>('DELETE', `/v1/admin/subscriptions/${encodeURIComponent(id)}`);
}

export function adminResendConfirmation(id: string) {
  return request<{ message: string }>('POST', `/v1/admin/subscriptions/${encodeURIComponent(id)}/resend`);
}

// --- Roles API (for visibility settings) ---

export interface RoleItem {
  id: string;
  name: string;
  description: string | null;
}

export function listRoles() {
  return request<{ roles: RoleItem[] }>('GET', '/v1/admin/roles');
}

// --- Dashboard Registry API ---

export interface RegistryVisibleResponse {
  registry_version: string;
  phase: string;
  visible_feature_ids: string[];
}

/** Get visible dashboard features for authenticated user (GET /v1/registry/visible) */
export function getRegistryVisible() {
  return request<RegistryVisibleResponse>('GET', '/v1/registry/visible');
}

// --- Feature Notification API ---

export interface FeatureNotificationResponse {
  id: string;
  featureId: string;
  createdAt: string;
}

export interface FeatureNotificationStatus {
  subscribed: boolean;
  subscribedAt: string | null;
}

/** Subscribe to feature launch notification (POST /v1/features/:featureId/notify) */
export function subscribeToFeature(featureId: string) {
  return request<FeatureNotificationResponse>('POST', `/v1/features/${encodeURIComponent(featureId)}/notify`);
}

/** Unsubscribe from feature launch notification (DELETE /v1/features/:featureId/notify) */
export function unsubscribeFromFeature(featureId: string) {
  return request<void>('DELETE', `/v1/features/${encodeURIComponent(featureId)}/notify`);
}

/** Check feature notification subscription status (GET /v1/features/:featureId/notify) */
export function getFeatureNotificationStatus(featureId: string) {
  return request<FeatureNotificationStatus>('GET', `/v1/features/${encodeURIComponent(featureId)}/notify`);
}
