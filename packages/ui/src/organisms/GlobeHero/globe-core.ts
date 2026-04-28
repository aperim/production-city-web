import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import countryGeoJson from "./assets/ne_110m_admin_0_countries.min.json";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Region {
  id: string;
  color: string;
}

interface RouteStop {
  id: string;
  regionId: string;
  label: string;
  lat: number;
  lon: number;
  labelOffset: [number, number];
}

interface RouteSegment {
  id: string;
  from: string;
  to: string;
}

interface RoutePhase {
  activeSiteIds: string[];
  routeIds: string[];
}

interface Route {
  id: string;
  line: THREE.Mesh;
  glow: THREE.Mesh;
  trace: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
}

interface SiteMarker {
  group: THREE.Group;
  core: THREE.Mesh;
  halo: THREE.Mesh;
  region: Region;
  site: RouteStop;
  phase: number;
}

export interface GlobeInstance {
  dispose(): void;
  updateLabels(labels: Record<string, string>): void;
}

export interface GlobeOptions {
  labels?: Record<string, string>;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const REGIONS: Region[] = [
  { id: "australia", color: "#e8a53f" },
  { id: "asia-pacific", color: "#d9a391" },
  { id: "europe", color: "#a8c9ba" },
  { id: "africa", color: "#e8a53f" },
  { id: "north-america", color: "#d9a391" },
];

const ROUTE_STOPS: RouteStop[] = [
  { id: "australia-sydney", regionId: "australia", label: "AUSTRALIA", lat: -33.8688, lon: 151.2093, labelOffset: [18, 28] },
  { id: "asia-pacific-singapore", regionId: "asia-pacific", label: "ASIA PACIFIC", lat: 1.3521, lon: 103.8198, labelOffset: [14, -26] },
  { id: "europe-switzerland", regionId: "europe", label: "EUROPE", lat: 46.8182, lon: 8.2275, labelOffset: [10, -28] },
  { id: "africa-cape-town", regionId: "africa", label: "AFRICA", lat: -33.9249, lon: 18.4241, labelOffset: [16, 20] },
  { id: "north-america-toronto", regionId: "north-america", label: "N. AMERICA", lat: 43.6532, lon: -79.3832, labelOffset: [-24, -28] },
  { id: "north-america-los-angeles", regionId: "north-america", label: "N. AMERICA", lat: 34.0522, lon: -118.2437, labelOffset: [-20, 24] },
  { id: "oceania", regionId: "asia-pacific", label: "OCEANIA", lat: 21.3069, lon: -157.8583, labelOffset: [-22, 20] },
];

const ROUTE_SEGMENTS: RouteSegment[] = [
  { id: "australia-to-asia-pacific", from: "australia-sydney", to: "asia-pacific-singapore" },
  { id: "asia-pacific-to-europe", from: "asia-pacific-singapore", to: "europe-switzerland" },
  { id: "asia-pacific-to-africa", from: "asia-pacific-singapore", to: "africa-cape-town" },
  { id: "europe-to-toronto", from: "europe-switzerland", to: "north-america-toronto" },
  { id: "africa-to-toronto", from: "africa-cape-town", to: "north-america-toronto" },
  { id: "toronto-to-los-angeles", from: "north-america-toronto", to: "north-america-los-angeles" },
  { id: "los-angeles-to-oceania", from: "north-america-los-angeles", to: "oceania" },
  { id: "oceania-to-australia", from: "oceania", to: "australia-sydney" },
];

const ROUTE_PHASES: RoutePhase[] = [
  { activeSiteIds: ["australia-sydney"], routeIds: ["australia-to-asia-pacific"] },
  { activeSiteIds: ["asia-pacific-singapore"], routeIds: ["asia-pacific-to-europe", "asia-pacific-to-africa"] },
  { activeSiteIds: ["europe-switzerland", "africa-cape-town"], routeIds: ["europe-to-toronto", "africa-to-toronto"] },
  { activeSiteIds: ["north-america-toronto"], routeIds: ["toronto-to-los-angeles"] },
  { activeSiteIds: ["north-america-los-angeles"], routeIds: ["los-angeles-to-oceania"] },
  { activeSiteIds: ["oceania"], routeIds: ["oceania-to-australia"] },
];

const ROUTE_SECONDS = 4;
const MAX_ACTIVE_ROUTES = Math.max(...ROUTE_PHASES.map((p) => p.routeIds.length));

const REGION_BY_ID = new Map<string, Region>(REGIONS.map((r) => [r.id, r]));
const SITE_BY_ID = new Map<string, RouteStop>(ROUTE_STOPS.map((s) => [s.id, s]));

// ─── Country feature index ────────────────────────────────────────────────────

interface GeoFeature {
  geometry: {
    type: string;
    coordinates: unknown[][];
  };
  properties: {
    admin?: string;
    continent?: string;
  };
}

interface FeatureIndex {
  bySite: Map<string, GeoFeature[]>;
  networkSet: Set<GeoFeature>;
}

function createSiteFeatureIndex(): FeatureIndex {
  const bySite = new Map<string, GeoFeature[]>(REGIONS.map((r) => [r.id, []]));
  const networkSet = new Set<GeoFeature>();

  (countryGeoJson.features as GeoFeature[]).forEach((feature) => {
    REGIONS.forEach((region) => {
      if (!isActiveFeature(feature, region.id)) return;
      bySite.get(region.id)?.push(feature);
      networkSet.add(feature);
    });
  });

  return { bySite, networkSet };
}

const SITE_FEATURE_INDEX = createSiteFeatureIndex();

// ─── Main entry point ─────────────────────────────────────────────────────────

export function createProductionCityGlobe(
  container: HTMLElement,
  options: GlobeOptions = {}
): GlobeInstance {
  let currentLabels: Record<string, string> = options.labels ?? {};

  const canvas = container.querySelector<HTMLCanvasElement>(".pc-globe-canvas");
  const labelLayer = container.querySelector<HTMLElement>(".pc-globe-labels");
  if (!canvas || !labelLayer) {
    return { dispose: () => undefined, updateLabels: () => undefined };
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0a0a0a");

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  camera.position.set(0, 0, 4.65);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: shouldPreserveDrawingBuffer(),
  });
  renderer.setPixelRatio(getPixelRatio());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 2.85;
  controls.maxDistance = 7.2;
  controls.rotateSpeed = 0.46;
  controls.zoomSpeed = 0.68;

  const sunDirection = new THREE.Vector3(-0.42, 0.18, 0.89).normalize();
  const solarTarget = new THREE.Vector3();
  const solarOffsetAxis = new THREE.Vector3(0, 1, 0);
  const key = new THREE.DirectionalLight("#fff1e5", 3.8);
  key.position.copy(sunDirection).multiplyScalar(6);
  scene.add(key);
  scene.add(new THREE.AmbientLight("#a7a39a", 1.05));

  const rim = new THREE.DirectionalLight("#d93b2b", 1.65);
  rim.position.copy(sunDirection).multiplyScalar(-4);
  scene.add(rim);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);
  globeGroup.rotation.y = THREE.MathUtils.degToRad(-110);

  let activePhaseIndex = 0;
  let activePhase: RoutePhase = ROUTE_PHASES[0]!;
  let activeSiteIds = new Set<string>(activePhase.activeSiteIds);
  let activeTextureKey = getPhaseTextureKey(activePhase);
  let activeRoutes: Route[] = [];
  let activeRouteSet = new Set<Route>();
  const globeTextures = createGlobeTextureCache();

  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1, 128, 64),
    new THREE.MeshStandardMaterial({
      map: globeTextures.get(activeTextureKey),
      roughness: 0.82,
      metalness: 0.03,
      emissive: new THREE.Color("#090807"),
      emissiveIntensity: 0.16,
    })
  );
  globeGroup.add(globe);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.035, 128, 64),
    new THREE.MeshBasicMaterial({
      color: "#d93b2b",
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  globeGroup.add(atmosphere);

  const dayNightOverlay = createDayNightOverlay(sunDirection);
  globeGroup.add(dayNightOverlay);
  globeGroup.add(createGlobeGrid());

  const routeGroup = new THREE.Group();
  const markerGroup = new THREE.Group();
  globeGroup.add(routeGroup, markerGroup);

  const routes = createRoutes(routeGroup);
  const routeById = new Map<string, Route>(routes.map((r) => [r.id, r]));
  activeRoutes = getPhaseRoutes(routeById, activePhase);
  activeRouteSet = new Set(activeRoutes);

  const packets = Array.from({ length: MAX_ACTIVE_ROUTES }, () => createPacket());
  packets.forEach((p) => routeGroup.add(p));

  const markerObjects = new Map<string, SiteMarker>();
  const labelObjects = new Map<string, HTMLSpanElement>();

  ROUTE_STOPS.forEach((site) => {
    const marker = createSiteMarker(site);
    markerGroup.add(marker.group);
    markerObjects.set(site.id, marker);

    const label = document.createElement("span");
    label.className = "pc-globe-label";
    label.textContent = currentLabels[site.id] ?? site.label;
    label.style.setProperty("--site-color", marker.region.color);
    labelLayer.appendChild(label);
    labelObjects.set(site.id, label);
  });

  let userInterrupted = false;
  let lastActivePhaseIndex = -1;
  let startTime: number | null = null;

  const markerSunNormal = new THREE.Vector3();
  const labelWorldPosition = new THREE.Vector3();
  const labelSurfaceNormal = new THREE.Vector3();
  const labelToCamera = new THREE.Vector3();
  const labelScreenPosition = new THREE.Vector3();
  const labelOutward = new THREE.Vector2();

  renderer.domElement.addEventListener("pointerdown", stopAutoRotate);
  renderer.domElement.addEventListener("wheel", stopAutoRotate, { passive: true });
  controls.addEventListener("start", stopAutoRotate);
  window.addEventListener("resize", resize);

  resize();
  renderer.setAnimationLoop(render);

  function render(time: number = 0) {
    startTime ??= time;
    const elapsed = time / 1000;
    const intro = prefersReducedMotion ? 1 : easeOutCubic(Math.min(1, (time - startTime) / 1700));
    globeGroup.scale.setScalar(0.94 + intro * 0.06);
    controls.update();

    updateActivePhase(elapsed);
    const focusPoint = animateRoutes(elapsed);
    followPoint(focusPoint);
    updateDayNight(elapsed, focusPoint, intro);
    animateMarkers(elapsed);
    updateLabelPositions();
    (atmosphere.material as THREE.MeshBasicMaterial).opacity =
      (0.055 + (0.5 + Math.sin(elapsed * 2.2) * 0.5) * 0.028) * intro;
    renderer.render(scene, camera);
  }

  function updateActivePhase(elapsed: number) {
    activePhaseIndex =
      Math.floor((elapsed % (ROUTE_PHASES.length * ROUTE_SECONDS)) / ROUTE_SECONDS) %
      ROUTE_PHASES.length;
    if (activePhaseIndex === lastActivePhaseIndex) return;
    lastActivePhaseIndex = activePhaseIndex;
    activePhase = ROUTE_PHASES[activePhaseIndex]!;
    activeSiteIds = new Set(activePhase.activeSiteIds);
    activeTextureKey = getPhaseTextureKey(activePhase);
    activeRoutes = getPhaseRoutes(routeById, activePhase);
    activeRouteSet = new Set(activeRoutes);

    const globeMat = globe.material as THREE.MeshStandardMaterial;
    globeMat.map = globeTextures.get(activeTextureKey) ?? null;
    globeMat.needsUpdate = true;

    routes.forEach((route) => {
      const isActive = activeRouteSet.has(route);
      (route.line.material as THREE.MeshBasicMaterial).color.set(isActive ? "#d93b2b" : "#6c6a62");
      (route.line.material as THREE.MeshBasicMaterial).opacity = isActive ? 0.32 : 0.1;
      (route.glow.material as THREE.MeshBasicMaterial).opacity = isActive ? 0.16 : 0.035;
      (route.trace.material as THREE.MeshBasicMaterial).opacity = isActive ? 0.92 : 0;
    });

    markerObjects.forEach((marker, siteId) => {
      const isActive = activeSiteIds.has(siteId);
      const coreMat = marker.core.material as THREE.MeshStandardMaterial;
      const haloMat = marker.halo.material as THREE.MeshBasicMaterial;
      coreMat.color.set(isActive ? "#d93b2b" : marker.region.color);
      coreMat.emissive.set(isActive ? "#d93b2b" : marker.region.color);
      haloMat.color.set(isActive ? "#d93b2b" : marker.region.color);
      haloMat.opacity = isActive ? 0.55 : 0.24;
    });

    labelObjects.forEach((label, siteId) => {
      label.classList.toggle("is-active", activeSiteIds.has(siteId));
    });
  }

  function animateRoutes(elapsed: number): THREE.Vector3 | null {
    routes.forEach((route) => {
      (route.line.material as THREE.MeshBasicMaterial & { dashOffset: number }).dashOffset =
        -elapsed * (activeRouteSet.has(route) ? 0.12 : 0.035);
      (route.trace.material as THREE.MeshBasicMaterial & { dashOffset: number }).dashOffset = -elapsed * 0.76;
    });

    const t = (elapsed % ROUTE_SECONDS) / ROUTE_SECONDS;
    const focusPoint = new THREE.Vector3();
    let focusCount = 0;

    packets.forEach((packet, index) => {
      const route = activeRoutes[index];
      if (!route) {
        packet.visible = false;
        return;
      }
      packet.visible = true;
      packet.position.copy(route.curve.getPointAt(t));
      (packet.material as THREE.MeshBasicMaterial).opacity =
        0.72 + Math.sin(elapsed * 8 + index * 0.7) * 0.18;
      focusPoint.add(packet.position);
      focusCount += 1;
    });

    return focusCount > 0 ? focusPoint.multiplyScalar(1 / focusCount) : null;
  }

  function followPoint(localPoint: THREE.Vector3 | null) {
    if (!localPoint || prefersReducedMotion || userInterrupted) return;
    const targetQuaternion = getNorthUpFocusQuaternion(localPoint);
    globeGroup.quaternion.slerp(targetQuaternion, 0.14);
  }

  function updateDayNight(elapsed: number, focusPoint: THREE.Vector3 | null, intro: number) {
    if (focusPoint) {
      solarTarget
        .copy(focusPoint)
        .normalize()
        .applyQuaternion(globeGroup.quaternion)
        .applyAxisAngle(solarOffsetAxis, -1.1 + Math.sin(elapsed * 0.18) * 0.18)
        .normalize();
    } else {
      solarTarget.set(-0.42, 0.18, 0.89).normalize();
    }

    sunDirection.lerp(solarTarget, prefersReducedMotion ? 1 : 0.075).normalize();
    key.position.copy(sunDirection).multiplyScalar(6);
    rim.position.copy(sunDirection).multiplyScalar(-4);

    const overlayMat = dayNightOverlay.material as THREE.ShaderMaterial;
    overlayMat.uniforms["sunDirection"]!.value.copy(sunDirection);
    overlayMat.uniforms["intensity"]!.value = intro;
  }

  function animateMarkers(elapsed: number) {
    markerObjects.forEach((marker, siteId) => {
      const isActive = activeSiteIds.has(siteId);
      const daylight = getMarkerDaylight(marker);
      const nightLift = 1 - THREE.MathUtils.smoothstep(daylight, -0.35, 0.3);
      const scale = isActive
        ? 1.24 + Math.sin(elapsed * 3.2) * 0.06
        : 1 + Math.sin(elapsed * 2 + marker.phase) * 0.025;
      marker.group.scale.setScalar(scale);
      marker.halo.rotation.z += isActive ? 0.018 : 0.006;
      const coreMat = marker.core.material as THREE.MeshStandardMaterial;
      const haloMat = marker.halo.material as THREE.MeshBasicMaterial;
      coreMat.emissiveIntensity = (isActive ? 1.9 : 1.18) + nightLift * 0.42;
      haloMat.opacity = isActive ? 0.42 + nightLift * 0.2 : 0.15 + nightLift * 0.18;
    });
  }

  function updateLabelPositions() {
    const bounds = container.getBoundingClientRect();
    const width = bounds.width || 1;
    const height = bounds.height || 1;

    markerObjects.forEach((marker, siteId) => {
      const label = labelObjects.get(siteId);
      if (!label) return;

      const worldPosition = marker.group.getWorldPosition(labelWorldPosition);
      const surfaceNormal = labelSurfaceNormal.copy(worldPosition).normalize();
      const toCamera = labelToCamera.copy(camera.position).sub(worldPosition).normalize();
      const visible = surfaceNormal.dot(toCamera) > -0.04;
      const screen = labelScreenPosition.copy(worldPosition).project(camera);
      const daylight = getMarkerDaylight(marker);
      const isActive = activeSiteIds.has(siteId);

      const baseX = (screen.x * 0.5 + 0.5) * width;
      const baseY = (-screen.y * 0.5 + 0.5) * height;
      const outward = labelOutward.set(baseX - width / 2, baseY - height / 2);
      if (outward.lengthSq() < 1) outward.set(1, 0);
      outward.normalize();

      const labelPush = activeSiteIds.has(siteId) ? 34 : 22;
      const [biasX, biasY] = marker.site.labelOffset;
      const x = baseX + outward.x * labelPush + biasX;
      const y = baseY + outward.y * labelPush + biasY;
      const labelHalfWidth = label.offsetWidth / 2 + 8;
      const labelHalfHeight = label.offsetHeight / 2 + 8;
      const safeX = THREE.MathUtils.clamp(x, labelHalfWidth, width - labelHalfWidth);
      const safeY = THREE.MathUtils.clamp(y, labelHalfHeight, height - labelHalfHeight);

      label.classList.toggle("is-sunlit", daylight > 0.18);
      label.classList.toggle("is-night", daylight < -0.18);
      label.style.transform = `translate(${safeX}px, ${safeY}px) translate(-50%, -50%)`;
      label.style.opacity = visible ? (daylight < -0.28 && !isActive ? "0.68" : "1") : "0";
    });
  }

  function getMarkerDaylight(marker: SiteMarker): number {
    return markerSunNormal
      .copy(marker.group.position)
      .normalize()
      .applyQuaternion(globeGroup.quaternion)
      .dot(sunDirection);
  }

  function stopAutoRotate() {
    userInterrupted = true;
  }

  function resize() {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    renderer.setPixelRatio(getPixelRatio());
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 760 ? 44 : 38;
    camera.position.z = width < 760 ? 5.65 : 4.65;
    camera.updateProjectionMatrix();
    updateLabelPositions();
  }

  function dispose() {
    renderer.setAnimationLoop(null);
    window.removeEventListener("resize", resize);
    renderer.domElement.removeEventListener("pointerdown", stopAutoRotate);
    renderer.domElement.removeEventListener("wheel", stopAutoRotate);
    globeTextures.forEach((texture) => texture.dispose());
    controls.dispose();
    renderer.dispose();
    labelLayer!.innerHTML = "";
  }

  function updateLabels(newLabels: Record<string, string>) {
    currentLabels = newLabels;
    labelObjects.forEach((label, siteId) => {
      const stop = SITE_BY_ID.get(siteId);
      if (!stop) return;
      label.textContent = currentLabels[siteId] ?? stop.label;
    });
  }

  return { dispose, updateLabels };
}

// ─── Texture helpers ──────────────────────────────────────────────────────────

function createGlobeTextureCache(): Map<string, THREE.Texture> {
  const textureKeys = new Set<string>(REGIONS.map((r) => r.id));
  ROUTE_PHASES.forEach((phase) => textureKeys.add(getPhaseTextureKey(phase)));
  return new Map([...textureKeys].map((key) => [key, createGlobeTexture(key.split("+"))]));
}

function createGlobeTexture(activeIds: string[]): THREE.Texture {
  const { width, height } = getTextureSize();
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, width, height);

  const oceanGlow = ctx.createRadialGradient(1024, 470, 40, 1024, 470, 760);
  oceanGlow.addColorStop(0, "rgba(217,59,43,0.055)");
  oceanGlow.addColorStop(0.56, "rgba(20,20,20,0.18)");
  oceanGlow.addColorStop(1, "rgba(10,10,10,0)");
  ctx.fillStyle = oceanGlow;
  ctx.fillRect(0, 0, width, height);

  drawTextureGraticule(ctx, width, height);
  drawCountryLayer(ctx, width, height, activeIds);
  drawTextureGrain(ctx, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

interface DrawStyle {
  fill: string;
  stroke: string;
  lineWidth: number;
}

function drawCountryLayer(ctx: CanvasRenderingContext2D, width: number, height: number, activeIds: string[]) {
  (countryGeoJson.features as GeoFeature[]).forEach((feature) => {
    const isNetwork = SITE_FEATURE_INDEX.networkSet.has(feature);
    drawGeoJsonFeature(ctx, feature, width, height, {
      fill: isNetwork ? "rgba(232,165,63,0.14)" : "rgba(247,245,240,0.075)",
      stroke: isNetwork ? "rgba(232,165,63,0.34)" : "rgba(156,154,146,0.18)",
      lineWidth: 1.15,
    });
  });

  activeIds.forEach((activeId) => {
    SITE_FEATURE_INDEX.bySite.get(activeId)?.forEach((feature) => {
      drawGeoJsonFeature(ctx, feature, width, height, {
        fill: "rgba(217,59,43,0.38)",
        stroke: "rgba(255,233,229,0.84)",
        lineWidth: 3,
      });
    });
  });
}

function drawGeoJsonFeature(ctx: CanvasRenderingContext2D, feature: GeoFeature, width: number, height: number, style: DrawStyle) {
  ctx.fillStyle = style.fill;
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = style.lineWidth;
  ctx.beginPath();
  getFeaturePolygons(feature).forEach((polygon) => {
    [-360, 0, 360].forEach((copyOffset) => {
      (polygon as number[][][]).forEach((ring) => {
        drawTextureRing(ctx, ring, width, height, copyOffset);
      });
    });
  });
  ctx.fill("evenodd");
  ctx.stroke();
}

function drawTextureRing(ctx: CanvasRenderingContext2D, ring: number[][], width: number, height: number, copyOffset: number) {
  unwrapRing(ring).forEach(([lon, lat], index) => {
    const [x, y] = projectToTexture((lon ?? 0) + copyOffset, lat ?? 0, width, height);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
}

function unwrapRing(ring: number[][]): number[][] {
  let offset = 0;
  let previous = ring[0]?.[0] ?? 0;
  return ring.map(([lon, lat], index) => {
    if (index > 0 && lon !== undefined) {
      let candidate = lon + offset;
      while (candidate - previous > 180) { offset -= 360; candidate = lon + offset; }
      while (previous - candidate > 180) { offset += 360; candidate = lon + offset; }
    }
    const adjusted = (lon ?? 0) + offset;
    previous = adjusted;
    return [adjusted, lat ?? 0];
  });
}

function getFeaturePolygons(feature: GeoFeature): unknown[][][] {
  if (feature.geometry?.type === "Polygon") return [feature.geometry.coordinates as unknown[][][]];
  if (feature.geometry?.type === "MultiPolygon") return feature.geometry.coordinates as unknown[][][];
  return [];
}

function isActiveFeature(feature: GeoFeature, activeId: string): boolean {
  const { admin, continent } = feature.properties;
  if (activeId === "australia") return admin === "Australia";
  if (activeId === "asia-pacific") return continent === "Asia" || (continent === "Oceania" && admin !== "Australia");
  if (activeId === "north-america") return continent === "North America";
  return continent?.toLowerCase() === activeId;
}

function drawTextureGraticule(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = "rgba(156,154,146,0.13)";
  ctx.lineWidth = 1;
  for (let lon = -150; lon <= 150; lon += 30) {
    const [x] = projectToTexture(lon, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const [, y] = projectToTexture(0, lat, width, height);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawTextureGrain(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.globalAlpha = 0.09;
  for (let i = 0; i < 2200; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#f7f5f0" : "#d93b2b";
    ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function projectToTexture(lon: number, lat: number, width: number, height: number): [number, number] {
  return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
}

// ─── Three.js helpers ─────────────────────────────────────────────────────────

function createGlobeGrid(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: "#6c6a62", transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let lat = -60; lat <= 60; lat += 30) group.add(new THREE.Line(createLatGeometry(lat, 1.006), material));
  for (let lon = -150; lon <= 180; lon += 30) group.add(new THREE.Line(createLonGeometry(lon, 1.007), material));
  return group;
}

function createDayNightOverlay(sunDirection: THREE.Vector3): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.SphereGeometry(1.002, 128, 64),
    new THREE.ShaderMaterial({
      uniforms: {
        sunDirection: { value: sunDirection.clone() },
        nightColor: { value: new THREE.Color("#01030a") },
        twilightColor: { value: new THREE.Color("#d93b2b") },
        daylightColor: { value: new THREE.Color("#f0c879") },
        intensity: { value: 1 },
      },
      vertexShader: `varying vec3 vWorldNormal;void main(){vWorldNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `uniform vec3 sunDirection,nightColor,twilightColor,daylightColor;uniform float intensity;varying vec3 vWorldNormal;void main(){float d=dot(normalize(vWorldNormal),normalize(sunDirection));float night=smoothstep(0.18,-0.38,d);float day=smoothstep(-0.04,0.58,d);float tc=1.0-smoothstep(0.0,0.075,abs(d));float tw=1.0-smoothstep(0.0,0.24,abs(d));vec3 c=mix(nightColor,daylightColor,day*0.22);c=mix(c,twilightColor,tw*0.62);float a=clamp(night*0.7+day*0.055+tw*0.14+tc*0.36,0.0,0.84);gl_FragColor=vec4(c,a*intensity);}`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide,
    })
  );
}

function createRoutes(group: THREE.Group): Route[] {
  return ROUTE_SEGMENTS.map((segment) => {
    const from = SITE_BY_ID.get(segment.from)!;
    const to = SITE_BY_ID.get(segment.to)!;
    const curve = createGreatCircleCurve(from, to);
    const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, 0.0018, 4, false), new THREE.MeshBasicMaterial({ color: "#6c6a62", transparent: true, opacity: 0.1 }));
    const glow = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, 0.006, 4, false), new THREE.MeshBasicMaterial({ color: "#d93b2b", transparent: true, opacity: 0.035, blending: THREE.AdditiveBlending, depthWrite: false }));
    const trace = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, 0.0038, 4, false), new THREE.MeshBasicMaterial({ color: "#ff8c7a", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    group.add(line, glow, trace);
    return { id: segment.id, line, glow, trace, curve };
  });
}

function createGreatCircleCurve(from: RouteStop, to: RouteStop): THREE.CatmullRomCurve3 {
  const fromPos = latLonToVector3(from.lat, from.lon, 1.0);
  const toPos = latLonToVector3(to.lat, to.lon, 1.0);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const pos = new THREE.Vector3().lerpVectors(fromPos, toPos, t).normalize();
    points.push(pos.multiplyScalar(1 + 0.18 * Math.sin(Math.PI * t)));
  }
  return new THREE.CatmullRomCurve3(points);
}

function createPacket(): THREE.Mesh {
  return new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), new THREE.MeshBasicMaterial({ color: "#ff8c7a", transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
}

function createSiteMarker(site: RouteStop): SiteMarker {
  const region = REGION_BY_ID.get(site.regionId)!;
  const pos = latLonToVector3(site.lat, site.lon, 1.012);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), new THREE.MeshStandardMaterial({ color: region.color, emissive: new THREE.Color(region.color), emissiveIntensity: 1.18, roughness: 0.2, metalness: 0.6 }));
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.022, 0.034, 32), new THREE.MeshBasicMaterial({ color: region.color, transparent: true, opacity: 0.24, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  const group = new THREE.Group();
  group.position.copy(pos);
  group.lookAt(0, 0, 0);
  group.add(core, halo);
  return { group, core, halo, region, site, phase: Math.random() * Math.PI * 2 };
}

function getPhaseRoutes(routeById: Map<string, Route>, phase: RoutePhase): Route[] {
  return phase.routeIds.map((id) => routeById.get(id)).filter((r): r is Route => r !== undefined);
}

function getPhaseTextureKey(phase: RoutePhase): string {
  const ids = new Set(phase.activeSiteIds.flatMap((id) => { const s = SITE_BY_ID.get(id); return s ? [s.regionId] : []; }));
  return [...ids].sort().join("+");
}

function getNorthUpFocusQuaternion(localPoint: THREE.Vector3): THREE.Quaternion {
  const dir = localPoint.clone().normalize().negate();
  const mat = new THREE.Matrix4().lookAt(dir, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
  return new THREE.Quaternion().setFromRotationMatrix(mat);
}

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

function createLatGeometry(lat: number, radius: number): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = [];
  for (let lon = 0; lon <= 360; lon += 3) pts.push(latLonToVector3(lat, lon - 180, radius));
  return new THREE.BufferGeometry().setFromPoints(pts);
}

function createLonGeometry(lon: number, radius: number): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = [];
  for (let lat = -90; lat <= 90; lat += 3) pts.push(latLonToVector3(lat, lon, radius));
  return new THREE.BufferGeometry().setFromPoints(pts);
}

function getTextureSize(): { width: number; height: number } {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  return dpr >= 2 ? { width: 2048, height: 1024 } : { width: 1024, height: 512 };
}

function getPixelRatio(): number {
  return typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1;
}

function shouldPreserveDrawingBuffer(): boolean {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("capture") === "1";
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
