# 15 — Commissioning Test Plan (FAT/SAT-Style, for Your Own Build)

This is a practical test plan for bringing your own build to life safely and methodically — modeled on the industry-standard Factory Acceptance Test (FAT) / Site Acceptance Test (SAT) approach, scaled to a self-build project rather than a formal GMP qualification (that's file 14's subject). Run these in order; do not skip ahead to vacuum or thermal testing before the earlier mechanical/electrical checks pass.

## Stage 1 — Pre-power mechanical checks
- [ ] Vessel and all pressure/vacuum-boundary welds visually inspected; NDE reports (if commissioned) reviewed and accepted.
- [ ] Agitator rotates freely through a full revolution by hand, at every point along the cone, with no contact — verify the wall-clearance target (file 05 §3) at multiple heights, not just at one point.
- [ ] All fasteners (lid clamp, support lugs, frame) torqued to spec.
- [ ] All seals/gaskets correctly seated and undamaged.
- [ ] Insulation and cladding installed per design; no exposed cold/hot surfaces left unprotected (file 09 §2).

## Stage 2 — Electrical pre-commissioning (power off, then controlled power-on)
- [ ] Continuity and insulation-resistance ("megger") testing on all motor and heater circuits before first energization.
- [ ] E-stop circuit tested **independently of the PLC** — confirm it cuts power even with the PLC deliberately faulted/powered down.
- [ ] Lid/access interlock tested — confirm the interlock physically prevents (or immediately alarms/stops) operation when the lid is open, and prevents lid release when the interlock condition (e.g., vessel at atmospheric pressure) is not met.
- [ ] All instrumentation calibrated and calibration certificates/records retained *before* first use — this becomes your IQ baseline if you later pursue formal qualification (file 14).
- [ ] Motors bumped individually (very briefly, uncoupled if practical) to confirm correct rotation direction before running against real load.

## Stage 3 — Empty-vessel vacuum and leak testing
- [ ] **Rate-of-rise leak test**: pump the empty vessel down to your target base pressure, isolate the vacuum pump, and record pressure rise over a fixed time (e.g., 10–30 minutes). A well-sealed system should show a slow, near-linear rise dominated by real outgassing, not a rapid climb indicating a gross leak. Compare against your own baseline each time you retest — a rising leak rate over successive tests is an early-warning sign worth investigating before it becomes a process problem.
- [ ] Confirm both Pirani and capacitance-manometer readings agree closely on a dry, empty, leak-tight vessel (file 06 §3b) — a persistent gap here with no water vapor present indicates a gauge calibration issue, not a real pressure difference.
- [ ] Test the vacuum isolation valve and bypass valve (file 06 §5) through all their positions (open/closed/throttled) and confirm position feedback matches actual valve state.
- [ ] Test the vent/break valve — confirm a controlled, not sudden, return to atmosphere.

## Stage 4 — Empty-vessel thermal (TCU/jacket) testing
- [ ] Run the TCU through its full temperature range with the vessel empty, confirming stable control at both temperature extremes and reasonable ramp rates.
- [ ] Confirm jacket supply/return RTDs track each other sensibly (a persistently large ΔT across the jacket at steady state may indicate a flow-distribution problem worth investigating before running product).
- [ ] Confirm no external condensation/frost forms anywhere it shouldn't (insulation effectiveness check, file 07 §4).

## Stage 5 — Agitator functional/load testing
- [ ] Run the agitator empty across its full speed range; record baseline torque/current (file 08 §1) — this becomes your reference for detecting abnormal load during real product runs.
- [ ] Repeat with an inert test load (e.g., an inexpensive placebo granular/powder material, or plain water ice if your first test doesn't need to preserve product-contact cleanliness) approximating your intended batch, to get a realistic loaded-torque baseline *before* your first real product run.

## Stage 6 — Integrated cold/vacuum test (no product, or an inert placebo)
- [ ] Run a full simulated cycle (charge placeholder, freeze, vacuum draw, simulated primary/secondary "drying" — even just holding temperature/vacuum through the equivalent time — vacuum release, discharge) end-to-end, watching for any interaction effects between subsystems that didn't show up in isolated testing (e.g., agitator torque behavior actually at cryogenic temperature, valve actuation timing at real cycle speed).
- [ ] Confirm the material-collector valve/bypass sequencing (file 06 §5, file 03 §2b) behaves as designed through a simulated cycle.
- [ ] Confirm filter blowback/purge functions and correctly routes material to the collection hopper.

## Stage 7 — CIP (and SIP, if equipped) commissioning
- [ ] Run a full CIP cycle and visually verify spray coverage reaches every internal surface (a "riboflavin test" — coating internal surfaces with a UV-fluorescent riboflavin solution before CIP, then inspecting under UV light afterward for any uncleaned "shadow" spots — is a standard, cheap, and very effective industry technique worth using here).
- [ ] If SIP-equipped: run a heat-distribution study (multiple temporary RTDs at various points through the sterilize boundary) confirming every point reaches and holds your target sterilizing temperature for the intended hold time before relying on SIP for anything safety-critical.

## Stage 8 — First real product run
- [ ] Only after Stages 1–7 pass, run your first genuine product batch, instrumented as heavily as practical (log everything), and compare actual sublimation rate, cycle time, and product outcome against your file-11 design calculations — use any significant gap as the trigger to revisit your assumed heat-transfer coefficient, refrigeration sizing, or agitator behavior, rather than assuming the calculation was simply "wrong."

## A note on documentation discipline

Keep dated, signed records of every stage above from day one, even for a hobbyist/prototype build with no regulatory obligation to do so. Two independent reasons: (1) it is simply good engineering practice that will save you enormous troubleshooting time later (file 17), and (2) if this project ever does progress toward file 14's more formal path, this same discipline — done consistently and contemporaneously — is exactly what a later IQ effort would need to either directly reuse or use as a credible starting point.
