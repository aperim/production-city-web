import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MasterplanViewer } from "./MasterplanViewer";

const meta: Meta<typeof MasterplanViewer> = {
  title: "Organisms/MasterplanViewer",
  component: MasterplanViewer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Interactive Three.js campus viewer organism. Wraps the vanilla `@productioncity/masterplan-viewer` package with React lifecycle (mount/unmount/resize). WebGL-gated with poster image or text fallback. Respects `prefers-reduced-motion`. Auto-selects `quality: 'lite'` and labels off on mobile viewports.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "600px", background: "#0a0a0a" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showLabels: true,
    showRoutes: false,
    autoRotate: true,
    quality: "balanced",
    className: "h-full w-full",
  },
};

export const WithLabels: Story = {
  args: {
    showLabels: true,
    showRoutes: true,
    autoRotate: false,
    quality: "balanced",
    className: "h-full w-full",
  },
  parameters: {
    docs: {
      description: {
        story: "Labels and route overlays enabled, auto-rotate disabled.",
      },
    },
  },
};

export const MobileViewport: Story = {
  args: {
    showLabels: false,
    autoRotate: true,
    quality: "lite",
    className: "h-full w-full",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "375px", height: "500px", background: "#0a0a0a" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Mobile width (375px). `quality: 'lite'` reduces GPU load. Labels default to off on viewports < 768px.",
      },
    },
  },
};

/**
 * Reduced motion: auto-rotate is disabled when prefers-reduced-motion: reduce is active.
 * The component reads window.matchMedia on mount and listens for runtime changes.
 * Enable the Storybook 'Reduced Motion' accessibility toolbar toggle to test.
 */
export const ReducedMotion: Story = {
  args: {
    autoRotate: true,
    showLabels: true,
    quality: "balanced",
    className: "h-full w-full",
  },
  decorators: [
    (Story) => (
      <div style={{ height: "400px", background: "#0a0a0a" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "When `prefers-reduced-motion: reduce` is active the viewer ignores `autoRotate` and keeps the camera still. Enable the Storybook 'Reduced Motion' accessibility toggle to test. The component also responds to OS-level changes at runtime via `matchMedia` event listener.",
      },
    },
  },
};

/**
 * Mobile optimised: explicit lite quality + no labels.
 * Mirrors what the component auto-applies on viewports narrower than 768px
 * when `quality` and `showLabels` are left undefined.
 */
export const MobileOptimized: Story = {
  args: {
    quality: "lite",
    showLabels: false,
    autoRotate: true,
    className: "h-full w-full",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "375px", height: "500px", background: "#0a0a0a" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "`quality: 'lite'` reduces GPU load and labels are off — equivalent to the auto-detected mobile configuration. Use explicit overrides when you need guaranteed values regardless of viewport width.",
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    showLabels: true,
    autoRotate: false,
    className: "h-full w-full",
  },
  decorators: [
    (Story) => (
      <div style={{ height: "200px", background: "#0a0a0a", position: "relative" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Golden-hour shimmer shown while Three.js initialises. The radial pulse matches the site's cinematic dark theme.",
      },
    },
  },
};

function NoWebGLWrapper({ children }: { children: React.ReactNode }) {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = () => null;
  useEffect(() => {
    return () => {
      HTMLCanvasElement.prototype.getContext = original;
    };
  }, []);
  return <>{children}</>;
}

export const NoWebGLFallback: Story = {
  args: {
    ariaLabel: "Production City masterplan — interactive 3D campus viewer",
    className: "h-full w-full",
  },
  decorators: [
    (Story) => (
      <NoWebGLWrapper>
        <div style={{ height: "200px", background: "#0a0a0a" }}>
          <Story />
        </div>
      </NoWebGLWrapper>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "When WebGL is unavailable and no poster is provided, a plain accessible message is shown.",
      },
    },
  },
};

export const NoWebGLWithPoster: Story = {
  args: {
    ariaLabel: "Production City masterplan — interactive 3D campus viewer",
    posterSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%231a1c1e' width='1920' height='1080'/%3E%3Ctext x='960' y='540' text-anchor='middle' fill='%23555' font-family='monospace' font-size='24'%3EMasterplan poster%3C/text%3E%3C/svg%3E",
    posterAlt: "Production City 6-hectare campus masterplan — aerial perspective",
    className: "h-full w-full",
  },
  decorators: [
    (Story) => (
      <NoWebGLWrapper>
        <div style={{ height: "400px", background: "#0a0a0a" }}>
          <Story />
        </div>
      </NoWebGLWrapper>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "WebGL unavailable with a poster image. The poster fills the container with `object-cover` so it feels like a static screenshot of the 3D viewer.",
      },
    },
  },
};

export const WithFacilitySelectCallback: Story = {
  args: {
    showLabels: true,
    autoRotate: false,
    quality: "balanced",
    className: "h-full w-full",
    onFacilitySelect: (id, facility) => {
      console.log("[MasterplanViewer] facility selected", id, facility);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Click a building to fire `onFacilitySelect`. Logs the facility id and data to the browser console.",
      },
    },
  },
};
