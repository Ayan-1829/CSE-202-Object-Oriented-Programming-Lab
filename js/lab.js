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

/* ---------- Lab 1: click-through installation guides (JDK, NetBeans, first project) ----------
   Each guide has one tab per operating system. Every step pairs an instruction with a sketch of
   the window you will see; the highlighted control is the one to click. */
(function () {
  const YT = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
  const B = (t) => '<span class="mk-btn">' + t + '</span>';
  const GO = (t) => '<span class="mk-btn go">' + t + '</span>';
  const CHK = (t, on) => '<div class="mk-chk' + (on ? ' on' : '') + '"><i></i>' + t + '</div>';
  const FLD = (l, v) => '<div class="mk-fld"><span>' + l + '</span><b>' + v + '</b></div>';
  const FOOT = (...b) => '<div class="mk-foot">' + b.join('') + '</div>';
  const TERM = (cmd, out) => ({ k: 'term', title: 'Terminal', body: '<span class="mk-p">$</span> ' + cmd + '\n' + out });
  const VERIFY = 'java -version', VOUT = 'openjdk version "21.0.4" 2024-07-16 LTS\nOpenJDK Runtime Environment Temurin-21.0.4+7';

  const GUIDES = {
    jdk: {
      win: { label: 'Windows', video: YT('install java jdk 21 windows 11 adoptium temurin'), steps: [
        ['Open <b>adoptium.net</b> in your browser. It detects Windows: click the big download button to get the <b>.msi</b> installer.',
          { k: 'browser', url: 'adoptium.net', body: '<h4>Eclipse Temurin™</h4><p>Latest LTS Release</p>' + GO('⬇ Latest LTS Release — JDK 21, Windows x64') + '<p class="mk-dim">Other platforms and versions</p>' }],
        ['Open the downloaded file from the browser’s download list. The setup wizard starts: click <b>Next</b>.',
          { k: 'wiz', title: 'Eclipse Temurin JDK Setup', body: '<h4>Welcome to the Eclipse Temurin JDK Setup Wizard</h4><p>The wizard will install the JDK on your computer.</p>' + FOOT(B('Back'), GO('Next'), B('Cancel')) }],
        ['On <b>Custom Setup</b>, click the icon next to <b>Set JAVA_HOME variable</b> and choose <i>Will be installed on local hard drive</i>. Keep <b>Add to PATH</b>. Click Next.',
          { k: 'wiz', title: 'Eclipse Temurin JDK Setup', body: '<h4>Custom Setup</h4>' + CHK('Add to PATH', 1) + CHK('Associate .jar', 1) + '<div class="mk-chk go"><i></i>Set JAVA_HOME variable</div>' + CHK('JavaSoft (Oracle) registry keys', 0) + FOOT(B('Back'), GO('Next'), B('Cancel')) }],
        ['Click <b>Install</b>. Windows asks “Do you want to allow this app to make changes?”: click <b>Yes</b>.',
          { k: 'wiz', title: 'Eclipse Temurin JDK Setup', body: '<h4>Ready to install Eclipse Temurin JDK</h4><p>Click Install to begin the installation.</p>' + FOOT(B('Back'), GO('Install'), B('Cancel')) }],
        ['When the bar is full, click <b>Finish</b>. The JDK is installed.',
          { k: 'wiz', title: 'Eclipse Temurin JDK Setup', body: '<h4>Completed the Eclipse Temurin JDK Setup Wizard</h4><div class="mk-bar"><i></i></div>' + FOOT(B('Back'), GO('Finish'), B('Cancel')) }],
        ['Optional check: press <kbd>Win</kbd>, type <b>cmd</b>, open Command Prompt and type <code>java -version</code>. A version number means it worked.',
          TERM(VERIFY, VOUT)]] },
      mac: { label: 'macOS', video: YT('install java jdk 21 mac os temurin pkg'), steps: [
        ['Open <b>adoptium.net</b>. Choose the <b>.pkg</b> for your Mac: <b>aarch64</b> for Apple M1–M4, <b>x64</b> for Intel (Apple menu → About This Mac).',
          { k: 'browser', url: 'adoptium.net/temurin/releases', body: '<h4>Temurin 21 · macOS</h4>' + GO('⬇ aarch64 · JDK · .pkg') + ' ' + B('⬇ x64 · JDK · .pkg') }],
        ['Open <b>Downloads</b> in Finder and double-click the <b>.pkg</b> file.',
          { k: 'finder', title: 'Downloads', body: '<div class="mk-file go">📦 OpenJDK21U-jdk_aarch64_mac.pkg</div><div class="mk-file">📄 notes.pdf</div>' }],
        ['The installer opens. Click <b>Continue</b> on the Introduction page.',
          { k: 'wiz', title: 'Install Eclipse Temurin', body: '<h4>Welcome to the Eclipse Temurin Installer</h4><p>You will be guided through the steps necessary to install this software.</p>' + FOOT(B('Go Back'), GO('Continue')) }],
        ['Click <b>Install</b>, then type your Mac login password (or use Touch ID).',
          { k: 'wiz', title: 'Install Eclipse Temurin', body: '<h4>Standard Install on “Macintosh HD”</h4><p>This will take 300 MB of space on your computer.</p>' + FOOT(B('Go Back'), GO('Install')) }],
        ['“The installation was successful.” Click <b>Close</b> (you may move the installer to the Bin).',
          { k: 'wiz', title: 'Install Eclipse Temurin', body: '<h4>The installation was completed successfully.</h4><p class="mk-ok">✔ The software was installed.</p>' + FOOT(B('Go Back'), GO('Close')) }],
        ['Optional check: open <b>Terminal</b> (Spotlight: <kbd>⌘</kbd> <kbd>Space</kbd>, type Terminal) and type <code>java -version</code>.',
          TERM(VERIFY, VOUT)]] },
      linux: { label: 'Linux', video: YT('install java jdk 21 ubuntu'), steps: [
        ['Ubuntu / Mint: open <b>App Center</b> (or <i>Software Manager</i> on Mint) and search for <b>openjdk</b>.',
          { k: 'store', title: 'App Center', body: '<div class="mk-search">🔍 openjdk</div><div class="mk-file go">☕ OpenJDK 21 Development Kit (openjdk-21-jdk)</div><div class="mk-file">☕ OpenJDK 21 Runtime (headless)</div>' }],
        ['Pick the <b>Development Kit</b> (JDK), not just the runtime, and click <b>Install</b>. Enter your password when asked.',
          { k: 'store', title: 'App Center', body: '<h4>OpenJDK 21 Development Kit</h4><p>Java compiler, tools and runtime.</p>' + GO('Install') }],
        ['No JDK in your store? Download the <b>x64 Debian Package</b> (.deb) from <b>oracle.com/java</b> → Linux, then double-click it to open it in App Center and click Install.',
          { k: 'browser', url: 'oracle.com/java/technologies/downloads', body: '<h4>JDK 21 · Linux</h4>' + B('x64 Compressed Archive') + ' ' + GO('⬇ x64 Debian Package') + ' ' + B('x64 RPM Package') }],
        ['Optional check: open a <b>Terminal</b> (<kbd>Ctrl</kbd> <kbd>Alt</kbd> <kbd>T</kbd>) and type <code>java -version</code>.',
          TERM(VERIFY, 'openjdk version "21.0.4" 2024-07-16\nOpenJDK Runtime Environment (build 21.0.4+7-Ubuntu)')]] },
    },
    nb: {
      win: { label: 'Windows', video: YT('install apache netbeans windows 11'), steps: [
        ['Open <b>netbeans.apache.org</b> → <b>Download</b>. Under the latest release, click the Windows installer <b>…-bin-windows-x64.exe</b>.',
          { k: 'browser', url: 'netbeans.apache.org/download', body: '<h4>Apache NetBeans 2x</h4><p>Installers</p>' + GO('⬇ Apache-NetBeans-2x-bin-windows-x64.exe') + ' ' + B('…-macosx.pkg') + ' ' + B('…_all.deb') }],
        ['Run it. The installer looks for your JDK first; when the welcome page appears, click <b>Next</b>.',
          { k: 'wiz', title: 'Apache NetBeans IDE Installer', body: '<h4>Welcome to the Apache NetBeans IDE installer</h4><p>Base IDE · Java SE · Java EE · HTML5/JavaScript · PHP</p>' + FOOT(GO('Next'), B('Cancel')) }],
        ['Tick <b>I accept the terms in the license agreement</b>, then Next.',
          { k: 'wiz', title: 'Apache NetBeans IDE Installer', body: '<h4>License Agreement</h4><div class="mk-text">Apache License, Version 2.0 …</div><div class="mk-chk go"><i></i>I accept the terms in the license agreement</div>' + FOOT(B('Back'), GO('Next'), B('Cancel')) }],
        ['Keep the folders. Check that the <b>JDK</b> box shows the JDK you installed, then Next.',
          { k: 'wiz', title: 'Apache NetBeans IDE Installer', body: '<h4>Apache NetBeans IDE Installation</h4>' + FLD('Install to', 'C:\\Program Files\\NetBeans-2x') + '<div class="mk-fld go"><span>JDK for the IDE</span><b>C:\\Program Files\\Eclipse Adoptium\\jdk-21</b></div>' + FOOT(B('Back'), GO('Next'), B('Cancel')) }],
        ['Click <b>Install</b> and wait, then <b>Finish</b>. Start it from the Start menu: <b>Apache NetBeans</b>.',
          { k: 'wiz', title: 'Apache NetBeans IDE Installer', body: '<h4>Summary</h4>' + CHK('Check for updates', 1) + '<p>Total installation size: 700 MB</p>' + FOOT(B('Back'), GO('Install'), B('Cancel')) }]] },
      mac: { label: 'macOS', video: YT('install apache netbeans mac os'), steps: [
        ['Open <b>netbeans.apache.org</b> → <b>Download</b> and click the macOS installer <b>…-macosx.pkg</b>.',
          { k: 'browser', url: 'netbeans.apache.org/download', body: '<h4>Apache NetBeans 2x</h4><p>Installers</p>' + B('…-windows-x64.exe') + ' ' + GO('⬇ Apache-NetBeans-2x-macosx.pkg') + ' ' + B('…_all.deb') }],
        ['Double-click the <b>.pkg</b> in Downloads. Click <b>Continue</b>, then <b>Agree</b> to the licence.',
          { k: 'wiz', title: 'Install Apache NetBeans', body: '<h4>Software License Agreement</h4><p>To continue installing the software you must agree to the terms.</p>' + FOOT(B('Disagree'), GO('Agree')) }],
        ['Click <b>Install</b> and enter your password. Close the installer when it says the installation was successful.',
          { k: 'wiz', title: 'Install Apache NetBeans', body: '<h4>Standard Install on “Macintosh HD”</h4>' + FOOT(B('Go Back'), GO('Install')) }],
        ['Open <b>Applications → Apache NetBeans</b>. If macOS blocks it, right-click the app → <b>Open</b> → Open.',
          { k: 'finder', title: 'Applications', body: '<div class="mk-file go">🟧 Apache NetBeans.app</div><div class="mk-file">🧭 Safari.app</div>' }]] },
      linux: { label: 'Linux', video: YT('install apache netbeans ubuntu'), steps: [
        ['Open <b>App Center</b>, search <b>netbeans</b>, choose <b>Apache NetBeans</b> and click <b>Install</b>.',
          { k: 'store', title: 'App Center', body: '<div class="mk-search">🔍 netbeans</div><div class="mk-file go">🟧 Apache NetBeans — IDE for Java</div>' + GO('Install') }],
        ['Or download the <b>…_all.deb</b> from <b>netbeans.apache.org</b> → Download, double-click it and click Install.',
          { k: 'browser', url: 'netbeans.apache.org/download', body: '<h4>Apache NetBeans 2x</h4><p>Installers</p>' + B('…-windows-x64.exe') + ' ' + B('…-macosx.pkg') + ' ' + GO('⬇ apache-netbeans_2x-1_all.deb') }],
        ['Start it from the app menu: <b>Apache NetBeans</b>. The first start takes a minute.',
          { k: 'finder', title: 'Show Apps', body: '<div class="mk-file go">🟧 Apache NetBeans</div><div class="mk-file">📁 Files</div><div class="mk-file">⌨ Terminal</div>' }]] },
    },
    proj: {
      all: { label: 'Any OS', video: YT('netbeans create first java project hello world'), steps: [
        ['<b>File → New Project…</b> Choose <i>Java with Ant</i> → <i>Java Application</i> and click <b>Next</b>.',
          { k: 'wiz', title: 'New Project', body: '<div class="mk-cols"><div><p class="mk-dim">Categories</p><div class="mk-file">Java with Maven</div><div class="mk-file sel">Java with Ant</div></div><div><p class="mk-dim">Projects</p><div class="mk-file go">Java Application</div><div class="mk-file">Java Class Library</div></div></div>' + FOOT(B('Back'), GO('Next'), B('Cancel')) }],
        ['Name the project <b>Lab1</b>. Tick <b>Create Main Class</b> and type <code>Lab1Demo</code>. Click <b>Finish</b>.',
          { k: 'wiz', title: 'New Java Application', body: FLD('Project Name', 'Lab1') + FLD('Project Location', 'Documents/NetBeansProjects') + '<div class="mk-chk on go"><i></i>Create Main Class: <b>&nbsp;Lab1Demo</b></div>' + FOOT(B('Back'), GO('Finish'), B('Cancel')) }],
        ['Type your code inside <code>main</code>. The class name must match the file name <b>Lab1Demo.java</b>.',
          { k: 'ide', title: 'Apache NetBeans · Lab1', body: '<div class="mk-tb">' + B('💾') + B('▶') + '</div><pre class="mk-code">public class Lab1Demo {\n    public static void main(String[] args) {\n        System.out.println("Hello, CSE 202!");\n    }\n}</pre>' }],
        ['Click the green <b>▶ Run Project</b> button (or press <kbd>F6</kbd>). The result appears in the <b>Output</b> window at the bottom.',
          { k: 'ide', title: 'Apache NetBeans · Lab1', body: '<div class="mk-tb">' + B('💾') + GO('▶') + '</div><pre class="mk-code">System.out.println("Hello, CSE 202!");</pre><div class="mk-out"><p class="mk-dim">Output – Lab1 (run)</p>Hello, CSE 202!\nBUILD SUCCESSFUL (total time: 1 second)</div>' }],
        ['For later labs with several classes: right-click the package → <b>New → Java Class…</b>, one file per class.',
          { k: 'ide', title: 'Apache NetBeans · Lab2', body: '<div class="mk-menu"><div class="mk-file sel">📦 lab2</div><div class="mk-sub"><div class="mk-file go">New ▸ Java Class…</div><div class="mk-file">Refactor ▸</div></div></div>' }]] },
    },
  };

  const guess = () => { const p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || ''; return /mac/i.test(p) ? 'mac' : /linux|x11/i.test(p) ? 'linux' : 'win'; };
  const WIN_ICON = { browser: '🌐', wiz: '🧩', finder: '📁', store: '🛍', term: '⌨', ide: '☕' };

  document.querySelectorAll('.os-setup[data-setup]').forEach((root) => {
    const g = GUIDES[root.getAttribute('data-setup')];
    if (!g) return;
    const keys = Object.keys(g);
    let os = keys.includes(guess()) ? guess() : keys[0], step = 0;
    const tabs = h('div', { class: 'os-tabs', role: 'tablist' });
    const yt = h('a', { class: 'btn sm yt', target: '_blank', rel: 'noopener' }, '▶ Watch on YouTube');
    const list = h('ol', { class: 'os-steps' });
    const shot = h('div', { class: 'mk-win' });
    const prev = h('button', { type: 'button', class: 'btn sm', onclick: () => go(step - 1) }, '← Previous step');
    const next = h('button', { type: 'button', class: 'btn pri sm', onclick: () => go(step + 1) }, 'Next step →');
    const count = h('span', { class: 'os-count' });
    const btns = keys.map((k) => h('button', { type: 'button', role: 'tab', class: 'os-tab', onclick: () => { os = k; go(0); } }, g[k].label));
    if (keys.length > 1) btns.forEach((b) => tabs.append(b));
    root.append(h('div', { class: 'os-bar' }, tabs, yt),
      h('div', { class: 'os-grid' }, h('div', null, list, h('div', { class: 'os-nav' }, prev, count, next)), shot));
    function go(i) {
      const st = g[os].steps;
      step = Math.max(0, Math.min(st.length - 1, i));
      btns.forEach((b, k) => { b.classList.toggle('on', keys[k] === os); b.setAttribute('aria-selected', String(keys[k] === os)); });
      yt.href = g[os].video;
      list.innerHTML = '';
      st.forEach(([txt], k) => { const li = h('li', { class: k === step ? 'on' : k < step ? 'done' : '' }); li.innerHTML = txt; li.onclick = () => go(k); list.append(li); });
      const w = st[step][1];
      shot.className = 'mk-win k-' + w.k;
      shot.innerHTML = '<div class="mk-title"><i></i><i></i><i></i><span>' + (WIN_ICON[w.k] || '') + ' ' + (w.title || 'Browser') + '</span></div>'
        + (w.k === 'browser' ? '<div class="mk-url">🔒 ' + w.url + '</div>' : '')
        + (w.k === 'term' ? '<pre class="mk-body">' + w.body + '</pre>' : '<div class="mk-body">' + w.body + '</div>');
      count.textContent = 'Step ' + (step + 1) + ' of ' + st.length;
      prev.disabled = step === 0; next.disabled = step === st.length - 1;
    }
    go(0);
  });
})();
