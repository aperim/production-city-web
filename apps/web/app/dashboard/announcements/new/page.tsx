"use client";

/**
 * New announcement editor page.
 * Permission required: announcement:create
 */

import { PermissionGate } from "../../../lib/route-guard";
import { useBreadcrumbs } from "../../use-breadcrumbs";
import { AnnouncementEditor } from "../announcement-editor";

export default function NewAnnouncementPage() {
  useBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
    { label: "Announcements", href: "/dashboard/announcements" },
    { label: "New" },
  ]);

  return (
    <PermissionGate permission="announcement:create">
      <AnnouncementEditor />
    </PermissionGate>
  );
}
