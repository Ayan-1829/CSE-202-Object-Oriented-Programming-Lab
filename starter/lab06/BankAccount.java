public class BankAccount {

    private String accountNumber;
    private String owner;
    private double balance;

    private static int totalAccounts = 0;

    public BankAccount(String accountNumber, String owner, double initialBalance)
            throws InvalidAccountException {

        if (accountNumber == null || accountNumber.trim().isEmpty()) {
            throw new InvalidAccountException("Account number cannot be null or empty.");
        }
        if (owner == null || owner.trim().isEmpty()) {
            throw new InvalidAccountException("Owner name cannot be null or empty.");
        }
        if (initialBalance < 0.0) {
            throw new InvalidAccountException(
                    "Initial balance cannot be negative. Provided: " + initialBalance);
        }
        this.accountNumber = accountNumber;
        this.owner = owner;
        this.balance = initialBalance;
        totalAccounts++;
    }

    public void deposit(double amount) throws InvalidAccountException {
        if (amount <= 0.0) {
            throw new InvalidAccountException(
                    "Deposit amount must be positive. Provided: " + amount);
        }
        balance = balance + amount;
        System.out.println("[" + accountNumber + "] Deposit: " + amount
                + " | New balance: " + balance);
    }

    public void withdraw(double amount) throws InvalidAccountException {
        if (amount <= 0.0) {
            throw new InvalidAccountException(
                    "Withdrawal amount must be positive. Provided: " + amount);
        }
        if (amount > balance) {
            throw new InsufficientFundsException(
                    "Insufficient funds. Requested: " + amount + ", Available: " + balance);
        }
        balance = balance - amount;
        System.out.println("[" + accountNumber + "] Withdrawal: " + amount
                + " | New balance: " + balance);
    }

    public void transfer(BankAccount target, double amount) throws TransactionException {
        if (target == null) {
            throw new TransactionException("Transfer failed: target account is null.");
        }
        try {
            System.out.println("--- Starting transfer ---");
            System.out.println("From: " + this.accountNumber + " | To: "
                    + target.accountNumber + " | Amount: " + amount);
            this.withdraw(amount);
            target.deposit(amount);
            System.out.println("Transfer completed successfully.");
        } catch (InsufficientFundsException e) {
            throw new TransactionException(
                    "Transfer failed: insufficient funds in source account.", e);
        } catch (InvalidAccountException e) {
            throw new TransactionException(
                    "Transfer failed: invalid transaction amount.", e);
        }
    }

    public String getAccountNumber() { return accountNumber; }
    public String getOwner() { return owner; }
    public double getBalance() { return balance; }
    public static int getTotalAccounts() { return totalAccounts; }

    public void display() {
        System.out.println("Account: " + accountNumber + " | Owner: " + owner
                + " | Balance: " + balance);
    }
}
