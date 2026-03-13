"use client";

/**
 * Pending approvals page — approve/reject users with confirmation.
 * Permission required: user:update
 */

import { useCallback, useEffect, useState } from "react";
import { ApprovalCard, Modal } from "@productioncity/holding-ui";
import { AdminLayout } from "../admin-layout";
import { PermissionGate } from "../../lib/route-guard";
import {
  listPendingApprovals,
  approveUser,
  rejectUser,
  type PendingApproval,
} from "../../lib/api-client";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    approval: PendingApproval;
  } | null>(null);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPendingApprovals();
      if (result.ok) {
        setApprovals(result.data.approvals);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleConfirm = useCallback(async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "approve") {
      await approveUser(confirmAction.approval.id);
    } else {
      await rejectUser(confirmAction.approval.id);
    }

    setConfirmAction(null);
    fetchApprovals();
  }, [confirmAction, fetchApprovals]);

  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Pending Approvals" },
      ]}
    >
      <PermissionGate permission="user:update">
        <div className="flex flex-col gap-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : approvals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                No pending approvals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {approvals.map((a) => (
                <ApprovalCard
                  key={a.id}
                  name={a.name}
                  email={a.email}
                  role={a.role}
                  onApprove={() =>
                    setConfirmAction({ type: "approve", approval: a })
                  }
                  onReject={() =>
                    setConfirmAction({ type: "reject", approval: a })
                  }
                />
              ))}
            </div>
          )}

          <Modal
            open={confirmAction !== null}
            onClose={() => setConfirmAction(null)}
            title={
              confirmAction?.type === "approve"
                ? "Confirm Approval"
                : "Confirm Rejection"
            }
          >
            <div className="flex flex-col gap-4">
              <p className="text-sm text-foreground">
                {confirmAction?.type === "approve"
                  ? `Approve ${confirmAction.approval.name} (${confirmAction.approval.email})?`
                  : `Reject ${confirmAction?.approval.name} (${confirmAction?.approval.email})?`}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="rounded-sm bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors duration-150"
                >
                  {confirmAction?.type === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </PermissionGate>
    </AdminLayout>
  );
}
