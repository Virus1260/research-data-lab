import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle, Arc, FancyArrowPatch
import numpy as np

plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10})

fig, ax = plt.subplots(figsize=(10.5,11), dpi=160)
ax.set_xlim(-7.5,10.5)
ax.set_ylim(-3,13.5)
ax.set_aspect("equal")
ax.axis("off")
fig.suptitle("Original Diagram — Conical Vessel Sizing Geometry (worked example: 20 L nominal, 10 L working volume)", fontsize=12, y=0.985)
ax.text(1.5, 12.6, "Illustrative — cone half-angle, fill-height math, and jacket area shown for one design choice (α = 25°); re-derive for your own batch (file 11 / file 05)", ha="center", fontsize=8, style="italic", color="#444444")

# Using alpha=25deg example: h=44.5cm, R=20.75(D=41.5), slant=49.0, liquid height at 50%=35.3cm
h = 8.9   # scaled (cm/5) for drawing convenience: 44.5/5
R = 4.15  # 41.5/2 /5
apex_y = 0.0
top_y = apex_y + h
knuckle = 0.6  # small truncation for discharge stub

# outer cone (jacket) - draw two nested cones with gap = jacket
jacket_gap = 0.35
outer_R = R + jacket_gap
outer_top_y = top_y + 0.15

ax.add_patch(Polygon([(-outer_R,outer_top_y),(outer_R,outer_top_y),(0,apex_y-jacket_gap*1.4)], closed=True, fill=False, edgecolor="#475569", lw=2))
ax.add_patch(Polygon([(-R,top_y),(R,top_y),(0,apex_y+knuckle)], closed=False, fill=False, edgecolor="black", lw=2.4))
ax.plot([-R,0],[top_y,apex_y+knuckle], color="black", lw=2.4)
ax.plot([R,0],[top_y,apex_y+knuckle], color="black", lw=2.4)
ax.fill([-R,R,0],[top_y,top_y,apex_y+knuckle], color="#eaf2fb", alpha=0.5, zorder=0)

# discharge stub
ax.add_patch(Rectangle((-0.35,apex_y-0.5),0.7,knuckle+0.5, facecolor="white", edgecolor="black", lw=1.6))
ax.text(0, apex_y-0.75, "XV-105 discharge\n(knuckle/stub sized\nto valve bore, DN100-150)", ha="center", fontsize=7.6)

# half-angle annotation
ax.plot([0,0],[apex_y+knuckle,top_y], color="#888888", lw=1, ls="--")
arc = Arc((0,apex_y+knuckle), 2.4, 2.4, angle=0, theta1=90-25, theta2=90, color="#c1440e", lw=1.6)
ax.add_patch(arc)
ax.text(0.75,1.6,"α = 25°\n(half-angle\nfrom vertical)", fontsize=8, color="#c1440e")

# fill line at 50% volume = 79.4% of height
fill_y = apex_y + h*0.794
fill_R_at_y = R*0.794
ax.plot([-fill_R_at_y,fill_R_at_y],[fill_y,fill_y], color="#1f6fb2", lw=2.2)
ax.fill([-R*t for t in [0,0]],[0,0],color="none")
# shade liquid region approx as smaller cone
ax.fill([-fill_R_at_y,fill_R_at_y,0],[fill_y,fill_y,apex_y+knuckle], color="#9ecae1", alpha=0.55, zorder=1)
ax.text(fill_R_at_y+0.3, fill_y, "← 50% VOLUME fill line\n(sits at 79.4% of height!)", fontsize=8.2, color="#1f6fb2", va="center")

# freeboard bracket
ax.annotate("", xy=(-R-0.9, top_y), xytext=(-R-0.9, fill_y), arrowprops=dict(arrowstyle="<->", color="#b23b3b", lw=1.4))
ax.text(-R-1.1, (top_y+fill_y)/2, "freeboard\n(20.6% of\nheight)", fontsize=7.6, color="#b23b3b", ha="right", va="center")

# height dim
ax.annotate("", xy=(outer_R+1.0, apex_y+knuckle), xytext=(outer_R+1.0, top_y), arrowprops=dict(arrowstyle="<->", color="black", lw=1.2))
ax.text(outer_R+1.3, (apex_y+top_y)/2, "h ≈ 44.5 cm", fontsize=9, rotation=90, va="center")

# diameter dim
ax.annotate("", xy=(-R, top_y+1.5), xytext=(R, top_y+1.5), arrowprops=dict(arrowstyle="<->", color="black", lw=1.2))
ax.text(0, top_y+1.8, "D ≈ 41.5 cm", fontsize=9, ha="center")

# jacket label
ax.annotate("Double jacket (half-pipe coil\nor dimple, file 05 addendum)\nlateral area ≈0.32 m² — matches\nfile 11's required jacket area\nat this batch scale", xy=(outer_R-0.5, top_y-2.5), xytext=(-7.3,5.5), fontsize=7.8,
            arrowprops=dict(arrowstyle="->", lw=0.8))

# top closure
ax.plot(np.linspace(-R,R,50), top_y+0.15+0.35*(1-(np.linspace(-R,R,50)/R)**2), color="#333333", lw=2)
ax.text(0, top_y+2.6, "shallow dished/torispherical lid\n(better external-pressure/vacuum\nresistance than a flat cover)", ha="center", fontsize=7.8)

ax.text(2, -2.3, "Cone volume: V = (π/3)·tan²(α)·h³   |   Liquid height at fill fraction f: y = h·f^(1/3)   |   Lateral area: A = πR·(R/sinα)",
        ha="center", fontsize=8.6, color="#222222")

plt.tight_layout(rect=[0,0,1,0.96])
plt.savefig("vessel_sizing_geometry.png", dpi=160)
plt.close()
print("saved")
