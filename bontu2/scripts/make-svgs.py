#!/usr/bin/env python3
"""Generates the illustrated artwork in public/img/*.svg.
Run:  python3 scripts/make-svgs.py
Edit colours / shapes here and re-run to restyle every illustration at once."""
import random, math, os

random.seed(11)
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'img')
os.makedirs(OUT, exist_ok=True)

ROAST, CLAY, CLAY2 = '#1E130E', '#6A3D28', '#8A5A3A'
SAFFRON, GRASS, GRASS2, CHERRY = '#E3A72F', '#3E6A2B', '#5E8A3A', '#A22A2E'
CREAM, EMBER = '#F4EFE4', '#F08A2C'

STYLE = """<style>
.smoke{fill:none;stroke:#fff;stroke-opacity:.38;stroke-width:3;stroke-linecap:round;stroke-dasharray:140;stroke-dashoffset:140;animation:rise 5.5s ease-in-out infinite}
@keyframes rise{0%{stroke-dashoffset:140;opacity:0}25%{opacity:1}100%{stroke-dashoffset:-140;opacity:0}}
.glow{animation:glow 2.4s ease-in-out infinite alternate}
@keyframes glow{from{opacity:.65}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.smoke{animation:none;stroke-dashoffset:0;opacity:.45}.glow{animation:none}}
</style>"""

JEBENA_DEFS = f"""
<clipPath id="jb-body"><path d="M255 430 C205 425 200 345 250 300 C270 282 275 260 277 200 L279 150 L321 150 L323 200 C325 260 330 282 350 300 C400 345 395 425 345 430 Z"/></clipPath>
<g id="jebena">
  <path d="M240 430 L360 430 L376 482 L224 482 Z" fill="{CLAY2}"/>
  <path d="M224 482 L376 482 L376 488 L224 488 Z" fill="{CLAY}"/>
  <ellipse class="glow" cx="300" cy="446" rx="34" ry="9" fill="{EMBER}"/>
  <ellipse cx="300" cy="446" rx="18" ry="4.5" fill="#FFD27A"/>
  <path d="M277 175 C235 180 225 250 246 300 L258 296 C245 255 250 205 279 192 Z" fill="{CLAY}"/>
  <path d="M350 300 C385 282 410 242 432 214 L443 223 C422 256 392 302 360 332 Z" fill="{CLAY}"/>
  <path d="M255 430 C205 425 200 345 250 300 C270 282 275 260 277 200 L279 150 L321 150 L323 200 C325 260 330 282 350 300 C400 345 395 425 345 430 Z" fill="{CLAY}"/>
  <g clip-path="url(#jb-body)">
    <rect x="190" y="352" width="220" height="7" fill="{SAFFRON}"/>
    <rect x="190" y="362" width="220" height="4" fill="{GRASS2}"/>
    <rect x="190" y="369" width="220" height="7" fill="{CHERRY}"/>
    <rect x="270" y="203" width="60" height="6" fill="{SAFFRON}"/>
    <rect x="270" y="213" width="60" height="3" fill="{CHERRY}"/>
    <path d="M232 385 C228 360 245 330 262 318" stroke="#fff" stroke-opacity=".14" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M232 420 C226 405 226 396 228 392" stroke="#fff" stroke-opacity=".10" stroke-width="6" fill="none" stroke-linecap="round"/>
  </g>
  <ellipse cx="300" cy="150" rx="22" ry="5.5" fill="#120a06"/>
  <path d="M283 150 L288 124 L312 124 L317 150 Z" fill="#C9A24B"/>
  <path d="M290 150 L292 128 M300 150 L300 126 M309 150 L308 128" stroke="#9c7a2e" stroke-width="1.6"/>
  <path class="smoke" style="animation-delay:.4s" d="M437 208 c-9 -16 10 -24 2 -40"/>
  <path class="smoke" style="animation-delay:2.6s" d="M440 212 c-10 -14 8 -26 0 -38"/>
</g>"""


def grass(x0, x1, y, n, hmin=10, hmax=26):
    cols = [GRASS, GRASS2, '#7BA650', '#2F5420']
    s = []
    for _ in range(n):
        x = random.uniform(x0, x1)
        h = random.uniform(hmin, hmax)
        lean = random.uniform(-7, 7)
        s.append(f'<path d="M{x:.1f} {y} q{lean/2:.1f} {-h/2:.1f} {lean:.1f} {-h:.1f}" stroke="{random.choice(cols)}" '
                 f'stroke-width="{random.uniform(1.6,2.8):.1f}" fill="none" stroke-linecap="round"/>')
    return ''.join(s)


def cup(x, y, s=1.0, coffee='#2a140c'):
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<path d="M-12 -18 h24 l-3.5 18 h-17 z" fill="{CREAM}"/>'
            f'<path d="M-11.4 -13 h22.8 l-.6 3.4 h-21.6 z" fill="{SAFFRON}"/>'
            f'<ellipse cx="0" cy="-18" rx="12" ry="2.8" fill="{coffee}"/>'
            f'<ellipse cx="0" cy="0.5" rx="8" ry="1.6" fill="#000" opacity=".25"/></g>')


def steam(x, y, delay=0, scale=1):
    return (f'<path class="smoke" style="animation-delay:{delay}s" '
            f'transform="translate({x} {y}) scale({scale})" d="M0 0 c-7 -10 7 -16 0 -28"/>')


def incense(x, y, delay=0):
    return (f'<g><rect x="{x-14}" y="{y-6}" width="28" height="6" rx="1" fill="{CLAY}"/>'
            f'<path d="M{x-28} {y-30} h56 c0 18 -10 25 -28 25 c-18 0 -28 -7 -28 -25 z" fill="{CLAY2}"/>'
            f'<rect x="{x-28}" y="{y-20}" width="56" height="4" fill="{SAFFRON}" opacity=".9"/>'
            f'<ellipse class="glow" cx="{x}" cy="{y-30}" rx="25" ry="4.5" fill="{EMBER}"/>'
            f'<path class="smoke" style="animation-delay:{delay}s" d="M{x} {y-33} c-14 -20 14 -30 0 -50 c-12 -18 12 -28 2 -46"/>'
            f'<path class="smoke" style="animation-delay:{delay+1.8}s" d="M{x+4} {y-33} c12 -20 -12 -30 0 -50 c10 -18 -10 -28 -2 -46"/></g>')


def popcorn(x, y):
    k = []
    for _ in range(16):
        px = x + random.uniform(-26, 26)
        py = y - 24 - random.uniform(0, 16) * (1 - abs(px - x) / 40)
        r = random.uniform(5, 8)
        k.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{r:.1f}" fill="#FBF6E8"/>'
                 f'<circle cx="{px+1.5:.1f}" cy="{py+1.5:.1f}" r="{r*.45:.1f}" fill="#E9DFC3"/>')
    return (f'<g>' + ''.join(k) +
            f'<path d="M{x-32} {y-24} h64 c0 15 -13 24 -32 24 c-19 0 -32 -9 -32 -24 z" fill="{CLAY2}"/>'
            f'<rect x="{x-32}" y="{y-24}" width="64" height="4" fill="{SAFFRON}"/></g>')


def bunting(w, y0=34, sag=34, n=11):
    pts = []
    d = f'M0 {y0} Q{w/2} {y0+sag*2} {w} {y0}'
    out = [f'<path d="{d}" stroke="{CREAM}" stroke-opacity=".7" stroke-width="1.6" fill="none"/>']
    cols = [GRASS2, SAFFRON, CHERRY]
    for i in range(1, n + 1):
        t = i / (n + 1)
        px = (1 - t) ** 2 * 0 + 2 * (1 - t) * t * (w / 2) + t ** 2 * w
        py = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * (y0 + sag * 2) + t ** 2 * y0
        out.append(f'<path d="M{px-11:.1f} {py-1:.1f} L{px+11:.1f} {py-1:.1f} L{px:.1f} {py+24:.1f} Z" fill="{cols[i%3]}"/>')
    return ''.join(out)


def rings(cx, cy, r, op=.07):
    return ''.join(f'<circle cx="{cx}" cy="{cy}" r="{r*k}" fill="none" stroke="{SAFFRON}" stroke-opacity="{op}" stroke-width="2"/>'
                   for k in (1, .8, .6, .4)) + f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{SAFFRON}" fill-opacity="{op*.6}"/>'


def write(name, w, h, body, defs=''):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img">{STYLE}<defs>{defs}</defs>{body}</svg>')
    with open(os.path.join(OUT, name), 'w', encoding='utf-8') as f:
        f.write(svg)
    print('wrote', name)


# ---------------------------------------------------------------- hero (transparent bg, sits on dark roast)
hero = rings(300, 280, 215)
hero += f'<rect x="0" y="480" width="640" height="40" fill="#24391A"/>' + grass(0, 640, 484, 190, 12, 30)
hero += '<use href="#jebena"/>'
hero += incense(105, 486, 0)
hero += popcorn(190, 486)
hero += f'<ellipse cx="505" cy="486" rx="112" ry="13" fill="#7A4B2E"/><ellipse cx="505" cy="482" rx="112" ry="11" fill="#8E5A38"/>'
for i, x in enumerate((445, 475, 505, 535, 565)):
    hero += cup(x, 476, 1.15, '#2a140c') + steam(x, 452, i * .9, .9)
hero += grass(0, 640, 500, 80, 8, 18)
write('hero.svg', 640, 520, hero, JEBENA_DEFS)

# ---------------------------------------------------------------- package scenes
def scene(bg, extras, ncups, jx=330, withbunting=False, popc=False, inc=False, name='x'):
    w, h = 480, 360
    b = f'<rect width="{w}" height="{h}" fill="{bg}"/>' + rings(240, 170, 170, .08)
    if withbunting:
        b += bunting(w)
    b += f'<rect y="318" width="{w}" height="42" fill="#24391A"/>' + grass(0, w, 322, 150, 10, 24)
    b += f'<g transform="translate({jx-300*.62} 27) scale(.62)"><use href="#jebena"/></g>'
    if inc:
        b += incense(46, 338, 0)
    if popc:
        b += popcorn(448, 338)
    b += f'<ellipse cx="338" cy="338" rx="125" ry="11" fill="#7A4B2E"/><ellipse cx="338" cy="335" rx="125" ry="9" fill="#8E5A38"/>'
    span = 140 if popc else 210
    for i in range(ncups):
        x = 338 - span / 2 + (span * i / max(ncups - 1, 1)) if ncups > 1 else 338
        b += cup(f'{x:.0f}', 331, 1.0)
    b += grass(0, w, 345, 50, 8, 16)
    write(name, w, h, b, JEBENA_DEFS)

scene('#2B3F1D', '', 2, jx=150, inc=True, name='pack-basic.svg')
scene(ROAST, '', 3, jx=150, popc=True, inc=True, name='pack-premium.svg')
scene('#4A1519', '', 8, jx=120, withbunting=True, popc=False, name='pack-wedding.svg')

# ---------------------------------------------------------------- about: three rounds
a = f'<rect width="640" height="420" fill="{ROAST}"/>' + rings(320, 210, 200, .09)
a += f'<rect y="372" width="640" height="48" fill="#24391A"/>' + grass(0, 640, 376, 220, 10, 26)
a += f'<g transform="translate(-60 -54) scale(.9)"><use href="#jebena"/></g>'
a += f'<ellipse cx="450" cy="384" rx="190" ry="14" fill="#7A4B2E"/><ellipse cx="450" cy="380" rx="190" ry="12" fill="#8E5A38"/>'
for i, (x, col) in enumerate(((340, '#1c0e08'), (450, '#4a2e1c'), (560, '#8a6a4a'))):
    a += cup(x, 374, 2.1, col) + steam(x, 320, i * 1.1, 1.4)
a += grass(0, 640, 392, 90, 8, 18)
write('about.svg', 640, 420, a, JEBENA_DEFS)

# ---------------------------------------------------------------- logo / favicon
logo = (f'<circle cx="60" cy="60" r="58" fill="{ROAST}"/><circle cx="60" cy="60" r="54" fill="none" stroke="{SAFFRON}" stroke-width="3"/>'
        f'<circle cx="60" cy="60" r="48" fill="none" stroke="{GRASS2}" stroke-width="1.5" stroke-dasharray="3 5"/>'
        f'<g transform="translate(-2 -2) scale(.2)"><use href="#jebena"/></g>')
write('logo.svg', 120, 120, logo, JEBENA_DEFS)

# ---------------------------------------------------------------- woven band (tibeb-style), repeats horizontally
band = f'<rect width="72" height="22" fill="{ROAST}"/><rect width="72" height="2.5" fill="{SAFFRON}"/><rect y="19.5" width="72" height="2.5" fill="{SAFFRON}"/>'
for i, c in enumerate((GRASS2, SAFFRON, CHERRY)):
    cx = 12 + i * 24
    band += (f'<polygon points="{cx},4 {cx+9},11 {cx},18 {cx-9},11" fill="{c}"/>'
             f'<polygon points="{cx},8 {cx+4},11 {cx},14 {cx-4},11" fill="{ROAST}"/>')
write('band.svg', 72, 22, band)
