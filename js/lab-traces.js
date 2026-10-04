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
});
