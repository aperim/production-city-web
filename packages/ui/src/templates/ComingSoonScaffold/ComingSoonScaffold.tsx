import { cn } from '../../lib/utils';
import { ComingSoonBanner, type SubscribeState } from '../../molecules/ComingSoonBanner/ComingSoonBanner';
import { WireframePreview, type WireframeType } from '../../molecules/WireframePreview/WireframePreview';
import { sanitizeHref } from '../../atoms/Link/Link';

export interface RelatedFeature {
  id: string;
  label: string;
  path: string;
}

export interface ComingSoonScaffoldProps {
  /** Feature ID for subscribe action */
  featureId: string;
  /** Feature display name */
  featureName: string;
  /** Feature description */
  description: string;
  /** Feature status */
  status: 'coming_soon' | 'planned';
  /** Target implementation quarter */
  targetQuarter?: string | null;
  /** Which wireframe type to show */
  wireframeType: WireframeType;
  /** Subscribe state machine */
  subscribeState: SubscribeState;
  /** Called when user clicks notify */
  onSubscribe: (featureId: string) => void;
  /** Active features in the same workspace */
  relatedFeatures?: RelatedFeature[];
  /** Additional class names */
  className?: string;
}

/**
 * ComingSoonScaffold template — in-workspace scaffold for not-yet-active tabs.
 *
 * Renders within the WorkspaceShell canvas slot. Shows:
 * - Feature name and description
 * - ComingSoonBanner with notify button
 * - WireframePreview matching the feature's canvas type
 * - Related active features with links
 */
export function ComingSoonScaffold({
  featureId,
  featureName,
  description,
  status,
  targetQuarter,
  wireframeType,
  subscribeState,
  onSubscribe,
  relatedFeatures = [],
  className,
}: ComingSoonScaffoldProps) {
  return (
    <div className={cn('flex flex-col gap-6 p-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium text-foreground">{featureName}</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
      </div>

      {/* Banner */}
      <ComingSoonBanner
        status={status}
        targetQuarter={targetQuarter}
        featureId={featureId}
        subscribeState={subscribeState}
        onSubscribe={onSubscribe}
      />

      {/* Wireframe */}
      <div className="max-w-xl">
        <WireframePreview type={wireframeType} />
      </div>

      {/* Related features */}
      {relatedFeatures.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Active features</h3>
          <div className="flex flex-wrap gap-2">
            {relatedFeatures.map((f) => (
              <a
                key={f.id}
                href={sanitizeHref(f.path)}
                className="rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {f.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
