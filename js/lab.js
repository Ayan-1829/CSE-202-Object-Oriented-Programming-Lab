/* ===================== lab.js : lab-deck widgets ===================== */
/* Load after page.js and before mountPage():
   - .codeview      tabbed source files with Copy and Download (raw text is kept before highlighting)
   - .runbox        "Run program" console that prints the expected output line by line
   - .chk-list      requirement checklists, ticks saved in this browser
   - DEMOS['lab9-paint'] and DEMOS['lab10-balls']: browser versions of the Swing programs */

(function () {
  /* ---------- tabbed source viewer ---------- */
  document.querySelectorAll('.codeview').forEach((view) => {
    const pres = Array.from(view.querySelectorAll('pre.code[data-file]'));
    const raw = pres.map((p) => p.textContent.replace(/^\n/, ''));
    const tabsBar = h('div', { class: 'cv-tabs', role: 'tablist' });
    const note = h('span', { class: 'cv-note', role: 'status' });
    let cur = 0;
    const btns = pres.map((p, i) => h('button', { type: 'button', role: 'tab', onclick: () => show(i) }, p.getAttribute('data-file')));
    btns.forEach((b) => tabsBar.append(b));
    const copyBtn = h('button', { type: 'button', class: 'btn sm', onclick: copy }, 'Copy');
    const dlBtn = h('button', { type: 'button', class: 'btn sm', onclick: download }, 'Download');
    const bar = h('div', { class: 'cv-bar' }, tabsBar, h('div', { class: 'cv-actions' }, note, copyBtn, dlBtn));
    view.insertBefore(bar, view.firstChild);
    function show(i) {
      cur = i;
      pres.forEach((p, k) => { p.hidden = k !== i; });
      btns.forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', String(k === i)); });
      note.textContent = raw[i].split('\n').length + ' lines';
    }
    function flash(t) { note.textContent = t; setTimeout(() => show(cur), 1600); }
    function copy() {
      const t = raw[cur];
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(() => flash('Copied'), () => flash('Copy failed'));
      else flash('Copy not available');
    }
    function download() {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([raw[cur] + '\n'], { type: 'text/x-java' }));
      a.download = pres[cur].getAttribute('data-file');
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      flash('Downloaded ' + a.download);
    }
    show(0);
  });

  /* ---------- "Run program" console ---------- */
  document.querySelectorAll('.runbox').forEach((box) => {
    const src = box.querySelector('pre.run-src');
    const lines = (src ? src.textContent : '').replace(/^\n/, '').split('\n');
    const cons = consoleEl('Console · ' + (box.getAttribute('data-cmd') || 'java'));
    const body = cons.el.querySelector('.console-body');
    body.classList.add('run-body');
    let timer = null, k = 0;
    const runBtn = h('button', { type: 'button', class: 'btn pri sm', onclick: run }, '▶ Run program');
    const allBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => { stop(); k = lines.length; paint(); } }, 'Show all');
    const clrBtn = h('button', { type: 'button', class: 'btn sm', onclick: () => { stop(); k = 0; paint(); } }, 'Clear');
    box.append(h('div', { class: 'row tight' }, runBtn, allBtn, clrBtn), cons.el);
    function paint() {
      body.textContent = k ? lines.slice(0, k).join('\n') : '$ ' + (box.getAttribute('data-cmd') || 'java Main') + '\n(press Run to see the expected output)';
      body.scrollTop = body.scrollHeight;
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function run() {
      stop(); k = 0; paint();
      const step = Math.max(1, Math.round(lines.length / 60));
      timer = setInterval(() => { k = Math.min(lines.length, k + step); paint(); if (k >= lines.length) stop(); }, 45);
    }
    paint();
  });

  /* ---------- checklists saved in this browser ---------- */
  document.querySelectorAll('.chk-list input[data-key]').forEach((c) => {
    const k = 'oop202-' + c.getAttribute('data-key');
    c.checked = lsGet(k) === '1';
    c.addEventListener('change', () => {
      lsSet(k, c.checked ? '1' : '0');
      const list = c.closest('.chk-list'), out = list && list.parentNode.querySelector('.chk-count');
      if (out) countOf(list, out);
    });
  });
  function countOf(list, out) {
    const all = list.querySelectorAll('input'), done = list.querySelectorAll('input:checked');
    out.textContent = done.length + ' / ' + all.length + ' done';
    out.classList.toggle('all', done.length === all.length);
  }
  document.querySelectorAll('.chk-count').forEach((out) => { const list = out.parentNode.querySelector('.chk-list'); if (list) countOf(list, out); });
})();

/* ---------- Lab 9: the Swing drawing application, in the browser ---------- */
DEMOS['lab9-paint'] = (root) => {
  const W = 760, H = 380;
  const COLOURS = { Blue: '#0000FF', Red: '#FF0000', Green: '#00FF00', Yellow: '#FFFF00', Orange: '#FFA500', Purple: '#800080' };
  const shapes = [];
  let colour = 'Blue';
  const cvs = h('canvas', { width: W, height: H, class: 'anim-canvas lab-canvas', 'aria-label': 'Drawing panel with rectangles and circles' });
  const g = cvs.getContext ? cvs.getContext('2d') : null;
  const status = h('div', { class: 'swing-status' });
  const pick = selectEl(Object.keys(COLOURS), colour, (v) => { colour = v; });
  const btn = (label, fn) => h('button', { type: 'button', class: 'swing-btn', onclick: fn }, label);
  const frame = h('div', { class: 'swing-frame' },
    h('div', { class: 'swing-title' }, h('i'), h('i'), h('i'), h('span', null, 'Drawing Application')),
    h('div', { class: 'swing-body' },
      h('div', { class: 'swing-north' }, 'Drawing Application'),
      cvs,
      h('div', { class: 'swing-south' }, h('span', null, 'Colour:'), pick,
        btn('Add Rectangle', () => { shapes.push({ t: 'r', x: Math.random() * (W - 110), y: Math.random() * (H - 90), c: COLOURS[colour] }); draw(); }),
        btn('Add Circle', () => { shapes.push({ t: 'c', x: 60 + Math.random() * (W - 120), y: 60 + Math.random() * (H - 120), c: COLOURS[colour] }); draw(); }),
        btn('Clear All', () => { shapes.length = 0; draw(); })),
      status));
  root.append(demoBox('Run the Lab 9 program in the browser', 'The same layout as DrawingApp: BorderLayout with the title in NORTH, the DrawingPanel in CENTER and the controls in SOUTH. Each button adds an object to the shapes list and calls repaint().', frame));
  function draw() {
    if (g) {
      g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgb(220,220,220)'; g.lineWidth = 1;
      for (let x = 0.5; x < W; x += 50) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = 0.5; y < H; y += 50) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      shapes.forEach((s) => {
        g.fillStyle = s.c; g.strokeStyle = '#000'; g.lineWidth = 1.5; g.beginPath();
        if (s.t === 'r') g.rect(s.x, s.y, 100, 80); else g.arc(s.x, s.y, 50, 0, Math.PI * 2);
        g.fill(); g.stroke();
      });
    }
    status.textContent = 'Ready. Shapes: ' + shapes.length;
  }
  draw();
};

/* ---------- Lab 10: bouncing balls with Start, Pause and Reset ---------- */
DEMOS['lab10-balls'] = (root) => {
  const W = 760, H = 380;
  const START = () => [
    { x: 100, y: 100, vx: 3.0, vy: 2.0, r: 15, c: '#FF0000' },
    { x: 300, y: 150, vx: -2.5, vy: 3.5, r: 15, c: '#0000FF' },
    { x: 200, y: 300, vx: 2.0, vy: -2.0, r: 15, c: '#00FF00' }];
  let balls = START(), running = false, raf = 0, frames = 0, fpsT = performance.now(), fps = 0;
  const cvs = h('canvas', { width: W, height: H, class: 'anim-canvas lab-canvas', 'aria-label': 'Bouncing balls animation' });
  const g = cvs.getContext ? cvs.getContext('2d') : null;
  const status = h('div', { class: 'swing-status' });
  const btn = (label, fn) => h('button', { type: 'button', class: 'swing-btn', onclick: fn }, label);
  const frame = h('div', { class: 'swing-frame' },
    h('div', { class: 'swing-title' }, h('i'), h('i'), h('i'), h('span', null, 'Bouncing Balls Animation')),
    h('div', { class: 'swing-body' },
      h('div', { class: 'swing-north' }, 'Bouncing Balls Animation'),
      cvs,
      h('div', { class: 'swing-south' },
        btn('Start', () => { running = true; say('Running'); }),
        btn('Pause', () => { running = false; say('Paused'); }),
        btn('Reset', () => { running = false; balls = START(); say('Reset'); draw(); })),
      status));
  root.append(demoBox('Run the Lab 10 program in the browser', 'One loop per frame: update every ball (walls reverse a velocity, colliding balls swap velocities), then draw the whole frame.', frame));
  function say(s) { status.textContent = 'Status: ' + s + ' | Balls: ' + balls.length; }
  function update() {
    balls.forEach((b) => {
      b.x += b.vx; b.y += b.vy;
      if (b.x - b.r < 0 || b.x + b.r > W) { b.vx = -b.vx; b.x = Math.max(b.r, Math.min(W - b.r, b.x)); }
      if (b.y - b.r < 0 || b.y + b.r > H) { b.vy = -b.vy; b.y = Math.max(b.r, Math.min(H - b.r, b.y)); }
    });
    for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i], b = balls[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) <= a.r + b.r) { [a.vx, b.vx] = [b.vx, a.vx]; [a.vy, b.vy] = [b.vy, a.vy]; }
    }
  }
  function draw() {
    if (!g) return;
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgb(220,220,220)'; g.lineWidth = 1;
    for (let x = 0.5; x < W; x += 50) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 0.5; y < H; y += 50) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    balls.forEach((b) => { g.fillStyle = b.c; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2); g.fill(); g.stroke(); });
    g.fillStyle = '#000'; g.font = '16px ui-monospace, monospace';
    g.fillText('Balls: ' + balls.length + ' | ' + (running ? 'Running' : 'Paused') + ' | ' + fps + ' FPS', 10, H - 10);
  }
  function loop(t) {
    frames++;
    if (t - fpsT >= 1000) { fps = frames; frames = 0; fpsT = t; }
    if (running) update();
    draw();
    if (document.body.contains(cvs)) raf = requestAnimationFrame(loop);
  }
  if (typeof App !== 'undefined' && App.onCleanup) App.onCleanup(() => cancelAnimationFrame(raf));
  say('Initialized');
  raf = requestAnimationFrame(loop);
};

/* ---------- Lab 1: installation guides (JDK, NetBeans, first project) ----------
   One tab per operating system: direct download buttons, a YouTube link, the steps,
   and a real screenshot of the official download page where one is available. */
(function () {
  const YT = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  const NB = 'https://github.com/Friends-of-Apache-NetBeans/netbeans-installers/releases/download/nb31/';
  const NBI = 'https://installers.friendsofapachenetbeans.org/';
  const VERIFY = 'Optional check: open a terminal (Windows: <b>Command Prompt</b>) and type <code>java -version</code>. A version number means it worked.';
  const NBSHOT = (f, t) => ['../img/setup/nb-' + f + '.jpg', 'Official installers page (netbeans.apache.org → Download → Installers): ' + t];

  const ORA = 'https://www.oracle.com/java/technologies/downloads/#java25';
  const GUIDES = {
    jdk: {
      win: { label: 'Windows', video: YT('install oracle jdk 25 windows 11'),
        dl: [['JDK 25 · Windows x64 Installer (.exe)', 'https://download.oracle.com/java/25/latest/jdk-25_windows-x64_bin.exe'], ['Open oracle.com/java', ORA]],
        shot: ['../img/setup/jdk-windows.jpg', 'oracle.com/java/technologies/downloads: <b>1</b> JDK 25 → <b>2</b> Windows → <b>3</b> the <b>x64 Installer</b> link'],
        steps: ['Click the <b>.exe</b> download button above, or follow the numbered marks on the official page (screenshot).',
          'Open the downloaded <code>jdk-25_windows-x64_bin.exe</code> and click <b>Yes</b> when Windows asks for permission.',
          'In the installer click <b>Next</b>, keep the folder, click <b>Next</b> again, then <b>Close</b>.',
          VERIFY] },
      mac: { label: 'macOS', video: YT('install oracle jdk 25 mac dmg'),
        dl: [['JDK 25 · Apple M-series (.dmg)', 'https://download.oracle.com/java/25/latest/jdk-25_macos-aarch64_bin.dmg'], ['JDK 25 · Intel Mac (.dmg)', 'https://download.oracle.com/java/25/latest/jdk-25_macos-x64_bin.dmg'], ['Open oracle.com/java', ORA]],
        shot: ['../img/setup/jdk-macos.jpg', 'oracle.com/java/technologies/downloads: <b>1</b> JDK 25 → <b>2</b> macOS → <b>3</b> the <b>DMG Installer</b> for your Mac'],
        steps: ['Not sure which Mac? Apple menu → <b>About This Mac</b>: “Apple M…” = M-series (ARM64), “Intel” = Intel (x64).',
          'Click the matching <b>.dmg</b> download button above (or mark <b>3</b> in the screenshot).',
          'Open the .dmg, then double-click the <b>JDK 25.pkg</b> inside it.',
          'Click <b>Continue</b> → <b>Install</b>, enter your password, then <b>Close</b>.', VERIFY] },
      linux: { label: 'Linux', video: YT('install oracle jdk 25 ubuntu deb'),
        dl: [['JDK 25 · Ubuntu/Debian x64 (.deb)', 'https://download.oracle.com/java/25/latest/jdk-25_linux-x64_bin.deb'], ['JDK 25 · Fedora x64 (.rpm)', 'https://download.oracle.com/java/25/latest/jdk-25_linux-x64_bin.rpm'], ['Open oracle.com/java', ORA]],
        shot: ['../img/setup/jdk-linux.jpg', 'oracle.com/java/technologies/downloads: <b>1</b> JDK 25 → <b>2</b> Linux → <b>3</b> the <b>Debian</b> or <b>RPM</b> package'],
        steps: ['Click the <b>.deb</b> (Ubuntu, Mint, Debian) or <b>.rpm</b> (Fedora) download button above.',
          'Double-click the downloaded file. It opens in <b>App Center</b> / <b>Software</b>: click <b>Install</b> and enter your password.',
          VERIFY] },
    },
    nb: {
      win: { label: 'Windows', video: YT('install apache netbeans windows 11'),
        dl: [['NetBeans 31 · Windows (.exe)', NB + 'Apache-NetBeans-31.exe'], ['Latest release', NBI]], shot: NBSHOT('windows', 'click the marked <b>Windows</b> button'),
        steps: ['Click the <b>.exe</b> download button above (mark <b>1</b> in the screenshot). The installer brings its own JDK for the IDE.',
          'Run it, accept the licence and keep the default folders.',
          'Click <b>Install</b>, wait, then <b>Finish</b>.',
          'Start <b>Apache NetBeans</b> from the Start menu.'] },
      mac: { label: 'macOS', video: YT('install apache netbeans mac'),
        dl: [['NetBeans 31 · Apple M-series (.pkg)', NB + 'Apache-NetBeans-31-arm64.pkg'], ['NetBeans 31 · Intel Mac (.pkg)', NB + 'Apache-NetBeans-31-x86_64.pkg']], shot: NBSHOT('macos', 'the marked button for your Mac'),
        steps: ['Click the matching <b>.pkg</b> download button above.',
          'Double-click it in Downloads: <b>Continue</b> → <b>Agree</b> → <b>Install</b>, and enter your password.',
          'Open <b>Applications → Apache NetBeans</b>. If macOS blocks it, right-click the app → <b>Open</b>.'] },
      linux: { label: 'Linux', video: YT('install apache netbeans ubuntu'),
        dl: [['NetBeans 31 · Ubuntu/Debian (.deb)', NB + 'apache-netbeans_31-1_amd64.deb'], ['NetBeans 31 · Fedora (.rpm)', NB + 'apache-netbeans-31-0.x86_64.rpm']], shot: NBSHOT('linux', '<b>.deb</b> for Ubuntu/Debian/Mint, <b>.rpm</b> for Fedora'),
        steps: ['Click the <b>.deb</b> or <b>.rpm</b> download button above.',
          'Double-click the file and click <b>Install</b> in App Center / Software.',
          'Start <b>Apache NetBeans</b> from the app menu. The first start takes a minute.'] },
    },
    proj: {
      all: { label: 'Any OS', video: YT('netbeans create first java project hello world'),
        steps: ['<b>File → New Project…</b> → <i>Java with Ant</i> → <i>Java Application</i> → <b>Next</b>.',
          'Project name <b>Lab1</b>. Tick <b>Create Main Class</b> and type <code>Lab1Demo</code>. Click <b>Finish</b>.',
          'Type your code inside <code>main</code>. The class name must match the file name <b>Lab1Demo.java</b>.',
          'Click <b>▶ Run Project</b> (or press <kbd>F6</kbd>). The result appears in the <b>Output</b> window at the bottom.',
          'For later labs with several classes: right-click the package → <b>New → Java Class…</b>, one file per class.'] },
    },
  };

  const guess = () => { const p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || ''; return /mac/i.test(p) ? 'mac' : /linux|x11/i.test(p) ? 'linux' : 'win'; };

  document.querySelectorAll('.os-setup[data-setup]').forEach((root) => {
    const g = GUIDES[root.getAttribute('data-setup')];
    if (!g) return;
    const keys = Object.keys(g);
    let os = keys.includes(guess()) ? guess() : keys[0];
    const tabs = h('div', { class: 'os-tabs', role: 'tablist' });
    const yt = h('a', { class: 'btn sm yt', target: '_blank', rel: 'noopener' }, '▶ Watch on YouTube');
    const dls = h('div', { class: 'os-dl' });
    const body = h('div', { class: 'os-grid' });
    const btns = keys.map((k) => h('button', { type: 'button', role: 'tab', class: 'os-tab', onclick: () => { os = k; show(); } }, g[k].label));
    if (keys.length > 1) btns.forEach((b) => tabs.append(b));
    root.append(h('div', { class: 'os-bar' }, tabs, yt), dls, body);
    function show() {
      const o = g[os];
      btns.forEach((b, k) => { b.classList.toggle('on', keys[k] === os); b.setAttribute('aria-selected', String(keys[k] === os)); });
      yt.href = o.video;
      dls.innerHTML = ''; dls.hidden = !o.dl;
      (o.dl || []).forEach(([t, u], k) => dls.append(h('a', { class: 'btn sm' + (k === 0 ? ' pri' : ''), href: u, target: '_blank', rel: 'noopener' }, '⬇ ' + t)));
      body.classList.toggle('one', !o.shot);
      body.innerHTML = '<ol class="os-steps">' + o.steps.map((t) => '<li>' + t + '</li>').join('') + '</ol>'
        + (o.shot ? '<figure class="os-shot"><button type="button" class="os-zoom" title="Click to enlarge"><img src="' + o.shot[0] + '" alt="Screenshot of the official download page with the steps marked" loading="lazy"></button><figcaption>' + o.shot[1] + ' · <i>click to enlarge</i></figcaption></figure>' : '');
      const z = body.querySelector('.os-zoom');
      if (z) z.onclick = () => {
        const ov = h('div', { class: 'os-lightbox', role: 'dialog', 'aria-label': 'Enlarged screenshot', tabindex: '-1' });
        ov.innerHTML = '<img src="' + o.shot[0] + '" alt="">';
        const close = (e) => { if (e && e.type === 'keydown' && e.key !== 'Escape') return; ov.remove(); document.removeEventListener('keydown', close, true); };
        ov.onclick = () => close();
        document.addEventListener('keydown', close, true);
        document.body.append(ov); ov.focus();
      };
    }
    show();
  });
})();
