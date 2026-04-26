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
          "Interactive Three.js campus viewer organism. Wraps the vanilla `@productioncity/masterplan-viewer` package with a React lifecycle (mount/unmount/resize). WebGL-gated with a plain-text fallback.",
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

/** Default embed: auto-rotate on, labels on, routes off. */
export const Default: Story = {
  args: {
    showLabels: true,
    showRoutes: false,
    autoRotate: true,
    quality: "balanced",
    className: "h-full w-full",
  },
};

/** Labels variant: building names and campus notes visible. */
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

/**
 * Mobile viewport: viewer fits a 375×667 frame.
 * ResizeObserver keeps the canvas correctly sized.
 */
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
          "Rendered at mobile width (375px). `lite` quality reduces GPU load on small screens.",
      },
    },
  },
};

/**
 * Loading state: shown for one render frame before the Three.js scene
 * has initialised. This story freezes the component before `useEffect`
 * fires by rendering inside a zero-size container so WebGL init is
 * effectively suppressed and the spinner stays visible.
 */
export const LoadingState: Story = {
  args: {
    showLabels: true,
    autoRotate: false,
    className: "h-full w-full",
  },
  decorators: [
    (Story) => (
      // Zero-height hides the canvas; the loading overlay stays visible in docs.
      <div style={{ height: "200px", background: "#0a0a0a", position: "relative" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Spinner shown while the Three.js scene initialises. Disappears once the viewer is ready.",
      },
    },
  },
};

/**
 * Patches HTMLCanvasElement.prototype.getContext to return null for the
 * lifetime of this component. The patch is applied synchronously during render
 * so that MasterplanViewer's useEffect (which calls hasWebGL()) sees it.
 * The original is restored on unmount.
 */
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

/**
 * Fallback: no WebGL.
 * `NoWebGLWrapper` patches `HTMLCanvasElement.prototype.getContext` synchronously
 * before render, so `hasWebGL()` (called inside `useEffect` on mount) returns false.
 * The patch is restored on unmount.
 */
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
          "When WebGL is unavailable, a plain accessible message is shown. The container keeps `role=\"img\"` and `aria-label`.",
      },
    },
  },
};

/** onFacilitySelect callback demo: logs selected facility to the Storybook actions panel. */
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
