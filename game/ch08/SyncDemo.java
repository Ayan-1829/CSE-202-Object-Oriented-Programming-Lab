public class SyncDemo {

    static void pause(int ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    // Each soldier needs both items; first and second say which lock is taken first
    static Thread soldier(String name, Object first, String firstName, Object second, String secondName) {
        Thread t = new Thread(() -> {
            synchronized (first) {
                System.out.println("[" + name + "] has the " + firstName + ", wants the " + secondName);
                pause(100);
                synchronized (second) {
                    System.out.println("[" + name + "] has both items: patched up and reloaded");
                }
            }
        }, name);
        t.setDaemon(true);                  // lets the program exit even if it gets stuck
        return t;
    }

    public static void main(String[] args) throws InterruptedException {

        System.out.println("=== 1. Race condition: two players, one scoreboard ===");
        Scoreboard board = new Scoreboard();
        SquadMember a = new SquadMember("Alpha", board, false);
        SquadMember b = new SquadMember("Bravo", board, false);
        a.start(); b.start();
        a.join(); b.join();
        System.out.println("Unsafe: expected 200000, got " + board.getScore());

        System.out.println("\n=== 2. synchronized fixes it ===");
        board.reset();
        a = new SquadMember("Alpha", board, true);
        b = new SquadMember("Bravo", board, true);
        a.start(); b.start();
        a.join(); b.join();
        System.out.println("Safe:   expected 200000, got " + board.getScore());

        System.out.println("\n=== 3. Deadlock: opposite lock order ===");
        Object ammoCrate = new Object();
        Object medKit = new Object();
        Thread medic = soldier("Medic", medKit, "med kit", ammoCrate, "ammo crate");
        Thread gunner = soldier("Gunner", ammoCrate, "ammo crate", medKit, "med kit");
        medic.start(); gunner.start();
        medic.join(1000); gunner.join(1000);    // wait at most one second each
        if (medic.isAlive() && gunner.isAlive()) {
            System.out.println("DEADLOCK: each soldier holds one item and waits forever for the other");
            System.out.println("  Medic is " + medic.getState() + ", Gunner is " + gunner.getState());
        }

        System.out.println("\n=== 4. The fix: everyone locks in the same order ===");
        Object crate2 = new Object();       // the stuck soldiers still hold the first pair
        Object kit2 = new Object();
        Thread medic2 = soldier("Medic", crate2, "ammo crate", kit2, "med kit");
        Thread gunner2 = soldier("Gunner", crate2, "ammo crate", kit2, "med kit");
        medic2.start(); gunner2.start();
        medic2.join(); gunner2.join();
        System.out.println("No deadlock: both soldiers finished");

        System.out.println("\n=== 5. wait() and notifyAll(): supply drops ===");
        SupplyDepot depot = new SupplyDepot();
        Thread s1 = new Thread(() -> { try { depot.take(); } catch (InterruptedException e) { } }, "Soldier-1");
        Thread s2 = new Thread(() -> { try { depot.take(); } catch (InterruptedException e) { } }, "Soldier-2");
        s1.start(); s2.start();
        pause(200);                         // both soldiers arrive before the drop
        Thread heli = new Thread(() -> depot.drop(2), "Helicopter");
        heli.start();
        s1.join(); s2.join(); heli.join();
        System.out.println("Supply run finished");
    }
}
