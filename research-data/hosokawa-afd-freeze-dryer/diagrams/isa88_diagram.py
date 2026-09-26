import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9})

fig, ax = plt.subplots(figsize=(15,9), dpi=160)
ax.set_xlim(0,18); ax.set_ylim(0,10.5); ax.axis("off")
ax.set_title("Original Diagram — ISA-88 (S88) Batch Structure Applied to the Freeze-Drying Cycle", fontsize=13, y=0.98)
ax.text(9,10.05,"Procedure → Unit Procedures → Operations → Phases (file 21) — this hierarchy is what actually lives inside the BPCS", ha="center", fontsize=8.5, style="italic", color="#444444")

def box(x,y,w,h,text,color,fs=8.6):
    ax.add_patch(FancyBboxPatch((x,y),w,h, boxstyle="round,pad=0.05", facecolor=color, edgecolor="black", lw=1.3))
    ax.text(x+w/2,y+h/2,text, ha="center", va="center", fontsize=fs)

def line(p1,p2,color="black",lw=1.1):
    ax.plot([p1[0],p2[0]],[p1[1],p2[1]], color=color, lw=lw)

# Level 1: Procedure
box(6.5,8.6,5,0.9,"RECIPE PROCEDURE\n\"Freeze-Dry Batch\"", "#f9e79f", fs=9.5)

# Level 2: Unit Procedures
ups = [("Freeze","#dcebff"), ("Dry","#eaf5ea"), ("Discharge","#f6dede"), ("Clean / Sterilize","#e9dcf5")]
up_x = [0.6,5.3,10.0,13.4]
up_w = [4.3,4.3,3.0,4.2]
for (name,c),x,w in zip(ups,up_x,up_w):
    box(x,7.0,w,0.9,f"UNIT PROCEDURE\n{name}", c, fs=8.8)
    line((6.5+2.5,8.6),(x+w/2,7.9))

# Level 3: Operations + Level 4: Phases, grouped under each unit procedure
data = {
  0: [("Charge & Pre-cool", ["Load product","Start jacket cooldown"]),
      ("Freeze", ["Vacuum-induced freeze","Hold at set temp"])],
  1: [("Primary Drying", ["Ramp jacket temp","Hold vacuum setpoint","Monitor PIT-101A/B convergence"]),
      ("Secondary Drying", ["Raise jacket temp","Hold vacuum","Timed desorption hold"])],
  2: [("End-of-Cycle", ["Filter blowback purge","Post-blend in vessel"]),
      ("Discharge", ["Vacuum release","Open XV-105","Confirm empty (LG-101)"])],
  3: [("CIP", ["Pre-rinse","Chemical wash","Final rinse","Air dry"]),
      ("SIP (optional)", ["Steam admit","Heat-distribution hold","Steam vent/cooldown"])],
}
op_y = 5.1
for idx,(x,w) in enumerate(zip(up_x,up_w)):
    ops = data[idx]
    n = len(ops)
    slot_w = w/n
    for j,(opname,phases) in enumerate(ops):
        ox = x + j*slot_w
        box(ox+0.05, op_y, slot_w-0.1, 0.75, f"Operation:\n{opname}", "#ffffff", fs=7.4)
        line((x+w/2,7.0),(ox+slot_w/2,op_y+0.75))
        # phases stacked below
        py = op_y - 0.35
        for k,ph in enumerate(phases):
            py -= 0.62
            ax.add_patch(FancyBboxPatch((ox+0.08,py),slot_w-0.16,0.5, boxstyle="round,pad=0.03", facecolor="#f5f5f5", edgecolor="#888888", lw=0.8))
            ax.text(ox+slot_w/2,py+0.25, f"Phase: {ph}", ha="center", va="center", fontsize=6.0)
        line((ox+slot_w/2,op_y),(ox+slot_w/2,py+0.5))

ax.text(9,0.35,"Each Phase is the reusable, testable atom of PLC logic (file 21 §2) — the same \"Vacuum-induced freeze\" phase\ncode can be reused unchanged if a future project adds a second vessel, per ISA-88 practice.",
        ha="center", fontsize=8, color="#333333")

plt.tight_layout()
plt.savefig("isa88_batch_structure.png", dpi=160)
plt.close()
print("done")
