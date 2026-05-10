import type { NotificationData } from "../lib/api-client";

/** Map a notification type to a human-readable message. */
export function notificationMessage(n: Pick<NotificationData, "type">): string {
  switch (n.type) {
    case "approval_needed":
      return "New user pending approval";
    case "invitation_accepted":
      return "Invitation accepted";
    case "user_activated":
      return "User account activated";
    case "approval":
      return "Action required: approval pending";
    case "mention":
      return "You were mentioned";
    case "update":
      return "You have a new update";
    case "system":
      return "System notification";
    default:
      return "You have a new notification";
  }
}
