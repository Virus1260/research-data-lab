# 21 — Batch Sequence & Operating Cycle (ISA-88 Structure)

See `diagrams/isa88_batch_structure.png` for the diagram this file explains.

## 1. Why structure the recipe at all, instead of just writing PLC code

The tempting approach is to write one long PLC program that does "step 1, then step 2, then step 3...". It works, right up until you need to change one step, add a second vessel, or explain to someone else what the machine actually does — at which point a flat, unstructured program becomes very hard to safely modify. **ISA-88 (also published as IEC 61512)**, the international batch-control standard, solves this by breaking any batch process into four nested levels that stay the same regardless of what you're actually manufacturing:

```
PROCEDURE  (the whole recipe: "Freeze-Dry Batch")
   └── UNIT PROCEDURE  (a major stage: "Freeze", "Dry", "Discharge", "Clean/Sterilize")
          └── OPERATION  (a meaningful chunk of work: "Primary Drying")
                 └── PHASE  (the smallest reusable, testable unit of logic: "Ramp jacket temperature")
```

**Phases are the important idea.** A phase is small enough to test in isolation, and — this is the payoff — genuinely reusable. "Vacuum-induced freeze" as a phase doesn't care whether it's phase 3 of today's recipe or phase 7 of a future recipe on a second vessel; it's the same tested block of logic either time. This is exactly the property that makes a control system maintainable as it grows, and it's why this structure, not a flat program, is what actually lives inside the BPCS (file 20).

## 2. This machine's cycle, mapped onto that structure

| Unit Procedure | Operations | Phases |
|---|---|---|
| **Freeze** | Charge & Pre-cool | Load product · Start jacket cooldown |
| | Freeze | Vacuum-induced freeze · Hold at set temperature |
| **Dry** | Primary Drying | Ramp jacket temperature · Hold vacuum setpoint · Monitor `PIT-101A`/`PIT-101B` convergence |
| | Secondary Drying | Raise jacket temperature · Hold vacuum · Timed desorption hold |
| **Discharge** | End-of-Cycle | Filter blowback purge · Post-blend in vessel |
| | Discharge | Vacuum release · Open `XV-105` · Confirm empty (`LG-101`) |
| **Clean/Sterilize** | CIP | Pre-rinse · Chemical wash · Final rinse · Air dry |
| | SIP (optional) | Steam admit · Heat-distribution hold · Steam vent/cooldown |

This is the same nine-step cycle already walked through narratively in file 04 §2 — ISA-88 is simply the formal, industry-standard way of writing that same cycle down so a PLC program (and the people maintaining it) can treat each piece as an independent, testable building block instead of one monolithic script.

## 3. How a phase actually behaves (the part that removes the "PLC code = magic" feeling)

Every phase, regardless of what it does physically, follows the same simple state pattern — this is the other half of what ISA-88 standardizes, and it's worth internalizing because it's the same pattern in every phase you'll ever write for this machine:

```
IDLE → (start command) → RUNNING → (complete condition met) → COMPLETE
                             │
                             ├── (hold command) → HELD → (resume) → RUNNING
                             └── (abort/fault condition) → ABORTING → ABORTED
```

Take "Hold vacuum setpoint" as a concrete example: it goes **RUNNING** when the primary-drying operation starts it; it stays RUNNING as long as `PIC-101` is successfully holding pressure near setpoint; it goes to **COMPLETE** when the recipe's time or convergence condition (§4 below) is satisfied; and if `PDT-102` trips high or the SIS fires (file 22), it goes to **ABORTING** and then **ABORTED**, handing control to whatever safe-state logic that fault requires. Every phase in the table above can be described this same way — once you've written the state pattern for one phase, you already understand the shape of all of them.

## 4. A genuinely useful transition condition: ending Primary Drying automatically

Most phase transitions are simple (a timer expires, an operator confirms something). One transition on this machine is worth calling out because it's a real, elegant piece of process logic: the **Primary Drying → Secondary Drying** transition can be driven automatically by watching the gap between `PIT-101A` (true pressure) and `PIT-101B` (Pirani, reads high while water vapor dominates) close to a small, near-zero value (file 06 §3b, file 19 §3) — rather than by guessing a fixed drying time and hoping it's long enough. This is a good first target for your own control logic once you have a working prototype, because it's directly observable and testable against real data (file 15's commissioning plan asks you to log exactly this).

## 5. Recipe vs. equipment — the other half of ISA-88

ISA-88 also separates **what you want to do** (the recipe: target temperatures, hold times, vacuum setpoints — the "formula") from **how the equipment physically does it** (the phase logic wired to `TIC-201`, `PIC-101`, etc.). In practice this means: if you later need to run a *different* product with different hold times and temperatures on the *same* machine, you write a new recipe (a new set of parameters) rather than a new PLC program. This is the standard's biggest practical payoff for anyone planning to iterate on process development (file 16's roadmap) rather than build one fixed, never-changing cycle.
