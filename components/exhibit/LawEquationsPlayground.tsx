"use client";

import React, { useState, useCallback } from "react";
import { KatexEquation } from "@/components/exhibit/KatexEquation";
import { RefreshCw, Play, Info } from "lucide-react";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function clausius(T_K: number, a: number, b: number, T_ref: number, P_ref: number): number {
  // Clausius-Clapeyron: ln(P/P_ref) = (ΔH_sub/R) * (1/T_ref - 1/T)
  // Returns P in mbar
  const R = 8.314;
  const exponent = (a / R) * (1 / T_ref - 1 / T_K);
  return P_ref * Math.exp(exponent);
}

function sublimationRate(U: number, A: number, dT: number, dH_sub: number): number {
  // ṁ = Q / ΔH_sub  where Q = U·A·ΔT
  // U [W/m²K], A [m²], dT [K], dH_sub [kJ/kg]
  const Q = U * A * dT; // W
  return (Q / (dH_sub * 1000)) * 3600; // kg/h
}

function pumpdown(t: number, V: number, S: number, P0: number, P_ult: number, Q_leak: number): number {
  // P(t) = (P0 - P_ult)·exp(-S·t/V) + P_ult + Q_leak/S
  return (P0 - P_ult) * Math.exp((-S * t) / (V * 3600)) + P_ult + Q_leak / S;
}

function refrigerationDuty(m: number, x: number, dT: number, cp: number, dH_f: number, t_hours: number): number {
  // Q = (m·cp·dT + m·x·ΔH_f) / t  [kW]
  const sensible = m * cp * dT;
  const latent = m * x * dH_f * 1000;
  return (sensible + latent) / (t_hours * 3600 * 1000); // kW
}

// ─── INDIVIDUAL PLAYGROUNDS ───────────────────────────────────────────────────

function ClausiusClapeyronPlayground() {
  const [T_C, setT_C] = useState(-20);
  const T_K = T_C + 273.15;
  const dH_sub = 2838 * 1000; // J/kg → J/mol (×0.018 kg/mol)
  const dH_mol = dH_sub * 0.018;
  const P_ref = 6.11; // mbar at 0.01°C triple point
  const T_ref = 273.16; // K
  const R = 8.314;

  const P = clausius(T_K, dH_mol, R, T_ref, P_ref);
  const phase =
    T_C < 0.01 && P < 6.11
      ? "ICE → VAPOR (sublimation)"
      : T_C >= 0.01 && P < 6.11
      ? "LIQUID"
      : "ICE";

  return (
    <div className="simulator-panel">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="sim-label">Clausius-Clapeyron Equation</div>
          <div className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
            Saturation vapour pressure of water ice
          </div>
        </div>
        <span
          className="text-[10px] font-mono px-2 py-1 rounded-full"
          style={{
            background: phase.includes("VAPOR") ? 'var(--cryo-subtle)' : 'var(--amber-subtle)',
            color: phase.includes("VAPOR") ? 'var(--cryo)' : 'var(--amber)',
            border: `1px solid ${phase.includes("VAPOR") ? 'color-mix(in srgb, var(--cryo) 40%, transparent)' : 'color-mix(in srgb, var(--amber) 40%, transparent)'}`,
          }}
        >
          {phase}
        </span>
      </div>

      <div className="mb-4 py-3 rounded-lg text-center" style={{ background: 'var(--bg-surface)' }}>
        <KatexEquation
          expression={`\\ln\\frac{P}{P_{ref}} = \\frac{\\Delta H_{sub}}{R}\\left(\\frac{1}{T_{ref}} - \\frac{1}{T}\\right)`}
          displayMode
        />
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="sim-label">Temperature</span>
          <span className="sim-value text-2xl" style={{ color: 'var(--cryo)' }}>
            {T_C}<span className="sim-unit">°C</span>
          </span>
        </div>
        <input
          type="range"
          min={-80}
          max={30}
          step={1}
          value={T_C}
          onChange={(e) => setT_C(Number(e.target.value))}
        />
        <div className="flex justify-between text-[10px] font-mono mt-1" style={{ color: 'var(--ink-dim)' }}>
          <span>−80°C</span>
          <span>Triple Point ↑</span>
          <span>+30°C</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="sim-label">Saturation Pressure</div>
          <div className="sim-value text-2xl" style={{ color: 'var(--cryo)' }}>
            {P < 0.001 ? P.toExponential(2) : P.toFixed(3)}
            <span className="sim-unit">mbar</span>
          </div>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="sim-label">Temperature (K)</div>
          <div className="sim-value text-2xl" style={{ color: 'var(--ink-primary)' }}>
            {T_K.toFixed(2)}<span className="sim-unit">K</span>
          </div>
        </div>
      </div>

      {T_C <= -20 && (
        <div className="mt-3 p-2.5 rounded-lg text-xs" style={{ background: 'var(--cryo-subtle)', color: 'var(--cryo)', border: '1px solid color-mix(in srgb, var(--cryo) 30%, transparent)' }}>
          ✓ Within AFD operating window (≤ −20°C, ≤ 0.1 mbar). Conditions suitable for primary drying.
        </div>
      )}
    </div>
  );
}

function SublimationRatePlayground() {
  const [U, setU] = useState(25);       // W/m²K
  const [A, setA] = useState(0.8);      // m²
  const [dT, setDT] = useState(15);     // K
  const [mass, setMass] = useState(5);  // kg ice

  const dH_sub = 2838; // kJ/kg
  const rate = sublimationRate(U, A, dT, dH_sub); // kg/h
  const hours = mass / rate;

  return (
    <div className="simulator-panel">
      <div className="mb-4">
        <div className="sim-label">Sublimation Rate Calculator</div>
        <div className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
          Heat-transfer-limited drying from vessel jacket
        </div>
      </div>

      <div className="mb-4 py-3 rounded-lg text-center" style={{ background: 'var(--bg-surface)' }}>
        <KatexEquation
          expression={`\\dot{m} = \\frac{Q}{\\Delta H_{sub}} = \\frac{U \\cdot A \\cdot \\Delta T}{\\Delta H_{sub}}`}
          displayMode
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {[
          { label: "Heat Transfer Coeff (U)", value: U, set: setU, min: 5, max: 100, unit: "W/m²K" },
          { label: "Jacket Area (A)", value: A, set: setA, min: 0.2, max: 5, unit: "m²", step: 0.1 },
          { label: "Temp. Diff (ΔT)", value: dT, set: setDT, min: 1, max: 40, unit: "K" },
          { label: "Ice Mass", value: mass, set: setMass, min: 1, max: 50, unit: "kg" },
        ].map(({ label, value, set, min, max, unit, step = 1 }) => (
          <div key={label}>
            <div className="flex justify-between mb-1">
              <span className="sim-label text-[10px]">{label}</span>
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--cryo)' }}>
                {value}<span className="font-normal text-[10px]" style={{ color: 'var(--ink-dim)' }}> {unit}</span>
              </span>
            </div>
            <input
              type="range" min={min} max={max} step={step} value={value}
              onChange={(e) => set(Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="sim-label">Sublimation Rate</div>
          <div className="sim-value text-2xl" style={{ color: 'var(--cryo)' }}>
            {rate.toFixed(3)}<span className="sim-unit">kg/h</span>
          </div>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="sim-label">Est. Drying Time</div>
          <div className="sim-value text-2xl" style={{ color: 'var(--amber)' }}>
            {hours.toFixed(1)}<span className="sim-unit">h</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VacuumPumpdownPlayground() {
  const [V, setV] = useState(200);     // L
  const [S, setS] = useState(60);      // m³/h
  const [P0, setP0] = useState(1013);  // mbar
  const [leakRate, setLeakRate] = useState(0.01); // mbar·m³/s

  const targetP = 0.05; // mbar
  // Time to reach target pressure
  const t_hours = -(Math.log((targetP - leakRate / S) / (P0 - leakRate / S)) * V) / (S * 1000);
  const t_min = t_hours * 60;

  const points = Array.from({ length: 120 }, (_, i) => {
    const t = i / 10; // min
    const p = pumpdown(t / 60, V / 1000, S / 3600, P0, 0.0001, leakRate);
    return { t, p };
  });

  const maxLog = Math.log10(P0);
  const minLog = -3;

  return (
    <div className="simulator-panel">
      <div className="mb-4">
        <div className="sim-label">Vacuum Pumpdown Simulator</div>
        <div className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
          Exponential chamber evacuation curve
        </div>
      </div>

      <div className="mb-4 py-3 rounded-lg text-center" style={{ background: 'var(--bg-surface)' }}>
        <KatexEquation
          expression={`P(t) = (P_0 - P_{ult})\\,e^{-S_{eff}\\cdot t/V} + P_{ult} + \\frac{Q_{leak}}{S_{eff}}`}
          displayMode
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: "Chamber Volume", value: V, set: setV, min: 50, max: 2000, unit: "L" },
          { label: "Pump Speed", value: S, set: setS, min: 10, max: 300, unit: "m³/h" },
        ].map(({ label, value, set, min, max, unit }) => (
          <div key={label}>
            <div className="flex justify-between mb-1">
              <span className="sim-label text-[10px]">{label}</span>
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--cryo)' }}>
                {value}<span className="font-normal" style={{ color: 'var(--ink-dim)' }}> {unit}</span>
              </span>
            </div>
            <input type="range" min={min} max={max} value={value} onChange={(e) => set(Number(e.target.value))} />
          </div>
        ))}
      </div>

      {/* Live SVG Chart */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <svg viewBox="0 0 320 120" className="w-full h-32">
          {/* Grid lines */}
          {[0, 30, 60, 90, 120].map((y) => (
            <line key={y} x1="30" y1={y + 5} x2="310" y2={y + 5} stroke="var(--border)" strokeWidth="1" />
          ))}
          {/* Y-axis labels (log scale) */}
          {[1000, 100, 10, 1, 0.1].map((p, i) => (
            <text key={p} x="28" y={i * 27 + 10} textAnchor="end" fontSize="7" fill="var(--ink-dim)">
              {p}
            </text>
          ))}
          {/* Pumpdown curve */}
          <polyline
            fill="none"
            stroke="var(--cryo)"
            strokeWidth="2"
            points={points
              .map(({ t, p }) => {
                const logP = Math.max(minLog, Math.min(maxLog, Math.log10(Math.max(p, 0.001))));
                const x = 30 + (t / 12) * 280;
                const y = 5 + ((maxLog - logP) / (maxLog - minLog)) * 120;
                return `${x},${y}`;
              })
              .join(" ")}
          />
          {/* Target line */}
          <line
            x1="30"
            y1={5 + ((maxLog - Math.log10(targetP)) / (maxLog - minLog)) * 120}
            x2="310"
            y2={5 + ((maxLog - Math.log10(targetP)) / (maxLog - minLog)) * 120}
            stroke="var(--amber)"
            strokeWidth="1"
            strokeDasharray="4 2"
          />
        </svg>
        <div className="px-3 py-1.5 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-[10px] font-mono" style={{ color: 'var(--ink-dim)' }}>Pressure (mbar) — log scale</span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--amber)' }}>─ ─ Target: 0.05 mbar</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="sim-label">Time to Target</div>
          <div className="sim-value text-2xl" style={{ color: t_min < 60 ? 'var(--cryo)' : 'var(--amber)' }}>
            {t_min.toFixed(1)}<span className="sim-unit">min</span>
          </div>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="sim-label">Effective S/V Ratio</div>
          <div className="sim-value text-2xl" style={{ color: 'var(--ink-primary)' }}>
            {(S / (V / 1000)).toFixed(0)}<span className="sim-unit">1/h</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefrigerationPlayground() {
  const [m, setM] = useState(10);       // kg
  const [x, setX] = useState(0.7);     // water fraction
  const [dT, setDT] = useState(40);    // K (cooling range)
  const [t, setT] = useState(2);       // hours
  const cp = 3.9; // kJ/kg·K (product approximation)
  const dH_f = 334; // kJ/kg ice latent heat

  const Q = refrigerationDuty(m, x, dT, cp * 1000, dH_f, t); // kW
  const coolingRate = dT / (t * 60); // °C/min

  const withinSpec = coolingRate >= 0.1 && coolingRate <= 10;

  return (
    <div className="simulator-panel">
      <div className="mb-4">
        <div className="sim-label">Refrigeration Load Calculator</div>
        <div className="text-sm font-medium" style={{ color: 'var(--ink-secondary)' }}>
          Batch cooling duty vs. Hosokawa patent spec (0.1–10°C/min)
        </div>
      </div>

      <div className="mb-4 py-3 rounded-lg text-center" style={{ background: 'var(--bg-surface)' }}>
        <KatexEquation
          expression={`Q = \\frac{m\\,c_p\\,\\Delta T + m\\,x_{water}\\,\\Delta H_f}{t}`}
          displayMode
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {[
          { label: "Batch Mass", value: m, set: setM, min: 1, max: 100, unit: "kg" },
          { label: "Water Fraction", value: x, set: setX, min: 0.1, max: 0.99, unit: "–", step: 0.01 },
          { label: "Cooling Range ΔT", value: dT, set: setDT, min: 5, max: 100, unit: "K" },
          { label: "Cooling Duration", value: t, set: setT, min: 0.5, max: 12, unit: "h", step: 0.5 },
        ].map(({ label, value, set, min, max, unit, step = 1 }) => (
          <div key={label}>
            <div className="flex justify-between mb-1">
              <span className="sim-label text-[10px]">{label}</span>
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--cryo)' }}>
                {value}<span className="font-normal" style={{ color: 'var(--ink-dim)' }}> {unit}</span>
              </span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="sim-label">Cooling Duty</div>
          <div className="sim-value text-2xl" style={{ color: 'var(--cryo)' }}>
            {Q.toFixed(2)}<span className="sim-unit">kW</span>
          </div>
        </div>
        <div className="p-3 rounded-xl" style={{
          background: withinSpec ? 'var(--cryo-subtle)' : 'var(--amber-subtle)',
          border: `1px solid ${withinSpec ? 'color-mix(in srgb, var(--cryo) 35%, transparent)' : 'color-mix(in srgb, var(--amber) 40%, transparent)'}`,
        }}>
          <div className="sim-label">Cooling Rate</div>
          <div className="sim-value text-2xl" style={{ color: withinSpec ? 'var(--cryo)' : 'var(--amber)' }}>
            {coolingRate.toFixed(2)}<span className="sim-unit">°C/min</span>
          </div>
          <div className="text-[10px] font-mono mt-1" style={{ color: withinSpec ? 'var(--cryo)' : 'var(--amber)' }}>
            {withinSpec ? '✓ Within patent spec' : '⚠ Outside 0.1–10°C/min'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

const PLAYGROUNDS = [
  {
    id: "clausius",
    label: "Clausius-Clapeyron",
    subtitle: "Saturation pressure vs. temperature",
    component: ClausiusClapeyronPlayground,
  },
  {
    id: "sublimation",
    label: "Sublimation Rate",
    subtitle: "Heat-transfer-limited drying",
    component: SublimationRatePlayground,
  },
  {
    id: "vacuum",
    label: "Vacuum Pumpdown",
    subtitle: "Exponential evacuation curve",
    component: VacuumPumpdownPlayground,
  },
  {
    id: "refrigeration",
    label: "Refrigeration Duty",
    subtitle: "Cooling load & patent spec check",
    component: RefrigerationPlayground,
  },
];

export function LawEquationsPlayground() {
  const [active, setActive] = useState(PLAYGROUNDS[0].id);
  const ActiveComponent = PLAYGROUNDS.find((p) => p.id === active)?.component ?? ClausiusClapeyronPlayground;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
    >
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-3">
          <Play className="w-4 h-4" style={{ color: 'var(--cryo)' }} />
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--ink-primary)' }}>
              Live Law Equation Playground
            </div>
            <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              Interact with real physics governing freeze-drying. Drag sliders to see live results.
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        {PLAYGROUNDS.map((pg) => (
          <button
            key={pg.id}
            onClick={() => setActive(pg.id)}
            className="flex-shrink-0 px-4 py-3 text-left transition-all"
            style={{
              borderBottom: active === pg.id ? '2px solid var(--cryo)' : '2px solid transparent',
              backgroundColor: active === pg.id ? 'var(--cryo-subtle)' : 'transparent',
              color: active === pg.id ? 'var(--cryo)' : 'var(--ink-muted)',
            }}
          >
            <div className="text-xs font-semibold whitespace-nowrap">{pg.label}</div>
            <div className="text-[10px] whitespace-nowrap" style={{ color: 'var(--ink-dim)' }}>{pg.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <ActiveComponent />
      </div>
    </div>
  );
}
