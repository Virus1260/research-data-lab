# 14 — Validation, Qualification & GMP Compliance

This file draws the sharpest line in the whole package: **a working freeze dryer** and **a machine legally and technically qualified to manufacture a human drug product** are very different achievements, and the gap between them is mostly paperwork, process, and independent verification — not, at this point, further mechanical engineering.

## 1. The regulatory framework, at a glance

| Element | What it is | Applies to |
|---|---|---|
| **cGMP** (FDA 21 CFR Parts 210/211; EU GMP) | The overarching "current Good Manufacturing Practice" regulatory framework a facility must operate under to legally manufacture drug product for humans | The facility, the process, and every piece of equipment used in it |
| **GAMP 5** | ISPE's risk-based framework for validating computerized/automated systems (the PLC/HMI/SCADA layer, file 08 §3) | Your control system's software, specifically |
| **21 CFR Part 11** | FDA rule on electronic records/signatures — audit trails, access control, e-signatures | Any electronic batch record, data historian, or e-signature workflow on the machine |
| **ASME BPE / PED** | Equipment design standards (files 05, 10) | The physical hardware's sanitary design and, in the EU, its pressure-equipment conformity |
| **ICH Q7 / Q8 / Q9 / Q10** | International harmonized guidelines on GMP for APIs, quality-by-design, quality risk management, and pharmaceutical quality systems respectively | The broader quality system your equipment sits inside |

None of these are things a single piece of equipment "has" in isolation — they describe a **documented, verified system of design, build, test, and ongoing control** around the equipment, executed by (or under) a licensed manufacturer's quality system.

## 2. The qualification lifecycle: DQ → IQ → OQ → PQ

| Stage | Question it answers | When | Typical evidence generated |
|---|---|---|---|
| **URS** (User Requirements Specification) | What must this equipment do? | Before design | A written specification document — batch size, cycle parameters, materials, utilities, regulatory targets |
| **DQ** (Design Qualification) | Does the design meet the URS? | Before procurement/fabrication | Design review record, vendor/fabricator assessment, material compatibility review |
| **IQ** (Installation Qualification) | Was it installed exactly as specified? | At installation, one-time | Serial/model verification, utility-connection checks, calibration baseline for every instrument, P&ID/drawing reconciliation, safety-interlock confirmation |
| **OQ** (Operational Qualification) | Does it operate correctly across its full specified range, including worst-case/boundary conditions? | After IQ, before routine use | Challenge tests at range limits, alarm/interlock functional tests, control-loop tuning verification, negative testing (deliberately trying to make it fail safely) |
| **PQ** (Performance Qualification) | Does it perform consistently under real production conditions? | After OQ, using real/representative product | Multiple consecutive production-representative batches meeting pre-defined acceptance criteria |

**Equipment qualification is a prerequisite for, but distinct from, process validation** — process validation proves that the *manufacturing process* (using this now-qualified equipment) reliably produces drug product meeting its specification; equipment qualification only proves the *machine itself* is installed and behaves correctly.

## 3. What this means concretely for a freeze dryer specifically

- **IQ** would verify, among other things: the vessel/agitator match the fabrication drawings (file 13); every instrument (RTDs, pressure gauges, torque sensor) has a current calibration certificate; utility connections (electrical, compressed air, refrigerant, steam if SIP-equipped) match the design; safety interlocks (file 09 — lid interlock, e-stop circuit) are present and function.
- **OQ** would challenge, at minimum: full vacuum hold (leak-rate test — see file 15), jacket temperature control across its full range including the coldest and hottest setpoints, agitator speed range, CIP cycle parameter accuracy (flow, temperature, time), SIP heat distribution/penetration (if SIP-equipped — a dedicated study confirming every point in the sterilized boundary reaches and holds the required temperature), and every alarm/interlock deliberately triggered to confirm correct response.
- **PQ** would run multiple real (or representative-placebo) batches end-to-end and confirm the resulting product consistently meets its specification (residual moisture, particle characteristics, sterility if aseptic) — this is where the process-development work (finding the right freeze rate, primary/secondary drying temperatures and times, using the physics in file 02) actually gets locked in as a validated recipe.
- **Software validation** (GAMP 5) of the PLC/HMI/historian system runs in parallel, risk-categorized by how customized the software is — a standard, unmodified PLC platform needs less rigor than a heavily custom recipe-management application built on top of it.
- **21 CFR Part 11** compliance is assessed against the specific electronic-record and e-signature functionality actually implemented — audit trail completeness, user-access control, and e-signature binding are the most commonly cited gap areas in FDA inspection findings, per current industry validation literature.

## 4. Where this package's own claims stop

- Everything in files 02–11 describes sound, citable engineering practice and, where used, Hosokawa's own patent-disclosed design detail. **None of it constitutes a URS, a DQ record, or any part of an actual qualification package** — those documents must be written against your specific design, your specific intended product, and your specific regulatory jurisdiction, typically by or with a quality/validation professional.
- A prototype or even a very well-built pilot-scale replica constructed by following this package is a **learning and engineering-development platform**. It does not become GMP-compliant equipment by virtue of being well-built — that status is conferred by the qualification and quality-system process above, run inside a licensed manufacturing organization, not by the hardware alone.
- If your ultimate goal genuinely is producing a drug product for human or animal use, the realistic path is: use this package (and the roadmap in file 16) to build engineering competence and a working prototype, then partner with (or be employed by/build within) an organization that has, or is building, the full quality system, regulatory relationships, and licensed facility this framework requires — not to attempt to self-certify a home-built machine as GMP equipment.
