# 08 — Instrumentation, Controls, Electrical, Structural Frame & Piping

## 1. Instrumentation

| Measurement | Typical sensor | Notes |
|---|---|---|
| Chamber/vessel pressure | Capacitance manometer (primary/control) + Pirani gauge (secondary/diagnostic) | See file 06 §3b — the pair enables end-of-primary-drying detection via comparative pressure measurement |
| Condenser/collector pressure | Same pair, mirrored | Best practice per 2017 AAPS PharmSciTech industry consensus paper: instrument both chamber and condenser sides |
| Jacket fluid temperature (supply & return) | RTD (PT100) | Feeds TCU's PID control loop |
| Product temperature | RTD or thermocouple probe(s) into the product mass | On an agitated bed this is harder to place reliably than a static-shelf vial probe — probe location/mounting is a genuine design problem worth prototyping early |
| Agitator drive | Torque and/or motor current monitoring | Rising torque during freezing indicates the mass solidifying; useful as an in-process indicator even without a formal spec |
| Level / fill | Sight glass (visual) at minimum; capacitance or load-cell based level sensing for automation | Sight glass is explicitly in Hosokawa's own patent drawing (file 05 §2) |
| Filter differential pressure | Differential pressure transmitter across the material collector's filter | Rising ΔP indicates the filter is loading with dust — the trigger for a blowback/purge pulse |
| Steam temperature (if SIP) | RTD at multiple distribution points | Required for SIP validation — see file 14 |

## 2. Valves

- **Vacuum-side isolation and bypass valves** (file 06 §5) — bellows/diaphragm-sealed, pneumatically or electrically actuated for automated cycle control, with position feedback (open/closed limit switches) reporting to the PLC.
- **Sanitary process valves** (CIP supply, product path, utility isolation) — diaphragm valves are the standard sanitary choice throughout the pharma industry for their cleanability (no crevices, smooth diaphragm-sealed flow path) versus ball or gate valves.
- **Bottom discharge ball-segment valve** (file 05 §6) — pneumatically actuated for automated, reproducible operation; manual handle acceptable for an early prototype.
- **Blow-nozzle gas valves** — fast-acting solenoid valves for the short gas-pulse cleanup step.

## 3. Control system (PLC/HMI/SCADA)

Hosokawa states explicitly: "**Control system, 21 CFR Part 11 compliant**." Generic architecture for a system like this, consistent with both the AFD's stated compliance target and standard industrial-automation practice:

- **PLC** (programmable logic controller) executes the actual recipe logic: sequencing through freeze/vacuum-draw/primary-dry/secondary-dry/discharge/CIP/SIP steps, reading all instrumentation, driving all valves and drives, and enforcing interlocks (see file 09).
- **HMI** (human-machine interface) — operator screen for recipe selection, live trending of pressure/temperature, alarm display, and manual override where permitted.
- **Data historian / SCADA layer** — logs every batch's process data continuously, which is what makes GMP batch-record generation and regulatory compliance possible at all; this is also where **21 CFR Part 11** requirements bite hardest (see below).
- **GAMP 5** (ISPE's "Good Automated Manufacturing Practice," version 5) is the risk-based framework the pharma industry uses to validate this class of computerized system — it categorizes software (from off-the-shelf infrastructure through configured/customized applications) and scales validation rigor accordingly, rather than demanding the same exhaustive testing for every line of code regardless of risk.
- **21 CFR Part 11** governs electronic records and electronic signatures specifically: audit trails that cannot be altered or deleted, secure user access levels, electronic signatures tied to specific actions (e.g., batch release), and record retention. This is a *regulatory* requirement layered on top of the *engineering* PLC/HMI/historian system — a system can be technically well-built and still fail a Part 11 assessment if, e.g., audit trails can be disabled by an operator, or electronic signatures aren't properly bound to the record they approve. File 14 covers this distinction (build it right vs. prove it's right) in depth.
- For a prototype/educational build, a modern industrial PLC (Siemens S7-1200/1500, Allen-Bradley CompactLogix, or similar) with a standard HMI panel gives you the same architecture pattern at a fraction of the validation overhead — you simply won't (and, per file 14, legally shouldn't) claim GMP/Part 11 compliance for it without the full qualification and software-validation program that requires.

## 4. Electrical system

- **Motor drives**: agitator drive motor (with VFD for speed control, given the freeze/dry-stage speed differences the patents imply), TCU pump and compressor motors, vacuum pump motors — all standard industrial motor/VFD selection, no freeze-dryer-specific electrical technology involved.
- **ATEX-rated equipment** required in any zone where combustible dust is present at meaningful concentration — most relevantly, around the material collector, filter housing, and product discharge/collection point, where dry, fine pharmaceutical powder is directly handled. See file 09 for the hazard basis; practically, this means selecting motors, sensors, junction boxes, and lighting in that zone with the appropriate Zone 20/21/22 dust rating (per the ATEX equipment-category system) rather than standard industrial-rated hardware.
- **Control power segregation**: standard industrial-panel practice — separate, clearly labeled circuits for control logic (24VDC typical) vs. motor/heater power, with appropriately rated disconnects and e-stop circuits (see file 09) wired independently of the PLC logic so an emergency stop functions even if the PLC itself has faulted.

## 5. Structural frame

- A **skid/frame** supports the vessel, its jacket, the agitator drive assembly above the lid, and (depending on layout) the material collector and vacuum piping.
- Given the vessel's cone-point-down orientation and top-mounted drive, the frame's key structural jobs are: (1) carrying the vessel's dead weight plus full product load at the frame's support points (typically a support ring or lugs partway up the conical shell, not the point-down tip); (2) resisting the agitator drive's reaction torque without transmitting objectionable vibration into the vessel/agitator wall-clearance tolerance (file 05 §3); and (3) providing safe operator access — a platform or steps if the lid/top fittings sit above comfortable reach height, which they will on any vessel above roughly the 60–100 L size range per the Nauta-mixer height-vs-volume table in file 03 §3.
- **Vibration isolation** between rotating equipment (agitator drive, vacuum pumps, refrigeration compressors) and the frame is worth designing in from the start — both for instrument reading stability (a vibrating capacitance manometer or torque sensor is a noisy signal) and for the agitator's tight wall-clearance tolerance, which vibration can effectively close to zero at the worst moment.

## 6. Piping

- **Process/vacuum piping**: sized for the pump's rated flow at the expected operating pressure (see file 11's vacuum pump-down calculation) — vacuum piping in particular should be kept as short and large-diameter as practical, since conductance losses in a low-pressure gas line scale unfavorably with length and unfavorably with the fourth power of a reduction in diameter (standard vacuum-engineering practice, not freeze-dryer-specific).
- **Jacket/TCU piping**: sized for the heat-transfer fluid's flow rate and viscosity at the coldest operating temperature (silicone oil viscosity rises substantially as it approaches −55 °C, which can meaningfully derate a pump's real flow delivery versus its room-temperature-water rating — worth checking against the specific fluid's datasheet rather than assuming).
- **Utility piping** (CIP water, compressed air, steam if SIP-equipped) sized per standard industrial practice for the respective utility.
- All product-contact and CIP/SIP-wetted piping should follow the same **ASME BPE sanitary tube/fitting practice** as the vessel itself (file 05 §4) — orbital-welded (not threaded or manually TIG-stitched) joints, crevice-free fittings, and consistent slope/drainability so no wash or rinse fluid can pool.
