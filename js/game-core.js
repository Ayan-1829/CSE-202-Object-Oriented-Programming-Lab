/* ===================== game-core.js : Code Commando, the course's running game =====================
   Sprites drawn with the same shapes and colours as Sprites.java (Chapters 9 and 10), a small battle
   simulation that follows GamePanel.update() from Chapter 10, and a scene runner that animates a canvas
   only while its slide is on screen. Scenes and demos built on this live in game-scenes.js. */

const GW = 760, GH = 380, GGROUND = 330;
const G_REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---------- canvas ---------- */
function gCanvas(w, hgt, label) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cvs = h('canvas', { width: Math.round(w * dpr), height: Math.round(hgt * dpr), class: 'g-cvs', role: 'img', 'aria-label': label || 'Code Commando game scene' });
  cvs.style.aspectRatio = w + ' / ' + hgt;
  cvs.style.setProperty('--ar', String(w / hgt));
  const g = cvs.getContext ? cvs.getContext('2d') : null;
  if (g) g.scale(dpr, dpr);
  return { cvs, g, w, h: hgt };
}
/* text drawn on a canvas: the Bengali version once the page is switched (js/lang.js), English otherwise */
const gT = (s) => (document.documentElement.getAttribute('data-lang') === 'bn' && window.I18N && window.I18N.dict[s]) || s;
const rgb = (r, gg, b, a) => (a == null ? `rgb(${r},${gg},${b})` : `rgba(${r},${gg},${b},${a})`);
function rr(g, x, y, w, hh, r) {
  g.beginPath();
  if (g.roundRect) g.roundRect(x, y, w, hh, r);
  else { g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  g.fill();
}
const oval = (g, x, y, w, hh) => { g.beginPath(); g.ellipse(x + w / 2, y + hh / 2, w / 2, hh / 2, 0, 0, Math.PI * 2); g.fill(); };
/* Java's fillArc(x, y, w, h, 0, 180): the top half of the oval in that box */
const halfTop = (g, x, y, w, hh) => { g.beginPath(); g.ellipse(x + w / 2, y + hh / 2, w / 2, hh / 2, 0, Math.PI, Math.PI * 2); g.closePath(); g.fill(); };

/* a rounded label: o = { bg, fg, font, align: 'left' | 'center' | 'right', pad } */
function gTag(g, x, y, text, o = {}) {
  g.save();
  g.font = o.font || '600 14px "IBM Plex Mono", ui-monospace, monospace';
  const pad = o.pad == null ? 6 : o.pad, w = g.measureText(text).width + pad * 2, hh = (o.size || 14) + pad * 1.6;
  const left = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  g.fillStyle = o.bg || 'rgba(8,14,26,.82)';
  rr(g, left, y - hh / 2, w, hh, 6);
  if (o.border) { g.strokeStyle = o.border; g.lineWidth = 2; g.beginPath(); if (g.roundRect) g.roundRect(left, y - hh / 2, w, hh, 6); else g.rect(left, y - hh / 2, w, hh); g.stroke(); }
  g.fillStyle = o.fg || '#F4F7FB';
  g.textBaseline = 'middle';
  g.fillText(text, left + pad, y + 1);
  g.restore();
  return w;
}
function gArrow(g, x1, y1, x2, y2, col, wdt) {
  g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = wdt || 2.5;
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1), s = 9;
  g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - s * Math.cos(a - 0.45), y2 - s * Math.sin(a - 0.45)); g.lineTo(x2 - s * Math.cos(a + 0.45), y2 - s * Math.sin(a + 0.45)); g.closePath(); g.fill();
  g.restore();
}

/* ---------- sprites ----------
   Same positions, sizes and colours as Sprites.java (Chapters 9 and 10), so every hit box and layout
   matches the Java game. The browser adds what Java would need many more lines for: gradients for
   light and shade, soft shadows, glows and a layered city. */
const lin = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
const rad = (g, x, y, r0, r1, stops) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
function rrPath(g, x, y, w, hh, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, hh, r); else g.rect(x, y, w, hh); }
const shadow = (g, cx, y, w, a = 0.35) => { g.save(); g.fillStyle = rad(g, cx, y, 1, w / 2, [[0, `rgba(0,0,0,${a})`], [1, 'rgba(0,0,0,0)']]); g.beginPath(); g.ellipse(cx, y, w / 2, w / 9, 0, 0, Math.PI * 2); g.fill(); g.restore(); };
const SPR = {
  bg(g, w, hgt, ground, t = 0) {
    g.save();
    g.fillStyle = lin(g, 0, 0, 0, ground, [[0, rgb(8, 16, 34)], [0.55, rgb(22, 40, 72)], [1, rgb(58, 70, 98)]]);
    g.fillRect(0, 0, w, ground);
    // moon with a soft halo
    const mx = w * 0.82, my = Math.min(56, ground * 0.28);
    g.fillStyle = rad(g, mx, my, 4, 70, [[0, 'rgba(230,236,255,.35)'], [1, 'rgba(230,236,255,0)']]); g.fillRect(mx - 70, my - 70, 140, 140);
    g.fillStyle = rad(g, mx - 4, my - 4, 2, 16, [[0, '#FFFBEA'], [1, '#D9DDE6']]); g.beginPath(); g.arc(mx, my, 15, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 34; i++) {                       // stars that twinkle
      const sx = (i * 137) % w, sy = (i * 61) % Math.max(40, ground - 130) + 8, tw = 0.3 + 0.4 * Math.sin(t / 40 + i);
      g.fillStyle = rgb(225, 232, 255, tw); g.fillRect(sx, sy, i % 5 ? 1.5 : 2.5, i % 5 ? 1.5 : 2.5);
    }
    const k = Math.min(1, ground / 330);
    // far skyline: hazy and blue
    g.fillStyle = rgb(30, 46, 74);
    for (let i = 0, x = -10; x < w; i++) { const bw = 34 + (i * 29) % 40, bh = (70 + (i * 53) % 90) * k; g.fillRect(x, ground - bh, bw, bh); x += bw + 2; }
    g.fillStyle = lin(g, 0, ground - 110 * k, 0, ground, [[0, 'rgba(58,70,98,0)'], [1, 'rgba(58,70,98,.55)']]); g.fillRect(0, ground - 110 * k, w, 110 * k);
    // near skyline (the same eight blocks as Sprites.java) with lit windows
    const tops = [60, 90, 40, 110, 70, 50, 95, 65], bw = Math.floor(w / tops.length);
    tops.forEach((tp0, i) => {
      const tp = tp0 * k, bx = i * bw + 6, ww = bw - 12;
      g.fillStyle = lin(g, bx, 0, bx + ww, 0, [[0, rgb(30, 46, 70)], [0.7, rgb(24, 38, 60)], [1, rgb(18, 30, 50)]]);
      g.fillRect(bx, ground - tp, ww, tp);
      g.fillStyle = rgb(40, 58, 86); g.fillRect(bx, ground - tp, ww, 2);
      for (let r = 0; r < Math.floor((tp - 10) / 12); r++) for (let c = 0; c < Math.floor((ww - 8) / 10); c++) {
        const on = ((i * 7 + r * 13 + c * 5) % 9) < 2;
        if (!on) continue;
        g.fillStyle = ((i + r + c) % 3) ? 'rgba(255,214,130,.75)' : 'rgba(170,210,255,.6)';
        g.fillRect(bx + 6 + c * 10, ground - tp + 8 + r * 12, 4, 5);
      }
    });
    // ground: soil, a grass edge and a few stones
    g.fillStyle = lin(g, 0, ground, 0, hgt, [[0, rgb(70, 56, 42)], [1, rgb(40, 31, 24)]]); g.fillRect(0, ground, w, hgt - ground);
    g.fillStyle = lin(g, 0, ground - 2, 0, ground + 6, [[0, rgb(108, 160, 80)], [1, rgb(58, 96, 46)]]); g.fillRect(0, ground - 1, w, 6);
    g.fillStyle = rgb(92, 140, 66);
    for (let x = 3; x < w; x += 7) g.fillRect(x, ground - 3 - (x * 13) % 3, 1.5, 4);
    g.fillStyle = 'rgba(0,0,0,.18)';
    for (let i = 0; i < 18; i++) { const sx = (i * 97) % w, sy = ground + 12 + (i * 37) % Math.max(8, hgt - ground - 16); g.beginPath(); g.ellipse(sx, sy, 3 + i % 3, 1.6, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  },
  /* (x, y) = between the boots, on the ground. o: { walk, jet, flip, armband, alpha, helmet, noGun } */
  commando(g, x, y, firing, o = {}) {
    g.save();
    if (o.alpha != null) g.globalAlpha = o.alpha;
    if (!o.jet) shadow(g, x, y + 1, 40);
    if (o.flip) { g.translate(x, 0); g.scale(-1, 1); x = 0; }
    const step = o.walk ? Math.round(Math.sin(o.walk) * 3) : 0;
    const camo = (x0, w0) => lin(g, x0, 0, x0 + w0, 0, [[0, rgb(50, 98, 46)], [0.45, rgb(76, 138, 68)], [1, rgb(40, 80, 38)]]);
    if (o.jet) {
      const fl = 12 + (o.jet % 6);
      g.fillStyle = rad(g, x - 14, y - 22, 1, fl, [[0, 'rgba(255,250,210,.95)'], [0.4, 'rgba(255,170,60,.85)'], [1, 'rgba(255,90,30,0)']]);
      g.beginPath(); g.ellipse(x - 14, y - 18, 5, fl, 0, 0, Math.PI * 2); g.fill();
    }
    // backpack
    g.fillStyle = lin(g, x - 19, 0, x - 11, 0, [[0, rgb(36, 70, 34)], [1, rgb(60, 110, 54)]]); rrPath(g, x - 19, y - 45, 8, 19, 2); g.fill();
    // legs and boots
    g.fillStyle = camo(x - 10, 20);
    rrPath(g, x - 10 - step, y - 23, 8, 20, 2); g.fill(); rrPath(g, x + 2 + step, y - 23, 8, 20, 2); g.fill();
    g.fillStyle = lin(g, 0, y - 5, 0, y, [[0, rgb(52, 44, 36)], [1, rgb(18, 16, 14)]]);
    rrPath(g, x - 12 - step, y - 5, 12, 5, 2); g.fill(); rrPath(g, x + 1 + step, y - 5, 12, 5, 2); g.fill();
    // body: shirt, vest and belt
    g.fillStyle = camo(x - 12, 24); rrPath(g, x - 12, y - 46, 24, 26, 4); g.fill();
    g.fillStyle = lin(g, x - 10, 0, x + 10, 0, [[0, rgb(58, 66, 46)], [0.5, rgb(84, 94, 64)], [1, rgb(50, 58, 40)]]); rrPath(g, x - 9, y - 44, 18, 19, 3); g.fill();
    g.fillStyle = rgb(44, 50, 34); g.fillRect(x - 6, y - 38, 5, 6); g.fillRect(x + 1, y - 38, 5, 6);
    g.fillStyle = lin(g, 0, y - 25, 0, y - 21, [[0, rgb(140, 104, 56)], [1, rgb(92, 66, 34)]]); g.fillRect(x - 12, y - 24, 24, 3);
    g.fillStyle = rgb(200, 170, 90); g.fillRect(x - 2, y - 24, 4, 3);
    if (o.armband) { g.fillStyle = '#F4F6F8'; g.fillRect(x - 12, y - 42, 24, 5); g.fillStyle = rgb(220, 50, 50); g.fillRect(x - 3, y - 42, 6, 5); }
    // head, helmet and goggles
    g.fillStyle = rad(g, x + 2, y - 54, 1, 10, [[0, rgb(240, 200, 160)], [1, rgb(196, 148, 108)]]); g.beginPath(); g.arc(x, y - 52, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = o.helmet || lin(g, x - 10, y - 66, x + 10, y - 56, [[0, rgb(80, 130, 72)], [1, rgb(38, 76, 36)]]);
    g.beginPath(); g.ellipse(x, y - 58, 10, 8, 0, Math.PI, Math.PI * 2); g.closePath(); g.fill();
    g.fillStyle = rgb(34, 66, 32); rrPath(g, x - 10, y - 59, 22, 3, 1.5); g.fill();
    g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(x - 3, y - 62, 4, 1.8, -0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = rgb(20, 24, 28); rrPath(g, x + 1, y - 56, 7, 4, 1.5); g.fill();
    g.fillStyle = 'rgba(140,210,255,.8)'; g.fillRect(x + 3, y - 55, 3, 2);
    // rifle: stock, body, magazine, barrel
    if (!o.noGun) {
      g.fillStyle = lin(g, 0, y - 38, 0, y - 32, [[0, rgb(70, 72, 76)], [1, rgb(22, 22, 24)]]);
      g.fillRect(x + 2, y - 38, 26, 6);
      g.fillStyle = rgb(26, 26, 28); g.fillRect(x + 28, y - 37, 8, 3); g.fillRect(x + 10, y - 41, 8, 3);
      g.fillStyle = rgb(40, 40, 44); g.fillRect(x + 14, y - 32, 5, 7);
      g.fillStyle = rgb(110, 80, 44); g.fillRect(x - 2, y - 37, 5, 6);
    }
    // arm and hand on the grip
    g.fillStyle = camo(x - 2, 14); rrPath(g, x - 2, y - 40, 14, 6, 3); g.fill();
    g.fillStyle = rgb(214, 168, 126); g.beginPath(); g.arc(x + 12.5, y - 37.5, 3.5, 0, Math.PI * 2); g.fill();
    if (firing && !o.noGun) {
      g.fillStyle = rad(g, x + 41, y - 36, 1, 12, [[0, 'rgba(255,255,230,1)'], [0.35, 'rgba(255,210,60,.95)'], [1, 'rgba(255,120,20,0)']]);
      g.beginPath(); g.ellipse(x + 42, y - 36, 12, 7, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  },
  /* (cx, cy) = centre */
  drone(g, cx, cy, t = 0, o = {}) {
    g.save();
    if (o.alpha != null) g.globalAlpha = o.alpha;
    // arms and motors
    g.fillStyle = lin(g, 0, cy - 11, 0, cy - 7, [[0, rgb(96, 104, 116)], [1, rgb(40, 44, 52)]]); rrPath(g, cx - 24, cy - 11, 48, 3, 1.5); g.fill();
    g.fillStyle = rgb(40, 44, 52); g.fillRect(cx - 24, cy - 13, 4, 4); g.fillRect(cx + 20, cy - 13, 4, 4);
    // spinning rotors: a blurred disc and one bright blade
    [cx - 22, cx + 22].forEach((rx, i) => {
      g.fillStyle = 'rgba(200,210,222,.28)'; g.beginPath(); g.ellipse(rx, cy - 13, 11, 2.6, 0, 0, Math.PI * 2); g.fill();
      const a = (t * 0.9 + i * 1.3) % (Math.PI * 2), bl = 10 * Math.cos(a);
      g.strokeStyle = 'rgba(225,232,240,.85)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(rx - bl, cy - 13); g.lineTo(rx + bl, cy - 13); g.stroke();
    });
    // body: a metal shell with a highlight
    g.fillStyle = o.hit ? '#FFFFFF' : lin(g, 0, cy - 8, 0, cy + 8, [[0, rgb(150, 158, 172)], [0.45, rgb(92, 100, 114)], [1, rgb(46, 50, 60)]]);
    g.beginPath(); g.ellipse(cx, cy, 16, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(cx - 4, cy - 4, 8, 2.2, 0, 0, Math.PI * 2); g.fill();
    // the red camera eye with a glow
    g.fillStyle = rad(g, cx, cy, 1, 12, [[0, 'rgba(255,90,90,.55)'], [1, 'rgba(255,60,60,0)']]); g.beginPath(); g.arc(cx, cy, 12, 0, Math.PI * 2); g.fill();
    g.fillStyle = rad(g, cx - 1, cy - 1, 0.5, 5, [[0, '#FFD0D0'], [0.4, rgb(255, 77, 77)], [1, rgb(150, 20, 30)]]); g.beginPath(); g.ellipse(cx, cy, 5, 4, 0, 0, Math.PI * 2); g.fill();
    // blinking light under the body
    if ((Math.floor(t / 20) % 2) === 0) { g.fillStyle = 'rgba(120,255,160,.9)'; g.fillRect(cx - 1, cy + 7, 2, 2); }
    g.restore();
  },
  /* (x, y) = left end of the tracks, on the ground */
  tank(g, x, y, o = {}) {
    g.save();
    if (o.alpha != null) g.globalAlpha = o.alpha;
    shadow(g, x + 35, y + 1, 84, 0.4);
    // tracks with treads and road wheels
    g.fillStyle = lin(g, 0, y - 14, 0, y, [[0, rgb(70, 70, 70)], [1, rgb(26, 26, 26)]]); rrPath(g, x, y - 14, 70, 14, 6); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1;
    for (let i = 4; i < 68; i += 5) { g.beginPath(); g.moveTo(x + i, y - 14); g.lineTo(x + i, y - 12); g.moveTo(x + i, y - 2); g.lineTo(x + i, y); g.stroke(); }
    for (let i = 0; i < 5; i++) {
      const wx = x + 10 + i * 13, wy = y - 7;
      g.fillStyle = rad(g, wx - 1, wy - 1, 0.5, 4.5, [[0, rgb(150, 150, 150)], [1, rgb(70, 70, 70)]]); g.beginPath(); g.arc(wx, wy, 4, 0, Math.PI * 2); g.fill();
      g.fillStyle = rgb(48, 48, 48); g.beginPath(); g.arc(wx, wy, 1.4, 0, Math.PI * 2); g.fill();
    }
    // hull with a camouflage pattern
    g.fillStyle = o.hit ? '#FFFFFF' : lin(g, 0, y - 28, 0, y - 14, [[0, rgb(150, 132, 76)], [1, rgb(98, 84, 44)]]);
    g.beginPath(); g.moveTo(x + 2, y - 15); g.lineTo(x + 8, y - 28); g.lineTo(x + 64, y - 28); g.lineTo(x + 68, y - 15); g.closePath(); g.fill();
    if (!o.hit) { g.fillStyle = 'rgba(70,82,40,.55)'; g.beginPath(); g.ellipse(x + 22, y - 22, 7, 3, 0.3, 0, Math.PI * 2); g.ellipse(x + 48, y - 20, 9, 3, -0.2, 0, Math.PI * 2); g.fill(); }
    // turret, hatch and the barrel with a muzzle brake
    g.fillStyle = lin(g, 0, y - 40, 0, y - 26, [[0, rgb(140, 122, 70)], [1, rgb(90, 76, 40)]]); rrPath(g, x + 20, y - 40, 28, 14, 5); g.fill();
    g.fillStyle = rgb(80, 68, 36); rrPath(g, x + 28, y - 43, 12, 4, 2); g.fill();
    g.fillStyle = lin(g, 0, y - 36, 0, y - 31, [[0, rgb(110, 110, 110)], [1, rgb(46, 46, 46)]]); g.fillRect(x - 10, y - 36, 32, 5);
    g.fillStyle = rgb(36, 36, 36); g.fillRect(x - 13, y - 37, 5, 7);
    if (o.shield) {
      g.fillStyle = rad(g, x + 32, y - 22, 10, 56, [[0, 'rgba(120,200,255,0)'], [0.8, 'rgba(120,200,255,.14)'], [1, 'rgba(120,200,255,.3)']]);
      g.beginPath(); g.ellipse(x + 32, y - 22, 52, 34, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = rgb(150, 215, 255, 0.85); g.lineWidth = 2.5; g.stroke();
    }
    g.restore();
  },
  /* a crouching sniper facing left; (x, y) = knee on the ground */
  sniper(g, x, y, o = {}) {
    g.save();
    if (o.alpha != null) g.globalAlpha = o.alpha;
    shadow(g, x + 8, y + 1, 44);
    g.fillStyle = lin(g, 0, y - 14, 0, y, [[0, rgb(74, 60, 84)], [1, rgb(40, 32, 46)]]); rrPath(g, x - 4, y - 14, 22, 14, 3); g.fill(); rrPath(g, x + 12, y - 6, 12, 6, 2); g.fill();
    g.fillStyle = lin(g, x - 2, 0, x + 18, 0, [[0, rgb(70, 56, 78)], [0.5, rgb(104, 86, 114)], [1, rgb(62, 50, 70)]]); rrPath(g, x - 2, y - 38, 20, 26, 4); g.fill();
    g.fillStyle = rad(g, x + 5, y - 46, 1, 9, [[0, rgb(224, 180, 140)], [1, rgb(176, 130, 96)]]); g.beginPath(); g.arc(x + 6.5, y - 44.5, 7.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = lin(g, 0, y - 58, 0, y - 50, [[0, rgb(200, 60, 70)], [1, rgb(130, 30, 40)]]); g.beginPath(); g.ellipse(x + 6.5, y - 51.5, 9.5, 6.5, 0, Math.PI, Math.PI * 2); g.closePath(); g.fill();
    g.fillStyle = rgb(20, 20, 22); g.fillRect(x, y - 47, 4, 3);
    // long rifle with a scope
    g.fillStyle = lin(g, 0, y - 34, 0, y - 30, [[0, rgb(70, 70, 74)], [1, rgb(20, 20, 22)]]); g.fillRect(x - 40, y - 34, 50, 4);
    g.fillStyle = rgb(30, 30, 32); rrPath(g, x - 8, y - 41, 14, 5, 2); g.fill();
    g.fillStyle = 'rgba(140,210,255,.8)'; g.fillRect(x - 9, y - 40, 2, 3);
    if (o.aim) {
      g.strokeStyle = rgb(255, 40, 40, 0.7); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 40, y - 32); g.lineTo(o.aim[0], o.aim[1]); g.stroke();
      g.fillStyle = rad(g, o.aim[0], o.aim[1], 0.5, 6, [[0, 'rgba(255,60,60,1)'], [1, 'rgba(255,40,40,0)']]); g.beginPath(); g.arc(o.aim[0], o.aim[1], 6, 0, Math.PI * 2); g.fill();
    }
    if (o.firing) { g.fillStyle = rad(g, x - 46, y - 32, 1, 10, [[0, 'rgba(255,255,230,1)'], [0.4, 'rgba(255,210,60,.9)'], [1, 'rgba(255,120,20,0)']]); g.beginPath(); g.ellipse(x - 47, y - 32, 10, 6, 0, 0, Math.PI * 2); g.fill(); }
    g.restore();
  },
  /* a glowing tracer with a short trail */
  bullet(g, x, y, enemy) {
    g.save();
    const c = enemy ? [255, 120, 60] : [255, 214, 90], dir = enemy ? 1 : -1;
    g.fillStyle = lin(g, x + dir * 18, 0, x, 0, [[0, rgb(c[0], c[1], c[2], 0)], [1, rgb(c[0], c[1], c[2], 0.55)]]);
    g.fillRect(Math.min(x, x + dir * 18), y - 1.5, 18, 3);
    g.fillStyle = rad(g, x, y, 0.5, 7, [[0, rgb(c[0], c[1], c[2], 0.5)], [1, rgb(c[0], c[1], c[2], 0)]]); g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFF8DC'; rrPath(g, x - 5, y - 2, 10, 4, 2); g.fill();
    g.restore();
  },
  /* an explosion: fireball, smoke and sparks; age counts frames */
  boom(g, cx, cy, age) {
    g.save();
    const r = 6 + age * 2, a = Math.max(0, 220 - age * 11) / 255;
    if (age > 4) { g.fillStyle = rad(g, cx, cy - age, r * 0.4, r * 1.2, [[0, `rgba(60,56,54,${a * 0.6})`], [1, 'rgba(60,56,54,0)']]); g.beginPath(); g.arc(cx, cy - age, r * 1.2, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = rad(g, cx, cy, 0.5, r, [[0, `rgba(255,250,220,${a})`], [0.35, `rgba(255,200,80,${a})`], [0.75, `rgba(240,110,30,${a * 0.85})`], [1, 'rgba(200,60,20,0)']]);
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = `rgba(255,230,150,${a})`;
    for (let i = 0; i < 8; i++) { const an = i * 0.785 + age * 0.05, d = r * 0.9 + age; g.fillRect(cx + Math.cos(an) * d, cy + Math.sin(an) * d, 2, 2); }
    g.restore();
  },
  laser(g, x1, y, x2) {
    g.save();
    g.strokeStyle = 'rgba(255,200,60,.35)'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y); g.lineTo(x2, y); g.stroke();
    g.strokeStyle = rgb(255, 220, 80); g.lineWidth = 3; g.stroke();
    g.strokeStyle = '#FFFDE8'; g.lineWidth = 1; g.stroke();
    g.restore();
  },
  healthPack(g, x, y) {
    g.save();
    shadow(g, x + 14, y + 23, 32, 0.3);
    g.fillStyle = lin(g, 0, y, 0, y + 22, [[0, '#FFFFFF'], [1, '#C9CED6']]); rrPath(g, x, y, 28, 22, 4); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = lin(g, 0, y + 4, 0, y + 18, [[0, rgb(240, 70, 70)], [1, rgb(170, 30, 36)]]); g.fillRect(x + 11, y + 4, 6, 14); g.fillRect(x + 7, y + 8, 14, 6);
    g.restore();
  },
  ammoCrate(g, x, y) {
    g.save();
    shadow(g, x + 17, y + 25, 40, 0.3);
    g.fillStyle = lin(g, 0, y, 0, y + 24, [[0, rgb(140, 124, 70)], [1, rgb(88, 76, 38)]]); rrPath(g, x, y, 34, 24, 3); g.fill();
    g.strokeStyle = rgb(64, 56, 26); g.lineWidth = 2; g.strokeRect(x + 3, y + 3, 28, 18);
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; for (let i = 8; i < 22; i += 5) { g.beginPath(); g.moveTo(x + 3, y + i); g.lineTo(x + 31, y + i); g.stroke(); }
    g.fillStyle = rgb(255, 214, 90); g.font = '700 9.5px Georgia,serif'; g.fillText('AMMO', x + 4, y + 15.5);
    g.restore();
  },
  weapon(g, x, y, kind) {               // a weapon icon, left end at (x, y) = barrel height
    g.save();
    const metal = (y0, h0) => lin(g, 0, y0, 0, y0 + h0, [[0, rgb(96, 98, 104)], [0.5, rgb(52, 54, 58)], [1, rgb(24, 24, 26)]]);
    const wood = (y0, h0) => lin(g, 0, y0, 0, y0 + h0, [[0, rgb(150, 108, 58)], [1, rgb(92, 64, 32)]]);
    if (kind === 'pistol') { g.fillStyle = metal(y - 4, 8); rrPath(g, x, y - 4, 26, 8, 2); g.fill(); g.fillStyle = wood(y + 4, 12); rrPath(g, x + 4, y + 3, 8, 13, 2); g.fill(); }
    else if (kind === 'rifle') {
      g.fillStyle = metal(y - 4, 7); g.fillRect(x, y - 4, 56, 7); g.fillStyle = rgb(30, 30, 32); g.fillRect(x + 56, y - 2, 14, 3); g.fillRect(x + 20, y - 8, 12, 4);
      g.fillStyle = wood(y - 3, 9); rrPath(g, x - 14, y - 3, 16, 9, 2); g.fill(); g.fillStyle = metal(y + 3, 11); g.fillRect(x + 18, y + 3, 7, 11);
    } else if (kind === 'rocket') {
      g.fillStyle = lin(g, 0, y - 8, 0, y + 7, [[0, rgb(104, 128, 88)], [1, rgb(52, 70, 42)]]); rrPath(g, x, y - 8, 70, 15, 5); g.fill();
      g.fillStyle = rad(g, x + 70, y - 1, 1, 8, [[0, rgb(255, 120, 100)], [1, rgb(170, 40, 30)]]); g.beginPath(); g.ellipse(x + 71, y - 0.5, 7, 5.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = metal(y + 7, 10); g.fillRect(x + 22, y + 7, 7, 10);
    } else {
      g.fillStyle = lin(g, 0, y - 5, 0, y + 5, [[0, rgb(130, 200, 250)], [1, rgb(40, 110, 170)]]); rrPath(g, x, y - 5, 34, 10, 4); g.fill();
      g.fillStyle = rad(g, x + 34, y, 1, 7, [[0, '#FFFBE0'], [1, rgb(240, 200, 60)]]); g.beginPath(); g.arc(x + 34, y, 4.5, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  },
  /* a grey outline figure: an abstract idea rather than a real object */
  ghost(g, x, y, label) {
    g.save(); g.setLineDash([5, 4]); g.strokeStyle = rgb(190, 200, 215, 0.85); g.lineWidth = 2;
    g.beginPath(); g.ellipse(x, y - 52, 9, 9, 0, 0, Math.PI * 2); g.stroke();
    g.strokeRect(x - 12, y - 42, 24, 24); g.strokeRect(x - 10, y - 18, 8, 18); g.strokeRect(x + 2, y - 18, 8, 18);
    g.restore();
    if (label) gTag(g, x, y + 14, label, { align: 'center' });
  },
  /* a red robot: "some Enemy" */
  enemyShape(g, x, y) {
    g.save();
    shadow(g, x, y + 1, 36);
    const red = (x0, w0) => lin(g, x0, 0, x0 + w0, 0, [[0, rgb(120, 36, 46)], [0.5, rgb(186, 66, 76)], [1, rgb(110, 34, 44)]]);
    g.fillStyle = red(x - 14, 28); rrPath(g, x - 14, y - 44, 28, 26, 5); g.fill();
    g.fillStyle = red(x - 10, 20); rrPath(g, x - 10, y - 18, 7, 18, 2); g.fill(); rrPath(g, x + 3, y - 18, 7, 18, 2); g.fill();
    g.fillStyle = red(x - 9, 18); rrPath(g, x - 9, y - 60, 18, 15, 4); g.fill();
    g.fillStyle = rad(g, x, y - 53, 1, 8, [[0, '#FFF0B0'], [1, rgb(255, 180, 60)]]); g.fillRect(x - 6, y - 55, 12, 4);
    g.restore();
  }
};

/* ---------- a battle that follows GamePanel.update() in Chapter 10 ---------- */
function gRandom(seed) { let s = seed >>> 0 || 1; return (n) => { s = (s * 1664525 + 1013904223) >>> 0; return Math.floor((s / 4294967296) * n); }; }
function newBattle(opt = {}) {
  const w = opt.w || GW, hgt = opt.h || GH, ground = opt.ground || GGROUND;
  return {
    w, h: hgt, ground, t: 0, score: 0, spawn: opt.firstSpawn == null ? 20 : opt.firstSpawn, over: false, rnd: gRandom(opt.seed || 7), auto: opt.auto !== false,
    tankEvery: opt.tankEvery == null ? 4 : opt.tankEvery, shots: 0, ammo: opt.ammo == null ? Infinity : opt.ammo, maxAmmo: opt.ammo == null ? Infinity : opt.ammo,
    player: { x: opt.px || 70, y: ground - 66, w: 40, h: 66, hp: 100, cool: 0, flash: 0, active: true, jet: 0 },
    enemies: [], bullets: [], booms: [], events: []
  };
}
const box = (o) => ({ x: o.x, y: o.y, w: o.w, h: o.h });
const hitTest = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
function addEnemy(s, kind, y) {
  if (kind === 'tank') s.enemies.push({ kind, x: s.w + 10, y: s.ground - 40, w: 80, h: 40, hp: 3, points: 300, touch: 30, reload: 60, active: true, hitT: 0 });
  else s.enemies.push({ kind: 'drone', x: s.w + 10, y, baseY: y, w: 60, h: 22, hp: 1, points: 100, touch: 15, age: 0, active: true, hitT: 0 });
}
/* input: { dx, dy, fire, restart } or null for the built-in pilot */
function battleStep(s, input) {
  s.events.length = 0;
  if (s.over) { if (input && input.restart) Object.assign(s, newBattle({ w: s.w, h: s.h, ground: s.ground, seed: s.t + 3, auto: s.auto })); return; }
  s.t++;
  const p = s.player;
  let inp = input;
  if (!inp) {                                         // the built-in pilot: line the rifle up with the nearest enemy
    const targets = s.enemies.filter((e) => e.active && e.x > p.x + 40).sort((a, b) => a.x - b.x);
    const tgt = targets[0];
    const gunY = p.y + p.h - 36;
    let dy = 0;
    if (tgt) { const ty = tgt.y + tgt.h / 2; dy = ty < gunY - 6 ? -1 : ty > gunY + 6 ? 1 : 0; }
    else if (p.y < s.ground - p.h) dy = 1;
    inp = { dx: 0, dy, fire: !!tgt && Math.abs(tgt.y + tgt.h / 2 - gunY) < 14 && tgt.x < s.w - 20 };
  }
  p.x = Math.max(10, Math.min(s.w / 2, p.x + (inp.dx || 0) * 4));
  p.y = Math.max(90, Math.min(s.ground - p.h, p.y + (inp.dy || 0) * 4));
  p.jet = p.y < s.ground - p.h - 1 ? p.jet + 1 : 0;
  if (p.cool > 0) p.cool--;
  if (p.flash > 0) p.flash--;
  if (inp.fire && p.cool === 0) {
    if (s.ammo > 0) {
      s.ammo--; s.shots++;
      p.cool = 10; p.flash = 3;
      s.bullets.push({ x: p.x + p.w / 2 + 40 - 5, y: p.y + p.h - 36 - 2, w: 10, h: 4, v: 9, enemy: false, active: true });
      s.events.push('shot');
    } else { p.cool = 20; s.events.push('empty'); }
  }
  if (--s.spawn <= 0) {
    if (s.tankEvery && s.rnd(s.tankEvery) === 0) addEnemy(s, 'tank');
    else addEnemy(s, 'drone', 90 + s.rnd(170));
    s.spawn = Math.max(30, 80 - Math.floor(s.score / 200));
  }
  s.enemies.forEach((e) => {
    if (e.hitT > 0) e.hitT--;
    if (e.kind === 'drone') { e.age++; e.x -= 2.6; e.y = e.baseY + Math.sin(e.age / 12) * 18; }
    else {
      e.x -= 1.1; if (e.reload > 0) e.reload--;
      if (e.reload === 0 && e.x <= s.w - 40) { e.reload = 110; s.bullets.push({ x: e.x - 5, y: e.y + 4, w: 10, h: 4, v: -5, enemy: true, active: true }); }
    }
    if (e.x + e.w < 0) e.active = false;
  });
  s.bullets.forEach((b) => { b.x += b.v; if (b.x < -20 || b.x > s.w + 20) b.active = false; });
  s.booms.forEach((x) => { x.age++; });
  s.bullets.forEach((b) => {
    if (!b.active) return;
    if (b.enemy) { if (p.active && hitTest(box(b), box(p))) { b.active = false; hurt(s, 20); } return; }
    for (const e of s.enemies) {
      if (e.active && hitTest(box(b), box(e))) {
        b.active = false; e.hp--; e.hitT = 4;
        if (e.hp <= 0) { e.active = false; s.score += e.points; s.booms.push({ x: e.x + e.w / 2, y: e.y + e.h / 2, age: 0 }); s.events.push('kill'); }
        break;
      }
    }
  });
  s.enemies.forEach((e) => { if (e.active && p.active && hitTest(box(e), box(p))) { e.active = false; hurt(s, e.touch); s.booms.push({ x: e.x + e.w / 2, y: e.y + e.h / 2, age: 0 }); } });
  s.enemies = s.enemies.filter((e) => e.active);
  s.bullets = s.bullets.filter((b) => b.active);
  s.booms = s.booms.filter((x) => x.age <= 20);
  if (!p.active) s.over = true;
}
function hurt(s, n) { const p = s.player; p.hp = Math.max(0, p.hp - n); s.events.push('hurt'); if (p.hp === 0) p.active = false; }
/* o: { hud, boxes, hidePlayer } */
function battleDraw(g, s, o = {}) {
  SPR.bg(g, s.w, s.h, s.ground, s.t);
  s.enemies.forEach((e) => {
    if (e.kind === 'drone') SPR.drone(g, e.x + e.w / 2, e.y + 14, s.t, { hit: e.hitT > 0 });
    else SPR.tank(g, e.x + 10, e.y + e.h, { hit: e.hitT > 0 });
  });
  s.bullets.forEach((b) => SPR.bullet(g, b.x + 5, b.y + 2, b.enemy));
  const p = s.player;
  if (p.active && !o.hidePlayer) SPR.commando(g, p.x + p.w / 2, p.y + p.h, p.flash > 0, { jet: p.jet });
  s.booms.forEach((x) => SPR.boom(g, x.x, x.y, x.age));
  if (o.boxes) {
    g.save(); g.lineWidth = 2;
    const all = [p].concat(s.enemies, s.bullets);
    all.forEach((a) => {
      const bad = all.some((b) => b !== a && hitTest(box(a), box(b)) && !(a === p && b.enemy === false) && !(b === p && a.enemy === false));
      g.strokeStyle = bad ? rgb(255, 70, 70) : a === p ? rgb(120, 230, 150) : a.v ? rgb(255, 230, 120) : rgb(120, 200, 255);
      g.strokeRect(a.x, a.y, a.w, a.h);
    });
    g.restore();
  }
  if (o.hud !== false) {
    // a framed health bar that shades from green to red, and HUD numbers in the code font (clear digits)
    g.fillStyle = 'rgba(0,0,0,.55)'; rr(g, 8, 8, 214, 26, 6);
    const hpc = p.hp > 60 ? [80, 200, 110] : p.hp > 30 ? [240, 190, 60] : [230, 70, 60];
    g.fillStyle = lin(g, 0, 10, 0, 32, [[0, rgb(hpc[0] + 15, hpc[1] + 15, hpc[2] + 15)], [1, rgb(hpc[0] - 50, hpc[1] - 50, hpc[2] - 40)]]);
    if (p.hp > 0) rr(g, 10, 10, Math.max(4, p.hp * 2), 22, 4);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(12, 11, Math.max(0, p.hp * 2 - 4), 3);
    g.fillStyle = '#fff'; g.font = '700 15px "IBM Plex Mono",ui-monospace,monospace'; g.textBaseline = 'alphabetic';
    g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 3;
    g.fillText('HP ' + p.hp, 16, 27);
    g.fillText('Score ' + s.score, s.w - 130, 27);
    if (s.maxAmmo !== Infinity) g.fillText('Ammo ' + s.ammo, 236, 27);
    g.shadowBlur = 0; g.shadowColor = 'transparent';
    if (s.over) {
      g.shadowBlur = 0; g.font = '700 40px Georgia,serif'; g.fillText('GAME OVER', s.w / 2 - 120, s.h / 2 - 10);
      g.font = '400 18px Georgia,serif'; g.fillText('Score ' + s.score + '  -  press R to play again', s.w / 2 - 150, s.h / 2 + 24);
    }
  }
}

/* ---------- scene runner: one animation loop for every canvas on the page ---------- */
const G_SCENES = [];
function visibleNow(el) {
  if (!el.isConnected) return false;
  const slide = el.closest('.slide');
  if (slide) return slide.classList.contains('active');
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < (window.innerHeight || 800) && r.width > 0;
}
/* step() runs 60 times a second, draw() once per screen refresh; returns { play, pause, playing, btn, redraw } */
function gRun(el, step, draw, opt = {}) {
  const sc = { el, step, draw, playing: !G_REDUCED && opt.autoplay !== false, acc: 0, last: 0 };
  const btn = h('button', { type: 'button', class: 'btn sm g-pp', onclick: () => (sc.playing ? api.pause() : api.play()) });
  const api = {
    btn,
    play() { sc.playing = true; sc.last = 0; paint(); },
    pause() { sc.playing = false; paint(); },
    playing: () => sc.playing,
    redraw() { draw(); }
  };
  function paint() { btn.textContent = sc.playing ? '❚❚ Pause' : '▶ Play'; btn.setAttribute('aria-pressed', String(sc.playing)); }
  paint();
  if (opt.warm) for (let i = 0; i < opt.warm; i++) step();
  draw();
  G_SCENES.push(sc);
  if (G_SCENES.length === 1) requestAnimationFrame(gTick);
  return api;
}
function gTick(now) {
  G_SCENES.forEach((sc) => {
    if (!sc.playing || !visibleNow(sc.el)) { sc.last = 0; return; }
    if (!sc.last) sc.last = now;
    sc.acc = Math.min(sc.acc + (now - sc.last) / 1000, 0.25);
    sc.last = now;
    let n = 0;
    while (sc.acc >= 1 / 60) { sc.step(); sc.acc -= 1 / 60; n++; }
    if (n) sc.draw();
  });
  requestAnimationFrame(gTick);
}
/* a framed scene: canvas, a caption under it and a control row (the Play/Pause button is always first) */
function gFrame(caption, c, ctrl, extra) {
  const row = h('div', { class: 'row tight g-ctrl' }, ctrl);
  return h('div', { class: 'g-scene', style: { '--ar': String(c.w / c.h) } }, row, c.cvs, caption ? h('p', { class: 'g-cap' }, caption) : null, extra || null);
}
/* keyboard for a focusable canvas: keys stay inside the game instead of changing slides */
function gKeys(target, keys) {
  target.setAttribute('tabindex', '0');
  const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', ' ': 'fire', Spacebar: 'fire', r: 'restart', R: 'restart', a: 'left', d: 'right', w: 'up', s: 'down' };
  const on = (e, v) => { const k = map[e.key]; if (!k) return; e.preventDefault(); e.stopPropagation(); keys[k] = v; };
  target.addEventListener('keydown', (e) => on(e, true));
  target.addEventListener('keyup', (e) => on(e, false));
  target.addEventListener('blur', () => Object.keys(keys).forEach((k) => { keys[k] = false; }));
}

/* ---------- code views that stay put ----------
   Wraps codeView (demos-basics.js): set() updates only the lines whose text changed, so the block never
   flashes or loses its scroll position, and mark() scrolls the code box (never the page) to keep the
   highlighted line in view. */
(function () {
  if (typeof codeView !== 'function') return;
  const base = codeView;
  function keepInView(pre, line) {
    if (!line || pre.scrollHeight <= pre.clientHeight + 2) return;
    const top = line.getBoundingClientRect().top - pre.getBoundingClientRect().top + pre.scrollTop, bottom = top + line.offsetHeight, pad = 24;
    if (top - pad < pre.scrollTop) pre.scrollTop = Math.max(0, top - pad);
    else if (bottom + pad > pre.scrollTop + pre.clientHeight) pre.scrollTop = bottom + pad - pre.clientHeight;
  }
  window.codeView = codeView = function (src, opts = {}) {
    const v = base(src, opts), pre = v.el, lines = () => Array.from(pre.querySelectorAll('.cl'));
    const mark0 = v.mark;
    v.mark = (nums, cls = 'cur') => {
      mark0(nums, cls);
      const first = [].concat(nums || []).filter((n) => n > 0).sort((a, b) => a - b)[0];
      if (first) requestAnimationFrame(() => keepInView(pre, lines()[first - 1]));
    };
    v.set = (src2) => {
      const fresh = Java.render(src2, null, opts), now = lines(), next = Array.from(fresh.querySelectorAll('.cl'));
      if (now.length === next.length) {
        next.forEach((nl, i) => { if (now[i].innerHTML !== nl.innerHTML) now[i].innerHTML = nl.innerHTML; });
      } else {
        const st = pre.scrollTop;
        pre.replaceChildren(...Array.from(fresh.childNodes));
        pre.scrollTop = st;
      }
    };
    return v;
  };
})();
