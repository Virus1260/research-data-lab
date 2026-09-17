# 17 — Maintenance & Troubleshooting

## 1. Preventive maintenance schedule (generic starting point — tune against your own experience)

| Item | Check | Suggested frequency |
|---|---|---|
| Vacuum system leak rate | Rate-of-rise test (file 15 Stage 3) | Before each batch, or weekly at minimum |
| Agitator seal / magnetic coupling | Visual inspection; for shaft seals, check for wear/leakage signs | Monthly, or per manufacturer's wear-part schedule |
| Agitator wall clearance | Physical check (where accessible) or trend agitator torque/current for gradual changes suggesting wear or buildup | Quarterly, or immediately if torque baseline drifts |
| Lid/port seals and gaskets | Visual inspection for compression set, cracking, or chemical degradation | Monthly; replace on any visible degradation, not just on failure |
| Filter element (material collector) | Differential pressure trend (file 08 §1); physical inspection/replacement | Per ΔP trend and/or product-contact hygiene schedule |
| TCU heat-transfer fluid | Check for degradation (silicone oil can oxidize/degrade over time and high-temperature exposure, especially post-SIP-adjacent heat cycling) | Per fluid manufacturer's service-life guidance |
| Refrigeration system | Refrigerant charge/pressure check, oil level (if applicable), condenser cleanliness | Per refrigeration technician's standard schedule; **refrigerant work requires appropriately certified personnel** (file 09 §2) |
| Calibration (all instruments) | Recalibrate against a traceable standard | Per instrument manufacturer's recommendation, typically annually, more often for critical control instruments |
| Structural frame / vibration isolators | Visual inspection, fastener torque check | Semi-annually |
| Electrical panel | Thermal imaging scan of connections (loose connections show as hot spots), insulation resistance spot-checks | Annually |
| ATEX-zone equipment | Confirm rated equipment remains correctly installed/undamaged; confirm no unrated equipment has been introduced into the zone | Per site electrical-safety schedule, and after any modification |

## 2. Troubleshooting matrix

| Symptom | Likely causes (roughly most → least common) | Where to look |
|---|---|---|
| Vacuum won't reach target base pressure | Leak (seal, gasket, valve stem); pump underperforming/worn; outgassing from a dirty/contaminated vessel | File 15 Stage 3 leak test methodology; file 06 §3 pump selection; recheck CIP effectiveness |
| Pirani and capacitance manometer readings diverge persistently, even on an empty/dry vessel | Gauge calibration drift; gauge contamination | Recalibrate per instrument schedule (§1 above); file 06 §3b |
| Pirani/capacitance gap never closes during a "finished" batch | Primary drying genuinely incomplete — product still subliming | Extend primary drying time; revisit file 11's sublimation-rate calculation against your actual measured jacket ΔT and heat-transfer coefficient |
| Product temperature exceeds intended limit during primary drying | Jacket temperature setpoint too aggressive for this product; insufficient vacuum (chamber pressure too close to the product's ice vapor pressure, reducing the driving force) | File 02 §3 (collapse temperature); reduce jacket setpoint; verify actual chamber pressure via capacitance manometer, not just Pirani |
| Agitator torque/current trending upward over multiple batches | Product buildup/caking reducing effective wall clearance; seal degradation increasing friction; bearing wear | File 10 §3; inspect agitator and wall clearance at next planned access; review CIP effectiveness |
| Agitator torque spikes sharply during freezing stage | Expected to some degree (this is the normal signature of the mass solidifying, file 04 step 3) — investigate only if spikes are large enough to trip a drive fault or exceed your established baseline significantly | File 15 Stage 5 baseline data is your reference point |
| Uneven/inconsistent drying across a batch | Agitation not achieving uniform bed turnover (geometry or speed issue); jacket temperature not uniform around the vessel (TCU flow-distribution issue) | File 05 §3 agitator design; file 08 §1 jacket RTD comparison (supply vs. return, and if multiple zones, zone-to-zone) |
| Filter differential pressure rising rapidly / frequent blowback needed | Product particle size finer than expected for the filter media selected; filter media degrading | File 06 §4; reconsider filter mesh rating for your specific product |
| CIP cycle leaves visible residue (riboflavin-test "shadows," file 15 Stage 7) | Spray coverage gap (nozzle placement/orientation); insufficient flow, temperature, or chemical concentration; a genuine dead-leg or crevice in the piping/vessel design | Review nozzle coverage geometry; check CIP skid parameters against design cycle; review for BPE sanitary-design violations (file 05 §4, file 08 §6) introduced during fabrication |
| SIP fails to reach sterilizing temperature at some monitored point | Steam trap malfunction; undersized steam supply; a cold spot / dead leg in the piping | Heat-distribution study data (file 15 Stage 7); review piping isometrics (file 13) for dead legs |
| Refrigeration system can't reach target low-stage temperature | Undersized for actual heat load; refrigerant charge low (leak); cascade heat exchanger fouled/undersized | File 06 §2 sizing review; refrigeration technician inspection (file 09 §2 — certified personnel required) |
| Nuisance e-stop / interlock trips | Sensor drift or miscalibration; genuine intermittent fault worth taking seriously rather than bypassing | **Never bypass a safety interlock to "solve" nuisance tripping** — investigate and fix the root cause (file 09 §5) |

## 3. A general troubleshooting principle worth stating explicitly

Every symptom above should be diagnosed against the **baseline data you deliberately collected during commissioning** (file 15) — empty-vessel torque, calibration certificates, leak rate, jacket ΔT at steady state, and so on. Troubleshooting a system with no recorded baseline is troubleshooting blind; the discipline recommended in file 15's closing note pays for itself here.
