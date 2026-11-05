// Way 1: extend Thread and override run()
public class EnemySpawner extends Thread {
    private final int count;

    public EnemySpawner(int count) {
        super("Spawner");                   // the thread's name
        this.count = count;
    }

    @Override
    public void run() {
        String me = Thread.currentThread().getName();
        for (int i = 1; i <= count; i++) {
            System.out.println("[" + me + "] spawned Drone-" + i);
            try {
                Thread.sleep(300);          // TIMED_WAITING while asleep
            } catch (InterruptedException e) {
                System.out.println("[" + me + "] interrupted, stopping");
                return;
            }
        }
        System.out.println("[" + me + "] wave complete");
    }
}
