# 11 — Design Calculations & Sizing Methodology

All worked numbers below use a **representative 10 kg batch (≈10 L) of a 90% water solution, in a nominal ~20 L vessel** — chosen because it lines up with a size Hosokawa itself publishes indicative performance for on the AFD page (their "20 L model" is quoted with a 10 L max batch volume and an indicative sublimation capacity of 0.8 kg/h), letting us **cross-check a first-principles calculation against Hosokawa's own published figure** without needing any proprietary data. Every number below is illustrative engineering methodology, not a specification for your build — rerun these with your own batch size, product properties, and measured (not assumed) heat-transfer coefficients once you have a prototype to test.

## 1. Sublimation rate ↔ heat duty (cross-checked against Hosokawa's published figure)

The core relationship (file 02 §3):
```
Q = (dm/dt) × ΔHs
```
`ΔHs` (latent heat of sublimation of ice) ≈ 2,838 kJ/kg.

Plugging in **Hosokawa's own published 0.8 kg/h** for the 20 L model:
```
dm/dt = 0.8 kg/h = 2.222×10⁻⁴ kg/s
Q = 2.222×10⁻⁴ × 2,838,000 J/kg ≈ 631 W
```
**A ~630 W jacket heat duty to sustain 0.8 kg/h sublimation is a small, entirely buildable number** for a 20 L-class unit — well within a single-phase electric heater or a modest hot/cold TCU circuit. This is a useful sanity check: if your own design's required heat duty for a similar batch size comes out wildly different (say, tens of kW), that's a strong signal to re-examine your assumptions before building anything.

**Time to sublime the batch's water content**, at that rate: for 9 kg of water (90% of a 10 kg batch) at 0.8 kg/h, primary drying takes **≈11.25 h** — consistent with the "hours to days" range generic literature gives for primary drying, and with Hosokawa's own 2003 patent's "10–100 hours for a 50 L charge" figure (a larger charge, so a longer time, is directionally consistent).

## 2. Required jacket heat-transfer area

```
Q = U × A × ΔT   →   A = Q / (U × ΔT)
```
- `U` = overall heat transfer coefficient, jacket wall → agitated product. **This is genuinely product- and design-specific and cannot be looked up reliably** — it depends on wall material/thickness, agitation intensity, particle size, and chamber pressure (gas-phase conduction across any micro-gaps is pressure-dependent, same physics as file 02's vial-heat-transfer-coefficient discussion). A reasonable **first-pass planning range for an actively agitated, direct-contact granular bed is roughly 50–200 W/m²·K** — meaningfully better than the static-vial gas-gap coefficients reported in the Pikal-model literature (which are often only single digits to tens of W/m²·K, precisely *because* a static vial's heat path crosses a poorly-conducting gas gap that agitation is specifically designed to eliminate), but this must be measured on your own prototype, not assumed for a final design.
- `ΔT` = jacket-wall-to-product temperature differential; **10–30 °C** is a reasonable planning range, consistent with typical primary-drying shelf-to-product differentials reported in the shelf-freeze-dryer literature.

At `Q ≈ 631 W`:

| Assumed U (W/m²K) | Required area for ΔT = 20 °C |
|---|---|
| 50 | 0.63 m² |
| 100 | 0.32 m² |
| 150 | 0.21 m² |
| 200 | 0.16 m² |

A vessel wall area in the 0.15–0.65 m² range is entirely consistent with the wetted internal-cone surface area of a vessel sized to hold a 10–20 L batch — another sanity-check pass. **Build in adjustable jacket-fluid temperature control (via the TCU) so you can tune actual ΔT once you've measured your real U empirically**, rather than trying to nail this on paper alone.

## 3. Freezing-stage refrigeration load

Three sequential heat-removal steps for a 10 kg batch (90% water), cooling from +20 °C ambient to a −30 °C frozen mass (an illustrative target inside Hosokawa's patent-disclosed −55 °C to −15 °C post-freeze range):

```
Q1 (cool liquid, 20 °C → 0 °C)   = m × cp_liquid × ΔT  = 10 kg × 4.2 kJ/kg·K × 20 K   = 840 kJ
Q2 (freeze the water content)    = m_water × ΔHf        = 9 kg × 334 kJ/kg             = 3,006 kJ
Q3 (cool frozen mass, 0 → −30°C) = m × cp_ice × ΔT       = 10 kg × 2.1 kJ/kg·K × 30 K   = 630 kJ
                                                            ─────────────────────────────
                                                            Total ≈ 4,476 kJ (4.48 MJ)
```

Average refrigeration duty depends on how fast you want to complete freezing — which is itself bounded by Hosokawa's own disclosed **0.1–10 °C/min optimum freezing rate**:

| Freezing time | Implied cooling rate (50 °C swing) | Avg. refrigeration duty |
|---|---|---|
| 2 h | 0.42 °C/min | 0.62 kW |
| 1 h | 0.83 °C/min | 1.24 kW |
| 0.5 h | 1.67 °C/min | 2.49 kW |

All three sit comfortably inside Hosokawa's disclosed 0.1–10 °C/min range, and all three are modest, workshop-buildable refrigeration duties (roughly "large chest freezer" to "small commercial chiller" scale) — **before** accounting for jacket/ambient losses and TCU inefficiency, for which a **1.5–2× capacity margin over the calculated average duty** is standard engineering practice, and before accounting for the *separate* condenser/material-collector refrigeration duty (file 06 §2), which must remove the same latent heat again when the sublimed vapor re-condenses/freezes downstream.

## 4. Vacuum pump-down time (empty-vessel, first-pass estimate)

The standard exponential pump-down relationship for evacuating a fixed volume with a pump of constant volumetric speed (ignoring outgassing/vapor load — a valid approximation only for the initial, dry evacuation before ice starts subliming):
```
t = (V / S) × ln(P1 / P2)
```
For a 20 L (0.02 m³) free vessel volume, pumping from atmospheric (1,013 mbar) down to 1 mbar:

| Pump speed S | Pump-down time |
|---|---|
| 5 m³/h | ~100 s |
| 10 m³/h | ~50 s |
| 20 m³/h | ~25 s |
| 50 m³/h | ~10 s |

**This is only the "dry" evacuation time.** Once the product starts giving off water vapor (during freezing induction and especially during primary drying), the pump must additionally handle the ongoing sublimation vapor load — at the 0.8 kg/h sublimation rate above, that's roughly 0.22 g/s of water vapor, which at low pressure occupies a very large volumetric flow (ideal gas law: at 1 mbar and −20°C, 0.22 g/s of water vapor is on the order of several hundred L/s of volumetric flow) — this is the actual reason freeze-dryer vacuum pumps are specified against **vapor handling capacity at the operating pressure**, not against empty-chamber pump-down speed. Pump selection should be driven by this sublimation vapor load calculation (and by the condenser's job of removing most of that vapor as ice before it ever reaches the pump — file 06 §4), with the empty-vessel pump-down number used only as a secondary check on how quickly you can get the system down to the freezing-induction pressure at the start of each batch.

## 5. Agitator power — an honest "you must measure this" section

Unlike the calculations above, agitator torque/power for a granular, partially-frozen bed **cannot be reliably predicted from first principles** without either detailed granular-flow modeling or empirical testing — the resistance depends on particle size, degree of caking, fill level, and the specific mixing-element geometry you build. What can be stated with confidence:

- Hosokawa's own patent explicitly notes that **because freeze-drying is slow, only gentle mixing is needed** — this is not a high-power, high-shear mixing duty like a chemical reactor.
- For scale intuition only (not a sizing method): Hosokawa's general-purpose Nauta mixer line uses a **2.2 kW motor at 500 L** (file 03 §3) for full-intensity powder mixing duty — a 20 L freeze-dryer vessel, running at a much gentler speed for a much gentler duty, will need dramatically less, plausibly in the tens-to-low-hundreds-of-watts range, but **this should be confirmed empirically**: specify a variable-frequency drive with generous headroom over your best estimate, instrument the drive for torque/current (file 08 §1), and let the real, measured load — including the worst case, which is likely mid-freeze when the mass is partially solidified and most resistant to being moved — set your final motor selection rather than a paper calculation.

## 6. External-pressure vessel thickness — method reference

For the vessel and jacket wall thickness under full external vacuum, use the standard **ASME Section VIII Division 1, UG-28 procedure** (file 05 §5): assume a trial thickness, compute the shell's `L/Do` and `Do/t` ratios, read the geometry/material factor from the Code's charts (or the equivalent numerical method in the Code's non-mandatory appendices), and verify the resulting allowable external pressure exceeds your design case (full vacuum, i.e., ~1 atm/1.013 bar external differential, plus any additional margin your jurisdiction's code requires) with the Code-mandated safety factor against theoretical elastic collapse. This procedure is iterative (thickness assumed → checked → revised) and is most practically run using the standard external-pressure charts/software your fabricator or design engineer already uses, rather than hand-calculated from scratch — flagged here as a methodology pointer, not repeated in full, since it is standard, already-mastered territory for anyone with ASME Section VIII pressure-vessel design background.
