# 10 — Materials, Fabrication, Tolerances & Workshop vs. Purchased

This file draws the practical make/buy line, item by item, for someone with real mechanical fabrication capability (per this package's assumption: a well-equipped workshop with manual/CNC machining and TIG welding, but not an in-house cleanroom, orbital-welding rig, or refrigeration-charging license).

## 1. General principle

Split every component into one of three buckets:
1. **Fabricate in-house** — geometry-specific, low product-safety-criticality, within normal machine-shop tolerance capability.
2. **Buy as a finished/certified component** — anything with a safety certification, a wear-seal function, a proprietary internal mechanism, or a tolerance/finish spec beyond typical shop capability.
3. **Contract out to a specialist shop** — geometry your own shop can design but not practically make to the needed tolerance/finish/certification (e.g., a code-stamped pressure vessel, an orbital-welded sanitary tube run, an electropolished vessel interior).

## 2. Item-by-item make/buy assessment

| Item | Recommended bucket | Why |
|---|---|---|
| Conical vessel shell (rolled/formed cone) | **Contract out** (specialist fabricator) for anything intended to actually hold vacuum reliably, especially if it will ever be code-stamped; **fabricate in-house** is realistic for an early, non-code, atmospheric-pressure-only mockup used to prove out agitator geometry and clearances | Rolling/forming a true cone to the tolerance needed for a consistent agitator wall clearance (file 05 §3, 0.5–15 mm target) is a real sheet-metal-forming skill; a pressure/vacuum-rated version additionally needs code-compliant welding procedures (WPS/PQR) and NDE that most home shops aren't equipped or certified to perform |
| Double jacket | **Contract out** alongside the vessel shell | Jacket welding introduces its own external-pressure case (file 05 §5) and is normally done by the same specialist shop building the inner shell |
| Top lid, clamp ring, and lid fittings' mounting bosses | **Fabricate in-house** (machining/welding) with **purchased** vacuum-rated sight glass, gauge ports, and seals | The lid geometry itself is a very tractable machining/welding project; the vacuum-rated glass and instrument fittings are safety-critical purchased components (file 09 §1) |
| Bottom discharge (ball-segment) valve | **Buy** | A precision, wear-rated sanitary valve mechanism — not a practical in-house fabrication target; source from a sanitary-valve manufacturer (Hosokawa's own ISEM brand, or equivalents from GEMU, ITT Pure-Flo, Bardiani, etc.) |
| Agitator shaft & mixing element (ribbon/paddle/screw) | **Fabricate in-house** | Geometry-specific, within normal CNC/welding capability once the vessel's exact internal profile is known — this genuinely is a good workshop-scale machining project |
| Agitator drive — magnetic coupling variant | **Buy** | A precision, matched-pair permanent-magnet assembly; commercially available as a complete unit from mag-drive coupling manufacturers serving the pressure-reactor/pharma-mixer market |
| Agitator drive — single rotary shaft seal variant | **Buy the seal**, fabricate the surrounding housing | Mechanical seals (especially any rated for vacuum + cryogenic service) are a precision, wear-rated purchased component; the housing that holds it is a fabrication project |
| Agitator drive motor + gearbox/VFD | **Buy** | Standard industrial component, no reason to fabricate |
| TCU (refrigeration + heating skid) | **Buy as an integrated package** from an industrial process-chiller/TCU manufacturer, or **assemble in-house from purchased components** (compressor, heat exchangers, pump, controller) if budget/learning goals favor building it yourself | Refrigerant circuit work legally requires appropriate certification in most jurisdictions (e.g., EPA 608 in the US) — plan for a qualified refrigeration technician regardless of which sourcing route you choose |
| Vacuum pump train | **Buy** | Precision rotating equipment; not a realistic fabrication target at any scale |
| Vacuum gauges (Pirani, capacitance manometer) | **Buy** | Precision instruments |
| Material collector / filter housing | **Fabricate in-house** (housing) + **buy** (filter screen/cartridge element) | The housing is a straightforward vessel-and-flange fabrication project; the actual filter media is a consumable, purchased component |
| Vacuum isolation & bypass valves | **Buy** | Bellows/diaphragm-sealed vacuum valves are precision, certified components |
| CIP spray nozzles/spray balls | **Buy** | Standard sanitary catalog components (Alfa Laval, Lechler, and similar spray-nozzle manufacturers) |
| Seals & gaskets (lid, ports, valve stems) | **Buy** | Elastomer/PTFE components requiring material-specific compounding and certification (esp. for SIP-rated or product-contact service) |
| Insulation & cladding | **Fabricate in-house** (cladding sheet metal) + **buy** (insulation material itself) | Straightforward sheet-metal fabrication once vessel geometry is fixed |
| Structural frame/skid | **Fabricate in-house** | A very good workshop welding/fabrication project; standard structural steel practice |
| Sensors (RTDs, thermocouples, level, torque, filter ΔP) | **Buy** | Standard purchased instrumentation |
| Pneumatic/electric valve actuators | **Buy** | Standard purchased components |
| PLC, HMI, VFDs, electrical panel components | **Buy**; panel assembly and wiring can be **in-house** if you have the relevant electrical competence | The control logic and panel-building skill is learnable and a good project; the components themselves are always purchased |
| Piping and sanitary tube/fittings | **Buy tube/fittings** (BPE-grade); **fabricate/assemble in-house** with orbital welding if you invest in that capability, or **contract out** the welding to a certified orbital-welding shop | Orbital welding equipment and certified procedure qualification is a real, learnable but non-trivial investment; contracting it out for the product-contact runs is a very reasonable choice even for an otherwise heavily DIY build |

## 3. Tolerances and surface finishes worth calling out explicitly

- **Agitator-to-wall clearance**: 0.5–15 mm, preferably 1–10 mm, per Hosokawa's own patent (file 05 §3). Achieving this consistently around a full conical revolution, accounting for thermal contraction of both the vessel and the agitator at cryogenic temperature, is the single hardest dimensional-control problem in the whole build — plan to prototype and iteratively fit this clearance (e.g., with an adjustable-mount agitator shaft/bearing arrangement) rather than assuming a one-shot machined fit will land correctly, especially across the temperature swing.
- **Surface finish, product-contact surfaces**: target **ASME BPE SF4 (Ra ≤ 0.38 µm / 15 µin), electropolished**, matching standard pharma product-contact practice (file 05 §4) — this is a specialist post-fabrication process (send the fabricated vessel/parts to an electropolishing shop) rather than an in-house finishing operation for most workshops.
- **Non-product-contact structural surfaces**: standard mechanically-polished or as-fabricated finish is acceptable; no need to electropolish the structural frame or jacket exterior.
- **Weld quality on product-contact and pressure/vacuum-boundary joints**: full-penetration, properly qualified welding procedure (WPS) with appropriate NDE (dye penetrant at minimum; radiography for critical vacuum-boundary welds on anything you intend to actually trust under full vacuum) — this is where "contract out to a specialist shop" earns its place in the table above for anything beyond an atmospheric-pressure prototype.

## 4. Suggested staged fabrication approach

1. Build a **non-vacuum, atmospheric-pressure mockup** of the vessel + agitator in-house first (even in a cheaper material like 304 stainless or even mild steel for a true first-pass geometry check), purely to validate agitator clearance, drive alignment, and general assembly — cheap to iterate, and catches the hardest dimensional problem (§3 above) before you've committed to an expensive, code-fabricated pressure/vacuum vessel.
2. Only once that geometry is proven, commission the actual vacuum-rated, BPE-finished vessel from a specialist fabricator, built to the now-validated dimensions.
3. Build up the rest of the subsystems (frame, TCU, vacuum train, material collector, controls) in parallel, since most of them don't depend on the vessel's final fabrication — see file 16 for a full staged roadmap.
