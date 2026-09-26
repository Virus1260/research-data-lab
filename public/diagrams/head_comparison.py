import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10})
fig, axes = plt.subplots(1, 3, figsize=(13, 6.5), dpi=160)
fig.suptitle("Original Diagram — Top-Closure Head Options Compared (same nominal diameter D)", fontsize=13, y=0.98)

D = 2.0
x = np.linspace(-D/2, D/2, 400)

# Flat
ax = axes[0]
ax.plot(x, np.zeros_like(x), color="black", lw=4)
ax.plot([-D/2,-D/2],[0,-0.15], color="black", lw=2)
ax.plot([D/2,D/2],[0,-0.15], color="black", lw=2)
ax.fill_between(x, 0, 0.35, color="#fde2e2", alpha=0.6)
ax.set_title("FLAT", fontsize=12, weight="bold", color="#b23b3b")
ax.text(0, -0.55, "Resists external pressure by\nbending only — needs very\nthick plate or ribs at this\ndiameter. Avoid except very\nsmall diameters.", ha="center", fontsize=8.3)

# Torispherical (standard F&D: L=D, r=0.06D)
ax = axes[1]
L = D
r = 0.06*D
theta = np.linspace(0, np.pi/2, 200)
# simple representative profile: knuckle blending into crown, illustrative not exact
xs = []
ys = []
for xv in x:
    frac = abs(xv)/(D/2)
    if frac < 0.85:
        yv = 0.28*(1-frac**2)**0.5 * (L/D)
    else:
        yv = 0.28*(1-0.85**2)**0.5*(L/D) * (1-((frac-0.85)/0.15))**0.5 if frac<1 else 0
    xs.append(xv); ys.append(max(yv,0))
ax.plot(xs, ys, color="black", lw=3)
ax.fill_between(xs, 0, ys, color="#eaf2fb", alpha=0.6)
ax.set_title("TORISPHERICAL (standard F&D)", fontsize=12, weight="bold", color="#1f6fb2")
ax.text(0, -0.55, "Crown radius L≈D, knuckle\nr≥0.06D (M≈1.77). Cheapest,\nmost available. Good default\nfor a demountable lid at\nthis scale.", ha="center", fontsize=8.3)

# Ellipsoidal 2:1
ax = axes[2]
h = D/4
ys2 = h*np.sqrt(np.clip(1-(x/(D/2))**2,0,None))
ax.plot(x, ys2, color="black", lw=3)
ax.fill_between(x, 0, ys2, color="#eafbea", alpha=0.6)
ax.set_title("ELLIPSOIDAL (2:1)", fontsize=12, weight="bold", color="#2ca02c")
ax.text(0, -0.55, "L=0.9D, r=0.17D, depth D/4.\nBest strength-to-thickness of\nthe three (smoothest curvature,\nno knuckle discontinuity) —\ncosts more to tool/form.", ha="center", fontsize=8.3)

for ax in axes:
    ax.set_xlim(-1.3,1.3)
    ax.set_ylim(-0.9,0.7)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.plot([-D/2,D/2],[0,0], color="#888888", lw=1, ls="--", zorder=0)

fig.text(0.5, 0.02, "All three must be checked for BOTH the external-pressure (vacuum) case, which usually governs, and the internal SIP steam-pressure case, per UG-33 / UG-32.",
          ha="center", fontsize=8.6, color="#333333")
plt.tight_layout(rect=[0,0.04,1,0.90])
plt.savefig("head_type_comparison.png", dpi=160)
plt.close()
print("saved")
