/* ===================== game-scenes-a.js : game scenes for Chapters 1-5 =====================
   Every scene is a DEMOS entry (data-demo="g-…"), built on game-core.js. Each one follows a program of
   the chapter, so the picture, the highlighted code and the printed output tell the same story. */

const gBtn = (label, fn, cls) => h('button', { type: 'button', class: 'btn sm' + (cls ? ' ' + cls : ''), onclick: fn }, label);
/* Back / Next / Play / Reset over n steps; onShow(i) draws step i */
function gSteps(n, onShow, opt = {}) {
  let i = 0;
  const label = h('span', { class: 'g-stepn' });
  const back = gBtn('◀ Back', () => { st.stop(); go(i - 1); });
  const next = gBtn('Next ▶', () => { st.stop(); go(i + 1); }, 'pri');
  const reset = gBtn('Reset', () => { st.stop(); go(0); });
  const st = stepper(() => { if (i >= n - 1) return false; go(i + 1); return i < n - 1; }, { ms: opt.ms || 1500 });
  function go(k) {
    i = Math.max(0, Math.min(n - 1, k));
    label.textContent = 'Step ' + (i + 1) + ' of ' + n;
    back.disabled = i === 0; next.disabled = i === n - 1;
    onShow(i);
  }
  return { el: [back, next, st.play, reset, label], go, get: () => i, stop: st.stop };
}
/* text that floats up and fades: push({ x, y, text, col }) */
function gFloats() {
  const list = [];
  return {
    push(f) { list.push(Object.assign({ age: 0, col: '#FFE08A' }, f)); },
    step() { list.forEach((f) => f.age++); for (let k = list.length - 1; k >= 0; k--) if (list[k].age > 70) list.splice(k, 1); },
    draw(g) { list.forEach((f) => { g.save(); g.globalAlpha = Math.max(0, 1 - f.age / 70); g.fillStyle = f.col; g.font = '700 18px Georgia,serif'; g.textAlign = 'center'; g.fillText(f.text, f.x, f.y - f.age * 0.6); g.restore(); }); },
    clear() { list.length = 0; }
  };
}
const gSide = (...kids) => h('div', { class: 'g-side' }, ...kids);
const gOut = () => { const c = consoleEl('Console'); c.el.classList.add('g-console'); return c; };

/* ---------------- the opening battle (hooks, title slides, home page) ---------------- */
function battleDemo(root, opt) {
  const c = gCanvas(GW, GH, 'Code Commando: a commando on the left fires at drones and tanks that come in from the right');
  let s = newBattle({ seed: opt.seed || 11 });
  const run = gRun(c.cvs, () => { battleStep(s); if (s.over || s.t > 3600) s = newBattle({ seed: s.t + 5 }); }, () => battleDraw(c.g, s), { warm: 160 });
  if (opt.bare) { c.cvs.classList.add('g-bare'); root.append(c.cvs); return; }
  root.append(gFrame(opt.cap, c, [run.btn]));
}
DEMOS['g-intro'] = (root) => battleDemo(root, { cap: 'Code Commando, the game we build in this course. The commando fires, drones bob towards him, tanks shell him from the ground. Every part of it is a Java idea you will learn.' });
DEMOS['g-title'] = (root) => battleDemo(root, { bare: true, seed: 3 + (+root.getAttribute('data-ch') || 0) * 17 });

/* ---------------- Chapter 1 ---------------- */
DEMOS['g-hud'] = (root) => {
  const c = gCanvas(GW, GH, 'The game running with its variables listed beside it');
  let s = newBattle({ seed: 5, ammo: 15 }), reload = 0;
  const rows = [
    ['String', 'name', () => '"Ranger"'], ['byte', 'lives', () => '3'], ['short', 'level', () => '1'],
    ['int', 'health', () => String(s.player.hp)], ['int', 'ammo', () => String(s.ammo)], ['long', 'highScore', () => '2500000000L'],
    ['float', 'speed', () => '2.5f'], ['double', 'damage', () => '12.75'], ['char', 'rank', () => "'B'"], ['boolean', 'alive', () => String(s.player.active)],
    ['int', 'score', () => String(s.score)]];
  const cells = rows.map(([t, n]) => { const b = h('b'); return { li: h('li', null, h('code', null, h('span', { class: 'g-t' }, t), ' ' + n + ' = '), b), b, last: '' }; });
  const list = h('ul', { class: 'g-vars' }, cells.map((x) => x.li));
  let tick = 0;
  function paintVars() {
    rows.forEach((r, i) => { const v = r[2](); const cl = cells[i]; if (v !== cl.last) { cl.b.textContent = v; if (cl.last) { cl.li.classList.remove('chg'); void cl.li.offsetWidth; cl.li.classList.add('chg'); } cl.last = v; } });
  }
  const run = gRun(c.cvs, () => {
    battleStep(s);
    if (s.ammo === 0 && ++reload > 50) { s.ammo = 15; reload = 0; }
    if (s.over || s.t > 3000) { s = newBattle({ seed: s.t, ammo: 15 }); }
  }, () => { battleDraw(c.g, s); if (++tick % 4 === 0) paintVars(); }, { warm: 120 });
  paintVars();
  root.append(h('div', { class: 'g-split' }, gFrame('Each number on the screen is a variable.', c, [run.btn]), gSide(h('h4', null, 'The game’s variables'), list)));
};

DEMOS['g-cast'] = (root) => {
  const W = 760, H = 300, c = gCanvas(W, H, 'A hit of 12.75 is cut down to 12 to fit an int, then 88 widens to 88.0');
  let t = 0;
  const LOOP = 470;
  function draw() {
    const g = c.g, f = t % LOOP;
    SPR.bg(g, W, H, 250, t);
    const health = f < 230 ? 100 : 88;
    SPR.commando(g, 110, 250, false);
    SPR.tank(g, 620, 250);
    if (f < 70) { const k = f / 70; SPR.bullet(g, 610 - k * 470, 218, true); }
    const boxY = 70;
    const box = (x, label, val, col) => { g.fillStyle = 'rgba(8,14,26,.85)'; rr(g, x, boxY - 34, 190, 68, 10); g.strokeStyle = col; g.lineWidth = 2.5; g.strokeRect(x + 1, boxY - 33, 188, 66); g.fillStyle = col; g.font = '600 14px "IBM Plex Mono",monospace'; g.fillText(label, x + 12, boxY - 12); g.fillStyle = '#fff'; g.font = '700 24px "IBM Plex Mono",monospace'; g.fillText(val, x + 12, boxY + 20); };
    box(300, 'int health', String(health), rgb(120, 200, 255));
    box(530, 'double healthD', f >= 330 ? '88.0' : '', rgb(255, 214, 90));
    const say = (txt) => gTag(g, W / 2, H - 22, txt, { align: 'center', font: '600 16px Georgia,serif', size: 16 });
    if (f >= 70 && f < 230) {
      const k = Math.min(1, (f - 70) / 80), x = 120 + k * 210, y = 190 - k * 100;
      g.font = '700 26px "IBM Plex Mono",monospace'; g.fillStyle = rgb(255, 214, 90);
      if (f < 160) { g.fillText('12.75', x, y); say(gT('A hit of 12.75 damage is a double')); }
      else {
        g.fillText('12', x, y);
        const drop = (f - 160) * 1.6; g.globalAlpha = Math.max(0, 1 - (f - 160) / 60); g.fillStyle = rgb(255, 120, 90); g.fillText('.75', x + 38, y + drop); g.globalAlpha = 1;
        g.strokeStyle = rgb(255, 120, 90); g.lineWidth = 3; g.beginPath(); g.moveTo(x + 36, y - 26); g.lineTo(x + 36, y + 8); g.stroke();
        say(gT('(int) 12.75 cuts off the fraction: 12, not 13'));
      }
    } else if (f >= 230 && f < 330) {
      const k = Math.min(1, (f - 230) / 80);
      g.font = '700 24px "IBM Plex Mono",monospace'; g.fillStyle = rgb(120, 200, 255); g.fillText('88', 320 + k * 230, 90);
      say(gT('health = 100 - 12 = 88. Copy it into a double: widening is automatic'));
    } else if (f >= 330) say(gT('double healthD = health;  gives 88.0: no data lost'));
    else say(gT('A tank fires...'));
  }
  const run = gRun(c.cvs, () => { t++; }, draw, { warm: 180 });
  root.append(gFrame('double → int needs a cast and drops the fraction.', c, [run.btn, gBtn('Replay', () => { t = 0; draw(); })]));
};

DEMOS['g-switch'] = (root) => {
  const W = 760, H = 300, c = gCanvas(W, H, 'The commando fires the weapon picked by the switch statement at a target drone');
  const src = 'switch (key) {\n    case 1:  weapon = "Pistol"; weaponDamage = 10; break;\n    case 2:  weapon = "Rifle";  weaponDamage = 25; break;\n    case 3:  weapon = "Rocket"; weaponDamage = 80; break;\n    default: weapon = "Fists";  weaponDamage = 2;\n}';
  const cv = codeView(src, { small: true });
  const W8 = { 1: ['Pistol', 10, 22, 'pistol', 8], 2: ['Rifle', 25, 11, 'rifle', 11], 3: ['Rocket', 80, 50, 'rocket', 5] };
  let key = 2, t = 0, cool = 0, hp = 100, shots = [], fist = 0;
  const fl = gFloats();
  const out = h('p', { class: 'g-status' });
  function pick(k) {
    key = k; cool = 0; shots = [];
    cv.mark([1, k >= 1 && k <= 3 ? k + 1 : 5]);
    const w = W8[k] || ['Fists', 2];
    out.textContent = 'key = ' + k + '  →  ' + (W8[k] ? 'case ' + k : 'default') + ': ' + w[0] + ' (' + w[1] + ' damage)';
  }
  const ks = seg([{ v: 1, l: 'Key 1' }, { v: 2, l: 'Key 2' }, { v: 3, l: 'Key 3' }, { v: 9, l: 'Key 9' }], 2, pick);
  function step() {
    t++; fl.step();
    const w = W8[key];
    if (--cool <= 0) {
      cool = w ? w[2] : 30;
      if (w) shots.push({ x: 150, kind: w[3], v: w[4] }); else fist = 12;
    }
    if (fist > 0) { fist--; if (fist === 6) { hp -= 2; fl.push({ x: 600, y: 150, text: '-2' }); } }
    shots.forEach((b) => { b.x += b.v; if (b.x >= 580) { b.done = true; hp -= W8[key] ? W8[key][1] : 0; fl.push({ x: 600, y: 150, text: '-' + (W8[key] ? W8[key][1] : 0) }); if (b.kind === 'rocket') fl.push({ x: 600, y: 190, text: 'BOOM', col: '#FF9A50' }); } });
    shots = shots.filter((b) => !b.done);
    if (hp <= 0) { hp = 100; fl.push({ x: 600, y: 110, text: gT('Destroyed! New target'), col: '#9AF0B0' }); }
  }
  function draw() {
    const g = c.g; SPR.bg(g, W, H, 260, t);
    const w = W8[key];
    SPR.commando(g, fist > 0 ? 130 + (12 - fist) * 30 : 110, 260, !!w && cool > (w ? w[2] - 4 : 0), { noGun: true });
    if (w) SPR.weapon(g, 112, 223, w[3]);
    else { g.fillStyle = rgb(224, 180, 138); oval(g, (fist > 0 ? 130 + (12 - fist) * 30 : 110) + 10, 216, 12, 12); }
    shots.forEach((b) => { if (b.kind === 'rocket') { g.fillStyle = rgb(200, 60, 50); oval(g, b.x - 10, 216, 22, 10); g.fillStyle = rgb(255, 170, 60); oval(g, b.x - 22, 218, 12, 6); } else SPR.bullet(g, b.x, 221, false); });
    SPR.drone(g, 600, 200, t);
    g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(560, 160, 80, 8); g.fillStyle = rgb(220, 60, 60); g.fillRect(560, 160, Math.max(0, hp) * 0.8, 8);
    gTag(g, 20, 26, (w ? w[0] : 'Fists') + ' · ' + (w ? w[1] : 2) + ' damage', { font: '700 16px Georgia,serif', size: 16 });
    fl.draw(g);
  }
  pick(2);
  const run = gRun(c.cvs, step, draw, { warm: 30 });
  root.append(h('div', { class: 'g-split' }, gFrame('Press a key to pick a weapon.', c, [run.btn, ks.el]), gSide(cv.el, out)));
};

DEMOS['g-loops'] = (root) => {
  const W = 760, H = 260;
  const PROGS = {
    for: { label: 'for', src: 'int ammo = 5;\nfor (int shot = 1; shot <= 3; shot++) {\n    ammo--;\n    System.out.println("Shot " + shot + "  ammo left: " + ammo);\n}', cap: 'for: the number of repeats is known in advance, a burst of exactly 3.' },
    while: { label: 'while', src: 'int droneHealth = 60;\nint shots = 0;\nwhile (droneHealth > 0) {\n    droneHealth -= weaponDamage;   // 25\n    shots++;\n}\nSystem.out.println("Drone destroyed in " + shots + " shots");', cap: 'while: repeat as long as a condition holds. We do not know in advance how many shots it takes.' },
    jump: { label: 'break & continue', src: 'ammo = 3;\nfor (int shot = 1; shot <= 10; shot++) {\n    if (shot == 2) {\n        continue;            // jammed: skip this shot\n    }\n    if (ammo == 0) {\n        break;               // empty: leave the loop\n    }\n    ammo--;                  // BANG\n}', cap: 'continue skips to the next round of the loop. break leaves the loop at once.' },
    dowhile: { label: 'do-while', src: 'int enemies = 7;\nint wave = 0;\ndo {\n    wave++;\n    int defeated = Math.min(3, enemies);\n    enemies -= defeated;\n} while (enemies > 0);', cap: 'do-while: the body runs first and the test comes after, so it always runs at least once.' }
  };
  function script(id) {
    const st = [];
    if (id === 'for') {
      let ammo = 5; st.push({ l: 1, v: { ammo } });
      for (let shot = 1; ; shot++) {
        st.push({ l: 2, v: { ammo, shot }, note: shot <= 3 ? 'shot <= 3 is true: run the body' : 'shot <= 3 is false: the loop ends' });
        if (shot > 3) break;
        ammo--; st.push({ l: 3, v: { ammo, shot }, act: 'fire' });
        st.push({ l: 4, v: { ammo, shot }, out: 'Shot ' + shot + '  ammo left: ' + ammo });
      }
    } else if (id === 'while') {
      let hp = 60, shots = 0; st.push({ l: 1, v: { droneHealth: hp }, hp }); st.push({ l: 2, v: { droneHealth: hp, shots }, hp });
      for (;;) {
        st.push({ l: 3, v: { droneHealth: hp, shots }, hp, note: hp > 0 ? 'droneHealth > 0: keep shooting' : 'droneHealth is 0: stop' });
        if (hp <= 0) break;
        hp = Math.max(-15, hp - 25); st.push({ l: 4, v: { droneHealth: hp, shots }, hp, act: 'fire' });
        shots++; st.push({ l: 5, v: { droneHealth: hp, shots }, hp });
      }
      st.push({ l: 7, v: { droneHealth: hp, shots }, hp, out: 'Drone destroyed in ' + shots + ' shots', act: 'boom' });
    } else if (id === 'jump') {
      let ammo = 3; st.push({ l: 1, v: { ammo } });
      for (let shot = 1; shot <= 10; shot++) {
        st.push({ l: 2, v: { ammo, shot } });
        st.push({ l: 3, v: { ammo, shot }, note: shot === 2 ? 'shot == 2: the rifle jams' : 'shot == 2 is false' });
        if (shot === 2) { st.push({ l: 4, v: { ammo, shot }, act: 'jam', note: 'continue: jump to shot++' }); continue; }
        st.push({ l: 6, v: { ammo, shot }, note: ammo === 0 ? 'ammo == 0: the clip is empty' : 'ammo == 0 is false' });
        if (ammo === 0) { st.push({ l: 7, v: { ammo, shot }, act: 'empty', note: 'break: leave the loop now' }); break; }
        ammo--; st.push({ l: 9, v: { ammo, shot }, act: 'fire' });
      }
    } else {
      let enemies = 7, wave = 0; st.push({ l: 1, v: { enemies }, wave: 7 }); st.push({ l: 2, v: { enemies, wave }, wave: 7 });
      do {
        st.push({ l: 3, v: { enemies, wave }, wave: enemies, note: wave === 0 ? 'do: run the body before any test' : 'back to do' });
        wave++; st.push({ l: 4, v: { enemies, wave }, wave: enemies });
        const d = Math.min(3, enemies); st.push({ l: 5, v: { enemies, wave, defeated: d }, wave: enemies });
        enemies -= d; st.push({ l: 6, v: { enemies, wave, defeated: d }, wave: enemies, act: 'kill' + d });
        st.push({ l: 7, v: { enemies, wave }, wave: enemies, note: enemies > 0 ? 'enemies > 0: another wave' : 'enemies is 0: done' });
      } while (enemies > 0);
    }
    return st;
  }
  const body = h('div');
  const t = tabs(Object.keys(PROGS).map((k) => ({ id: k, label: PROGS[k].label })), 'for', (id, el, reg) => {
    const P = PROGS[id], cv = codeView(P.src, { small: true }), steps = script(id);
    const c = gCanvas(W, H, 'The loop running in the game');
    const vars = h('div', { class: 'row tight g-kv' }), note = h('p', { class: 'g-status' }), out = gOut();
    let tt = 0, bullets = [], tags = gFloats(), hp = 60, dr = 7, outLines = [];
    function show(i) {
      const s = steps[i];
      cv.mark([s.l]);
      clear(vars).append(...Object.keys(s.v).map((k) => kv(k, String(s.v[k]))));
      note.textContent = s.note || '';
      if (s.hp != null) hp = Math.max(0, s.hp);
      if (s.wave != null) dr = s.wave;
      if (s.act === 'fire') bullets.push({ x: 150 });
      if (s.act === 'jam') tags.push({ x: 140, y: 170, text: 'JAMMED', col: '#FF9A50' });
      if (s.act === 'empty') tags.push({ x: 140, y: 170, text: 'click! empty', col: '#FF9A50' });
      if (s.act === 'boom') tags.push({ x: 600, y: 170, text: 'BOOM!', col: '#FF9A50' });
      if (s.act && s.act.startsWith('kill')) tags.push({ x: 560, y: 120, text: s.act.slice(4) + ' defeated', col: '#9AF0B0' });
      outLines = steps.slice(0, i + 1).filter((x) => x.out).map((x) => x.out);
      out.set(outLines.join('\n') || ' ');
      if (i === 0) { bullets = []; tags.clear(); hp = 60; dr = 7; }
    }
    const S = gSteps(steps.length, show, { ms: 900 });
    reg(S.stop);
    function draw() {
      const g = c.g; SPR.bg(g, W, H, 220, tt);
      SPR.commando(g, 110, 220, bullets.some((b) => b.x < 190));
      bullets.forEach((b) => SPR.bullet(g, b.x, 186, false));
      if (id === 'dowhile') { for (let k = 0; k < dr; k++) SPR.drone(g, 430 + (k % 4) * 80, 80 + Math.floor(k / 4) * 60, tt + k * 5); }
      else if (id === 'while') { if (hp > 0) { SPR.drone(g, 600, 186, tt); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(570, 154, 60, 7); g.fillStyle = rgb(220, 60, 60); g.fillRect(570, 154, hp, 7); } }
      else SPR.drone(g, 600, 186, tt);
      tags.draw(g);
    }
    const run = gRun(c.cvs, () => { tt++; tags.step(); bullets.forEach((b) => { b.x += 9; }); bullets = bullets.filter((b) => b.x < 580); }, draw);
    reg(() => run.pause());
    el.append(h('div', { class: 'g-split' }, h('div', null, gFrame(P.cap, c, [run.btn]), out.el), gSide(h('div', { class: 'row tight g-ctrl' }, S.el), cv.el, vars, note)));
    S.go(0);
  });
  body.append(t.el);
  root.append(body);
};

/* ---------------- Chapter 2 ---------------- */
DEMOS['g-blueprint'] = (root) => {
  /* the driver (main) runs one line per step; every `new` builds an object, and the game shows it arrive */
  const W = 760, H = 300, c = gCanvas(W, H, 'The driver main() runs new Player and new Enemy; each new object appears in the game and on the heap');
  const src = ['// BattleDemo.main(): the driver', 'Player ranger = new Player("Ranger", 100, 5);', 'Enemy drone1 = new Enemy("Drone-1", 40, 50);',
    'Enemy drone2 = new Enemy("Drone-2", 40, 50);', 'Enemy drone3 = new Enemy("Drone-3", 40, 50);', 'ranger.shoot(drone1);', 'ranger.shoot(drone1);',
    'int spawned = Enemy.getEnemiesSpawned();'];
  const cv = codeView(src.join('\n'), { small: true });
  const notes = [
    'Only the classes exist. A class is a blueprint: it puts nothing in the game.',
    'new Player(…) builds a Player object on the heap and runs its constructor. ranger holds a reference to it.',
    'new Enemy(…) builds the first Enemy object. The constructor adds 1 to the static counter enemiesSpawned.',
    'A second new: a second, separate object with its own health.',
    'Three objects from one class. They share the code, but each keeps its own fields.',
    'ranger.shoot(drone1) calls a method on one object; only drone1 loses health (40 → 15).',
    'Again: drone1 drops to 0 and is destroyed. drone2 and drone3 still have 40.',
    'enemiesSpawned is static: one copy for the whole class, so spawned is 3.'];
  const note = h('p', { class: 'g-status' }), heap = h('div', { class: 'g-heap g-heap2' });
  const DR = [{ v: 'drone1', type: 'Drone-1', tx: 400, y: 110 }, { v: 'drone2', type: 'Drone-2', tx: 520, y: 175 }, { v: 'drone3', type: 'Drone-3', tx: 640, y: 110 }];
  let k = 0, t = 0, px = -60, ds = DR.map((d) => ({ x: W + 40, hp: 40, shown: 40 })), shot = null;
  const fl = gFloats();
  function hpAt(i) { return i >= 6 ? 0 : i >= 5 ? 15 : 40; }
  function paint() {
    const cards = [];
    if (k >= 1) cards.push(h('div', { class: 'g-obj' + (k === 1 || k >= 5 && k <= 6 ? ' on' : '') }, h('b', null, 'ranger → Player'), h('code', null, 'health 100 · ammo ' + (5 - Math.max(0, Math.min(2, k - 4))))));
    DR.forEach((d, i) => {
      if (k < i + 2) return;
      const hp = i === 0 ? hpAt(k) : 40;
      cards.push(h('div', { class: 'g-obj' + (k === i + 2 || (i === 0 && (k === 5 || k === 6)) ? ' on' : '') + (hp === 0 ? ' dead' : '') },
        h('b', null, d.v + ' → Enemy'), h('code', null, 'health ' + hp)));
    });
    clear(heap).append(...(cards.length ? cards : [h('p', { class: 'muted small' }, 'Heap: no objects yet.')]));
  }
  function show(i) {
    const prev = k; k = i;
    cv.mark([i + 1]);
    note.textContent = notes[i];
    if (i === 0) { px = -60; ds.forEach((d) => { d.x = W + 40; d.shown = 40; }); shot = null; fl.clear(); }
    if (i === prev + 1 && (i === 5 || i === 6)) shot = { x: 150, to: 0 };
    if (i < prev) ds[0].shown = hpAt(i);
    if (i >= 2 && i - 2 < 3 && i === prev + 1) fl.push({ x: DR[i - 2].tx, y: DR[i - 2].y - 40, text: 'new Enemy', col: '#9AF0B0' });
    if (i === 1 && prev === 0) fl.push({ x: 110, y: 170, text: 'new Player', col: '#9AF0B0' });
    paint();
  }
  const S = gSteps(src.length, show, { ms: 1700 });
  function step() {
    t++; fl.step();
    if (k >= 1) px += (110 - px) * 0.1;
    ds.forEach((d, i) => { if (k >= i + 2) d.x += (DR[i].tx - d.x) * 0.08; });
    if (shot) {
      shot.x += 14;
      if (shot.x >= ds[0].x - 20) {
        shot = null; ds[0].shown = hpAt(k);
        fl.push({ x: ds[0].x, y: DR[0].y - 30, text: '-25' });
        if (ds[0].shown === 0) fl.push({ x: ds[0].x, y: DR[0].y + 40, text: '+50 points', col: '#9AF0B0' });
      }
    } else if (k < 5) ds[0].shown = 40;
    else if (!shot) ds[0].shown = hpAt(k);
  }
  function draw() {
    const g = c.g; SPR.bg(g, W, H, 260, t);
    if (k >= 1) { SPR.commando(g, px, 260, !!shot && shot.x < 200); gTag(g, px, 284, 'ranger', { align: 'center' }); }
    if (shot) SPR.bullet(g, shot.x, 222 - (222 - DR[0].y) * Math.min(1, (shot.x - 150) / Math.max(1, ds[0].x - 170)), false);
    DR.forEach((d, i) => {
      if (k < i + 2) return;
      const s = ds[i], hp = i === 0 ? s.shown : 40;
      if (hp > 0) SPR.drone(g, s.x, d.y, t + i * 7); else SPR.boom(g, s.x, d.y, 14);
      gTag(g, s.x, d.y + 32, d.v + ' · ' + hp + ' HP', { align: 'center', border: k === i + 2 ? rgb(255, 214, 90) : null });
    });
    if (k === 0) { g.fillStyle = '#E7EEF8'; g.font = '600 18px Georgia,serif'; g.textAlign = 'center'; g.fillText(gT('No objects yet: press Next to run main()'), W / 2, 130); g.textAlign = 'left'; }
    fl.draw(g);
  }
  const run = gRun(c.cvs, step, draw);
  root.append(h('div', { class: 'g-split' },
    h('div', null, gFrame('Each new adds one object to the game.', c, [run.btn])),
    gSide(h('div', { class: 'row tight g-ctrl' }, S.el), cv.el, note, h('h4', null, 'The objects (on the heap)'), heap)));
  S.go(0);
};

DEMOS['g-refs'] = (root) => {
  const W = 760, H = 330, c = gCanvas(W, H, 'Variables on the stack point at objects on the heap');
  const lines = ['Player ranger = new Player("Ranger", 100, 5);', 'Enemy drone1 = new Enemy("Drone-1", 40, 50);', 'Enemy drone2 = new Enemy("Drone-2", 40, 50);', 'Enemy target = drone1;', 'target.takeDamage(25);', 'System.out.println(drone1.getHealth());'];
  const cv = codeView(lines.join('\n'), { small: true });
  const notes = ['new makes a Player object on the heap; ranger holds a reference (an arrow) to it.', 'A second object, with its own fields.', 'A third object. Two Enemy objects now exist.', 'No new: target gets a copy of the arrow. Both names point at the same Drone-1.', 'Through target we change the object…', '…so drone1 sees it too: it prints 15. Still only two Enemy objects.'];
  const note = h('p', { class: 'g-status' }), out = gOut();
  let k = 0, t = 0;
  const objs = [{ name: 'Player', label: 'Ranger', y: 40, f: () => ['name = "Ranger"', 'health = 100', 'ammo = 5'], at: 0 }, { name: 'Enemy', label: 'Drone-1', y: 140, f: () => ['type = "Drone-1"', 'health = ' + (k >= 4 ? 15 : 40), 'points = 50'], at: 1 }, { name: 'Enemy', label: 'Drone-2', y: 240, f: () => ['type = "Drone-2"', 'health = 40', 'points = 50'], at: 2 }];
  const vars = [['ranger', 0, 0], ['drone1', 1, 1], ['drone2', 2, 2], ['target', 1, 3]];
  function draw() {
    const g = c.g; g.fillStyle = rgb(16, 26, 44); g.fillRect(0, 0, W, H);
    g.fillStyle = '#9FB3CC'; g.font = '700 15px Georgia,serif'; g.fillText(gT('STACK: main()'), 30, 26); g.fillText(gT('HEAP: objects'), 400, 26);
    vars.forEach(([n, oi, at], i) => {
      if (k < at) return;
      const y = 60 + i * 64;
      g.fillStyle = 'rgba(255,255,255,.06)'; rr(g, 20, y - 22, 190, 44, 8);
      g.fillStyle = '#E7EEF8'; g.font = '600 16px "IBM Plex Mono",monospace'; g.fillText(n, 34, y + 6);
      const o = objs[oi], oy = o.y + 45;
      gArrow(g, 200, y, 392, oy, i === 3 ? rgb(255, 214, 90) : rgb(120, 200, 255), 2.5);
    });
    objs.forEach((o, i) => {
      if (k < o.at) return;
      const x = 400, y = o.y, hot = (k === 4 || k === 5) && i === 1;
      g.fillStyle = hot ? 'rgba(255,214,90,.16)' : 'rgba(255,255,255,.07)'; rr(g, x, y, 330, 86, 10);
      g.strokeStyle = hot ? rgb(255, 214, 90) : 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, 328, 84);
      g.fillStyle = '#E7EEF8'; g.font = '700 15px Georgia,serif'; g.fillText(o.label + ' : ' + o.name, x + 86, y + 24);
      g.font = '500 14px "IBM Plex Mono",monospace'; o.f().forEach((ln, j) => g.fillText(ln, x + 86, y + 46 + j * 17));
      g.save(); g.translate(x + 40, y + 60); g.scale(0.8, 0.8);
      if (i === 0) SPR.commando(g, 0, 10, false); else SPR.drone(g, 0, -20, t + i * 9);
      g.restore();
    });
  }
  const S = gSteps(lines.length, (i) => { k = i; cv.mark([i + 1]); note.textContent = notes[i]; out.set(i >= 5 ? '15' : ' '); draw(); }, { ms: 1800 });
  const run = gRun(c.cvs, () => { t++; }, draw);
  S.go(0);
  root.append(h('div', { class: 'g-split' }, h('div', null, gFrame('A variable holds an arrow to the object; = copies the arrow.', c, [run.btn])), gSide(h('div', { class: 'row tight g-ctrl' }, S.el), cv.el, note, out.el)));
};

/* ---------------- Chapter 3 ---------------- */
DEMOS['g-armory'] = (root) => {
  const W = 760, H = 330, c = gCanvas(W, H, 'Weapon constructors chaining into one another, and the weapons they build');
  const calls = ['new Weapon()', 'new Weapon("Rifle", 25)', 'new Weapon("Rocket", 80, 3)', 'new Weapon(rifle)'];
  const chains = [[0, 1, 2], [1, 2], [2], [3, 2]];
  const made = [['pistol', 'Pistol [10 dmg, 12 ammo]'], ['rifle', 'Rifle [25 dmg, 12 ammo]'], ['rocket', 'Rocket [80 dmg, 3 ammo]'], ['rifle', 'Rifle [25 dmg, 12 ammo] (a copy)']];
  const ctors = ['Weapon()', 'Weapon(String, int)', 'Weapon(String, int, int)', 'Weapon(Weapon other)'];
  const notes = ['No arguments: the default constructor. this("Pistol", 10) passes the work on…', 'this(name, damage, 12) adds a standard clip and passes it on…', 'Only the full constructor sets the fields. Every path ends here.', 'The copy constructor reads the other weapon and also chains to the full one.'];
  const cv = codeView(calls.map((x, i) => 'Weapon w' + (i + 1) + ' = ' + x + ';').join('\n'), { small: true });
  const note = h('p', { class: 'g-status' }), out = gOut();
  let k = 0, a = 0, t = 0;
  const nodeX = [30, 210, 420, 30], nodeY = [60, 60, 60, 160];
  function draw() {
    const g = c.g; g.fillStyle = rgb(16, 26, 44); g.fillRect(0, 0, W, H);
    ctors.forEach((nm, i) => {
      const on = chains[k].includes(i), cur = chains[k][Math.min(chains[k].length - 1, Math.floor(a / 40))] === i;
      g.fillStyle = cur ? 'rgba(255,214,90,.22)' : on ? 'rgba(120,200,255,.14)' : 'rgba(255,255,255,.05)';
      rr(g, nodeX[i], nodeY[i], i === 2 ? 300 : 170, 46, 8);
      g.fillStyle = '#E7EEF8'; g.font = '600 14px "IBM Plex Mono",monospace'; g.fillText(nm, nodeX[i] + 12, nodeY[i] + 28);
    });
    const ch = chains[k];
    for (let j = 0; j + 1 < ch.length; j++) {
      const f = ch[j], to = ch[j + 1];
      const x1 = nodeX[f] + (f === 2 ? 300 : 170), y1 = nodeY[f] + 23, x2 = nodeX[to], y2 = nodeY[to] + 23;
      if (a > j * 40) gArrow(g, f === 3 ? nodeX[f] + 170 : x1, y1, to === 2 && f === 3 ? nodeX[to] + 40 : x2, f === 3 ? nodeY[to] + 46 : y2, rgb(255, 214, 90), 3);
      if (a > j * 40 && a < j * 40 + 40) gTag(g, (x1 + x2) / 2, Math.min(y1, y2) - 14, 'this(…)', { align: 'center', fg: '#FFE08A' });
    }
    g.fillStyle = '#9FB3CC'; g.font = '700 15px Georgia,serif'; g.fillText(gT('WEAPON RACK'), 30, 250);
    for (let i = 0; i <= k; i++) {
      if (i === k && a < ch.length * 40) break;
      const x = 30 + i * 180;
      g.fillStyle = 'rgba(255,255,255,.06)'; rr(g, x, 262, 166, 58, 8);
      SPR.weapon(g, x + 30, 290, made[i][0]);
    }
  }
  const S = gSteps(calls.length, (i) => { k = i; a = 0; cv.mark([i + 1]); note.textContent = notes[i]; out.set(made.slice(0, i + 1).map((m) => '  crafted ' + m[1].replace(' (a copy)', '')).join('\n')); }, { ms: 2600 });
  const run = gRun(c.cvs, () => { t++; a = Math.min(a + 1, 400); }, draw);
  S.go(0);
  root.append(h('div', { class: 'g-split' }, gFrame('Four constructors, one place that sets the fields. Watch each call hop along the this(…) chain.', c, [run.btn]), gSide(h('div', { class: 'row tight g-ctrl' }, S.el), cv.el, note, out.el)));
};

DEMOS['g-overload'] = (root) => {
  const W = 760, H = 300, c = gCanvas(W, H, 'Three overloaded shoot methods: into the air, at the tank, and a burst at the drone');
  const cv = codeView('public void shoot() { … }                       // no target\npublic void shoot(String target) { … }          // one aimed shot\npublic void shoot(String target, int burst) { … } // several', { small: true, nums: false });
  const out = gOut();
  let ammo = 3, t = 0, queue = [], shots = [], log = [], hp = { Tank: 120, Drone: 30 };
  const fl = gFloats();
  function call(which) {
    if (queue.length || shots.length) return;
    cv.mark([which + 1]);
    if (which === 0) { log.push('ranger.shoot()'); queue.push({ to: 'air' }); }
    if (which === 1) { log.push('ranger.shoot("Tank")'); queue.push({ to: 'Tank' }); }
    if (which === 2) { log.push('ranger.shoot("Drone", 3)'); log.push('Ranger fires a burst of 3 at Drone'); for (let i = 0; i < 3; i++) queue.push({ to: 'Drone', wait: i * 26 }); }
    out.set(log.slice(-9).join('\n'));
  }
  function step() {
    t++; fl.step();
    queue.forEach((q) => { q.wait = (q.wait || 0) - 1; });
    const ready = queue.filter((q) => q.wait <= 0);
    ready.forEach((q) => {
      queue.splice(queue.indexOf(q), 1);
      if (ammo === 0) { fl.push({ x: 150, y: 200, text: 'click! empty', col: '#FF9A50' }); log.push('Ranger: click! The Rocket is empty'); out.set(log.slice(-9).join('\n')); return; }
      ammo--; shots.push({ x: 150, y: 220, to: q.to, vy: q.to === 'air' ? -3 : q.to === 'Drone' ? -1.1 : 0 });
      log.push(q.to === 'air' ? 'Ranger fires the Rocket into the air' : 'Ranger hits ' + q.to + ' for 80'); out.set(log.slice(-9).join('\n'));
    });
    shots.forEach((s) => {
      s.x += 8; s.y += s.vy;
      const tx = s.to === 'Tank' ? 560 : 640;
      if (s.to !== 'air' && s.x >= tx) { s.done = true; hp[s.to] = Math.max(0, hp[s.to] - 80); fl.push({ x: tx, y: s.y - 20, text: '-80', col: '#FF9A50' }); }
      if (s.y < -20 || s.x > W) s.done = true;
    });
    shots = shots.filter((s) => !s.done);
  }
  function draw() {
    const g = c.g; SPR.bg(g, W, H, 260, t);
    SPR.commando(g, 110, 260, shots.some((s) => s.x < 190), { noGun: true }); SPR.weapon(g, 112, 223, 'rocket');
    if (hp.Tank > 0) SPR.tank(g, 540, 260); else SPR.boom(g, 575, 240, 12);
    if (hp.Drone > 0) SPR.drone(g, 650, 150, t); else SPR.boom(g, 650, 150, 12);
    gTag(g, 575, 280, 'Tank ' + hp.Tank + ' HP', { align: 'center' }); gTag(g, 650, 180, 'Drone ' + hp.Drone + ' HP', { align: 'center' });
    shots.forEach((s) => { g.fillStyle = rgb(200, 60, 50); oval(g, s.x - 10, s.y - 5, 22, 10); g.fillStyle = rgb(255, 170, 60); oval(g, s.x - 22, s.y - 3, 12, 6); });
    gTag(g, 20, 26, 'Rocket · ' + ammo + ' ammo left', { font: '700 16px Georgia,serif', size: 16 });
    fl.draw(g);
  }
  const run = gRun(c.cvs, step, draw);
  root.append(h('div', { class: 'g-split' }, gFrame('Same name, different parameters: the arguments pick the method.', c,
    [run.btn, gBtn('shoot()', () => call(0)), gBtn('shoot("Tank")', () => call(1)), gBtn('shoot("Drone", 3)', () => call(2)), gBtn('Reset', () => { ammo = 3; hp = { Tank: 120, Drone: 30 }; log = []; shots = []; queue = []; fl.clear(); out.set(' '); cv.clearAll(); })]), gSide(cv.el, out.el)));
};

DEMOS['g-pass'] = (root) => {
  const W = 760, H = 300;
  const SC = {
    int: { label: 'Passing an int', lines: ['int ammo = 5;', 'refill(ammo);', '    ammo = 99;        // inside refill', 'System.out.println(ammo);'],
      notes: ['main has its own variable ammo = 5.', 'refill() gets a new variable holding a COPY of the value: 5.', 'It changes its copy to 99. main’s ammo is a different variable.', 'Back in main: still 5. Changing a primitive parameter never reaches the caller.'] },
    ref: { label: 'Passing a Weapon', lines: ['Weapon pistol = new Weapon();', 'refill(pistol);', '    w.addAmmo(10);    // inside refill', 'swap(pistol);', '    w = new Weapon("Water gun", 1, 1);', 'System.out.println(pistol);'],
      notes: ['pistol refers to a Weapon object with 12 ammo.', 'refill() gets a copy of the REFERENCE: w points at the same object.', 'Changing the object through w: the one and only pistol now has 22.', 'swap() also gets a copy of the reference…', '…and points its copy at a brand-new object. main’s pistol does not move.', 'Back in main: pistol is still the Pistol with 22 ammo.'] }
  };
  const t = tabs(Object.keys(SC).map((k) => ({ id: k, label: SC[k].label })), 'int', (id, el, reg) => {
    const P = SC[id], cv = codeView(P.lines.join('\n'), { small: true, nums: false }), note = h('p', { class: 'g-status' });
    const c = gCanvas(W, H, 'The caller’s variables and the method’s parameter');
    let k = 0;
    function frame(g, x, y, w, hh, title, on) { g.fillStyle = on ? 'rgba(120,200,255,.12)' : 'rgba(255,255,255,.05)'; rr(g, x, y, w, hh, 10); g.fillStyle = '#9FB3CC'; g.font = '700 14px Georgia,serif'; g.fillText(title, x + 12, y + 22); }
    function slot(g, x, y, name, val, hot) { g.fillStyle = hot ? 'rgba(255,214,90,.25)' : 'rgba(255,255,255,.08)'; rr(g, x, y, 170, 40, 6); g.fillStyle = '#E7EEF8'; g.font = '600 16px "IBM Plex Mono",monospace'; g.fillText(name + (val != null ? ' = ' + val : ''), x + 12, y + 26); }
    function draw() {
      const g = c.g; g.fillStyle = rgb(16, 26, 44); g.fillRect(0, 0, W, H);
      if (id === 'int') {
        frame(g, 20, 20, 230, 120, 'main()', true); slot(g, 40, 50, 'ammo', 5, k === 3);
        if (k === 1 || k === 2) { frame(g, 20, 160, 230, 120, 'refill(int ammo)', true); slot(g, 40, 190, 'ammo', k === 2 ? 99 : 5, k === 2); gArrow(g, 125, 92, 125, 188, rgb(255, 214, 90)); gTag(g, 140, 140, gT('copy of the value'), { fg: '#FFE08A' }); }
        SPR.commando(g, 470, 260, false); gTag(g, 470, 40, gT('Ranger’s ammo: 5'), { align: 'center', font: '700 16px Georgia,serif', size: 16 });
      } else {
        const ammo = k >= 2 ? 22 : 12;
        frame(g, 20, 20, 230, 120, 'main()', true); slot(g, 40, 50, 'pistol', null, k === 5);
        g.fillStyle = 'rgba(255,255,255,.07)'; rr(g, 470, 40, 260, 90, 10); g.fillStyle = '#E7EEF8'; g.font = '700 15px Georgia,serif'; g.fillText(gT('Weapon object'), 486, 64);
        g.font = '500 14px "IBM Plex Mono",monospace'; g.fillText('name = "Pistol"', 486, 86); g.fillText('ammo = ' + ammo, 486, 106); SPR.weapon(g, 660, 92, 'pistol');
        gArrow(g, 210, 70, 466, 80, rgb(120, 200, 255));
        if (k >= 1 && k <= 4) {
          const nm = k <= 2 ? 'refill(Weapon w)' : 'swap(Weapon w)';
          frame(g, 20, 160, 230, 120, nm, true); slot(g, 40, 190, 'w', null, k === 2 || k === 4);
          if (k === 4) { g.fillStyle = 'rgba(255,255,255,.07)'; rr(g, 470, 180, 260, 90, 10); g.fillStyle = '#E7EEF8'; g.font = '700 15px Georgia,serif'; g.fillText(gT('Weapon object (new)'), 486, 204); g.font = '500 14px "IBM Plex Mono",monospace'; g.fillText('name = "Water gun"', 486, 226); g.fillText('ammo = 1', 486, 246); SPR.weapon(g, 680, 236, 'water'); gArrow(g, 210, 210, 466, 220, rgb(255, 214, 90)); }
          else gArrow(g, 210, 210, 466, 110, rgb(255, 214, 90));
          gTag(g, 270, 150, gT('copy of the reference'), { fg: '#FFE08A' });
        }
      }
    }
    const S = gSteps(P.lines.length, (i) => { k = i; cv.mark([i + 1]); note.textContent = P.notes[i]; draw(); }, { ms: 2000 });
    reg(S.stop);
    el.append(h('div', { class: 'g-split' }, h('div', null, h('div', { class: 'g-scene', style: { '--ar': String(W / H) } }, c.cvs)), gSide(h('div', { class: 'row tight g-ctrl' }, S.el), cv.el, note)));
    S.go(0);
  });
  root.append(t.el);
};

/* ---------------- Chapter 4 ---------------- */
const FAMILY = {
  GameCharacter: { x: 380, y: 92, own: ['name', 'health', 'takeDamage()', 'isAlive()', 'describe()'], from: [] },
  Player: { x: 190, y: 220, own: ['score', 'shoot(Enemy)', 'shoot(Enemy, int)'], over: ['describe()'], from: ['GameCharacter'] },
  Enemy: { x: 570, y: 220, own: ['damage', 'attack()'], over: ['describe()'], from: ['GameCharacter'] },
  Drone: { x: 432, y: 350, own: [], over: ['attack()'], from: ['Enemy', 'GameCharacter'] },
  Tank: { x: 562, y: 350, own: ['armor', 'raiseShield()'], over: ['attack()', 'takeDamage()', 'describe()'], from: ['Enemy', 'GameCharacter'] },
  Sniper: { x: 692, y: 350, own: ['aim()'], over: ['attack()'], from: ['Enemy', 'GameCharacter'] }
};
DEMOS['g-family'] = (root) => {
  const W = 760, H = 380, c = gCanvas(W, H, 'The inheritance tree: GameCharacter at the top, Player and Enemy below it, Drone, Tank and Sniper under Enemy');
  let sel = 'Tank', t = 0;
  const panel = h('div', { class: 'g-members' });
  const parent = { Player: 'GameCharacter', Enemy: 'GameCharacter', Drone: 'Enemy', Tank: 'Enemy', Sniper: 'Enemy' };
  function members() {
    const N = FAMILY[sel];
    const col = (title, items, cls) => h('div', { class: 'g-mcol ' + cls }, h('h5', null, title), items.length ? h('ul', null, items.map((x) => h('li', null, h('code', null, x)))) : h('p', { class: 'muted small' }, '(nothing)'));
    /* what a class gets from one ancestor: that ancestor's members, minus anything a closer class replaced */
    const inh = (from) => FAMILY[from].own.concat(FAMILY[from].over || []).filter((m) => !(N.over || []).includes(m) && !(from === 'GameCharacter' && N.from.includes('Enemy') && FAMILY.Enemy.over.includes(m)));
    clear(panel).append(h('p', { class: 'g-status' }, sel === 'GameCharacter' ? 'GameCharacter is the root: everything below inherits from it.' : sel + ' extends ' + parent[sel] + '. It is ' + [sel].concat(N.from).map((c) => (/^[AEIOU]/.test(c) ? 'an ' : 'a ') + c).join(', which is ') + '.'),
      h('div', { class: 'g-mcols' },
        ...N.from.map((f) => col('Inherited from ' + f, inh(f), 'inh')),
        col(sel === 'GameCharacter' ? 'Its own members' : 'Added by ' + sel, N.own, 'own'),
        N.over ? col('Overridden (its own version)', N.over, 'over') : null));
  }
  function node(g, name) {
    const N = FAMILY[name], on = name === sel;
    g.fillStyle = on ? 'rgba(255,214,90,.2)' : 'rgba(255,255,255,.06)'; rr(g, N.x - 62, N.y - 72, 124, 92, 10);
    if (on) { g.strokeStyle = rgb(255, 214, 90); g.lineWidth = 2; g.strokeRect(N.x - 61, N.y - 71, 122, 90); }
    g.save(); g.translate(N.x, N.y - 6); g.scale(0.72, 0.72);
    if (name === 'GameCharacter') SPR.ghost(g, 0, 0); else if (name === 'Player') SPR.commando(g, -6, 0, false); else if (name === 'Enemy') SPR.enemyShape(g, 0, 0);
    else if (name === 'Drone') SPR.drone(g, 0, -34, t); else if (name === 'Tank') SPR.tank(g, -34, 0); else SPR.sniper(g, 10, 0, {});
    g.restore();
    g.fillStyle = '#E7EEF8'; g.font = '700 14px Georgia,serif'; g.textAlign = 'center'; g.fillText(name, N.x, N.y + 12); g.textAlign = 'left';
  }
  function draw() {
    const g = c.g; g.fillStyle = rgb(16, 26, 44); g.fillRect(0, 0, W, H);
    Object.keys(parent).forEach((k) => { const a = FAMILY[k], b = FAMILY[parent[k]]; gArrow(g, a.x, a.y - 72, b.x, b.y + 22, 'rgba(160,190,220,.7)', 2); });
    gTag(g, 22, 22, gT('arrows point to the superclass: "is a"'), { fg: '#BFD3EA' });
    Object.keys(FAMILY).forEach((k) => node(g, k));
  }
  c.cvs.addEventListener('click', (e) => {
    const r = c.cvs.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    Object.keys(FAMILY).forEach((k) => { const N = FAMILY[k]; if (Math.abs(x - N.x) < 62 && y > N.y - 72 && y < N.y + 20) { sel = k; pick.set(k, true); members(); draw(); } });
  });
  const pick = seg(Object.keys(FAMILY), sel, (v) => { sel = v; members(); draw(); });
  const run = gRun(c.cvs, () => { t++; }, draw);
  members();
  root.append(gFrame('Click a class to see what it inherits, adds and overrides.', c, [run.btn, pick.el], panel));
};

DEMOS['g-wave'] = (root) => {
  const W = 760, H = 320, c = gCanvas(W, H, 'A loop over the enemy wave: each enemy attacks in its own way');
  const cv = codeView('Enemy[] wave = { drone, tank, sniper };\nfor (Enemy e : wave) {\n    e.attack(ranger);\n}', { small: true, nums: false });
  const status = h('p', { class: 'g-status' }), out = gOut();
  const LEN = 150, kinds = ['Drone', 'Tank', 'Sniper'], dmg = [5, 20, 35];
  let t = 0, hp = 100, lines = [];
  const fl = gFloats();
  const lineFor = ['Drone-1 dives at Ranger! -5', 'Tank-1 fires a shell at Ranger! -20', 'Sniper-1 takes aim... headshot on Ranger! -35'];
  function step() {
    t++; fl.step();
    const f = t % (LEN * 3 + 90), i = Math.floor(f / LEN), p = f % LEN;
    if (f === 0) { hp = 100; lines = []; out.set(' '); }
    if (i < 3 && p === 100) { hp -= dmg[i]; fl.push({ x: 130, y: 180, text: '-' + dmg[i], col: '#FF8A7A' }); lines.push(lineFor[i]); out.set(lines.join('\n')); }
    if (i < 3 && p === 1) { cv.mark([3]); status.textContent = 'e refers to a ' + kinds[i] + ' object  →  ' + kinds[i] + '.attack() runs'; }
    if (i === 3 && p === 1) { cv.mark([2]); status.textContent = 'The loop is over. One line of code, three different attacks: that is polymorphism.'; }
  }
  function draw() {
    const g = c.g; SPR.bg(g, W, H, 280, t);
    const f = t % (LEN * 3 + 90), i = Math.floor(f / LEN), p = f % LEN;
    SPR.commando(g, 110, 280, false);
    g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(70, 190, 80, 8); g.fillStyle = rgb(220, 60, 60); g.fillRect(70, 190, Math.max(0, hp) * 0.8, 8);
    let dx = 520, dy = 120;
    if (i === 0) { const k = p < 100 ? p / 100 : Math.max(0, 1 - (p - 100) / 50); dx = 520 - k * 370; dy = 120 + k * 120; }
    SPR.drone(g, dx, dy, t);
    SPR.tank(g, 560, 280);
    SPR.sniper(g, 700, 280, { aim: i === 2 && p > 20 && p < 100 ? [120, 224] : null, firing: i === 2 && p >= 100 && p < 106 });
    if (i === 1 && p > 30 && p < 100) { const k = (p - 30) / 70; SPR.bullet(g, 545 - k * 410, 248, true); }
    if (i < 3) { const ex = [dx, 595, 700][i], ey = [dy - 40, 220, 210][i]; gTag(g, ex, ey, 'e', { align: 'center', fg: '#1b1200', bg: rgb(255, 214, 90) }); }
    fl.draw(g);
  }
  const run = gRun(c.cvs, step, draw);
  root.append(h('div', { class: 'g-split' }, gFrame('One Enemy[] loop; each object runs its own attack().', c, [run.btn]), gSide(cv.el, status, out.el)));
};

DEMOS['g-cast4'] = (root) => {
  const W = 760, H = 280, c = gCanvas(W, H, 'Casting an Enemy reference to Tank or Sniper');
  let ref = 1, target = 'Tank', check = true, t = 0, effect = null, msg = '';
  const kinds = ['Drone', 'Tank', 'Sniper'];
  const status = h('p', { class: 'g-status' });
  const code = codeView('', { small: true, nums: false });
  function src() {
    const call = target === 'Tank' ? 'raiseShield()' : 'aim()';
    // always the same four lines: without the check, lines 2 and 4 are switched off instead of removed
    return 'Enemy e = wave[' + ref + '];\nif (e instanceof ' + target + ') {\n    ((' + target + ') e).' + call + ';' + (check ? '' : '   // no check!') + '\n}';
  }
  function tryIt() {
    code.set(src());
    code.clearAll(); if (!check) code.mark([2, 4], 'off');
    const actual = kinds[ref], ok = actual === target;
    if (check && !ok) { msg = 'e instanceof ' + target + ' is false (it is a ' + actual + '), so the cast is skipped safely.'; effect = null; code.mark([2]); }
    else if (!ok) { msg = 'ClassCastException: class ' + actual + ' cannot be cast to class ' + target; effect = 'crash'; code.mark([3], 'cur'); }
    else { msg = 'It really is a ' + target + ', so the cast works and ' + (target === 'Tank' ? 'raiseShield()' : 'aim()') + ' runs.'; effect = target; code.mark([3], 'ok'); }
    status.textContent = msg; t = 0;
  }
  const r = seg(kinds.map((k, i) => ({ v: i, l: 'wave[' + i + ']' })), ref, (v) => { ref = v; tryIt(); });
  const tg = seg([{ v: 'Tank', l: '(Tank) e' }, { v: 'Sniper', l: '(Sniper) e' }], target, (v) => { target = v; tryIt(); });
  const ck = tsw('check with instanceof first', 1, (v) => { check = !!v; tryIt(); });
  function draw() {
    const g = c.g; SPR.bg(g, W, H, 240, t);
    const xs = [180, 380, 600];
    SPR.drone(g, xs[0], 150, t); SPR.tank(g, xs[1] - 35, 240, { shield: effect === 'Tank' && ref === 1 }); SPR.sniper(g, xs[2], 240, { aim: effect === 'Sniper' && ref === 2 ? [40, 200] : null });
    kinds.forEach((k, i) => gTag(g, xs[i], 268, 'wave[' + i + '] : ' + k, { align: 'center', border: i === ref ? rgb(255, 214, 90) : null }));
    if (effect === 'crash') { g.fillStyle = 'rgba(160,20,20,.55)'; g.fillRect(0, 0, W, 60); g.fillStyle = '#fff'; g.font = '700 18px Georgia,serif'; g.fillText(gT('ClassCastException: the program stops here'), 20, 36); }
  }
  const run = gRun(c.cvs, () => { t++; }, draw);
  tryIt();
  root.append(h('div', { class: 'g-split' }, gFrame('Turn the check off and cast the wrong enemy to see the crash.', c, [run.btn, r.el, tg.el, ck.el]), gSide(code.el, status)));
};

/* ---------------- Chapter 5 ---------------- */
DEMOS['g-abstract'] = (root) => {
  const W = 760, H = 320, c = gCanvas(W, H, 'Concrete game objects moving on a 20-cell map; an abstract GameObject cannot be created');
  const CELL = 34, X0 = 40;
  let t = 0;
  const out = gOut();
  const start = { P: 1, '+': 4, D: 15 };
  function state(tick) { return { P: start.P + tick, '+': 4, D: start.D - tick }; }
  function rowText(st) { const r = '....................'.split(''); r[st['+']] = '+'; r[st.D] = 'D'; r[st.P] = 'P'; return '|' + r.join('') + '|'; }
  function draw() {
    const g = c.g; SPR.bg(g, W, H, 250, t);
    const f = t % 420, tick = Math.min(3, Math.floor(f / 90)), mv = Math.min(1, (f % 90) / 30);
    const prev = state(Math.max(0, tick - 1)), cur = state(tick), k = tick === 0 ? 1 : mv;
    const at = (key) => prev[key] + (cur[key] - prev[key]) * k;
    g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 20; i++) g.fillRect(X0 + i * CELL + 1, 254, CELL - 2, 10);
    g.fillStyle = '#9FB3CC'; g.font = '500 12px "IBM Plex Mono",monospace'; for (let i = 0; i < 20; i += 5) g.fillText('x=' + i, X0 + i * CELL, 282);
    SPR.healthPack(g, X0 + 4 * CELL + 3, 228);
    SPR.drone(g, X0 + at('D') * CELL + CELL / 2, 200, t);
    SPR.commando(g, X0 + at('P') * CELL + CELL / 2, 250, false, { walk: tick > 0 && mv < 1 ? t / 3 : 0 });
    gTag(g, 24, 26, (tick === 0 ? 'start ' : 'tick ' + tick) + '   o.update() for every GameObject', { font: '600 15px "IBM Plex Mono",monospace', size: 15 });
    g.save(); g.globalAlpha = 0.9; SPR.ghost(g, 690, 120); g.restore();
    g.save(); g.translate(690, 96); g.rotate(-0.22); g.strokeStyle = rgb(255, 90, 90); g.lineWidth = 3; g.strokeRect(-62, -16, 124, 32); g.fillStyle = rgb(255, 90, 90); g.font = '800 15px Georgia,serif'; g.textAlign = 'center'; g.fillText('ABSTRACT', 0, 6); g.restore();
    gTag(g, 690, 152, 'new GameObject() ✗', { align: 'center', fg: '#FFB0A8' });
    const lines = ['start   ' + rowText(state(0))]; for (let i = 1; i <= tick; i++) lines.push('tick ' + i + '  ' + rowText(state(i)));
    if (t % 6 === 0) out.set(lines.join('\n'));
  }
  const run = gRun(c.cvs, () => { t++; }, draw);
  root.append(h('div', { class: 'g-split' }, gFrame('One GameObject[]; each class fills in update() and symbol() its own way.', c, [run.btn]), gSide(h('h4', null, 'World.java prints'), out.el)));
};

DEMOS['g-badges'] = (root) => {
  const W = 760, H = 300, c = gCanvas(W, H, 'Game objects with interface badges; choosing an interface highlights the objects that implement it');
  const OB = [
    { n: 'Player', x: 120, is: ['GameObject', 'Damageable', 'Shooter'] },
    { n: 'Drone', x: 320, is: ['GameObject', 'Damageable', 'Shooter'] },
    { n: 'HealthPack', x: 500, is: ['GameObject', 'Collectible'] },
    { n: 'Bullet', x: 660, is: ['GameObject'] }];
  const COL = { GameObject: rgb(150, 170, 195), Damageable: rgb(255, 120, 110), Shooter: rgb(255, 214, 90), Collectible: rgb(120, 220, 150) };
  const CODE = { GameObject: 'for (GameObject o : world) {\n    o.update();\n}', Damageable: 'for (Damageable d : targets) {\n    d.takeDamage(20);\n}', Shooter: 'for (Shooter s : shooters) {\n    Bullet b = s.shoot();\n}', Collectible: 'Collectible c = pack;\nc.collectBy(ranger);' };
  let type = 'Shooter', t = 0, fx = [];
  const fl = gFloats();
  const cv = codeView(CODE[type], { small: true, nums: false });
  const status = h('p', { class: 'g-status' });
  function go(v) {
    type = v; cv.set(CODE[v]); t = 0; fx = []; fl.clear();
    const fits = OB.filter((o) => o.is.includes(v)).map((o) => o.n);
    status.textContent = v + ' fits: ' + fits.join(', ') + (fits.length < OB.length ? '.  The others do not implement it, so they cannot go in this array.' : '.  Every object here extends GameObject.');
    OB.forEach((o) => {
      if (!o.is.includes(v)) return;
      if (v === 'Shooter') fx.push({ kind: 'shot', x: o.x + (o.n === 'Player' ? 40 : -30), dir: o.n === 'Player' ? 1 : -1 });
      if (v === 'Damageable') fl.push({ x: o.x, y: 120, text: '-20', col: '#FF8A7A' });
      if (v === 'Collectible') fx.push({ kind: 'pack', k: 0 });
      if (v === 'GameObject') fx.push({ kind: 'nudge' });
    });
  }
  const pick = seg(Object.keys(COL), type, go);
  function draw() {
    const g = c.g; SPR.bg(g, W, H, 230, t);
    OB.forEach((o) => {
      const fit = o.is.includes(type);
      g.save(); g.globalAlpha = fit ? 1 : 0.28;
      const nud = type === 'GameObject' ? Math.min(1, t / 40) : 0;
      if (o.n === 'Player') SPR.commando(g, o.x + nud * 20, 230, type === 'Shooter' && t < 6);
      if (o.n === 'Drone') SPR.drone(g, o.x - nud * 20, 170, t, { hit: type === 'Damageable' && t < 10 });
      if (o.n === 'HealthPack' && !(type === 'Collectible' && t > 60)) { const k = type === 'Collectible' ? Math.min(1, t / 60) : 0; SPR.healthPack(g, o.x - 14 - k * 380, 206 - k * 30); }
      if (o.n === 'Bullet') SPR.bullet(g, o.x + nud * 60, 200, false);
      g.restore();
      g.fillStyle = '#E7EEF8'; g.font = '700 14px Georgia,serif'; g.textAlign = 'center'; g.fillText(o.n, o.x, 252); g.textAlign = 'left';
      let bx = o.x - (o.is.length * 30) / 2;
      o.is.forEach((b) => { g.fillStyle = COL[b]; g.globalAlpha = fit || b === type ? 1 : 0.35; rr(g, bx, 262, 26, 18, 5); g.globalAlpha = 1; g.fillStyle = '#10151f'; g.font = '800 11px Georgia,serif'; g.fillText(b[0], bx + 9, 275); bx += 30; });
    });
    fx.forEach((f) => { if (f.kind === 'shot') { f.x += 7 * f.dir; SPR.bullet(g, f.x, 190, f.dir < 0); } });
    gTag(g, 18, 22, 'G = GameObject   D = Damageable   S = Shooter   C = Collectible', { fg: '#BFD3EA' });
    fl.draw(g);
  }
  const run = gRun(c.cvs, () => { t++; fl.step(); }, draw);
  go(type);
  root.append(h('div', { class: 'g-split' }, gFrame('Pick an interface to see every object that has that ability.', c, [run.btn, pick.el]), gSide(cv.el, status)));
};
