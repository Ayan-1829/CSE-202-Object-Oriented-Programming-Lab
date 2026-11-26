public class Lab7Demo {

    public static void main(String[] args) {

        // 1. Shared Counter Creation
        System.out.println("=== Thread Creation and Lifecycle Demo ===");
        Counter counter = new Counter("SharedCounter", 0);
        System.out.println("Initial counter state:");
        counter.display();

        // 2. Creating Threads
        System.out.println("\n=== Creating Threads ===");
        IncrementThread incrementThread = new IncrementThread("IncrementThread-1", counter, 3);
        DecrementRunnable decrementTask1 = new DecrementRunnable(counter, 3);
        DecrementRunnable decrementTask2 = new DecrementRunnable(counter, 2);
        Thread decrementThread1 = new Thread(decrementTask1, "DecrementThread-1");
        Thread decrementThread2 = new Thread(decrementTask2, "DecrementThread-2");

        System.out.println("IncrementThread-1 state: " + incrementThread.getState());
        System.out.println("DecrementThread-1 state: " + decrementThread1.getState());
        System.out.println("DecrementThread-2 state: " + decrementThread2.getState());

        // 3. Starting Threads
        System.out.println("\n=== Starting Threads ===");
        incrementThread.start();
        decrementThread1.start();
        decrementThread2.start();
        System.out.println("All threads started.");
        System.out.println("IncrementThread-1 state after start: " + incrementThread.getState());
        System.out.println("DecrementThread-1 state after start: " + decrementThread1.getState());
        System.out.println("DecrementThread-2 state after start: " + decrementThread2.getState());

        // 4. Waiting for Threads using join()
        System.out.println("\n=== Waiting for Threads to Complete ===");
        try {
            incrementThread.join();
            System.out.println("IncrementThread-1 has terminated.");
            decrementThread1.join();
            System.out.println("DecrementThread-1 has terminated.");
            decrementThread2.join();
            System.out.println("DecrementThread-2 has terminated.");
        } catch (InterruptedException e) {
            System.out.println("Main thread was interrupted.");
            Thread.currentThread().interrupt();
        }

        // 5. Final State
        System.out.println("\n=== Final State ===");
        counter.display();
        System.out.println("IncrementThread-1 final state: " + incrementThread.getState());
        System.out.println("DecrementThread-1 final state: " + decrementThread1.getState());
        System.out.println("DecrementThread-2 final state: " + decrementThread2.getState());
        System.out.println("All threads have completed.");
        System.out.println("Main thread exiting.");
    }
}
