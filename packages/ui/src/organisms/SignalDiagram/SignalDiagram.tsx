"use client";

import { useEffect, useRef, useState } from "react";

/** Props for the SignalDiagram organism */
export interface SignalDiagramProps {
  className?: string;
}

const DURATION = 20000; // ms — must match CSS animation duration on path traces

const STATIONS = [
  "IDEATION",
  "IP STRATEGY",
  "SCRIPT · LIBRETTO",
  "PRE-VIS · STORYBOARD",
  "DIGITAL ASSETS",
  "DESIGN · BUILD",
  "SCREEN + STAGE LANES",
  "SCREEN + STAGE LANES",
  "DISTRIBUTION",
  "AUDIENCE · ANCILLARY",
  "ANALYTICS · R&D",
  "FEEDBACK · INSIGHT",
];

function pad(n: number, w = 2): string {
  return String(n).padStart(w, "0");
}

/**
 * SignalDiagram — "IP LIFECYCLE · LIVE" animated diagram.
 *
 * Ported from `reference/index.html` (lines 128–437, 806–860) and
 * `reference/assets/site.css` (lines 1259–1434).
 *
 * Consists of:
 * - Chrome bar with blinking dot, label, and live 24fps timecode
 * - Animated SVG: 19 nodes, 8 stroke-dashoffset path traces, 6 animateMotion particles
 * - Footer ticker cycling through 12 station labels synced to animation phase
 * - prefers-reduced-motion: all animations disabled, static fallback labels shown
 */
export function SignalDiagram({ className }: SignalDiagramProps) {
  const [timecode, setTimecode] = useState("00:00:00:00");
  const [nowLabel, setNowLabel] = useState("— IDEATION");
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setNowLabel("— DEVELOPMENT → DELIVERY");
      setTimecode("00:00:00:00");
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    function tick(now: number) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;

      const phase = (elapsed % DURATION) / DURATION;
      const idx = Math.floor(phase * STATIONS.length) % STATIONS.length;
      setNowLabel("— " + STATIONS[idx]);

      const totalFrames = Math.floor(elapsed / (1000 / 24));
      const f = totalFrames % 24;
      const s = Math.floor(totalFrames / 24) % 60;
      const m = Math.floor(totalFrames / (24 * 60)) % 60;
      const h = Math.floor(totalFrames / (24 * 60 * 60)) % 24;
      setTimecode(`${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`);

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  return (
    <figure
      className={className}
      aria-label="Production City IP lifecycle: one idea moves through ideation, strategy, script, pre-vis, digital assets and design, then diverges into parallel screen and stage lanes, reconverges at distribution and audience, with analytics feeding back into ideation."
      style={{
        margin: 0,
        border: "1px solid var(--rule)",
        background: "#0E0E0E",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Chrome bar */}
      <div style={chromeStyle}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--paper)", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 0 2px rgba(217,59,43,0.22)",
              animation: reducedMotion ? "none" : "sd-blink 1.6s ease-in-out infinite",
              display: "inline-block",
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
          {" "}IP LIFECYCLE · LIVE
        </span>
        <span style={chromeCenterStyle}>ONE IP · TWO LANES · ONE LOOP</span>
        <span style={chromeTcStyle} aria-label="timecode" aria-live="off">
          {timecode}
        </span>
      </div>

      {/* SVG diagram */}
      <div
        style={{
          position: "relative",
          aspectRatio: "720 / 1180",
          background: "radial-gradient(ellipse at 50% 40%, rgba(217,59,43,0.05), transparent 60%), #0A0A0A",
        }}
      >
        <svg
          viewBox="-80 0 840 1200"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-hidden="true"
          style={{ width: "100%", height: "100%", color: "var(--muted-ink)", display: "block" }}
        >
          <defs>
            <path id="sd-spine"      d="M 360 80 L 360 620"                                          fill="none"/>
            <path id="sd-divScreen" d="M 360 620 C 280 640, 200 650, 180 680"                        fill="none"/>
            <path id="sd-divStage"  d="M 360 620 C 440 640, 520 650, 540 680"                        fill="none"/>
            <path id="sd-screenLane" d="M 180 680 L 180 1000"                                        fill="none"/>
            <path id="sd-stageLane"  d="M 540 680 L 540 1000"                                        fill="none"/>
            <path id="sd-recScreen"  d="M 180 1000 C 200 1030, 280 1050, 360 1060"                   fill="none"/>
            <path id="sd-recStage"   d="M 540 1000 C 520 1030, 440 1050, 360 1060"                   fill="none"/>
            <path id="sd-feedback"
              d="M 360 1160 C 780 1160, 780 40, 360 40 L 360 80"
              fill="none"/>
            <radialGradient id="sd-pulseG" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FFE9E5"/>
              <stop offset="40%"  stopColor="#D93B2B" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#D93B2B" stopOpacity="0"/>
            </radialGradient>
            <filter id="sd-pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Keyframe styles injected inline */}
          <style>{reducedMotion ? reducedMotionStyles : animationStyles}</style>

          {/* Crop marks */}
          <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.25">
            <path d="M -60 40 L -60 20 L -40 20"/>
            <path d="M 740 20 L 740 40 M 720 20 L 740 20"/>
            <path d="M -60 1160 L -60 1180 L -40 1180"/>
            <path d="M 720 1180 L 740 1180 L 740 1160"/>
          </g>

          {/* Lane headers */}
          <text x="180" y="658" textAnchor="middle" className="sd-lane-header sd-lane-screen">SCREEN LANE</text>
          <text x="540" y="658" textAnchor="middle" className="sd-lane-header sd-lane-stage">STAGE LANE</text>

          {/* Base paths */}
          <use href="#sd-spine"      className="sd-path-base"/>
          <use href="#sd-divScreen"  className="sd-path-base"/>
          <use href="#sd-divStage"   className="sd-path-base"/>
          <use href="#sd-screenLane" className="sd-path-base"/>
          <use href="#sd-stageLane"  className="sd-path-base"/>
          <use href="#sd-recScreen"  className="sd-path-base"/>
          <use href="#sd-recStage"   className="sd-path-base"/>
          <use href="#sd-feedback"   className="sd-path-base sd-path-dashed"/>

          {/* Animated traces */}
          <use href="#sd-spine"      className="sd-trace sd-trace-spine"/>
          <use href="#sd-divScreen"  className="sd-trace sd-trace-lane"/>
          <use href="#sd-divStage"   className="sd-trace sd-trace-lane"/>
          <use href="#sd-screenLane" className="sd-trace sd-trace-lane"/>
          <use href="#sd-stageLane"  className="sd-trace sd-trace-lane"/>
          <use href="#sd-recScreen"  className="sd-trace sd-trace-rec"/>
          <use href="#sd-recStage"   className="sd-trace sd-trace-rec"/>
          <use href="#sd-feedback"   className="sd-trace sd-trace-fb"/>

          {/* Pulses — 20s loop */}
          {/* Pulse A: shared spine */}
          <circle r="14" fill="url(#sd-pulseG)" filter="url(#sd-pulseGlow)">
            <animateMotion dur="20s" repeatCount="indefinite"
              keyTimes="0;0.35;0.35001;1" keyPoints="0;1;0;0" calcMode="linear">
              <mpath href="#sd-spine"/>
            </animateMotion>
          </circle>
          {/* Pulse B: divergence + screen lane */}
          <circle r="12" fill="url(#sd-pulseG)" filter="url(#sd-pulseGlow)">
            <animateMotion dur="20s" begin="7s" repeatCount="indefinite"
              keyTimes="0;0.03;0.03001;1" keyPoints="0;1;0;0" calcMode="linear">
              <mpath href="#sd-divScreen"/>
            </animateMotion>
          </circle>
          <circle r="12" fill="url(#sd-pulseG)" filter="url(#sd-pulseGlow)">
            <animateMotion dur="20s" begin="7.6s" repeatCount="indefinite"
              keyTimes="0;0.20;0.20001;1" keyPoints="0;1;0;0" calcMode="linear">
              <mpath href="#sd-screenLane"/>
            </animateMotion>
          </circle>
          {/* Pulse C: divergence + stage lane */}
          <circle r="12" fill="url(#sd-pulseG)" filter="url(#sd-pulseGlow)">
            <animateMotion dur="20s" begin="7s" repeatCount="indefinite"
              keyTimes="0;0.03;0.03001;1" keyPoints="0;1;0;0" calcMode="linear">
              <mpath href="#sd-divStage"/>
            </animateMotion>
          </circle>
          <circle r="12" fill="url(#sd-pulseG)" filter="url(#sd-pulseGlow)">
            <animateMotion dur="20s" begin="7.6s" repeatCount="indefinite"
              keyTimes="0;0.20;0.20001;1" keyPoints="0;1;0;0" calcMode="linear">
              <mpath href="#sd-stageLane"/>
            </animateMotion>
          </circle>
          {/* Pulse D/E: reconverge */}
          <circle r="12" fill="url(#sd-pulseG)" filter="url(#sd-pulseGlow)">
            <animateMotion dur="20s" begin="11.6s" repeatCount="indefinite"
              keyTimes="0;0.04;0.04001;1" keyPoints="0;1;0;0" calcMode="linear">
              <mpath href="#sd-recScreen"/>
            </animateMotion>
          </circle>
          <circle r="12" fill="url(#sd-pulseG)" filter="url(#sd-pulseGlow)">
            <animateMotion dur="20s" begin="11.6s" repeatCount="indefinite"
              keyTimes="0;0.04;0.04001;1" keyPoints="0;1;0;0" calcMode="linear">
              <mpath href="#sd-recStage"/>
            </animateMotion>
          </circle>
          {/* Pulse F: feedback */}
          <circle r="10" fill="url(#sd-pulseG)" filter="url(#sd-pulseGlow)" opacity="0.75">
            <animateMotion dur="20s" begin="13s" repeatCount="indefinite"
              keyTimes="0;0.32;0.32001;1" keyPoints="0;1;0;0" calcMode="linear">
              <mpath href="#sd-feedback"/>
            </animateMotion>
          </circle>

          {/* Shared spine nodes (6) */}
          <NodeGroup i={0} x={360} y={80}  type="shared" num="01" name="IDEATION"                  sub="concept · themes · audience"       labelSide="right"/>
          <NodeGroup i={1} x={360} y={170} type="shared" num="02" name="IP STRATEGY"               sub="canon · rights · format split"      labelSide="right"/>
          <NodeGroup i={2} x={360} y={260} type="shared" num="03" name="SCRIPT · LIBRETTO · SCORE" sub="drafts for both formats"             labelSide="right"/>
          <NodeGroup i={3} x={360} y={350} type="shared" num="04" name="PRE-VIS · STORYBOARD"      sub="shared visual language"             labelSide="right"/>
          <NodeGroup i={4} x={360} y={440} type="shared" num="05" name="DIGITAL ASSETS"            sub="3D · CGI · LED content · mocap"     labelSide="right"/>
          <NodeGroup i={5} x={360} y={530} type="shared" num="06" name="DESIGN · BUILD · COSTUME"  sub="sets · props · wardrobe"            labelSide="right"/>

          {/* Screen lane nodes (5) */}
          <NodeGroup i={6}  x={180} y={680}  type="screen" r={6} haloR={14} num="S1" name="CASTING · CREW"               labelSide="left"/>
          <NodeGroup i={7}  x={180} y={760}  type="screen" r={6} haloR={14} num="S2" name="PRINCIPAL PHOTOGRAPHY"       sub="stages · LED volume"           labelSide="left"/>
          <NodeGroup i={8}  x={180} y={840}  type="screen" r={6} haloR={14} num="S3" name="EDITORIAL"                   labelSide="left"/>
          <NodeGroup i={9}  x={180} y={920}  type="screen" r={6} haloR={14} num="S4" name="VFX · CGI"                   labelSide="left"/>
          <NodeGroup i={10} x={180} y={1000} type="screen" r={6} haloR={14} num="S5" name="SOUND · COLOUR · FINISHING"  labelSide="left"/>

          {/* Stage lane nodes (5) */}
          <NodeGroup i={11} x={540} y={680}  type="stage" r={6} haloR={14} num="T1" name="CASTING · COMPANY"           labelSide="right"/>
          <NodeGroup i={12} x={540} y={760}  type="stage" r={6} haloR={14} num="T2" name="REHEARSAL"                  labelSide="right"/>
          <NodeGroup i={13} x={540} y={840}  type="stage" r={6} haloR={14} num="T3" name="TECH · PREVIEWS"            labelSide="right"/>
          <NodeGroup i={14} x={540} y={920}  type="stage" r={6} haloR={14} num="T4" name="OPENING · SEASON RUN"       sub="broadcast theatre · live capture" labelSide="right"/>
          <NodeGroup i={15} x={540} y={1000} type="stage" r={6} haloR={14} num="T5" name="TOUR · TRANSFERS"           labelSide="right"/>

          {/* Reconverge nodes (3) */}
          <NodeGroup i={16} x={360} y={1060} type="converge" r={8}  haloR={18} num="07" name="DISTRIBUTION"         sub="theatrical · SVOD · broadcast · live · VR/AR" labelSide="right" keyDot/>
          <NodeGroup i={17} x={360} y={1110} type="converge"        haloR={16} num="08" name="AUDIENCE · ANCILLARY" sub="box office · subs · merch · fandom"            labelSide="right"/>
          <NodeGroup i={18} x={360} y={1160} type="converge"        haloR={16} num="09" name="ANALYTICS · R&D"      sub="performance · insight · new techniques"        labelSide="right" loopDot/>

          {/* Feedback caption */}
          <text
            style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.35em", fill: "var(--muted-ink)", textTransform: "uppercase" }}
            x="715" y="600" textAnchor="middle" transform="rotate(90 715 600)"
          >
            FEEDBACK · INSIGHT · CANON · NEXT CYCLE
          </text>
        </svg>
      </div>

      {/* Footer ticker */}
      <figcaption style={footStyle}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted-ink)" }}>NOW</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--paper)" }} aria-live="off">
          {nowLabel}
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted-ink)" }}>SHARED · SPLIT · MERGE · LOOP</span>
      </figcaption>
    </figure>
  );
}

/* ---- Sub-component: NodeGroup ---- */

interface NodeGroupProps {
  i: number;
  x: number;
  y: number;
  type: "shared" | "screen" | "stage" | "converge";
  r?: number;
  haloR?: number;
  num: string;
  name: string;
  sub?: string;
  labelSide: "left" | "right";
  keyDot?: boolean;
  loopDot?: boolean;
}

const NODE_DOT_COLORS: Record<string, string> = {
  shared:   "#F0EDE4",
  screen:   "#A8C9BA",
  stage:    "#D9A391",
  converge: "var(--accent)",
};

const NODE_NUM_COLORS: Record<string, string> = {
  shared:   "var(--muted-ink)",
  screen:   "#7FA692",
  stage:    "#B97961",
  converge: "var(--muted-ink)",
};

function NodeGroup({ i, x, y, type, r = 7, haloR = 16, num, name, sub, labelSide, keyDot, loopDot }: NodeGroupProps) {
  const delay = NODE_DELAYS[i] ?? 0;
  const dotColor = (keyDot || loopDot) ? "var(--accent)" : NODE_DOT_COLORS[type];
  const numColor = NODE_NUM_COLORS[type];
  const labelOffset = labelSide === "right" ? 20 : -18;
  const anchor = labelSide === "right" ? "start" : "end";

  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle
        r={r}
        fill={dotColor}
        opacity="0.8"
        style={{
          animation: `sd-dot-pulse 20s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      />
      <circle
        r={haloR}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.2"
        opacity="0"
        style={{
          transformOrigin: "center",
          transformBox: "fill-box",
          animation: `sd-halo-pulse 20s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      />
      <g transform={`translate(${labelOffset}, 4)`} textAnchor={anchor}>
        <text
          style={{
            fontFamily: "var(--mono)",
            fontSize: 9,
            letterSpacing: "0.22em",
            fill: numColor,
            animation: `sd-num-flash 20s linear inherit`,
            animationDelay: `${delay}s`,
          }}
        >
          {num}
        </text>
        <text
          y="14"
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            fill: "var(--paper)",
            fontWeight: 500,
          }}
        >
          {name}
        </text>
        {sub && (
          <text
            y="28"
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              letterSpacing: "0.1em",
              fill: "var(--muted-ink)",
            }}
          >
            {sub}
          </text>
        )}
      </g>
    </g>
  );
}

/* ---- Animation delays per node index (matches reference) ---- */
const NODE_DELAYS: Record<number, number> = {
  0: 0, 1: 1.17, 2: 2.33, 3: 3.5, 4: 4.67, 5: 5.83,
  6: 7, 7: 7.8, 8: 8.6, 9: 9.4, 10: 10.2,
  11: 7, 12: 7.8, 13: 8.6, 14: 9.4, 15: 10.2,
  16: 11.4, 17: 12.1, 18: 12.8,
};

/* ---- Shared style objects ---- */
const chromeStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "10px 14px",
  borderBottom: "1px solid var(--rule)",
  whiteSpace: "nowrap",
};
const chromeCenterStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: 10,
  letterSpacing: "0.14em",
  color: "var(--muted-ink)",
  textTransform: "uppercase",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const chromeTcStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: 10,
  letterSpacing: "0.14em",
  color: "var(--paper)",
  fontVariantNumeric: "tabular-nums",
  textTransform: "uppercase",
};
const footStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "10px 14px",
  borderTop: "1px solid var(--rule)",
};

/* ---- Keyframe CSS injected into SVG <style> ---- */
const animationStyles = `
  .sd-lane-header { font-family: var(--mono); font-size: 10px; letter-spacing: 0.3em; fill: var(--muted-ink); font-weight: 500; }
  .sd-lane-screen  { fill: #A8C9BA; }
  .sd-lane-stage   { fill: #D9A391; }

  .sd-path-base   { stroke: #262626; stroke-width: 1; fill: none; }
  .sd-path-dashed { stroke-dasharray: 3 5; stroke: #242424; }
  .sd-trace {
    stroke: var(--accent); stroke-width: 1.3; fill: none; opacity: 0.9;
    filter: drop-shadow(0 0 6px rgba(217,59,43,0.55));
  }
  .sd-trace-spine {
    stroke-dasharray: 60 600;
    animation: sd-tr-spine 20s linear infinite;
  }
  @keyframes sd-tr-spine {
    0%   { stroke-dashoffset: 60; opacity: 0.9; }
    35%  { stroke-dashoffset: -600; opacity: 0.9; }
    35.01%, 100% { stroke-dashoffset: -600; opacity: 0.25; }
  }
  .sd-trace-lane {
    stroke-dasharray: 40 400; opacity: 0;
    animation: sd-tr-lane 20s linear infinite;
  }
  @keyframes sd-tr-lane {
    0%, 34.99% { stroke-dashoffset: 0; opacity: 0; }
    35%        { stroke-dashoffset: 0; opacity: 0.9; }
    55%        { stroke-dashoffset: -340; opacity: 0.9; }
    55.01%, 100% { stroke-dashoffset: -340; opacity: 0.25; }
  }
  .sd-trace-rec {
    stroke-dasharray: 30 300; opacity: 0;
    animation: sd-tr-rec 20s linear infinite;
  }
  @keyframes sd-tr-rec {
    0%, 54.99% { stroke-dashoffset: 0; opacity: 0; }
    55%        { stroke-dashoffset: 0; opacity: 0.9; }
    65%        { stroke-dashoffset: -180; opacity: 0.9; }
    65.01%, 100% { stroke-dashoffset: -180; opacity: 0.3; }
  }
  .sd-trace-fb {
    stroke: var(--accent); stroke-dasharray: 6 6; opacity: 0.35;
    animation: sd-tr-fb 20s linear infinite;
    filter: drop-shadow(0 0 4px rgba(217,59,43,0.35));
  }
  @keyframes sd-tr-fb {
    0%, 64.99% { stroke-dashoffset: 0; opacity: 0.1; }
    65%        { stroke-dashoffset: 0; opacity: 0.5; }
    97.5%      { stroke-dashoffset: -1200; opacity: 0.5; }
    100%       { stroke-dashoffset: -1200; opacity: 0.1; }
  }
  @keyframes sd-blink {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.35; }
  }
  @keyframes sd-halo-pulse {
    0%   { opacity: 0; transform: scale(0.6); }
    1.5% { opacity: 1; transform: scale(1); }
    7%   { opacity: 0; transform: scale(2.2); }
    100% { opacity: 0; transform: scale(0.6); }
  }
  @keyframes sd-dot-pulse {
    0%   { opacity: 0.8; }
    1.5% { opacity: 1; filter: drop-shadow(0 0 6px rgba(255,233,229,0.9)); }
    9%   { opacity: 0.8; filter: none; }
    100% { opacity: 0.8; filter: none; }
  }
  @keyframes sd-num-flash {
    0%,9%,100% { fill: inherit; }
    1.5%       { fill: var(--accent); }
  }
`;

const reducedMotionStyles = `
  .sd-lane-header { font-family: var(--mono); font-size: 10px; letter-spacing: 0.3em; fill: var(--muted-ink); font-weight: 500; }
  .sd-lane-screen  { fill: #A8C9BA; }
  .sd-lane-stage   { fill: #D9A391; }
  .sd-path-base   { stroke: #262626; stroke-width: 1; fill: none; }
  .sd-path-dashed { stroke-dasharray: 3 5; stroke: #242424; }
  .sd-trace { stroke: var(--accent); stroke-width: 1.3; fill: none; opacity: 0.6; stroke-dasharray: 0; }
  .sd-trace-spine, .sd-trace-lane, .sd-trace-rec, .sd-trace-fb { animation: none; }
`;
