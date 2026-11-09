/* ===================== game-scenes-c.js : the course figures, redrawn as Code Commando =====================
   Flowcharts and diagrams that used to show generic examples (Hello.java, grades, bank accounts) now show
   the game: the health bar, the game's exceptions, its threads, its supplies and its window. */

const G_INK = '#E7EEF8', G_DIM = '#9FB3CC', G_ACC = rgb(255, 214, 90), G_LINE = 'rgba(160,190,220,.6)';
function gBox(g, x, y, w, hh, title, sub, o = {}) {
  g.fillStyle = o.fill || 'rgba(255,255,255,.07)'; rr(g, x, y, w, hh, o.r == null ? 10 : o.r);
  g.strokeStyle = o.stroke || 'rgba(255,255,255,.22)'; g.lineWidth = o.lw || 2;
  g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, hh, o.r == null ? 10 : o.r); else g.rect(x, y, w, hh); g.stroke();
  g.fillStyle = o.ink || G_INK; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = o.font || '700 15px Georgia,serif'; g.fillText(title, x + w / 2, y + hh / 2 - (sub ? 9 : 0));
  if (sub) { g.font = '500 13px "IBM Plex Mono",monospace'; g.fillStyle = o.subInk || G_DIM; g.fillText(sub, x + w / 2, y + hh / 2 + 11); }
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
}
function gDiamond(g, cx, cy, w, hh, text, o = {}) {
  g.beginPath(); g.moveTo(cx, cy - hh / 2); g.lineTo(cx + w / 2, cy); g.lineTo(cx, cy + hh / 2); g.lineTo(cx - w / 2, cy); g.closePath();
  g.fillStyle = o.fill || 'rgba(255,255,255,.07)'; g.fill(); g.strokeStyle = o.stroke || 'rgba(255,255,255,.3)'; g.lineWidth = o.lw || 2; g.stroke();
  g.fillStyle = G_INK; g.font = '600 14px "IBM Plex Mono",monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, cx, cy); g.textAlign = 'left'; g.textBaseline = 'alphabetic';
}
const gLabel = (g, x, y, t, col, align) => { g.fillStyle = col || G_DIM; g.font = '600 13px Georgia,serif'; g.textAlign = align || 'center'; g.fillText(t, x, y); g.textAlign = 'left'; };
const gBg = (g, w, hh) => { g.fillStyle = rgb(16, 26, 44); g.fillRect(0, 0, w, hh); };
const gDot = (g, pts, k) => {                 // a dot moving along a polyline, k in 0..1
  const seg = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  let at = k * tot;
  for (let i = 0; i < seg.length; i++) {
    if (at <= seg[i]) { const f = at / seg[i]; const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f; g.fillStyle = G_ACC; oval(g, x - 6, y - 6, 12, 12); return; }
    at -= seg[i];
  }
};

/* Chapter 1: from GameBasics.java to the game running on every system */
DEMOS['g-jvm'] = (root) => {
  const W = 760, H = 300, c = gCanvas(W, H, 'GameBasics.java is compiled by javac into GameBasics.class, which the JVM runs on Windows, macOS and Linux');
  let t = 0;
  const OS = [['JVM on Windows', 50], ['JVM on macOS', 150], ['JVM on Linux', 250]];
  function draw() {
    const g = c.g; gBg(g, W, H);
    gBox(g, 20, 120, 170, 60, 'GameBasics.java', gT('source code'), { stroke: rgb(255, 170, 90) });
    gBox(g, 290, 120, 170, 60, 'GameBasics.class', gT('bytecode'), { stroke: rgb(120, 200, 255) });
    gArrow(g, 190, 150, 286, 150, rgb(255, 170, 90)); gLabel(g, 238, 140, 'javac', rgb(255, 190, 120));
    OS.forEach(([name, y], i) => {
      gArrow(g, 460, 150, 556, y + 8, G_LINE);
      g.save(); g.beginPath(); g.rect(560, y - 26, 180, 70); g.clip();
      SPR.bg(g, 740, y + 44, y + 30, t + i * 40); g.restore();
      g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; g.strokeRect(560, y - 26, 180, 70);
      g.save(); g.translate(590, y + 30); g.scale(0.55, 0.55); SPR.commando(g, 0, 0, (t + i * 20) % 40 < 6); g.restore();
      g.save(); g.translate(700, y); g.scale(0.55, 0.55); SPR.drone(g, 0, 0, t); g.restore();
      gTag(g, 650, y - 16, name, { align: 'center', font: '700 12px Georgia,serif', size: 12, pad: 4 });
      const k = ((t + i * 25) % 150) / 60;
      if (k <= 1) gDot(g, [[190, 150], [290, 150], [460, 150], [556, y + 8]], k);
    });
    gLabel(g, 505, 112, gT('java GameBasics'), G_DIM);
    gLabel(g, 240, 250, gT('one .class file runs everywhere: “write once, run anywhere”'), G_ACC);
  }
  const run = gRun(c.cvs, () => { t++; }, draw);
  root.append(gFrame(null, c, [run.btn]));
};

/* Chapter 1: the if-else ladder that picks the colour of the health bar */
DEMOS['g-ifflow'] = (root) => {
  const W = 760, H = 410, c = gCanvas(W, H, 'Flowchart of the health status: health >= 70 gives green, >= 30 yellow, > 0 red, otherwise game over');
  let hp = 88, t = 0, shown = 0;
  const D = [[70, '>=', 'health >= 70 ?', gT('Healthy: green bar'), rgb(80, 200, 110)], [30, '>=', 'health >= 30 ?', gT('Hurt: yellow bar'), rgb(240, 200, 60)], [0, '>', 'health > 0 ?', gT('Critical: red bar'), rgb(230, 70, 60)]];
  const X = 190, YS = [95, 195, 295], BX = 360;
  const branch = () => (hp >= 70 ? 0 : hp >= 30 ? 1 : hp > 0 ? 2 : 3);
  const out = h('p', { class: 'g-status' });
  const range = h('input', { type: 'range', min: 0, max: 100, value: hp, 'aria-label': 'health', oninput: () => set(+range.value) });
  function set(v) { hp = Math.max(0, Math.min(100, v)); range.value = hp; shown = 0; const b = branch(); out.textContent = 'health = ' + hp + '  →  ' + (b < 3 ? D[b][3] : gT('Game over')); }
  function path() {
    const b = branch(), p = [[X, 30], [X, YS[0] - 32]];
    for (let i = 0; i < 3; i++) { p.push([X, YS[i]]); if (b === i) { p.push([BX, YS[i]]); return p; } p.push([X, YS[i] + 32]); }
    p.push([X, 372]); return p;
  }
  function draw() {
    const g = c.g; gBg(g, W, H); const b = branch();
    gBox(g, X - 60, 8, 120, 30, gT('start'), null, { r: 15, font: '700 14px Georgia,serif' });
    gArrow(g, X, 38, X, YS[0] - 33, G_LINE);
    D.forEach((d, i) => {
      const on = b >= i;
      gDiamond(g, X, YS[i], 200, 64, d[2], { stroke: on ? G_ACC : 'rgba(255,255,255,.3)', lw: on ? 3 : 2 });
      gArrow(g, X + 100, YS[i], BX - 4, YS[i], b === i ? G_ACC : G_LINE, b === i ? 3 : 2); gLabel(g, X + 130, YS[i] - 8, gT('yes'), G_DIM);
      gBox(g, BX, YS[i] - 22, 170, 44, d[3], null, { stroke: d[4], lw: b === i ? 4 : 2, fill: b === i ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.05)', font: '700 14px Georgia,serif' });
      gArrow(g, X, YS[i] + 32, X, i < 2 ? YS[i + 1] - 33 : 352, b > i ? G_ACC : G_LINE, b > i ? 3 : 2); gLabel(g, X - 22, YS[i] + 52, gT('no'), G_DIM, 'right');
    });
    gBox(g, X - 70, 352, 140, 40, gT('Game over'), null, { stroke: rgb(150, 150, 160), lw: b === 3 ? 4 : 2, fill: b === 3 ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.05)', font: '700 14px Georgia,serif' });
    shown = Math.min(1, shown + 0.025); gDot(g, path(), shown);
    /* the player and the health bar the branch paints */
    const col = b < 3 ? D[b][4] : rgb(90, 98, 112);
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(560, 150, 170, 18); g.fillStyle = col; g.fillRect(560, 150, hp * 1.7, 18);
    g.fillStyle = '#fff'; g.font = '700 14px "IBM Plex Mono",monospace'; g.fillText('HP ' + hp, 566, 164);
    g.fillStyle = rgb(59, 47, 37); g.fillRect(560, 300, 170, 8);
    if (hp > 0) SPR.commando(g, 645, 300, false); else { g.save(); g.translate(645, 300); g.rotate(-Math.PI / 2); SPR.commando(g, 0, 0, false, { alpha: 0.6 }); g.restore(); }
  }
  const run = gRun(c.cvs, () => { t++; }, draw);
  set(88);
  root.append(gFrame(null, c, [run.btn, h('span', { class: 'small' }, 'health'), range, gBtn('Take a hit (-12)', () => set(hp - 12)), gBtn('Heal (+30)', () => set(hp + 30))], out));
};

/* Chapter 6: the exception hierarchy, with the game's own exceptions */
DEMOS['g-extree'] = (root) => {
  const W = 760, H = 380, c = gCanvas(W, H, 'Exception hierarchy: Throwable, Error and Exception; RuntimeException is unchecked; GameException and its subclasses are checked');
  const N = {
    Throwable: [450, 40, 'all'], Error: [140, 120, 'error'], Exception: [500, 120, 'checked'],
    OutOfMemoryError: [140, 205, 'error'], RuntimeException: [330, 205, 'unchecked'], GameException: [640, 205, 'checked'],
    ArrayIndexOutOfBoundsException: [150, 295, 'unchecked'], IllegalArgumentException: [390, 295, 'unchecked'], NumberFormatException: [390, 355, 'unchecked'],
    OutOfAmmoException: [600, 295, 'checked'], InvalidLevelException: [600, 355, 'checked']
  };
  const P = { Error: 'Throwable', Exception: 'Throwable', OutOfMemoryError: 'Error', RuntimeException: 'Exception', GameException: 'Exception', ArrayIndexOutOfBoundsException: 'RuntimeException',
    IllegalArgumentException: 'RuntimeException', NumberFormatException: 'IllegalArgumentException', OutOfAmmoException: 'GameException', InvalidLevelException: 'GameException' };
  const COL = { all: rgb(160, 170, 190), error: rgb(150, 150, 160), checked: rgb(255, 170, 90), unchecked: rgb(120, 200, 255) };
  const GAME = ['GameException', 'OutOfAmmoException', 'InvalidLevelException'];
  function draw() {
    const g = c.g; gBg(g, W, H);
    Object.keys(P).forEach((k) => {
      const a = N[k], b = N[P[k]];
      if (P[k] !== 'GameException') { gArrow(g, a[0], a[1] - 17, b[0], b[1] + 18, G_LINE, 2); return; }
      const rail = 728, right = a[0] + 104;                 // a rail on the right, so no arrow crosses a box
      g.strokeStyle = G_LINE; g.lineWidth = 2; g.beginPath(); g.moveTo(right, a[1]); g.lineTo(rail, a[1]); g.lineTo(rail, b[1]); g.stroke();
      gArrow(g, rail, b[1], b[0] + 78, b[1], G_LINE, 2);
    });
    Object.keys(N).forEach((k) => {
      const [x, y, kind] = N[k]; g.font = '600 13px "IBM Plex Mono",monospace'; const w = g.measureText(k).width + 22;
      gBox(g, x - w / 2, y - 17, w, 34, k, null, { stroke: COL[kind], lw: GAME.includes(k) ? 3.5 : 2, fill: GAME.includes(k) ? 'rgba(255,170,90,.16)' : 'rgba(255,255,255,.06)', font: '600 13px "IBM Plex Mono",monospace' });
    });
    const lg = { font: '600 12px "IBM Plex Mono",monospace', size: 12, pad: 5 };
    gTag(g, 12, 18, gT('orange = checked: catch it or declare it'), Object.assign({ fg: '#FFC48A' }, lg));
    gTag(g, 12, 44, gT('blue = unchecked: usually a bug'), Object.assign({ fg: '#9FD4FF' }, lg));
    gTag(g, 12, 70, gT('filled = the game’s own exceptions'), Object.assign({ fg: '#FFE08A' }, lg));
  }
  const run = gRun(c.cvs, () => {}, draw, { autoplay: false });
  root.append(gFrame(null, c, []));
  void run;
};

/* Chapter 7: one process, three threads, one shared heap of game objects */
DEMOS['g-threadmem'] = (root) => {
  const W = 760, H = 360, c = gCanvas(W, H, 'One JVM process: each thread has its own stack, and all of them share the heap with the game objects');
  let t = 0;
  const TH = [['main', ['main()', 'spawner.join()']], ['Spawner', ['run()', 'Thread.sleep(300)']], ['AmmoRegen', ['run()', 'ammo += 5']]];
  const OBJ = [['spawner : EnemySpawner', 90], ['regen : AmmoRegen', 150], ['ammo = 25', 210], ['Drone-1, Drone-2, Drone-3', 270]];
  const LINKS = [[0, 0], [0, 1], [1, 0], [1, 3], [2, 1], [2, 2]];
  function draw() {
    const g = c.g; gBg(g, W, H);
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; g.setLineDash([6, 5]); g.strokeRect(10, 10, W - 20, H - 20); g.setLineDash([]);
    gLabel(g, 24, 32, gT('one process: the running Code Commando program (one JVM)'), G_DIM, 'left');
    const run = Math.floor(t / 50) % 3;
    TH.forEach(([name, frames], i) => {
      const x = 30 + i * 150, on = i === run;
      gBox(g, x, 50, 135, 40, name, gT('thread'), { stroke: on ? G_ACC : 'rgba(255,255,255,.25)', lw: on ? 3 : 2 });
      g.fillStyle = 'rgba(255,255,255,.04)'; rr(g, x, 100, 135, 210, 8);
      gLabel(g, x + 67, 120, gT('its own stack'), G_DIM);
      frames.forEach((f, j) => gBox(g, x + 10, 280 - j * 46, 115, 38, f, null, { font: '600 12px "IBM Plex Mono",monospace', fill: on && j === frames.length - 1 ? 'rgba(255,214,90,.18)' : 'rgba(255,255,255,.07)' }));
    });
    g.fillStyle = 'rgba(120,200,255,.07)'; rr(g, 490, 50, 250, 290, 10);
    gLabel(g, 615, 74, gT('the heap: shared by every thread'), '#9FD4FF');
    OBJ.forEach(([n, y]) => gBox(g, 505, y, 220, 40, n, null, { font: '600 13px "IBM Plex Mono",monospace' }));
    LINKS.filter(([ti]) => ti === run).forEach(([ti, oi]) => gArrow(g, 30 + ti * 150 + 125, 280 - 46 * (TH[ti][1].length - 1) + 19, 503, OBJ[oi][1] + 20, G_ACC, 2.5));
    gLabel(g, 240, 334, gT('arrows: what the running thread uses right now'), G_DIM);
  }
  const run = gRun(c.cvs, () => { t++; }, draw);
  root.append(gFrame(null, c, [run.btn]));
};

/* Chapter 7: the life of a game thread, state by state */
DEMOS['g-states'] = (root) => {
  const W = 760, H = 360, c = gCanvas(W, H, 'Thread states of the game threads: NEW, RUNNABLE, TIMED_WAITING, WAITING, BLOCKED, TERMINATED');
  const S = { NEW: [90, 170], RUNNABLE: [300, 170], TIMED_WAITING: [590, 55], WAITING: [590, 170], BLOCKED: [590, 285], TERMINATED: [300, 315] };
  const E = [['TIMED_WAITING', 'sleep(300)', 'time is up'], ['WAITING', 'join()', 'the other thread ends'], ['BLOCKED', 'waits for a lock', 'gets the lock']];
  const LIFE = {
    Spawner: [['NEW', 'new EnemySpawner(3)'], ['RUNNABLE', 'spawner.start(): spawns Drone-1'], ['TIMED_WAITING', 'Thread.sleep(300)'], ['RUNNABLE', 'wakes up: spawns Drone-2'], ['TIMED_WAITING', 'Thread.sleep(300)'], ['RUNNABLE', 'spawns Drone-3'], ['TERMINATED', 'run() returns: wave complete']],
    main: [['RUNNABLE', 'main() starts the three threads'], ['TIMED_WAITING', 'Thread.sleep(100)'], ['RUNNABLE', 'prints the spawner’s state'], ['WAITING', 'spawner.join(): waits for it to end'], ['RUNNABLE', 'all threads finished'], ['TERMINATED', 'main() ends']],
    Medic: [['NEW', 'the Medic thread is created'], ['RUNNABLE', 'start(): takes the med kit'], ['TIMED_WAITING', 'pause(100)'], ['RUNNABLE', 'wants the ammo crate…'], ['BLOCKED', '…but the Gunner holds it: BLOCKED']]
  };
  let who = 'Spawner', t = 0;
  const note = h('p', { class: 'g-status' });
  function draw() {
    const g = c.g; gBg(g, W, H);
    const L = LIFE[who], step = Math.floor(t / 90) % (L.length + 1), cur = L[Math.min(step, L.length - 1)][0];
    const R = S.RUNNABLE;
    gArrow(g, S.NEW[0] + 70, 170, R[0] - 72, 170, G_LINE, 2); gLabel(g, (S.NEW[0] + R[0]) / 2, 160, 'start()', G_DIM);
    gArrow(g, R[0], R[1] + 24, S.TERMINATED[0], S.TERMINATED[1] - 26, G_LINE, 2); gLabel(g, R[0] + 12, 248, gT('run() ends'), G_DIM, 'left');
    E.forEach(([b, go, back]) => {
      const B = S[b], y1 = B[1] - 7, y0 = R[1] + (B[1] - R[1]) * 0.25;
      gArrow(g, R[0] + 70, y0 - 7, B[0] - 72, y1, G_LINE, 2);
      gArrow(g, B[0] - 72, y1 + 14, R[0] + 70, y0 + 7, 'rgba(160,190,220,.38)', 1.5);
      const mx = (R[0] + 70 + B[0] - 72) / 2, my = (y0 + y1) / 2;
      gLabel(g, mx, my - 12, go, G_INK); gLabel(g, mx, my + 26, gT(back), G_DIM);
    });
    Object.keys(S).forEach((k) => { const [x, y] = S[k], on = k === cur; gBox(g, x - 70, y - 24, 140, 48, k, null, { stroke: on ? G_ACC : 'rgba(255,255,255,.25)', lw: on ? 4 : 2, fill: on ? 'rgba(255,214,90,.18)' : 'rgba(255,255,255,.06)', font: '700 14px Georgia,serif' }); });
    const [x, y] = S[cur]; gTag(g, x, y + 40, who, { align: 'center', bg: rgb(255, 214, 90), fg: '#1b1200' });
    const msg = L[Math.min(step, L.length - 1)][1];
    if (note.textContent !== msg) note.textContent = msg;
  }
  const pick = seg([{ v: 'Spawner', l: 'Spawner thread' }, { v: 'main', l: 'main thread' }, { v: 'Medic', l: 'Medic thread (Chapter 8)' }], who, (v) => { who = v; t = 0; });
  const run = gRun(c.cvs, () => { t++; }, draw);
  root.append(gFrame(null, c, [run.btn, pick.el], note));
};

/* Chapter 8: the resource allocation graph of the two soldiers */
DEMOS['g-rag'] = (root) => {
  const W = 760, H = 320, c = gCanvas(W, H, 'Resource allocation graph: soldiers are circles, supplies are squares; a cycle means deadlock');
  let mode = 'opposite';
  const note = h('p', { class: 'g-status' });
  const M = [150, 160], G = [610, 160], A = [380, 70], K = [380, 250];
  function draw() {
    const g = c.g; gBg(g, W, H);
    const circle = (p, name) => { g.fillStyle = 'rgba(120,200,255,.14)'; g.beginPath(); g.arc(p[0], p[1], 42, 0, Math.PI * 2); g.fill(); g.strokeStyle = rgb(120, 200, 255); g.lineWidth = 2.5; g.stroke(); gLabel(g, p[0], p[1] + 5, name, G_INK); };
    const square = (p, name) => gBox(g, p[0] - 70, p[1] - 26, 140, 52, name, null, { stroke: rgb(255, 170, 90) });
    const held = (r, p, col) => gArrow(g, r[0] + (p[0] < r[0] ? -70 : 70), r[1], p[0] + (p[0] < r[0] ? 42 : -42), p[1], col || G_INK, 3);
    const want = (p, r, col) => { g.save(); g.setLineDash([7, 6]); gArrow(g, p[0] + (p[0] < r[0] ? 42 : -42), p[1], r[0] + (p[0] < r[0] ? -70 : 70), r[1], col || G_DIM, 2.5); g.restore(); };
    circle(M, gT('Medic')); circle(G, gT('Gunner')); square(A, gT('ammo crate')); square(K, gT('med kit'));
    if (mode === 'opposite') {
      const red = rgb(255, 90, 90);
      held(K, M, red); want(M, A, red); held(A, G, red); want(G, K, red);
      gTag(g, W / 2, 160, gT('a cycle: DEADLOCK'), { align: 'center', bg: rgb(170, 30, 30), font: '800 16px Georgia,serif', size: 16 });
      note.textContent = gT('Medic holds the med kit and wants the crate; Gunner holds the crate and wants the kit. The arrows go round in a circle, so nobody can ever continue.');
    } else {
      held(A, G); held(K, G); want(M, A);
      gTag(g, W / 2, 160, gT('no cycle: Gunner finishes, then Medic'), { align: 'center', bg: rgb(30, 120, 70), font: '700 16px Georgia,serif', size: 16 });
      note.textContent = gT('Both lock the ammo crate first. Gunner holds both items, Medic only waits for the crate. There is no circle, so Gunner finishes and then Medic can go.');
    }
    gTag(g, 14, 20, gT('solid arrow: holds it · dashed arrow: waits for it'), { fg: '#BFD3EA' });
  }
  const m = seg([{ v: 'opposite', l: 'opposite lock order' }, { v: 'same', l: 'same lock order' }], mode, (v) => { mode = v; draw(); });
  const run = gRun(c.cvs, () => {}, draw, { autoplay: false });
  void run;
  root.append(gFrame(null, c, [m.el], note));
};

/* Chapter 9: BorderLayout, as used by the game window */
DEMOS['g-border'] = (root) => {
  const W = 760, H = 360, c = gCanvas(W, H, 'The game window in BorderLayout: the score label in NORTH, the GamePanel in CENTER, the buttons in SOUTH, WEST and EAST empty');
  let t = 0;
  function draw() {
    const g = c.g; gBg(g, W, H);
    g.fillStyle = '#DADDE2'; rr(g, 40, 14, 680, 30, 8); g.fillStyle = '#111'; g.font = '600 14px Georgia,serif'; g.fillText('Code Commando - Chapter 9', 110, 34);
    ['#EF6B5E', '#F4BF4F', '#61C454'].forEach((col, i) => { g.fillStyle = col; oval(g, 54 + i * 16, 23, 11, 11); });
    const reg = (x, y, w, hh, name, what, col) => { g.fillStyle = col; g.fillRect(x, y, w, hh); g.strokeStyle = 'rgba(255,255,255,.5)'; g.setLineDash([5, 4]); g.lineWidth = 1.5; g.strokeRect(x, y, w, hh); g.setLineDash([]); gTag(g, w > 300 ? x + w - 48 : x + w / 2, y + 14, name, { align: 'center', bg: rgb(224, 122, 31), font: '800 12px Georgia,serif', size: 12, pad: 4 }); if (what) gLabel(g, x + w / 2, y + hh / 2 + 10, what, G_INK); };
    reg(40, 44, 680, 44, 'NORTH', '', 'rgba(255,255,255,.08)');
    g.fillStyle = '#E7EEF8'; g.font = '700 15px Georgia,serif'; g.fillText('Score: 0    Drones left: 3', 60, 80);
    reg(40, 88, 60, 206, 'WEST', gT('empty'), 'rgba(255,255,255,.04)');
    reg(660, 88, 60, 206, 'EAST', gT('empty'), 'rgba(255,255,255,.04)');
    g.save(); g.beginPath(); g.rect(100, 88, 560, 206); g.clip(); g.translate(100, 88); g.scale(560 / GW, 206 / GH * 1.0); SPR.bg(g, GW, GH, GGROUND, t); SPR.drone(g, 560, 120, t); SPR.drone(g, 640, 200, t); SPR.commando(g, 80, GGROUND, false); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.setLineDash([5, 4]); g.strokeRect(100, 88, 560, 206); g.setLineDash([]);
    gTag(g, 380, 102, 'CENTER', { align: 'center', bg: rgb(224, 122, 31), font: '800 12px Georgia,serif', size: 12, pad: 4 });
    gTag(g, 380, 270, gT('GamePanel: gets all the space that is left'), { align: 'center' });
    reg(40, 294, 680, 52, 'SOUTH', '', 'rgba(255,255,255,.08)');
    [['Fire', 140], ['Reset', 210]].forEach(([b, x]) => { g.fillStyle = '#EEF0F3'; rr(g, x, 312, 60, 26, 5); g.fillStyle = '#111'; g.font = '600 14px Georgia,serif'; g.fillText(b, x + 12, 330); });
    gLabel(g, 290, 330, gT('a JPanel with FlowLayout: one row'), G_INK, 'left');
    gLabel(g, 380, 10 + 0, '', G_DIM);
  }
  const run = gRun(c.cvs, () => { t++; }, draw);
  root.append(gFrame(null, c, [run.btn]));
};

/* the home page: the opening battle, which visitors can take over */
DEMOS['g-hero'] = (root) => {
  const c = gCanvas(GW, GH, 'Code Commando: the commando plays by himself until you take over with the arrow keys or the buttons');
  const keys = { left: false, right: false, up: false, down: false, fire: false, restart: false };
  let s = newBattle({ seed: 11 }), lastInput = -1e9, overT = 0, armed = false;
  const wrap = h('div', { class: 'g-scene g-heroscene', style: { '--ar': String(GW / GH) } });
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const isFs = () => fsEl() === wrap || wrap.classList.contains('g-fake-fs');
  const manual = () => performance.now() - lastInput < 8000;
  const run = gRun(c.cvs, () => {
    if (s.over) { if (++overT > 150 || keys.restart) { s = newBattle({ seed: s.t + 7 }); overT = 0; keys.restart = false; } return; }
    battleStep(s, manual() ? { dx: (keys.right ? 1 : 0) - (keys.left ? 1 : 0), dy: (keys.down ? 1 : 0) - (keys.up ? 1 : 0), fire: keys.fire } : null);
    if (window.G_PROMO) s.player.hp = Math.max(s.player.hp, 60);   // promo recordings only: never GAME OVER
    if (s.t > 5400 && !manual()) s = newBattle({ seed: s.t });
  }, () => {
    battleDraw(c.g, s);
  }, { warm: 160 });

  /* every control (button, keycap, keyboard key) goes through press(): the keycap lights up while held */
  const caps = {};
  function press(k, v) {
    if (keys[k] === v) return;
    keys[k] = v; lastInput = performance.now();
    (caps[k] || []).forEach((el) => el.classList.toggle('down', v));
  }
  const hold = (el, k) => {
    const on = (v) => (e) => { e.preventDefault(); press(k, v); };
    el.addEventListener('pointerdown', on(true)); el.addEventListener('pointerup', on(false)); el.addEventListener('pointercancel', on(false));
    el.addEventListener('pointerleave', (e) => { if (keys[k]) on(false)(e); });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') on(true)(e); });
    el.addEventListener('keyup', (e) => { if (e.key === 'Enter') on(false)(e); });
    (caps[k] = caps[k] || []).push(el);
    return el;
  };
  const cap = (label, sub, k, cls) => hold(h('button', { type: 'button', class: 'g-key' + (cls ? ' ' + cls : ''), 'aria-label': k }, h('b', null, label), sub ? h('small', null, sub) : null), k);

  /* full screen: the real Fullscreen API, or a fixed overlay where it is missing (iPhone Safari) */
  function enterFs() {
    const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
    const fake = () => { wrap.classList.add('g-fake-fs'); document.documentElement.classList.add('g-noscroll'); fit(); };
    if (req) { try { const p = req.call(wrap); if (p && p.catch) p.catch(fake); } catch (e) { fake(); } } else fake();
    armed = true;
  }
  function exitFs() {
    if (typeof toggleMenu === 'function') toggleMenu(false);
    if (wrap.classList.contains('g-fake-fs')) { wrap.classList.remove('g-fake-fs'); document.documentElement.classList.remove('g-noscroll'); fit(); return; }
    const ex = document.exitFullscreen || document.webkitExitFullscreen;
    if (fsEl() && ex) ex.call(document);
  }
  /* keep the canvas sharp at any size: match its pixels to the space it fills */
  function fit() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(c.cvs.getBoundingClientRect().width || GW);
    const pw = Math.round(Math.max(GW, w) * dpr), ph = Math.round(pw * GH / GW);
    if (c.cvs.width !== pw) { c.cvs.width = pw; c.cvs.height = ph; c.g.setTransform(pw / GW, 0, 0, ph / GH, 0, 0); battleDraw(c.g, s); }
  }
  const fsBtn = h('button', { type: 'button', class: 'btn pri g-enter', onclick: () => (isFs() ? exitFs() : enterFs()) }, '▶ ' + gT('Enter'));
  ['fullscreenchange', 'webkitfullscreenchange'].forEach((ev) => document.addEventListener(ev, () => { requestAnimationFrame(fit); if (!fsEl()) Object.keys(keys).forEach((k) => press(k, false)); }));
  window.addEventListener('resize', () => { if (isFs()) requestAnimationFrame(fit); });

  /* the keyboard: arrows / WASD move, Space fires, R restarts, Esc leaves full screen.
     It works in full screen, and on the page once you have clicked or tapped anywhere in the game. */
  const MAP = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', ' ': 'fire', Spacebar: 'fire', a: 'left', d: 'right', w: 'up', s: 'down', A: 'left', D: 'right', W: 'up', S: 'down', r: 'restart', R: 'restart' };
  const inView = () => { const r = wrap.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const active = () => isFs() || (armed && inView());
  document.addEventListener('pointerdown', (e) => { armed = wrap.contains(e.target); }, true);
  const onKey = (v) => (e) => {
    if (e.key === 'Escape' && v && wrap.classList.contains('g-fake-fs')) { exitFs(); return; }
    const k = MAP[e.key];
    if (!k || !active() || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    e.preventDefault(); e.stopPropagation();
    press(k, v);
  };
  document.addEventListener('keydown', onKey(true), true);
  document.addEventListener('keyup', onKey(false), true);
  window.addEventListener('blur', () => Object.keys(keys).forEach((k) => press(k, false)));
  c.cvs.setAttribute('tabindex', '0');
  c.cvs.addEventListener('pointerdown', () => { armed = true; c.cvs.focus({ preventScroll: true }); });

  /* full screen only: a Chapters menu (top right of the game) that opens any chapter's slides */
  let chapters = [];
  try { chapters = JSON.parse(root.getAttribute('data-chapters') || '[]'); } catch (e) { /* no menu */ }
  const menu = h('div', { class: 'g-chmenu', hidden: true }, ...chapters.map((ch) =>
    h('a', { href: ch.url, class: 'g-chitem', onclick: () => exitFs() }, h('span', { class: 'g-chn' }, String(ch.n)), h('span', null, ch.title))));
  const chBtn = h('button', { type: 'button', class: 'g-chbtn', 'aria-haspopup': 'true', 'aria-expanded': 'false' }, gT('Chapters') + ' ▾');
  const toggleMenu = (open) => { menu.hidden = !open; chBtn.setAttribute('aria-expanded', String(open)); };
  chBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(menu.hidden); });
  document.addEventListener('pointerdown', (e) => { if (!menu.hidden && !menu.contains(e.target) && e.target !== chBtn) toggleMenu(false); });
  const chapterBox = h('div', { class: 'g-chapters' }, chBtn, menu);
  /* the game picture with Enter on top of it; Enter hides once the game is full screen */
  const stage = h('div', { class: 'g-herostage' }, c.cvs, fsBtn, chaptersOk() ? chapterBox : null);
  function chaptersOk() { return chapters.length > 0; }
  /* shown only in full screen: a keyboard-style keypad that also lights up with the real keys */
  /* the game keys sit on the left; on the right, Enter course opens Chapter 1 */
  const firstChapter = (chapters[0] && chapters[0].url) || 'labs/01-java-basics.html';
  const keypad = h('div', { class: 'g-keypad' },
    h('div', { class: 'g-keyleft' },
      h('div', { class: 'g-arrows' }, h('span'), cap('↑', '', 'up'), h('span'), cap('←', '', 'left'), cap('↓', '', 'down'), cap('→', '', 'right')),
      cap('Space', gT('Fire'), 'fire', 'g-space'),
      h('div', { class: 'g-keyside' }, cap('R', gT('Restart'), 'restart', 'g-small'),
        h('button', { type: 'button', class: 'g-key g-small', onclick: exitFs }, h('b', null, 'Esc'), h('small', null, gT('Exit'))))),
    h('a', { class: 'btn pri g-entercourse', href: firstChapter }, gT('Enter course') + ' ▶'));
  ['fullscreenchange', 'webkitfullscreenchange'].forEach((ev) => document.addEventListener(ev, () => toggleMenu(false)));
  wrap.append(stage, keypad,
    h('p', { class: 'g-cap' }, gT('Code Commando: the game you build in this course.')));
  root.append(wrap);
};
