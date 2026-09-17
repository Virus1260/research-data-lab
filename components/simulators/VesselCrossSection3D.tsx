"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  RotateCw,
  Maximize2,
  Minimize2,
  Layers,
  ShieldCheck,
  Eye,
  Sliders,
  Play,
  Pause,
  Compass,
  Thermometer,
  Sparkles,
  Info,
  Check,
  Zap,
} from "lucide-react";
import { tokenColor } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Subsystem Engineering Specifications (ASME BPE & Patent NL1022668C2)
// ─────────────────────────────────────────────────────────────────────────────
interface SubsystemSpec {
  id: string;
  name: string;
  subtitle: string;
  category: "Agitation" | "Thermal" | "Containment" | "Automation";
  material: string;
  asmeStandard: string;
  patentClaim: string;
  keyMetrics: { label: string; value: string }[];
  description: string;
  position: [number, number, number];
}

const SUBSYSTEM_SPECS: Record<string, SubsystemSpec> = {
  agitator: {
    id: "agitator",
    name: "Conical Helical Ribbon Screw",
    subtitle: "Active Upward Boundary Conveyor",
    category: "Agitation",
    material: "AISI 316L / Hastelloy C-22 (Electropolished Ra ≤ 0.38 µm)",
    asmeStandard: "ASME BPE-2022 SD-3.4 (Cleanability)",
    patentClaim: "NL1022668C2 Claim 1 & EP0835687",
    keyMetrics: [
      { label: "Wall Clearance", value: "0.5 – 15 mm (opt. 2–4 mm)" },
      { label: "Helical Turns", value: "3.5 Continuous Spiral" },
      { label: "Tip Speed", value: "0.3 – 1.8 m/s (Low Shear)" },
      { label: "Heat Transfer (kv)", value: "80 – 160 W/m²K (5× Trays)" },
    ],
    description:
      "Continuous cantilevered helical ribbon that rotates in close proximity to the jacketed vessel wall. It gently lifts freezing or sublimating powder upward along the heated boundary and lets it cascade downward through the open core, eliminating thermal resistance and boundary caking.",
    position: [0, -0.1, 0.4],
  },
  drive: {
    id: "drive",
    name: "ATEX Drive Motor & Planetary Gearbox",
    subtitle: "High-Torque Sanitary Powerhead",
    category: "Automation",
    material: "Epoxy-Coated Cast Aluminum / 304 Stainless Cowling",
    asmeStandard: "IECEx / ATEX Zone 1/21 • IP66 Pharma",
    patentClaim: "NL1022668C2 §3.1",
    keyMetrics: [
      { label: "Rated Power", value: "5.5 kW Inverter Duty" },
      { label: "Speed Range", value: "2 – 60 RPM (VFD Controlled)" },
      { label: "Max Torque", value: "1,850 N·m (Pastes / Breakaway)" },
      { label: "Feedback", value: "Digital Torque Sensor (dm/dt)" },
    ],
    description:
      "Overhead planetary gear motor mounted on the top sanitary head. Provides controlled gentle agitation during primary freeze and high breakaway torque when processing sticky semi-frozen pastes without contaminating the sterile process envelope.",
    position: [0, 1.8, 0],
  },
  seal: {
    id: "seal",
    name: "Sanitary Double Mechanical Shaft Seal",
    subtitle: "Sterile Nitrogen Overpressure Barrier",
    category: "Containment",
    material: "SiC vs Diamond-Coated SiC • FFKM O-rings (USP Class VI)",
    asmeStandard: "ASME BPE-2022 SD-3.5 • FDA 21 CFR §211.65",
    patentClaim: "NL1022668C2 Claim 4",
    keyMetrics: [
      { label: "Barrier Gas", value: "Sterile Nitrogen (N₂)" },
      { label: "Overpressure", value: "+0.5 bar above Chamber" },
      { label: "Leakage Rate", value: "< 10⁻⁸ mbar·L/s He" },
      { label: "SIP Tolerance", value: "135°C Pure Steam @ 3.2 bar" },
    ],
    description:
      "Cantilevered top-entry dry mechanical seal with active sterile nitrogen barrier. Guarantees zero lubricant ingress into the formulation and zero product egress during deep vacuum sublimation (down to 0.005 mbar).",
    position: [0, 1.3, 0.25],
  },
  topHead: {
    id: "topHead",
    name: "Sanitary Top Cover & Nozzle Cluster",
    subtitle: "Vapor Expansion & Cleaning Array",
    category: "Containment",
    material: "AISI 316L Stainless Steel (Ra ≤ 0.38 µm)",
    asmeStandard: "ASME BPVC Section VIII Div 1 • ASME BPE",
    patentClaim: "NL1022668C2 Claim 6",
    keyMetrics: [
      { label: "Exhaust Duct", value: "DN150 Sanitary Tri-Clamp" },
      { label: "CIP Array", value: "Dual 360° Orbital Spray Balls" },
      { label: "Inspection", value: "Illuminated Borosilicate Sight Glass" },
      { label: "Feed Nozzle", value: "Aseptic Liquid Dosing Valve" },
    ],
    description:
      "Heavy flanged torispherical lid featuring quick-release swing clamps, a large vapor exhaust manifold leading to the ice condenser, dual rotary orbital CIP spray balls, and sterile liquid charging ports.",
    position: [0.5, 0.95, 0.4],
  },
  shell: {
    id: "shell",
    name: "Inner Sanitary Conical Shell",
    subtitle: "Electropolished Process Chamber",
    category: "Containment",
    material: "AISI 316L / Hastelloy C-22 (ASTM A240)",
    asmeStandard: "ASME BPE SF4 (Ra ≤ 0.38 µm Electropolished)",
    patentClaim: "NL1022668C2 Claim 1 (Cone Angle 60°)",
    keyMetrics: [
      { label: "Cone Angle", value: "60° Included Angle" },
      { label: "Design Pressure", value: "Full Vac (-1 bar) to +2 bar" },
      { label: "Volume Capacity", value: "15 L Pilot / 250 L Prod" },
      { label: "Weld Quality", value: "Orbital GTAW • 100% Boroscopy" },
    ],
    description:
      "Downward 60° conical stainless steel pressure/vacuum boundary. The steep cone angle exceeds the powder angle of repose, ensuring 100% complete gravity emptying without product hang-up.",
    position: [0.4, -0.2, 0.5],
  },
  jacket: {
    id: "jacket",
    name: "Double Heat-Transfer Jacket",
    subtitle: "Cryogenic Freezing & Sublimation Heating",
    category: "Thermal",
    material: "AISI 304 / 316L Stainless Steel",
    asmeStandard: "ASME BPVC UG-28 to UG-30 (External Jacket Pressure)",
    patentClaim: "NL1022668C2 §2a (Dual Heat Transfer)",
    keyMetrics: [
      { label: "Thermal Fluid", value: "Syltherm XLT / Silicone Oil" },
      { label: "Temp Range", value: "-55°C Cryo to +80°C Heating" },
      { label: "Flow Velocity", value: "Turbulent (Re > 4,000)" },
      { label: "Uniformity", value: "± 0.8°C Across Conical Wall" },
    ],
    description:
      "Baffled annular jacket surrounding the conical vessel. Rapidly cools the product bed to -50°C during stirred freezing, and subsequently supplies uniform conductive heat during primary sublimation without swapping heat-transfer fluids.",
    position: [-0.6, -0.4, 0.5],
  },
  bottomValve: {
    id: "bottomValve",
    name: "Zero-Dead-Leg Bottom Discharge Valve",
    subtitle: "Hermetic Spherical Flush Piston",
    category: "Containment",
    material: "AISI 316L • Virgin PTFE / PEEK Core Seals",
    asmeStandard: "ASME BPE-2022 SD-3.7 (Zero Dead Volume)",
    patentClaim: "NL1022668C2 Claim 7",
    keyMetrics: [
      { label: "Dead Space", value: "0 mm (Flush with Cone Apex)" },
      { label: "Actuation", value: "Pneumatic Spring-Return" },
      { label: "Discharge Port", value: "DN80 Tri-Clamp Outlet" },
      { label: "Interlock", value: "SIL-2 Pressure Safety System" },
    ],
    description:
      "Sanitary flush-mounted discharge valve positioned at the conical apex. In the closed state, the valve plug forms a continuous uninterrupted inner cone surface so no unmixed powder sits in a stagnant dead zone.",
    position: [0, -1.3, 0],
  },
  frame: {
    id: "frame",
    name: "Support Skirt & Gravimetric Load Cells",
    subtitle: "Real-Time Sublimation Endpoint Tracking",
    category: "Automation",
    material: "AISI 304 Structural Tube • Hermetic C3 Load Cells",
    asmeStandard: "OIML R60 Class C3 • cGMP Floor Clearance",
    patentClaim: "Engineering Monograph §5",
    keyMetrics: [
      { label: "Load Cells", value: "3× 500 kg Hermetic Shear Beam" },
      { label: "Resolution", value: "± 10 grams Real-Time" },
      { label: "Metric Tracked", value: "dm/dt Sublimation Rate" },
      { label: "Endpoint Accuracy", value: "Loss on Drying (LOD) < 1.0%" },
    ],
    description:
      "Rigid stainless tripod support frame elevating the vessel for cleanroom isolator docking. Integrated high-precision load cells continuously weigh the vessel to measure exact mass loss rate (dm/dt) and verify sublimation completion.",
    position: [-0.8, -1.1, -0.4],
  },
};

type ViewAngle = "cutaway" | "isometric" | "top" | "bottom";
type DisplayMode = "cutaway180" | "solid360" | "ghost";
type ShadingStyle = "pbr" | "thermal" | "wireframe";

export function VesselCrossSection3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSubsystem, setActiveSubsystem] = useState<string>("agitator");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("cutaway180");
  const [shadingStyle, setShadingStyle] = useState<ShadingStyle>("pbr");
  const [isAgitating, setIsAgitating] = useState(true);
  const [agitationRpm, setAgitationRpm] = useState<number>(25);
  const [showHotspots, setShowHotspots] = useState(true);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const agitatorGroupRef = useRef<THREE.Group | null>(null);
  const assemblyGroupRef = useRef<THREE.Group | null>(null);
  const meshesRef = useRef<Record<string, THREE.Object3D>>({});

  const spec = SUBSYSTEM_SPECS[activeSubsystem] || SUBSYSTEM_SPECS.agitator;

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // Listen for Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Three.js Scene Setup & Geometry Modeling
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions (guard against 0 size on initial mount)
    const width = Math.max(10, container.clientWidth || 600);
    const height = Math.max(10, container.clientHeight || 450);

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const updateSceneBg = () => {
      scene.background = new THREE.Color(tokenColor("--bg-inset", "#12141a"));
    };
    updateSceneBg();
    const themeObserver = new MutationObserver(updateSceneBg);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(2.8, 1.2, 4.2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.6;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI * 0.95;
    controls.target.set(0, 0.15, 0);
    controlsRef.current = controls;

    // Lighting (Studio Engineering Rig)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x7fd4ff, 2.4); // Cryo-cyan highlight
    dirLight1.position.set(4, 5, 4);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 1.6); // Warm amber industrial key
    dirLight2.position.set(-4, -2, -3);
    scene.add(dirLight2);

    const interiorLight = new THREE.PointLight(0xffeedd, 1.8, 4.0); // Inside chamber light
    interiorLight.position.set(0, 0.4, 0);
    scene.add(interiorLight);

    // Root Assembly Group
    const assemblyGroup = new THREE.Group();
    scene.add(assemblyGroup);
    assemblyGroupRef.current = assemblyGroup;

    // ─────────────────────────────────────────────────────────────────────────
    // PROCEDURAL FABRICATION GEOMETRIES (Hosokawa AFD Architecture)
    // ─────────────────────────────────────────────────────────────────────────
    const isCutaway = displayMode === "cutaway180";
    const isGhost = displayMode === "ghost";
    const thetaLength = isCutaway ? Math.PI * 1.1 : Math.PI * 2;

    // PBR Metal Material Presets
    const stainlessMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8e2ec,
      metalness: 0.92,
      roughness: 0.18,
      side: THREE.DoubleSide,
      transparent: isGhost,
      opacity: isGhost ? 0.28 : 1.0,
    });

    const polishedInnerMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.96,
      roughness: 0.08, // Electropolished mirror Ra ≤ 0.38 µm
      side: THREE.DoubleSide,
    });

    const jacketMaterial = new THREE.MeshStandardMaterial({
      color: shadingStyle === "thermal" ? 0x06b6d4 : 0x475569, // Cryo cyan in thermal mode
      metalness: 0.75,
      roughness: 0.25,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isGhost ? 0.2 : isCutaway ? 0.75 : 0.85,
    });

    const insulationSkinMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.5,
      roughness: 0.4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isGhost ? 0.15 : isCutaway ? 0.45 : 0.95,
    });

    const agitatorGoldMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Distinct gold ribbon
      metalness: 0.9,
      roughness: 0.2,
    });

    // 1. TOP DRIVE MOTOR & PLANETARY GEARBOX
    const driveGroup = new THREE.Group();
    driveGroup.position.set(0, 1.45, 0);

    const motorBodyGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.45, 24);
    const motorBodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });
    const motorBody = new THREE.Mesh(motorBodyGeo, motorBodyMat);
    driveGroup.add(motorBody);

    // Motor Cooling Fins (8 radial fins)
    for (let f = 0; f < 8; f++) {
      const angle = (f / 8) * Math.PI * 2;
      const finGeo = new THREE.BoxGeometry(0.02, 0.38, 0.06);
      const finMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4, roughness: 0.6 });
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.position.set(Math.cos(angle) * 0.25, 0, Math.sin(angle) * 0.25);
      fin.rotation.y = -angle;
      driveGroup.add(fin);
    }

    // Top Terminal Junction Box
    const junctionGeo = new THREE.BoxGeometry(0.12, 0.16, 0.12);
    const junction = new THREE.Mesh(junctionGeo, motorBodyMat);
    junction.position.set(0.26, 0.08, 0);
    driveGroup.add(junction);

    // Planetary Gearbox Housing
    const gearGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.25, 24);
    const gear = new THREE.Mesh(gearGeo, stainlessMaterial);
    gear.position.set(0, -0.32, 0);
    driveGroup.add(gear);

    assemblyGroup.add(driveGroup);
    meshesRef.current.drive = driveGroup;

    // 2. STERILE N₂ MECHANICAL SEAL CARTRIDGE
    const sealGroup = new THREE.Group();
    sealGroup.position.set(0, 1.05, 0);
    const sealGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 24);
    const sealMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    const sealMesh = new THREE.Mesh(sealGeo, sealMat);
    sealGroup.add(sealMesh);

    // Nitrogen inlet port tube
    const n2TubeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.18, 12);
    n2TubeGeo.rotateZ(Math.PI / 2);
    const n2TubeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 });
    const n2Tube = new THREE.Mesh(n2TubeGeo, n2TubeMat);
    n2Tube.position.set(0.22, 0, 0);
    sealGroup.add(n2Tube);

    assemblyGroup.add(sealGroup);
    meshesRef.current.seal = sealGroup;

    // 3. TOP COVER DISH & PROCESS NOZZLE ARRAY
    const topHeadGroup = new THREE.Group();
    topHeadGroup.position.set(0, 0.9, 0);

    // Flanged Cover Head
    const coverGeo = new THREE.CylinderGeometry(1.04, 1.04, 0.08, 36);
    const coverMesh = new THREE.Mesh(coverGeo, stainlessMaterial);
    topHeadGroup.add(coverMesh);

    // Perimeter Tri-Clamp Swing Bolts
    for (let b = 0; b < 12; b++) {
      const angle = (b / 12) * Math.PI * 2;
      const boltGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8);
      const boltMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
      const bolt = new THREE.Mesh(boltGeo, boltMat);
      bolt.position.set(Math.cos(angle) * 1.0, 0, Math.sin(angle) * 1.0);
      topHeadGroup.add(bolt);
    }

    // Vacuum Vapor Exhaust Elbow (DN150 Port leading to condenser)
    const exhaustGeo = new THREE.TorusGeometry(0.24, 0.07, 16, 24, Math.PI / 2);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaust = new THREE.Mesh(exhaustGeo, stainlessMaterial);
    exhaust.position.set(0.5, 0.1, -0.4);
    topHeadGroup.add(exhaust);

    // Sight Glass with Glass Refraction
    const sightGlassGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      transmission: 0.9,
      opacity: 1.0,
      transparent: true,
      roughness: 0.05,
      ior: 1.52,
    });
    const sightGlass = new THREE.Mesh(sightGlassGeo, glassMat);
    sightGlass.position.set(-0.45, 0.06, 0.45);
    topHeadGroup.add(sightGlass);

    // Dual CIP Rotary Spray Balls
    for (const sx of [-0.35, 0.35]) {
      const sprayRodGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8);
      const sprayBallGeo = new THREE.SphereGeometry(0.04, 12, 12);
      const sprayRod = new THREE.Mesh(sprayRodGeo, stainlessMaterial);
      const sprayBall = new THREE.Mesh(sprayBallGeo, stainlessMaterial);
      sprayRod.position.set(sx, -0.18, 0);
      sprayBall.position.set(sx, -0.36, 0);
      topHeadGroup.add(sprayRod);
      topHeadGroup.add(sprayBall);
    }

    assemblyGroup.add(topHeadGroup);
    meshesRef.current.topHead = topHeadGroup;

    // 4. UPPER CYLINDRICAL SECTION (Freeboard expansion zone)
    const upperCylinderGeo = new THREE.CylinderGeometry(0.96, 0.96, 0.35, 36, 1, true, 0, thetaLength);
    const upperCylinder = new THREE.Mesh(upperCylinderGeo, polishedInnerMaterial);
    upperCylinder.position.set(0, 0.72, 0);
    assemblyGroup.add(upperCylinder);

    // 5. INNER CONICAL SANITARY SHELL (60° Included Angle)
    // Taper from radius 0.96 (top) to radius 0.15 (apex)
    const coneHeight = 1.6;
    const coneGeo = new THREE.CylinderGeometry(0.96, 0.15, coneHeight, 48, 1, true, 0, thetaLength);
    const coneMesh = new THREE.Mesh(coneGeo, polishedInnerMaterial);
    coneMesh.position.set(0, -0.25, 0);
    assemblyGroup.add(coneMesh);
    meshesRef.current.shell = coneMesh;

    // 6. DOUBLE HEAT-TRANSFER JACKET
    const jacketGeo = new THREE.CylinderGeometry(1.06, 0.22, coneHeight * 0.95, 48, 1, true, 0, thetaLength);
    const jacketMesh = new THREE.Mesh(jacketGeo, jacketMaterial);
    jacketMesh.position.set(0, -0.25, 0);
    assemblyGroup.add(jacketMesh);
    meshesRef.current.jacket = jacketMesh;

    // Fluid Flange Ports (Inlet at bottom, outlet at top)
    const flangeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
    const inPort = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 16), flangeMat);
    inPort.rotation.z = Math.PI / 2;
    inPort.position.set(-1.15, -0.85, 0);
    assemblyGroup.add(inPort);

    const outPort = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 16), flangeMat);
    outPort.rotation.z = Math.PI / 2;
    outPort.position.set(-1.15, 0.35, 0);
    assemblyGroup.add(outPort);

    // 7. OUTER INSULATION CLADDING (Cosmetic Stainless Sheath)
    const claddingGeo = new THREE.CylinderGeometry(1.15, 0.28, coneHeight * 0.98, 48, 1, true, 0, thetaLength);
    const claddingMesh = new THREE.Mesh(claddingGeo, insulationSkinMaterial);
    claddingMesh.position.set(0, -0.25, 0);
    assemblyGroup.add(claddingMesh);

    // 8. CONICAL HELICAL RIBBON SCREW AGITATOR
    const agitatorGroup = new THREE.Group();
    agitatorGroupRef.current = agitatorGroup;

    // Central Cantilevered Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.35, 24);
    const shaftMesh = new THREE.Mesh(shaftGeo, agitatorGoldMaterial);
    shaftMesh.position.set(0, 0.05, 0);
    agitatorGroup.add(shaftMesh);

    // Helical Spiral Ribbon Path
    const spiralPoints: THREE.Vector3[] = [];
    const turns = 3.5;
    const steps = 160;
    const topY = 0.8;
    const bottomY = -0.98;
    const topRadius = 0.88; // 0.96 - 0.08 = ~8mm wall clearance
    const bottomRadius = 0.12;

    for (let s = 0; s <= steps; s++) {
      const frac = s / steps;
      const angle = frac * Math.PI * 2 * turns;
      const y = topY - frac * (topY - bottomY);
      const r = topRadius - frac * (topRadius - bottomRadius);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      spiralPoints.push(new THREE.Vector3(x, y, z));
    }

    const spiralCurve = new THREE.CatmullRomCurve3(spiralPoints);
    const ribbonGeo = new THREE.TubeGeometry(spiralCurve, 140, 0.032, 10, false);
    const ribbonMesh = new THREE.Mesh(ribbonGeo, agitatorGoldMaterial);
    agitatorGroup.add(ribbonMesh);

    // Horizontal Cantilever Support Spokes (Welded rods connecting shaft to spiral)
    const spokeCount = 6;
    for (let sp = 0; sp < spokeCount; sp++) {
      const frac = sp / (spokeCount - 1);
      const angle = frac * Math.PI * 2 * turns;
      const y = topY - frac * (topY - bottomY);
      const r = topRadius - frac * (topRadius - bottomRadius);
      const spokeGeo = new THREE.CylinderGeometry(0.016, 0.016, r, 10);
      spokeGeo.rotateZ(Math.PI / 2);
      const spoke = new THREE.Mesh(spokeGeo, agitatorGoldMaterial);
      spoke.position.set((Math.cos(angle) * r) / 2, y, (Math.sin(angle) * r) / 2);
      spoke.rotation.y = -angle;
      agitatorGroup.add(spoke);
    }

    assemblyGroup.add(agitatorGroup);
    meshesRef.current.agitator = agitatorGroup;

    // 9. ZERO-DEAD-LEG BOTTOM DISCHARGE VALVE
    const bottomValveGroup = new THREE.Group();
    bottomValveGroup.position.set(0, -1.15, 0);

    // Spherical valve body
    const valveBodyGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const valveBody = new THREE.Mesh(valveBodyGeo, stainlessMaterial);
    bottomValveGroup.add(valveBody);

    // Pneumatic Actuator Cylinder
    const actuatorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 16);
    const actuatorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });
    const actuator = new THREE.Mesh(actuatorGeo, actuatorMat);
    actuator.rotation.z = Math.PI / 2;
    actuator.position.set(0.3, 0, 0);
    bottomValveGroup.add(actuator);

    // Tri-Clamp Discharge Spool
    const dischargeSpoolGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16);
    const dischargeSpool = new THREE.Mesh(dischargeSpoolGeo, stainlessMaterial);
    dischargeSpool.position.set(0, -0.22, 0);
    bottomValveGroup.add(dischargeSpool);

    assemblyGroup.add(bottomValveGroup);
    meshesRef.current.bottomValve = bottomValveGroup;

    // 10. SUPPORT LEGS & LOAD CELLS FRAME
    const frameGroup = new THREE.Group();
    const legCount = 3;
    for (let l = 0; l < legCount; l++) {
      const angle = (l / legCount) * Math.PI * 2;
      const legX = Math.cos(angle) * 1.1;
      const legZ = Math.sin(angle) * 1.1;

      // Vertical Tubular Leg
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 12);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.3 });
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(legX, -0.5, legZ);
      frameGroup.add(leg);

      // Radial Strut connecting vessel to leg
      const strutGeo = new THREE.BoxGeometry(0.35, 0.04, 0.04);
      const strut = new THREE.Mesh(strutGeo, legMat);
      strut.position.set(legX * 0.75, 0.2, legZ * 0.75);
      strut.rotation.y = -angle;
      frameGroup.add(strut);

      // Load Cell Pad (Gold / Brass block at footing)
      const loadCellGeo = new THREE.BoxGeometry(0.12, 0.06, 0.12);
      const loadCellMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
      const loadCell = new THREE.Mesh(loadCellGeo, loadCellMat);
      loadCell.position.set(legX, -1.6, legZ);
      frameGroup.add(loadCell);
    }
    assemblyGroup.add(frameGroup);
    meshesRef.current.frame = frameGroup;

    // ─────────────────────────────────────────────────────────────────────────
    // ANIMATION LOOP (Physics Agitation & Camera Glide)
    // ─────────────────────────────────────────────────────────────────────────
    let animId: number;
    let lastTime = performance.now();

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Rotate agitator ribbon at target RPM
      if (isAgitating && agitatorGroupRef.current) {
        const radPerSec = (agitationRpm * 2 * Math.PI) / 60;
        agitatorGroupRef.current.rotation.y += radPerSec * dt;
      }

      controls.update();

      // Guard against zero-sized framebuffer operations
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        renderer.render(scene, camera);
      }
    };
    animate(performance.now());

    // Window and Container Resize Handler with zero-dimension protection
    const updateSize = (w: number, h: number) => {
      if (w > 0 && h > 0 && camera && renderer) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const handleResize = () => {
      if (!container) return;
      updateSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          updateSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      themeObserver.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [displayMode, shadingStyle, isAgitating, agitationRpm]);

  // Set Camera View Angles Smoothly
  const setCameraView = (view: ViewAngle) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    switch (view) {
      case "cutaway":
        camera.position.set(0, 0.1, 4.2);
        controls.target.set(0, 0, 0);
        break;
      case "isometric":
        camera.position.set(2.8, 1.4, 3.8);
        controls.target.set(0, 0.1, 0);
        break;
      case "top":
        camera.position.set(0, 4.5, 0.8);
        controls.target.set(0, 0.8, 0);
        break;
      case "bottom":
        camera.position.set(0.5, -2.4, 2.2);
        controls.target.set(0, -1.2, 0);
        break;
    }
    controls.update();
  };

  // Focus Subsystem Hotspot
  const handleSelectSubsystem = (id: string) => {
    setActiveSubsystem(id);
    const item = SUBSYSTEM_SPECS[id];
    if (!item || !controlsRef.current || !cameraRef.current) return;

    // Smooth pivot target
    controlsRef.current.target.set(item.position[0] * 0.5, item.position[1], item.position[2] * 0.5);
    controlsRef.current.update();
  };

  return (
    <div
      ref={fullscreenContainerRef}
      className={`instrument-card rounded-2xl border border-hairline bg-bg-panel transition-all my-6 ${
        isFullscreen
          ? "fixed inset-0 z-[100] m-0 rounded-none bg-bg-panel/98 backdrop-blur-2xl flex flex-col p-4 sm:p-6 overflow-hidden"
          : "p-4 sm:p-5"
      }`}
    >
      {/* Header Bar with Fullscreen & Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-hairline gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber font-bold">
              Simulator 07 • Chapter 05
            </span>
            <span className="text-ink-dim font-mono text-[10px]">•</span>
            <span className="text-[10px] font-mono text-cryo bg-cryo/10 px-2 py-0.5 rounded border border-cryo/20 font-semibold">
              Patent NL1022668C2 / EP0835687
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-ink-primary mt-1 flex items-center gap-2">
            <span>3D Fabricated Active Freeze Dryer & Agitator</span>
            <span className="text-xs font-mono font-normal text-ink-dim hidden md:inline">
              (Industrial CAD Cross-Section)
            </span>
          </h3>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-1.5 self-start sm:self-auto">
          {/* Display Mode Toggle */}
          <div className="flex items-center bg-bg-surface p-0.5 rounded-lg border border-hairline text-xs font-mono">
            <button
              onClick={() => setDisplayMode("cutaway180")}
              className={`px-2 py-1 rounded text-[11px] transition ${
                displayMode === "cutaway180"
                  ? "bg-amber text-on-amber font-bold shadow-xs"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
              title="180° Half Cutaway showing interior chamber, ribbon screw & double jacket"
            >
              Cutaway 180°
            </button>
            <button
              onClick={() => setDisplayMode("solid360")}
              className={`px-2 py-1 rounded text-[11px] transition ${
                displayMode === "solid360"
                  ? "bg-amber text-on-amber font-bold shadow-xs"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
              title="Full 360° Fabricated Cleanroom Assembly"
            >
              Solid 360°
            </button>
            <button
              onClick={() => setDisplayMode("ghost")}
              className={`px-2 py-1 rounded text-[11px] transition ${
                displayMode === "ghost"
                  ? "bg-amber text-on-amber font-bold shadow-xs"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
              title="Translucent X-Ray view of all internal and external shells"
            >
              X-Ray Ghost
            </button>
          </div>

          {/* Fullscreen Expansion / Exit Button */}
          <button
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-lg border transition font-mono flex items-center gap-1 text-xs ${
              isFullscreen
                ? "bg-amber text-on-amber font-bold shadow-md shadow-amber/20 border-amber"
                : "bg-bg-surface hover:bg-bg-hover text-ink-secondary hover:text-ink-primary border-hairline"
            }`}
            title={isFullscreen ? "Exit Fullscreen (ESC)" : "Expand to Fullscreen 3D CAD Studio"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="text-[11px] hidden sm:inline">{isFullscreen ? "Exit Studio" : "Fullscreen"}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0 ${isFullscreen ? "h-full" : ""}`}>
        {/* 3D WebGL Canvas Viewport (7 cols) */}
        <div
          className={`lg:col-span-7 bg-bg-inset rounded-xl border border-hairline relative overflow-hidden flex flex-col justify-between ${
            isFullscreen ? "h-full min-h-[400px]" : "h-[360px] sm:h-[420px]"
          }`}
        >
          {/* 3D Canvas Anchor */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing relative" />

          {/* Viewport Top Left: Quick Camera Presets HUD */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-bg-panel/85 backdrop-blur-md p-1 rounded-lg border border-hairline text-[10px] font-mono text-ink-dim shadow-md pointer-events-auto">
            <span className="px-1.5 text-ink-muted uppercase font-semibold">View:</span>
            <button
              onClick={() => setCameraView("cutaway")}
              className="px-2 py-0.5 rounded hover:bg-bg-hover text-ink-secondary hover:text-amber transition"
              title="Front Cutaway (Chamber Interior)"
            >
              Front
            </button>
            <button
              onClick={() => setCameraView("isometric")}
              className="px-2 py-0.5 rounded hover:bg-bg-hover text-ink-secondary hover:text-amber transition"
              title="Isometric 3D Perspective"
            >
              Isometric
            </button>
            <button
              onClick={() => setCameraView("top")}
              className="px-2 py-0.5 rounded hover:bg-bg-hover text-ink-secondary hover:text-amber transition"
              title="Top View (Nozzles & Seal)"
            >
              Top Lid
            </button>
            <button
              onClick={() => setCameraView("bottom")}
              className="px-2 py-0.5 rounded hover:bg-bg-hover text-ink-secondary hover:text-amber transition"
              title="Bottom Discharge Valve Focus"
            >
              Bottom Valve
            </button>
          </div>

          {/* Viewport Top Right: Agitation Dynamics HUD */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-bg-panel/85 backdrop-blur-md p-1 px-2 rounded-lg border border-hairline text-xs font-mono shadow-md pointer-events-auto">
            <button
              onClick={() => setIsAgitating(!isAgitating)}
              className={`p-1 rounded transition ${
                isAgitating ? "text-amber bg-amber/10" : "text-ink-dim hover:text-ink-primary"
              }`}
              title={isAgitating ? "Pause Agitator" : "Start Agitator"}
            >
              {isAgitating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[10px] text-ink-dim">RPM:</span>
            {[5, 25, 60].map((rpm) => (
              <button
                key={rpm}
                onClick={() => {
                  setAgitationRpm(rpm);
                  setIsAgitating(true);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] transition ${
                  agitationRpm === rpm && isAgitating
                    ? "bg-amber text-on-amber font-bold"
                    : "text-ink-dim hover:text-ink-primary"
                }`}
                title={`${rpm} RPM: ${
                  rpm === 5 ? "Gentle Freezing Mode" : rpm === 25 ? "Sublimation Stirring" : "Gravity Discharge"
                }`}
              >
                {rpm}
              </button>
            ))}
          </div>

          {/* Viewport Bottom Controls & Interaction Hints */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none text-[10px] font-mono text-ink-dim">
            <div className="flex items-center gap-2 bg-bg-panel/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-hairline shadow-xs">
              <RotateCw className="w-3 h-3 text-amber animate-spin-slow" />
              <span>Drag to rotate 3D • Pinch/Scroll to zoom • Right-click to pan</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-bg-panel/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-hairline">
              <span className="w-1.5 h-1.5 rounded-full bg-cryo animate-pulse" />
              <span>Double Jacket: Cryo -55°C to Heating +80°C</span>
            </div>
          </div>
        </div>

        {/* Engineering Specification & Fabricated Parts Inspector (5 cols) */}
        <div
          className={`lg:col-span-5 flex flex-col justify-between bg-bg-inset rounded-xl border border-hairline p-4 ${
            isFullscreen ? "overflow-y-auto max-h-[85vh]" : ""
          }`}
        >
          <div className="space-y-3.5">
            {/* Subsystem Selector Badges */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-ink-dim mb-1.5 flex items-center justify-between">
                <span>Select Fabricated Subsystem</span>
                <span className="text-amber">{spec.category}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: "agitator", label: "Ribbon Screw" },
                  { id: "shell", label: "Sanitary Shell" },
                  { id: "jacket", label: "Cooling Jacket" },
                  { id: "drive", label: "ATEX Drive" },
                  { id: "seal", label: "Mechanical Seal" },
                  { id: "topHead", label: "Top Nozzles" },
                  { id: "bottomValve", label: "Discharge Valve" },
                  { id: "frame", label: "Load Cells Frame" },
                ].map((item) => {
                  const isSelected = activeSubsystem === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectSubsystem(item.id)}
                      className={`p-1.5 rounded-lg text-left transition font-mono text-[11px] border leading-tight ${
                        isSelected
                          ? "bg-amber text-on-amber font-bold border-amber shadow-sm"
                          : "bg-bg-panel hover:bg-bg-hover text-ink-secondary border-hairline"
                      }`}
                    >
                      <div className="truncate">{item.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Subsystem Title & Patent Claim Card */}
            <div className="bg-bg-panel rounded-xl p-3.5 border border-hairline space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-ink-primary leading-tight">
                    {spec.name}
                  </h4>
                  <div className="text-[11px] font-mono text-amber mt-0.5">{spec.subtitle}</div>
                </div>
                <span className="text-[9px] font-mono text-cryo bg-cryo/10 px-2 py-0.5 rounded border border-cryo/20 shrink-0">
                  {spec.patentClaim}
                </span>
              </div>

              <div className="text-[11px] font-mono text-ink-muted border-t border-hairline pt-2 space-y-1">
                <div>
                  <span className="text-ink-dim">Material Grade: </span>
                  <span className="text-ink-primary font-semibold">{spec.material}</span>
                </div>
                <div>
                  <span className="text-ink-dim">Pharma Standard: </span>
                  <span className="text-ink-secondary">{spec.asmeStandard}</span>
                </div>
              </div>

              <p className="text-xs text-ink-secondary leading-relaxed pt-1">{spec.description}</p>
            </div>

            {/* Technical Metric Grid */}
            <div className="grid grid-cols-2 gap-2">
              {spec.keyMetrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="bg-bg-panel p-2.5 rounded-lg border border-hairline flex flex-col justify-between"
                >
                  <span className="text-[10px] font-mono text-ink-dim leading-none">{metric.label}</span>
                  <span className="text-xs font-mono font-bold text-ink-primary mt-1 tabular-nums">
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* cGMP Compliance & Clearance Verification Callout */}
          <div className="mt-3 pt-3 border-t border-hairline flex items-center justify-between text-[11px] font-mono text-ink-dim">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber shrink-0" />
              <span>Wall Clearance: strictly 0.5 – 15 mm (ASME BPE)</span>
            </div>
            <span className="text-[10px] text-ink-muted hidden sm:inline">100% Gravity Discharge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
