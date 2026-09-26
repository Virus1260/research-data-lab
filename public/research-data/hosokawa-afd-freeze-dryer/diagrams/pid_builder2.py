import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, Polygon, FancyBboxPatch, Wedge
import numpy as np

plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 8})

fig, ax = plt.subplots(figsize=(21, 14), dpi=160)
ax.set_xlim(0, 24)
ax.set_ylim(0, 16.5)
ax.set_aspect("equal")
ax.axis("off")

PROCESS = dict(color="black", lw=2.0, zorder=2)
SIGNAL  = dict(color="#888888", lw=1.0, ls=(0,(4,2)), zorder=1)
SIGSIS  = dict(color="#b23b3b", lw=1.1, ls=(0,(2,2)), zorder=1)
STEAM   = dict(color="#b23b3b", lw=1.8, zorder=2)
UTILITY = dict(color="#1f6fb2", lw=1.6, zorder=2)

def pline(pts, style=None):
    s = style or PROCESS
    ax.plot([p[0] for p in pts],[p[1] for p in pts], **s)

def bubble(xy, top, bot, field=True, r=0.32, sis=False):
    x,y = xy
    ec = "#b23b3b" if sis else "black"
    ax.add_patch(Circle((x,y), r, facecolor="white", edgecolor=ec, lw=1.5, zorder=6))
    if not field:
        ax.plot([x-r*0.82,x+r*0.82],[y+0.02,y+0.02], color=ec, lw=1.0, zorder=7)
    ax.text(x,y+r*0.32, top, ha="center", va="center", fontsize=6.6, weight="bold", color=ec, zorder=8)
    ax.text(x,y-r*0.36, bot, ha="center", va="center", fontsize=6.0, color=ec, zorder=8)
    return (x,y)

def cvalve(xy, label, vertical=True, actuator="motor", size=0.26, lblpos="below"):
    x,y = xy; s=size
    if vertical:
        ax.add_patch(Polygon([(x-s,y+s*0.6),(x,y),(x-s,y-s*0.6)], closed=True, facecolor="white", edgecolor="black", lw=1.2, zorder=5))
        ax.add_patch(Polygon([(x+s,y+s*0.6),(x,y),(x+s,y-s*0.6)], closed=True, facecolor="white", edgecolor="black", lw=1.2, zorder=5))
        stem=(x,y+s*0.6)
    else:
        ax.add_patch(Polygon([(x-s*0.6,y-s),(x,y),(x+s*0.6,y-s)], closed=True, facecolor="white", edgecolor="black", lw=1.2, zorder=5))
        ax.add_patch(Polygon([(x-s*0.6,y+s),(x,y),(x+s*0.6,y+s)], closed=True, facecolor="white", edgecolor="black", lw=1.2, zorder=5))
        stem=(x,y+s)
    ax.plot([stem[0],stem[0]],[stem[1],stem[1]+0.20], color="black", lw=1.2, zorder=5)
    top=(stem[0],stem[1]+0.20)
    if actuator=="motor":
        ax.add_patch(Circle((top[0],top[1]+0.17),0.15, facecolor="white", edgecolor="black", lw=1.2, zorder=6))
        ax.text(top[0],top[1]+0.17,"M", ha="center", va="center", fontsize=5.6, zorder=7)
        top=(top[0],top[1]+0.34)
    elif actuator=="diaphragm":
        ax.add_patch(Wedge((top[0],top[1]+0.18),0.18,0,360, facecolor="white", edgecolor="black", lw=1.2, zorder=6))
        top=(top[0],top[1]+0.36)
    if lblpos=="below":
        ax.text(x, y-s-0.30, label, ha="center", fontsize=6.2, zorder=7)
    else:
        ax.text(x, top[1]+0.18, label, ha="center", fontsize=6.2, zorder=7)
    return top

def mvalve(xy, size=0.20):
    x,y=xy; s=size
    ax.add_patch(Polygon([(x-s,y+s*0.6),(x,y),(x-s,y-s*0.6)], closed=True, facecolor="white", edgecolor="black", lw=1.1, zorder=5))
    ax.add_patch(Polygon([(x+s,y+s*0.6),(x,y),(x+s,y-s*0.6)], closed=True, facecolor="white", edgecolor="black", lw=1.1, zorder=5))

# ===== TITLE =====
ax.text(12,16.2,"P&ID — AFD-Style Stirred/Agitated Pharma Freeze Dryer (Educational / Prototype Reference)", ha="center", fontsize=14, weight="bold")
ax.text(12,15.8,"Original diagram drawn to ISA 5.1 tag/symbol conventions for this package — NOT a Hosokawa manufacturer drawing. Tag numbers are illustrative, chosen for internal consistency.", ha="center", fontsize=8.2, style="italic", color="#444444")

BUS_Y = 14.9
ax.plot([0.6,23.4],[BUS_Y,BUS_Y], color="#888888", lw=1.0, ls=(0,(6,3)))
ax.text(23.4,BUS_Y+0.2,"→ BPCS I/O  (see Control Architecture diagram, file 20)", ha="right", fontsize=7, color="#555555")
def tobus(x,yf): ax.plot([x,x],[yf,BUS_Y], **SIGNAL)
def tobus_sis(x,yf): ax.plot([x,x],[yf,BUS_Y], **SIGSIS)

# ===== TCU + REFRIGERATION =====
ax.add_patch(Rectangle((0.6,10.6),2.6,1.7, facecolor="#fff3d6", edgecolor="black", lw=1.4, zorder=3))
ax.text(1.9,11.75,"TCU-201", ha="center", fontsize=8, weight="bold", zorder=8)
ax.text(1.9,11.25,"Temperature Control Unit\n(heat/cool skid, silicone oil)", ha="center", fontsize=6.4, zorder=8)

ax.add_patch(Rectangle((0.6,8.2),2.6,1.6, facecolor="#dcebff", edgecolor="black", lw=1.4, zorder=3))
ax.text(1.9,9.4,"PKG-301", ha="center", fontsize=8, weight="bold", zorder=8)
ax.text(1.9,8.95,"Cascade Refrigeration\nSkid (package)", ha="center", fontsize=6.4, zorder=8)
pline([(1.9,9.8),(1.9,10.6)], UTILITY)
ax.text(2.05,10.2,"cold duty", fontsize=6, color="#1f6fb2")

# jacket supply (to vessel top) / return (from vessel bottom-ish)
pline([(3.2,11.7),(5.2,11.7)], UTILITY)
tt201 = bubble((4.2,11.7),"TT","201")
tobus(4.2,BUS_Y if False else 12.02)
cv201 = cvalve((3.6,11.15), "FCV-201", vertical=True, actuator="diaphragm")
pline([(3.6,11.15+0.6),(3.6,11.7)], UTILITY)
tic201 = bubble((3.0,12.4),"TIC","201", field=False)
tobus(3.0,12.72)
ax.plot([3.0,3.0],[12.08,12.4], **SIGNAL)
pline([(5.2,11.7),(5.2,11.7)], UTILITY)

pline([(5.2,10.2),(3.2,10.2)], UTILITY)
tt202 = bubble((4.2,10.2),"TT","202")
tobus(4.2,10.52)
pline([(1.9,10.6),(1.9,11.7),(3.2,11.7)], UTILITY)  # not used, cosmetic omitted
# clean single connectors from TCU to jacket header
pline([(1.9,12.3),(1.9,12.85),(3.2,12.85)], UTILITY)
pline([(1.9,10.2),(1.9,9.8)], UTILITY)

# ===== VESSEL V-101 =====
ax.text(8.5,13.35,"V-101 — LYOPHILISATION VESSEL (jacketed, conical)", ha="center", fontsize=9, weight="bold", zorder=8)
outer=[(6.6,11.9),(10.4,11.9),(10.4,9.9),(8.5,5.4),(6.6,9.9),(6.6,11.9)]
ax.add_patch(Polygon(outer, closed=True, fill=False, edgecolor="black", lw=2.0, zorder=4))
inner=[(6.85,11.75),(10.15,11.75),(10.15,9.95),(8.5,5.85),(6.85,9.95),(6.85,11.75)]
ax.add_patch(Polygon(inner, closed=True, facecolor="#eaf2fb", edgecolor="black", lw=1.3, zorder=3))
ax.add_patch(Rectangle((6.5,11.9),4.0,0.22, facecolor="#cfcfcf", edgecolor="black", lw=1.2, zorder=5))

# agitator drive
ax.add_patch(FancyBboxPatch((7.9,12.65),1.2,0.55, boxstyle="round,pad=0.04", facecolor="#f4d35e", edgecolor="black", zorder=5))
ax.text(8.5,12.92,"M-101", ha="center", fontsize=7, weight="bold", zorder=8)
ax.plot([8.5,8.5],[11.9,12.65], color="black", lw=1.8, zorder=4)
bubble((9.7,12.92),"SIC","101", field=False); tobus(9.7,13.24)
bubble((9.7,12.1),"JIT","101"); ax.text(9.7,11.68,"agitator torque", ha="center", fontsize=5.4); tobus(10.05,12.1)

# helix
yy=np.linspace(11.7,6.1,220)
def cxo(v):
    return 0 if v<5.85 else (1.5 if v>=9.95 else 1.5*max(v-5.85,0)/(9.95-5.85))
th=np.linspace(0,5*np.pi,220)
rad=np.array([max(cxo(v)-0.1,0.05) for v in yy])
ax.plot(8.5+rad*np.cos(th), yy, color="#c1440e", lw=1.1, zorder=4)

# lid fittings, spread along the lid top, labels ABOVE, clear of vessel title (title at 13.35)
ax.add_patch(Circle((7.05,12.12),0.13, facecolor="white", edgecolor="black", lw=1.1, zorder=6))
ax.text(7.05,12.45,"LG-101\nsight glass", ha="center", fontsize=5.6, zorder=8)

vrv_top = cvalve((10.85,12.3), "", vertical=False, actuator=None, size=0.14)
ax.text(10.85,12.85,"VRV-101\nvacuum relief", ha="center", fontsize=5.6, zorder=8)

# vessel pressure instruments (dual gauge)
bubble((6.35,11.0),"PIT","101A"); ax.text(5.35,11.0,"capacitance\nmanometer", ha="right", fontsize=5.4, va="center"); tobus(6.35,11.32)
bubble((6.35,10.15),"PIT","101B"); ax.text(5.35,10.15,"Pirani\ngauge", ha="right", fontsize=5.4, va="center"); tobus(6.35,10.47)
bubble((6.35,9.3),"PIC","101", field=False); tobus(6.35,9.62)

# lid interlock (SIS)
bubble((6.55,13.0),"ZS","101", sis=True); ax.text(5.7,13.35,"lid closed\n(SIS permissive)", fontsize=5.2, ha="center", color="#b23b3b"); tobus_sis(6.55,13.32)
bubble((5.9,8.7),"PSH","101", sis=True); ax.text(4.9,8.5,"vessel near-atm.\n(unlock permissive)", fontsize=5.2, ha="center", color="#b23b3b"); tobus_sis(5.9,9.02)

# ===== TOP VAPOR PATH =====
pline([(10.4,11.4),(12.2,11.4)])
pv102 = cvalve((13.3,11.4), "PV-102", vertical=True, actuator="motor")
pline([(12.6,11.4),(12.6,12.3),(14.0,12.3),(14.0,11.4)])
cvalve((13.3,12.3), "XV-103 (bypass)", vertical=True, actuator="motor")
pline([(13.8,11.4),(15.2,11.4)])
ax.plot([6.35,6.35],[9.3,9.3]) # noop
ax.plot([6.35,13.3],[9.3,9.3], **SIGNAL)
ax.plot([13.3,13.3],[9.3,10.75], **SIGNAL)
ax.text(9.5,9.15,"PIC-101 output throttles PV-102 (vessel-to-collector path)", fontsize=5.8, color="#555555")

# vent/break valve, offset clearly to the right of the lid, own riser from vessel shoulder
pline([(10.4,10.6),(11.6,10.6),(11.6,11.05)])
cvalve((11.6,11.25), "XV-104", vertical=False, actuator="motor", size=0.14)
ax.add_patch(Circle((11.6,11.75),0.12, facecolor="white", edgecolor="black", lw=1.0, zorder=6))
ax.text(11.6,12.02,"F-101\nsterile vent filter", ha="center", fontsize=5.4, zorder=8)

# ===== MATERIAL COLLECTOR =====
ax.add_patch(Rectangle((15.2,10.6),1.7,2.0, facecolor="#f6dede", edgecolor="black", lw=1.4, zorder=3))
ax.text(16.05,12.85,"V-102", ha="center", fontsize=8, weight="bold", zorder=8)
ax.text(16.05,12.45,"Material Collector\n/ Dust Filter", ha="center", fontsize=6.4, zorder=8)
bubble((15.55,11.4),"PDT","102"); tobus(15.55,11.72)
cvalve((16.6,13.05),"", vertical=False, actuator="motor", size=0.13)
ax.text(16.6,13.5,"XV-106\nblowback gas", ha="center", fontsize=5.4)
pline([(16.6,13.2),(16.6,BUS_Y-0.3)])

# ===== CONDENSER =====
pline([(16.9,11.4),(18.3,11.4)])
ax.add_patch(Rectangle((18.3,10.7),1.7,1.4, facecolor="#e6f2ff", edgecolor="black", lw=1.4, zorder=3))
ax.text(19.15,12.25,"E-101", ha="center", fontsize=8, weight="bold", zorder=8)
ax.text(19.15,11.85,"Condenser\n(refrigerated coil)", ha="center", fontsize=6.4, zorder=8)
bubble((18.7,10.95),"TT","103"); tobus(18.7,11.27)

# ===== VACUUM PUMP TRAIN =====
pline([(20.0,11.4),(21.3,11.4)])
ax.add_patch(Rectangle((21.3,10.7),2.0,1.4, facecolor="#e8e8e8", edgecolor="black", lw=1.4, zorder=3))
ax.text(22.3,12.25,"PKG-401", ha="center", fontsize=8, weight="bold", zorder=8)
ax.text(22.3,11.85,"Vacuum Pump Train\n(Roots + dry screw)", ha="center", fontsize=6.4, zorder=8)
bubble((21.75,10.95),"ZS","401"); ax.text(21.4,10.6,"run feedback", fontsize=5.2, ha="center"); tobus(21.75,11.27)
pline([(23.3,11.4),(23.85,11.4)])
ax.text(23.9,11.4,"→ vent /\nabatement", fontsize=6.2, va="center")

# ===== BOTTOM DISCHARGE =====
pline([(8.5,5.85),(8.5,4.6)])
cvalve((8.5,5.05),"XV-105 (ball-segment)", vertical=True, actuator="motor")
ax.add_patch(Rectangle((7.9,3.0),1.2,1.2, facecolor="#d9d9d9", edgecolor="black", lw=1.2, zorder=3))
ax.text(8.5,3.6,"Product\nCanister", ha="center", fontsize=6.2, zorder=8)
pline([(8.5,4.25),(8.5,4.2)])

# ===== CIP SKID =====
ax.add_patch(Rectangle((13.0,1.2),2.2,1.4, facecolor="#e9dcf5", edgecolor="black", lw=1.3, zorder=3))
ax.text(14.1,2.15,"PKG-501", ha="center", fontsize=7.6, weight="bold", zorder=8)
ax.text(14.1,1.75,"CIP Skid", ha="center", fontsize=6.6, zorder=8)
pline([(14.1,2.6),(14.1,7.5),(10.4,9.0)])
bubble((13.7,4.5),"FT","501"); tobus(13.7,4.82)

# ===== SIP (optional) =====
ax.add_patch(Rectangle((16.0,1.2),2.4,1.4, facecolor="#fbe2df", edgecolor="black", lw=1.3, ls="--", zorder=3))
ax.text(17.2,2.15,"PKG-502", ha="center", fontsize=7.6, weight="bold", zorder=8)
ax.text(17.2,1.75,"Clean Steam (SIP — optional)", ha="center", fontsize=6.2, zorder=8)
pline([(17.2,2.6),(17.2,4.0)], STEAM)
cvalve((17.2,4.25),"PV-502", vertical=True, actuator="motor")
pline([(17.2,4.6),(17.2,8.4),(10.4,9.9)], STEAM)
bubble((18.3,4.25),"TT","503"); ax.text(19.1,4.25,"(multi-point,\nheat distribution)", fontsize=5.2, ha="left"); tobus(18.3,4.57)
cvalve((19.1,2.7),"PSV-501", vertical=True, actuator=None, size=0.14)

# ===== LEGEND =====
lx,ly=0.5,0.4
ax.add_patch(Rectangle((lx-0.15,ly-0.15),6.2,5.6, facecolor="white", edgecolor="black", lw=1.0, zorder=9))
ax.text(lx+2.9, ly+5.2, "LEGEND", ha="center", fontsize=9, weight="bold", zorder=10)
yb=ly+4.7
bubble((lx+0.35,yb),"XX","101", field=True); ax.text(lx+0.9,yb,"Field-mounted instrument (local gauge/element)", fontsize=6.6, va="center", zorder=10)
yb-=0.62
bubble((lx+0.35,yb),"XX","101", field=False); ax.text(lx+0.9,yb,"Control-system point (PLC/HMI — BPCS)", fontsize=6.6, va="center", zorder=10)
yb-=0.62
bubble((lx+0.35,yb),"XX","101", sis=True); ax.text(lx+0.9,yb,"Safety Instrumented Function (SIS) — separate from BPCS", fontsize=6.6, va="center", zorder=10)
yb-=0.68
cvalve((lx+0.35,yb),"", vertical=True, actuator="motor", size=0.16); ax.text(lx+0.9,yb,"Automated (motor-actuated) control/isolation valve", fontsize=6.6, va="center", zorder=10)
yb-=0.55
mvalve((lx+0.35,yb), size=0.16); ax.text(lx+0.9,yb,"Manual valve", fontsize=6.6, va="center", zorder=10)
yb-=0.45
ax.plot([lx+0.1,lx+0.65],[yb,yb], **PROCESS); ax.text(lx+0.9,yb,"Process piping", fontsize=6.6, va="center", zorder=10)
yb-=0.4
ax.plot([lx+0.1,lx+0.65],[yb,yb], **UTILITY); ax.text(lx+0.9,yb,"Utility line (jacket fluid / refrigerant)", fontsize=6.6, va="center", zorder=10)
yb-=0.4
ax.plot([lx+0.1,lx+0.65],[yb,yb], **STEAM); ax.text(lx+0.9,yb,"Clean steam (SIP, optional)", fontsize=6.6, va="center", zorder=10)
yb-=0.4
ax.plot([lx+0.1,lx+0.65],[yb,yb], **SIGNAL); ax.text(lx+0.9,yb,"Instrument signal to BPCS", fontsize=6.6, va="center", zorder=10)
yb-=0.4
ax.plot([lx+0.1,lx+0.65],[yb,yb], **SIGSIS); ax.text(lx+0.9,yb,"Instrument signal to SIS (safety)", fontsize=6.6, va="center", zorder=10)

plt.tight_layout()
plt.savefig("pid_afd_freeze_dryer.png", dpi=160)
plt.close()
print("saved v2")
