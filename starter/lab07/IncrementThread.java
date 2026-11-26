public class IncrementThread extends Thread {

    private Counter counter;
    private int iterations;

    public IncrementThread(String name, Counter counter, int iterations) {
        super(name);
        this.counter = counter;
        this.iterations = iterations;
    }

    @Override
    public void run() {
        for (int i = 0; i < iterations; i++) {
            counter.increment();
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                System.out.println(getName() + " was interrupted.");
                Thread.currentThread().interrupt();
                break;
            }
        }
        System.out.println(getName() + " finished.");
    }
}
