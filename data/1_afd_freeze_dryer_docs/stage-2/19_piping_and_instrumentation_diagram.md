# 19 — P&ID: How to Read It, and the Full Diagram for This Machine

If P&IDs feel intimidating, it's usually because nobody first explained that **a P&ID is just a map with a very consistent alphabet.** Once you know the alphabet, any P&ID — this one, or a refinery unit twenty times more complex — reads the same way. This file teaches the alphabet, then gives you the actual diagram for this machine.

See `diagrams/pid_afd_freeze_dryer.png` for the full drawing. A machine-readable version of the same information lives in `pid_controls_data/pid_data_model.json` (equipment, instruments, valves, and lines as structured data — see §5).

## 1. The alphabet: ISA 5.1 instrument tags

Every bubble on a P&ID has a short code in it, like `PIT-101A` or `TIC-201`. This is standardized by **ANSI/ISA-5.1** ("Instrumentation Symbols and Identification"), and it always decodes the same way:

```
[First letter]  [more letters]  -  [loop number]  [suffix]
     ↓                ↓                ↓             ↓
  WHAT it measures  WHAT it does   which loop    A/B if there
                                   it belongs to  are two of them
```

**First letter — what's being measured:**

| Letter | Measures |
|---|---|
| P | Pressure (or vacuum) |
| T | Temperature |
| F | Flow |
| L | Level |
| A | Analysis (composition — e.g. O₂ concentration) |
| S | Speed |
| J | Power / torque-related |
| Z | Position |

**Later letters — what the instrument *does*:**

| Letter | Function |
|---|---|
| T | Transmitter — measures continuously and sends a signal |
| I | Indicator — just displays a value locally |
| C | Controller — compares the measurement to a setpoint and calculates an output |
| S | Switch — trips at one threshold (not a continuous signal) |
| V | Valve |
| E | Element — the raw sensor itself (e.g. an RTD) |

So: `PIT-101A` = **P**ressure, **I**ndicating, **T**ransmitter, loop 101, unit "A" (because this machine deliberately has two pressure sensors on the same vessel — see §3). `TIC-201` = **T**emperature **I**ndicating **C**ontroller, loop 201. Once you can do this decoding, every tag on the diagram stops being a mystery symbol and starts being a sentence.

**Bubble shape also carries meaning:** a plain circle is a **field-mounted** instrument (a local gauge or sensor with no display in the control room). A circle with a horizontal line through it is a **control-system point** — its value lives in the PLC/HMI (the BPCS — see file 20). On this diagram, instruments with a **red** circle instead of black are **Safety Instrumented Functions (SIS)** — deliberately drawn differently because they live on a completely separate, independent safety system from everything else (file 20 explains why that separation matters so much).

## 2. Line types

- **Solid black line** — process piping (product, vapor, gas actually flowing).
- **Blue line** — utility piping (jacket heat-transfer fluid, refrigerant).
- **Red solid line** — clean steam (SIP), where fitted.
- **Grey dashed line** — an instrument signal going to the ordinary control system (BPCS).
- **Red dashed line** — an instrument signal going to the safety system (SIS) instead.

## 3. Walking the diagram, subsystem by subsystem

Start at the vessel (`V-101`, center) and work outward — this mirrors how the process actually flows (file 04's cycle steps):

- **Jacket loop (left):** `TCU-201` circulates heat-transfer fluid to the vessel jacket. `TT-201`/`TT-202` measure supply and return temperature; `TIC-201` compares supply temperature to the recipe's current setpoint and drives `FCV-201` to open or close, changing how much conditioned fluid reaches the jacket. `PKG-301` (cascade refrigeration) supplies the cold duty `TCU-201` needs to reach the low temperatures the freezing stage requires.
- **Agitator (top of vessel):** `M-101` is the drive motor. `SIC-101` is its speed setpoint from the BPCS. `JIT-101` reads back torque/current — this is your window into what's physically happening inside the vessel (a torque climb during freezing is expected; an unexpected climb later is a fault signal — file 17).
- **Vessel pressure — deliberately measured twice:** `PIT-101A` (capacitance manometer, true pressure) and `PIT-101B` (Pirani gauge, reads high when water vapor dominates the atmosphere). `PIC-101` controls off the accurate one (`PIT-101A`) and drives `PV-102`. The *gap* between A and B closing is how you know primary drying has finished — this is genuinely one of the more elegant ideas in the whole design (file 06 §3b).
- **Vapor path (right of vessel):** vapor leaves the vessel through `PV-102` (which both throttles pressure and, per the actual Hosokawa patent this design follows, can let ice particles fall back into the vessel early in the cycle) or through the `XV-103` bypass once real drying is underway, into `V-102` (the material collector/dust filter, where `PDT-102` watches for a clogging filter), then to `E-101` (a conventional refrigerated condenser to actually catch the water vapor), then to the vacuum pump train `PKG-401`.
- **Safety devices, drawn deliberately distinctly:** `VRV-101` is a passive mechanical vacuum-relief valve — it needs no power or signal to work, which is exactly the point for a safety device (file 09 §1). `ZS-101` and `PSH-101` are red because they belong to the SIS, not the BPCS — file 20 explains why that's non-negotiable, and file 22 gives you the full interlock logic they participate in.
- **Bottom of vessel:** `XV-105`, the ball-segment discharge valve, dumps the finished batch to the product canister.
- **CIP/SIP (bottom):** `PKG-501` supplies the wash cycle (`FT-501` confirms flow); `PKG-502` (dashed box — optional) supplies clean steam for sterilization, with `TT-503` representing the *multiple* physical RTDs a real heat-distribution study needs (file 15 Stage 7), and `PSV-501` as its own passive safety relief.

## 4. Why some tags repeat the same letter twice on purpose

You'll notice `PIT-101A` and `PIT-101B` share the loop number 101. That's intentional, not a mistake — it tells you at a glance "these two instruments are measuring the same thing, for the same purpose, as a pair" (file 06 §3b's comparative-pressure method). Real P&IDs use this constantly: shared loop numbers mean "these belong together," independent of how many separate bubbles are drawn.

## 5. The structured data behind this diagram

`pid_controls_data/pid_data_model.json` encodes every piece of equipment, instrument, valve, and line shown above as plain JSON (nodes and edges) rather than only as a picture. This is deliberately shaped so it can later drive an **interactive** version of this same diagram — for example, as a clickable SVG in your Research Data site (your "Refrigeration Cascade Diagram" simulator concept from that project extends naturally to a full clickable P&ID) — without anyone needing to re-digitize a static image first. `pid_controls_data/io_list.csv` is the flat instrument/signal list in spreadsheet form, useful directly for PLC I/O configuration or for cross-checking against your SolidWorks model's fittings and nozzles once you get there.

## 6. What's illustrative vs. what's fixed

The tag numbers, exact valve types, and layout here are **this package's own consistent numbering scheme**, not a Hosokawa document — Hosokawa doesn't publish a P&ID for the AFD. What *is* grounded in the real machine: every subsystem shown, the dual-gauge pressure philosophy, the vessel-to-collector valve/bypass behavior, and the overall vapor path sequence all come directly from the two Hosokawa patents and the generic engineering practice covered in files 03–08. Treat the specific tag numbers as yours to keep, rename, or renumber to match whatever convention your SolidWorks/PDM setup ends up using — what matters is that the *logic* they represent is sound.
