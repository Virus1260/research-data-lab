# 01 — Beginner Foundations & Glossary

## What freeze-drying actually is

Freeze-drying (lyophilisation) removes water (or another solvent) from a product by:
1. **Freezing** it solid.
2. Pulling a **vacuum** low enough that the ice can turn directly into vapor without ever passing through liquid water — this is **sublimation**.
3. Optionally, at the end, warming the now-dry product slightly under vacuum to pull out the last traces of water that were bound to the product rather than frozen as ice (**secondary drying / desorption**).

The payoff: because the product is never exposed to liquid water or high heat, delicate molecules (proteins, live cells, antibiotics, vaccines) survive the process largely undamaged, and the dried product is extremely stable in storage — often for years at room temperature — because there's essentially no water left for chemistry or microbes to happen in.

## Why pharma cares specifically

Most drugs that are freeze-dried are **not stable as a liquid**: proteins unfold, antibiotics degrade, live biologics die. Freeze-drying is the industry's default answer whenever "make it a stable powder without cooking it" is the requirement. Roughly a third of licensed biologic/injectable drug products on the market today are lyophilized, a proportion that has only grown as more of the pipeline shifts toward large, fragile molecules — this fits with the freeze-drying literature's own numbers, e.g. Hosokawa's 2003 patent states that at the time, freeze-drying was already used for around 30% of antibiotics, 90% of macromolecule biologics, and 50% of electrolyte drugs manufactured (a manufacturer's own figure from that era, cited here as context, not as a current market statistic).

## The three-stage process, in slightly more depth

| Stage | What happens | Typical duration (shelf-type lyophilizer, vial-scale) |
|---|---|---|
| **Freezing** | Solution/suspension is cooled below its freezing point until essentially all free water has crystallized as ice | 1–4 hours |
| **Primary drying** | Chamber is evacuated; ice sublimes directly to vapor, which travels to a cold surface (condenser) and re-freezes there. Removes ~90–95% of total water. | Hours to days — this is the slow, expensive stage |
| **Secondary drying** | Shelf/jacket temperature is raised (product stays under vacuum) to desorb water that was bound to the solid matrix rather than frozen. Brings residual moisture down to typically <1–3% | Several hours |

## Terms you need before the rest of this package makes sense

- **Sublimation** — a solid converting directly to vapor without passing through the liquid phase. Only possible below a substance's *triple point* pressure (see file 02).
- **Triple point** — the unique temperature/pressure combination at which a substance's solid, liquid, and vapor phases all coexist in equilibrium. For pure water this is 0.01 °C at 6.11 mbar (611 Pa). Below this pressure, ice can only sublime or stay solid — it cannot melt.
- **Collapse temperature (Tc) / glass transition temperature (Tg')** — the maximum product temperature you can allow during primary drying before the frozen structure loses its rigidity and collapses into a shrunken, glassy mass instead of a nice porous cake. This, not "how cold can the freezer go," is usually what sets your primary-drying shelf/jacket temperature.
- **Lyophilizer / freeze dryer** — used interchangeably in industry.
- **Cake** — the classic result of tray/shelf freeze-drying: a dry, porous, but structurally intact plug of product sitting in the shape of the vial or tray it was frozen in.
- **Bulk / powder freeze-drying** — freeze-drying a large batch as loose granules or powder rather than as individual vial "cakes." This is what the AFD does — see file 03.
- **Shelf freeze dryer / tray dryer** — the conventional design: a rectangular chamber with a stack of flat, hollow shelves, each carrying a heat-transfer fluid, on which trays of vials sit motionless.
- **Stirred / agitated freeze dryer** — the AFD's family: a jacketed vessel in which the product is continuously or intermittently moved (by an internal screw, paddle, or ribbon) rather than sitting still on a shelf.
- **Product chamber / drying chamber / lyophilisation chamber** — the vessel that actually holds the product during freezing and drying.
- **Condenser (ice condenser)** — a refrigerated surface, colder than the product, on which the sublimed water vapor re-freezes. Present in essentially all vacuum freeze dryers in some form; see file 06 and file 03 for how the AFD's dust/material collector differs from a classic ice condenser.
- **TCU — Temperature Control Unit** — an external skid that heats and cools a heat-transfer fluid (silicone oil, water/glycol, etc.) and pumps it through a vessel's jacket or a shelf stack. Standard industrial-reactor terminology, and one of the named subsystems on Hosokawa's own AFD page.
- **CIP — Clean-In-Place**: an automated cleaning cycle (water rinse → chemical wash → rinse → dry) run through the equipment's own piping/spray devices, with no disassembly.
- **SIP — Sterilize/Steam-In-Place**: an automated sterilization cycle, typically saturated steam above 121 °C, run through the equipment in place.
- **GMP — Good Manufacturing Practice**: the regulatory framework (FDA 21 CFR Parts 210/211 in the US, EU GMP) that governs how a facility legally allowed to make human drug product must operate, document, and validate its equipment.
- **GAMP 5** — an ISPE-published, risk-based framework for validating the *software/automation* of GMP equipment.
- **21 CFR Part 11** — the FDA regulation governing electronic records and electronic signatures; relevant to any PLC/HMI/data-historian system on a GMP freeze dryer.
- **IQ / OQ / PQ** — Installation / Operational / Performance Qualification: the three-stage proof, required under GMP, that a specific piece of equipment was installed correctly, operates within its specified ranges, and performs consistently in real production. See file 14.
- **ATEX** — the EU directive framework (and by extension, the general hazard category) for equipment operating where combustible dust or gas atmospheres may occur. Freeze-dried powders are frequently combustible dusts — see file 09.
- **ASME BPE** — "Bioprocessing Equipment," an ASME standard specifying sanitary design, materials, surface finish, and joining methods for pharma/biotech process equipment. See files 05 and 10.
- **PED** — the EU Pressure Equipment Directive (2014/68/EU), the European equivalent framework to ASME Section VIII for pressure (and vacuum) vessel design/certification.
- **Nauta® mixer** — Hosokawa's trademarked conical screw mixer, invented 1939, acquired by Hosokawa in 1982. Mechanically, the AFD's vessel is built on the same conical-vessel-plus-orbiting-screw concept — this is the single most useful "way in" for understanding the AFD's mechanical design, and is expanded on heavily in file 03.

## Reading order recommendation

If you have zero background: read this file, then 02, then 03, in order — those three build the conceptual foundation everything else depends on. Once you understand *why* the AFD is architecturally different from what most freeze-drying literature describes, files 04 onward will make far more sense, because you'll know which claims in generic literature transfer directly and which don't.
