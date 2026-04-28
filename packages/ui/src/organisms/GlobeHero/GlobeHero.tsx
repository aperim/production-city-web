"use client";

import { useEffect, useRef } from "react";
import type { GlobeInstance } from "./globe-core";
import "./globe-hero.css";

export interface GlobeHeroLabels {
  "australia-sydney": string;
  "asia-pacific-singapore": string;
  "europe-switzerland": string;
  "africa-cape-town": string;
  "north-america-toronto": string;
  "north-america-los-angeles": string;
  oceania: string;
}

export interface GlobeHeroProps {
  labels?: Partial<GlobeHeroLabels>;
  className?: string;
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

export function GlobeHero({ labels = {}, className }: GlobeHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<GlobeInstance | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasWebGL()) return;

    let cancelled = false;
    let api: GlobeInstance | null = null;

    import("./globe-core").then(({ createProductionCityGlobe }) => {
      if (cancelled) return;
      api = createProductionCityGlobe(container, { labels });
      apiRef.current = api;
    });

    return () => {
      cancelled = true;
      api?.dispose();
      apiRef.current = null;
    };
    // labels excluded — handled by the second effect
  }, []);

  useEffect(() => {
    apiRef.current?.updateLabels(labels as Record<string, string>);
  }, [labels]);

  return (
    <div
      ref={containerRef}
      data-pc-globe=""
      className={`pc-globe-embed${className ? ` ${className}` : ""}`}
      role="presentation"
      aria-hidden="true"
    >
      <canvas className="pc-globe-canvas" />
      <div className="pc-globe-labels" />
    </div>
  );
}
