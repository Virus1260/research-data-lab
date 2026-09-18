import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9.5})

fig, ax = plt.subplots(figsize=(13,10), dpi=160)
ax.set_xlim(0,14); ax.set_ylim(0,15); ax.axis("off")
ax.set_title("Original Diagram — Control System Architecture (BPCS + SIS split)\nfor the AFD-Style Freeze Dryer", fontsize=13, y=0.99)
ax.text(7,14.15,"Two independent control layers by design — see file 20 for why this separation is non-negotiable", ha="center", fontsize=8.5, style="italic", color="#444444")

def box(x,y,w,h,text,color,fs=9.5,ls="-"):
    b=FancyBboxPatch((x,y),w,h, boxstyle="round,pad=0.06", facecolor=color, edgecolor="black", lw=1.4, linestyle=ls)
    ax.add_patch(b)
    ax.text(x+w/2,y+h/2,text, ha="center", va="center", fontsize=fs)
    return (x,y,w,h)

def arrow(b1,b2,s1="top",s2="bottom",color="black",lw=1.3,label=None,rad=0.0):
    pts={"top":(b1[0]+b1[2]/2,b1[1]+b1[3]),"bottom":(b1[0]+b1[2]/2,b1[1]),"left":(b1[0],b1[1]+b1[3]/2),"right":(b1[0]+b1[2],b1[1]+b1[3]/2)}
    pts2={"top":(b2[0]+b2[2]/2,b2[1]+b2[3]),"bottom":(b2[0]+b2[2]/2,b2[1]),"left":(b2[0],b2[1]+b2[3]/2),"right":(b2[0]+b2[2],b2[1]+b2[3]/2)}
    p1=pts[s1]; p2=pts2[s2]
    a=FancyArrowPatch(p1,p2, arrowstyle="-|>", mutation_scale=11, lw=lw, color=color, connectionstyle=f"arc3,rad={rad}")
    ax.add_patch(a)
    if label:
        ax.text((p1[0]+p2[0])/2, (p1[1]+p2[1])/2+0.15, label, fontsize=7, ha="center", color="#333333")

# ---- Level 3: Enterprise/records ----
hist = box(0.6,12.2,3.4,1.1,"Historian / Electronic\nBatch Record (21 CFR Part 11)", "#f9e79f")
hmi  = box(4.4,12.2,3.0,1.1,"HMI / SCADA\n(operator screens, trending, alarms)", "#f9e79f")
eng  = box(7.8,12.2,2.8,1.1,"Engineering Workstation\n(recipe/config, offline)", "#eeeeee")

arrow(hmi,hist,"left","right", rad=0.0, label="batch data")
arrow(eng,hmi,"left","right", rad=0.0, label="config")

# ---- Level 1/2: BPCS ----
bpcs = box(1.5,9.6,6.0,1.4,"BPCS  —  Basic Process Control System\n(standard PLC: sequencing, PID control loops,\nISA-88 recipe execution — file 21)", "#dfe9f5")
arrow(bpcs,hmi,"top","bottom", rad=0.0)
arrow(bpcs,hist,"top","bottom", rad=-0.2)

# ---- SIS, physically separate ----
sis = box(9.0,9.6,4.4,1.4,"SIS  —  Safety Instrumented System\n(separate safety PLC/relays, IEC 61511 —\nhardwired E-stop, critical interlocks, file 22)", "#f6c9c9", ls="--")
ax.text(11.2,9.35,"NO shared logic path with BPCS for safety functions", fontsize=7.3, ha="center", color="#b23b3b", style="italic")
arrow(sis,hmi,"top","bottom", rad=0.2, color="#b23b3b", label="status only\n(read-only)")

# ---- I/O layer ----
io_bpcs = box(1.5,7.4,6.0,1.0,"BPCS I/O  (analog + digital — process instruments, valves, drives)", "#eef3fa")
io_sis  = box(9.0,7.4,4.4,1.0,"SIS I/O  (dedicated safety-rated inputs/outputs)", "#fbeaea")
arrow(bpcs,io_bpcs,"bottom","top")
arrow(sis,io_sis,"bottom","top",color="#b23b3b")

# ---- Field devices ----
f1=box(0.5,5.3,2.6,1.4,"Process\nInstruments\n(PIT-101A/B, TT-201/202,\nTT-103, PDT-102, JIT-101 ...)","#ffffff")
f2=box(3.3,5.3,2.2,1.4,"Actuated\nValves\n(PV-102, XV-103/104/105/106,\nFCV-201, PV-502)","#ffffff")
f3=box(5.7,5.3,2.2,1.4,"Drives\n(M-101 agitator VFD,\nTCU/refrigeration/\nvacuum-pump packages)","#ffffff")
f4=box(9.0,5.3,2.0,1.4,"Safety Sensors\n(ZS-101 lid, PSH-101\nvessel-near-atm)","#ffffff")
f5=box(11.2,5.3,2.2,1.4,"Hardwired\nE-Stop Loop\n(independent of\nboth PLCs)","#ffffff", ls="--")

for f in [f1,f2,f3]:
    arrow(io_bpcs,f,"bottom","top", rad=0.0)
arrow(io_sis,f4,"bottom","top", color="#b23b3b")
arrow(io_sis,f5,"bottom","top", color="#b23b3b", rad=0.15)
ax.plot([12.3,12.3],[5.3,4.6], color="#b23b3b", lw=2.2, zorder=1)
ax.text(12.3,4.35,"cuts power to agitator, heaters,\nand (where safe) refrigeration\ncompressor contactors directly\n— hardwired, not through any PLC", ha="center", fontsize=7, color="#b23b3b")

# ---- Network note ----
ax.text(7,3.6,"Field network: industrial Ethernet (e.g. PROFINET / EtherNet-IP) for BPCS I/O and drives.\nSafety network (if using a safety PLC rather than hardwired relays): a safety-rated protocol\n(e.g. PROFIsafe) running alongside — never sharing a single point of failure with the BPCS network.",
        ha="center", fontsize=8, color="#444444")

ax.text(7,2.4,"ISA-88 batch phases (file 21) execute inside the BPCS.\nThe SIS only ever intervenes to stop/protect — it never runs the recipe.",
        ha="center", fontsize=9, weight="bold", color="#222222")

plt.tight_layout()
plt.savefig("control_system_architecture.png", dpi=160)
plt.close()
print("done")
