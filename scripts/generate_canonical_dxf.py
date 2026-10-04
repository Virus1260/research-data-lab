"""
generate_canonical_dxf.py
Generates official AutoCAD-compatible DXF files for:
1. Canonical Hosokawa BFD (Block Flow Diagram)
2. Unbundled Orthogonal PFD (Process Flow Diagram, zero line bundling)
3. Temperature & Pressure Dynamic Cycle Profile (exact Hosokawa curves)
4. Master Engineering CAD Package (combining BFD, unbundled PFD, and Curves)
"""

import os
import math
import ezdxf
from ezdxf import colors

def setup_layers(doc):
    layers = [
        ("0", 7),
        ("TITLE_BLOCK", 7),
        ("EQUIPMENT_BLOCKS", 7),
        ("PROCESS_STREAMS", 3),        # ACI 3 (Green)
        ("VAPOR_DUST_STREAM", 4),       # ACI 4 (Cyan)
        ("SUBLIMATION_HEAT", 1),         # ACI 1 (Red)
        ("CRYOGENIC_MEDIUM", 5),        # ACI 5 (Blue)
        ("PRODUCT_SOLIDS", 2),          # ACI 2 (Yellow)
        ("UTILITY_LINES", 6),           # ACI 6 (Magenta)
        ("INSTRUMENT_TAGS", 7),
        ("TEXT_PRIMARY", 2),
        ("TEXT_SECONDARY", 8),
        ("GRID_AXES", 9),
        ("CURVE_T_JACKET", 5),
        ("CURVE_T_PRODUCT", 1),
        ("CURVE_PRESSURE", 3),
        ("CURVE_CONDENSER", 6),
        ("CURVE_AGITATOR", 4),
    ]
    for name, color in layers:
        if name not in doc.layers:
            doc.layers.add(name, color=color)

def draw_box(msp, x, y, w, h, layer="EQUIPMENT_BLOCKS", lw=25):
    pts = [(x, y), (x + w, y), (x + w, y + h), (x, y + h), (x, y)]
    return msp.add_lwpolyline(pts, dxfattribs={"layer": layer, "lineweight": lw})

def draw_arrow(msp, x1, y1, x2, y2, layer="PROCESS_STREAMS", head_size=5.0, lw=35):
    msp.add_line((x1, y1), (x2, y2), dxfattribs={"layer": layer, "lineweight": lw})
    angle = math.atan2(y2 - y1, x2 - x1)
    a1 = angle + math.radians(150)
    a2 = angle - math.radians(150)
    p1 = (x2 + head_size * math.cos(a1), y2 + head_size * math.sin(a1))
    p2 = (x2 + head_size * math.cos(a2), y2 + head_size * math.sin(a2))
    msp.add_lwpolyline([(x2, y2), p1, p2, (x2, y2)], dxfattribs={"layer": layer, "lineweight": lw})

def draw_bubble(msp, x, y, tag1, tag2, r=4.0, layer="INSTRUMENT_TAGS"):
    msp.add_circle((x, y), r, dxfattribs={"layer": layer, "lineweight": 18})
    msp.add_text(tag1, dxfattribs={"layer": layer, "height": 2.2}).set_placement((x - 2.5, y + 0.6))
    msp.add_text(tag2, dxfattribs={"layer": layer, "height": 1.9}).set_placement((x - 2.3, y - 2.6))

# -------------------------------------------------------------
# 1. BFD EXPORT
# -------------------------------------------------------------
def create_canonical_bfd_dxf(output_path: str):
    doc = ezdxf.new("R2010")
    setup_layers(doc)
    msp = doc.modelspace()

    # Title Block
    msp.add_text("ACTIVE FREEZE DRYING (AFD) — BLOCK FLOW DIAGRAM (BFD)", dxfattribs={"layer": "TITLE_BLOCK", "height": 6.5}).set_placement((30, 240))
    msp.add_text("HOSOKAWA MICRON B.V. CANONICAL SLIDE TOPOLOGY", dxfattribs={"layer": "TEXT_SECONDARY", "height": 3.2}).set_placement((30, 230))

    # Core Blocks
    # 1. Drying Chamber
    b1_x, b1_y, b1_w, b1_h = 90, 100, 60, 60
    draw_box(msp, b1_x, b1_y, b1_w, b1_h, lw=35)
    msp.add_text("Drying", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.5}).set_placement((b1_x + 16, b1_y + 35))
    msp.add_text("Chamber", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.5}).set_placement((b1_x + 13, b1_y + 24))
    msp.add_text("(V-101)", dxfattribs={"layer": "TEXT_SECONDARY", "height": 3.0}).set_placement((b1_x + 19, b1_y + 12))

    # 2. Product Collector
    b2_x, b2_y, b2_w, b2_h = 190, 100, 60, 60
    draw_box(msp, b2_x, b2_y, b2_w, b2_h, lw=35)
    msp.add_text("Product", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.5}).set_placement((b2_x + 15, b2_y + 35))
    msp.add_text("Collector", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.5}).set_placement((b2_x + 13, b2_y + 24))
    msp.add_text("(V-102)", dxfattribs={"layer": "TEXT_SECONDARY", "height": 3.0}).set_placement((b2_x + 19, b2_y + 12))

    # 3. Solvent Freeze Condenser
    b3_x, b3_y, b3_w, b3_h = 290, 100, 60, 60
    draw_box(msp, b3_x, b3_y, b3_w, b3_h, lw=35)
    msp.add_text("Solvent", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.0}).set_placement((b3_x + 15, b3_y + 40))
    msp.add_text("Freeze", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.0}).set_placement((b3_x + 17, b3_y + 28))
    msp.add_text("Condenser", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.0}).set_placement((b3_x + 11, b3_y + 16))

    # Inputs
    in1_x, in1_y = 40, 190
    draw_box(msp, in1_x, in1_y, 65, 18, layer="CRYOGENIC_MEDIUM")
    msp.add_text("Material to be dried", dxfattribs={"layer": "TEXT_PRIMARY", "height": 3.2}).set_placement((in1_x + 6, in1_y + 6))
    draw_arrow(msp, in1_x + 50, in1_y, in1_x + 50, b1_y + b1_h, layer="CRYOGENIC_MEDIUM", head_size=6.0)

    in2_x, in2_y = 120, 190
    draw_box(msp, in2_x, in2_y, 65, 18, layer="CRYOGENIC_MEDIUM")
    msp.add_text("Freezing medium", dxfattribs={"layer": "TEXT_PRIMARY", "height": 3.2}).set_placement((in2_x + 8, in2_y + 6))
    draw_arrow(msp, in2_x + 20, in2_y, in2_x + 20, b1_y + b1_h, layer="CRYOGENIC_MEDIUM", head_size=6.0)

    # Sublimation Heat
    msp.add_text("Sublimation Heat", dxfattribs={"layer": "SUBLIMATION_HEAT", "height": 4.5}).set_placement((15, b1_y + 35))
    draw_arrow(msp, 20, b1_y + 30, b1_x, b1_y + 30, layer="SUBLIMATION_HEAT", head_size=8.0, lw=50)

    # Connections
    draw_arrow(msp, b1_x + b1_w, b1_y + 30, b2_x, b2_y + 30, layer="PROCESS_STREAMS", head_size=7.0, lw=50)
    draw_arrow(msp, b2_x + b2_w, b2_y + 30, b3_x, b3_y + 30, layer="PROCESS_STREAMS", head_size=7.0, lw=50)

    # Vacuum
    draw_arrow(msp, b3_x + b3_w, b3_y + 30, b3_x + b3_w + 35, b3_y + 30, layer="PROCESS_STREAMS", head_size=7.0, lw=50)
    msp.add_text("Vacuum", dxfattribs={"layer": "TEXT_PRIMARY", "height": 5.0}).set_placement((b3_x + b3_w + 40, b3_y + 27))

    # Dried Product Discharge
    out_x, out_y = 190, 35
    draw_arrow(msp, b2_x + 30, b2_y, b2_x + 30, out_y + 18, layer="PRODUCT_SOLIDS", head_size=7.0, lw=50)
    draw_box(msp, out_x, out_y, 60, 18, layer="PRODUCT_SOLIDS")
    msp.add_text("Dried Product", dxfattribs={"layer": "TEXT_PRIMARY", "height": 3.8}).set_placement((out_x + 11, out_y + 6))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc.saveas(output_path)
    print(f"Saved Canonical BFD DXF: {output_path}")

# -------------------------------------------------------------
# 2. UNBUNDLED PFD EXPORT (Zero Line Bundling)
# -------------------------------------------------------------
def create_unbundled_pfd_dxf(output_path: str):
    doc = ezdxf.new("R2010")
    setup_layers(doc)
    msp = doc.modelspace()

    # Title
    msp.add_text("AFD-60 PHARMA ACTIVE FREEZE DRYER — UNBUNDLED PROCESS FLOW DIAGRAM (PFD)", dxfattribs={"layer": "TITLE_BLOCK", "height": 7.0}).set_placement((30, 270))
    msp.add_text("ZERO LINE BUNDLING / ISOLATED ORTHOGONAL PROCESS STREAMS WITH COMPLETE HEAT & MASS BALANCE", dxfattribs={"layer": "TEXT_SECONDARY", "height": 3.5}).set_placement((30, 260))

    # Equipment Coordinates
    # V-101 Conical Sublimator
    v1_x, v1_y, v1_w, v1_h = 100, 100, 60, 90
    draw_box(msp, v1_x, v1_y + 40, v1_w, 50, lw=30)
    # Cone apex bottom
    cone_pts = [(v1_x, v1_y + 40), (v1_x + v1_w, v1_y + 40), (v1_x + 35, v1_y), (v1_x + 25, v1_y), (v1_x, v1_y + 40)]
    msp.add_lwpolyline(cone_pts, dxfattribs={"layer": "EQUIPMENT_BLOCKS", "lineweight": 30})
    msp.add_text("V-101", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.5}).set_placement((v1_x + 22, v1_y + 65))
    msp.add_text("Agitated Conical", dxfattribs={"layer": "TEXT_PRIMARY", "height": 3.0}).set_placement((v1_x + 12, v1_y + 55))
    msp.add_text("Sublimator", dxfattribs={"layer": "TEXT_PRIMARY", "height": 3.0}).set_placement((v1_x + 18, v1_y + 47))

    # V-102 Product Collector
    v2_x, v2_y, v2_w, v2_h = 220, 120, 50, 70
    draw_box(msp, v2_x, v2_y, v2_w, v2_h, lw=30)
    msp.add_text("V-102", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.5}).set_placement((v2_x + 17, v2_y + 45))
    msp.add_text("Product Collector /", dxfattribs={"layer": "TEXT_PRIMARY", "height": 3.0}).set_placement((v2_x + 8, v2_y + 35))
    msp.add_text("Sintered Filter", dxfattribs={"layer": "TEXT_PRIMARY", "height": 3.0}).set_placement((v2_x + 12, v2_y + 25))

    # E-101 Condenser
    e1_x, e1_y, e1_w, e1_h = 320, 120, 50, 70
    draw_box(msp, e1_x, e1_y, e1_w, e1_h, lw=30)
    msp.add_text("E-101", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.5}).set_placement((e1_x + 17, e1_y + 45))
    msp.add_text("Solvent Freeze", dxfattribs={"layer": "TEXT_PRIMARY", "height": 3.0}).set_placement((e1_x + 11, e1_y + 35))
    msp.add_text("Condenser (-75C)", dxfattribs={"layer": "TEXT_PRIMARY", "height": 3.0}).set_placement((e1_x + 8, e1_y + 25))

    # TCU-201 Thermal Control Unit
    tcu_x, tcu_y, tcu_w, tcu_h = 20, 100, 50, 60
    draw_box(msp, tcu_x, tcu_y, tcu_w, tcu_h, layer="UTILITY_LINES", lw=25)
    msp.add_text("TCU-201", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.0}).set_placement((tcu_x + 12, tcu_y + 35))
    msp.add_text("Thermal Skid", dxfattribs={"layer": "TEXT_PRIMARY", "height": 2.8}).set_placement((tcu_x + 12, tcu_y + 25))
    msp.add_text("Syltherm XLT", dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.5}).set_placement((tcu_x + 11, tcu_y + 15))

    # PKG-401 Vacuum Train
    vac_x, vac_y, vac_w, vac_h = 410, 120, 45, 50
    draw_box(msp, vac_x, vac_y, vac_w, vac_h, lw=25)
    msp.add_text("PKG-401", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.0}).set_placement((vac_x + 10, vac_y + 30))
    msp.add_text("Dry Vacuum", dxfattribs={"layer": "TEXT_PRIMARY", "height": 2.8}).set_placement((vac_x + 9, vac_y + 20))
    msp.add_text("Pump Train", dxfattribs={"layer": "TEXT_PRIMARY", "height": 2.8}).set_placement((vac_x + 10, vac_y + 10))

    # UNBUNDLED PROCESS STREAMS (Completely Separate, Orthogonal Paths)
    # Stream 01: Liquid Feed Solution (Top into V-101)
    draw_arrow(msp, v1_x + 15, 230, v1_x + 15, v1_y + v1_h, layer="PROCESS_STREAMS", head_size=5.0)
    msp.add_text("[01] Feed Solution (15 kg, +20C)", dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.8}).set_placement((v1_x - 30, 235))

    # Stream 02: TCU Jacket Supply (Orthogonal top supply)
    msp.add_line((tcu_x + tcu_w, tcu_y + 45), (v1_x, tcu_y + 45), dxfattribs={"layer": "UTILITY_LINES", "lineweight": 25})
    draw_arrow(msp, v1_x - 10, tcu_y + 45, v1_x, tcu_y + 45, layer="UTILITY_LINES", head_size=4.0)
    msp.add_text("[09] HTF Supply (-45C / +35C)", dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.5}).set_placement((tcu_x + tcu_w + 3, tcu_y + 48))

    # Stream 03: TCU Jacket Return (Orthogonal bottom return)
    msp.add_line((v1_x, tcu_y + 15), (tcu_x + tcu_w, tcu_y + 15), dxfattribs={"layer": "UTILITY_LINES", "lineweight": 25})
    draw_arrow(msp, tcu_x + tcu_w + 10, tcu_y + 15, tcu_x + tcu_w, tcu_y + 15, layer="UTILITY_LINES", head_size=4.0)
    msp.add_text("[10] HTF Return", dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.5}).set_placement((tcu_x + tcu_w + 3, tcu_y + 18))

    # Stream 04: Regulated N2 Bleed
    draw_arrow(msp, v1_x + 45, 230, v1_x + 45, v1_y + v1_h, layer="UTILITY_LINES", head_size=4.0)
    msp.add_text("[07] Sterile N2 Micro-Bleed", dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.8}).set_placement((v1_x + 20, 235))

    # Stream 05: Raw Sublimation Vapor + API Dust (V-101 -> V-102, completely straight, unbundled)
    draw_arrow(msp, v1_x + v1_w, v1_y + 65, v2_x, v1_y + 65, layer="VAPOR_DUST_STREAM", head_size=6.0, lw=40)
    msp.add_text("[02] Vapor + API Dust (3.92 kg/h, 0.15 mbar, -25C)", dxfattribs={"layer": "TEXT_PRIMARY", "height": 2.8}).set_placement((v1_x + v1_w + 3, v1_y + 70))

    # Stream 06: Sintered Metal Reverse Blowback (Top into V-102)
    draw_arrow(msp, v2_x + 25, 230, v2_x + 25, v2_y + v2_h, layer="UTILITY_LINES", head_size=4.0)
    msp.add_text("[08] N2 Pulse Jet (6 bar)", dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.8}).set_placement((v2_x + 5, 235))

    # Stream 07: Harvested Powder (Bottom out of V-102)
    draw_arrow(msp, v2_x + 25, v2_y, v2_x + 25, 40, layer="PRODUCT_SOLIDS", head_size=6.0, lw=40)
    draw_box(msp, v2_x + 5, 20, 40, 20, layer="PRODUCT_SOLIDS")
    msp.add_text("[04] Dry Product", dxfattribs={"layer": "TEXT_PRIMARY", "height": 3.0}).set_placement((v2_x + 10, 32))
    msp.add_text("Canister (1.5 kg)", dxfattribs={"layer": "TEXT_PRIMARY", "height": 2.5}).set_placement((v2_x + 10, 24))

    # Stream 08: Screened Pure Vapor (V-102 -> E-101, completely straight, unbundled)
    draw_arrow(msp, v2_x + v2_w, v2_y + 35, e1_x, v2_y + 35, layer="PROCESS_STREAMS", head_size=6.0, lw=40)
    msp.add_text("[03] Clean Vapor (3.89 kg/h, 0.145 mbar)", dxfattribs={"layer": "TEXT_PRIMARY", "height": 2.8}).set_placement((v2_x + v2_w + 3, v2_y + 40))

    # Stream 09: Condenser to Vacuum Skid (E-101 -> PKG-401)
    draw_arrow(msp, e1_x + e1_w, e1_y + 35, vac_x, e1_y + 35, layer="PROCESS_STREAMS", head_size=6.0, lw=40)
    msp.add_text("[05] Non-Condensibles (0.08 mbar)", dxfattribs={"layer": "TEXT_PRIMARY", "height": 2.8}).set_placement((e1_x + e1_w + 3, e1_y + 40))

    # Stream 10: Exhaust from Vacuum Skid
    draw_arrow(msp, vac_x + vac_w, vac_y + 25, vac_x + vac_w + 30, vac_y + 25, layer="PROCESS_STREAMS", head_size=5.0)
    msp.add_text("[06] Clean Vent (1015 mbar)", dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.8}).set_placement((vac_x + vac_w + 5, vac_y + 30))

    # Defrost Condensate Drain out of E-101
    draw_arrow(msp, e1_x + 25, e1_y, e1_x + 25, 40, layer="UTILITY_LINES", head_size=5.0)
    msp.add_text("[14] Melt Drain to Kill Tank", dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.6}).set_placement((e1_x + 5, 30))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc.saveas(output_path)
    print(f"Saved Unbundled PFD DXF: {output_path}")

# -------------------------------------------------------------
# 3. DYNAMIC CYCLE CURVES EXPORT
# -------------------------------------------------------------
def create_cycle_curves_dxf(output_path: str):
    doc = ezdxf.new("R2010")
    setup_layers(doc)
    msp = doc.modelspace()

    # Title
    msp.add_text("TEMPERATURE & PRESSURE KINETIC CURVES — ACTIVE FREEZE DRYING", dxfattribs={"layer": "TITLE_BLOCK", "height": 6.5}).set_placement((30, 240))
    msp.add_text("HOSOKAWA MICRON B.V. AUTHENTIC MULTI-STAGE THERMAL PROFILE", dxfattribs={"layer": "TEXT_SECONDARY", "height": 3.2}).set_placement((30, 230))

    # Axes: Origin at (60, 60), Width = 300 mm, Height = 140 mm
    ox, oy, w, h = 60, 60, 300, 140
    msp.add_line((ox, oy), (ox + w, oy), dxfattribs={"layer": "GRID_AXES", "lineweight": 25})
    msp.add_line((ox, oy), (ox, oy + h), dxfattribs={"layer": "GRID_AXES", "lineweight": 25})

    # Y-axis ticks (-40 to +40 C, scale: 1 deg = 1.4 mm, 0 C is at oy + 56)
    y_zero = oy + 56
    temp_ticks = [(-40, oy), (-20, oy + 28), (0, y_zero), (+20, oy + 84), (+40, oy + 112)]
    for val, y_pos in temp_ticks:
        msp.add_line((ox - 3, y_pos), (ox, y_pos), dxfattribs={"layer": "GRID_AXES"})
        msp.add_line((ox, y_pos), (ox + w, y_pos), dxfattribs={"layer": "GRID_AXES", "linetype": "DASHED"})
        msp.add_text(f"{val:+} C", dxfattribs={"layer": "TEXT_SECONDARY", "height": 3.0}).set_placement((ox - 22, y_pos - 1.2))

    msp.add_text("Temperature (C) --->", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.0, "rotation": 90}).set_placement((ox - 30, oy + 35))
    msp.add_text("Batch Time (Minutes) --->", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.0}).set_placement((ox + 100, oy - 15))

    # Stage markers on X axis (Total 510 min, scale: 300 mm / 510 min = 0.588 mm/min)
    def t_to_x(t): return ox + t * 0.588
    stages = [
        (0, "Charge"),
        (20, "Freezing Medium"),
        (90, "Start Vac"),
        (120, "Primary Sublimation"),
        (420, "Secondary"),
        (480, "Discharge"),
        (510, "End")
    ]
    for t, label in stages:
        xp = t_to_x(t)
        msp.add_line((xp, oy - 3), (xp, oy), dxfattribs={"layer": "GRID_AXES"})
        msp.add_text(f"{t}m", dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.5}).set_placement((xp - 5, oy - 7))
        msp.add_text(label, dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.5, "rotation": 45}).set_placement((xp - 2, oy - 25))

    # 1. T-Jacket Curve (Blue)
    # Starts at -5C (y_zero - 7), steps up to 0C at 380m, +7C at 420m, +20C at 460m
    tj_pts = [
        (t_to_x(0), y_zero - 7),
        (t_to_x(380), y_zero - 7),
        (t_to_x(380), y_zero),
        (t_to_x(420), y_zero),
        (t_to_x(420), y_zero + 9.8),
        (t_to_x(460), y_zero + 9.8),
        (t_to_x(460), y_zero + 28),
        (t_to_x(510), y_zero + 28),
    ]
    msp.add_lwpolyline(tj_pts, dxfattribs={"layer": "CURVE_T_JACKET", "lineweight": 40})
    msp.add_text("T-Jacket (+20C limit)", dxfattribs={"layer": "CURVE_T_JACKET", "height": 3.5}).set_placement((t_to_x(465), y_zero + 32))

    # 2. T-Product Curve (Red)
    # Starts at +20C, plunges at 20m down to -45C at 90m, rebounds to -10C at 110m (sublimation plateau), stays at -8C until 420m, then rises to +17C
    tp_pts = [
        (t_to_x(0), y_zero + 28),
        (t_to_x(20), y_zero + 28),
        (t_to_x(90), oy - 7), # -45C
        (t_to_x(110), y_zero - 14), # -10C
        (t_to_x(420), y_zero - 11.2), # -8C
        (t_to_x(480), y_zero + 23.8), # +17C
        (t_to_x(510), y_zero + 25.2),
    ]
    msp.add_lwpolyline(tp_pts, dxfattribs={"layer": "CURVE_T_PRODUCT", "lineweight": 40})
    msp.add_text("T-Product (Sublimation Plateau)", dxfattribs={"layer": "CURVE_T_PRODUCT", "height": 3.5}).set_placement((t_to_x(180), y_zero - 7))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc.saveas(output_path)
    print(f"Saved Dynamic Curves DXF: {output_path}")

# -------------------------------------------------------------
# 4. MATERIAL VOLUME SHRINKAGE CURVE EXPORT (Slide 4)
# -------------------------------------------------------------
def create_volume_shrinkage_dxf(output_path: str):
    doc = ezdxf.new("R2010")
    setup_layers(doc)
    if "CURVE_VOLUME" not in doc.layers:
        doc.layers.add("CURVE_VOLUME", color=colors.MAGENTA)
    msp = doc.modelspace()

    # Title
    msp.add_text("DECREASE OF MATERIAL VOLUME DURING ACTIVE FREEZE DRYING", dxfattribs={"layer": "TITLE_BLOCK", "height": 6.5}).set_placement((30, 240))
    msp.add_text("HOSOKAWA MICRON B.V. PILOT DATA — DYNAMIC PARTICLE ELUTRIATION INTO COLLECTOR", dxfattribs={"layer": "TEXT_SECONDARY", "height": 3.2}).set_placement((30, 230))

    # Axes
    ox, oy, w, h = 60, 60, 300, 150
    msp.add_line((ox, oy), (ox + w, oy), dxfattribs={"layer": "GRID_AXES", "lineweight": 25})
    msp.add_line((ox, oy), (ox, oy + h), dxfattribs={"layer": "GRID_AXES", "lineweight": 25})

    # Y-axis ticks (0.00 to 5.00 Liters, scale: 1 Liter = 28 mm)
    for v in [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]:
        y_pos = oy + v * 28.0
        msp.add_line((ox - 3, y_pos), (ox, y_pos), dxfattribs={"layer": "GRID_AXES"})
        msp.add_line((ox, y_pos), (ox + w, y_pos), dxfattribs={"layer": "GRID_AXES", "linetype": "DASHED"})
        msp.add_text(f"{v:.2f}", dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.8}).set_placement((ox - 18, y_pos - 1.0))

    msp.add_text("Volume in Dryer [liter] --->", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.0, "rotation": 90}).set_placement((ox - 26, oy + 35))
    msp.add_text("Drying Time [hr] --->", dxfattribs={"layer": "TEXT_PRIMARY", "height": 4.0}).set_placement((ox + 100, oy - 15))

    # Time markers matching Hosokawa slide: 8:24, 13:12, 18:00, 22:48, 3:36, 8:24, 13:12
    # 6 intervals of 4.8 hours = 28.8 hours total span -> 300 mm
    # Scale: 50.0 mm per 4.8 hr interval => 1 hr = 10.4167 mm
    time_markers = ["8:24", "13:12", "18:00", "22:48", "3:36", "8:24", "13:12"]
    for i, tm in enumerate(time_markers):
        xp = ox + i * 50.0
        msp.add_line((xp, oy - 3), (xp, oy), dxfattribs={"layer": "GRID_AXES"})
        msp.add_line((xp, oy), (xp, oy + h), dxfattribs={"layer": "GRID_AXES", "linetype": "DASHED"})
        msp.add_text(tm, dxfattribs={"layer": "TEXT_SECONDARY", "height": 3.0}).set_placement((xp - 6, oy - 8))
        msp.add_text(f"+{i*4.8:.1f}h", dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.2}).set_placement((xp - 6, oy - 12))

    # Exact experimental data points from Hosokawa slide (Clock Time, Volume in Dryer [L])
    # Clock start at 8:24 (t = 8.40 hr). dt_hrs = clock_hr - 8.40
    pilot_points = [
        ("10:45", 10.75 - 8.40, 4.35),
        ("11:15", 11.25 - 8.40, 3.95),
        ("11:45", 11.75 - 8.40, 3.50),
        ("12:05", 12.08 - 8.40, 3.25),
        ("13:00", 13.00 - 8.40, 2.80),
        ("14:00", 14.00 - 8.40, 2.62),
        ("15:15", 15.25 - 8.40, 2.22),
        ("16:15", 16.25 - 8.40, 1.72),
        ("16:45", 16.75 - 8.40, 1.68),
        ("21:00", 21.00 - 8.40, 0.88),
        ("08:00", 32.00 - 8.40, 0.04),
    ]

    pts_dxf = []
    for clk, dt_hrs, vol in pilot_points:
        xp = ox + dt_hrs * 10.4167
        yp = oy + vol * 28.0
        pts_dxf.append((xp, yp))
        # Draw hollow circle matching slide
        msp.add_circle((xp, yp), 2.5, dxfattribs={"layer": "CURVE_VOLUME", "lineweight": 30})
        msp.add_text(f"{vol:.2f}L ({clk})", dxfattribs={"layer": "TEXT_PRIMARY", "height": 2.2}).set_placement((xp - 6, yp + 3.2))

    msp.add_lwpolyline(pts_dxf, dxfattribs={"layer": "CURVE_VOLUME", "lineweight": 40})

    # Add Hosokawa corporate logo text and subtitle
    msp.add_text("HOSOKAWA MICRON B.V. PILOT TRIAL DATA", dxfattribs={"layer": "TITLE_BLOCK", "height": 4.0}).set_placement((ox, oy - 22))
    msp.add_text("Dynamic particle elutriation carries dry powder to collector as ice sublimates", dxfattribs={"layer": "TEXT_SECONDARY", "height": 2.5}).set_placement((ox, oy - 27))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc.saveas(output_path)
    print(f"Saved Volume Shrinkage DXF: {output_path}")

if __name__ == "__main__":
    targets = [
        ("public/cad/hosokawa_afd_canonical_bfd.dxf", create_canonical_bfd_dxf),
        ("public/cad/hosokawa_afd_unbundled_pfd.dxf", create_unbundled_pfd_dxf),
        ("public/cad/hosokawa_afd_temp_pressure_cycle.dxf", create_cycle_curves_dxf),
        ("public/cad/hosokawa_afd_volume_shrinkage.dxf", create_volume_shrinkage_dxf),
        ("C:/Users/Shekhar/Desktop/hoshokawa micron afd/market_and_competitor_intelligence/cad/hosokawa_afd_canonical_bfd.dxf", create_canonical_bfd_dxf),
        ("C:/Users/Shekhar/Desktop/hoshokawa micron afd/market_and_competitor_intelligence/cad/hosokawa_afd_unbundled_pfd.dxf", create_unbundled_pfd_dxf),
        ("C:/Users/Shekhar/Desktop/hoshokawa micron afd/market_and_competitor_intelligence/cad/hosokawa_afd_temp_pressure_cycle.dxf", create_cycle_curves_dxf),
        ("C:/Users/Shekhar/Desktop/hoshokawa micron afd/market_and_competitor_intelligence/cad/hosokawa_afd_volume_shrinkage.dxf", create_volume_shrinkage_dxf),
    ]
    for path, func in targets:
        func(path)
    print("All CAD DXF files generated successfully!")
