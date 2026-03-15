"use client";

/**
 * Invitation management page — list, create, resend, revoke invitations.
 * Includes "Suppressed Emails" tab.
 * Permission required: invitation:read
 */

import { useCallback, useEffect, useState } from "react";
import {
  InvitationTable,
  InvitationForm,
  Modal,
  type InvitationTableInvitation,
  type StatusType,
} from "@productioncity/holding-ui";
import { useBreadcrumbs } from "../use-breadcrumbs";
import { PermissionGate } from "../../lib/route-guard";
import {
  listInvitations,
  createInvitation,
  resendInvitation,
  revokeInvitation,
  listSuppressions,
  removeSuppression,
  type AdminInvitation,
  type EmailSuppression,
} from "../../lib/api-client";

type TabView = "invitations" | "suppressions";

export default function InvitationsPage() {
  useBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
    { label: "Invitations" },
  ]);

  const [invitations, setInvitations] = useState<InvitationTableInvitation[]>([]);
  const [suppressions, setSuppressions] = useState<EmailSuppression[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<TabView>("invitations");

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listInvitations({});
      if (result.ok) {
        setInvitations(
          result.data.invitations.map((inv: AdminInvitation) => ({
            id: inv.id,
            email: inv.email,
            status: inv.status as StatusType,
            role: inv.role,
            invitedBy: inv.invitedBy,
            createdAt: new Date(inv.createdAt),
            expiresAt: new Date(inv.expiresAt),
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuppressions = useCallback(async () => {
    const result = await listSuppressions();
    if (result.ok) {
      setSuppressions(result.data.suppressions);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
    fetchSuppressions();
  }, [fetchInvitations, fetchSuppressions]);

  const handleCreate = useCallback(
    async (data: { email: string; role: string; message: string }) => {
      setFormError(undefined);
      const result = await createInvitation(data);
      if (result.ok) {
        setModalOpen(false);
        fetchInvitations();
      } else {
        setFormError(result.error.message || "Failed to create invitation");
      }
    },
    [fetchInvitations],
  );

  const handleResend = useCallback(
    async (id: string) => {
      await resendInvitation(id);
      fetchInvitations();
    },
    [fetchInvitations],
  );

  const handleRevoke = useCallback(
    async (id: string) => {
      await revokeInvitation(id);
      fetchInvitations();
    },
    [fetchInvitations],
  );

  const handleRemoveSuppression = useCallback(
    async (id: string) => {
      if (!confirm("Remove this email from the suppression list?")) return;
      await removeSuppression(id);
      fetchSuppressions();
    },
    [fetchSuppressions],
  );

  return (

      <PermissionGate permission="invitation:read">
        <div className="flex flex-col gap-4">
          {/* Tab bar */}
          <div className="flex items-center gap-4 border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab("invitations")}
              className={`pb-2 text-sm transition-colors duration-150 ${
                activeTab === "invitations"
                  ? "border-b-2 border-foreground font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Invitations
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("suppressions")}
              className={`pb-2 text-sm transition-colors duration-150 ${
                activeTab === "suppressions"
                  ? "border-b-2 border-foreground font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Suppressed Emails
            </button>
          </div>

          {activeTab === "invitations" && (
            <>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="rounded-sm bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-150"
                >
                  New Invitation
                </button>
              </div>
              <InvitationTable
                invitations={invitations}
                loading={loading}
                onResend={handleResend}
                onRevoke={handleRevoke}
              />
            </>
          )}

          {activeTab === "suppressions" && (
            <div className="flex flex-col gap-2">
              {suppressions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No suppressed emails.
                </p>
              ) : (
                <div className="rounded-sm border border-border divide-y divide-border">
                  {suppressions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{s.email}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.reason} — {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSuppression(s.id)}
                        className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors duration-150"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="New Invitation"
          >
            <InvitationForm
              roles={["admin", "member", "viewer"]}
              onSubmit={handleCreate}
              error={formError}
            />
          </Modal>
        </div>
      </PermissionGate>
  );
}
