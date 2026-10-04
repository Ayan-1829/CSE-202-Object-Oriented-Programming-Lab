/* ===================== lab-figs.js : figures for the lab decks ===================== */
/* Added to the FIGS registry from figs.js; mounted with <figure class="fig" data-fig="name">. */
Object.assign(FIGS, {
  /* ---------- Lab 2 ---------- */
  'lab2-car-objects': () => Figs.uml({
    label: 'The Car class is a blueprint for the objects car1 and car2', items: [
      { id: 'c', name: 'Car', fields: ['- make : String', '- speed : int', '- fuelLevel : double'], methods: ['+ accelerate(int) : void', '+ brake(int) : void', '+ display() : void'], x: 250, y: 10, hl: 1 },
      { id: 'o1', kind: 'object', name: 'car1 : Car', fields: ['make = "Sedan"', 'speed = 0', 'fuelLevel = 80.5'], x: 20, y: 230 },
      { id: 'o2', kind: 'object', name: 'car2 : Car', fields: ['make = "SUV"', 'speed = 0', 'fuelLevel = 100.0'], x: 530, y: 230 }],
    links: [{ a: 'o1', b: 'c', type: 'instance', t: 'instance of' }, { a: 'o2', b: 'c', type: 'instance', t: 'instance of' }]
  }),
  'lab2-static': () => Figs.memfig({
    label: 'One static count shared by the Car class; make, speed and fuelLevel belong to each object',
    frames: [{ name: 'main', vars: [['car1', R_('a')], ['car2', R_('b')]] }],
    statics: [{ title: 'Car.class (static)', rows: [['count', 2]] }],
    objs: [{ id: 'a', title: 'Car', rows: [['make', 'Sedan'], ['speed', 0]] }, { id: 'b', title: 'Car', rows: [['make', 'SUV'], ['speed', 0]] }]
  }),
  'lab2-refs': () => Figs.memfig({
    label: 'car1 and car3 refer to the same Car object; car2 refers to another',
    frames: [{ name: 'main', vars: [['car1', R_('a')], ['car2', R_('b')], ['car3', R_('a', 1)]] }],
    objs: [{ id: 'a', title: 'Car', rows: [['make', 'Hatchback'], ['speed', 20]] }, { id: 'b', title: 'Car', rows: [['make', 'SUV'], ['speed', 60]] }]
  }),
  'lab2-car-uml': () => Figs.uml({
    label: 'UML class diagram of Car and the driver class Lab2Demo', items: [
      { id: 'c', name: 'Car', fields: ['- make : String', '- speed : int', '- fuelLevel : double', '- count : int  {static}'],
        methods: ['+ Car(make, fuelLevel)', '+ accelerate(delta : int)', '+ brake(delta : int)', '+ refuel(amount : double)', '+ display()', '+ getMake / getSpeed / getFuelLevel', '+ setMake / setFuelLevel', '+ getCount() : int  {static}'], x: 10, y: 10, hl: 1 },
      { id: 'd', name: 'Lab2Demo', methods: ['+ main(args : String[])  {static}'], x: 560, y: 120 }],
    links: [{ a: 'd', b: 'c', type: 'uses', t: 'creates' }]
  }),

  /* ---------- Lab 3 ---------- */
  'lab3-chain': () => Figs.graph({
    w: 860, h: 330, label: 'Every simpler constructor calls the full constructor with this(...)',
    nodes: [
      { id: 'a', t: 'Rectangle()', m: 1, x: 120, y: 40 }, { id: 'b', t: 'Rectangle(side)', m: 1, x: 120, y: 120 },
      { id: 'c', t: 'Rectangle(w, h)', m: 1, x: 120, y: 200 }, { id: 'd', t: 'Rectangle(other)', m: 1, x: 120, y: 280, c: 'fg-c2' },
      { id: 'f', t: 'Rectangle(w, h, colour)', s: 'validates and assigns', m: 1, x: 690, y: 160, c: 'fg-c1' }],
    edges: [{ a: 'a', b: 'f', from: 'right', to: 'left', t: 'this(1, 1, "White")', hl: 1, dx: -45 }, { a: 'b', b: 'f', from: 'right', to: 'left', t: 'this(side, side, …)', dx: -45 },
      { a: 'c', b: 'f', from: 'right', to: 'left', t: 'this(w, h, "White")', dx: -45 }, { a: 'd', b: 'f', from: 'right', to: 'left', t: 'copies other’s fields', dx: -45 }]
  }),
  'lab3-prim': () => Figs.memfig({
    label: 'passPrimitive works on its own copy of side', stackTitle: 'Stack (two frames)', heapTitle: ' ',
    frames: [{ name: 'passPrimitive(side)', vars: [['side', { raw: '20.0' }]] }, { name: 'main', vars: [['side', { raw: '10.0' }]] }],
    objs: []
  }),
  'lab3-ref': () => Figs.memfig({
    label: 'passReference gets a copy of the reference, so both frames point at the same Rectangle',
    frames: [{ name: 'passReference(rectangle)', vars: [['rectangle', R_('r', 1)]] }, { name: 'main', vars: [['ref', R_('r')]] }],
    objs: [{ id: 'r', title: 'Rectangle', rows: [['width', { raw: '10.0' }], ['height', { raw: '10.0' }], ['colour', 'Blue']] }]
  }),
  'lab3-rect-uml': () => Figs.uml({
    label: 'UML class diagram of Rectangle', items: [{
      id: 'r', name: 'Rectangle', x: 10, y: 10, hl: 1,
      fields: ['- width : double', '- height : double', '- colour : String'],
      methods: ['+ Rectangle()', '+ Rectangle(side : double)', '+ Rectangle(w : double, h : double)', '+ Rectangle(w, h, colour : String)', '+ Rectangle(other : Rectangle)',
        '+ area() : double', '+ area(scaleFactor : double) : double', '+ area(w, h) : double  {static}', '+ describe() : String', '+ describe(prefix : String) : String',
        '+ scale(factor : double)', '+ getters, setColour, toString()']
    }]
  }),

  /* ---------- Lab 4 ---------- */
  'lab4-vehicle-uml': () => Figs.uml({
    label: 'Vehicle is the superclass of Car and Motorcycle; ElectricCar extends Car', items: [
      { id: 'v', name: 'Vehicle', fields: ['# make : String', '# year : int', '# speed : int'], methods: ['+ accelerate(delta)', '+ brake(delta)', '+ display()'], x: 440, y: 10, hl: 1 },
      { id: 'c', name: 'Car', fields: ['- numDoors : int', '- fuelLevel : double'], methods: ['+ refuel(amount)', '+ display()'], x: 310, y: 220 },
      { id: 'm', name: 'Motorcycle', fields: ['- hasStorage : boolean'], methods: ['+ wheelie()', '+ display()'], x: 580, y: 220 },
      { id: 'e', name: 'ElectricCar', fields: ['- batteryCapacity : double', '- chargeLevel : double'], methods: ['+ charge(amount)', '+ display()'], x: 0, y: 220 }],
    links: [{ a: 'c', b: 'v', type: 'extends' }, { a: 'm', b: 'v', type: 'extends' }, { a: 'e', b: 'c', type: 'extends', side: 'h' }]
  }),

  /* ---------- Lab 5 ---------- */
  'lab5-animal-uml': () => Figs.uml({
    label: 'Dog and Bird extend Animal and implement Drawable; Fish extends Animal and implements Eatable', items: [
      { id: 'd', kind: 'interface', name: 'Drawable', methods: ['+ draw()', '+ hide()'], x: 10, y: 10, w: 170 },
      { id: 'a', kind: 'abstract', name: 'Animal', fields: ['# name : String', '# age : int'], methods: ['+ makeSound()  {abstract}', '+ eat()  {abstract}', '+ displayInfo()'], x: 280, y: 10, hl: 1 },
      { id: 'e', kind: 'interface', name: 'Eatable', methods: ['+ isPoisonous() : boolean', '+ getNutrition() : int'], x: 600, y: 10, w: 220 },
      { id: 'g', name: 'Dog', fields: ['- breed : String'], x: 10, y: 300, w: 170 },
      { id: 'b', name: 'Bird', fields: ['- wingSpan : double'], x: 300, y: 300, w: 170 },
      { id: 'f', name: 'Fish', fields: ['- waterDepth : int'], x: 600, y: 300, w: 220 }],
    links: [{ a: 'g', b: 'a', type: 'extends', dx: 45, midY: 262 }, { a: 'b', b: 'a', type: 'extends', dx: 30, midY: 262 }, { a: 'f', b: 'a', type: 'extends', dx: -50, midY: 262 },
      { a: 'g', b: 'd', type: 'implements' }, { a: 'b', b: 'd', type: 'implements', dx: -45, midY: 236 }, { a: 'f', b: 'e', type: 'implements' }]
  }),

  /* ---------- Lab 6 ---------- */
  'lab6-ex-uml': () => Figs.tree({
    label: 'The lab’s three custom exceptions and where they sit in the hierarchy', arrows: 't', minW: 110, root: {
      t: 'Exception', s: 'checked', c: 'fg-c2', k: [
        { t: 'InvalidAccountException', s: 'checked: bad data or amount', c: 'fg-c2' },
        { t: 'TransactionException', s: 'checked: wraps a cause', c: 'fg-c2' },
        { t: 'RuntimeException', s: 'unchecked', c: 'fg-c1', k: [{ t: 'InsufficientFundsException', s: 'unchecked: balance too low', c: 'fg-c1' }] }]
    }
  }),

  /* ---------- Lab 7 ---------- */
  'lab7-states': () => Figs.graph({
    w: 760, h: 300, label: 'Java Thread.State values and the transitions between them',
    nodes: [
      { id: 'n', t: 'NEW', x: 60, y: 140, shape: 'round', c: 'fg-c4' },
      { id: 'r', t: 'RUNNABLE', s: 'ready or running', x: 240, y: 140, shape: 'round', c: 'fg-c1', w: 150 },
      { id: 'b', t: 'BLOCKED', s: 'waiting for a lock', x: 540, y: 40, shape: 'round', c: 'fg-c2', w: 150 },
      { id: 'w', t: 'WAITING', s: 'wait() / join()', x: 540, y: 140, shape: 'round', c: 'fg-c2', w: 150 },
      { id: 'tw', t: 'TIMED_WAITING', s: 'sleep(ms)', x: 540, y: 240, shape: 'round', c: 'fg-c2', w: 150 },
      { id: 't', t: 'TERMINATED', x: 240, y: 260, shape: 'round', c: 'fg-c3' }],
    edges: [{ a: 'n', b: 'r', t: 'start()', hl: 1 },
      { a: 'r', b: 'b', from: 'right', to: 'left', both: 1, t: 'lock busy ⇄ free' },
      { a: 'r', b: 'w', from: 'right', to: 'left', both: 1, t: 'wait ⇄ notify' },
      { a: 'r', b: 'tw', from: 'right', to: 'left', both: 1, t: 'sleep ⇄ time up' },
      { a: 'r', b: 't', t: 'run() ends', hl: 1 }]
  }),
  'lab7-counter-uml': () => Figs.uml({
    label: 'IncrementThread extends Thread, DecrementRunnable implements Runnable, both share one Counter', items: [
      { id: 'th', name: 'Thread', methods: ['+ start()', '+ join()', '+ getState()'], x: 10, y: 10 },
      { id: 'rn', kind: 'interface', name: 'Runnable', methods: ['+ run()'], x: 560, y: 10 },
      { id: 'it', name: 'IncrementThread', fields: ['- counter : Counter', '- iterations : int'], methods: ['+ run()'], x: 10, y: 200 },
      { id: 'dr', name: 'DecrementRunnable', fields: ['- counter : Counter', '- iterations : int'], methods: ['+ run()'], x: 520, y: 200 },
      { id: 'c', name: 'Counter', fields: ['- value : int', '- name : String'], methods: ['+ increment()  {synchronized}', '+ decrement()  {synchronized}', '+ getValue()  {synchronized}'], x: 260, y: 360, hl: 1 }],
    links: [{ a: 'it', b: 'th', type: 'extends' }, { a: 'dr', b: 'rn', type: 'implements' }, { a: 'it', b: 'c', type: 'assoc', side: 'h' }, { a: 'dr', b: 'c', type: 'assoc', side: 'h' }]
  }),

  /* ---------- Lab 8 ---------- */
  'lab8-rag': () => Figs.graph({
    w: 700, h: 300, label: 'Resource allocation graph of the risky transfers: the cycle means deadlock',
    nodes: [
      { id: 't1', t: 'RiskyThread-1', x: 150, y: 60, shape: 'circle', c: 'fg-c1', w: 200, h: 70 },
      { id: 't2', t: 'RiskyThread-2', x: 550, y: 240, shape: 'circle', c: 'fg-c1', w: 200, h: 70 },
      { id: 'a', t: 'ACC-001', s: 'lock', x: 150, y: 240, c: 'fg-c2', m: 1 },
      { id: 'b', t: 'ACC-002', s: 'lock', x: 550, y: 60, c: 'fg-c2', m: 1 }],
    edges: [{ a: 'a', b: 't1', t: 'held by' }, { a: 't1', b: 'b', t: 'requests', hl: 1, dash: 1 },
      { a: 'b', b: 't2', t: 'held by' }, { a: 't2', b: 'a', t: 'requests', hl: 1, dash: 1 }]
  }),

  /* ---------- Lab 9 ---------- */
  'lab9-tree': () => Figs.tree({
    label: 'Component tree of DrawingApp', minW: 100, gapY: 34, root: {
      t: 'JFrame', s: 'DrawingApp', c: 'fg-c4', k: [{
        t: 'mainPanel', s: 'BorderLayout', c: 'fg-c2', k: [
          { t: 'topPanel', s: 'NORTH', c: 'fg-c1', k: [{ t: 'JLabel', s: 'title' }] },
          { t: 'DrawingPanel', s: 'CENTER', c: 'fg-c3' },
          { t: 'controlPanel', s: 'SOUTH', c: 'fg-c1', k: [{ t: 'buttonPanel', s: 'FlowLayout', k: [{ t: 'JComboBox' }, { t: '3 × JButton' }] }, { t: 'JLabel', s: 'status' }] }]
      }]
    }
  }),
  'lab9-border': () => Figs.boxes({
    w: 700, h: 300, label: 'The five regions of BorderLayout and what DrawingApp puts in them',
    boxes: [
      { x: 10, y: 10, w: 680, h: 60, t: 'NORTH', s: 'topPanel: title label', c: 'fg-c1', ta: 'middle', mid: 1 },
      { x: 10, y: 80, w: 110, h: 140, t: 'WEST', s: '(empty)', c: 'fg-c4', ta: 'middle', mid: 1 },
      { x: 130, y: 80, w: 440, h: 140, t: 'CENTER', s: 'DrawingPanel: grows to fill the space', c: 'fg-c3', ta: 'middle', mid: 1 },
      { x: 580, y: 80, w: 110, h: 140, t: 'EAST', s: '(empty)', c: 'fg-c4', ta: 'middle', mid: 1 },
      { x: 10, y: 230, w: 680, h: 60, t: 'SOUTH', s: 'controlPanel: colour box, buttons, status', c: 'fg-c1', ta: 'middle', mid: 1 }]
  }),
  'lab9-uml': () => Figs.uml({
    label: 'Classes of the Lab 9 drawing application', items: [
      { id: 's', kind: 'abstract', name: 'Shape', fields: ['# x, y : int', '# colour : Color'], methods: ['+ draw(g : Graphics)  {abstract}'], x: 10, y: 10, hl: 1 },
      { id: 'r', name: 'RectangleShape', fields: ['- width, height : int'], methods: ['+ draw(g)'], x: 10, y: 230 },
      { id: 'c', name: 'CircleShape', fields: ['- radius : int'], methods: ['+ draw(g)'], x: 250, y: 230 },
      { id: 'p', name: 'DrawingPanel', fields: ['- shapes : ArrayList<Shape>', '- currentColor : Color'], methods: ['# paintComponent(g)', '+ addRectangle / addCircle', '+ clear()'], x: 520, y: 10 },
      { id: 'a', name: 'DrawingApp', fields: ['- drawingPanel', '- buttons, colorComboBox'], methods: ['- setupUI()', '- addActionListeners()'], x: 560, y: 300 }],
    links: [{ a: 'r', b: 's', type: 'extends' }, { a: 'c', b: 's', type: 'extends' }, { a: 'p', b: 's', type: 'has', side: 'h', t: 'draws' }, { a: 'a', b: 'p', type: 'has' }]
  }),

  /* ---------- Lab 10 ---------- */
  'lab10-loop': () => Figs.graph({
    w: 840, h: 280, label: 'The animation loop: update, repaint, sleep, repeat; the EDT paints each requested frame',
    nodes: [
      { id: 'u', t: 'updateAnimation()', s: 'move balls, collisions', m: 1, x: 140, y: 60, c: 'fg-c1' },
      { id: 'r', t: 'repaint()', s: 'request a frame', m: 1, x: 440, y: 60, c: 'fg-c2' },
      { id: 's', t: 'Thread.sleep(…)', s: 'rest of the 16 ms', m: 1, x: 440, y: 220, c: 'fg-c4' },
      { id: 'p', t: 'paintComponent(g)', s: 'drawn on the EDT', m: 1, x: 720, y: 60, c: 'fg-c3' }],
    edges: [{ a: 'u', b: 'r', hl: 1 }, { a: 'r', b: 's', hl: 1 }, { a: 's', b: 'u', from: 'left', to: 'bottom', elbow: 'hv', t: 'next frame', hl: 1 },
      { a: 'r', b: 'p', dash: 1, t: 'Swing' }],
    notes: [[140, 175, 'worker thread', 'fg-s fg-acc-t'], [720, 135, 'Event Dispatch Thread', 'fg-s']]
  }),
  'lab10-collide': () => Figs.graph({
    w: 620, h: 180, label: 'Two balls collide when the distance between centres is at most the sum of the radii',
    nodes: [{ id: 'a', t: 'r1', x: 140, y: 90, shape: 'circle', w: 120, h: 120, c: 'fg-c1' }, { id: 'b', t: 'r2', x: 400, y: 90, shape: 'circle', w: 90, h: 90, c: 'fg-c2' }],
    edges: [{ a: 'a', b: 'b', both: 1, t: 'd = √(dx² + dy²)' }],
    notes: [[540, 80, 'd ≤ r1 + r2', 'fg-s fg-acc-t'], [540, 105, '→ swap velocities', 'fg-s']]
  }),
  'lab10-uml': () => Figs.uml({
    label: 'Classes of the Lab 10 animation', items: [
      { id: 't', name: 'AnimationThread', fields: ['- panel : AnimationPanel'], methods: ['+ run()'], x: 10, y: 40 },
      { id: 'p', name: 'AnimationPanel', fields: ['- balls : ArrayList<Ball>', '- running : boolean'], methods: ['# paintComponent(g)', '+ updateAnimation()  {sync}', '+ start / pause / reset  {sync}'], x: 420, y: 10, hl: 1 },
      { id: 'b', name: 'Ball', fields: ['- x, y, vx, vy : double', '- radius : int', '- colour : Color'], methods: ['+ update(w, h)', '+ draw(g : Graphics2D)', '+ collidesWith(other)', '+ bounceOff(other)'], x: 10, y: 260 },
      { id: 'a', name: 'AnimationApp', fields: ['- animationPanel', '- buttons, statusLabel'], methods: ['- startWorkerThread()'], x: 520, y: 330 }],
    links: [{ a: 't', b: 'p', type: 'uses', t: 'updates', side: 'h' }, { a: 'p', b: 'b', type: 'has', dx: -70 }, { a: 'a', b: 'p', type: 'has', dx: 40 }]
  })
});
