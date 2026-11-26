public class BankAccount {

    private String accountId;
    private double balance;

    public BankAccount(String accountId, double initialBalance) {
        this.accountId = accountId;
        if (initialBalance >= 0.0) {
            this.balance = initialBalance;
        } else {
            this.balance = 0.0;
        }
    }

    public synchronized void withdraw(double amount) {
        if (amount <= 0.0) {
            throw new IllegalArgumentException("Amount must be positive.");
        }
        if (amount > balance) {
            throw new IllegalArgumentException("Insufficient funds in " + accountId
                    + ". Requested: " + amount + ", Available: " + balance);
        }
        balance = balance - amount;
        System.out.println(Thread.currentThread().getName() + " withdrew " + amount
                + " from " + accountId + ". New balance: " + balance);
    }

    public synchronized void deposit(double amount) {
        if (amount <= 0.0) {
            throw new IllegalArgumentException("Amount must be positive.");
        }
        balance = balance + amount;
        System.out.println(Thread.currentThread().getName() + " deposited " + amount
                + " into " + accountId + ". New balance: " + balance);
    }

    public synchronized double getBalance() {
        return balance;
    }

    public String getAccountId() {
        return accountId;
    }

    // Locks are acquired in a fixed order to prevent deadlock.
    public void transfer(BankAccount target, double amount) {
        if (target == null) {
            throw new IllegalArgumentException("Target account cannot be null.");
        }
        BankAccount first;
        BankAccount second;
        if (this.accountId.compareTo(target.accountId) < 0) {
            first = this;
            second = target;
        } else {
            first = target;
            second = this;
        }
        synchronized (first) {
            synchronized (second) {
                System.out.println(Thread.currentThread().getName() + " transferring "
                        + amount + " from " + this.accountId + " to " + target.accountId);
                this.withdraw(amount);
                target.deposit(amount);
                System.out.println(Thread.currentThread().getName() + " completed transfer.");
            }
        }
    }

    public void display() {
        System.out.println("Account: " + accountId + " | Balance: " + getBalance());
    }
}
