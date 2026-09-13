"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Eye, RotateCw, Layers, ShieldCheck, Sparkles, Box } from "lucide-react";

export function VesselCrossSection3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeLayer, setActiveLayer] = useState<string>("all");
  const [selectedSpec, setSelectedSpec] = useState<{
    name: string;
    material: string;
    spec: string;
    patentRef: string;
  }>({
    name: "Agitator Ribbon Screw",
    material: "AISI 316L / Hastelloy C-22",
    spec: "0.5–15 mm inner-wall clearance (preferably 1–10 mm) to scrape without metal contact.",
    patentRef: "NL1022668C2 Claim 1",
  });

  const layerSpecs: Record<string, typeof selectedSpec> = {
    agitator: {
      name: "Agitator Ribbon Screw",
      material: "AISI 316L / Hastelloy C-22",
      spec: "Rotates with 0.5–15 mm (pref. 1–10 mm) clearance along inner conical wall; prevents product caking.",
      patentRef: "NL1022668C2 Claim 1",
    },
    wall: {
      name: "Inner Sanitary Pressure/Vacuum Shell",
      material: "316L Stainless Steel / Hastelloy C-22",
      spec: "ASME BPE SF4 electropolished (Ra ≤ 0.38 µm). External pressure designed per ASME BPVC UG-28 to UG-30.",
      patentRef: "NL1022668C2 / ASME BPE",
    },
    jacket: {
      name: "Double Heat-Transfer Jacket",
      material: "304 / 316L Stainless Steel",
      spec: "Dimple / half-pipe coil circulation of silicone oil TCU (-55°C cryogenic to +80°C heating/SIP).",
      patentRef: "NL1022668C2 §2a",
    },
    cladding: {
      name: "Outer Insulation Cladding",
      material: "Rigid Cellular Glass / PIR + 304 Outer Skin",
      spec: "Prevents atmospheric condensation and cold loss during -55°C freeze cycles.",
      patentRef: "Engineering Standard",
    },
    all: {
      name: "Complete Conical Assembly",
      material: "Sanitary Bioprocessing Composite",
      spec: "Downward conical geometry enables uniform stirred freeze drying and complete gravity discharge.",
      patentRef: "Hosokawa AFD Architecture",
    },
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 500;
    const height = 300;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090a);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 4.5);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x7fd4ff, 2.0);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe5a93c, 1.2);
    dirLight2.position.set(-5, -3, -2);
    scene.add(dirLight2);

    // Group for rotating assembly
    const vesselGroup = new THREE.Group();
    scene.add(vesselGroup);

    // 1. Cladding (outer cone wireframe/transparent)
    const claddingGeo = new THREE.ConeGeometry(1.2, 2.0, 32, 1, true);
    claddingGeo.rotateX(Math.PI); // downward cone
    const claddingMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.2,
      roughness: 0.8,
      wireframe: false,
      transparent: true,
      opacity: activeLayer === "all" || activeLayer === "cladding" ? 0.35 : 0.05,
    });
    const claddingMesh = new THREE.Mesh(claddingGeo, claddingMat);
    vesselGroup.add(claddingMesh);

    // 2. Jacket (cooling coils / middle cone)
    const jacketGeo = new THREE.ConeGeometry(1.08, 1.9, 32, 1, true);
    jacketGeo.rotateX(Math.PI);
    const jacketMat = new THREE.MeshStandardMaterial({
      color: 0x7fd4ff,
      metalness: 0.8,
      roughness: 0.3,
      transparent: true,
      opacity: activeLayer === "all" || activeLayer === "jacket" ? 0.55 : 0.05,
    });
    const jacketMesh = new THREE.Mesh(jacketGeo, jacketMat);
    vesselGroup.add(jacketMesh);

    // 3. Inner Sanitary Wall
    const wallGeo = new THREE.ConeGeometry(0.96, 1.8, 32, 1, true);
    wallGeo.rotateX(Math.PI);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: activeLayer === "all" || activeLayer === "wall" ? 0.75 : 0.1,
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    vesselGroup.add(wallMesh);

    // 4. Central Agitator Shaft + Spiral Ribbon
    const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.0, 16);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xe5a93c,
      metalness: 0.9,
      roughness: 0.2,
    });
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    vesselGroup.add(shaftMesh);

    // Conical spiral curve for agitator ribbon
    const spiralPoints: THREE.Vector3[] = [];
    const turns = 4;
    const count = 120;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 2 * turns;
      // cone radius decreases downward from 0.8 to 0.1
      const r = (1 - t) * 0.82 + 0.08;
      const y = 0.9 - t * 1.8;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      spiralPoints.push(new THREE.Vector3(x, y, z));
    }
    const spiralCurve = new THREE.CatmullRomCurve3(spiralPoints);
    const ribbonGeo = new THREE.TubeGeometry(spiralCurve, 80, 0.03, 8, false);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xf5a623,
      metalness: 0.8,
      roughness: 0.3,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    vesselGroup.add(ribbonMesh);

    // Animation Loop
    let animId: number;
    let isDragging = false;
    let prevX = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevX;
        vesselGroup.rotation.y += deltaX * 0.01;
        prevX = e.clientX;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        vesselGroup.rotation.y += 0.008; // slow rotation
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      camera.aspect = newW / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeLayer]);

  const selectLayer = (layerKey: string) => {
    setActiveLayer(layerKey);
    setSelectedSpec(layerSpecs[layerKey] || layerSpecs["all"]);
  };

  return (
    <div className="instrument-card rounded-2xl p-5 my-6 border border-white/10 bg-[#0D0F12]/90 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-signal animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-signal">
              Simulator 07 • Chapter 05
            </span>
          </div>
          <h3 className="text-lg font-medium text-ink-primary mt-1">
            3D Conical Vessel & Agitator Cross-Section (Interactive Three.js)
          </h3>
        </div>

        {/* Layer Selector */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-xs">
          {[
            { id: "all", label: "Full Assembly" },
            { id: "agitator", label: "Ribbon Screw" },
            { id: "wall", label: "Sanitary Shell" },
            { id: "jacket", label: "Cooling Jacket" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => selectLayer(item.id)}
              className={`px-2.5 py-1 rounded-lg transition font-mono ${
                activeLayer === item.id
                  ? "bg-amber-signal/20 text-amber-bright border border-amber-signal/40 font-bold"
                  : "text-ink-muted hover:text-ink-secondary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 3D WebGL Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-[#08090A] rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
          <div ref={mountRef} className="w-full h-[300px] cursor-grab active:cursor-grabbing" />
          <div className="absolute bottom-2 left-3 text-[10px] font-mono text-ink-dim flex items-center gap-1.5 pointer-events-none">
            <RotateCw className="w-3 h-3" />
            <span>Drag to rotate • Real 3D Conical geometry</span>
          </div>
        </div>

        {/* Layer Specification Callout (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-[#08090A] border border-white/5">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-signal">
                Subsystem Layer Spec
              </span>
              <span className="text-[10px] font-mono text-cryo bg-cryo/10 px-2 py-0.5 rounded border border-cryo/20">
                {selectedSpec.patentRef}
              </span>
            </div>

            <div>
              <div className="text-base font-bold text-ink-primary">{selectedSpec.name}</div>
              <div className="text-xs font-mono text-ink-muted mt-0.5">
                Material: <span className="text-ink-secondary">{selectedSpec.material}</span>
              </div>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed pt-1">
              {selectedSpec.spec}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-ink-dim font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-signal shrink-0" />
            <span>Patent NL1022668C2: Wall clearance strictly 0.5–15 mm.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
