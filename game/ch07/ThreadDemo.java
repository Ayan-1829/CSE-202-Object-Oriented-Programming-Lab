public class ThreadDemo {
    public static void main(String[] args) throws InterruptedException {

        System.out.println("=== Creating three game threads ===");
        EnemySpawner spawner = new EnemySpawner(3);
        AmmoRegen regen = new AmmoRegen(10);
        Thread regenThread = new Thread(regen, "AmmoRegen");

        // Way 3: a lambda is a short Runnable
        Thread timer = new Thread(() -> {
            for (int s = 3; s >= 1; s--) {
                System.out.println("[Timer] " + s + "...");
                try {
                    Thread.sleep(400);
                } catch (InterruptedException e) {
                    return;
                }
            }
            System.out.println("[Timer] GO!");
        }, "Timer");

        System.out.println("spawner state before start(): " + spawner.getState());

        System.out.println("\n=== start(): all three run at the same time ===");
        spawner.start();
        regenThread.start();
        timer.start();
        Thread.sleep(100);
        System.out.println("[main] spawner state while sleeping: " + spawner.getState());

        // join(): main waits here until each thread has finished
        spawner.join();
        regenThread.join();
        timer.join();
        System.out.println("[main] all threads finished");
        System.out.println("spawner state after join(): " + spawner.getState());
        System.out.println("ammo after regen: " + regen.getAmmo());

        System.out.println("\n=== run() is just a method call ===");
        EnemySpawner direct = new EnemySpawner(1);
        direct.run();                       // no new thread: runs inside main
        System.out.println("direct state: " + direct.getState() + " (it never started)");
    }
}
