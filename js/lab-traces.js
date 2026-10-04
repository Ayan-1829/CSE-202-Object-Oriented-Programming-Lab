/* ===================== lab-traces.js : step-through traces of the lab programs ===================== */
/* Same format as js/traces.js (CSE 201): Java source with @@label markers, and a run(R) "shadow"
   that re-enacts the program on the recorder in js/tracer.js. The source is the lab program,
   shortened to the lines that matter for the trace. Added to the shared TRACES registry. */
Object.assign(TRACES, {
  /* ---------------- Lab 1 ---------------- */
  'lab1-cast': {
    code: `
public class Lab1Demo {
    public static void main(String[] args) {          @@main
        int age = 21;                                  @@age
        double ageAsDouble = age;                      @@wide
        double pi = 3.14159;                           @@pi
        int piTruncated = (int) pi;                    @@narrow
        char letter = 'Z';                             @@ch
        int code = letter;                             @@code
        char nextChar = (char) (code + 1);             @@next
        System.out.println(ageAsDouble + " " + piTruncated   @@p
                + " " + code + " " + nextChar);
    }
}`,
    run(R) {
      R.frame('main').at('main', '`main` starts with an empty stack frame.');
      R.set('age', 21).at('age', 'An `int` variable lives in the frame.');
      R.set('ageAsDouble', D(21)).at('wide', '**Widening**: int → double happens automatically, nothing is lost → `21.0`.');
      R.set('pi', D(3.14159)).at('pi');
      R.set('piTruncated', 3).at('narrow', '**Narrowing** needs a cast. `(int)` drops the fraction (it does not round) → `3`.');
      R.set('letter', C('Z')).at('ch', 'A `char` is a 16-bit Unicode number shown as a letter.');
      R.set('code', 90).at('code', 'char → int is widening: the Unicode value of Z is `90`.');
      R.set('nextChar', C('[')).at('next', '90 + 1 = 91, cast back to char: the character after Z is `[`.');
      R.println('21.0 3 90 [').at('p', 'Each value is turned into text and joined.');
    }
  },
  'lab1-reverse': {
    code: `
public class Lab1Demo {
    public static void main(String[] args) {          @@main
        int number = 123;                              @@num
        int temp = number;                             @@temp
        int reversed = 0;                              @@rev0
        while (temp != 0) {                            @@while
            int digit = temp % 10;                     @@digit
            reversed = reversed * 10 + digit;          @@rev
            temp = temp / 10;                          @@div
        }
        System.out.println("Reversed: " + reversed);   @@p
    }
}`,
    run(R) {
      R.frame('main').at('main', 'The lab uses 12345; 123 keeps the trace short.');
      let temp = 123, rev = 0;
      R.set('number', 123).at('num');
      R.set('temp', temp).at('temp', 'Work on a copy, so `number` keeps the original value.');
      R.set('reversed', 0).at('rev0');
      while (temp !== 0) {
        R.at('while', `Condition: ${temp} != 0 is **true** → run the body.`);
        const d = temp % 10; R.set('digit', d).at('digit', `${temp} % 10 = **${d}**: the last digit.`);
        rev = rev * 10 + d; R.set('reversed', rev).at('rev', `Shift left and append: ${(rev - d) / 10} × 10 + ${d} = ${rev}.`);
        temp = Math.trunc(temp / 10); R.set('temp', temp).del('digit').at('div', `${temp * 10 + d} / 10 = ${temp} (integer division drops the last digit). \`digit\` goes out of scope at the end of the body.`);
      }
      R.at('while', 'Condition: 0 != 0 is **false** → the loop ends.');
      R.println('Reversed number: ' + rev).at('p');
    }
  },

  /* ---------------- Lab 2 ---------------- */
  'lab2-car': {
    code: `
public class Car {
    private String make;
    private int speed;
    private double fuelLevel;
    private static int count = 0;                      @@sc

    public Car(String make, double fuelLevel) {         @@ctor
        this.make = make;
        this.speed = 0;
        this.fuelLevel = fuelLevel;                     @@fields
        count++;                                        @@inc
    }
    public void accelerate(int delta) {
        if (delta > 0) this.speed = this.speed + delta; @@acc
    }
    public void brake(int delta) {
        if (delta > 0)
            this.speed = Math.max(0, this.speed - delta);   @@brk
    }
}

public class Lab2Demo {
    public static void main(String[] args) {           @@main
        Car car1 = new Car("Sedan", 80.5);              @@c1
        Car car2 = new Car("SUV", 100.0);               @@c2
        car1.accelerate(30);                            @@a30
        car1.brake(100);                                @@b100
        Car car3 = car1;                                @@c3
        car3.accelerate(20);                            @@a20
        System.out.println(car1.getSpeed() + " "   @@p
                + Car.getCount());
    }
}`,
    run(R) {
      R.frame('main').at('main');
      R.stat('Car', 'count', 0).at('sc', 'The first use of Car loads the class. The **static** `count` is created once, in the class area, not inside any object.');
      const mk = (make, fuel, v, lab, n) => {
        const o = R.obj('Car', { make, speed: 0, fuelLevel: D(fuel) });
        R.frame('Car(…)').set('this', o).set('make', make).set('fuelLevel', D(fuel)).at('ctor', '`new` makes the object on the heap, then runs the constructor with `this` pointing to it.');
        R.at('fields', 'Each Car object gets its **own** make, speed and fuelLevel.');
        R.stat('Car', 'count', n).at('inc', `…but \`count\` is shared by all Car objects: now ${n}.`);
        R.ret().set(v, o).at(lab, `\`${v}\` holds a **reference** (→) to the object, not the object itself.`);
        return o;
      };
      const c1 = mk('Sedan', 80.5, 'car1', 'c1', 1);
      mk('SUV', 100, 'car2', 'c2', 2);
      R.frame('car1.accelerate(30)').set('this', c1).set('delta', 30).setf(c1, 'speed', 30).at('acc', 'The method changes the object `this` points to: car1’s speed 0 → 30.');
      R.ret().at('a30');
      R.frame('car1.brake(100)').set('this', c1).set('delta', 100).setf(c1, 'speed', 0).at('brk', '`Math.max(0, 30 − 100)` = 0: the speed never goes negative.');
      R.ret().at('b100');
      R.set('car3', c1).at('c3', '`car3 = car1` copies the **reference**. No new object is made, and count stays 2.');
      R.frame('car3.accelerate(20)').set('this', c1).set('delta', 20).setf(c1, 'speed', 20).at('acc', 'Through car3 we change the **same** object car1 points to.');
      R.ret().at('a20');
      R.println('20 2').at('p', 'car1.getSpeed() is 20 because car1 and car3 are two names for one object.');
    }
  },

  /* ---------------- Lab 3 ---------------- */
  'lab3-chain': {
    code: `
public class Rectangle {
    private double width, height;
    private String colour;

    public Rectangle(double side) {                     @@one
        this(side, side, "White");                      @@call
    }
    public Rectangle(double width, double height,   @@full
                     String colour) {
        this.width = width > 0 ? width : 1.0;      @@w
        this.height = height > 0 ? height : 1.0;   @@h
        this.colour = colour;                           @@c
    }
}

public class Lab3Demo {
    public static void main(String[] args) {           @@main
        Rectangle square = new Rectangle(4.0);          @@new
        Rectangle bad = new Rectangle(-2.0);            @@bad
    }
}`,
    run(R) {
      R.frame('main').at('main');
      [[4, 'square', 'new'], [-2, 'bad', 'bad']].forEach(([side, v, lab]) => {
        const o = R.obj('Rectangle', { width: D(0), height: D(0), colour: null });
        R.frame('Rectangle(double)').set('this', o).set('side', D(side)).at('one', `\`new Rectangle(${side.toFixed(1)})\`: the compiler picks the **one-parameter** constructor. Fields start at their defaults.`);
        R.at('call', '`this(…)` must be the first statement: it hands the work to another constructor of the same class.');
        R.frame('Rectangle(double, double, String)').set('this', o).set('width', D(side)).set('height', D(side)).set('colour', 'White')
          .at('full', 'A second frame on the stack, for the **same** object. All validation lives here, in one place.');
        const ok = side > 0;
        R.setf(o, 'width', D(ok ? side : 1)).at('w', ok ? 'width > 0, so it is kept.' : '**Invalid** width: replaced by 1.0.');
        R.setf(o, 'height', D(ok ? side : 1)).at('h');
        R.setf(o, 'colour', 'White').at('c');
        R.ret().ret().set(v, o).at(lab, 'Both constructor frames are gone; `' + v + '` refers to the finished object.');
      });
    }
  },
  'lab3-pass': {
    code: `
public class Lab3Demo {
    static void passPrimitive(double side) {            @@pp
        side = side * 2;                                 @@pp2
    }
    static void passReference(Rectangle r) {   @@pr
        r.scale(2.0);                            @@pr2
    }
    static void tryReassignReference(Rectangle r) {   @@tr
        r = new Rectangle(99.0, 99.0, "Invisible");   @@tr2
    }
    public static void main(String[] args) {            @@main
        double side = 10.0;                              @@s
        passPrimitive(side);                             @@c1
        Rectangle ref = new Rectangle(5, 5, "Blue");    @@r
        passReference(ref);                              @@c2
        Rectangle orig = new Rectangle(2, 3, "Pink");   @@o
        tryReassignReference(orig);              @@c3
    }
}`,
    run(R) {
      R.frame('main').at('main', 'Predict before stepping: which of the three calls changes something the caller can see?');
      R.set('side', D(10)).at('s');
      R.frame('passPrimitive').set('side', D(10)).at('pp', 'The parameter is a **copy** of the value 10.0, in a new frame.');
      R.set('side', D(20)).at('pp2', 'Only the copy becomes 20.0.');
      R.ret().at('c1', 'Back in main: `side` is still **10.0**.');
      const ref = R.obj('Rectangle', { width: D(5), height: D(5), colour: 'Blue' });
      R.set('ref', ref).at('r');
      R.frame('passReference').set('r', ref).at('pr', 'The parameter is a copy of the **reference**: both arrows point to the same object.');
      R.setf(ref, 'width', D(10)).setf(ref, 'height', D(10)).at('pr2', 'scale(2.0) changes the shared object: 10 × 10.');
      R.ret().at('c2', 'The caller sees the change, because it is the same object.');
      const orig = R.obj('Rectangle', { width: D(2), height: D(3), colour: 'Pink' });
      R.set('orig', orig).at('o');
      R.frame('tryReassignReference').set('r', orig).at('tr', 'Again a copy of the reference.');
      const inv = R.obj('Rectangle', { width: D(99), height: D(99), colour: 'Invisible' });
      R.set('r', inv).at('tr2', 'Reassigning moves **only the copy** to a new object. `orig` in main is untouched.');
      R.ret().at('c3', 'The 99 × 99 rectangle is now unreachable (garbage). `orig` is still Pink 2 × 3. Java is always **pass-by-value**.');
    }
  },

  /* ---------------- Lab 4 ---------------- */
  'lab4-dispatch': {
    code: `
public class Vehicle {
    protected String make;
    protected int year, speed;
    public Vehicle(String make, int year) {             @@vctor
        this.make = make; this.year = year;
    }
    public void display() {   @@vd
        System.out.println("Vehicle: " + make);
    }
}
public class Car extends Vehicle {
    private int numDoors;
    public Car(String make, int year, int numDoors) {   @@cctor
        super(make, year);                               @@super
        this.numDoors = numDoors;                        @@doors
    }
    @Override
    public void display() {   @@cd
        System.out.println("Car: " + make + ", "
                + numDoors + " doors");
    }
}

public class Lab4Demo {
    public static void main(String[] args) {           @@main
        Vehicle vehicle = new Vehicle("Generic", 2020);   @@nv
        Car car = new Car("Toyota Camry", 2022, 4);      @@nc
        Vehicle[] vehicles = {vehicle, car};             @@arr
        for (Vehicle v : vehicles) {                     @@for
            v.display();                                 @@call
        }
    }
}`,
    run(R) {
      R.frame('main').at('main');
      const v = R.obj('Vehicle', { make: 'Generic', year: 2020, speed: 0 });
      R.frame('Vehicle(…)').set('this', v).at('vctor');
      R.ret().set('vehicle', v).at('nv');
      const c = R.obj('Car', { make: null, year: 0, speed: 0, numDoors: 0 });
      R.frame('Car(…)').set('this', c).at('cctor', 'The Car object has **all** the fields: the inherited make, year, speed and its own numDoors.');
      R.frame('Vehicle(…)').set('this', c).setf(c, 'make', 'Toyota Camry').setf(c, 'year', 2022).at('super', '`super(make, year)` runs the **Vehicle** constructor first, on the same object, to set the inherited part.');
      R.ret().setf(c, 'numDoors', 4).at('doors', 'Then Car sets its own field.');
      R.ret().set('car', c).at('nc');
      const arr = R.arr('Vehicle[]', [v, c]);
      R.set('vehicles', arr).at('arr', 'A Vehicle[] may hold a Car: a Car **is a** Vehicle (upcasting).');
      [[v, 'Vehicle', 'vd', 'Vehicle: Generic'], [c, 'Car', 'cd', 'Car: Toyota Camry, 4 doors']].forEach(([o, cls, lab, out], i) => {
        R.set('v', o).mark(arr, i).at('for', `v = vehicles[${i}]. Declared type Vehicle; the object is a **${cls}**.`);
        R.frame(cls + '.display()').set('this', o).println(out).at(lab, `**Dynamic dispatch**: the JVM checks the real object at run time and runs ${cls}’s display().`);
        R.ret().at('call');
      });
    }
  },

  /* ---------------- Lab 5 ---------------- */
  'lab5-iface': {
    code: `
public abstract class Animal {
    protected String name;
    public abstract void makeSound();
}
public class Dog extends Animal implements Drawable {
    public void makeSound() {   @@dsound
        System.out.println(name + " barks: Woof!");
    }
    public void draw() {   @@ddraw
        System.out.println("[Drawing] " + name);
    }
}
public class Fish extends Animal implements Eatable {
    public void makeSound() {   @@fsound
        System.out.println(name + " makes bubbles");
    }
}

public class Lab5Demo {
    public static void main(String[] args) {           @@main
        Animal[] animals = {new Dog("Rex"),   @@arr
                            new Fish("Nemo")};
        for (Animal animal : animals) {                  @@for
            animal.makeSound();                          @@sound
            if (animal instanceof Drawable) {            @@inst
                Drawable d = (Drawable) animal;          @@cast
                d.draw();                                @@draw
            }
        }
    }
}`,
    run(R) {
      R.frame('main').at('main', 'You cannot write `new Animal(…)`: Animal is abstract. You make concrete subclasses.');
      const dog = R.obj('Dog', { name: 'Rex' }), fish = R.obj('Fish', { name: 'Nemo' });
      const arr = R.arr('Animal[]', [dog, fish]);
      R.set('animals', arr).at('arr', 'An `Animal[]` can hold any subclass object.');
      R.set('animal', dog).mark(arr, 0).at('for', 'animal → the Dog.');
      R.frame('Dog.makeSound()').set('this', dog).println('Rex barks: Woof!').at('dsound', 'Dog’s implementation of the abstract method runs.');
      R.ret().at('sound');
      R.at('inst', '`instanceof Drawable`: does this object’s class **implement** Drawable? Dog does → true.');
      R.set('d', dog).at('cast', 'The cast changes only the **reference type**, so draw() can be called. `d` and `animal` point to the same Dog.');
      R.frame('Dog.draw()').set('this', dog).println('[Drawing] Rex').at('ddraw');
      R.ret().del('d').at('draw');
      R.set('animal', fish).mark(arr, 1).at('for', 'animal → the Fish.');
      R.frame('Fish.makeSound()').set('this', fish).println('Nemo makes bubbles').at('fsound');
      R.ret().at('sound');
      R.at('inst', 'Fish implements Eatable, **not** Drawable → false. The cast is skipped, so no ClassCastException.');
    }
  },

  /* ---------------- Lab 6 ---------------- */
  'lab6-create': {
    scenarioLabel: 'new BankAccount(…):',
    code: `
public class BankAccount {
    private String accountNumber, owner;
    private double balance;
    private static int totalAccounts = 0;
    public BankAccount(String number, String owner,   @@ctor
                       double initialBalance)
            throws InvalidAccountException {
        if (number == null || number.trim().isEmpty())
            throw new InvalidAccountException(   @@t1
                "Account number cannot be null or empty.");
        if (initialBalance < 0.0)
            throw new InvalidAccountException(   @@t2
                "Initial balance cannot be negative.");
        accountNumber = number; this.owner = owner;   @@set
        balance = initialBalance;
        totalAccounts++;                                                       @@inc
    }
}

public class Lab6Demo {
    public static void main(String[] args) {                                  @@main
        try {
            BankAccount acc =   @@new
                new BankAccount(number, owner, balance);
            System.out.println("Account created.");                            @@ok
        } catch (InvalidAccountException e) {                                  @@catch
            System.out.println("Caught: " + e.getMessage());   @@msg
        }
    }
}`,
    scenarios: [['"ACC001", "Alice", 5000.0', 'ACC001', 5000], ['"", "Charlie", 1000.0', '', 1000], ['"ACC003", "Diana", -500.0', 'ACC003', -500]].map(([label, num, bal]) => ({
      label,
      run(R) {
        R.frame('main').at('main');
        R.stat('BankAccount', 'totalAccounts', 0);
        const o = R.obj('BankAccount', { accountNumber: null, owner: null, balance: D(0) });
        R.frame('BankAccount(…)').set('this', o).set('number', num).set('initialBalance', D(bal)).at('ctor', '`new` has made the object; the constructor now checks the arguments.');
        if (num === '') {
          const ex = R.obj('InvalidAccountException', { message: 'Account number cannot be null or empty.' });
          R.at('t1', '**throw**: an exception object is created and the constructor stops at once.');
          R.ret().set('e', ex).at('catch', 'The exception travels back to main. `acc` is never assigned, and **totalAccounts is not incremented**.');
          R.println('Caught: Account number cannot be null or empty.').at('msg');
        } else if (bal < 0) {
          R.at('t1', 'The account number is fine.');
          const ex = R.obj('InvalidAccountException', { message: 'Initial balance cannot be negative.' });
          R.at('t2', 'A negative balance: **throw**. The fields are never set.');
          R.ret().set('e', ex).at('catch', 'Caught in main. The half-built object is unreachable garbage, and totalAccounts stays 0.');
          R.println('Caught: Initial balance cannot be negative.').at('msg');
        } else {
          R.at('t1').at('t2', 'Both checks pass.');
          R.setf(o, 'accountNumber', num).setf(o, 'owner', 'Alice').setf(o, 'balance', D(bal)).at('set');
          R.stat('BankAccount', 'totalAccounts', 1).at('inc', 'Only a valid account is counted.');
          R.ret().set('acc', o).at('new');
          R.println('Account created.').at('ok', 'No exception, so the catch block is skipped.');
        }
      }
    }))
  },
  'lab6-withdraw': {
    scenarioLabel: 'withdraw(…):',
    code: `
public void withdraw(double amount)
        throws InvalidAccountException {
    if (amount <= 0.0)
        throw new InvalidAccountException(   @@t1
            "Withdrawal amount must be positive.");
    if (amount > balance)
        throw new InsufficientFundsException(   @@t2
            "Insufficient funds.");
    balance = balance - amount;                                                         @@sub
}

public static void main(String[] args) {                                               @@main
    try {
        account1.withdraw(amount);                                                      @@call
        System.out.println("Withdrawal successful.");                                   @@ok
    } catch (InsufficientFundsException e) {                                            @@c1
        System.out.println("Caught Insufficient...: "   @@m1
                + e.getMessage());
    } catch (InvalidAccountException e) {                                               @@c2
        System.out.println("Caught InvalidAccount...: "   @@m2
                + e.getMessage());
    } finally {
        System.out.println("Finally block runs.");                                      @@fin
    }
}`,
    scenarios: [1500, 10000, -50].map((amt) => ({
      label: javaDouble(amt),
      run(R) {
        const acc = R.obj('BankAccount', { accountNumber: 'ACC001', owner: 'Alice', balance: D(5000) });
        R.frame('main').set('account1', acc).set('amount', D(amt)).at('main', `account1 has 5000.0. We try to withdraw ${javaDouble(amt)}.`);
        R.frame('withdraw').set('this', acc).set('amount', D(amt));
        if (amt <= 0) {
          const ex = R.obj('InvalidAccountException', { message: 'Withdrawal amount must be positive.' });
          R.at('t1', 'Not a positive amount → **throw** the checked InvalidAccountException.');
          R.ret().at('call', 'withdraw stops; the rest of the try block is skipped.');
          R.at('c1', 'Is it an InsufficientFundsException? No.');
          R.set('e', ex).at('c2', 'It is an InvalidAccountException → this handler runs.');
          R.println('Caught InvalidAccount...: Withdrawal amount must be positive.').at('m2');
        } else if (amt > 5000) {
          R.at('t1', 'The amount is positive.');
          const ex = R.obj('InsufficientFundsException', { message: 'Insufficient funds.' });
          R.at('t2', '10000.0 > 5000.0 → **throw** the unchecked InsufficientFundsException. balance is not touched.');
          R.ret().at('call');
          R.set('e', ex).at('c1', 'The first catch matches.');
          R.println('Caught Insufficient...: Insufficient funds.').at('m1');
        } else {
          R.at('t1').at('t2', 'Positive and not more than the balance: no exception.');
          R.setf(acc, 'balance', D(5000 - amt)).at('sub', `balance = 5000.0 − ${javaDouble(amt)} = ${javaDouble(5000 - amt)}`);
          R.ret().at('call');
          R.println('Withdrawal successful.').at('ok', 'Both catch blocks are skipped.');
        }
        R.del('e').println('Finally block runs.').at('fin', '**finally** runs in every case: success, either exception.');
      }
    }))
  },

  /* ---------------- Lab 7 ---------------- */
  'lab7-states': {
    code: `
public class Lab7Demo {
    public static void main(String[] args)   @@main
            throws InterruptedException {
        Counter counter = new Counter("SharedCounter", 0);                    @@c
        IncrementThread inc =   @@t1
            new IncrementThread("Inc-1", counter, 3);
        Thread dec = new Thread(   @@t2
            new DecrementRunnable(counter, 2), "Dec-1");
        System.out.println(inc.getState() + " "   @@p1
                + dec.getState());
        inc.start();                                                           @@s1
        dec.start();                                                           @@s2
        // ... both threads now run their loops ...   @@run
        inc.join();                                                            @@j1
        dec.join();                                                            @@j2
        counter.display();                                                     @@d
    }
}`,
    run(R) {
      R.frame('main').at('main', 'Only one thread exists so far: **main**. The panel shows main’s stack.');
      const c = R.obj('Counter', { name: 'SharedCounter', value: 0 });
      R.set('counter', c).at('c');
      const t1 = R.obj('IncrementThread', { name: 'Inc-1', state: 'NEW', counter: c, iterations: 3 });
      R.set('inc', t1).at('t1', 'A Thread **object** on the heap. No new thread of execution exists yet: its state is NEW.');
      const task = R.obj('DecrementRunnable', { counter: c, iterations: 2 });
      const t2 = R.obj('Thread', { name: 'Dec-1', state: 'NEW', target: task });
      R.set('dec', t2).at('t2', 'The Runnable is only the task; the Thread object wraps it. Both workers point to the **same** Counter.');
      R.println('NEW NEW').at('p1');
      R.setf(t1, 'state', 'RUNNABLE').at('s1', '`start()` creates a new thread with **its own stack**, which calls run(). Inc-1 is now RUNNABLE.');
      R.setf(t2, 'state', 'RUNNABLE').at('s2', 'Now three threads run at once: main, Inc-1 and Dec-1.');
      [1, 2, 1, 2, 1].forEach((v, i) => {
        const who = i % 2 === 0 ? 'Inc-1' : 'Dec-1';
        R.setf(c, 'value', v).println(`${who} ${i % 2 === 0 ? 'incremented' : 'decremented'} SharedCounter to ${v}`)
          .at('run', `${who} changes the shared object. The order is decided by the scheduler, so it can differ on every run; synchronized methods stop updates from being lost.`);
      });
      R.setf(c, 'value', 0).println('Dec-1 decremented SharedCounter to 0').setf(t2, 'state', 'TERMINATED').at('run', 'Dec-1 has done its 2 decrements: its run() returns and the thread is TERMINATED.');
      R.setf(c, 'value', 1).println('Inc-1 incremented SharedCounter to 1').setf(t1, 'state', 'TERMINATED').at('run', 'Inc-1 finishes its 3rd increment: 3 − 2 = 1.');
      R.at('j1', '`join()` makes main **wait** until Inc-1 has terminated (it already has).');
      R.at('j2');
      R.println('SharedCounter = 1').at('d', 'Whatever the order, the final value is always 0 + 3 − 2 = 1. (The lab program uses three workers: 3 − 3 − 2 = −2.)');
    }
  },

  /* ---------------- Lab 8 ---------------- */
  'lab8-lock': {
    scenarioLabel: 'Transfer:',
    code: `
public void transfer(BankAccount target,   @@call
                     double amount) {
    BankAccount first, second;
    if (accountId.compareTo(target.accountId) < 0) {   @@cmp
        first = this;   second = target;                        @@a
    } else {
        first = target; second = this;                          @@b
    }
    synchronized (first) {                                      @@l1
        synchronized (second) {                                 @@l2
            this.withdraw(amount);                              @@w
            target.deposit(amount);                             @@d
        }                                                       @@u2
    }                                                           @@u1
}`,
    scenarios: [['A → B', 'SafeThread-1', true], ['B → A', 'SafeThread-2', false]].map(([label, thread, ab]) => ({
      label,
      run(R) {
        const A = R.obj('BankAccount', { accountId: 'ACC-A', balance: D(5000), lock: 'free' });
        const B = R.obj('BankAccount', { accountId: 'ACC-B', balance: D(3000), lock: 'free' });
        const src = ab ? A : B, dst = ab ? B : A;
        R.frame(`${ab ? 'A' : 'B'}.transfer (${thread})`).set('this', src).set('target', dst).set('amount', D(100)).at('call', `${thread} moves 100 from ${ab ? 'A to B' : 'B to A'}.`);
        R.at('cmp', `Compare the IDs: "${ab ? 'ACC-A' : 'ACC-B'}" vs "${ab ? 'ACC-B' : 'ACC-A'}" → ${ab ? 'smaller, so `this` goes first' : 'larger, so `target` goes first'}.`);
        R.set('first', A).set('second', B).at(ab ? 'a' : 'b', '**first = ACC-A in both directions.** That is the whole trick: every thread asks for the locks in the same order.');
        R.setf(A, 'lock', thread).at('l1', `${thread} holds A’s lock. A thread going the other way would also ask for A first, so it waits here instead of grabbing B.`);
        R.setf(B, 'lock', thread).at('l2', 'Now both locks are held.');
        R.setf(src, 'balance', D(ab ? 4900 : 2900)).at('w');
        R.setf(dst, 'balance', D(ab ? 3100 : 5100)).at('d', 'The money moves while both accounts are locked, so no other thread sees a half-done transfer.');
        R.setf(B, 'lock', 'free').at('u2');
        R.setf(A, 'lock', 'free').at('u1', 'Locks are released in reverse order. No circular wait is possible → **no deadlock**.');
      }
    }))
  },

  /* ---------------- Lab 9 ---------------- */
  'lab9-repaint': {
    code: `
public class DrawingPanel extends JPanel {
    private ArrayList<Shape> shapes = new ArrayList<>();          @@list
    public void addRectangle(int x, int y, int w, int h) {
        shapes.add(new RectangleShape(x, y, w, h,   @@addr
                                      currentColor));
        repaint();                                                  @@rep1
    }
    public void addCircle(int x, int y, int radius) {
        shapes.add(new CircleShape(x, y, radius,   @@addc
                                   currentColor));
        repaint();                                                  @@rep2
    }
    protected void paintComponent(Graphics g) {                     @@paint
        super.paintComponent(g);                                    @@clear
        for (Shape shape : shapes) {                                @@for
            shape.draw(g);                                          @@draw
        }
    }
}
// "Add Rectangle" clicked, then "Add Circle" clicked                @@click`,
    run(R) {
      const panel = R.obj('DrawingPanel', { currentColor: 'BLUE' });
      const list = R.arr('ArrayList<Shape>', []);
      R.setf(panel, 'shapes', list);
      R.frame('Event Dispatch Thread').set('panel', panel).at('list', 'The panel keeps a **model**: a list of shapes. The screen is drawn from this list.');
      R.at('click', 'The user clicks “Add Rectangle”. Swing calls the button’s actionPerformed, which calls addRectangle(…).');
      R.frame('addRectangle').set('this', panel);
      const r = R.obj('RectangleShape', { x: 120, y: 80, width: 100, height: 80, color: 'BLUE' });
      R.seti(list, 0, r).mark(list, 0).at('addr', 'Step 1: change the model.');
      R.at('rep1', 'Step 2: `repaint()` only **asks** Swing to redraw later. Never call paintComponent yourself.');
      R.ret();
      R.frame('addCircle').set('this', panel);
      const c = R.obj('CircleShape', { x: 300, y: 150, radius: 50, color: 'BLUE' });
      R.seti(list, 1, c).mark(list, 1).at('addc', 'A second click adds a CircleShape to the same list.');
      R.at('rep2');
      R.ret();
      R.frame('paintComponent').set('this', panel).set('g', 'Graphics').at('paint', 'Swing calls paintComponent when it is ready, with a Graphics object to draw on.');
      R.at('clear', 'super.paintComponent clears the old picture.');
      [[r, 'RectangleShape', 'fillRect + drawRect'], [c, 'CircleShape', 'fillOval + drawOval']].forEach(([o, cls, how], i) => {
        R.set('shape', o).mark(list, i).at('for');
        R.frame(cls + '.draw(g)').set('this', o).at('draw', `**Polymorphism**: the list holds Shape references; ${cls}’s own draw() runs (${how}).`);
        R.ret();
      });
      R.del('shape').at('for', 'Every shape in the model has been drawn: the screen matches the list.');
    }
  },

  /* ---------------- Lab 10 ---------------- */
  'lab10-ball': {
    code: `
public void update(int panelWidth, int panelHeight) {          @@upd
    x = x + vx;                                                @@x
    y = y + vy;                                                @@y
    if (x - radius < 0 || x + radius > panelWidth) {           @@test
        vx = -vx;                                              @@flip
        x = Math.max(radius,   @@clamp
                 Math.min(panelWidth - radius, x));
    }
}
public boolean collidesWith(Ball other) {                      @@col
    double dx = this.x - other.x, dy = this.y - other.y;       @@dxy
    return Math.sqrt(dx * dx + dy * dy)   @@ret
           <= this.radius + other.radius;
}
public void bounceOff(Ball other) {                            @@bo
    double tempVx = this.vx;                                   @@t
    this.vx = other.vx;                                        @@s1
    other.vx = tempVx;                                         @@s2
}`,
    run(R) {
      const b1 = R.obj('Ball', { x: D(178), y: D(100), vx: D(12), vy: D(0), radius: D(15) });
      const b2 = R.obj('Ball', { x: D(160), y: D(100), vx: D(-4), vy: D(0), radius: D(15) });
      R.frame('AnimationThread.run').set('ball1', b1).set('ball2', b2).set('panelWidth', 200);
      R.frame('ball1.update').set('this', b1).set('panelWidth', 200).at('upd', 'One frame for ball1, which is near the right wall of a 200-pixel-wide panel.');
      R.setf(b1, 'x', D(190)).at('x', 'Move: x = 178 + 12 = 190.');
      R.at('y', 'vy is 0, so y stays 100.');
      R.at('test', 'Right edge: 190 + 15 = 205 > 200 → the ball pokes out of the panel.');
      R.setf(b1, 'vx', D(-12)).at('flip', 'Reverse the horizontal velocity: it will move left from now on.');
      R.setf(b1, 'x', D(185)).at('clamp', 'Push it back inside: min(200 − 15, 190) = 185.');
      R.ret().frame('ball2.update').set('this', b2).set('panelWidth', 200);
      R.setf(b2, 'x', D(156)).at('x', 'ball2 moves too: 160 − 4 = 156.');
      R.at('test', '156 − 15 = 141 and 156 + 15 = 171: inside the panel, no wall bounce.');
      R.ret().frame('ball1.collidesWith(ball2)').set('this', b1).set('other', b2).at('col', 'After every ball has moved, each pair is checked once.');
      R.set('dx', D(29)).set('dy', D(0)).at('dxy', 'dx = 185 − 156 = 29, dy = 0.');
      R.set('(returns)', true).at('ret', 'Distance 29 ≤ 15 + 15 = 30 → **true**: the balls overlap.');
      R.ret().frame('ball1.bounceOff(ball2)').set('this', b1).set('other', b2).at('bo', 'They touch, so they swap velocities (a simple bounce).');
      R.set('tempVx', D(-12)).at('t', 'Keep ball1’s vx before overwriting it.');
      R.setf(b1, 'vx', D(-4)).at('s1');
      R.setf(b2, 'vx', D(-12)).at('s2', 'Swapped: ball1 now drifts slowly, ball2 speeds off to the left. Then the panel repaints the frame.');
    }
  },

  /* ================= more lab traces ================= */

  /* ---------------- Lab 1: switch ---------------- */
  'lab1-switch': {
    code: `
public class Lab1Demo {
    public static void main(String[] args) {      @@main
        int score = SCORE;                         @@score
        char grade;                                @@decl
        switch (score / 10) {                      @@sw
            case 10:                               @@c10
            case 9:                                @@c9
                grade = 'A';                       @@a
                break;                             @@ba
            case 8:                                @@c8
                grade = 'B';                       @@b
                break;                             @@bb
            case 7:                                @@c7
                grade = 'C';                       @@c
                break;                             @@bc
            default:                               @@def
                grade = 'F';                       @@f
        }
        System.out.println("Score: " + score + " => Grade: " + grade);   @@p
    }
}`,
    scenarioLabel: 'SCORE =',
    scenarios: [85, 100, 92, 42].map((score) => ({
      label: String(score),
      run(R) {
        R.frame('main').at('main');
        R.set('score', score).at('score');
        R.set('grade', U).at('decl', '`grade` is declared but has no value yet. Java will not let you print it until every path assigns it.');
        const k = Math.trunc(score / 10);
        R.at('sw', `switch evaluates the expression **once**: ${score} / 10 = ${k} (integer division).`);
        const cases = [[10, 'c10'], [9, 'c9'], [8, 'c8'], [7, 'c7']];
        const hit = cases.findIndex(([v]) => v === k);
        let g;
        if (hit < 0) {
          R.at('def', `No case matches ${k}, so execution jumps to **default**.`);
          g = 'F'; R.set('grade', C(g)).at('f');
        } else {
          R.at(cases[hit][1], `case ${k} matches: execution **jumps** straight here, skipping the cases above.`);
          if (k === 10) R.at('c9', '`case 10:` has no statements and no break, so execution **falls through** into case 9. That is how 100 and 90–99 share one grade.');
          const body = { 10: ['a', 'ba', 'A'], 9: ['a', 'ba', 'A'], 8: ['b', 'bb', 'B'], 7: ['c', 'bc', 'C'] }[k];
          g = body[2]; R.set('grade', C(g)).at(body[0]);
          R.at(body[1], '`break` leaves the switch. Without it, execution would fall through and overwrite grade.');
        }
        R.println(`Score: ${score} => Grade: ${g}`).at('p');
      }
    }))
  },

  /* ---------------- Lab 2: methods change the object's state ---------------- */
  'lab2-methods': {
    code: `
public class Car {
    private String make;
    private int speed;
    private double fuelLevel;

    public void accelerate(int delta) {                       @@acc
        if (delta > 0) this.speed = this.speed + delta;       @@acc1
    }
    public void brake(int delta) {                            @@br
        if (delta > 0) this.speed = Math.max(0, this.speed - delta);   @@br1
    }
    public void refuel(double amount) {                       @@rf
        if (amount > 0.0) this.fuelLevel = Math.min(100.0, this.fuelLevel + amount);   @@rf1
    }
}
public class Lab2Demo {
    public static void main(String[] args) {                  @@main
        Car car1 = new Car("Sedan", 80.5);                    @@c1
        Car car2 = new Car("SUV", 100.0);                     @@c2
        car1.accelerate(30);                                  @@a30
        car1.brake(10);                                       @@b10
        car1.brake(100);                                      @@b100
        car2.refuel(5.0);                                     @@r5
        Car car3 = car1;                                      @@c3
        car3.accelerate(20);                                  @@a20
        System.out.println(car1.getSpeed());                  @@p
    }
}`,
    run(R) {
      R.frame('main').at('main');
      const c1 = R.obj('Car', { make: 'Sedan', speed: 0, fuelLevel: D(80.5) }); R.set('car1', c1).at('c1');
      const c2 = R.obj('Car', { make: 'SUV', speed: 0, fuelLevel: D(100) }); R.set('car2', c2).at('c2', 'Two objects, each with its **own** copy of the three private fields.');
      const call = (o, name, line, param, arg, body, note, change) => {
        R.at(line);
        R.frame(`${name}(${param})`).set('this', o).set(param.split(' ')[1], arg).at(body.split('|')[0], `Inside the method, \`this\` is the object the call was made on.`);
        change(); R.at(body.split('|')[1], note);
        R.ret();
      };
      call(c1, 'accelerate', 'a30', 'int delta', 30, 'acc|acc1', '30 > 0, so speed = 0 + 30 = 30.', () => R.setf(c1, 'speed', 30));
      call(c1, 'brake', 'b10', 'int delta', 10, 'br|br1', 'speed = max(0, 30 − 10) = 20.', () => R.setf(c1, 'speed', 20));
      call(c1, 'brake', 'b100', 'int delta', 100, 'br|br1', '30 − 100 would be negative. `Math.max(0, …)` keeps it at **0**: the method protects the object from an impossible state.', () => R.setf(c1, 'speed', 0));
      call(c2, 'refuel', 'r5', 'double amount', D(5), 'rf|rf1', '100 + 5 = 105, but `Math.min(100.0, …)` caps the tank at **100.0**. Only car2 is touched.', () => R.setf(c2, 'fuelLevel', D(100)));
      R.set('car3', c1).at('c3', '`car3 = car1` copies the **reference**, not the object. Both arrows point at the same Car.');
      call(c1, 'accelerate', 'a20', 'int delta', 20, 'acc|acc1', 'Called through car3, but it changes the one shared object.', () => R.setf(c1, 'speed', 20));
      R.println('20').at('p', 'car1.getSpeed() is 20: car1 and car3 are two names for the same object.');
    }
  },

  /* ---------------- Lab 3: copy constructor ---------------- */
  'lab3-copy': {
    code: `
public class Rectangle {
    private double width, height;
    private String colour;

    public Rectangle(double width, double height, String colour) {   @@full
        this.width = width; this.height = height;                     @@wh
        this.colour = colour;                                         @@col
    }
    public Rectangle(Rectangle other) {                               @@copy
        this(other.width, other.height, other.colour);                @@chain
    }
    public void setColour(String c) { this.colour = c; }              @@set
}
public class Lab3Demo {
    public static void main(String[] args) {                          @@main
        Rectangle r3 = new Rectangle(3.0, 6.0, "Blue");               @@r3
        Rectangle r4 = new Rectangle(r3);      // copy                @@r4
        Rectangle r5 = r3;                     // alias               @@r5
        r3.setColour("Green");                                        @@g
        System.out.println(r4.colour + " " + r5.colour);              @@p
    }
}`,
    run(R) {
      R.frame('main').at('main');
      const blank = () => ({ width: D(0), height: D(0), colour: null });
      const a = R.obj('Rectangle', blank());
      R.frame('Rectangle(double, double, String)').set('this', a).set('width', D(3)).set('height', D(6)).set('colour', 'Blue').at('full', '`new` makes an object with default field values, then the constructor fills them in.');
      R.setf(a, 'width', D(3)).setf(a, 'height', D(6)).at('wh');
      R.setf(a, 'colour', 'Blue').at('col');
      R.ret().set('r3', a).at('r3');
      const b = R.obj('Rectangle', blank());
      R.frame('Rectangle(Rectangle other)').set('this', b).set('other', a).at('copy', 'The copy constructor gets a reference to the **original** and a brand-new, empty object.');
      R.at('chain', '`this(…)` passes the original’s values to the full constructor, so the copy is built the same way as any rectangle.');
      R.frame('Rectangle(double, double, String)').set('this', b).set('width', D(3)).set('height', D(6)).set('colour', 'Blue').at('full');
      R.setf(b, 'width', D(3)).setf(b, 'height', D(6)).at('wh');
      R.setf(b, 'colour', 'Blue').at('col');
      R.ret().at('chain');
      R.ret().set('r4', b).at('r4', 'r4 refers to a **second, independent** object with equal values.');
      R.set('r5', a).at('r5', 'r5 is just another name for r3’s object: no new object is made.');
      R.frame('setColour(String c)').set('this', a).set('c', 'Green').setf(a, 'colour', 'Green').at('set', 'Changing the original…');
      R.ret().at('g', '…changes what r3 **and** r5 see, but not the copy.');
      R.println('Blue Green').at('p', 'Copy: still Blue. Alias: Green. That is the difference between copying an object and copying a reference.');
    }
  },

  /* ---------------- Lab 4: instanceof and casting ---------------- */
  'lab4-cast': {
    code: `
public class Lab4Demo {
    public static void main(String[] args) {                         @@main
        Vehicle[] list = { new Car("Honda Civic", 2021, 2, 60.0),     @@arr
                           new Motorcycle("Harley-Davidson", 2022, false) };
        for (Vehicle v : list) {                                      @@for
            if (v instanceof Car) {                                   @@if
                Car c = (Car) v;                                      @@cast
                System.out.println("doors: " + c.getNumDoors());      @@doors
            } else {
                System.out.println(v.make + " is not a Car");         @@not
            }
        }
        Car bad = (Car) list[1];                                      @@bad
    }
}`,
    run(R) {
      R.frame('main').at('main');
      const car = R.obj('Car', { make: 'Honda Civic', year: 2021, speed: 0, numDoors: 2, fuelLevel: D(60) });
      const moto = R.obj('Motorcycle', { make: 'Harley-Davidson', year: 2022, speed: 0, hasStorage: false });
      const arr = R.arr('Vehicle[]', [car, moto]);
      R.set('list', arr).at('arr', 'A Vehicle[] can hold any kind of Vehicle. Look at the **real** class written on each object.');
      R.set('v', car).mark(arr, [0]).at('for', 'v is declared as Vehicle, so the compiler only lets you call Vehicle methods on it. `v.getNumDoors()` would not compile.');
      R.at('if', '`instanceof` asks the **object**: are you a Car? This one is → true.');
      R.set('c', car).at('cast', 'The cast creates no new object. It is the **same** reference, now with type Car, so Car methods are allowed.');
      R.println('doors: 2').at('doors');
      R.del('c').set('v', moto).mark(arr, [1]).at('for');
      R.at('if', 'A Motorcycle is not a Car → false. The cast is skipped, so nothing can go wrong.');
      R.println('Harley-Davidson is not a Car').at('not');
      R.del('v').at('bad', 'Now a cast **without** a check…');
      const ex = R.obj('ClassCastException', { message: 'class Motorcycle cannot be cast to class Car' });
      R.set('(throws)', ex).at('bad', 'It compiles (a Vehicle **might** be a Car), but at run time the object is a Motorcycle → ClassCastException. Always check with instanceof first.');
    }
  },

  /* ---------------- Lab 5: abstract class constructors ---------------- */
  'lab5-abstract': {
    code: `
public abstract class Animal {
    protected String name;
    protected int age;
    protected Animal(String name, int age) {                  @@actor
        this.name = name;                                     @@an
        this.age = (age >= 0) ? age : 0;                      @@aa
    }
    public abstract void makeSound();
    public void displayInfo() {                               @@info
        System.out.println("Name: " + name + ", Age: " + age + " years");   @@infop
    }
}
public class Dog extends Animal implements Drawable {
    private String breed;
    public Dog(String name, int age, String breed) {          @@dctor
        super(name, age);                                     @@sup
        this.breed = breed;                                   @@db
    }
    public void makeSound() {                                 @@snd
        System.out.println(name + " barks: Woof! Woof!");     @@sndp
    }
}
public class Lab5Demo {
    public static void main(String[] args) {                  @@main
        // Animal x = new Animal("?", 1);   compile error: abstract
        Animal a = new Dog("Rex", 3, "Labrador");             @@new
        a.displayInfo();                                      @@di
        a.makeSound();                                        @@ms
    }
}`,
    run(R) {
      R.frame('main').at('main', 'You can never write `new Animal(…)`: an abstract class is incomplete. But it can still have a constructor…');
      const d = R.obj('Dog', { 'name (Animal)': null, 'age (Animal)': 0, breed: null });
      R.at('new', 'One Dog object is created. It has room for the fields it inherits from Animal **and** its own breed.');
      R.frame('Dog(String, int, String)').set('this', d).set('name', 'Rex').set('age', 3).set('breed', 'Labrador').at('dctor');
      R.at('sup', '`super(name, age)` runs Animal’s constructor on this same object…');
      R.frame('Animal(String, int)').set('this', d).set('name', 'Rex').set('age', 3).at('actor', '…so the abstract class’s constructor **does** run, just never on its own.');
      R.setf(d, 'name (Animal)', 'Rex').at('an');
      R.setf(d, 'age (Animal)', 3).at('aa', 'The shared validation (no negative ages) lives in one place for every animal.');
      R.ret().setf(d, 'breed', 'Labrador').at('db', 'Back in Dog: now the Dog-only field.');
      R.ret().set('a', d).at('new', 'The reference type is Animal; the object is a Dog.');
      R.frame('Animal.displayInfo()').set('this', d).at('info', 'displayInfo() is a normal method written **once** in Animal and inherited by Dog, Bird and Fish.');
      R.println('Name: Rex, Age: 3 years').at('infop');
      R.ret().at('ms', 'makeSound() is abstract in Animal: there is no code there. Java runs the object’s own version.');
      R.frame('Dog.makeSound()').set('this', d).println('Rex barks: Woof! Woof!').at('sndp');
      R.ret().at('ms', 'Abstract class: shared fields, constructor and methods. Abstract methods: the parts each subclass **must** fill in.');
    }
  },

  /* ---------------- Lab 6: wrapping an exception ---------------- */
  'lab6-wrap': {
    code: `
public void transfer(BankAccount target, double amount)            @@tr
        throws TransactionException {
    try {
        this.withdraw(amount);                                     @@wd
        target.deposit(amount);                                    @@dep
    } catch (InsufficientFundsException e) {                       @@catch
        throw new TransactionException(                            @@wrap
            "Transfer failed: insufficient funds in source account.", e);
    }
}
public void withdraw(double amount) {                              @@w
    if (amount > balance)                                          @@if
        throw new InsufficientFundsException(                      @@thr
            "Insufficient funds. Requested: " + amount + ", Available: " + balance);
    balance = balance - amount;
}
// in main:
try {
    account2.transfer(account1, 5000.0);                           @@call
} catch (TransactionException e) {                                 @@mc
    System.out.println("Caught TransactionException: " + e.getMessage());   @@pm
    System.out.println("Root cause: " + e.getCause().getMessage());         @@pc
}`,
    run(R) {
      R.frame('main');
      const a1 = R.obj('BankAccount', { accountNumber: 'ACC001', owner: 'Alice', balance: D(4000) });
      const a2 = R.obj('BankAccount', { accountNumber: 'ACC002', owner: 'Bob', balance: D(4000) });
      R.set('account1', a1).set('account2', a2).at('call', 'After the successful transfer earlier in the lab, both accounts hold 4000.0. Now Bob tries to send 5000.0.');
      R.frame('transfer(BankAccount target, double amount)').set('this', a2).set('target', a1).set('amount', D(5000)).at('tr');
      R.at('wd');
      R.frame('withdraw(double amount)').set('this', a2).set('amount', D(5000)).at('w');
      R.at('if', '5000.0 > 4000.0: not enough money.');
      const low = R.obj('InsufficientFundsException', { message: 'Insufficient funds. Requested: 5000.0, Available: 4000.0', cause: null });
      R.set('(throws)', low).at('thr', 'withdraw throws a **low-level** exception that describes exactly what went wrong.');
      R.ret().set('e', low).at('catch', 'transfer catches it. deposit() never ran, so no money moved.');
      const high = R.obj('TransactionException', { message: 'Transfer failed: insufficient funds in source account.', cause: low });
      R.set('(throws)', high).at('wrap', 'It throws a **new**, higher-level exception and passes `e` as its **cause**. Follow the arrow: the original is kept, not lost.');
      R.ret().set('e', high).at('mc', 'main only needs to know about one kind of failure: TransactionException.');
      R.println('Caught TransactionException: Transfer failed: insufficient funds in source account.').at('pm');
      R.println('Root cause: Insufficient funds. Requested: 5000.0, Available: 4000.0').at('pc', '`getCause()` follows the arrow back to the original exception for the details.');
    }
  },

  /* ---------------- Lab 7: start() vs run() ---------------- */
  'lab7-startrun': {
    code: `
class Greeter extends Thread {
    public void run() {                                                   @@run
        System.out.println("run() on " + Thread.currentThread().getName());   @@pr
    }
}
public class StartVsRun {
    public static void main(String[] args) {                              @@main
        Greeter g = new Greeter();                                        @@new
        g.run();      // 1. a plain method call                           @@r
        g.start();    // 2. a new thread calls run()                      @@s
        System.out.println("main continues");                             @@mc
    }
}`,
    run(R) {
      R.thread('main', 'RUNNABLE').frame('main').at('main');
      const g = R.obj('Greeter', { name: 'Thread-0', state: 'NEW' });
      R.tstate('Thread-0', 'NEW').set('g', g).at('new', 'A Thread object named Thread-0. No thread of execution exists for it yet.');
      R.at('r', 'Calling `run()` directly is an ordinary method call…');
      R.frame('Greeter.run()').set('this', g).at('run', '…so its frame goes on **main’s** stack. Thread-0 is still NEW.');
      R.println('run() on main').at('pr', 'currentThread() is **main**. Nothing ran concurrently.');
      R.ret().at('r');
      R.tstate('Thread-0', 'RUNNABLE').setf(g, 'state', 'RUNNABLE').at('s', '`start()` asks the JVM for a **new thread** with its own stack, then returns at once.');
      R.println('main continues').at('mc', 'main did not wait. Which line prints first from here on is up to the scheduler.');
      R.ret().tstate('main', 'TERMINATED').at('mc', 'main has finished, but the program keeps running while Thread-0 is alive.');
      R.thread('Thread-0').frame('Greeter.run()').set('this', g).at('run', 'The new thread calls run() on **its own** stack.');
      R.println('run() on Thread-0').at('pr', 'Same method, different thread. Calling start() a second time would throw IllegalThreadStateException.');
      R.ret().tstate('Thread-0', 'TERMINATED').setf(g, 'state', 'TERMINATED').at('run', 'run() returns: Thread-0 is TERMINATED and the program ends.');
    }
  },

  /* ---------------- Lab 8: how a deadlock happens ---------------- */
  'lab8-deadlock': {
    code: `
public class DeadlockProneTransfer implements Runnable {
    private BankAccount from, to;
    private double amount;
    // Inconsistent lock ordering: source first, then target.
    public void run() {                                          @@run
        synchronized (from) {                                    @@l1
            System.out.println(name + " locked " + from.getAccountId());   @@p1
            Thread.sleep(100);                                   @@sl
            synchronized (to) {                                  @@l2
                System.out.println(name + " locked " + to.getAccountId());   @@p2
                from.withdraw(amount);                           @@w
                to.deposit(amount);                              @@d
            }                                                    @@u2
        }                                                        @@u1
    }
}
// main: new Thread(new DeadlockProneTransfer(acc1, acc2, 500), "T1").start();   @@m1
//       new Thread(new DeadlockProneTransfer(acc2, acc1, 300), "T2").start();   @@m2`,
    scenarioLabel: 'Timing:',
    scenarios: [{ label: 'Both sleep (deadlock)', dead: true }, { label: 'T1 finishes first', dead: false }].map((sc) => ({
      label: sc.label,
      run(R) {
        R.thread('main', 'RUNNABLE').frame('main');
        const A = R.obj('BankAccount', { accountId: 'ACC-001', balance: D(5000), 'lock owner': null });
        const B = R.obj('BankAccount', { accountId: 'ACC-002', balance: D(3000), 'lock owner': null });
        const j1 = R.obj('DeadlockProneTransfer', { from: A, to: B, amount: D(500) });
        R.set('t1Task', j1).tstate('T1', 'RUNNABLE').at('m1', 'T1 will move 500 from ACC-001 to ACC-002: it locks **from** (ACC-001) first.');
        const j2 = R.obj('DeadlockProneTransfer', { from: B, to: A, amount: D(300) });
        R.set('t2Task', j2).tstate('T2', 'RUNNABLE').at('m2', 'T2 goes the **other way**: from ACC-002 to ACC-001, so it locks ACC-002 first.');
        R.ret().tstate('main', 'TERMINATED');
        const lock = (who, acc) => R.setf(acc, 'lock owner', who);
        R.thread('T1').frame('run()').set('this', j1).at('run');
        lock('T1', A); R.at('l1', 'T1 takes the lock on ACC-001.');
        R.println('T1 locked ACC-001').at('p1');
        if (sc.dead) {
          R.thread('T1', 'TIMED_WAITING').at('sl', 'T1 sleeps for 100 ms **while still holding** ACC-001.');
          R.thread('T2').frame('run()').set('this', j2).at('run', 'Meanwhile T2 gets the CPU.');
          lock('T2', B); R.at('l1', 'T2 takes the lock on ACC-002 (nobody holds it).');
          R.println('T2 locked ACC-002').at('p1');
          R.thread('T2', 'TIMED_WAITING').at('sl', 'T2 also sleeps, holding ACC-002.');
          R.tstate('T2', 'RUNNABLE').thread('T1', 'RUNNABLE').at('l2', 'T1 wakes up and now needs ACC-002…');
          R.thread('T1', 'BLOCKED').at('l2', '…but T2 holds it. T1 is **BLOCKED**, still holding ACC-001.');
          R.thread('T2', 'RUNNABLE').at('l2', 'T2 wakes up and needs ACC-001…');
          R.thread('T2', 'BLOCKED').at('l2', '…which T1 holds. Each thread holds one lock and waits for the other: a **circular wait**. Neither can ever continue: **deadlock**. The program hangs with no error.');
          R.at('l2', 'Fix used in the lab’s transfer(): every thread locks the account with the **smaller ID first**. Then T2 would also start with ACC-001 and simply wait its turn.');
        } else {
          R.thread('T1', 'TIMED_WAITING').at('sl', 'T1 sleeps holding ACC-001. This time T2 does not get scheduled before T1 wakes.');
          R.thread('T1', 'RUNNABLE').at('l2');
          lock('T1', B); R.at('l2', 'ACC-002 is free, so T1 takes it too.');
          R.println('T1 locked ACC-002').at('p2');
          R.setf(A, 'balance', D(4500)).at('w');
          R.setf(B, 'balance', D(3500)).at('d');
          lock(null, B); R.at('u2', 'Releases ACC-002…');
          lock(null, A); R.at('u1', '…and ACC-001.');
          R.ret().tstate('T1', 'TERMINATED');
          R.thread('T2').frame('run()').set('this', j2).at('run', 'Now T2 runs and finds both locks free.');
          lock('T2', B); R.at('l1');
          lock('T2', A); R.at('l2');
          R.setf(B, 'balance', D(3200)).at('w');
          R.setf(A, 'balance', D(4800)).at('d');
          lock(null, A); R.at('u2'); lock(null, B); R.at('u1');
          R.ret().tstate('T2', 'TERMINATED').at('u1', 'It worked **this time**, only because of lucky timing. A program that can deadlock will, eventually.');
        }
      }
    }))
  },

  /* ---------------- Lab 9: the Event Dispatch Thread ---------------- */
  'lab9-edt': {
    code: `
public class Lab9Demo {
    public static void main(String[] args) {                  @@main
        SwingUtilities.invokeLater(new Runnable() {           @@inv
            public void run() {                               @@run
                new DrawingApp();                             @@new
            }
        });
    }                                                         @@end
}
public class DrawingApp extends JFrame {
    public DrawingApp() {                                     @@ctor
        setTitle("Drawing Application");                      @@title
        setupUI();                                            @@ui
        addActionListeners();                                 @@al
        setVisible(true);                                     @@vis
    }
    // rectangleButton's listener:
    public void actionPerformed(ActionEvent e) {              @@act
        drawingPanel.addShape(new RectangleShape(...));       @@add
        drawingPanel.repaint();                               @@rep
    }
}`,
    run(R) {
      R.thread('main', 'RUNNABLE').frame('main').at('main', 'The program starts on the **main** thread.');
      const q = R.obj('EventQueue', { pending: null });
      const job = R.obj('Runnable (anonymous)', {});
      R.setf(q, 'pending', job).tstate('AWT-EventQueue-0', 'RUNNABLE').at('inv', '`invokeLater` does **not** build the window. It puts a Runnable on the Event Dispatch Thread’s queue and returns.');
      R.at('end', 'main has nothing else to do and ends. Swing keeps the program alive.');
      R.ret().tstate('main', 'TERMINATED');
      R.thread('AWT-EventQueue-0').setf(q, 'pending', null).frame('run()').set('this', job).at('run', 'The **EDT** takes the job from its queue and runs it. All Swing work happens on this one thread.');
      const app = R.obj('DrawingApp', { title: '', visible: false, shapes: 0 });
      R.at('new');
      R.frame('DrawingApp()').set('this', app).at('ctor');
      R.setf(app, 'title', 'Drawing Application').at('title');
      R.at('ui', 'setupUI() builds the panels, buttons and combo box.');
      R.at('al', 'addActionListeners() registers code to run **later**, when a button is clicked.');
      R.setf(app, 'visible', true).at('vis', 'The window appears.');
      R.ret().ret().at('end', 'The job is done. The EDT now waits for the next event: it never runs your code on its own.');
      const ev = R.obj('ActionEvent', { command: 'Add Rectangle' });
      R.setf(q, 'pending', ev).at('act', 'The user clicks **Add Rectangle**. The operating system’s click becomes an ActionEvent in the queue.');
      R.setf(q, 'pending', null).frame('actionPerformed(ActionEvent e)').set('this', app).set('e', ev).at('act', 'The EDT calls the listener.');
      R.setf(app, 'shapes', 1).at('add', 'The **model** changes: the panel now has one shape in its list.');
      R.at('rep', '`repaint()` does not draw immediately: it puts a paint request in the queue.');
      R.ret().frame('paintComponent(Graphics g)').set('this', app).at('rep', 'After the listener returns, the EDT handles the paint request and draws every shape in the list.');
      R.ret().at('end', 'Because everything runs on one thread, a slow listener would freeze the whole window: long work belongs in a separate thread (Lab 10).');
    }
  },

  /* ---------------- Lab 10: the animation thread and the EDT ---------------- */
  'lab10-worker': {
    code: `
public class AnimationThread implements Runnable {
    public void run() {                                     @@run
        while (true) {                                      @@loop
            panel.updateAnimation();                        @@upd
            panel.repaint();                                @@rep
            Thread.sleep(sleepTime);   // about 16 ms       @@sleep
        }
    }
}
public class AnimationPanel extends JPanel {
    public synchronized void updateAnimation() {            @@ua
        for (Ball ball : balls) ball.move();                @@move
    }
    protected void paintComponent(Graphics g) {             @@pc
        synchronized (this) {                               @@psync
            for (Ball ball : balls) ball.draw(g2d);         @@draw
        }
    }
}`,
    run(R) {
      R.thread('Animator', 'RUNNABLE');
      R.tstate('main', 'TERMINATED').tstate('AWT-EventQueue-0', 'WAITING');
      const ball = R.obj('Ball', { x: 100, vx: 4 });
      const balls = R.arr('ArrayList<Ball>', [ball]);
      const panel = R.obj('AnimationPanel', { balls, 'lock owner': null, 'paint requested': false });
      R.frame('run()').set('panel', panel).at('run', 'Two threads share one panel: the **Animator** moves the balls, the **EDT** draws them.');
      let x = 100;
      for (let f = 1; f <= 2; f++) {
        R.at('loop', `Frame ${f}.`);
        R.at('upd');
        R.frame('updateAnimation()').set('this', panel).setf(panel, 'lock owner', 'Animator').at('ua', 'synchronized: the Animator takes the panel’s lock while it changes the balls.');
        x += 4; R.setf(ball, 'x', x).at('move', `The ball moves by vx: x = ${x}.`);
        if (f === 1) {
          R.thread('AWT-EventQueue-0', 'RUNNABLE').frame('paintComponent(Graphics g)').set('this', panel).at('pc', 'Suppose the EDT wants to paint right now (a window resize, say)…');
          R.thread('AWT-EventQueue-0', 'BLOCKED').at('psync', '…but the Animator holds the lock, so the EDT is **BLOCKED**. It can never draw a half-moved frame.');
          R.thread('Animator');
        }
        R.setf(panel, 'lock owner', null).ret().at('upd', 'updateAnimation() returns and releases the lock.');
        if (f === 1) {
          R.thread('AWT-EventQueue-0', 'RUNNABLE').setf(panel, 'lock owner', 'EDT').at('psync', 'The EDT gets the lock now.');
          R.at('draw', `It draws the ball at x = ${x}.`);
          R.setf(panel, 'lock owner', null).ret().tstate('AWT-EventQueue-0', 'WAITING').at('psync', 'Done: the EDT releases the lock and waits for the next event.');
          R.thread('Animator');
        }
        R.setf(panel, 'paint requested', true).at('rep', '`repaint()` only **asks** for a paint: it queues a request for the EDT and returns at once.');
        R.thread('Animator', 'TIMED_WAITING').at('sleep', 'The Animator sleeps ≈16 ms, so the loop runs about 60 times a second. It is TIMED_WAITING.');
        R.thread('AWT-EventQueue-0', 'RUNNABLE').setf(panel, 'paint requested', false).frame('paintComponent(Graphics g)').set('this', panel).at('pc', 'While the Animator sleeps, the EDT handles the paint request.');
        R.setf(panel, 'lock owner', 'EDT').at('psync');
        R.at('draw', `The screen now shows the ball at x = ${x}.`);
        R.setf(panel, 'lock owner', null).ret().tstate('AWT-EventQueue-0', 'WAITING').at('psync');
        R.thread('Animator', 'RUNNABLE');
      }
      R.at('loop', 'And so on, forever. If this loop ran on the EDT instead, the EDT would never be free to paint or react to clicks: the window would freeze.');
    }
  }
});

