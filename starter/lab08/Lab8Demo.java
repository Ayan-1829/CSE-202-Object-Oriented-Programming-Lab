public class Lab8Demo {

    public static void main(String[] args) {

        // 1. Creating Accounts
        System.out.println("=== Synchronization and Deadlock Demo ===");
        BankAccount account1 = new BankAccount("ACC-001", 5000.0);
        BankAccount account2 = new BankAccount("ACC-002", 3000.0);
        System.out.println("\n=== Initial Account States ===");
        account1.display();
        account2.display();

        // 2. Safe Transfer using Lock Ordering
        System.out.println("\n=== Safe Transfer using Lock Ordering ===");
        account1.transfer(account2, 1000.0);
        System.out.println("\nAfter safe transfer:");
        account1.display();
        account2.display();

        // 3. Concurrent Safe Transfers
        System.out.println("\n=== Concurrent Safe Transfers ===");
        BankAccount safeAccount1 = new BankAccount("ACC-001", 5000.0);
        BankAccount safeAccount2 = new BankAccount("ACC-002", 3000.0);

        Thread safeThread1 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                safeAccount1.transfer(safeAccount2, 100.0);
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }, "SafeThread-1");

        Thread safeThread2 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                safeAccount2.transfer(safeAccount1, 100.0);
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }, "SafeThread-2");

        safeThread1.start();
        safeThread2.start();
        try {
            safeThread1.join();
            safeThread2.join();
        } catch (InterruptedException e) {
            System.out.println("Main thread interrupted.");
            Thread.currentThread().interrupt();
        }
        System.out.println("\nAfter concurrent safe transfers:");
        safeAccount1.display();
        safeAccount2.display();
        double safeTotal = safeAccount1.getBalance() + safeAccount2.getBalance();
        System.out.println("Total balance: " + safeTotal);

        // 4. Deadlock Risk Demonstration
        System.out.println("\n=== Deadlock Risk Demonstration ===");
        System.out.println("The following example starts two risky transfer tasks.");
        System.out.println("If both threads remain alive after timeout, deadlock is possible.");
        BankAccount riskAccount1 = new BankAccount("ACC-001", 5000.0);
        BankAccount riskAccount2 = new BankAccount("ACC-002", 3000.0);
        Thread riskyThread1 = new Thread(
                new DeadlockProneTransfer(riskAccount1, riskAccount2, 500.0), "RiskyThread-1");
        Thread riskyThread2 = new Thread(
                new DeadlockProneTransfer(riskAccount2, riskAccount1, 700.0), "RiskyThread-2");
        riskyThread1.start();
        riskyThread2.start();
        try {
            riskyThread1.join(3000);
            riskyThread2.join(3000);
        } catch (InterruptedException e) {
            System.out.println("Main thread interrupted during deadlock test.");
            Thread.currentThread().interrupt();
        }
        if (riskyThread1.isAlive() || riskyThread2.isAlive()) {
            System.out.println("\nPossible deadlock detected.");
            System.out.println("At least one risky thread did not finish within timeout.");
            System.out.println("This happens because locks may be acquired in opposite order.");
        } else {
            System.out.println("\nRisky threads completed in this run.");
            System.out.println("Deadlock did not occur this time, but the design is unsafe.");
        }

        // 5. Final Message
        System.out.println("\n=== Final Observation ===");
        System.out.println("Use consistent lock ordering to prevent circular wait.");
        System.out.println("Program demonstration completed.");
    }
}
