# Hosokawa AFD Pharma Freeze Dryer — Deep Technical Study & Workshop Build Package

**Starting reference:** https://hosokawa-micron-bv.com/technologies/drying/freeze-dryer
**Compiled:** September 2026
**Purpose:** Take a mechanical/process engineer from zero background in freeze-drying to a working understanding of a pharmaceutical Active Freeze Dryer (AFD), with a realistic, staged path toward fabricating as much of an equivalent machine as possible in a private workshop.

---

## How this package is organized

| # | File | What it covers |
|---|---|---|
| 01 | `01_beginner_foundations_and_glossary.md` | Zero-to-basics: what freeze-drying is, why pharma uses it, terminology you need before anything else makes sense |
| 02 | `02_physics_and_thermodynamics.md` | Phase diagram, sublimation, Clausius–Clapeyron, primary/secondary drying, the Pikal heat/mass-transfer model |
| 03 | `03_hosokawa_afd_vs_generic_lyophilizers.md` | **The most important file.** What is actually specific to Hosokawa's AFD (agitated/dynamic, patent-documented) vs. the conventional tray/shelf lyophilizer that dominates textbooks and off-the-shelf parts |
| 04 | `04_system_architecture_and_subsystems.md` | Full machine breakdown — block diagram description and subsystem map |
| 05 | `05_vessel_chamber_agitator_and_materials.md` | Conical vessel, jacket, agitator, drive, seals, ASME BPE / PED, external-pressure design |
| 06 | `06_refrigeration_vacuum_and_condenser_systems.md` | TCU, refrigeration cascade, vacuum pumps/gauges, condenser & AFD's dust/material collector |
| 07 | `07_cip_sip_sealing_insulation_utilities.md` | Clean-in-place, sterilize-in-place, elastomer seals, insulation, utility skid |
| 08 | `08_instrumentation_controls_electrical_structural.md` | Sensors, valves, PLC/HMI/SCADA, 21 CFR Part 11, electrical, structural frame, piping |
| 09 | `09_safety_and_hazard_analysis.md` | Vacuum implosion, refrigerant, electrical, dust-explosion (ATEX), pressure-relief hazards |
| 10 | `10_materials_fabrication_tolerances_workshop_vs_purchased.md` | Stainless grades, surface finish, welding, what a home/small workshop can realistically make vs. must buy |
| 11 | `11_design_calculations_and_sizing_methodology.md` | Worked example calculations: sublimation rate, refrigeration load, condenser sizing, vacuum pump-down time, agitator torque |
| 12 | `12_bill_of_materials_and_system_breakdown.md` (+ `bom/AFD_replica_BOM.xlsx`) | Line-item BOM organized by subsystem, with make/buy flags |
| 13 | `13_drawings_and_schematics_to_create.md` | The drawing package you should produce before cutting metal |
| 14 | `14_validation_qualification_and_gmp_compliance.md` | URS → DQ → IQ → OQ → PQ, GAMP 5, 21 CFR Part 11 — what "pharma-grade" actually requires |
| 15 | `15_commissioning_test_plan.md` | FAT/SAT-style test plan for your own build |
| 16 | `16_build_roadmap_prototype_to_pharma_capable.md` | Staged roadmap: bench prototype → pilot unit → pharma-capable system |
| 17 | `17_maintenance_and_troubleshooting.md` | Preventive maintenance schedule and a symptom → cause → fix troubleshooting matrix |
| 18 | `18_references_and_source_list.md` | Full bibliography: patents, standards, manufacturer literature, papers |

`diagrams/` contains original schematic diagrams (phase diagram, machine cross-section, block diagram, refrigeration cycle, process-cycle time chart) drawn from scratch for this package — none are reproductions of copyrighted manufacturer artwork.

---

## Critical framing — read this before anything else

**The Hosokawa AFD is *not* a conventional tray/shelf freeze dryer.** This is the single most important fact this research uncovered, and it changes what "building one" means.

Almost everything written about "how a pharmaceutical freeze dryer works" — textbooks, most YouTube teardown videos, most surplus-lab-equipment listings — describes a **static tray/shelf lyophilizer**: vials sit motionless on heated/cooled shelves inside a rectangular chamber, with a separate refrigerated ice condenser alongside.

The Hosokawa AFD is a **dynamic, agitated, one-pot freeze dryer**: a jacketed, downward-conical vessel (mechanically the same family as Hosokawa's own Nauta® conical screw mixer) in which the product is frozen *while being stirred*, then dried *while still being stirred*, with the water vapor drawn off through a dust/material collector rather than settling on static shelves. This is confirmed directly by Hosokawa's own marketing copy, its FAQ, and — most usefully for an engineer — **two of its own patents**, which describe the mechanical design in real, citable detail:

- **NL1022668C2 / EP1601919B1**, "Stirred freeze drying," Hosokawa Micron B.V., filed 2003 — the foundational patent for this whole product family.
- **NL2026893B1 / WO2022103268A1**, "Freeze dryer and method for freeze drying," Hosokawa Micron B.V., filed 2020, granted 2022 — describes the current-generation material-collector and valve arrangement, and matches the "new patent" Hosokawa's own news page describes.

File `03` walks through exactly what these patents disclose, in plain language, and separates that from generic/textbook freeze-drying knowledge. **No dimensions, capacities, or performance numbers below are invented** — where Hosokawa doesn't publish something (most detailed dimensions, exact materials of construction, exact vacuum-pump models, exact motor sizes), this package says so explicitly and gives you the generic engineering method to size it yourself instead.

## Scope honesty

- This is **educational and prototyping guidance**, not a validated GMP design package. File `14` draws the line clearly between "a working freeze dryer you built" and "a machine legally allowed to make a drug product for humans."
- Every worked calculation in file `11` is illustrative, using representative/typical numbers from open literature — not Hosokawa's proprietary sizing data, which is not public.
- Refrigeration, vacuum, and pressure/vacuum-vessel work is genuinely hazardous. File `09` is not optional reading.
