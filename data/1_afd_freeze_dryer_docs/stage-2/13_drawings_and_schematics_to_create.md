# 13 — Drawings & Schematics to Create Before Cutting Metal

The five diagrams in `diagrams/` (phase diagram, vessel cross-section, system block diagram, refrigeration cascade, cycle profile) are conceptual/explanatory originals created for this package — they are deliberately not to scale and are not a substitute for the actual engineering drawing package below, which you should develop for your own specific design before fabrication begins.

## Recommended drawing package

| # | Drawing | Purpose | Typical format |
|---|---|---|---|
| 1 | **General arrangement (GA) drawing** | Overall machine footprint, height, service-access clearances, and how all major subsystems (vessel, TCU, vacuum skid, control panel, frame) sit relative to each other | Orthographic views (front/side/top) + isometric |
| 2 | **Vessel fabrication drawing** | Full dimensioned geometry of the conical vessel and jacket: shell thickness, cone angle, cylindrical section height (if used), jacket compartment dimensions, all nozzle/port locations with size and orientation, support-lug locations | Detailed fabrication drawing, code-stamped if pursuing a certified pressure/vacuum vessel |
| 3 | **Agitator drawing** | Mixing-element geometry (screw/paddle/ribbon), shaft dimensions, wall-clearance callouts at multiple heights up the cone, drive-end interface | Fabrication drawing with clearance tolerances explicitly called out (file 05 §3, file 10 §3) |
| 4 | **Process & Instrumentation Diagram (P&ID)** | Every process line, valve, instrument, and interlock in the system, using standard ISA/ANSI instrumentation symbols — the single most important document for both build and later validation/commissioning | Standard P&ID symbology; this is the document file 04's block diagram should evolve into once your design is fixed |
| 5 | **Piping isometrics** | Physical routing of vacuum lines, jacket fluid lines, CIP/SIP lines, and utility lines, with support locations | Standard isometric piping drawings |
| 6 | **Electrical single-line diagram** | Power distribution from main disconnect through to every motor, heater, and control circuit, with breaker/fuse ratings | Standard electrical single-line format |
| 7 | **Control panel layout & wiring diagram** | Physical panel layout and full point-to-point wiring for the PLC/HMI system | Standard electrical panel drawing practice |
| 8 | **I/O list** | Every PLC input and output, tag name, signal type, range, and the field device it connects to | Spreadsheet/table, cross-referenced to the P&ID |
| 9 | **Hazardous-area (ATEX) zoning drawing** | Marked-up GA or floor plan showing Zone 20/21/22 dust boundaries around the material collector/discharge area, and the equipment rating required in each zone | Overlay on the GA drawing, developed alongside the Dust Hazard Analysis (file 09) |
| 10 | **Structural frame/skid drawing** | Frame member sizes, support-point locations matching the vessel's actual lug/support-ring positions, foundation/floor loading | Standard structural fabrication drawing |
| 11 | **CIP/SIP schematic** | Spray coverage, chemical dosing points, steam distribution points and traps (if SIP-equipped) | Schematic, cross-referenced to the P&ID |
| 12 | **Cycle/recipe logic flowchart** | The actual control-system sequence: every step, transition condition, interlock check, and alarm condition through charge → freeze → primary dry → secondary dry → discharge → CIP/SIP | Flowchart, becomes the basis for PLC program structure and later OQ test scripts (file 14) |

## Suggested sequencing

Per the staged fabrication approach in file 10 §4: produce drawings 1–3 first (vessel/agitator geometry) alongside your file-11 sizing calculations, prove the geometry with a non-vacuum mockup, *then* finalize drawing 2 for the real vacuum-rated vessel commission. Drawings 4, 8, and 12 (P&ID, I/O list, cycle logic) should be developed together, since each constrains the others — a common and efficient practice is to draft the cycle logic flowchart first (what does the machine actually need to do, step by step), derive the P&ID from what that logic requires the machine to sense and actuate, and derive the I/O list directly from the finished P&ID.
