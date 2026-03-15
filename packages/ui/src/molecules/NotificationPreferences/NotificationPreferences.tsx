'use client';

import { cn } from "../../lib/utils";

/** A single notification channel preference */
export interface ChannelPreference {
  channel: string;
  label: string;
  enabled: boolean;
}

/** Props for the NotificationPreferences molecule */
export interface NotificationPreferencesProps {
  /** List of channel preferences */
  preferences: ChannelPreference[];
  /** Called when a preference is toggled */
  onToggle?: (channel: string, enabled: boolean) => void;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Whether the preferences are being saved */
  saving?: boolean;
  className?: string;
}

/**
 * NotificationPreferences molecule -- toggle list for notification channels.
 *
 * Renders a list of notification channels with on/off toggles.
 * Used on the profile/settings page.
 */
function NotificationPreferences({
  preferences,
  onToggle,
  title = "Notification preferences",
  description = "Choose which real-time notifications you receive",
  saving = false,
  className,
}: NotificationPreferencesProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="space-y-1">
        {preferences.map((pref) => (
          <label
            key={pref.channel}
            className="flex items-center justify-between py-2 px-3 rounded-sm hover:bg-accent/30 transition-colors duration-100 cursor-pointer"
          >
            <span className="text-sm text-foreground">{pref.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={pref.enabled}
              disabled={saving}
              onClick={() => onToggle?.(pref.channel, !pref.enabled)}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150",
                pref.enabled ? "bg-primary" : "bg-muted",
                saving && "opacity-50 cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "inline-block h-3.5 w-3.5 rounded-full bg-background transition-transform duration-150",
                  pref.enabled ? "translate-x-4.5" : "translate-x-0.5",
                )}
              />
            </button>
          </label>
        ))}
      </div>
    </div>
  );
}

export { NotificationPreferences };
