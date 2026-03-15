/**
 * TypeScript types for the announcements system.
 *
 * These types are shared across atoms, molecules, and organisms in the UI
 * package and are consumed by both the web app and admin interfaces.
 *
 * @module announcements
 */

/** The type of content block within an announcement body. */
export type ContentBlockType =
  | "header"
  | "text"
  | "image"
  | "image_text_left"
  | "image_text_right"
  | "spacer";

/** Publication lifecycle status of an announcement. */
export type AnnouncementStatus = "draft" | "published" | "archived";

/** Visibility scope of an announcement. */
export type AnnouncementVisibility = "public" | "private";

/** Confirmation status of a user's subscription. */
export type SubscriptionStatus = "pending" | "confirmed" | "declined" | "expired";

/** Communication channel for subscriptions and delivery. */
export type SubscriptionChannel = "email" | "sms";

/** Delivery status for a single announcement recipient. */
export type DeliveryStatus =
  | "queued"
  | "sending"
  | "sent"
  | "delivered"
  | "failed"
  | "suppressed";

/** Header level for header content blocks. */
export type HeaderLevel = "h1" | "h2" | "h3";

/** Spacer size for spacer content blocks. */
export type SpacerSize = "sm" | "md" | "lg";

// ---------------------------------------------------------------------------
// Content Blocks
// ---------------------------------------------------------------------------

/** Base interface for all content blocks. */
interface ContentBlockBase {
  /** Unique identifier for this block. */
  id: string;
  /** Block ordering position. */
  position: number;
}

/** Header content block. */
export interface HeaderBlock extends ContentBlockBase {
  type: "header";
  level: HeaderLevel;
  text: string;
}

/** Text (markdown) content block. */
export interface TextBlock extends ContentBlockBase {
  type: "text";
  markdown: string;
}

/** Image content block. */
export interface ImageBlock extends ContentBlockBase {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

/** Image with text on the left. */
export interface ImageTextLeftBlock extends ContentBlockBase {
  type: "image_text_left";
  src: string;
  alt: string;
  markdown: string;
}

/** Image with text on the right. */
export interface ImageTextRightBlock extends ContentBlockBase {
  type: "image_text_right";
  src: string;
  alt: string;
  markdown: string;
}

/** Spacer content block. */
export interface SpacerBlock extends ContentBlockBase {
  type: "spacer";
  size: SpacerSize;
}

/** Discriminated union of all content block types. */
export type ContentBlock =
  | HeaderBlock
  | TextBlock
  | ImageBlock
  | ImageTextLeftBlock
  | ImageTextRightBlock
  | SpacerBlock;

// ---------------------------------------------------------------------------
// Categories & Tags
// ---------------------------------------------------------------------------

/** Announcement category. */
export interface Category {
  /** Unique identifier. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** URL-safe slug. */
  slug: string;
  /** Optional description. */
  description?: string;
}

/** Announcement tag. */
export interface Tag {
  /** Unique identifier. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** URL-safe slug. */
  slug: string;
}

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

/** Summary view of an announcement (for listing cards). */
export interface AnnouncementSummary {
  /** Unique identifier. */
  id: string;
  /** Announcement title. */
  title: string;
  /** Short excerpt/summary. */
  summary: string;
  /** URL slug. */
  slug: string;
  /** Assigned categories. */
  categories: Category[];
  /** Assigned tags. */
  tags: Tag[];
  /** Author information. */
  author: { name: string };
  /** ISO date string of publication. */
  publishedAt: string;
  /** Visibility scope. */
  visibility: AnnouncementVisibility;
}

/** Full announcement for admin views. */
export interface AdminAnnouncement extends AnnouncementSummary {
  /** Publication lifecycle status. */
  status: AnnouncementStatus;
  /** Content blocks. */
  contentBlocks: ContentBlock[];
  /** ISO date string of creation. */
  createdAt: string;
  /** ISO date string of last update. */
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

/** A user's subscription to a category. */
export interface Subscription {
  /** Unique identifier. */
  id: string;
  /** Category this subscription belongs to. */
  categoryId: string;
  /** Communication channel. */
  channel: SubscriptionChannel;
  /** Confirmation status. */
  status: SubscriptionStatus;
}

/** Admin view of a subscription with user details. */
export interface AdminSubscription extends Subscription {
  /** Subscriber's display name. */
  userName: string;
  /** Subscriber's email (always shown). */
  email: string;
  /** Subscriber's phone (masked by default). */
  phone: string | null;
  /** ISO date of subscription creation. */
  createdAt: string;
  /** Category name for display. */
  categoryName: string;
}

/** Filter state for admin subscription table. */
export interface SubscriptionFilters {
  /** Filter by category slug. */
  category?: string;
  /** Filter by subscription status. */
  status?: SubscriptionStatus;
  /** Filter by channel. */
  channel?: SubscriptionChannel;
}

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------

/** Delivery tracking for a single recipient. */
export interface DeliveryRecord {
  /** Recipient name. */
  userName: string;
  /** Delivery channel. */
  channel: SubscriptionChannel;
  /** Current delivery status. */
  status: DeliveryStatus;
  /** ISO date when sent (null if not yet sent). */
  sentAt: string | null;
  /** ISO date when delivered (null if not yet delivered). */
  deliveredAt: string | null;
  /** ISO date when opened — email only (null if not opened). */
  openedAt: string | null;
  /** Error message when status is "failed". */
  error?: string;
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

/** A media asset available for use in content blocks. */
export interface MediaAsset {
  /** Unique identifier. */
  id: string;
  /** URL to the asset. */
  url: string;
  /** Alt text. */
  alt: string;
  /** MIME type. */
  mimeType: string;
  /** Original filename. */
  filename: string;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/** Shared pagination props for list/table components. */
export interface PaginationState {
  /** Current page (1-based). */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Callback when page changes. */
  onPageChange: (page: number) => void;
}
