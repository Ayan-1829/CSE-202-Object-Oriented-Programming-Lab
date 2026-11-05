// Producer-consumer: a helicopter drops crates, soldiers take them
public class SupplyDepot {
    private int crates = 0;

    public synchronized void drop(int count) {
        crates += count;
        System.out.println("[" + Thread.currentThread().getName() + "] dropped " + count + " -> depot has " + crates);
        notifyAll();                        // wake everyone waiting for a crate
    }

    public synchronized void take() throws InterruptedException {
        String me = Thread.currentThread().getName();
        while (crates == 0) {
            System.out.println("[" + me + "] depot empty, waiting");
            wait();                         // releases the lock while waiting
        }
        crates--;
        System.out.println("[" + me + "] took a crate -> depot has " + crates);
    }
}
