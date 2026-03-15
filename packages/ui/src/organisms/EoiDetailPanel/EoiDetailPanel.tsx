'use client';

import { cn } from "../../lib/utils";

/** Full EOI detail data */
export interface EoiDetail {
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

/** Props for the EoiDetailPanel organism */
export interface EoiDetailPanelProps {
  /** Whether the panel is open */
  open: boolean;
  /** Called when the panel should close */
  onClose: () => void;
  /** EOI data to display */
  eoi: EoiDetail | null;
  /** Called when status is updated */
  onStatusUpdate?: (id: string, status: string) => void;
  /** Whether the user can update status (has audit:write permission) */
  canUpdateStatus?: boolean;
  /** Category labels */
  categoryLabels?: Record<string, string>;
  /** Status labels */
  statusLabels?: Record<string, string>;
  /** Status options for dropdown */
  statusOptions?: Array<{ value: string; label: string }>;
  className?: string;
}

const DEFAULT_STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "archived", label: "Archived" },
];

/**
 * EoiDetailPanel organism -- drawer showing full EOI submission details with status update.
 */
function EoiDetailPanel({
  open,
  onClose,
  eoi,
  onStatusUpdate,
  canUpdateStatus = false,
  categoryLabels = {},
  statusLabels = {},
  statusOptions = DEFAULT_STATUS_OPTIONS,
  className,
}: EoiDetailPanelProps) {
  if (!open || !eoi) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const DetailRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="flex justify-between py-1.5 border-b border-border last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground text-right max-w-[60%] break-words">{value || "—"}</span>
    </div>
  );

  return (
    <div className={cn("fixed inset-0 z-50", className)}>
      <div className="absolute inset-0 bg-background/50" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-96 max-w-full bg-card border-l border-border shadow-sm overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-foreground">EOI Detail</span>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors duration-100"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Basic info */}
          <div className="space-y-0">
            <DetailRow label="Name" value={eoi.name} />
            <DetailRow label="Email" value={eoi.email} />
            <DetailRow label="Category" value={categoryLabels[eoi.category] ?? eoi.category} />
            <DetailRow label="Status" value={statusLabels[eoi.status] ?? eoi.status} />
            <DetailRow label="Locale" value={eoi.locale} />
            <DetailRow label="Created" value={formatDate(eoi.createdAt)} />
          </div>

          {/* Message */}
          {eoi.message && (
            <div>
              <span className="text-xs text-muted-foreground">Message</span>
              <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{eoi.message}</p>
            </div>
          )}

          {/* Metadata */}
          {eoi.metadata != null ? (
            <div>
              <span className="text-xs text-muted-foreground">Metadata</span>
              <pre className="text-xs text-foreground mt-1 bg-muted/30 p-2 rounded-sm overflow-auto">
                {typeof eoi.metadata === "string" ? eoi.metadata : JSON.stringify(eoi.metadata, null, 2)}
              </pre>
            </div>
          ) : null}

          {/* Source tracking */}
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Source tracking</span>
            <div className="space-y-0">
              <DetailRow label="Source page" value={eoi.sourcePage} />
              <DetailRow label="Source category" value={eoi.sourceCategory} />
              <DetailRow label="UTM source" value={eoi.utmSource} />
              <DetailRow label="UTM medium" value={eoi.utmMedium} />
              <DetailRow label="UTM campaign" value={eoi.utmCampaign} />
            </div>
          </div>

          {/* Consent */}
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Consent</span>
            <div className="space-y-0">
              <DetailRow label="Version" value={eoi.consentVersion} />
              <DetailRow label="Accepted at" value={formatDate(eoi.privacyAcceptedAt)} />
              <DetailRow label="Marketing opt-in" value={eoi.marketingOptIn ? "Yes" : "No"} />
              <DetailRow label="Confirmation sent" value={formatDate(eoi.confirmationSentAt)} />
            </div>
          </div>

          {/* Status update */}
          {canUpdateStatus && onStatusUpdate && (
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Update status</span>
              <select
                value={eoi.status}
                onChange={(e) => onStatusUpdate(eoi.id, e.target.value)}
                className="w-full h-8 px-2 text-sm border border-border rounded-sm bg-background text-foreground"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { EoiDetailPanel };
