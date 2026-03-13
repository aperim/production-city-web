'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import { RoleBadge } from '../../molecules/RoleBadge/RoleBadge';

/** Props for the ApprovalCard organism */
export interface ApprovalCardProps {
  /**
   * User name.
   */
  name: string;
  /**
   * User email.
   */
  email: string;
  /**
   * Requested role.
   */
  role: string;
  /**
   * Optional avatar initial or slot.
   */
  avatarInitial?: string;
  /**
   * Called when approved.
   */
  onApprove: () => void;
  /**
   * Called when rejected.
   */
  onReject: () => void;
  /**
   * Button labels for i18n.
   */
  labels?: {
    approve?: string;
    reject?: string;
  };
  /**
   * Additional class names.
   */
  className?: string;
}

/**
 * ApprovalCard organism — card showing a pending user for approval/rejection.
 *
 * Composes Card-like layout + Avatar initial + RoleBadge + action buttons.
 * All user-supplied text rendered via JSX.
 */
export function ApprovalCard({
  name,
  email,
  role,
  avatarInitial,
  onApprove,
  onReject,
  labels = {},
  className,
}: ApprovalCardProps) {
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);

  const approveLabel = labels.approve ?? 'Approve';
  const rejectLabel = labels.reject ?? 'Reject';

  const initial = avatarInitial ?? (name ? name[0]?.toUpperCase() : '?');

  const handleApprove = () => {
    setDecision('approved');
    onApprove();
  };

  const handleReject = () => {
    setDecision('rejected');
    onReject();
  };

  return (
    <div
      className={cn(
        'rounded-sm border border-border bg-card text-card-foreground p-4',
        'transition-opacity duration-200',
        decision && 'opacity-60',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground"
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate max-w-40" title={name}>
              {name}
            </span>
            <RoleBadge role={role} />
          </div>
          <p className="text-sm text-muted-foreground truncate" title={email}>
            {email}
          </p>
        </div>
      </div>

      {decision ? (
        <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
          {decision === 'approved' ? 'Approved' : 'Rejected'}
        </p>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleApprove}
            className="rounded-sm bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-150 min-h-[36px]"
          >
            {approveLabel}
          </button>
          <button
            type="button"
            onClick={handleReject}
            className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-150 min-h-[36px]"
          >
            {rejectLabel}
          </button>
        </div>
      )}
    </div>
  );
}
