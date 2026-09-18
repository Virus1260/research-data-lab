# Generates a dark-theme, color-coded SVG P&ID for the AFD-style freeze dryer.
svg_parts = []
def add(s): svg_parts.append(s)

W,H = 1920,1080
add(f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif">')
add(f'<rect x="0" y="0" width="{W}" height="{H}" fill="#0b0f19"/>')

# palette
PROCESS="#38BDF8"   # ice blue - process/vacuum
CRYO="#06B6D4"       # cyan - cryo cooling loop
HEAT="#F59E0B"       # amber - heating loop
STEAM="#10B981"      # emerald - steam/CIP
AIR="#94A3B8"        # slate - instrument air/N2 purge (dashed)
SIGNAL="#22C55E"     # green - electrical/bus signal (dashed)
SIS="#EF4444"        # red - safety instrumented function
TEXT="#E2E8F0"
DIM="#64748B"
EQUIP_FILL="#111827"
EQUIP_STROKE="#334155"

add(f'<text x="{W/2}" y="40" fill="{TEXT}" font-size="26" font-weight="bold" text-anchor="middle">P&amp;ID — AFD-Style Stirred/Agitated Pharma Freeze Dryer (Dark/HMI-style reference)</text>')
add(f'<text x="{W/2}" y="66" fill="{DIM}" font-size="14" font-style="italic" text-anchor="middle">Original SVG diagram for this package — vector, reusable, colour-coded by service. Not a Hosokawa manufacturer drawing.</text>')

def rect(x,y,w,h,fill=EQUIP_FILL,stroke=EQUIP_STROKE,sw=2,rx=6,dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

def text(x,y,s,size=13,fill=TEXT,anchor="middle",weight="normal"):
    add(f'<text x="{x}" y="{y}" fill="{fill}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}">{s}</text>')

def line(x1,y1,x2,y2,color=PROCESS,sw=3,dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    add(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{sw}"{d} stroke-linecap="round"/>')

def polyline(pts,color=PROCESS,sw=3,dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    p = " ".join(f"{x},{y}" for x,y in pts)
    add(f'<polyline points="{p}" fill="none" stroke="{color}" stroke-width="{sw}"{d} stroke-linecap="round" stroke-linejoin="round"/>')

def bubble(x,y,top,bot,field=True,sis=False,r=22):
    ec = SIS if sis else "#CBD5E1"
    add(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#0b0f19" stroke="{ec}" stroke-width="2"/>')
    if not field:
        add(f'<line x1="{x-r*0.8}" y1="{y}" x2="{x+r*0.8}" y2="{y}" stroke="{ec}" stroke-width="1.6"/>')
    text(x,y-2,top,size=11,fill=ec,weight="bold")
    text(x,y+13,bot,size=10,fill=ec)

def valve(x,y,label="",vertical=True,fail=None,color=PROCESS,size=16):
    s=size
    if vertical:
        add(f'<polygon points="{x-s},{y-s*0.6} {x},{y} {x-s},{y+s*0.6}" fill="none" stroke="{color}" stroke-width="2.2"/>')
        add(f'<polygon points="{x+s},{y-s*0.6} {x},{y} {x+s},{y+s*0.6}" fill="none" stroke="{color}" stroke-width="2.2"/>')
    else:
        add(f'<polygon points="{x-s*0.6},{y-s} {x},{y} {x+s*0.6},{y-s}" fill="none" stroke="{color}" stroke-width="2.2"/>')
        add(f'<polygon points="{x-s*0.6},{y+s} {x},{y} {x+s*0.6},{y+s}" fill="none" stroke="{color}" stroke-width="2.2"/>')
    if label:
        text(x, y+s+18, label, size=10.5, fill=TEXT)

def vessel(cx, top_y, bot_y, half_w_top, half_w_bot=6):
    pts_outer = [(cx-half_w_top, top_y),(cx+half_w_top, top_y),(cx+half_w_top, top_y+120),
                 (cx+half_w_bot, bot_y),(cx-half_w_bot, bot_y),(cx-half_w_top, top_y+120),(cx-half_w_top, top_y)]
    p = " ".join(f"{x},{y}" for x,y in pts_outer)
    add(f'<polygon points="{p}" fill="#0e1420" stroke="#94A3B8" stroke-width="3"/>')

# ===== BPCS signal bus =====
add(f'<line x1="60" y1="130" x2="1860" y2="130" stroke="{DIM}" stroke-width="1.5" stroke-dasharray="10 6"/>')
text(1860,116,"→ BPCS I/O bus",size=13,fill=DIM,anchor="end")

def to_bus(x,y): line(x,y,x,130,color=SIGNAL,sw=1.6,dash="5 4")
def to_bus_sis(x,y): line(x,y,x,130,color=SIS,sw=1.8,dash="3 3")

# ===== TCU + refrigeration =====
rect(60,220,230,110); text(175,255,"TCU-201",size=15,fill=TEXT,weight="bold"); text(175,278,"Temperature Control Unit",size=11); text(175,294,"(Syltherm-type HTF skid)",size=11)
rect(60,360,230,100); text(175,392,"PKG-301",size=15,fill=TEXT,weight="bold"); text(175,414,"Cascade Refrigeration",size=11); text(175,430,"Skid (package)",size=11)
line(175,360,175,330,color=CRYO,sw=4); text(200,348,"cold duty",size=10,fill=CRYO,anchor="start")

line(290,255,470,255,color=HEAT,sw=4)
bubble(390,255,"TT","201")
to_bus(390,255-22)
valve(330,255,"FCV-201",vertical=True,color=HEAT)

line(470,330,290,330,color=CRYO,sw=4)
bubble(390,330,"TT","202")
to_bus(390,330-22)

# ===== Vessel =====
vessel(760, 200, 620, 170, 6)
text(760,98,"V-101 — LYOPHILISATION VESSEL (jacketed, conical)",size=16,fill=TEXT,weight="bold")
rect(590,200,340,22,fill="#1e293b",stroke="#475569")
text(760,216,"top lid (clamped)",size=10,fill=DIM)

# agitator
rect(700,120,120,55,fill="#3f2d0b",stroke=HEAT); text(760,152,"M-101",size=13,fill=HEAT,weight="bold")
line(760,175,760,120,color="#CBD5E1",sw=3)
bubble(860,140,"SIC","101",field=False); to_bus(860,140-22)
bubble(860,200,"JIT","101"); to_bus(895,200)

# helix inside vessel (visual only)
import math
pts=[]
for i in range(140):
    yv = 320 + i*2.1
    if yv>620: break
    frac = max(0,(620-yv))/(620-320)
    rad = 6 + 150*frac*0.85
    xv = 760 + rad*math.cos(i*0.35)
    pts.append((xv,yv))
polyline(pts,color="#f97316",sw=2)

# pressure instruments
bubble(600,340,"PIT","101A"); text(520,340,"capacitance",size=9,fill=DIM,anchor="end"); to_bus(600,340-22)
bubble(600,400,"PIT","101B"); text(520,400,"Pirani",size=9,fill=DIM,anchor="end"); to_bus(600,400-22)
bubble(600,460,"PIC","101",field=False); to_bus(600,460-22)

# SIS interlocks
bubble(560,230,"ZS","101",sis=True); text(500,205,"lid closed",size=9,fill=SIS,anchor="end"); to_bus_sis(560,230-22)
bubble(540,530,"PSH","101",sis=True); text(470,530,"near-atm.",size=9,fill=SIS,anchor="end"); to_bus_sis(540,530-22)

# vacuum path
line(930,300,1080,300,color=PROCESS,sw=4)
valve(1120,300,"PV-102",vertical=True,color=PROCESS)
polyline([(1160,300),(1160,250),(1260,250),(1260,300)],color=PROCESS,sw=3)
valve(1210,250,"XV-103",vertical=True,color=PROCESS)
line(1260,300,1360,300,color=PROCESS,sw=4)
line(700,460,1120,460,color=SIGNAL,sw=1.4,dash="5 4"); line(1120,460,1120,278,color=SIGNAL,sw=1.4,dash="5 4")
text(920,445,"PIC-101 → throttles PV-102",size=10,fill=SIGNAL)

# vent/break
polyline([(930,380),(1000,380),(1000,340)],color=AIR,sw=3)
valve(1000,320,"XV-104",vertical=False,color=AIR)
add(f'<circle cx="1000" cy="280" r="10" fill="none" stroke="{AIR}" stroke-width="2"/>')
text(1000,255,"F-101 sterile vent filter",size=9,fill=DIM)

# material collector
rect(1360,220,180,180,fill="#241414",stroke="#7f1d1d"); text(1450,255,"V-102",size=15,fill=TEXT,weight="bold")
text(1450,278,"Material Collector",size=11); text(1450,294,"/ Dust Filter",size=11)
bubble(1400,360,"PDT","102"); to_bus(1400,360-22)
valve(1500,235,"",vertical=False,color=AIR); text(1500,205,"XV-106 blowback N2",size=9,fill=DIM)

# condenser
line(1540,300,1650,300,color=PROCESS,sw=4)
rect(1650,240,150,110); text(1725,270,"E-101",size=14,fill=TEXT,weight="bold"); text(1725,292,"Condenser",size=11); text(1725,308,"(-60 to -75°C)",size=10,fill=CRYO)
bubble(1690,375,"TT","103"); to_bus(1690,375-22)

# vacuum pump train
line(1800,300,1860,300,color=PROCESS,sw=4)
text(1885,300,"→ vent /",size=10,fill=DIM,anchor="start")
text(1885,315,"abatement",size=10,fill=DIM,anchor="start")

# bottom discharge
line(760,620,760,720,color=PROCESS,sw=4)
valve(760,670,"XV-105 (ball-segment)",vertical=True,color=PROCESS)
rect(700,760,120,90,fill="#1e293b",stroke="#475569"); text(760,800,"Product",size=11,fill=TEXT); text(760,818,"Canister",size=11,fill=TEXT)

# CIP / SIP
rect(1120,850,180,90,fill="#0b2b22",stroke=STEAM); text(1210,888,"PKG-501",size=13,fill=STEAM,weight="bold"); text(1210,908,"CIP Skid",size=11,fill=TEXT)
polyline([(1210,850),(1210,600),(930,470)],color=STEAM,sw=3)
bubble(1210,760,"FT","501"); to_bus(1210,760-22)

rect(1380,850,200,90,fill="#241414",stroke=SIS,dash="6 4"); text(1480,888,"PKG-502",size=13,fill=TEXT,weight="bold"); text(1480,908,"Clean Steam (SIP, optional)",size=10,fill=TEXT)
polyline([(1480,850),(1480,650)],color=STEAM,sw=3)
valve(1480,620,"PV-502",vertical=True,color=STEAM)
polyline([(1480,590),(1480,540),(930,510)],color=STEAM,sw=3)
bubble(1600,620,"TT","503"); to_bus(1600,620-22)

# ===== Legend =====
lx,ly=60,600
rect(lx,ly,420,380,fill="#0e1420",stroke="#334155")
text(lx+210,ly+30,"LEGEND",size=15,fill=TEXT,weight="bold")
items = [
 (PROCESS,"solid","Process / vacuum piping"),
 (CRYO,"solid","Cryogenic cooling loop"),
 (HEAT,"solid","Heating fluid loop"),
 (STEAM,"solid","Clean steam / CIP supply"),
 (AIR,"dashed","Instrument air / N2 purge"),
 (SIGNAL,"dashed2","Signal to BPCS"),
 (SIS,"dashed3","Signal to SIS (safety)"),
]
yy = ly+60
for color,style,label in items:
    if style=="solid":
        line(lx+20,yy,lx+70,yy,color=color,sw=4)
    elif style=="dashed":
        line(lx+20,yy,lx+70,yy,color=color,sw=3,dash="6 4")
    elif style=="dashed2":
        line(lx+20,yy,lx+70,yy,color=color,sw=2,dash="5 4")
    else:
        line(lx+20,yy,lx+70,yy,color=color,sw=2,dash="3 3")
    text(lx+90,yy+4,label,size=12,anchor="start")
    yy+=32

bubble(lx+35,yy+15,"XX","101",field=True); text(lx+90,yy+20,"Field-mounted instrument",size=12,anchor="start"); yy+=50
bubble(lx+35,yy+15,"XX","101",field=False); text(lx+90,yy+20,"Control-system point (BPCS)",size=12,anchor="start"); yy+=50
bubble(lx+35,yy+15,"XX","101",sis=True); text(lx+90,yy+20,"Safety Instrumented Function",size=12,anchor="start")

add('</svg>')

with open("pid_afd_freeze_dryer_dark.svg","w") as f:
    f.write("\n".join(svg_parts))
print("SVG written,", len(svg_parts), "elements")
