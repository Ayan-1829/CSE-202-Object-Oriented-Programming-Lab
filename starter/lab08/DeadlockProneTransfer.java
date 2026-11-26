public class DeadlockProneTransfer implements Runnable {

    private BankAccount from;
    private BankAccount to;
    private double amount;

    public DeadlockProneTransfer(BankAccount from, BankAccount to, double amount) {
        this.from = from;
        this.to = to;
        this.amount = amount;
    }

    // Inconsistent lock ordering: source first, then target.
    @Override
    public void run() {
        synchronized (from) {
            System.out.println(Thread.currentThread().getName() + " locked " + from.getAccountId());
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            synchronized (to) {
                System.out.println(Thread.currentThread().getName() + " locked " + to.getAccountId());
                try {
                    from.withdraw(amount);
                    to.deposit(amount);
                    System.out.println(Thread.currentThread().getName() + " completed risky transfer.");
                } catch (IllegalArgumentException e) {
                    System.out.println("Risky transfer failed: " + e.getMessage());
                }
            }
        }
    }
}
