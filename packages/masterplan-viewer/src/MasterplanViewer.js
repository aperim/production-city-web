import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import './styles/viewer.css';
import {
  accessPoints,
  accessRouteLegend,
  accessRoutes,
  campusNotes,
  facilities,
  publicRealmDesign,
  siteFeatures,
  sitePlan
} from './masterplanData.js';

export { campusNotes, facilities, accessRouteLegend, sitePlan };

export function createMasterplanViewer(container, options = {}) {
  const opts = {
    mode: options.mode ?? 'standalone',
    initialView: options.initialView ?? 'overview',
    autoRotate: options.autoRotate ?? false,
    autoRotateSpeed: options.autoRotateSpeed ?? 0.28,
    pauseAutoRotateOnInteraction: options.pauseAutoRotateOnInteraction !== false,
    showLabels: options.showLabels !== false,
    showRoutes: options.showRoutes ?? false,
    enablePan: options.enablePan !== false,
    enableZoom: options.enableZoom !== false,
    enableRotate: options.enableRotate !== false,
    minDistance: options.minDistance ?? 65,
    maxDistance: options.maxDistance ?? 520,
    quality: options.quality ?? 'balanced',
    onFacilitySelect: options.onFacilitySelect ?? null,
    onFacilityHover: options.onFacilityHover ?? null,
  };

  const canvas = document.createElement('canvas');
  const labelRoot = document.createElement('div');
  labelRoot.className = 'masterplan-labels';
  container.classList.add('production-city-viewer');
  container.appendChild(canvas);
  container.appendChild(labelRoot);

  const initWidth = container.clientWidth || window.innerWidth;
  const initHeight = container.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  scene.background = createSkyGradientTexture();
  scene.fog = new THREE.Fog('#dde8e6', 240, 720);

  const camera = new THREE.PerspectiveCamera(44, initWidth / initHeight, 0.1, 1200);
  camera.position.set(220, 190, 235);

  const pixelRatioCap = opts.quality === 'lite' ? 1.25 : 2;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
  renderer.setSize(initWidth, initHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const labelRenderer = new CSS2DRenderer({ element: labelRoot });
  labelRenderer.setSize(initWidth, initHeight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxDistance = opts.maxDistance;
  controls.minDistance = opts.minDistance;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.enablePan = opts.enablePan;
  controls.enableZoom = opts.enableZoom;
  controls.enableRotate = opts.enableRotate;
  controls.target.set(0, 4, 0);
  controls.autoRotate = opts.autoRotate;
  controls.autoRotateSpeed = opts.autoRotateSpeed;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const accessOverlayGroup = new THREE.Group();
  const atmosphereGroup = new THREE.Group();
  const facilityMeshes = new Map();
  const facilityById = new Map(facilities.map((facility) => [facility.id, facility]));
  const animatedAtmosphere = [];
  let hoveredId = null;
  let selectedId = null;
  let currentView = opts.initialView;
  let routesVisible = opts.showRoutes;

  atmosphereGroup.name = 'Storytelling Atmosphere';
  accessOverlayGroup.name = 'Access Routes Overlay';
  accessOverlayGroup.visible = routesVisible;
  scene.add(atmosphereGroup);
  scene.add(accessOverlayGroup);

const sharedMaterials = {
  asphalt: new THREE.MeshStandardMaterial({ color: '#2f3333', roughness: 0.88, metalness: 0.02, map: createNoiseTexture('#303636', '#252b2b', 0.38) }),
  publicRoad: new THREE.MeshStandardMaterial({ color: '#444947', roughness: 0.86, metalness: 0.02, map: createNoiseTexture('#484e4b', '#343a38', 0.28) }),
  serviceRoad: new THREE.MeshStandardMaterial({ color: '#262b2b', roughness: 0.9, metalness: 0.02, map: createNoiseTexture('#2d3333', '#202626', 0.34) }),
  apron: new THREE.MeshStandardMaterial({ color: '#3a3e3d', roughness: 0.84, metalness: 0.02, map: createNoiseTexture('#3d4341', '#303635', 0.3) }),
  concrete: new THREE.MeshStandardMaterial({ color: '#c8c4ba', roughness: 0.92, metalness: 0.02, map: createNoiseTexture('#cbc7bd', '#b9b4aa', 0.22) }),
  paver: new THREE.MeshStandardMaterial({ color: '#d0c8ba', roughness: 0.9, map: createNoiseTexture('#d4ccbe', '#bfb6a9', 0.18) }),
  lawn: new THREE.MeshStandardMaterial({ color: '#5d9b56', roughness: 0.95, map: createNoiseTexture('#6ca35f', '#4f854b', 0.28) }),
  fence: new THREE.MeshStandardMaterial({ color: '#9f4c32', roughness: 0.72 }),
  gate: new THREE.MeshStandardMaterial({ color: '#d66638', roughness: 0.62 }),
  water: new THREE.MeshStandardMaterial({ color: '#3d7480', roughness: 0.34, metalness: 0.08 }),
  roof: new THREE.MeshStandardMaterial({ color: '#ddd9d0', roughness: 0.86, metalness: 0.02, map: createNoiseTexture('#e2ded5', '#cbc6bd', 0.18) }),
  glass: new THREE.MeshStandardMaterial({ color: '#283638', roughness: 0.22, metalness: 0.05 }),
  bronze: new THREE.MeshStandardMaterial({ color: '#9b6b4e', roughness: 0.54, metalness: 0.12 }),
  timber: new THREE.MeshStandardMaterial({ color: '#8c735a', roughness: 0.7, metalness: 0.02 }),
  publicStone: new THREE.MeshStandardMaterial({ color: '#d8d1c5', roughness: 0.86, metalness: 0.01, map: createNoiseTexture('#ddd6cb', '#c7beb2', 0.16) }),
  civicRoof: new THREE.MeshStandardMaterial({ color: '#cec6bb', roughness: 0.8, metalness: 0.03, map: createNoiseTexture('#d8d0c5', '#b9b0a5', 0.13) }),
  shadeFabric: new THREE.MeshStandardMaterial({ color: '#efe8d7', roughness: 0.72, metalness: 0.01 }),
  landscape: new THREE.MeshStandardMaterial({ color: '#628f57', roughness: 0.94, map: createNoiseTexture('#6f9a62', '#557a4e', 0.24) }),
  darkMetal: new THREE.MeshStandardMaterial({ color: '#2d3231', roughness: 0.58, metalness: 0.12 }),
  acousticPanel: new THREE.MeshStandardMaterial({ color: '#d7d8d4', roughness: 0.7, metalness: 0.04, map: createNoiseTexture('#e2e1db', '#c6c8c4', 0.1) }),
  serviceSteel: new THREE.MeshStandardMaterial({ color: '#59615f', roughness: 0.62, metalness: 0.16 }),
  zinc: new THREE.MeshStandardMaterial({ color: '#b9beb9', roughness: 0.66, metalness: 0.12, map: createNoiseTexture('#c2c7c1', '#9fa6a0', 0.12) }),
  safetyYellow: new THREE.MeshStandardMaterial({ color: '#d6a238', roughness: 0.66, metalness: 0.03 }),
  shadowGap: new THREE.MeshBasicMaterial({ color: '#17201e', transparent: true, opacity: 0.18, depthWrite: false }),
  contactShadow: new THREE.MeshBasicMaterial({ color: '#111817', transparent: true, opacity: 0.12, depthWrite: false })
};

const surfaceLayers = {
  roadPaint: 0.275,
  crossingPaint: 0.36,
  apronPaint: 0.38,
  dockStopPaint: 0.43,
  truckTemplate: 0.39,
  paverJoint: 0.55,
  plazaJoint: 0.45,
  parkingPaint: 0.31,
  drainage: 0.315,
  expansionJoint: 0.305,
  roadShoulder: 0.185,
  thresholdPaint: 0.585,
  backlotPaint: 0.49,
  backlotCable: 0.58,
  logisticsPaint: 0.5,
  logisticsClearance: 0.545
};

  buildLighting();
  buildAtmosphere();
  buildSiteBase();
  buildFacilities();
  buildStorytellingAtmosphere();
  buildAccessOverlay();
  setCameraView(opts.initialView);

  let isVisible = true;
  const intersectionObserver = new IntersectionObserver(
    (entries) => { isVisible = entries[0].isIntersecting; },
    { threshold: 0 }
  );
  intersectionObserver.observe(container);

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(container);

  function stopAutoRotate() { controls.autoRotate = false; }
  if (opts.pauseAutoRotateOnInteraction) {
    renderer.domElement.addEventListener('pointerdown', stopAutoRotate);
    renderer.domElement.addEventListener('wheel', stopAutoRotate, { passive: true });
    renderer.domElement.addEventListener('touchstart', stopAutoRotate, { passive: true });
  }

  renderer.domElement.addEventListener('pointermove', handlePointerMove);
  const handlePointerLeave = () => setHovered(null);
  renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
  renderer.domElement.addEventListener('click', handlePointerClick);

  renderer.setAnimationLoop(() => {
    if (!isVisible) return;
    const elapsed = performance.now() / 1000;
    controls.update();
    pulseAccents(elapsed);
    animateAtmosphere(elapsed);
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  });

function buildLighting() {
  const hemi = new THREE.HemisphereLight('#fff9ef', '#788b8b', 1.32);
  scene.add(hemi);

  const key = new THREE.DirectionalLight('#ffe7bd', 4.55);
  key.position.set(-105, 128, 74);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.camera.near = 10;
  key.shadow.camera.far = 460;
  key.shadow.camera.left = -210;
  key.shadow.camera.right = 210;
  key.shadow.camera.top = 180;
  key.shadow.camera.bottom = -180;
  scene.add(key);

  const rim = new THREE.DirectionalLight('#9bdcff', 0.82);
  rim.position.set(-92, 54, -86);
  scene.add(rim);

  const lowFill = new THREE.DirectionalLight('#d8f2ef', 0.52);
  lowFill.position.set(120, 36, -120);
  scene.add(lowFill);
}

function buildAtmosphere() {
  const sun = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createRadialGlowTexture('rgba(255,246,205,1)', 'rgba(255,178,97,0.5)'),
      color: '#fff0bd',
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      depthTest: false,
      fog: false,
      toneMapped: false
    })
  );
  sun.position.set(-255, 142, -250);
  sun.scale.set(86, 86, 1);
  sun.renderOrder = -20;
  atmosphereGroup.add(sun);

  const horizonGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createRadialGlowTexture('rgba(255,185,112,0.55)', 'rgba(255,126,92,0.16)'),
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      depthTest: false,
      fog: false,
      toneMapped: false
    })
  );
  horizonGlow.position.set(-80, 52, -285);
  horizonGlow.scale.set(420, 150, 1);
  horizonGlow.renderOrder = -21;
  atmosphereGroup.add(horizonGlow);

  const publicGlow = new THREE.PointLight('#ffb260', 18, 155, 2.1);
  publicGlow.position.set(-52, 18, 89);
  atmosphereGroup.add(publicGlow);

  const lawnGlow = new THREE.PointLight('#f86f8f', 10, 110, 2.1);
  lawnGlow.position.set(72, 13, 85);
  atmosphereGroup.add(lawnGlow);

  const backlotKey = new THREE.SpotLight('#bceaff', 34, 175, Math.PI * 0.11, 0.56, 2.2);
  backlotKey.position.set(-132, 34, -78);
  backlotKey.target.position.set(-102, 0, -56);
  atmosphereGroup.add(backlotKey);
  atmosphereGroup.add(backlotKey.target);
}

function buildSiteBase() {
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(sitePlan.width, 1, sitePlan.depth),
    new THREE.MeshStandardMaterial({ color: '#cbc8bd', roughness: 0.9 })
  );
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  scene.add(ground);

  siteFeatures.forEach((feature) => {
    const material = getSiteFeatureMaterial(feature);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...feature.size), material);
    mesh.position.set(...feature.position);
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

  addPaintedLines();
  addSurfaceDetails();
  addAccessInfrastructure();
  addOperationalSiteDetails();
  addRenderPolishDetails();
  addBoundaryFence();
}

function createSkyGradientTexture() {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 64;
  textureCanvas.height = 256;
  const context = textureCanvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 0, textureCanvas.height);
  gradient.addColorStop(0, '#6f93ab');
  gradient.addColorStop(0.32, '#b8cdd1');
  gradient.addColorStop(0.62, '#e6ded1');
  gradient.addColorStop(1, '#f1c99c');
  context.fillStyle = gradient;
  context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createRadialGlowTexture(inner, middle, outer = 'rgba(255,255,255,0)') {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 128;
  textureCanvas.height = 128;
  const context = textureCanvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(0.48, middle);
  gradient.addColorStop(1, outer);
  context.fillStyle = gradient;
  context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildStorytellingAtmosphere() {
  addPublicEntryMarker();
  addPublicCivicLightLines();
  addPlazaFestoonLights();
  addStorytellingBannerTrail();
  addEventLawnAtmosphere();
  addProductionLightTowers();
  addStudioBeaconAccents();
}

function addPublicEntryMarker() {
  const frameMaterial = sharedMaterials.darkMetal.clone();
  const glowMaterial = trackAtmosphereMaterial(createEmissiveStandardMaterial('#ffb15f', 1.35), {
    emissiveBase: 1.22,
    emissiveRange: 0.22,
    speed: 1.35,
    phase: 0.2
  });

  addArchitecturalBox(atmosphereGroup, [-126, 4.2, 91.25], [1.1, 8.4, 0.9], frameMaterial.clone(), { castShadow: true });
  addArchitecturalBox(atmosphereGroup, [-98, 4.2, 91.25], [1.1, 8.4, 0.9], frameMaterial.clone(), { castShadow: true });
  addArchitecturalBox(atmosphereGroup, [-112, 8.35, 91.25], [29.2, 0.8, 0.9], frameMaterial.clone(), { castShadow: true });
  addArchitecturalBox(atmosphereGroup, [-112, 8.86, 91.78], [24.6, 0.18, 0.16], glowMaterial);
  addArchitecturalBox(atmosphereGroup, [-126.6, 4.8, 91.78], [0.16, 6.6, 0.16], glowMaterial);
  addArchitecturalBox(atmosphereGroup, [-97.4, 4.8, 91.78], [0.16, 6.6, 0.16], glowMaterial);

  const arrivalPool = addGroundGlow([-112, 0.66, 89.2], 20, 7.5, '#ffb15f', 0.2);
  trackAtmosphereObject(arrivalPool, { opacityBase: 0.18, opacityRange: 0.04, speed: 1.2, phase: 0.4 });
}

function addPublicCivicLightLines() {
  const warm = trackAtmosphereMaterial(createEmissiveStandardMaterial('#ffbd68', 1.0), {
    emissiveBase: 0.92,
    emissiveRange: 0.14,
    speed: 1.0,
    phase: 1.1
  });
  const rose = trackAtmosphereMaterial(createEmissiveStandardMaterial('#f86f8f', 0.88), {
    emissiveBase: 0.78,
    emissiveRange: 0.12,
    speed: 0.9,
    phase: 2.2
  });

  addArchitecturalBox(atmosphereGroup, [-112, 10.95, 88.85], [58, 0.16, 0.16], warm);
  addArchitecturalBox(atmosphereGroup, [-52, 8.32, 91.92], [67, 0.16, 0.16], warm);
  addArchitecturalBox(atmosphereGroup, [-6.5, 7.82, 89.85], [26, 0.14, 0.14], rose);
  addArchitecturalBox(atmosphereGroup, [-57, 16.4, 51.9], [42, 0.14, 0.14], warm);
}

function addPlazaFestoonLights() {
  const cableMaterial = new THREE.MeshStandardMaterial({ color: '#303330', roughness: 0.56, metalness: 0.12 });
  const runs = [
    { start: [-136, 7.2, 89.4], end: [-78, 6.55, 91.1], count: 10, color: '#ffd98a', phase: 0 },
    { start: [-82, 7.05, 88.6], end: [-20, 6.35, 91.1], count: 11, color: '#ffb15f', phase: 0.7 },
    { start: [-22, 6.8, 90.5], end: [54, 6.2, 84.2], count: 12, color: '#f86f8f', phase: 1.4 }
  ];

  runs.forEach((run) => {
    addCylinderBetween(atmosphereGroup, run.start, run.end, 0.035, cableMaterial.clone());

    const bulbMaterial = trackAtmosphereMaterial(
      createEmissiveStandardMaterial(run.color, 1.55, { surfaceColor: '#fff3d3', roughness: 0.28 }),
      { emissiveBase: 1.35, emissiveRange: 0.32, speed: 1.45, phase: run.phase }
    );
    const positions = [];
    for (let index = 0; index < run.count; index += 1) {
      const t = run.count === 1 ? 0 : index / (run.count - 1);
      const sag = Math.sin(Math.PI * t) * 0.54;
      positions.push([
        run.start[0] + (run.end[0] - run.start[0]) * t,
        run.start[1] + (run.end[1] - run.start[1]) * t - sag,
        run.start[2] + (run.end[2] - run.start[2]) * t
      ]);
    }
    addCylinderInstances(atmosphereGroup, new THREE.SphereGeometry(0.34, 10, 8), positions, bulbMaterial, {
      castShadow: false,
      receiveShadow: false
    });
  });
}

function addStorytellingBannerTrail() {
  const poleMaterial = sharedMaterials.darkMetal.clone();
  const banners = [
    { position: [-132, 0, 91.7], color: '#c64f42' },
    { position: [-112, 0, 91.7], color: '#d58b3e' },
    { position: [-92, 0, 91.7], color: '#496f88' },
    { position: [-72, 0, 91.7], color: '#3f7f62' },
    { position: [-52, 0, 91.7], color: '#b45d76' },
    { position: [-32, 0, 91.7], color: '#c64f42' },
    { position: [54, 0, 81.6], color: '#d58b3e' },
    { position: [69, 0, 81.6], color: '#496f88' }
  ];

  addCylinderInstances(
    atmosphereGroup,
    new THREE.CylinderGeometry(0.08, 0.1, 5.4, 8),
    banners.map(({ position }) => [position[0], 2.7, position[2]]),
    poleMaterial,
    { castShadow: true, receiveShadow: true }
  );

  banners.forEach((banner, index) => {
    const material = new THREE.MeshStandardMaterial({
      color: banner.color,
      roughness: 0.66,
      metalness: 0.02
    });
    const direction = index < 6 ? 1 : -1;
    addArchitecturalBox(
      atmosphereGroup,
      [banner.position[0] + direction * 0.68, 3.8, banner.position[2]],
      [1.2, 2.7, 0.08],
      material,
      { castShadow: true }
    );
  });
}

function addEventLawnAtmosphere() {
  const plazaGlow = addGroundGlow([-54, 0.64, 88.8], 42, 8, '#ffcf7a', 0.16);
  const lawnGlow = addGroundGlow([62, 0.64, 84.5], 25, 14, '#f86f8f', 0.2);
  trackAtmosphereObject(plazaGlow, { opacityBase: 0.14, opacityRange: 0.035, speed: 0.8, phase: 1.8 });
  trackAtmosphereObject(lawnGlow, { opacityBase: 0.18, opacityRange: 0.04, speed: 1.05, phase: 0.8 });

  const screenHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createRadialGlowTexture('rgba(255,182,92,0.72)', 'rgba(248,111,143,0.2)'),
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      depthTest: true,
      fog: false,
      toneMapped: false
    })
  );
  screenHalo.position.set(73.2, 5.5, 84);
  screenHalo.scale.set(24, 15, 1);
  screenHalo.renderOrder = 4;
  atmosphereGroup.add(screenHalo);
  trackAtmosphereObject(screenHalo, { opacityBase: 0.5, opacityRange: 0.08, speed: 1.1, phase: 1.2 });

  const lanternStems = [
    [50, 1.0, 78],
    [58, 1.0, 77.5],
    [68, 1.0, 77.8],
    [76, 1.0, 79],
    [47, 1.0, 90.5],
    [78, 1.0, 91]
  ];
  const stemMaterial = sharedMaterials.darkMetal.clone();
  addCylinderInstances(atmosphereGroup, new THREE.CylinderGeometry(0.07, 0.08, 2, 8), lanternStems, stemMaterial, {
    castShadow: true,
    receiveShadow: true
  });

  const lanternMaterial = trackAtmosphereMaterial(createEmissiveStandardMaterial('#ffd98a', 1.4), {
    emissiveBase: 1.18,
    emissiveRange: 0.2,
    speed: 1.3,
    phase: 2.4
  });
  addCylinderInstances(
    atmosphereGroup,
    new THREE.SphereGeometry(0.28, 10, 8),
    lanternStems.map(([x, , z]) => [x, 2.15, z]),
    lanternMaterial,
    { castShadow: false, receiveShadow: false }
  );
}

function addProductionLightTowers() {
  const towers = [
    { position: [-132, 0, -78], target: [-104, 0, -56], color: '#bceaff' },
    { position: [138, 0, 72], target: [125, 0, 62], color: '#ffd6a0' },
    { position: [18, 0, -86], target: [44, 0, -55], color: '#d9f6ff' }
  ];
  const steel = sharedMaterials.serviceSteel.clone();

  towers.forEach((tower, index) => {
    const [x, , z] = tower.position;
    addColumn(atmosphereGroup, [x, 7.2, z], 0.14, 14.4, steel.clone());
    addArchitecturalBox(atmosphereGroup, [x, 14.3, z], [4.8, 0.18, 0.18], steel.clone(), { castShadow: true });

    const lampMaterial = trackAtmosphereMaterial(createEmissiveStandardMaterial(tower.color, 1.65), {
      emissiveBase: 1.38,
      emissiveRange: 0.22,
      speed: 1.1,
      phase: index * 0.6
    });
    [-1.55, 0, 1.55].forEach((offset) => {
      addArchitecturalBox(atmosphereGroup, [x + offset, 14, z + 0.38], [0.72, 0.38, 0.42], lampMaterial, {
        castShadow: false
      });
    });

    if (index !== 0) {
      const beam = new THREE.SpotLight(tower.color, 16, 118, Math.PI * 0.1, 0.62, 2.2);
      beam.position.set(x, 15.5, z);
      beam.target.position.set(...tower.target);
      atmosphereGroup.add(beam);
      atmosphereGroup.add(beam.target);
    }
  });
}

function addStudioBeaconAccents() {
  facilities
    .filter((facility) => facility.category === 'stage' && facility.id !== 'backlot-water')
    .forEach((facility, index) => {
      facility.blocks
        .filter((block) => block.kind === 'stage')
        .forEach((block) => {
          const [width, height, depth] = block.size;
          const [x, y, z] = block.position;
          const beaconColor = index % 2 === 0 ? '#ffd98a' : '#ffb15f';
          const material = trackAtmosphereMaterial(createEmissiveStandardMaterial(beaconColor, 0.82), {
            emissiveBase: 0.68,
            emissiveRange: 0.12,
            speed: 0.9,
            phase: index * 0.45
          });
          addArchitecturalBox(
            atmosphereGroup,
            [x, y + height * 0.14, z + depth / 2 + 0.44],
            [Math.min(width * 0.42, 25), 0.2, 0.16],
            material
          );
        });
    });
}

function createEmissiveStandardMaterial(color, intensity = 1, options = {}) {
  const opacity = options.opacity ?? 1;
  const material = new THREE.MeshStandardMaterial({
    color: options.surfaceColor ?? color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: options.roughness ?? 0.42,
    metalness: options.metalness ?? 0.04,
    transparent: opacity < 1,
    opacity
  });
  material.toneMapped = false;
  if (opacity < 1) {
    material.depthWrite = false;
  }
  return material;
}

function createAdditiveGlowMaterial(color, opacity) {
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false
  });
  material.toneMapped = false;
  return material;
}

function addGroundGlow(position, radiusX, radiusZ, color, opacity) {
  const material = createAdditiveGlowMaterial(color, opacity);
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 48), material);
  mesh.position.set(...position);
  mesh.rotation.x = -Math.PI / 2;
  mesh.scale.set(radiusX, radiusZ, 1);
  mesh.renderOrder = 3;
  atmosphereGroup.add(mesh);
  return mesh;
}

function addCylinderBetween(parent, start, end, radius, material) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(to, from);
  const length = direction.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 8), material);
  mesh.position.copy(from).addScaledVector(direction, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = false;
  parent.add(mesh);
  return mesh;
}

function trackAtmosphereMaterial(material, options = {}) {
  animatedAtmosphere.push({ material, ...options });
  return material;
}

function trackAtmosphereObject(object, options = {}) {
  animatedAtmosphere.push({ object, ...options });
  return object;
}

function createNoiseTexture(light, dark, opacity = 0.25) {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 96;
  textureCanvas.height = 96;
  const context = textureCanvas.getContext('2d');
  context.fillStyle = light;
  context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
  context.globalAlpha = opacity * 0.22;
  for (let y = 0; y < textureCanvas.height; y += 1) {
    for (let x = 0; x < textureCanvas.width; x += 1) {
      if (Math.random() > 0.58) {
        context.fillStyle = dark;
        context.fillRect(x, y, 1, 1);
      }
    }
  }
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.6, 1.6);
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function getSiteFeatureMaterial(feature) {
  if (feature.kind === 'lawn') return sharedMaterials.lawn.clone();
  if (feature.kind === 'paver') return sharedMaterials.paver.clone();
  if (feature.kind === 'publicRoad') return sharedMaterials.publicRoad.clone();
  if (feature.kind === 'serviceRoad') return sharedMaterials.serviceRoad.clone();
  if (feature.kind === 'apron') return sharedMaterials.apron.clone();
  if (feature.kind === 'gate') return sharedMaterials.gate.clone();
  return sharedMaterials.asphalt.clone();
}

function addPaintedLines() {
  const lineMaterial = new THREE.MeshStandardMaterial({ color: '#cfd6d2', roughness: 0.72 });
  const yellowMaterial = new THREE.MeshStandardMaterial({ color: '#d6b356', roughness: 0.74 });
  const lineSpecs = [
    { position: [-5, surfaceLayers.roadPaint, 96], size: [270, 0.025, 0.45] },
    { position: [0, surfaceLayers.roadPaint, -92.5], size: [284, 0.025, 0.45] },
    { position: [0, surfaceLayers.roadPaint, -25.25], size: [284, 0.025, 0.45] },
    { position: [146, surfaceLayers.roadPaint, 0], size: [0.45, 0.025, 180] },
    { position: [-146, surfaceLayers.roadPaint, -57.5], size: [0.45, 0.025, 73] },
    { position: [5, surfaceLayers.roadPaint, 4], size: [0.34, 0.025, 46] },
    { position: [65, surfaceLayers.roadPaint, 4], size: [0.34, 0.025, 46] }
  ];

  lineSpecs.forEach((spec) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...spec.size), lineMaterial);
    mesh.position.set(...spec.position);
    scene.add(mesh);
  });

  addCrosswalk([-112, surfaceLayers.crossingPaint, 96], 'x', 18, 6, lineMaterial);
  addCrosswalk([100, surfaceLayers.crossingPaint, 96], 'x', 18, 6, lineMaterial);
  addCrosswalk([-18, surfaceLayers.crossingPaint, 34], 'x', 14, 5, yellowMaterial);

  addLaneArrow([-86, surfaceLayers.crossingPaint, 96], 'east', lineMaterial);
  addLaneArrow([54, surfaceLayers.crossingPaint, 96], 'east', lineMaterial);
  addLaneArrow([146, surfaceLayers.crossingPaint, 48], 'north', lineMaterial);
  addLaneArrow([146, surfaceLayers.crossingPaint, -42], 'north', lineMaterial);
  addLaneArrow([54, surfaceLayers.crossingPaint, -25.25], 'east', yellowMaterial);
  addLaneArrow([5, surfaceLayers.crossingPaint, 4], 'north', yellowMaterial);
  addLaneArrow([65, surfaceLayers.crossingPaint, 4], 'north', yellowMaterial);
}

function addCrosswalk(position, axis, length, stripeCount, material) {
  const positions = [];
  for (let index = 0; index < stripeCount; index += 1) {
    const offset = -length / 2 + (length / Math.max(1, stripeCount - 1)) * index;
    const stripePosition = axis === 'x'
      ? [position[0] + offset, position[1], position[2]]
      : [position[0], position[1], position[2] + offset];
    positions.push(stripePosition);
  }
  const stripeSize = axis === 'x' ? [0.85, 0.026, 4.6] : [4.6, 0.026, 0.85];
  addBoxInstances(scene, stripeSize, positions, material);
}

function addLaneArrow(position, direction, material) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = getDirectionAngle(direction);

  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.026, 3.4), material);
  stem.position.z = -0.65;
  group.add(stem);

  const head = createFlatArrow(material.color.getStyle(), 0.94, 2.25);
  head.position.y = 0.018;
  head.position.z = 1.55;
  group.add(head);
  scene.add(group);
}

function getDirectionAngle(direction) {
  const angles = {
    south: 0,
    east: Math.PI / 2,
    north: Math.PI,
    west: -Math.PI / 2
  };
  return angles[direction] ?? 0;
}

function createFlatArrow(color, opacity = 1, scale = 1) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([
      0, 0, 1.2 * scale,
      -0.78 * scale, 0, -0.92 * scale,
      0.78 * scale, 0, -0.92 * scale
    ], 3)
  );
  geometry.setIndex([0, 1, 2]);
  geometry.computeVertexNormals();

  const material = new THREE.MeshBasicMaterial({
    color,
    opacity,
    transparent: opacity < 1,
    side: THREE.DoubleSide,
    depthWrite: opacity === 1
  });
  return new THREE.Mesh(geometry, material);
}

function addSurfaceDetails() {
  const curbMaterial = new THREE.MeshStandardMaterial({ color: '#e5e0d8', roughness: 0.84 });
  const curbSpecs = [
    { position: [0, 0.18, -96.8], size: [284, 0.18, 0.5] },
    { position: [0, 0.18, -88.2], size: [284, 0.18, 0.5] },
    { position: [0, 0.18, -29.75], size: [284, 0.18, 0.5] },
    { position: [0, 0.18, -20.75], size: [284, 0.18, 0.5] },
    { position: [58, 0.18, 25.3], size: [168, 0.18, 0.5] },
    { position: [58, 0.18, 41.7], size: [168, 0.18, 0.5] },
    { position: [-5, 0.18, 92.3], size: [270, 0.18, 0.5] },
    { position: [-5, 0.18, 99.7], size: [270, 0.18, 0.5] },
    { position: [-60, 0.36, 85.3], size: [118, 0.18, 0.45] },
    { position: [-60, 0.36, 93.2], size: [118, 0.18, 0.45] }
  ];

  curbSpecs.forEach((spec) => {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(...spec.size), curbMaterial);
    curb.position.set(...spec.position);
    curb.receiveShadow = true;
    scene.add(curb);
  });

  const paverJointMaterial = new THREE.MeshStandardMaterial({ color: '#b7afa4', roughness: 0.92 });
  const plazaJointXPositions = [];
  for (let x = -118; x <= -3; x += 12) {
    plazaJointXPositions.push([x, surfaceLayers.plazaJoint, 89]);
  }
  addBoxInstances(scene, [0.18, 0.025, 6.2], plazaJointXPositions, paverJointMaterial);

  const plazaJointZPositions = [];
  for (let z = 86.2; z <= 91.8; z += 2.8) {
    plazaJointZPositions.push([-62, surfaceLayers.plazaJoint + 0.045, z]);
  }
  addBoxInstances(scene, [114, 0.025, 0.18], plazaJointZPositions, paverJointMaterial.clone());

  const parkingLineMaterial = new THREE.MeshStandardMaterial({ color: '#eef0ea', roughness: 0.72 });
  const parkingLinePositions = [];
  for (let x = 84; x <= 116; x += 8) {
    [81.6, 89.4].forEach((z) => {
      parkingLinePositions.push([x, surfaceLayers.parkingPaint, z]);
    });
  }
  addBoxInstances(scene, [0.25, 0.025, 4.2], parkingLinePositions, parkingLineMaterial);

  addPaverPathJoints();
  addLoadingApronMarkings();
  addPedestrianBollards();
  addTruckTurningMarks();
}

function addPaverPathJoints() {
  const jointMaterial = new THREE.MeshStandardMaterial({ color: '#b8aea0', roughness: 0.9 });
  const jointSpecs = [
    { start: -136, end: -88, z: 87.4, axis: 'x' },
    { start: -72, end: -18, z: 87.4, axis: 'x' },
    { start: 50, end: 98, z: 85.5, axis: 'x' },
    { start: 56, end: 87, x: -80, axis: 'z' },
    { start: -78, end: -38, z: 54, axis: 'x' }
  ];

  const xJointPositions = [];
  const zJointPositions = [];
  jointSpecs.forEach((spec) => {
    for (let value = spec.start; value <= spec.end; value += 6) {
      const position = spec.axis === 'x' ? [value, surfaceLayers.paverJoint, spec.z] : [spec.x, surfaceLayers.paverJoint, value];
      if (spec.axis === 'x') {
        xJointPositions.push(position);
      } else {
        zJointPositions.push(position);
      }
    }
  });
  addBoxInstances(scene, [0.16, 0.026, 2.45], xJointPositions, jointMaterial);
  addBoxInstances(scene, [2.45, 0.026, 0.16], zJointPositions, jointMaterial.clone());
}

function addLoadingApronMarkings() {
  const paint = new THREE.MeshStandardMaterial({ color: '#d8d2c6', roughness: 0.78 });
  const amber = new THREE.MeshStandardMaterial({ color: '#d0a14f', roughness: 0.74 });
  const dockBays = [
    { x: -25, z: -22.7, width: 18 },
    { x: 35, z: 31, width: 18 },
    { x: 95, z: 31, width: 18 },
    { x: 130, z: 58, width: 16 }
  ];

  const sidePositions = [];
  const stopPositionsByWidth = new Map();
  dockBays.forEach((bay) => {
    sidePositions.push([bay.x - bay.width / 2, surfaceLayers.apronPaint, bay.z]);
    sidePositions.push([bay.x + bay.width / 2, surfaceLayers.apronPaint, bay.z]);
    if (!stopPositionsByWidth.has(bay.width)) {
      stopPositionsByWidth.set(bay.width, []);
    }
    stopPositionsByWidth.get(bay.width).push([bay.x, surfaceLayers.dockStopPaint, bay.z + 4.2]);
  });
  addBoxInstances(scene, [0.32, 0.026, 8.8], sidePositions, paint);
  stopPositionsByWidth.forEach((positions, width) => {
    addBoxInstances(scene, [width, 0.026, 0.32], positions, amber.clone());
  });
}

function addPedestrianBollards() {
  const bollardMaterial = new THREE.MeshStandardMaterial({ color: '#313836', roughness: 0.62, metalness: 0.08 });
  const bollardLines = [
    { from: [-124, 0, 91], to: [-88, 0, 91], count: 7 },
    { from: [-76, 0, 91], to: [-22, 0, 91], count: 8 },
    { from: [54, 0, 82], to: [104, 0, 82], count: 9 },
    { from: [-77.6, 0, 56], to: [-77.6, 0, 88], count: 7 }
  ];

  const positions = [];
  bollardLines.forEach((line) => {
    for (let index = 0; index < line.count; index += 1) {
      const t = line.count === 1 ? 0 : index / (line.count - 1);
      const x = line.from[0] + (line.to[0] - line.from[0]) * t;
      const z = line.from[2] + (line.to[2] - line.from[2]) * t;
      positions.push([x, 0.66, z]);
    }
  });

  addCylinderInstances(scene, new THREE.CylinderGeometry(0.22, 0.24, 0.9, 10), positions, bollardMaterial);
}

function addTruckTurningMarks() {
  const material = new THREE.MeshStandardMaterial({
    color: '#e1d6bf',
    roughness: 0.78,
    side: THREE.DoubleSide
  });
  const arcs = [
    { position: [126, surfaceLayers.truckTemplate, 66], radius: 9.2, start: Math.PI * 0.02, length: Math.PI * 0.74 },
    { position: [139, surfaceLayers.truckTemplate, 82], radius: 7.5, start: Math.PI * 0.74, length: Math.PI * 0.64 },
    { position: [-136, surfaceLayers.truckTemplate, -83], radius: 8.6, start: Math.PI * 1.0, length: Math.PI * 0.58 }
  ];

  arcs.forEach((arc) => {
    const geometry = new THREE.RingGeometry(arc.radius - 0.16, arc.radius + 0.16, 36, 1, arc.start, arc.length);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(...arc.position);
    scene.add(mesh);
  });
}

function addAccessInfrastructure() {
  accessPoints.forEach((point) => {
    if (point.boothPosition) {
      addGateBooth(point);
    }

    if (point.barrierPosition && point.barrierSize) {
      const barrier = new THREE.Mesh(new THREE.BoxGeometry(...point.barrierSize), sharedMaterials.gate.clone());
      barrier.position.set(...point.barrierPosition);
      barrier.castShadow = true;
      scene.add(barrier);
    }
  });
}

function addGateBooth(point) {
  const boothMaterial = new THREE.MeshStandardMaterial({ color: '#d8d0c3', roughness: 0.82 });
  const glass = sharedMaterials.glass.clone();
  glass.color = new THREE.Color('#263c3f');
  const roof = sharedMaterials.civicRoof.clone();
  const [x, y, z] = point.boothPosition;

  const booth = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.9, 3.4), boothMaterial);
  booth.position.set(x, y, z);
  booth.castShadow = true;
  booth.receiveShadow = true;
  scene.add(booth);

  const cap = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.36, 4.1), roof);
  cap.position.set(x, y + 1.62, z);
  cap.castShadow = true;
  scene.add(cap);

  const windowFacing = Math.abs(point.barrierSize?.[0] ?? 0) > Math.abs(point.barrierSize?.[2] ?? 0)
    ? new THREE.BoxGeometry(2.5, 1.05, 0.16)
    : new THREE.BoxGeometry(0.16, 1.05, 2.5);
  const window = new THREE.Mesh(windowFacing, glass);
  if (Math.abs(point.barrierSize?.[0] ?? 0) > Math.abs(point.barrierSize?.[2] ?? 0)) {
    window.position.set(x, y + 0.32, z + 1.78);
  } else {
    window.position.set(x + 1.98, y + 0.32, z);
  }
  scene.add(window);
}

function addOperationalSiteDetails() {
  addPublicWayfinding();
  addSecureThresholdMarkers();
  addServiceYardEquipment();
  addPlantCompounds();
  addDockQueueMarkings();
  addStageApronLogistics();
}

function addPublicWayfinding() {
  const plinthMaterial = sharedMaterials.publicStone.clone();
  const faceMaterial = sharedMaterials.darkMetal.clone();
  const accentMaterial = new THREE.MeshStandardMaterial({ color: '#45b985', roughness: 0.52 });
  const totems = [
    { position: [-126, 1.8, 88.3], height: 3.6, accent: '#f28c44' },
    { position: [-34, 1.7, 88.4], height: 3.4, accent: '#45b985' },
    { position: [80, 1.65, 88.3], height: 3.3, accent: '#88d06d' }
  ];

  totems.forEach((totem) => {
    const group = new THREE.Group();
    group.position.set(...totem.position);

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 1.2), plinthMaterial);
    plinth.position.y = 0.18;
    plinth.castShadow = true;
    group.add(plinth);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.54, totem.height, 0.36), faceMaterial);
    body.position.y = totem.height / 2 + 0.35;
    body.castShadow = true;
    group.add(body);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 0.46), accentMaterial.clone());
    cap.material.color = new THREE.Color(totem.accent);
    cap.position.y = totem.height + 0.48;
    cap.castShadow = true;
    group.add(cap);
    scene.add(group);
  });
}

function addSecureThresholdMarkers() {
  const markerMaterial = sharedMaterials.safetyYellow.clone();
  const steel = sharedMaterials.serviceSteel.clone();
  const thresholds = [
    { position: [-18, surfaceLayers.thresholdPaint, 37.2], size: [17.2, 0.14, 0.42] },
    { position: [146, surfaceLayers.thresholdPaint, 78.5], size: [0.42, 0.14, 9.5] },
    { position: [0, surfaceLayers.thresholdPaint, -88.4], size: [18.5, 0.14, 0.42] }
  ];

  thresholds.forEach((spec) => addArchitecturalBox(scene, spec.position, spec.size, markerMaterial.clone(), { castShadow: true }));

  const postPositions = [];
  for (let x = -40; x <= 2; x += 7) {
    postPositions.push([x, 0.82, 37.6]);
  }
  addCylinderInstances(scene, new THREE.CylinderGeometry(0.16, 0.18, 1.4, 10), postPositions, steel);
}

function addServiceYardEquipment() {
  const rackMaterial = sharedMaterials.serviceSteel.clone();
  const containerMaterial = new THREE.MeshStandardMaterial({ color: '#8a513f', roughness: 0.78, metalness: 0.06 });
  const timberMaterial = sharedMaterials.timber.clone();

  const racks = [
    { position: [137, 1.15, 70], size: [7.5, 1.7, 1.4] },
    { position: [137, 1.15, 74], size: [7.5, 1.7, 1.4] },
    { position: [121, 1.15, 72], size: [7, 1.7, 1.4] }
  ];
  racks.forEach((rack) => {
    addStorageRack(scene, rack.position, rack.size, rackMaterial, timberMaterial);
  });

  const containers = [
    { position: [123, 1.55, 60.5], size: [8.5, 2.5, 2.4] },
    { position: [134, 1.55, 60.5], size: [8.5, 2.5, 2.4] },
    { position: [-118, 1.35, -36], size: [7, 2.1, 2.3] }
  ];
  containers.forEach((container, index) => {
    const material = containerMaterial.clone();
    material.color = new THREE.Color(index === 1 ? '#6c7270' : '#8a513f');
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...container.size), material);
    mesh.position.set(...container.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });
}

function addStorageRack(parent, position, size, rackMaterial, deckMaterial) {
  const [width, height, depth] = size;
  const group = new THREE.Group();
  group.position.set(...position);

  for (const x of [-width / 2, width / 2]) {
    for (const z of [-depth / 2, depth / 2]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, height, 0.18), rackMaterial.clone());
      post.position.set(x, 0, z);
      post.castShadow = true;
      group.add(post);
    }
  }

  for (const y of [-height * 0.22, height * 0.2]) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(width, 0.18, depth), deckMaterial.clone());
    shelf.position.y = y;
    shelf.castShadow = true;
    group.add(shelf);
  }

  parent.add(group);
}

function addPlantCompounds() {
  const padMaterial = new THREE.MeshStandardMaterial({ color: '#b9b5aa', roughness: 0.86 });
  const plantMaterial = sharedMaterials.zinc.clone();
  const screenMaterial = sharedMaterials.serviceSteel.clone();
  const compounds = [
    { center: [-72, -82], size: [18, 8], units: 3 },
    { center: [116, -82], size: [18, 8], units: 3 },
    { center: [108, 24], size: [16, 7], units: 2 }
  ];

  compounds.forEach((compound) => {
    const [x, z] = compound.center;
    const [width, depth] = compound.size;
    const pad = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, depth), padMaterial.clone());
    pad.position.set(x, 0.22, z);
    pad.receiveShadow = true;
    scene.add(pad);

    for (let index = 0; index < compound.units; index += 1) {
      const unitX = x - width * 0.28 + index * width * 0.28;
      const unit = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.1, 2.2), plantMaterial.clone());
      unit.position.set(unitX, 0.86, z);
      unit.castShadow = true;
      scene.add(unit);
    }

    addCompoundScreen([x, 1.05, z - depth / 2 - 0.2], [width, 1.7, 0.22], screenMaterial);
  });
}

function addCompoundScreen(position, size, material) {
  const [width, height, depth] = size;
  const positions = [];
  for (let offset = -width / 2; offset <= width / 2; offset += 1.8) {
    positions.push([position[0] + offset, position[1], position[2]]);
  }
  addBoxInstances(scene, [0.28, height, depth], positions, material.clone(), { castShadow: true });
}

function addDockQueueMarkings() {
  const paint = new THREE.MeshStandardMaterial({ color: '#e5d6b3', roughness: 0.76 });
  const queueBays = [
    { x: -25, z: -27.6, width: 18 },
    { x: 35, z: 38, width: 18 },
    { x: 95, z: 38, width: 18 },
    { x: 130, z: 73, width: 15 }
  ];

  const queuePositions = [];
  queueBays.forEach((bay) => {
    for (let offset = -bay.width / 2; offset <= bay.width / 2; offset += 4) {
      queuePositions.push({
        position: [bay.x + offset, surfaceLayers.dockStopPaint, bay.z],
        rotation: [0, Math.PI * 0.22, 0]
      });
    }
  });
  addBoxInstances(scene, [2.2, 0.026, 0.28], queuePositions, paint);
}

function addStageApronLogistics() {
  const laneMaterial = new THREE.MeshStandardMaterial({ color: '#d9c178', roughness: 0.74 });
  const clearanceMaterial = new THREE.MeshStandardMaterial({ color: '#6f6954', roughness: 0.82 });
  const hatchMaterial = new THREE.MeshStandardMaterial({ color: '#e5dcc4', roughness: 0.78 });
  const bumperMaterial = sharedMaterials.darkMetal.clone();
  const refugeMaterial = new THREE.MeshStandardMaterial({ color: '#d7ded7', roughness: 0.82 });
  const safetyMaterial = sharedMaterials.safetyYellow.clone();

  const dockClearances = [
    { x: -28, z: -81.8, width: 34, depth: 4.6 },
    { x: 42, z: -81.8, width: 24, depth: 4.6 },
    { x: 100, z: -81.8, width: 24, depth: 4.6 },
    { x: -25, z: -23.2, width: 24, depth: 4.8 },
    { x: 35, z: 28.2, width: 24, depth: 5.8 },
    { x: 95, z: 28.2, width: 24, depth: 5.8 },
    { x: 130, z: 55.2, width: 18, depth: 5.4 }
  ];

  addBoxInstances(
    scene,
    [1, 1, 1],
    dockClearances.map((dock) => ({
      position: [dock.x, surfaceLayers.logisticsPaint, dock.z],
      rotation: [0, 0, 0],
      scale: [dock.width, 0.035, dock.depth]
    })),
    clearanceMaterial
  );

  const hatchPositions = [];
  dockClearances.forEach((dock) => {
    for (let offset = -dock.width * 0.38; offset <= dock.width * 0.38; offset += 4.2) {
      hatchPositions.push({
        position: [dock.x + offset, surfaceLayers.logisticsClearance, dock.z],
        rotation: [0, Math.PI * 0.24, 0]
      });
    }
  });
  addBoxInstances(scene, [2.8, 0.026, 0.24], hatchPositions, hatchMaterial);

  const dockThresholds = [];
  const dockBumpers = [];
  dockClearances.forEach((dock) => {
    const edgeZ = dock.z < -40 ? dock.z + dock.depth / 2 + 0.35 : dock.z - dock.depth / 2 - 0.35;
    dockThresholds.push([dock.x, surfaceLayers.logisticsClearance + 0.035, edgeZ]);
    dockBumpers.push([dock.x - dock.width * 0.34, 0.74, edgeZ]);
    dockBumpers.push([dock.x + dock.width * 0.34, 0.74, edgeZ]);
  });
  addBoxInstances(scene, [12, 0.035, 0.36], dockThresholds, safetyMaterial.clone(), { castShadow: false });
  addBoxInstances(scene, [2.4, 0.7, 0.42], dockBumpers, bumperMaterial, { castShadow: true });

  const forkliftLaneSpecs = [
    { position: [58, surfaceLayers.logisticsClearance + 0.055, 41.2], size: [154, 0.026, 0.26] },
    { position: [58, surfaceLayers.logisticsClearance + 0.055, 25.9], size: [154, 0.026, 0.26] },
    { position: [0, surfaceLayers.logisticsClearance + 0.055, -21.15], size: [250, 0.026, 0.22] },
    { position: [0, surfaceLayers.logisticsClearance + 0.055, -88.7], size: [250, 0.026, 0.22] },
    { position: [132.6, surfaceLayers.logisticsClearance + 0.055, 66], size: [0.24, 0.026, 18] }
  ];
  forkliftLaneSpecs.forEach((spec) => {
    addArchitecturalBox(scene, spec.position, spec.size, laneMaterial.clone(), { castShadow: false });
  });

  const refugePads = [
    { position: [7.5, surfaceLayers.logisticsPaint + 0.07, 37.9], size: [7.6, 0.04, 2.8] },
    { position: [67.5, surfaceLayers.logisticsPaint + 0.07, 37.9], size: [7.6, 0.04, 2.8] },
    { position: [122, surfaceLayers.logisticsPaint + 0.07, 75.7], size: [9.5, 0.04, 2.6] }
  ];
  refugePads.forEach((pad) => addArchitecturalBox(scene, pad.position, pad.size, refugeMaterial.clone(), { castShadow: false }));

  const crossingBars = [];
  [7.5, 67.5, 122].forEach((x, index) => {
    const z = index === 2 ? 75.7 : 37.9;
    const length = index === 2 ? 8.4 : 6.8;
    for (let offset = -length / 2; offset <= length / 2; offset += 1.6) {
      crossingBars.push([x + offset, surfaceLayers.logisticsClearance + 0.09, z]);
    }
  });
  addBoxInstances(scene, [0.72, 0.026, 2.4], crossingBars, hatchMaterial.clone());

  const yardBollards = [];
  for (let x = -50; x <= 126; x += 8) {
    yardBollards.push([x, 0.72, 41.9]);
  }
  for (let x = -48; x <= 128; x += 10) {
    yardBollards.push([x, 0.72, -88.15]);
  }
  addCylinderInstances(scene, new THREE.CylinderGeometry(0.14, 0.16, 1.15, 10), yardBollards, sharedMaterials.serviceSteel.clone(), {
    castShadow: true,
    receiveShadow: true
  });
}

function addRenderPolishDetails() {
  addDrainageAndExpansionJoints();
  addLandscapeEdges();
  addRoadShoulderTones();
}

function addDrainageAndExpansionJoints() {
  const grateMaterial = new THREE.MeshStandardMaterial({ color: '#202827', roughness: 0.68, metalness: 0.18 });
  const jointMaterial = new THREE.MeshStandardMaterial({ color: '#5e6460', roughness: 0.84 });
  const grates = [
    { position: [-5, surfaceLayers.drainage, 99.35], size: [248, 0.045, 0.28] },
    { position: [0, surfaceLayers.drainage, -88.65], size: [266, 0.045, 0.28] },
    { position: [0, surfaceLayers.drainage, -21.2], size: [266, 0.045, 0.28] },
    { position: [146.05, surfaceLayers.drainage, -2], size: [0.28, 0.045, 160] },
    { position: [58, surfaceLayers.drainage, 41.1], size: [154, 0.045, 0.28] }
  ];

  grates.forEach((grate) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...grate.size), grateMaterial.clone());
    mesh.position.set(...grate.position);
    scene.add(mesh);
  });

  const southJointPositions = [];
  for (let x = -20; x <= 136; x += 18) {
    southJointPositions.push([x, surfaceLayers.expansionJoint, 33.5]);
  }
  addBoxInstances(scene, [0.18, 0.026, 14.2], southJointPositions, jointMaterial);

  const northJointPositions = [];
  for (let x = -48; x <= 132; x += 18) {
    northJointPositions.push([x, surfaceLayers.expansionJoint, -83.5]);
  }
  addBoxInstances(scene, [0.18, 0.026, 6.2], northJointPositions, jointMaterial.clone());
}

function addLandscapeEdges() {
  const mulch = new THREE.MeshStandardMaterial({ color: '#5d4e3d', roughness: 0.96 });
  const edging = new THREE.MeshStandardMaterial({ color: '#d8d0c2', roughness: 0.82 });
  const beds = [
    { position: [62, 0.41, 84.5], size: [27, 0.08, 16] },
    { position: [-118, 0.22, 103], size: [64, 0.08, 2.2] },
    { position: [54, 0.22, 103], size: [160, 0.08, 2.2] }
  ];

  beds.forEach((bed, index) => {
    const material = index === 0 ? sharedMaterials.landscape.clone() : mulch.clone();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...bed.size), material);
    mesh.position.set(...bed.position);
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

  const edges = [
    { position: [62, 0.48, 76.25], size: [27, 0.12, 0.32] },
    { position: [62, 0.48, 92.75], size: [27, 0.12, 0.32] },
    { position: [48.35, 0.48, 84.5], size: [0.32, 0.12, 16] },
    { position: [75.65, 0.48, 84.5], size: [0.32, 0.12, 16] },
    { position: [-118, 0.3, 101.75], size: [64, 0.12, 0.28] },
    { position: [54, 0.3, 101.75], size: [160, 0.12, 0.28] }
  ];

  edges.forEach((edge) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...edge.size), edging.clone());
    mesh.position.set(...edge.position);
    mesh.castShadow = true;
    scene.add(mesh);
  });
}

function addRoadShoulderTones() {
  const shoulder = new THREE.MeshBasicMaterial({ color: '#101615', transparent: true, opacity: 0.08, depthWrite: false });
  const specs = [
    { position: [-5, surfaceLayers.roadShoulder, 92.75], size: [270, 0.02, 0.46] },
    { position: [-5, surfaceLayers.roadShoulder, 99.25], size: [270, 0.02, 0.46] },
    { position: [0, surfaceLayers.roadShoulder, -96.05], size: [284, 0.02, 0.46] },
    { position: [0, surfaceLayers.roadShoulder, -88.95], size: [284, 0.02, 0.46] },
    { position: [146, surfaceLayers.roadShoulder, 87.5], size: [0.46, 0.02, 22] },
    { position: [146, surfaceLayers.roadShoulder, -86], size: [0.46, 0.02, 20] }
  ];

  specs.forEach((spec) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...spec.size), shoulder.clone());
    mesh.position.set(...spec.position);
    mesh.renderOrder = 2;
    scene.add(mesh);
  });
}

function addBoundaryFence() {
  const halfWidth = sitePlan.width / 2;
  const halfDepth = sitePlan.depth / 2;
  const southSegments = [
    [-halfWidth, -126],
    [-98, 88],
    [112, halfWidth]
  ];
  const northSegments = [
    [-halfWidth, -14],
    [14, halfWidth]
  ];
  const eastSegments = [
    [-halfDepth, 76],
    [92, halfDepth]
  ];
  const specs = [
    ...southSegments.map(([start, end]) => ({
      position: [(start + end) / 2, 1.4, halfDepth],
      size: [end - start, 2.8, 1.2]
    })),
    ...northSegments.map(([start, end]) => ({
      position: [(start + end) / 2, 1.4, -halfDepth],
      size: [end - start, 2.8, 1.2]
    })),
    { position: [-halfWidth, 1.4, 0], size: [1.2, 2.8, sitePlan.depth] },
    ...eastSegments.map(([start, end]) => ({
      position: [halfWidth, 1.4, (start + end) / 2],
      size: [1.2, 2.8, end - start]
    }))
  ];

  specs.forEach((spec) => {
    const fence = new THREE.Mesh(new THREE.BoxGeometry(...spec.size), sharedMaterials.fence);
    fence.position.set(...spec.position);
    fence.castShadow = true;
    scene.add(fence);
  });
}

function buildAccessOverlay() {
  accessRoutes.forEach((route) => {
    const routeMaterial = new THREE.MeshBasicMaterial({
      color: route.color,
      transparent: true,
      opacity: route.kind === 'pedestrian' ? 0.86 : 0.74,
      depthWrite: false,
      depthTest: true,
      fog: false,
      polygonOffset: true,
      polygonOffsetFactor: -3
    });

    route.segments.forEach((segment) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...segment.size), routeMaterial);
      mesh.position.set(...segment.position);
      mesh.renderOrder = 8;
      accessOverlayGroup.add(mesh);
    });

    route.arrows.forEach((arrow) => {
      const mesh = createFlatArrow(route.color, 0.96, route.kind === 'pedestrian' ? 1.15 : 1.38);
      mesh.position.set(...arrow.position);
      mesh.rotation.y = getDirectionAngle(arrow.direction);
      mesh.renderOrder = 9;
      accessOverlayGroup.add(mesh);
    });
  });

  accessPoints.forEach((point) => addAccessPointLabel(point));
}

function addAccessPointLabel(point) {
  const element = document.createElement('div');
  element.className = `access-label ${point.kind}`;
  element.style.setProperty('--access-color', accessRouteLegend.find((item) => item.kind === point.kind)?.color ?? '#d66638');
  element.textContent = point.name;

  const label = new CSS2DObject(element);
  label.position.set(...point.labelPosition);
  accessOverlayGroup.add(label);
}

function addTypologyDetails(group, facility) {
  if (facility.id === 'broadcast-theatre') {
    addTheatreBroadcastDetails(group, facility);
  }

  if (facility.id === 'public-forum') {
    addForumPublicDetails(group, facility);
  }

  if (facility.id === 'creative-hub') {
    addCreativeHubProductionDetails(group, facility);
  }

  if (facility.category === 'stage' && facility.id !== 'backlot-water') {
    addStageTechnicalDetails(group, facility);
  }

  if (facility.id === 'wardrobe-support') {
    addWardrobeSupportDetails(group, facility);
  }

  if (facility.id === 'workshop-warehouse') {
    addWorkshopIndustrialDetails(group, facility);
  }

  if (facility.id === 'backlot-water') {
    addBacklotSetDetails(group, facility);
  }
}

function buildFacilities() {
  facilities.forEach((facility) => {
    const group = new THREE.Group();
    group.name = facility.name;

    facility.blocks.forEach((block, index) => {
      const mesh = createFacilityBlock(facility, block, index);
      group.add(mesh);
      addContactShadow(group, block);
      addEdges(mesh, facility.id);
      addArchitecturalDetails(group, facility, block);

      if (['warehouse', 'workshop', 'dock'].includes(block.kind)) {
        addRollerDoors(group, block, facility);
      }

      if (facility.id === 'broadcast-theatre') {
        addTheatreAccents(group, facility, block);
      }
    });

    addPublicBuildingArchitecture(group, facility);
    addTypologyDetails(group, facility);
    addLabel(facility);
    scene.add(group);
  });
}

function createFacilityBlock(facility, block, index) {
  const color = block.color ?? facility.color;
  const isGreenScreen = block.kind?.startsWith('greenScreen');
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: isGreenScreen ? 0.94 : facility.category === 'stage' ? 0.62 : 0.78,
    metalness: isGreenScreen ? 0 : block.shape === 'cylinder' ? 0.08 : 0.03,
    map: block.shape === 'cylinder' || isGreenScreen ? null : createNoiseTexture(color, '#6c6b64', facility.category === 'stage' ? 0.08 : 0.13),
    emissive: new THREE.Color(isGreenScreen ? color : facility.accent),
    emissiveIntensity: isGreenScreen ? 0.025 : 0
  });

  const geometry = block.shape === 'cylinder'
    ? new THREE.CylinderGeometry(block.radius, block.radius, block.height, 48)
    : new THREE.BoxGeometry(...block.size);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...block.position);
  mesh.castShadow = !['backlotPad', 'greenScreenDeck', 'plaza', 'lawn', 'parking'].includes(block.kind);
  mesh.receiveShadow = true;
  mesh.userData.facilityId = facility.id;
  mesh.userData.blockIndex = index;

  if (!facilityMeshes.has(facility.id)) {
    facilityMeshes.set(facility.id, []);
  }
  facilityMeshes.get(facility.id).push(mesh);
  return mesh;
}

function addContactShadow(group, block) {
  if (!block.size || block.shape === 'cylinder' || ['backlotPad', 'greenScreenDeck', 'greenScreenWall', 'plaza', 'lawn', 'parking', 'canopy'].includes(block.kind)) {
    return;
  }

  const [width, , depth] = block.size;
  const [x, , z] = block.position;
  const shadow = new THREE.Mesh(
    new THREE.BoxGeometry(width + 3.2, 0.04, depth + 3.2),
    sharedMaterials.contactShadow.clone()
  );
  shadow.position.set(x + 1.3, 0.16, z + 1.3);
  shadow.renderOrder = -1;
  group.add(shadow);
}

function addArchitecturalDetails(group, facility, block) {
  if (!block.size || block.shape === 'cylinder' || ['backlotPad', 'greenScreenDeck', 'greenScreenWall', 'plaza', 'lawn', 'parking'].includes(block.kind)) {
    return;
  }

  if (!shouldSkipGenericRoofCap(facility, block)) {
    addRoofCap(group, facility, block);
  }

  if (block.kind === 'stage') {
    addHighBayDoor(group, facility, block, Math.min(block.size[0] * 0.34, 16), block.size[1] * 0.46);
    addRoofPlant(group, block, 3);
  }

  if (['office', 'post', 'control', 'lobby', 'exhibition', 'hospitality'].includes(block.kind)) {
    addWindowBand(group, facility, block);
  }

  if (['warehouse', 'workshop', 'supportAnnex', 'support'].includes(block.kind)) {
    addRoofPlant(group, block, block.kind === 'warehouse' ? 4 : 2);
  }
}

function shouldSkipGenericRoofCap(facility, _block) {
  return facility.id === 'creative-hub';
}

function addPublicBuildingArchitecture(group, facility) {
  if (facility.id === 'broadcast-theatre') {
    addTheatreCivicArchitecture(group, facility);
  }

  if (facility.id === 'public-forum') {
    addForumCivicArchitecture(group, facility);
  }

  if (facility.id === 'creative-hub') {
    addCreativeHubClientArchitecture(group, facility);
  }

  if (facility.id === 'public-realm') {
    addPublicRealmFurnishings(group, facility);
  }
}

function addTheatreCivicArchitecture(group, facility) {
  const stone = sharedMaterials.publicStone.clone();
  const roof = sharedMaterials.civicRoof.clone();
  const bronze = sharedMaterials.bronze.clone();
  const glass = sharedMaterials.glass.clone();
  glass.color = new THREE.Color('#1f3438');

  addWedgeRoof(group, [-112, 20.8, 42], [58, 5.2, 38], roof, {
    slopeAxis: 'z',
    highAt: 'positive',
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-112, 17.25, 58.7], [53, 1.2, 1.1], bronze.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-84.7, 13.6, 42], [0.58, 12.4, 29], sharedMaterials.darkMetal.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-139.3, 13.6, 42], [0.58, 12.4, 29], sharedMaterials.darkMetal.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  addArchitecturalBox(group, [-112, 9.1, 85.35], [56, 6.4, 0.34], glass, { facilityId: facility.id });
  addFacadeMullions(group, {
    xStart: -138,
    xEnd: -86,
    z: 85.62,
    y: 9.1,
    height: 6.6,
    spacing: 6.5,
    material: bronze.clone(),
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-143.2, 6.7, 72], [0.38, 5.6, 22], glass.clone(), { facilityId: facility.id });
  addArchitecturalBox(group, [-124, 8.95, 72], [16, 0.52, 2.4], glass.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-102, 8.95, 72], [16, 0.52, 2.4], glass.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-112, 9.18, 78.4], [44, 0.3, 0.7], bronze.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  addWedgeRoof(group, [-112, 10.3, 92.1], [76, 1.35, 12], stone.clone(), {
    slopeAxis: 'z',
    highAt: 'negative',
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-112, 10.8, 87.8], [66, 0.42, 3.1], bronze.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  for (let x = -140; x <= -84; x += 8) {
    addColumn(group, [x, 4.85, 89.2], 0.5, 8.7, sharedMaterials.publicStone.clone());
  }

  for (let x = -128; x <= -96; x += 8) {
    addArchitecturalBox(group, [x, 20, 5.25], [1.1, 32, 0.58], bronze.clone(), {
      castShadow: true,
      facilityId: facility.id
    });
  }

  for (let z = -13; z <= 2; z += 5) {
    addArchitecturalBox(group, [-92.65, 20, z], [0.58, 30, 1], bronze.clone(), {
      castShadow: true,
      facilityId: facility.id
    });
  }

  addArchitecturalBox(group, [-132.5, 19.2, -5], [1.2, 35.2, 24], sharedMaterials.darkMetal.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-112, 39.35, -5], [36, 1.05, 24], stone.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addWedgeRoof(group, [-112, 41.45, -5], [26, 2.6, 18], roof.clone(), {
    slopeAxis: 'x',
    highAt: 'positive',
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-112, 13.5, 25.4], [34, 7, 0.5], sharedMaterials.darkMetal.clone(), {
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-136, 8.8, 4], [10.5, 1.1, 42], sharedMaterials.civicRoof.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  addArchitecturalBox(group, [-112, 0.32, 91.5], [58, 0.28, 8], sharedMaterials.paver.clone());
  addArchitecturalBox(group, [-112, 0.58, 87], [50, 0.32, 2], sharedMaterials.publicStone.clone());
}

function addForumCivicArchitecture(group, facility) {
  const glass = sharedMaterials.glass.clone();
  glass.color = new THREE.Color('#21383c');
  const timber = sharedMaterials.timber.clone();

  addSawtoothRoof(group, facility, {
    startX: -79,
    bayWidth: 11.2,
    count: 5,
    centerY: 11.7,
    centerZ: 70,
    depth: 28
  });

  addArchitecturalBox(group, [-24.5, 8.9, 73], [7.5, 8.6, 25], glass.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-52, 5.9, 83.35], [47, 5.4, 0.3], glass.clone(), { facilityId: facility.id });
  addFacadeMullions(group, {
    xStart: -75,
    xEnd: -31,
    z: 83.62,
    y: 5.9,
    height: 5.6,
    spacing: 5.5,
    material: sharedMaterials.bronze.clone(),
    facilityId: facility.id
  });

  addArchitecturalBox(group, [-7, 5.1, 85.25], [26, 4.8, 0.3], glass.clone(), { facilityId: facility.id });
  addWedgeRoof(group, [-6.5, 9.35, 78.2], [38, 2.4, 22], timber, {
    slopeAxis: 'z',
    highAt: 'negative',
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-6.5, 0.52, 87.5], [42, 0.42, 11], sharedMaterials.paver.clone());
  addRailing(group, [-6.5, 2.1, 91.6], [38, 3.1, 0.28], facility.id);

  for (let x = -22; x <= 10; x += 6.5) {
    addColumn(group, [x, 4.8, 88.5], 0.34, 7.8, sharedMaterials.timber.clone());
  }

  for (let x = -86; x <= -20; x += 8) {
    addArchitecturalBox(group, [x, 7.8, 91.6], [0.42, 3.8, 7.5], sharedMaterials.bronze.clone(), {
      castShadow: true,
      facilityId: facility.id
    });
  }

  addArchitecturalBox(group, [-34, 0.42, 89.8], [46, 0.42, 9], sharedMaterials.paver.clone());
  addPlanter(group, [-62, 0.75, 87], [8, 1.1, 2.4]);
  addPlanter(group, [-18, 0.75, 88], [7, 1.1, 2.4]);
}

function addCreativeHubClientArchitecture(group, facility) {
  const blocks = Object.fromEntries(facility.blocks.map((block) => [block.kind, block]));
  const base = blocks.studioBase;
  const artistFloors = blocks.artistFloors;
  const vfxWing = blocks.vfxWing;
  const reviewCrown = blocks.reviewCrown;
  const atrium = blocks.atrium;
  const glass = sharedMaterials.glass.clone();
  glass.color = new THREE.Color('#1d3034');
  const clearGlass = sharedMaterials.glass.clone();
  clearGlass.color = new THREE.Color('#24484b');
  const bronze = sharedMaterials.bronze.clone();
  const timber = sharedMaterials.timber.clone();
  const paver = sharedMaterials.paver.clone();
  const roof = sharedMaterials.civicRoof.clone();
  const darkMetal = sharedMaterials.darkMetal.clone();

  const baseTop = base.position[1] + base.size[1] / 2;
  const baseSouth = base.position[2] + base.size[2] / 2;
  const baseNorth = base.position[2] - base.size[2] / 2;
  const artistSouth = artistFloors.position[2] + artistFloors.size[2] / 2;
  const artistNorth = artistFloors.position[2] - artistFloors.size[2] / 2;
  const artistTop = artistFloors.position[1] + artistFloors.size[1] / 2;
  const vfxTop = vfxWing.position[1] + vfxWing.size[1] / 2;
  const reviewTop = reviewCrown.position[1] + reviewCrown.size[1] / 2;
  const reviewSouth = reviewCrown.position[2] + reviewCrown.size[2] / 2;

  const roofSlabs = [
    { position: [-46.5, artistTop + 0.12, artistFloors.position[2]], size: [22, 0.32, 19.6] },
    { position: [-66.5, artistTop + 0.12, 48.7], size: [11, 0.32, 2.4] },
    { position: [-30.6, vfxTop + 0.12, vfxWing.position[2]], size: [4.8, 0.32, 15.2] },
    { position: [vfxWing.position[0], vfxTop + 0.12, 26.75], size: [14.2, 0.32, 2.1] },
    { position: [reviewCrown.position[0], reviewTop + 0.12, reviewCrown.position[2]], size: [17.2, 0.32, 15.4] }
  ];
  roofSlabs.forEach((slab) => {
    addCreativeHubRoofSlab(group, slab.position, slab.size, roof.clone(), facility.id);
    addCreativeHubParapet(group, slab.position, slab.size, darkMetal.clone(), facility.id);
  });

  addArchitecturalBox(group, [base.position[0], baseTop + 0.18, baseSouth + 0.45], [52, 0.28, 3.1], paver, {
    castShadow: true,
    facilityId: facility.id
  });
  addCreativeHubParapet(group, [base.position[0], baseTop + 0.18, baseSouth + 0.45], [52, 0.28, 3.1], darkMetal.clone(), facility.id, 0.36);
  addRailing(group, [base.position[0] - 1, baseTop + 1.25, baseSouth + 1.95], [48, 2.4, 0.24], facility.id);
  addPlanter(group, [-76, baseTop + 0.62, baseSouth + 1.1], [5.6, 0.9, 1.5]);
  addPlanter(group, [-42, baseTop + 0.62, baseSouth + 1.1], [5.6, 0.9, 1.5]);

  const terraceBeamPositions = [];
  for (let x = -79; x <= -35; x += 8.8) {
    terraceBeamPositions.push([x, baseTop - 0.07, baseSouth + 0.5]);
  }
  addBoxInstances(group, [0.34, 0.34, 3.25], terraceBeamPositions, darkMetal.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  addArchitecturalBox(group, [base.position[0], 3.55, baseSouth + 1.35], [45, 0.5, 2.2], timber.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addBoxInstances(
    group,
    [0.28, 3.15, 0.28],
    [-77, -67, -57, -47, -37].map((x) => [x, 1.86, baseSouth + 2.28]),
    bronze.clone(),
    {
      castShadow: true,
      facilityId: facility.id
    }
  );
  addArchitecturalBox(group, [base.position[0], 5.7, baseSouth + 0.22], [40, 5.6, 0.36], glass.clone(), {
    facilityId: facility.id
  });
  addFacadeMullions(group, {
    xStart: -78,
    xEnd: -36,
    z: baseSouth + 0.46,
    y: 5.7,
    height: 5.8,
    spacing: 5.25,
    material: bronze.clone(),
    facilityId: facility.id
  });
  addCreativeHubFloorBands(group, facility.id, base, 'south', [3.45, 6.75, 10.05], darkMetal.clone());
  addCreativeHubFloorBands(group, facility.id, base, 'east', [3.45, 6.75, 10.05], darkMetal.clone());

  addArchitecturalBox(group, [atrium.position[0], 8.8, baseSouth + 0.58], [8.2, 13.2, 0.36], clearGlass, {
    castShadow: true,
    facilityId: facility.id
  });
  addArchitecturalBox(group, [atrium.position[0] - atrium.size[0] / 2 - 0.18, 8.8, atrium.position[2]], [0.36, 12.4, 11.6], clearGlass.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addBoxInstances(
    group,
    [0.24, 14.8, 0.34],
    [-82.7, -79.5, -76.3].map((x) => [x, 8.15, baseSouth + 0.84]),
    bronze.clone(),
    {
      castShadow: true,
      facilityId: facility.id
    }
  );
  for (let y = 4.2; y <= 13.6; y += 3.1) {
    addArchitecturalBox(group, [atrium.position[0], y, baseSouth + 0.82], [8.5, 0.18, 0.34], bronze.clone(), {
      facilityId: facility.id
    });
  }

  addCreativeHubWindowBands(group, facility.id, artistFloors, {
    z: artistSouth + 0.22,
    width: artistFloors.size[0] * 0.78,
    material: glass.clone(),
    trim: bronze.clone()
  });
  addCreativeHubWindowBands(group, facility.id, artistFloors, {
    z: artistNorth - 0.22,
    width: artistFloors.size[0] * 0.64,
    material: glass.clone(),
    trim: bronze.clone()
  });

  const finPositions = [];
  for (let x = artistFloors.position[0] - artistFloors.size[0] * 0.42; x <= artistFloors.position[0] + artistFloors.size[0] * 0.42; x += 6.4) {
    finPositions.push([x, artistFloors.position[1], artistSouth + 0.48]);
  }
  addBoxInstances(group, [0.36, artistFloors.size[1] * 0.78, 1.1], finPositions, bronze.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addCreativeHubFloorBands(group, facility.id, artistFloors, 'south', [16.05, 19.95, 23.85, 27.75], darkMetal.clone());
  addCreativeHubFloorBands(group, facility.id, artistFloors, 'west', [16.05, 19.95, 23.85, 27.75], darkMetal.clone());

  addArchitecturalBox(group, [reviewCrown.position[0], reviewCrown.position[1] - 0.2, reviewSouth + 0.22], [reviewCrown.size[0] * 0.78, 3.6, 0.34], glass.clone(), {
    facilityId: facility.id
  });
  addCreativeHubFloorBands(group, facility.id, reviewCrown, 'south', [34.25, 36.2], bronze.clone());

  addArchitecturalBox(group, [vfxWing.position[0], vfxWing.position[1] + 1.2, vfxWing.position[2] + vfxWing.size[2] / 2 + 0.22], [vfxWing.size[0] * 0.72, 4.4, 0.34], glass.clone(), {
    facilityId: facility.id
  });
  addArchitecturalBox(group, [vfxWing.position[0] + vfxWing.size[0] / 2 + 0.18, vfxWing.position[1], vfxWing.position[2]], [0.34, vfxWing.size[1] * 0.76, vfxWing.size[2] * 0.65], sharedMaterials.darkMetal.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addCreativeHubFloorBands(group, facility.id, vfxWing, 'south', [17.25, 21.45, 25.05], bronze.clone());
  addCreativeHubFloorBands(group, facility.id, vfxWing, 'east', [17.25, 21.45, 25.05], bronze.clone());

  addArchitecturalBox(group, [-61.5, baseTop + 0.28, baseNorth + 1.8], [20, 0.32, 4.2], paver.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addCreativeHubParapet(group, [-61.5, baseTop + 0.28, baseNorth + 1.8], [20, 0.32, 4.2], darkMetal.clone(), facility.id, 0.34);
  addPlanter(group, [-70, baseTop + 0.75, baseNorth + 2.1], [5.2, 0.9, 1.5]);
  addPlanter(group, [-52, baseTop + 0.75, baseNorth + 2.1], [5.2, 0.9, 1.5]);

  const roofPlant = sharedMaterials.zinc.clone();
  addBoxInstances(
    group,
    [3.5, 0.85, 2.1],
    [
      [artistFloors.position[0] - 8, artistTop + 0.56, artistFloors.position[2] - 4],
      [artistFloors.position[0], artistTop + 0.56, artistFloors.position[2] + 4],
      [artistFloors.position[0] + 8, artistTop + 0.56, artistFloors.position[2] - 2]
    ],
    roofPlant,
    {
      castShadow: true,
      facilityId: facility.id
    }
  );
}

function addPublicRealmFurnishings(group) {
  const benchMaterial = new THREE.MeshStandardMaterial({ color: '#6f5e4c', roughness: 0.72 });
  const screenPanel = createEmissiveStandardMaterial('#f86f8f', 0.36, {
    surfaceColor: '#2c3432',
    roughness: 0.5
  });

  addPublicRealmSurfaceInlays(group, 'public-realm');
  publicRealmDesign.lowPlanting.forEach((bed) => addLowPlantingBed(group, bed, 'public-realm'));
  publicRealmDesign.seating.forEach((seat) => {
    addArchitecturalBox(group, seat.position, seat.size, benchMaterial.clone(), {
      castShadow: true,
      rotation: seat.rotation,
      facilityId: 'public-realm'
    });
  });
  publicRealmDesign.shadeCanopies.forEach((canopy) => {
    addShadePavilion(group, canopy.position, canopy.size, 'public-realm');
  });
  addPublicRealmBollardLights(group, 'public-realm');

  for (let index = 0; index < 4; index += 1) {
    addArchitecturalBox(group, [62, 0.7 + index * 0.3, 78.8 + index * 2.2], [24 - index * 3, 0.38, 1.2], benchMaterial.clone(), {
      castShadow: true,
      facilityId: 'public-realm'
    });
  }
  addArchitecturalBox(group, [77, 3.2, 84], [1.1, 6.4, 14], sharedMaterials.darkMetal.clone(), {
    castShadow: true,
    facilityId: 'public-realm'
  });
  addArchitecturalBox(group, [76.35, 3.2, 84], [0.18, 4.6, 10.4], screenPanel, {
    castShadow: true,
    facilityId: 'public-realm'
  });
  addArchitecturalBox(group, [71.8, 0.62, 84], [7, 0.28, 11.5], sharedMaterials.publicStone.clone(), {
    castShadow: true,
    facilityId: 'public-realm'
  });
}

function addPublicRealmSurfaceInlays(group, facilityId) {
  publicRealmDesign.raisedInlays.forEach((inlay) => {
    const material = new THREE.MeshStandardMaterial({ color: inlay.color, roughness: 0.72, metalness: 0.03 });
    addArchitecturalBox(group, inlay.position, inlay.size, material, {
      castShadow: false,
      facilityId
    });
  });

  const ribMaterial = new THREE.MeshStandardMaterial({ color: '#b3aa9c', roughness: 0.88, metalness: 0.01 });
  addBoxInstances(
    group,
    [1, 1, 1],
    publicRealmDesign.plazaRibs.map((rib) => ({
      position: rib.position,
      scale: rib.size
    })),
    ribMaterial,
    {
      castShadow: false,
      facilityId
    }
  );
}

function addLowPlantingBed(group, bed, facilityId) {
  const planterMaterial = sharedMaterials.publicStone.clone();
  const mulchMaterial = new THREE.MeshStandardMaterial({ color: '#514636', roughness: 0.96 });
  const plantingMaterial = new THREE.MeshStandardMaterial({ color: bed.color, roughness: 0.94 });
  const [width, height, depth] = bed.size;
  const [x, y, z] = bed.position;
  const topY = y + height / 2;

  addArchitecturalBox(group, bed.position, bed.size, planterMaterial, {
    castShadow: true,
    facilityId
  });
  addArchitecturalBox(group, [x, topY + 0.07, z], [width - 0.55, 0.1, depth - 0.38], mulchMaterial, {
    castShadow: false,
    facilityId
  });

  const tuftPositions = [];
  const tuftCount = Math.max(3, Math.floor(width / 2.6));
  for (let index = 0; index < tuftCount; index += 1) {
    const t = tuftCount === 1 ? 0 : index / (tuftCount - 1);
    const offsetX = -width * 0.38 + width * 0.76 * t;
    const offsetZ = index % 2 === 0 ? -depth * 0.18 : depth * 0.16;
    tuftPositions.push([x + offsetX, topY + 0.43, z + offsetZ]);
  }
  addCylinderInstances(group, new THREE.ConeGeometry(0.26, 0.72, 7), tuftPositions, plantingMaterial, {
    castShadow: false,
    receiveShadow: true,
    facilityId
  });
}

function addPublicRealmBollardLights(group, facilityId) {
  const postMaterial = sharedMaterials.darkMetal.clone();
  const lensMaterial = trackAtmosphereMaterial(
    createEmissiveStandardMaterial('#ffd98a', 1.15, { surfaceColor: '#fff0c8', roughness: 0.38 }),
    { emissiveBase: 0.98, emissiveRange: 0.18, speed: 1.05, phase: 0.9 }
  );

  addCylinderInstances(
    group,
    new THREE.CylinderGeometry(0.11, 0.13, 1.15, 10),
    publicRealmDesign.bollardLights,
    postMaterial,
    {
      castShadow: true,
      receiveShadow: true,
      facilityId
    }
  );

  addCylinderInstances(
    group,
    new THREE.SphereGeometry(0.18, 10, 8),
    publicRealmDesign.bollardLights.map(([x, y, z]) => [x, y + 0.68, z]),
    lensMaterial,
    {
      castShadow: false,
      receiveShadow: false,
      facilityId
    }
  );
}

function addTheatreBroadcastDetails(group, facility) {
  const bronze = sharedMaterials.bronze.clone();
  const steel = sharedMaterials.serviceSteel.clone();
  const glass = sharedMaterials.glass.clone();
  glass.color = new THREE.Color('#20373a');

  addArchitecturalBox(group, [-112, 11.7, 87.05], [31, 0.42, 0.55], bronze, {
    castShadow: true,
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-112, 12.45, 86.7], [24, 0.52, 0.5], sharedMaterials.darkMetal.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  const mullionPositions = [];
  for (let x = -139; x <= -85; x += 9) {
    mullionPositions.push([x, 7.25, 85.95]);
  }
  addBoxInstances(group, [0.34, 6.2, 0.54], mullionPositions, bronze.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  const flyBands = [];
  for (let y = 11; y <= 33; y += 5.4) {
    flyBands.push([-92.15, y, -5]);
    flyBands.push([-131.85, y, -5]);
  }
  addBoxInstances(group, [0.34, 0.42, 19], flyBands, steel.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  addArchitecturalBox(group, [-136, 5.5, 23.35], [10.5, 5.8, 0.32], sharedMaterials.darkMetal.clone(), {
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-137.6, 6.8, 24.25], [7.4, 0.36, 2.8], sharedMaterials.civicRoof.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  addRailing(group, [-112, 41.2, 7.4], [32, 2.2, 0.24], facility.id);
  addArchitecturalBox(group, [-112, 40.7, 7.4], [30, 0.22, 0.55], steel.clone(), {
    facilityId: facility.id
  });

  addArchitecturalBox(group, [-145.2, 7.4, 72], [0.35, 4.4, 18], glass, {
    facilityId: facility.id
  });
}

function addForumPublicDetails(group, facility) {
  const timber = sharedMaterials.timber.clone();
  const bronze = sharedMaterials.bronze.clone();
  const glass = sharedMaterials.glass.clone();
  glass.color = new THREE.Color('#203a3d');

  addArchitecturalBox(group, [-52, 8.45, 84.45], [34, 0.36, 0.54], bronze, {
    castShadow: true,
    facilityId: facility.id
  });

  const entryPosts = [];
  for (let x = -73; x <= -31; x += 7) {
    entryPosts.push([x, 4.8, 84.15]);
  }
  addBoxInstances(group, [0.42, 5.2, 0.42], entryPosts, timber.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  const canopyRibs = [];
  for (let x = -75; x <= 7; x += 8) {
    canopyRibs.push([x, 9.15, 92.85]);
  }
  addBoxInstances(group, [0.42, 1.2, 5.8], canopyRibs, timber.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  addArchitecturalBox(group, [-4, 7.85, 66.9], [22, 2.8, 0.3], glass, {
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-22, 2.8, 90.9], [7.5, 3.8, 0.36], sharedMaterials.darkMetal.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-22, 5.1, 91.2], [9, 0.36, 2], sharedMaterials.civicRoof.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
}

function addCreativeHubProductionDetails(group, facility) {
  const blocks = Object.fromEntries(facility.blocks.map((block) => [block.kind, block]));
  const base = blocks.studioBase;
  const artistFloors = blocks.artistFloors;
  const vfxWing = blocks.vfxWing;
  const reviewCrown = blocks.reviewCrown;
  const bronze = sharedMaterials.bronze.clone();
  const glass = sharedMaterials.glass.clone();
  glass.color = new THREE.Color('#1f3438');
  const steel = sharedMaterials.serviceSteel.clone();

  const baseNorth = base.position[2] - base.size[2] / 2;
  const secureDoorZ = baseNorth - 0.22;
  const artistNorth = artistFloors.position[2] - artistFloors.size[2] / 2;

  const northFins = [];
  for (let x = artistFloors.position[0] - artistFloors.size[0] * 0.42; x <= artistFloors.position[0] + artistFloors.size[0] * 0.42; x += 6.4) {
    northFins.push([x, artistFloors.position[1], artistNorth - 0.48]);
  }
  addBoxInstances(group, [0.32, artistFloors.size[1] * 0.72, 0.9], northFins, bronze.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  addArchitecturalBox(group, [base.position[0] - 2, 5.8, secureDoorZ], [34, 5.2, 0.34], glass, {
    facilityId: facility.id
  });
  addArchitecturalBox(group, [base.position[0] - 2, 8.7, baseNorth - 0.65], [38, 0.42, 1.8], sharedMaterials.civicRoof.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addArchitecturalBox(group, [-56.5, 2.3, baseNorth - 0.18], [9.4, 4.4, 0.32], sharedMaterials.darkMetal.clone(), {
    facilityId: facility.id
  });

  const editSuiteSlits = [];
  for (let z = vfxWing.position[2] - 5; z <= vfxWing.position[2] + 5; z += 3.4) {
    editSuiteSlits.push([vfxWing.position[0] + vfxWing.size[0] / 2 + 0.38, vfxWing.position[1] + 1.2, z]);
  }
  addBoxInstances(group, [0.32, 3.8, 1.15], editSuiteSlits, glass.clone(), {
    facilityId: facility.id
  });

  addArchitecturalBox(group, [vfxWing.position[0], vfxWing.position[1] + vfxWing.size[1] / 2 + 1.1, vfxWing.position[2] - 7.15], [11.2, 1.55, 1.35], steel.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addBoxInstances(
    group,
    [0.22, 1.35, 0.28],
    [-40.6, -37.6, -34.6, -31.6].map((x) => [x, vfxWing.position[1] + vfxWing.size[1] / 2 + 1.12, vfxWing.position[2] - 6.36]),
    sharedMaterials.darkMetal.clone(),
    {
      castShadow: true,
      facilityId: facility.id
    }
  );

  addArchitecturalBox(group, [reviewCrown.position[0], reviewCrown.position[1] - 0.2, reviewCrown.position[2] - reviewCrown.size[2] / 2 - 0.22], [reviewCrown.size[0] * 0.72, 3.1, 0.34], glass.clone(), {
    facilityId: facility.id
  });
  addRailing(group, [reviewCrown.position[0], reviewCrown.position[1] - 4.0, reviewCrown.position[2] - reviewCrown.size[2] / 2 - 0.1], [17, 2.1, 0.24], facility.id);
}

function addCreativeHubRoofSlab(group, position, size, material, facilityId) {
  return addArchitecturalBox(group, position, size, material, {
    castShadow: true,
    facilityId
  });
}

function addCreativeHubParapet(group, position, size, material, facilityId, height = 0.58) {
  const [width, slabHeight, depth] = size;
  const [x, y, z] = position;
  const parapetY = y + slabHeight / 2 + height / 2 - 0.08;
  const edge = 0.34;
  const specs = [
    { position: [x, parapetY, z - depth / 2 + edge / 2], size: [width, height, edge] },
    { position: [x, parapetY, z + depth / 2 - edge / 2], size: [width, height, edge] },
    { position: [x - width / 2 + edge / 2, parapetY, z], size: [edge, height, depth] },
    { position: [x + width / 2 - edge / 2, parapetY, z], size: [edge, height, depth] }
  ];
  specs.forEach((spec) => {
    addArchitecturalBox(group, spec.position, spec.size, material.clone(), {
      castShadow: true,
      facilityId
    });
  });
}

function addCreativeHubFloorBands(group, facilityId, block, face, heights, material) {
  const [width, , depth] = block.size;
  const [x, , z] = block.position;
  const south = z + depth / 2;
  const north = z - depth / 2;
  const east = x + width / 2;
  const west = x - width / 2;

  heights.forEach((height) => {
    if (face === 'south') {
      addArchitecturalBox(group, [x, height, south + 0.12], [width * 0.9, 0.16, 0.28], material.clone(), {
        castShadow: true,
        facilityId
      });
    }

    if (face === 'north') {
      addArchitecturalBox(group, [x, height, north - 0.12], [width * 0.9, 0.16, 0.28], material.clone(), {
        castShadow: true,
        facilityId
      });
    }

    if (face === 'east') {
      addArchitecturalBox(group, [east + 0.12, height, z], [0.28, 0.16, depth * 0.82], material.clone(), {
        castShadow: true,
        facilityId
      });
    }

    if (face === 'west') {
      addArchitecturalBox(group, [west - 0.12, height, z], [0.28, 0.16, depth * 0.82], material.clone(), {
        castShadow: true,
        facilityId
      });
    }
  });
}

function addCreativeHubWindowBands(group, facilityId, block, spec) {
  const floorYs = [
    block.position[1] - block.size[1] * 0.31,
    block.position[1] - block.size[1] * 0.09,
    block.position[1] + block.size[1] * 0.13,
    block.position[1] + block.size[1] * 0.35
  ];

  floorYs.forEach((y) => {
    addArchitecturalBox(group, [block.position[0], y, spec.z], [spec.width, 2.35, 0.3], spec.material.clone(), {
      facilityId
    });
    addArchitecturalBox(group, [block.position[0], y + 1.35, spec.z + Math.sign(spec.z - block.position[2]) * 0.04], [spec.width + 1.6, 0.16, 0.34], spec.trim.clone(), {
      castShadow: true,
      facilityId
    });
  });
}

function addStageTechnicalDetails(group, facility) {
  facility.blocks
    .filter((block) => block.kind === 'stage')
    .forEach((block) => {
      addStageAcousticEnvelope(group, facility, block);
      addStageRoofAccess(group, facility, block);
      addStageEgressAndServices(group, facility, block);
    });
}

function addStageAcousticEnvelope(group, facility, block) {
  const [width, height, depth] = block.size;
  const [x, y, z] = block.position;
  const panelMaterial = sharedMaterials.acousticPanel.clone();
  const trimMaterial = sharedMaterials.serviceSteel.clone();
  const frontBackPositions = [];
  const sidePositions = [];

  for (let offset = -width * 0.42; offset <= width * 0.42; offset += 7.5) {
    frontBackPositions.push([x + offset, y + height * 0.02, z + depth / 2 + 0.24]);
    frontBackPositions.push([x + offset, y + height * 0.02, z - depth / 2 - 0.24]);
  }

  for (let offset = -depth * 0.36; offset <= depth * 0.36; offset += 8.5) {
    sidePositions.push([x - width / 2 - 0.24, y + height * 0.02, z + offset]);
    sidePositions.push([x + width / 2 + 0.24, y + height * 0.02, z + offset]);
  }

  addBoxInstances(group, [0.28, height * 0.72, 0.32], frontBackPositions, panelMaterial.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addBoxInstances(group, [0.32, height * 0.64, 0.28], sidePositions, panelMaterial.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  const upperBandY = y + height * 0.36;
  const lowerBandY = y - height * 0.16;
  addArchitecturalBox(group, [x, upperBandY, z + depth / 2 + 0.27], [width * 0.86, 0.36, 0.34], trimMaterial.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addArchitecturalBox(group, [x, lowerBandY, z + depth / 2 + 0.28], [width * 0.74, 0.28, 0.32], trimMaterial.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
}

function addStageRoofAccess(group, facility, block) {
  const [width, height, depth] = block.size;
  const [x, y, z] = block.position;
  const roofY = y + height / 2 + 1.05;
  const steel = sharedMaterials.serviceSteel.clone();

  addRailing(group, [x, roofY, z - depth * 0.38], [width * 0.7, 1.7, 0.22], facility.id);
  addArchitecturalBox(group, [x - width * 0.26, roofY - 0.55, z - depth * 0.38], [6.2, 0.22, 1.1], steel.clone(), {
    facilityId: facility.id
  });
  addArchitecturalBox(group, [x + width * 0.26, roofY - 0.55, z - depth * 0.38], [6.2, 0.22, 1.1], steel.clone(), {
    facilityId: facility.id
  });

  for (let index = 0; index < 2; index += 1) {
    const offsetX = index === 0 ? -width * 0.18 : width * 0.18;
    const stack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.72, 3.2, 12),
      sharedMaterials.zinc.clone()
    );
    stack.position.set(x + offsetX, y + height / 2 + 2.05, z - depth * 0.12);
    stack.castShadow = true;
    group.add(stack);
  }
}

function addStageEgressAndServices(group, facility, block) {
  const [width, height, depth] = block.size;
  const [x, y, z] = block.position;
  const side = getStageStairSide(facility.id);
  const dockFace = getStageDockFace(facility.id);
  const faceSign = dockFace === 'north' ? -1 : 1;
  const faceZ = z + faceSign * depth / 2;
  const stairHeight = Math.min(11, height * 0.56);
  const stairX = x + side * (width / 2 + 1.65);
  const stairZ = z - depth * 0.22;

  addArchitecturalBox(group, [stairX, stairHeight / 2 + 0.12, stairZ], [3.1, stairHeight, 5.4], sharedMaterials.serviceSteel.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  for (let level = 0; level < 3; level += 1) {
    addArchitecturalBox(group, [stairX, 2.3 + level * 2.6, stairZ + 2.98], [3.2, 0.22, 1.15], sharedMaterials.darkMetal.clone(), {
      castShadow: true,
      facilityId: facility.id
    });
  }

  addArchitecturalBox(group, [x, y + height * 0.05, faceZ + faceSign * 1.2], [Math.min(width * 0.58, 31), 0.48, 2.1], sharedMaterials.zinc.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addArchitecturalBox(group, [x, 0.82, faceZ + faceSign * 2.25], [Math.min(width * 0.48, 24), 1.05, 0.32], sharedMaterials.safetyYellow.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
}

function getStageStairSide(facilityId) {
  const leftSideStages = new Set(['sound-stage-02', 'sound-stage-04', 'sound-stage-05']);
  return leftSideStages.has(facilityId) ? -1 : 1;
}

function getStageDockFace(facilityId) {
  const northDockStages = new Set(['mega-stage-01', 'sound-stage-02', 'sound-stage-03', 'sound-stage-04']);
  return northDockStages.has(facilityId) ? 'north' : 'south';
}

function addWardrobeSupportDetails(group, facility) {
  const supportBlock = facility.blocks.find((block) => block.kind === 'support');
  if (!supportBlock) return;

  const [width, height, depth] = supportBlock.size;
  const [x, y, z] = supportBlock.position;
  const doorMaterial = sharedMaterials.darkMetal.clone();
  const canopyMaterial = sharedMaterials.civicRoof.clone();
  const screenMaterial = sharedMaterials.timber.clone();

  addArchitecturalBox(group, [x, y + height * 0.1, z + depth / 2 + 0.78], [width * 0.92, 0.45, 1.55], canopyMaterial, {
    castShadow: true,
    facilityId: facility.id
  });

  const doorPositions = [];
  const windowPositions = [];
  for (let offset = -width * 0.38; offset <= width * 0.38; offset += 8) {
    doorPositions.push([x + offset, y - height * 0.16, z + depth / 2 + 0.16]);
    windowPositions.push([x + offset + 3.2, y + height * 0.16, z + depth / 2 + 0.18]);
  }
  addBoxInstances(group, [3.1, 4.2, 0.28], doorPositions, doorMaterial.clone(), { facilityId: facility.id });
  addBoxInstances(group, [2.4, 1.4, 0.28], windowPositions, sharedMaterials.glass.clone(), { facilityId: facility.id });

  const screenPositions = [];
  for (let offset = -width * 0.42; offset <= width * 0.42; offset += 6.2) {
    screenPositions.push([x + offset, y + height * 0.08, z - depth / 2 - 0.18]);
  }
  addBoxInstances(group, [0.42, 6.4, 0.36], screenPositions, screenMaterial.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  addArchitecturalBox(group, [x - width * 0.42, y + height / 2 + 0.85, z], [7, 0.8, 6.2], sharedMaterials.zinc.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
}

function addWorkshopIndustrialDetails(group, facility) {
  facility.blocks.forEach((block) => {
    if (block.kind === 'warehouse') {
      addWarehouseHighBayDetails(group, facility, block);
    }

    if (block.kind === 'workshop') {
      addPaintShopDetails(group, facility, block);
    }

    if (block.kind === 'dock') {
      addDockSafetyDetails(group, facility, block);
    }
  });
}

function addWarehouseHighBayDetails(group, facility, block) {
  const [width, height, depth] = block.size;
  const [x, y, z] = block.position;
  const cladding = sharedMaterials.zinc.clone();
  const steel = sharedMaterials.serviceSteel.clone();
  const claddingPositions = [];

  for (let offset = -width * 0.42; offset <= width * 0.42; offset += 9) {
    claddingPositions.push([x + offset, y + height * 0.05, z - depth / 2 - 0.22]);
    claddingPositions.push([x + offset, y + height * 0.05, z + depth / 2 + 0.22]);
  }
  addBoxInstances(group, [0.34, height * 0.68, 0.3], claddingPositions, cladding.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  for (let index = 0; index < 4; index += 1) {
    const monitorX = x - width * 0.32 + index * width * 0.21;
    addWedgeRoof(group, [monitorX, y + height / 2 + 1.25, z], [10.5, 2, depth * 0.62], sharedMaterials.zinc.clone(), {
      slopeAxis: 'x',
      highAt: 'positive',
      facilityId: facility.id
    });
    addArchitecturalBox(group, [monitorX - 2.6, y + height / 2 + 1.1, z - depth * 0.29], [4.2, 1.15, 0.24], sharedMaterials.glass.clone(), {
      facilityId: facility.id
    });
  }

  const doorPositions = [];
  const awningPositions = [];
  for (let offset = -width * 0.33; offset <= width * 0.33; offset += 18) {
    doorPositions.push([x + offset, y - height * 0.08, z - depth / 2 - 0.18]);
    awningPositions.push([x + offset, y + 1.35, z - depth / 2 - 0.9]);
  }
  addBoxInstances(group, [7.2, 5.6, 0.3], doorPositions, sharedMaterials.darkMetal.clone(), {
    facilityId: facility.id
  });
  addBoxInstances(group, [8.6, 0.36, 1.7], awningPositions, steel.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
}

function addPaintShopDetails(group, facility, block) {
  const [width, height, depth] = block.size;
  const [x, y, z] = block.position;

  addArchitecturalBox(group, [x, y + height / 2 + 1.05, z], [width * 0.74, 1.4, depth * 0.42], sharedMaterials.zinc.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  const fluePositions = [];
  for (let offset = -width * 0.32; offset <= width * 0.32; offset += 8.5) {
    fluePositions.push([x + offset, y + height / 2 + 3, z - depth * 0.12]);
  }
  addCylinderInstances(group, new THREE.CylinderGeometry(0.42, 0.52, 4.2, 12), fluePositions, sharedMaterials.serviceSteel.clone(), {
    facilityId: facility.id
  });

  addArchitecturalBox(group, [x - width / 2 - 0.18, y, z], [0.32, height * 0.82, depth * 0.7], sharedMaterials.acousticPanel.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
}

function addDockSafetyDetails(group, facility, block) {
  const [width, height, depth] = block.size;
  const [x, y, z] = block.position;

  addArchitecturalBox(group, [x, y + height * 0.1, z + depth / 2 + 0.82], [width * 0.88, 0.42, 1.6], sharedMaterials.zinc.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  for (let offset = -width * 0.3; offset <= width * 0.3; offset += 6.8) {
    addArchitecturalBox(group, [x + offset, y - height * 0.12, z + depth / 2 + 0.18], [4.5, 3.2, 0.3], sharedMaterials.darkMetal.clone(), {
      facilityId: facility.id
    });
    addArchitecturalBox(group, [x + offset, 0.86, z + depth / 2 + 0.6], [4.2, 1, 0.28], sharedMaterials.safetyYellow.clone(), {
      castShadow: true,
      facilityId: facility.id
    });
  }
}

function addBacklotSetDetails(group, facility) {
  const screenFace = new THREE.MeshStandardMaterial({
    color: '#25c85b',
    roughness: 0.96,
    metalness: 0,
    emissive: '#0d5d2d',
    emissiveIntensity: 0.06
  });
  const screenSeam = new THREE.MeshStandardMaterial({
    color: '#16873b',
    roughness: 0.92,
    metalness: 0
  });
  const steel = sharedMaterials.serviceSteel.clone();
  const darkSteel = sharedMaterials.darkMetal.clone();
  const markerPaint = new THREE.MeshStandardMaterial({ color: '#dce7db', roughness: 0.84 });
  const amberPaint = sharedMaterials.safetyYellow.clone();
  const cableMaterial = new THREE.MeshStandardMaterial({ color: '#1d2423', roughness: 0.62, metalness: 0.12 });
  const distroMaterial = new THREE.MeshStandardMaterial({ color: '#263330', roughness: 0.64, metalness: 0.08 });
  const lampMaterial = createEmissiveStandardMaterial('#dff8ff', 1.35, { surfaceColor: '#ecfbff', roughness: 0.36 });

  const westScreen = {
    faceX: -128.86,
    backX: -130.16,
    z: -57,
    depth: 43,
    height: 17.3,
    centerY: 8.65
  };
  const northScreen = {
    faceZ: -78.66,
    backZ: -80.02,
    x: -106.7,
    width: 42.4,
    height: 15.3,
    centerY: 7.65
  };

  const westSeamPositions = [];
  const westPostPositions = [];
  const westBallastPositions = [];
  for (let z = -76; z <= -38; z += 7.6) {
    westSeamPositions.push([westScreen.faceX, westScreen.centerY, z]);
    westPostPositions.push([westScreen.backX, westScreen.centerY, z]);
    westBallastPositions.push([westScreen.backX - 1.28, 0.68, z]);
  }
  addBoxInstances(group, [0.045, westScreen.height - 1.2, 0.08], westSeamPositions, screenSeam.clone(), {
    castShadow: false,
    facilityId: facility.id
  });
  addBoxInstances(group, [0.46, westScreen.height, 0.46], westPostPositions, steel.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addBoxInstances(group, [2.35, 0.86, 1.18], westBallastPositions, darkSteel.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  [5.2, 10.6, 16.4].forEach((y) => {
    addArchitecturalBox(group, [westScreen.backX, y, westScreen.z], [0.38, 0.32, westScreen.depth + 0.8], steel.clone(), {
      castShadow: true,
      facilityId: facility.id
    });
  });

  const northSeamPositions = [];
  const northPostPositions = [];
  const northBallastPositions = [];
  for (let x = -126; x <= -88; x += 7.6) {
    northSeamPositions.push([x, northScreen.centerY, northScreen.faceZ]);
    northPostPositions.push([x, northScreen.centerY, northScreen.backZ]);
    northBallastPositions.push([x, 0.68, northScreen.backZ - 1.22]);
  }
  addBoxInstances(group, [0.08, northScreen.height - 1.2, 0.045], northSeamPositions, screenSeam.clone(), {
    castShadow: false,
    facilityId: facility.id
  });
  addBoxInstances(group, [0.46, northScreen.height, 0.46], northPostPositions, steel.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addBoxInstances(group, [1.34, 0.86, 2.2], northBallastPositions, darkSteel.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  [4.9, 9.9, 14.3].forEach((y) => {
    addArchitecturalBox(group, [northScreen.x, y, northScreen.backZ], [northScreen.width + 0.8, 0.32, 0.38], steel.clone(), {
      castShadow: true,
      facilityId: facility.id
    });
  });

  addArchitecturalBox(group, [-128.74, 8.25, -78.74], [0.34, 16.5, 0.34], screenFace.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  const deckMarkerZs = [-69.2, -59, -48.8].map((z) => [-106.9, surfaceLayers.backlotPaint, z]);
  addBoxInstances(group, [29, 0.025, 0.18], deckMarkerZs, markerPaint.clone(), {
    castShadow: false,
    facilityId: facility.id
  });

  addBoxInstances(group, [0.22, 0.03, 5.4], [-121.8, -108, -94.2].map((x) => [x, surfaceLayers.backlotPaint + 0.01, -43.4]), amberPaint.clone(), {
    castShadow: false,
    facilityId: facility.id
  });

  addArchitecturalBox(group, [-88.5, surfaceLayers.backlotPaint + 0.02, -59], [0.28, 0.045, 24], markerPaint.clone(), {
    castShadow: false,
    facilityId: facility.id
  });

  [
    { position: [-119, surfaceLayers.backlotPaint + 0.045, -36.8], size: [12.5, 0.035, 4.4] },
    { position: [-104, surfaceLayers.backlotPaint + 0.045, -36.8], size: [12.5, 0.035, 4.4] },
    { position: [-96.5, surfaceLayers.backlotPaint + 0.045, -73.7], size: [11.5, 0.035, 3.8] }
  ].forEach((zone, index) => {
    const material = index === 2 ? markerPaint.clone() : amberPaint.clone();
    material.opacity = 0.92;
    addArchitecturalBox(group, zone.position, zone.size, material, {
      castShadow: false,
      facilityId: facility.id
    });
  });

  const craneRing = new THREE.Mesh(
    new THREE.RingGeometry(7.9, 8.18, 56, 1),
    markerPaint.clone()
  );
  craneRing.rotation.x = -Math.PI / 2;
  craneRing.position.set(-109.8, surfaceLayers.backlotPaint + 0.09, -58.2);
  craneRing.renderOrder = 4;
  group.add(craneRing);
  addArchitecturalBox(group, [-109.8, 0.74, -58.2], [4.8, 0.34, 4.8], darkSteel.clone(), {
    castShadow: true,
    facilityId: facility.id
  });
  addColumn(group, [-109.8, 2.2, -58.2], 0.18, 2.9, steel.clone());
  addCylinderBetween(group, [-109.8, 3.55, -58.2], [-103.2, 5.3, -54.1], 0.07, steel.clone());

  [
    { x: -124.2, z: -39.5, arm: 4.8 },
    { x: -92.5, z: -75.4, arm: 4.2 },
    { x: -121.6, z: -73.8, arm: 4.8 }
  ].forEach((tower, index) => {
    addColumn(group, [tower.x, 6.1, tower.z], 0.13, 12.2, steel.clone());
    addArchitecturalBox(group, [tower.x, 12.25, tower.z], [tower.arm, 0.18, 0.18], steel.clone(), {
      castShadow: true,
      facilityId: facility.id
    });
    [-1.25, 0, 1.25].forEach((offset) => {
      addArchitecturalBox(group, [tower.x + offset, 11.9, tower.z + 0.42], [0.58, 0.34, 0.42], lampMaterial, {
        castShadow: false,
        facilityId: facility.id
      });
    });
    if (index !== 1) {
      addCylinderBetween(group, [tower.x - 0.9, 0.8, tower.z], [tower.x, 8.5, tower.z], 0.035, steel.clone());
      addCylinderBetween(group, [tower.x + 0.9, 0.8, tower.z], [tower.x, 8.5, tower.z], 0.035, steel.clone());
    }
  });

  [
    { start: [-123.4, surfaceLayers.backlotCable, -39], end: [-95, surfaceLayers.backlotCable, -39], size: [0, 0.16, 0.22] },
    { start: [-95, surfaceLayers.backlotCable, -39], end: [-95, surfaceLayers.backlotCable, -72], size: [0.22, 0.16, 0] },
    { start: [-124, surfaceLayers.backlotCable, -73], end: [-93, surfaceLayers.backlotCable, -73], size: [0, 0.16, 0.22] }
  ].forEach((tray, index) => {
    const horizontal = Math.abs(tray.end[0] - tray.start[0]) > Math.abs(tray.end[2] - tray.start[2]);
    const center = [
      (tray.start[0] + tray.end[0]) / 2,
      tray.start[1],
      (tray.start[2] + tray.end[2]) / 2
    ];
    const length = horizontal ? Math.abs(tray.end[0] - tray.start[0]) : Math.abs(tray.end[2] - tray.start[2]);
    const size = horizontal ? [length, 0.16, 0.22] : [0.22, 0.16, length];
    addArchitecturalBox(group, center, size, cableMaterial.clone(), {
      castShadow: true,
      facilityId: facility.id
    });
    if (index !== 1) {
      addArchitecturalBox(group, [tray.start[0] + 2.4, 0.9, tray.start[2] - 0.65], [1.35, 1.2, 0.9], distroMaterial.clone(), {
        castShadow: true,
        facilityId: facility.id
      });
    }
  });

  const barrierPositions = [];
  for (let z = -75; z <= -39; z += 6) {
    barrierPositions.push([-135.2, 0.68, z]);
  }
  addBoxInstances(group, [1.2, 0.86, 0.42], barrierPositions, darkSteel.clone(), {
    castShadow: true,
    facilityId: facility.id
  });

  const tankRail = new THREE.Mesh(
    new THREE.TorusGeometry(12.2, 0.13, 8, 64),
    sharedMaterials.serviceSteel.clone()
  );
  tankRail.rotation.x = Math.PI / 2;
  tankRail.position.set(-86, 1.08, -43);
  tankRail.castShadow = true;
  group.add(tankRail);

  const tankPostPositions = [];
  for (let index = 0; index < 12; index += 1) {
    const angle = (Math.PI * 2 * index) / 12;
    const x = -86 + Math.cos(angle) * 12.2;
    const z = -43 + Math.sin(angle) * 12.2;
    tankPostPositions.push([x, 1.1, z]);
  }
  addCylinderInstances(group, new THREE.CylinderGeometry(0.09, 0.09, 1.4, 12), tankPostPositions, sharedMaterials.serviceSteel.clone(), {
    facilityId: facility.id
  });
}

function addWedgeRoof(group, position, size, material, options = {}) {
  const [width, height, depth] = size;
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const bottom = -height / 2;
  const lowTop = -height * 0.18;
  const highTop = height / 2;
  const slopeAxis = options.slopeAxis ?? 'z';
  const highAt = options.highAt ?? 'positive';
  const isHighSide = (coordinate) => (highAt === 'positive' ? coordinate > 0 : coordinate < 0);
  const topY = (x, z) => {
    const coordinate = slopeAxis === 'x' ? x : z;
    return isHighSide(coordinate) ? highTop : lowTop;
  };

  const vertices = new Float32Array([
    -halfWidth, bottom, -halfDepth,
    halfWidth, bottom, -halfDepth,
    -halfWidth, bottom, halfDepth,
    halfWidth, bottom, halfDepth,
    -halfWidth, topY(-halfWidth, -halfDepth), -halfDepth,
    halfWidth, topY(halfWidth, -halfDepth), -halfDepth,
    -halfWidth, topY(-halfWidth, halfDepth), halfDepth,
    halfWidth, topY(halfWidth, halfDepth), halfDepth
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  // Keep all wedge roof faces front-facing from outside so roof planes do not disappear from normal views.
  geometry.setIndex([
    0, 1, 2, 1, 3, 2,
    4, 6, 5, 5, 6, 7,
    0, 4, 1, 1, 4, 5,
    1, 5, 3, 3, 5, 7,
    2, 3, 6, 3, 7, 6,
    0, 2, 4, 2, 6, 4
  ]);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  if (options.rotation) {
    mesh.rotation.set(...options.rotation);
  }
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  if (options.facilityId) {
    mesh.userData.facilityId = options.facilityId;
  }
  group.add(mesh);
  return mesh;
}

function addSawtoothRoof(group, facility, spec) {
  const glass = sharedMaterials.glass.clone();
  glass.color = new THREE.Color('#21383c');

  for (let index = 0; index < spec.count; index += 1) {
    const x = spec.startX + spec.bayWidth * index + spec.bayWidth / 2;
    addWedgeRoof(group, [x, spec.centerY, spec.centerZ], [spec.bayWidth + 0.6, 3.6, spec.depth], sharedMaterials.civicRoof.clone(), {
      slopeAxis: 'z',
      highAt: 'negative',
      facilityId: facility.id
    });
    addArchitecturalBox(group, [x, spec.centerY + 0.3, spec.centerZ - spec.depth / 2 + 0.62], [spec.bayWidth * 0.68, 2.1, 0.34], glass.clone(), {
      castShadow: true,
      facilityId: facility.id
    });
  }
}

function addFacadeMullions(group, spec) {
  const positions = [];
  for (let x = spec.xStart; x <= spec.xEnd; x += spec.spacing) {
    positions.push([x, spec.y, spec.z]);
  }
  addBoxInstances(group, [0.22, spec.height, 0.42], positions, spec.material.clone(), {
    facilityId: spec.facilityId
  });
  addArchitecturalBox(group, [(spec.xStart + spec.xEnd) / 2, spec.y + spec.height / 2, spec.z], [spec.xEnd - spec.xStart, 0.18, 0.44], spec.material.clone(), {
    facilityId: spec.facilityId
  });
  addArchitecturalBox(group, [(spec.xStart + spec.xEnd) / 2, spec.y - spec.height / 2, spec.z], [spec.xEnd - spec.xStart, 0.18, 0.44], spec.material.clone(), {
    facilityId: spec.facilityId
  });
}

function addRailing(group, position, size, facilityId) {
  const [width, height, depth] = size;
  const material = sharedMaterials.darkMetal.clone();
  const topRailSize = width > depth ? [width, 0.18, depth] : [width, 0.18, depth];
  addArchitecturalBox(group, [position[0], position[1] + height / 2, position[2]], topRailSize, material, { facilityId });

  const postCount = width > depth ? Math.max(2, Math.floor(width / 5)) : Math.max(2, Math.floor(depth / 5));
  for (let index = 0; index <= postCount; index += 1) {
    const t = postCount === 0 ? 0 : index / postCount;
    const x = width > depth ? position[0] - width / 2 + width * t : position[0];
    const z = width > depth ? position[2] : position[2] - depth / 2 + depth * t;
    addArchitecturalBox(group, [x, position[1] - height * 0.18, z], [0.22, height, 0.22], material.clone(), { facilityId });
  }
}

function addShadePavilion(group, position, size, facilityId) {
  const [width, height, depth] = size;
  addWedgeRoof(group, position, size, sharedMaterials.shadeFabric.clone(), {
    slopeAxis: 'x',
    highAt: 'positive',
    facilityId
  });
  const columnY = position[1] - height / 2 - 1.4;
  const xOffsets = [-width * 0.42, width * 0.42];
  const zOffsets = [-depth * 0.34, depth * 0.34];
  xOffsets.forEach((xOffset) => {
    zOffsets.forEach((zOffset) => {
      addColumn(group, [position[0] + xOffset, columnY, position[2] + zOffset], 0.22, 4.5, sharedMaterials.timber.clone());
    });
  });
}

function addArchitecturalBox(group, position, size, material, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  if (options.rotation) {
    mesh.rotation.set(...options.rotation);
  }
  mesh.castShadow = options.castShadow ?? false;
  mesh.receiveShadow = options.receiveShadow ?? true;
  if (options.facilityId) {
    mesh.userData.facilityId = options.facilityId;
  }
  group.add(mesh);
  return mesh;
}

function addBoxInstances(parent, size, positions, material, options = {}) {
  if (!positions.length) return null;
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(...size), material, positions.length);
  const transform = new THREE.Object3D();
  positions.forEach((position, index) => {
    const coordinates = Array.isArray(position) ? position : position.position;
    const rotation = Array.isArray(position) ? options.rotation : position.rotation;
    const scale = Array.isArray(position) ? options.scale : position.scale;
    transform.position.set(...coordinates);
    transform.rotation.set(...(rotation ?? options.rotation ?? [0, 0, 0]));
    transform.scale.set(...(scale ?? [1, 1, 1]));
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = options.castShadow ?? false;
  mesh.receiveShadow = options.receiveShadow ?? true;
  if (options.facilityId) {
    mesh.userData.facilityId = options.facilityId;
  }
  parent.add(mesh);
  return mesh;
}

function addCylinderInstances(parent, geometry, positions, material, options = {}) {
  if (!positions.length) return null;
  const mesh = new THREE.InstancedMesh(geometry, material, positions.length);
  const transform = new THREE.Object3D();
  positions.forEach((position, index) => {
    const coordinates = Array.isArray(position) ? position : position.position;
    const rotation = Array.isArray(position) ? options.rotation : position.rotation;
    transform.position.set(...coordinates);
    transform.rotation.set(...(rotation ?? options.rotation ?? [0, 0, 0]));
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  if (options.facilityId) {
    mesh.userData.facilityId = options.facilityId;
  }
  parent.add(mesh);
  return mesh;
}

function addColumn(group, position, radius, height, material) {
  const column = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 12), material);
  column.position.set(...position);
  column.castShadow = true;
  column.receiveShadow = true;
  group.add(column);
  return column;
}

function addPlanter(group, position, size) {
  const planter = addArchitecturalBox(group, position, size, sharedMaterials.publicStone.clone(), { castShadow: true });
  const plant = new THREE.Mesh(
    new THREE.ConeGeometry(Math.min(size[0], size[2]) * 0.55, 3.1, 9),
    new THREE.MeshStandardMaterial({ color: '#4e8547', roughness: 0.92 })
  );
  plant.position.set(position[0], position[1] + 2.1, position[2]);
  plant.castShadow = true;
  group.add(plant);
  return planter;
}

function addRoofCap(group, facility, block) {
  const [width, height, depth] = block.size;
  const [x, y, z] = block.position;
  const capMaterial = sharedMaterials.roof.clone();
  capMaterial.color = new THREE.Color(block.kind === 'stage' ? '#f5f2ea' : '#d7d1c7');

  const roof = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 0.32, depth * 0.96), capMaterial);
  roof.position.set(x, y + height / 2 + 0.19, z);
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  const parapetMaterial = new THREE.MeshStandardMaterial({ color: block.kind === 'stage' ? '#dad6ce' : '#bdb5aa', roughness: 0.82 });
  const parapets = [
    { position: [x, y + height / 2 + 0.6, z - depth * 0.49], size: [width, 0.55, 0.42] },
    { position: [x, y + height / 2 + 0.6, z + depth * 0.49], size: [width, 0.55, 0.42] },
    { position: [x - width * 0.49, y + height / 2 + 0.6, z], size: [0.42, 0.55, depth] },
    { position: [x + width * 0.49, y + height / 2 + 0.6, z], size: [0.42, 0.55, depth] }
  ];

  parapets.forEach((spec) => {
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(...spec.size), parapetMaterial);
    parapet.position.set(...spec.position);
    parapet.castShadow = true;
    group.add(parapet);
  });
}

function addHighBayDoor(group, facility, block, width, height) {
  const [, blockHeight, depth] = block.size;
  const [x, y, z] = block.position;
  const dockFace = getStageDockFace(facility.id);
  const faceSign = dockFace === 'north' ? -1 : 1;
  const faceZ = z + faceSign * depth / 2;
  const door = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.28), sharedMaterials.darkMetal);
  door.position.set(x, y - blockHeight * 0.14, faceZ + faceSign * 0.16);
  door.userData.facilityId = facility.id;
  group.add(door);

  const awning = new THREE.Mesh(new THREE.BoxGeometry(width + 3, 0.45, 2.4), sharedMaterials.roof.clone());
  awning.position.set(x, y + height * 0.18, faceZ + faceSign * 1.2);
  awning.castShadow = true;
  group.add(awning);
}

function addWindowBand(group, facility, block) {
  const [width, height, depth] = block.size;
  const [x, y, z] = block.position;
  const bandHeight = Math.min(2.8, height * 0.26);
  const glass = sharedMaterials.glass.clone();
  glass.color = new THREE.Color(facility.category === 'public' ? '#314141' : '#263438');

  const front = new THREE.Mesh(new THREE.BoxGeometry(width * 0.68, bandHeight, 0.24), glass);
  front.position.set(x, y + height * 0.08, z + depth / 2 + 0.14);
  front.userData.facilityId = facility.id;
  group.add(front);

  if (width > 34) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.24, bandHeight, depth * 0.5), glass.clone());
    side.position.set(x + width / 2 + 0.14, y + height * 0.08, z);
    side.userData.facilityId = facility.id;
    group.add(side);
  }
}

function addRoofPlant(group, block, count) {
  const [width, height, depth] = block.size;
  const [x, y, z] = block.position;
  const plantMaterial = new THREE.MeshStandardMaterial({ color: '#a5a29a', roughness: 0.72, metalness: 0.08 });
  const availableWidth = Math.max(1, width - 12);

  for (let index = 0; index < count; index += 1) {
    const unitWidth = Math.min(5.2, width * 0.12);
    const unitDepth = Math.min(3.4, depth * 0.12);
    const offsetX = count === 1 ? 0 : -availableWidth / 2 + (availableWidth / Math.max(1, count - 1)) * index;
    const offsetZ = index % 2 === 0 ? -depth * 0.16 : depth * 0.14;
    const plant = new THREE.Mesh(new THREE.BoxGeometry(unitWidth, 0.85, unitDepth), plantMaterial);
    plant.position.set(x + offsetX, y + height / 2 + 0.98, z + offsetZ);
    plant.castShadow = true;
    group.add(plant);
  }
}

function addEdges(mesh, facilityId) {
  const edgeMaterial = new THREE.LineBasicMaterial({ color: '#1f2524', transparent: true, opacity: 0.34 });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edgeMaterial);
  edges.position.set(0, 0, 0);
  edges.userData.facilityId = facilityId;
  mesh.add(edges);
}

function addTheatreAccents(group, facility, block) {
  const [width, height, depth] = block.size;
  const [x, y, z] = block.position;
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: facility.accent,
    emissive: facility.accent,
    emissiveIntensity: 1.05,
    roughness: 0.44
  });

  if (block.kind === 'flyTower') {
    const crown = new THREE.Mesh(new THREE.BoxGeometry(width * 0.82, 0.45, depth * 0.18), accentMaterial);
    crown.position.set(x, y + height / 2 + 0.25, z);
    crown.userData.facilityId = facility.id;
    crown.userData.accent = true;
    group.add(crown);
  }

  if (block.kind === 'stageHouse') {
    const proscenium = new THREE.Mesh(new THREE.BoxGeometry(width * 0.7, height * 0.52, 0.35), accentMaterial);
    proscenium.position.set(x, y - height * 0.08, z + depth / 2 + 0.2);
    proscenium.userData.facilityId = facility.id;
    proscenium.userData.accent = true;
    group.add(proscenium);
  }
}

function addRollerDoors(group, block, facility) {
  const [width, height, depth] = block.size;
  const [x, y, z] = block.position;
  const material = new THREE.MeshStandardMaterial({ color: '#2f3333', roughness: 0.65 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(width * 0.45, height * 0.55, 0.25), material);
  door.position.set(x, y - height * 0.08, z + depth / 2 + 0.15);
  door.userData.facilityId = facility.id;
  group.add(door);
}

function addLabel(facility) {
  if (!opts.showLabels) return;
  const element = document.createElement('button');
  element.className = 'scene-label';
  element.type = 'button';
  element.dataset.facilityId = facility.id;
  element.innerHTML = `<span>${facility.shortName}</span>`;
  element.addEventListener('click', () => selectFacility(facility.id));

  const label = new CSS2DObject(element);
  label.position.set(...facility.label);
  label.userData.facilityId = facility.id;
  scene.add(label);
}

function selectFacility(id, focusCamera = false) {
  const facility = facilityById.get(id) ?? null;
  selectedId = id ?? null;
  updateMeshState();
  updateLabelState();
  if (focusCamera && id) focusFacility(id);
  opts.onFacilitySelect?.(selectedId, facility);
}

function focusFacility(id) {
  const box = getFacilityBox(id);
  if (!box) return;

  const center = new THREE.Vector3();
  box.getCenter(center);
  const size = new THREE.Vector3();
  box.getSize(size);
  const distance = Math.max(size.x, size.z) * 1.8 + 28;
  controls.maxDistance = Math.max(360, distance * 2.4);
  camera.position.set(center.x + distance, Math.max(34, size.y + 24), center.z + distance);
  controls.target.copy(center);
  controls.update();
}

function getFacilityBox(id) {
  const meshes = facilityMeshes.get(id);
  if (!meshes?.length) return null;
  const box = new THREE.Box3();
  meshes.forEach((mesh) => box.expandByObject(mesh));
  return box;
}

function updateMeshState() {
  facilityMeshes.forEach((meshes, id) => {
    const isHovered = id === hoveredId;
    const isSelected = id === selectedId;
    meshes.forEach((mesh) => {
      mesh.material.emissiveIntensity = isSelected ? 0.18 : isHovered ? 0.1 : 0;
    });
  });
}

function updateLabelState() {
  container.querySelectorAll('.scene-label').forEach((label) => {
    const id = label.dataset.facilityId;
    label.classList.toggle('is-active', id === selectedId);
    label.classList.toggle('is-hovered', id === hoveredId);
  });
}

function handlePointerMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const meshes = [...facilityMeshes.values()].flat();
  const hits = raycaster.intersectObjects(meshes, false);
  const hitId = hits[0]?.object.userData.facilityId ?? null;
  setHovered(hitId);
}

function handlePointerClick() {
  if (hoveredId) {
    selectFacility(hoveredId);
  }
}

function setHovered(id) {
  if (hoveredId === id) return;
  hoveredId = id;
  renderer.domElement.style.cursor = id ? 'pointer' : 'default';
  updateMeshState();
  updateLabelState();
  opts.onFacilityHover?.(id, facilityById.get(id) ?? null);
}

function pulseAccents(elapsed = performance.now() / 1000) {
  scene.traverse((object) => {
    if (object.userData.accent && object.material?.emissiveIntensity !== undefined) {
      object.material.emissiveIntensity = 1.2 + Math.sin(elapsed * 2.2) * 0.18;
    }
  });
}

function animateAtmosphere(elapsed) {
  animatedAtmosphere.forEach((item) => {
    const wave = Math.sin(elapsed * (item.speed ?? 1) + (item.phase ?? 0));
    if (item.material?.emissiveIntensity !== undefined && item.emissiveBase !== undefined) {
      item.material.emissiveIntensity = Math.max(0, item.emissiveBase + wave * (item.emissiveRange ?? 0));
    }

    const targetMaterial = item.material ?? item.object?.material;
    if (targetMaterial?.opacity !== undefined && item.opacityBase !== undefined) {
      targetMaterial.opacity = Math.max(0, item.opacityBase + wave * (item.opacityRange ?? 0));
    }
  });
}

function setCameraView(view) {
  currentView = view;
  const viewWidth = container.clientWidth || window.innerWidth;

  if (view === 'hero') {
    camera.fov = 42;
    camera.updateProjectionMatrix();
    controls.maxDistance = opts.maxDistance;
    camera.position.set(205, 118, 188);
    controls.target.set(-38, 8, 36);
    controls.maxPolarAngle = Math.PI * 0.48;
  } else if (view === 'plan') {
    camera.fov = viewWidth < 740 ? 72 : 44;
    camera.updateProjectionMatrix();
    const planHeight = viewWidth < 740 ? 520 : 430;
    controls.maxDistance = Math.max(700, planHeight + 80);
    camera.position.set(0, planHeight, 0.1);
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI * 0.5;
  } else if (view === 'entry') {
    camera.fov = 44;
    camera.updateProjectionMatrix();
    controls.maxDistance = 460;
    camera.position.set(-190, 92, 155);
    controls.target.set(-58, 10, 42);
    controls.maxPolarAngle = Math.PI * 0.48;
  } else {
    camera.fov = 44;
    camera.updateProjectionMatrix();
    if (viewWidth < 740) {
      controls.maxDistance = 680;
      camera.position.set(320, 250, 350);
      controls.target.set(2, 6, 5);
    } else {
      controls.maxDistance = 520;
      camera.position.set(220, 190, 235);
      controls.target.set(0, 4, 0);
    }
    controls.maxPolarAngle = Math.PI * 0.48;
  }

  controls.update();
}

function resize() {
  const w = container.clientWidth || window.innerWidth;
  const h = container.clientHeight || window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
  if (currentView === 'overview') setCameraView('overview');
}

function dispose() {
  renderer.setAnimationLoop(null);
  resizeObserver.disconnect();
  intersectionObserver.disconnect();
  if (opts.pauseAutoRotateOnInteraction) {
    renderer.domElement.removeEventListener('pointerdown', stopAutoRotate);
    renderer.domElement.removeEventListener('wheel', stopAutoRotate);
    renderer.domElement.removeEventListener('touchstart', stopAutoRotate);
  }
  renderer.domElement.removeEventListener('pointermove', handlePointerMove);
  renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
  renderer.domElement.removeEventListener('click', handlePointerClick);
  controls.dispose();
  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    const mats = object.material
      ? (Array.isArray(object.material) ? object.material : [object.material])
      : [];
    mats.forEach((m) => m.dispose());
  });
  renderer.dispose();
  container.innerHTML = '';
  container.classList.remove('production-city-viewer');
}

return {
  setCameraView,
  setAutoRotate(enabled) { controls.autoRotate = enabled; },
  setRoutesVisible(enabled) {
    routesVisible = enabled;
    accessOverlayGroup.visible = enabled;
  },
  selectFacility,
  focusFacility,
  resize,
  dispose,
  getCurrentView() { return currentView; },
  getDebugInfo() {
    return {
      memory: { ...renderer.info.memory },
      render: { ...renderer.info.render },
      routesVisible,
      view: currentView
    };
  },
  countScene() {
    const counts = {
      objects: 0, meshes: 0, instancedMeshes: 0, lineSegments: 0,
      geometries: new Set(), materials: new Set()
    };
    scene.traverse((object) => {
      counts.objects += 1;
      if (object.isInstancedMesh) counts.instancedMeshes += 1;
      if (object.isMesh) counts.meshes += 1;
      if (object.isLineSegments) counts.lineSegments += 1;
      if (object.geometry) counts.geometries.add(object.geometry.uuid);
      if (object.material) {
        const mats = Array.isArray(object.material) ? object.material : [object.material];
        mats.forEach((m) => counts.materials.add(m.uuid));
      }
    });
    return {
      objects: counts.objects,
      meshes: counts.meshes,
      instancedMeshes: counts.instancedMeshes,
      lineSegments: counts.lineSegments,
      labels: container.querySelectorAll('.scene-label,.access-label').length,
      geometries: counts.geometries.size,
      materials: counts.materials.size
    };
  }
};
}
