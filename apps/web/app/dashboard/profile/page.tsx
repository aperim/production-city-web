"use client";

/**
 * User profile page: name editing, email display, roles, theme toggle, session management.
 */

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  ProfileForm,
  SessionList,
  ThemeToggle,
  type SessionData,
} from "@productioncity/holding-ui";
import { AdminLayout } from "../admin-layout";
import { useAuth } from "../../lib/auth-context";
import {
  updateProfile,
  listSessions,
  revokeSession,
} from "../../lib/api-client";
import { useTranslation } from "../../i18n/context";

export default function ProfilePage() {
  const { user, roles, refreshSession } = useAuth();
  const { t } = useTranslation();

  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const result = await listSessions();
      if (result.ok) {
        setSessions(result.data.sessions);
      }
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleProfileSubmit = useCallback(
    async (name: string) => {
      const result = await updateProfile({ name });
      if (!result.ok) {
        throw new Error(result.error.message);
      }
      // Refresh session to update sidebar
      await refreshSession();
    },
    [refreshSession],
  );

  const handleRevokeSession = useCallback(
    async (sessionId: string) => {
      const result = await revokeSession(sessionId);
      if (!result.ok) {
        throw new Error(result.error.message);
      }
    },
    [],
  );

  const breadcrumbs = [
    { label: t("admin.dashboard.title"), href: "/dashboard" },
    { label: t("admin.profile.title") },
  ];

  if (!user) return null;

  return (
    <AdminLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-8 max-w-xl">
        {/* Profile form */}
        <ProfileForm
          defaultName={user.name ?? ""}
          onSubmit={handleProfileSubmit}
          labels={{
            nameLabel: t("admin.profile.nameLabel"),
            saveButton: t("admin.profile.saveButton"),
            saving: t("admin.profile.saving"),
            saved: t("admin.profile.saved"),
          }}
        />

        {/* Email (read-only) */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-foreground">
            {t("admin.profile.emailLabel")}
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {/* Roles (read-only) */}
        {roles.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-foreground">
              {t("admin.profile.rolesLabel")}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Theme toggle */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-foreground">
            {t("admin.profile.themeLabel")}
          </p>
          <ThemeToggle
            lightLabel={t("admin.profile.themeLight")}
            darkLabel={t("admin.profile.themeDark")}
          />
        </div>

        {/* Session management */}
        {sessionsLoading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : (
          <SessionList
            sessions={sessions}
            onRevoke={handleRevokeSession}
            labels={{
              title: t("admin.profile.sessions.title"),
              currentSession: t("admin.profile.sessions.currentSession"),
              revokeButton: t("admin.profile.sessions.revokeButton"),
              confirmRevoke: t("admin.profile.sessions.confirmRevoke"),
              cancelRevoke: t("admin.profile.sessions.cancelRevoke"),
              noOtherSessions: t("admin.profile.sessions.noOtherSessions"),
              sessionRevoked: t("admin.profile.sessions.sessionRevoked"),
              lastActive: t("admin.profile.sessions.lastActive"),
              createdAt: t("admin.profile.sessions.createdAt"),
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
