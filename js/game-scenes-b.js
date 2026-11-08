/* ===================== game-scenes-b.js : game scenes for Chapters 6-10 ===================== */

/* ---------------- Chapter 6 ---------------- */
DEMOS['g-exception'] = (root) => {
  const W = 760, H = 260, c = gCanvas(W, H, 'Firing until the pistol is empty: the exception travels up the call stack');
  const FR = [['main()', 'try { ranger.shoot(drone); } catch (OutOfAmmoException e) { … } finally { … }'], ['Player.shoot(target)', 'gun.fire();'], ['Gun.fire()', 'if (ammo == 0) throw new OutOfAmmoException(name);']];
  const frames = FR.map(([n, code]) => h('div', { class: 'g-frame' }, h('b', null, n), h('code', null, code)));
  const stack = h('div', { class: 'g-stack' }, h('h5', null, 'Call stack (top = running now)'), ...frames.slice().reverse());
  const out = gOut();
  let ammo = 2, t = 0, mode = 1, anim = null, crashed = false, shots = [], log = [];
  const fl = gFloats();
  const say = (s) => { log.push(s); out.set(log.slice(-8).join('\n')); };
  function lit(i, cls) { frames.forEach((f, k) => { f.classList.toggle('on', k === i && cls === 'on'); f.classList.toggle('ex', k === i && cls === 'ex'); }); }
  function fire() {
    if (crashed || anim) return;
    if (ammo > 0) { ammo--; shots.push({ x: 150 }); say('  BANG! Pistol has ' + ammo + ' left'); if (mode) say('  finally: shot logged'); lit(2, 'on'); setTimeout(() => lit(-1), 400); return; }
    anim = { k: 0 };            // the exception climbs: Gun.fire -> Player.shoot -> main
  }
  function step() {
    t++; fl.step();
    shots.forEach((b) => { b.x += 10; if (b.x > 580) { b.done = true; fl.push({ x: 600, y: 120, text: '-25' }); } });
    shots = shots.filter((b) => !b.done);
    if (anim) {
      anim.k++;
      const level = 2 - Math.floor(anim.k / 35);
      if (level >= 0) lit(level, 'ex');
      if (anim.k === 1) fl.push({ x: 150, y: 150, text: 'click!', col: '#FF9A50' });
      if (level < 0 || (mode && level === 0 && anim.k >= 80)) {
        if (mode) { say('  Caught: Pistol is out of ammo -> reloading'); say('  reloaded 6 -> Pistol has 6'); say('  finally: shot logged'); ammo = 6; lit(0, 'on'); setTimeout(() => lit(-1), 700); }
        else { crashed = true; say('Exception in thread "main" OutOfAmmoException: Pistol is out of ammo'); say('    at Gun.fire(Gun.java:12)'); say('    at Player.shoot(Player.java:20)'); say('    at ExceptionDemo.main(ExceptionDemo.java:31)'); }
        anim = null;
      }
    }
  }
  function draw() {
    const g = c.g; SPR.bg(g, W, H, 220, t);
    SPR.commando(g, 110, 220, shots.some((b) => b.x < 190), { noGun: true }); SPR.weapon(g, 112, 183, 'pistol');
    shots.forEach((b) => SPR.bullet(g, b.x, 186, false));
    SPR.drone(g, 600, 150, t);
    gTag(g, 18, 24, 'Pistol · ammo ' + ammo, { font: '700 16px Georgia,serif', size: 16 });
    if (anim) gTag(g, 380, 60, 'OutOfAmmoException thrown!', { align: 'center', bg: rgb(160, 30, 30), font: '700 16px Georgia,serif', size: 16 });
    if (crashed) { g.fillStyle = 'rgba(120,10,10,.78)'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.font = '800 34px Georgia,serif'; g.fillText(gT('GAME CRASHED'), 250, 120); g.font = '500 16px Georgia,serif'; g.fillText(gT('Nobody caught the exception, so the program stopped. Press Reset.'), 150, 156); }
    fl.draw(g);
  }
  const m = seg([{ v: 1, l: 'with try / catch' }, { v: 0, l: 'without try / catch' }], 1, (v) => { mode = v; });
  const run = gRun(c.cvs, step, draw);
  root.append(h('div', { class: 'g-split' }, h('div', null, gFrame('Keep pressing Fire until the ammo runs out.', c,
    [run.btn, gBtn('Fire', fire, 'pri'), m.el, gBtn('Reset', () => { ammo = 2; crashed = false; anim = null; log = []; out.set(' '); lit(-1); fl.clear(); })])), gSide(stack, out.el)));
};

DEMOS['g-level'] = (root) => {
  const W = 760, H = 170, c = gCanvas(W, H, 'Loading a level from typed text');
  const inp = textInput('3', { style: { width: '120px' }, 'aria-label': 'Level to load' });
  const chain = h('div', { class: 'g-chain' }), out = gOut();
  let banner = 'LEVEL 3', bad = false, t = 0;
  function load(v) {
    if (v != null) inp.value = v;
    const text = inp.value, n = /^\s*[-+]?\d+\s*$/.test(text) ? parseInt(text, 10) : NaN;
    const step = (cls, a, b) => h('div', { class: 'g-link ' + cls }, h('b', null, a), h('span', null, b));
    clear(chain);
    if (Number.isNaN(n)) {
      chain.append(step('', 'LevelLoader.load("' + text + '")', 'calls Integer.parseInt'), step('ex', 'NumberFormatException', 'parseInt cannot read "' + text + '"'), step('ex', 'InvalidLevelException', 'load() catches it and throws its own, keeping it as the cause'), step('ok', 'catch in main', 'prints the message and the cause'));
      out.set('Cannot load: "' + text + '" is not a level number\n  cause: NumberFormatException'); banner = gT('NO SUCH LEVEL'); bad = true;
    } else if (n < 1 || n > 10) {
      chain.append(step('', 'LevelLoader.load("' + text + '")', 'parseInt gives ' + n), step('ex', 'InvalidLevelException', n + ' is outside 1-10, so load() throws'), step('ok', 'catch in main', 'prints the message'));
      out.set('Cannot load: level ' + n + ' does not exist (1-10)'); banner = gT('NO SUCH LEVEL'); bad = true;
    } else {
      chain.append(step('', 'LevelLoader.load("' + text + '")', 'parseInt gives ' + n), step('ok', 'return ' + n, 'no exception: the catch block is skipped'));
      out.set('Loaded level ' + n); banner = gT('LEVEL') + ' ' + n; bad = false;
    }
    t = 0;
  }
  function draw() {
    const g = c.g; SPR.bg(g, W, H, 140, t);
    g.save(); g.globalAlpha = Math.min(1, t / 20);
    g.fillStyle = bad ? 'rgba(140,20,20,.8)' : 'rgba(8,14,26,.75)'; rr(g, W / 2 - 180, 40, 360, 64, 12);
    g.fillStyle = '#fff'; g.font = '800 34px Georgia,serif'; g.textAlign = 'center'; g.fillText(banner, W / 2, 86); g.restore();
    if (!bad) SPR.commando(g, 90, 140, false);
  }
  const run = gRun(c.cvs, () => { t++; }, draw);
  load();
  root.append(gFrame('Load a level; a bad one throws a custom exception with its cause.', c,
    [run.btn, inp, gBtn('Load', () => load(), 'pri'), ...['3', 'abc', '42', ' 7 '].map((v) => gBtn('"' + v + '"', () => load(v)))], h('div', { class: 'g-split' }, chain, out.el)));
};

/* ---------------- Chapter 7 ---------------- */
DEMOS['g-threads'] = (root) => {
  const W = 760, H = 420, c = gCanvas(W, H, 'Three game threads running at the same time, with a timeline of their states');
  const out = gOut();
  /* the same timings as ThreadDemo.java, in milliseconds */
  const EV = [];
  [0, 300, 600].forEach((ms, i) => EV.push({ ms, who: 'Spawner', text: '[Spawner] spawned Drone-' + (i + 1), drone: i }));
  EV.push({ ms: 900, who: 'Spawner', text: '[Spawner] wave complete', end: true });
  [0, 450, 900].forEach((ms, i) => EV.push({ ms, who: 'AmmoRegen', text: '[AmmoRegen] +5 ammo -> ' + (15 + i * 5), ammo: 15 + i * 5 }));
  EV.push({ ms: 1350, who: 'AmmoRegen', text: '[AmmoRegen] clip full', end: true });
  [0, 400, 800].forEach((ms, i) => EV.push({ ms, who: 'Timer', text: '[Timer] ' + (3 - i) + '...', timer: 3 - i }));
  EV.push({ ms: 1200, who: 'Timer', text: '[Timer] GO!', timer: 0, end: true });
  EV.push({ ms: 100, who: 'main', text: '[main] spawner state while sleeping: TIMED_WAITING' });
  EV.push({ ms: 1352, who: 'main', text: '[main] all threads finished' });
  EV.sort((a, b) => a.ms - b.ms);
  const LANES = ['main', 'Spawner', 'AmmoRegen', 'Timer'], ENDS = { Spawner: 900, AmmoRegen: 1350, Timer: 1200 };
  const SPAN = 1500, START = 200;
  let ms = -START, speed = 1, done = 0;
  function stateOf(who, now) {
    if (now < 0) return 'NEW';
    if (who === 'main') return now < 100 ? 'TIMED_WAITING' : now < 1352 ? 'WAITING' : 'RUNNABLE';
    if (now >= ENDS[who]) return 'TERMINATED';
    return EV.some((e) => e.who === who && now >= e.ms && now < e.ms + 18) ? 'RUNNABLE' : 'TIMED_WAITING';
  }
  const STC = { NEW: rgb(140, 150, 170), RUNNABLE: rgb(110, 210, 140), TIMED_WAITING: rgb(100, 160, 235), WAITING: rgb(190, 140, 240), TERMINATED: rgb(90, 98, 112) };
  function step() {
    ms += 1000 / 60 * 0.45 * speed;
    while (done < EV.length && EV[done].ms <= ms) done++;
    if (ms > SPAN + 900) { ms = -START; done = 0; }
  }
  let shown = -1;
  function draw() {
    const g = c.g, now = ms;
    SPR.bg(g, W, 230, 200, now / 10);
    const happened = EV.slice(0, done);
    const drones = happened.filter((e) => e.drone != null).length;
    const ammo = happened.filter((e) => e.ammo).map((e) => e.ammo).pop() || 10;
    const tm = happened.filter((e) => e.timer != null).map((e) => e.timer).pop();
    SPR.commando(g, 90, 200, false);
    for (let i = 0; i < drones; i++) SPR.drone(g, 400 + i * 110, 90 + (i % 2) * 50, now / 16 + i * 9);
    gTag(g, 16, 22, 'Ammo ' + ammo, { font: '700 16px Georgia,serif', size: 16 });
    if (tm != null) gTag(g, W / 2, 34, tm === 0 ? 'GO!' : String(tm), { align: 'center', font: '800 26px Georgia,serif', size: 26 });
    g.fillStyle = rgb(16, 26, 44); g.fillRect(0, 230, W, H - 230);
    const L = 120, R = W - 150, x = (t) => L + (Math.max(0, Math.min(SPAN, t)) / SPAN) * (R - L);
    LANES.forEach((who, i) => {
      const y = 250 + i * 40;
      g.fillStyle = '#E7EEF8'; g.font = '600 14px "IBM Plex Mono",monospace'; g.fillText(who, 12, y + 18);
      for (let tt = 0; tt < Math.min(now, SPAN); tt += 6) { g.fillStyle = STC[stateOf(who, tt)]; g.fillRect(x(tt), y + 6, Math.max(1, x(tt + 6) - x(tt)), 18); }
      const st = stateOf(who, now);
      g.fillStyle = STC[st]; g.font = '700 12px Georgia,serif'; g.fillText(st, R + 10, y + 19);
    });
    if (now >= 0) { g.strokeStyle = rgb(255, 214, 90); g.lineWidth = 2; g.beginPath(); g.moveTo(x(now), 244); g.lineTo(x(now), 410); g.stroke(); }
    g.fillStyle = '#9FB3CC'; g.font = '500 12px Georgia,serif'; g.fillText(now < 0 ? gT('before start(): every thread is NEW') : 't = ' + Math.min(SPAN, Math.round(now)) + ' ms', L, 242);
    if (done !== shown) { shown = done; out.set(['spawner state before start(): NEW'].concat(happened.map((e) => e.text)).join('\n')); }
  }
  const sp = seg([{ v: 1, l: 'normal' }, { v: 0.3, l: 'slow' }], 1, (v) => { speed = v; });
  const run = gRun(c.cvs, step, draw);
  const legend = h('div', { class: 'row tight g-legend' }, ...Object.keys(STC).map((k) => h('span', null, h('i', { style: { background: STC[k] } }), k)));
  root.append(h('div', { class: 'g-split' }, gFrame('Three threads, each with its own loop; main waits with join().', c, [run.btn, sp.el, gBtn('Restart', () => { ms = -START; done = 0; })], legend), gSide(out.el)));
};

/* ---------------- Chapter 8 ---------------- */
DEMOS['g-race'] = (root) => {
  const W = 760, H = 300, c = gCanvas(W, H, 'Two squad members update one shared scoreboard');
  const PLANS = {
    unsafe: [['A', 'read', 'Alpha reads score: 10'], ['B', 'read', 'Bravo reads score: 10 (Alpha has not written yet)'], ['A', 'write', 'Alpha writes 10 + 1 = 11'], ['B', 'write', 'Bravo writes 10 + 1 = 11. Alpha’s point is lost!']],
    safe: [['A', 'lock', 'Alpha takes the scoreboard’s lock'], ['A', 'read', 'Alpha reads score: 10'], ['B', 'wait', 'Bravo wants the lock: BLOCKED, it must wait'], ['A', 'write', 'Alpha writes 11 and releases the lock'], ['B', 'lock', 'Bravo gets the lock'], ['B', 'read', 'Bravo reads score: 11'], ['B', 'write', 'Bravo writes 12 and releases the lock. Both points count.']]
  };
  let mode = 'unsafe', k = -1, t = 0;
  const cv = codeView('', { small: true, nums: false }), note = h('p', { class: 'g-status' });
  function sim(upto) {
    const st = { score: 10, A: null, B: null, lock: null, waitB: false };
    PLANS[mode].slice(0, upto + 1).forEach(([who, act]) => {
      if (act === 'lock') { st.lock = who; if (who === 'B') st.waitB = false; }
      if (act === 'wait') st.waitB = true;
      if (act === 'read') st[who] = st.score;
      if (act === 'write') { st.score = st[who] + 1; st[who] = null; if (mode === 'safe') st.lock = null; }
    });
    return st;
  }
  function draw() {
    const g = c.g; SPR.bg(g, W, H, 260, t);
    const st = sim(k);
    SPR.commando(g, 120, 260, false); SPR.commando(g, 640, 260, false, { flip: true, helmet: rgb(70, 80, 120) });
    gTag(g, 120, 280, gT('Alpha (thread)'), { align: 'center' }); gTag(g, 640, 280, gT('Bravo (thread)'), { align: 'center' });
    g.fillStyle = 'rgba(8,14,26,.85)'; rr(g, W / 2 - 110, 40, 220, 96, 12);
    g.strokeStyle = st.lock ? rgb(255, 214, 90) : 'rgba(255,255,255,.25)'; g.lineWidth = 3; g.strokeRect(W / 2 - 109, 41, 218, 94);
    g.fillStyle = '#9FB3CC'; g.font = '700 14px Georgia,serif'; g.textAlign = 'center'; g.fillText(gT('SHARED SCOREBOARD'), W / 2, 64);
    g.fillStyle = '#fff'; g.font = '800 40px "IBM Plex Mono",monospace'; g.fillText(String(st.score), W / 2, 114); g.textAlign = 'left';
    if (st.lock) gTag(g, W / 2, 150, '🔒 ' + (st.lock === 'A' ? gT('held by Alpha') : gT('held by Bravo')), { align: 'center', fg: '#FFE08A' });
    ['A', 'B'].forEach((w) => { if (st[w] != null) gTag(g, w === 'A' ? 200 : 560, 170, 'local = ' + st[w], { align: 'center', border: rgb(120, 200, 255) }); });
    if (st.waitB) gTag(g, 560, 200, gT('BLOCKED: waiting for the lock'), { align: 'center', bg: rgb(120, 60, 150) });
    if (k === PLANS[mode].length - 1) gTag(g, W / 2, 230, mode === 'unsafe' ? gT('Expected 12, got 11: a lost update') : gT('Expected 12, got 12'), { align: 'center', bg: mode === 'unsafe' ? rgb(160, 30, 30) : rgb(30, 120, 70), font: '700 16px Georgia,serif', size: 16 });
  }
  let S;
  function setMode(v) {
    mode = v;
    cv.set(v === 'unsafe' ? 'public void addUnsafe(int points) {\n    score = score + points;   // read, add, write\n}' : 'public synchronized void addSafe(int points) {\n    score = score + points;   // one thread at a time\n}');
    S = gSteps(PLANS[v].length, (i) => { k = i; note.textContent = PLANS[mode][i][2]; cv.mark([2]); draw(); }, { ms: 1700 });
    clear(ctl).append(...S.el); S.go(0);
  }
  const ctl = h('div', { class: 'row tight g-ctrl' });
  const m = seg([{ v: 'unsafe', l: 'no lock' }, { v: 'safe', l: 'synchronized' }], 'unsafe', setMode);
  const run = gRun(c.cvs, () => { t++; }, draw);
  setMode('unsafe');
  root.append(h('div', { class: 'g-split' }, gFrame('Step through two threads adding to one score.', c, [run.btn, m.el]), gSide(ctl, cv.el, note)));
};

DEMOS['g-deadlock'] = (root) => {
  const W = 760, H = 300, c = gCanvas(W, H, 'Two soldiers each need the ammo crate and the med kit');
  let mode = 'opposite', t = 0;
  const note = h('p', { class: 'g-status' });
  const CR = { x: 440, y: 236 }, KT = { x: 340, y: 238 };
  const lerp = (a, b, k) => a + (b - a) * Math.max(0, Math.min(1, k));
  function plan(f) {
    /* positions and what each soldier holds, frame by frame */
    if (mode === 'opposite') {
      const m = { x: lerp(110, 318, f / 60), holds: f > 60 ? ['kit'] : [], wait: f > 100 ? 'crate' : null };
      const gn = { x: lerp(650, 462, f / 60), holds: f > 60 ? ['crate'] : [], wait: f > 100 ? 'kit' : null };
      return { m, g: gn, msg: f < 60 ? 'Medic goes for the med kit, Gunner for the ammo crate…' : f < 100 ? 'Each one holds one item…' : '…and waits for the item the other one holds. Nobody can ever move: DEADLOCK.', dead: f > 130 };
    }
    const gn = { x: f < 60 ? lerp(650, 462, f / 60) : f < 100 ? 462 : f < 140 ? lerp(462, 362, (f - 100) / 40) : f < 170 ? 362 : lerp(362, 650, (f - 170) / 50),
      holds: f > 60 && f < 220 ? (f > 140 ? ['crate', 'kit'] : ['crate']) : [], wait: null };
    const m = { x: f < 60 ? lerp(110, 240, f / 60) : f < 220 ? 240 : f < 260 ? lerp(240, 418, (f - 220) / 40) : f < 300 ? lerp(418, 318, (f - 260) / 40) : 318,
      holds: f > 260 ? (f > 300 ? ['crate', 'kit'] : ['crate']) : [], wait: f > 60 && f < 220 ? 'crate' : null };
    return { m, g: gn, msg: f < 60 ? 'Both go for the ammo crate first: the same order.' : f < 220 ? 'Gunner got there first and takes the crate, then the kit. Medic waits for the crate, holding nothing.' : f < 320 ? 'Gunner is done and releases both. Now Medic takes them in the same order.' : 'Both finished. One fixed order means no cycle and no deadlock.', ok: f > 320 };
  }
  function draw() {
    const g = c.g; SPR.bg(g, W, H, 260, t);
    const f = t % (mode === 'opposite' ? 330 : 380), P = plan(f);
    const held = P.m.holds.concat(P.g.holds);
    if (!held.includes('crate')) SPR.ammoCrate(g, CR.x - 17, CR.y);
    if (!held.includes('kit')) SPR.healthPack(g, KT.x - 14, KT.y);
    const carry = (who, x) => { (who.holds || []).forEach((it, j) => { if (it === 'crate') SPR.ammoCrate(g, x - 17, 150 - j * 30); else SPR.healthPack(g, x - 14, 152 - j * 30); }); };
    SPR.commando(g, P.m.x, 260, false, { armband: true, noGun: true }); carry(P.m, P.m.x);
    SPR.commando(g, P.g.x, 260, false, { flip: true, noGun: false }); carry(P.g, P.g.x);
    gTag(g, P.m.x, 280, gT('Medic'), { align: 'center' }); gTag(g, P.g.x, 280, gT('Gunner'), { align: 'center' });
    if (P.m.wait) gTag(g, P.m.x, 112, (P.m.wait === 'crate' ? gT('waits for the ammo crate') : gT('waits for the med kit')), { align: 'center', bg: rgb(120, 60, 150) });
    if (P.g.wait) gTag(g, P.g.x, 112, (P.g.wait === 'crate' ? gT('waits for the ammo crate') : gT('waits for the med kit')), { align: 'center', bg: rgb(120, 60, 150) });
    if (P.dead) { gArrow(g, P.m.x + 20, 140, P.g.x - 30, 140, rgb(255, 90, 90), 3); gArrow(g, P.g.x - 20, 170, P.m.x + 30, 170, rgb(255, 90, 90), 3); gTag(g, W / 2, 50, gT('DEADLOCK'), { align: 'center', bg: rgb(170, 30, 30), font: '800 26px Georgia,serif', size: 26 }); }
    if (P.ok) gTag(g, W / 2, 50, gT('No deadlock: both finished'), { align: 'center', bg: rgb(30, 120, 70), font: '700 20px Georgia,serif', size: 20 });
    if (note.textContent !== P.msg) note.textContent = P.msg;
  }
  const m = seg([{ v: 'opposite', l: 'opposite lock order' }, { v: 'same', l: 'same lock order' }], 'opposite', (v) => { mode = v; t = 0; });
  const run = gRun(c.cvs, () => { t++; }, draw);
  root.append(gFrame('Each soldier needs both items; opposite lock orders freeze them.', c, [run.btn, m.el], note));
};

/* ---------------- Chapter 9 ---------------- */
/* the Chapter 9 program in the browser: same drones, same laser, same keys */
DEMOS['g-swing'] = (root) => {
  const W = GW, H = GH, G0 = GGROUND, c = gCanvas(W, H, 'The Chapter 9 GamePanel: arrow keys move the commando, Space or Fire shoots');
  let px, py, drones, score, laserY, laserEnd;
  const label = h('div', { class: 'swing-north g-north' });
  function upd() { label.textContent = 'Score: ' + score + '    Drones left: ' + drones.length; }
  function reset() { drones = [[560, 120], [640, 200], [480, 270]]; px = 80; py = G0; score = 0; laserY = -1; upd(); paint(); }
  function fire() {
    laserY = py - 36; laserEnd = W;
    let hit = null;
    drones.forEach((d) => { if (d[0] > px && Math.abs(d[1] - laserY) < 16 && (!hit || d[0] < hit[0])) hit = d; });
    if (hit) { drones.splice(drones.indexOf(hit), 1); laserEnd = hit[0]; score += 100; }
    upd(); paint();
  }
  function paint() {
    const g = c.g; SPR.bg(g, W, H, G0, 0);
    drones.forEach((d) => SPR.drone(g, d[0], d[1], 3));
    SPR.commando(g, px, py, laserY >= 0);
    if (laserY >= 0) SPR.laser(g, px + 36, laserY, laserEnd);
    if (!drones.length) { g.fillStyle = '#fff'; g.font = '700 32px Georgia,serif'; g.fillText('All drones down!', W / 2 - 130, H / 2); }
  }
  c.cvs.setAttribute('tabindex', '0');
  c.cvs.addEventListener('keydown', (e) => {
    const k = e.key;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(k)) return;
    e.preventDefault(); e.stopPropagation();
    if (k === ' ') { fire(); return; }
    if (k === 'ArrowLeft') px = Math.max(30, px - 10);
    if (k === 'ArrowRight') px = Math.min(W - 60, px + 10);
    if (k === 'ArrowUp') py = Math.max(120, py - 10);
    if (k === 'ArrowDown') py = Math.min(G0, py + 10);
    laserY = -1; paint();
  });
  const sb = (t, fn) => h('button', { type: 'button', class: 'swing-btn', onclick: () => { fn(); c.cvs.focus(); } }, t);
  const parts = tsw('show the Swing parts', 0, (v) => frame.classList.toggle('g-parts', !!v));
  const frame = h('div', { class: 'swing-frame g-swingframe' },
    h('div', { class: 'swing-title' }, h('i'), h('i'), h('i'), h('span', null, 'Code Commando - Chapter 9')),
    h('div', { class: 'swing-body' }, h('div', { class: 'g-part', 'data-part': 'JLabel · NORTH' }, label), h('div', { class: 'g-part', 'data-part': 'GamePanel · CENTER' }, c.cvs),
      h('div', { class: 'swing-south g-part', 'data-part': 'JPanel with JButtons · SOUTH' }, sb('Fire', fire), sb('Reset', reset), h('span', null, 'Arrow keys move, Space fires'))));
  reset();
  root.append(demoBox(null, 'Click the game area first, then use the arrow keys and Space. Nothing moves on its own yet: the panel only repaints after a key or a button. That is what Chapter 10 changes.', frame, h('div', { class: 'row g-center', style: { marginTop: '10px' } }, parts.el)));
};

DEMOS['g-paint'] = (root) => {
  const W = 760, H = 330, c = gCanvas(W, H, 'drawCommando drawn one Graphics call at a time on a coordinate grid');
  const CALLS = [
    ['g.fillRect(x - 18, y - 44, 7, 18);', 'backpack', 'rect', [-18, -44, 7, 18], rgb(47, 93, 44)],
    ['g.fillRect(x - 10, y - 22, 8, 22);', 'back leg', 'rect', [-10, -22, 8, 22], rgb(47, 93, 44)],
    ['g.fillRect(x + 2, y - 22, 8, 22);', 'front leg', 'rect', [2, -22, 8, 22], rgb(47, 93, 44)],
    ['g.fillRect(x - 12, y - 4, 12, 4);', 'boot', 'rect', [-12, -4, 12, 4], '#000'],
    ['g.fillRect(x + 1, y - 4, 12, 4);', 'boot', 'rect', [1, -4, 12, 4], '#000'],
    ['g.fillRect(x - 12, y - 46, 24, 26);', 'body', 'rect', [-12, -46, 24, 26], rgb(62, 123, 58)],
    ['g.fillRect(x - 12, y - 24, 24, 3);', 'belt', 'rect', [-12, -24, 24, 3], rgb(110, 80, 40)],
    ['g.fillOval(x - 8, y - 60, 16, 16);', 'head', 'oval', [-8, -60, 16, 16], rgb(224, 180, 138)],
    ['g.fillArc(x - 10, y - 66, 20, 16, 0, 180);', 'helmet', 'arc', [-10, -66, 20, 16], rgb(47, 93, 44)],
    ['g.fillRect(x - 10, y - 59, 22, 3);', 'helmet brim', 'rect', [-10, -59, 22, 3], rgb(47, 93, 44)],
    ['g.fillRect(x + 3, y - 55, 4, 3);', 'eye', 'rect', [3, -55, 4, 3], '#000'],
    ['g.fillRect(x + 2, y - 38, 26, 6);', 'rifle', 'rect', [2, -38, 26, 6], rgb(34, 34, 34)],
    ['g.fillRect(x + 28, y - 37, 8, 3);', 'barrel', 'rect', [28, -37, 8, 3], rgb(34, 34, 34)],
    ['g.fillRect(x - 2, y - 40, 14, 6);', 'arm', 'rect', [-2, -40, 14, 6], rgb(62, 123, 58)],
    ['g.fillOval(x + 9, y - 41, 7, 7);', 'hand', 'oval', [9, -41, 7, 7], rgb(224, 180, 138)]];
  const cv = codeView(CALLS.map((x) => x[0]).join('\n'), { small: true });
  const note = h('p', { class: 'g-status' });
  const S0 = 4, OX = 300, OY = 300;            // 4x zoom; the commando stands at (x, y) = (75, 75) in a 0..150 grid
  const WX = 75, WY = 75;
  let k = 0, mouse = null;
  function draw() {
    const g = c.g; g.fillStyle = rgb(244, 246, 250); g.fillRect(0, 0, W, H);
    const sx = (v) => OX + (v - WX) * S0, sy = (v) => OY + (v - WY) * S0;
    g.strokeStyle = 'rgba(30,60,100,.12)'; g.lineWidth = 1;
    for (let v = 0; v <= 150; v += 5) { g.beginPath(); g.moveTo(sx(v), 0); g.lineTo(sx(v), H); g.stroke(); g.beginPath(); g.moveTo(0, sy(v)); g.lineTo(W, sy(v)); g.stroke(); }
    g.fillStyle = '#44536A'; g.font = '600 12px Georgia,serif';
    gArrow(g, 12, 14, 120, 14, '#44536A', 2); gArrow(g, 12, 14, 12, 120, '#44536A', 2); g.fillText(gT('x grows →'), 40, 30); g.save(); g.translate(26, 110); g.fillText(gT('y grows ↓'), 0, 0); g.restore();
    CALLS.slice(0, k + 1).forEach((cl, i) => {
      const [dx, dy, w, hh] = cl[3]; g.fillStyle = cl[4];
      if (cl[2] === 'rect') g.fillRect(sx(WX + dx), sy(WY + dy), w * S0, hh * S0);
      else if (cl[2] === 'oval') oval(g, sx(WX + dx), sy(WY + dy), w * S0, hh * S0);
      else halfTop(g, sx(WX + dx), sy(WY + dy), w * S0, hh * S0);
      if (i === k) { g.strokeStyle = rgb(224, 122, 31); g.lineWidth = 3; g.strokeRect(sx(WX + dx) - 2, sy(WY + dy) - 2, w * S0 + 4, hh * S0 + 4); }
    });
    g.fillStyle = rgb(224, 122, 31); oval(g, sx(WX) - 5, sy(WY) - 5, 10, 10);
    gTag(g, sx(WX) + 10, sy(WY) + 14, '(x, y)', { bg: rgb(224, 122, 31) });
    const cur = CALLS[k][3];
    gTag(g, 440, 40, gT('top-left corner') + ': (x ' + (cur[0] < 0 ? '- ' + -cur[0] : '+ ' + cur[0]) + ', y - ' + -cur[1] + ')', { bg: '#155E63' });
    gTag(g, 440, 72, gT('width') + ' ' + cur[2] + ', ' + gT('height') + ' ' + cur[3], { bg: '#155E63' });
    if (mouse) gTag(g, mouse[0] + 12, mouse[1] - 12, 'x + ' + Math.round((mouse[0] - OX) / S0) + ', y + ' + Math.round((mouse[1] - OY) / S0), { bg: '#44536A' });
  }
  c.cvs.addEventListener('mousemove', (e) => { const r = c.cvs.getBoundingClientRect(); mouse = [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; draw(); });
  c.cvs.addEventListener('mouseleave', () => { mouse = null; draw(); });
  const S = gSteps(CALLS.length, (i) => { k = i; cv.mark([i + 1]); note.textContent = 'Call ' + (i + 1) + ': the ' + CALLS[i][1] + '. Shapes drawn later cover earlier ones.'; draw(); }, { ms: 700 });
  S.go(0);
  root.append(h('div', { class: 'g-split' }, h('div', { class: 'g-scene', style: { '--ar': String(W / H) } }, c.cvs, h('p', { class: 'g-cap' }, 'Every shape is placed from the point (x, y) between the boots. On screen, y grows downwards, so “up” means y minus something.')), gSide(h('div', { class: 'row tight g-ctrl' }, S.el), cv.el, note)));
};

/* ---------------- Chapter 10 ---------------- */
DEMOS['g-loop'] = (root) => {
  const c = gCanvas(GW, GH, 'The game loop in slow motion: update, collisions, repaint, sleep');
  let s = newBattle({ seed: 21 }), phase = 0, sub = 0, speed = 1, frames = 0;
  const PH = [['update()', 'move the player, enemies and bullets'], ['collisions', 'check every bullet and enemy box'], ['repaint()', 'ask Swing to draw this frame'], ['sleep(16)', 'wait about 16 ms: about 60 frames a second']];
  const boxes = PH.map(([a, b]) => h('div', { class: 'g-ph' }, h('b', null, a), h('span', null, b)));
  const fc = h('p', { class: 'g-status' });
  const diag = h('div', { class: 'g-loopdiag' }, ...boxes);
  function step() {
    sub++;
    const per = speed === 1 ? 1 : 16;            // slow motion: each phase stays on screen a while
    if (sub < per) return;
    sub = 0; phase = (phase + 1) % 4;
    if (phase === 0) { battleStep(s); frames++; if (s.over || s.t > 4000) s = newBattle({ seed: s.t }); }
    boxes.forEach((b, i) => b.classList.toggle('on', i === phase));
    fc.textContent = 'Frame ' + frames + '   ·   now: ' + PH[phase][0];
  }
  const sp = seg([{ v: 1, l: 'full speed' }, { v: 0, l: 'slow motion' }], 1, (v) => { speed = v; });
  const run = gRun(c.cvs, step, () => battleDraw(c.g, s), { warm: 200 });
  root.append(h('div', { class: 'g-split' }, gFrame('One frame: four steps, about 60 times a second.', c, [run.btn, sp.el]), gSide(diag, fc)));
};

DEMOS['g-collide'] = (root) => {
  const c = gCanvas(GW, GH, 'The game with every object’s bounding box drawn');
  let s = newBattle({ seed: 33 }), slow = false, n = 0, hits = 0;
  const st = h('p', { class: 'g-status' });
  const run = gRun(c.cvs, () => {
    if (slow && (++n % 4)) return;
    battleStep(s);
    if (s.events.includes('kill') || s.events.includes('hurt')) { hits++; st.textContent = 'Collisions so far: ' + hits + '  (getBounds().intersects(...) returned true)'; }
    if (s.over || s.t > 4000) s = newBattle({ seed: s.t });
  }, () => battleDraw(c.g, s, { boxes: true }), { warm: 150 });
  const sl = tsw('slow motion', 0, (v) => { slow = !!v; });
  st.textContent = 'Each object is a rectangle. Two objects collide when their rectangles overlap.';
  root.append(gFrame('A box turns red while it overlaps another one.', c, [run.btn, sl.el], st));
};

/* the finished game, playable in the browser */
DEMOS['g-play'] = (root) => {
  const c = gCanvas(GW, GH, 'Code Commando: click, then play with the arrow keys and Space');
  const keys = { left: false, right: false, up: false, down: false, fire: false, restart: false };
  let s = newBattle({ seed: 99, firstSpawn: 60 }), focused = false, best = +(lsGet('cc-best') || 0);
  const info = h('span', { class: 'swing-status g-best' });
  function sayBest() { info.textContent = 'Best score on this device: ' + best; }
  let touch = 0;                              // buttons held on a touch screen
  const touching = () => touch > 0;
  gKeys(c.cvs, keys);
  c.cvs.addEventListener('focus', () => { focused = true; });
  c.cvs.addEventListener('blur', () => { focused = false; });
  const run = gRun(c.cvs, () => {
    const inp = focused || touching() ? { dx: (keys.right ? 1 : 0) - (keys.left ? 1 : 0), dy: (keys.down ? 1 : 0) - (keys.up ? 1 : 0), fire: keys.fire, restart: keys.restart } : { dx: 0, dy: 0, fire: false };
    if (s.over && keys.restart) { keys.restart = false; s = newBattle({ seed: s.t + 1, firstSpawn: 60 }); return; }
    battleStep(s, inp);
    if (s.over && s.score > best) { best = s.score; lsSet('cc-best', String(best)); sayBest(); }
  }, () => {
    battleDraw(c.g, s);
    if (!focused && !touching() && !s.over) { const g = c.g; g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, GW, GH); g.fillStyle = '#fff'; g.font = '700 26px Georgia,serif'; g.textAlign = 'center'; g.fillText(gT('Click here to play'), GW / 2, GH / 2 - 6); g.font = '400 16px Georgia,serif'; g.fillText(gT('Arrow keys or WASD move · Space fires · R restarts'), GW / 2, GH / 2 + 22); g.textAlign = 'left'; }
  }, { warm: 1 });
  c.cvs.addEventListener('click', () => c.cvs.focus());
  const pad = (label, k) => {
    const b = h('button', { type: 'button', class: 'swing-btn g-pad', 'aria-label': k }, label);
    const on = (v) => (e) => { e.preventDefault(); keys[k] = v; touch += v ? 1 : -1; touch = Math.max(0, touch); };
    b.addEventListener('pointerdown', on(true)); b.addEventListener('pointerup', on(false)); b.addEventListener('pointerleave', (e) => { if (keys[k]) on(false)(e); });
    return b;
  };
  sayBest();
  const frame = h('div', { class: 'swing-frame g-swingframe' },
    h('div', { class: 'swing-title' }, h('i'), h('i'), h('i'), h('span', null, 'Code Commando')),
    h('div', { class: 'swing-body' }, c.cvs,
      h('div', { class: 'swing-south' }, pad('◀', 'left'), pad('▲', 'up'), pad('▼', 'down'), pad('▶', 'right'), pad('Fire', 'fire'), h('button', { type: 'button', class: 'swing-btn', onclick: () => { s = newBattle({ seed: Date.now() % 9999, firstSpawn: 60 }); c.cvs.focus(); } }, 'Restart'), info)));
  root.append(demoBox(null, 'This is the Chapter 10 program running in the browser: the same objects, the same loop and the same collision rules.', frame, h('div', { class: 'row g-center', style: { marginTop: '10px' } }, run.btn)));
};
