public class Lab6Demo {

    public static void main(String[] args) {

        // 1. Creating Bank Accounts
        System.out.println("=== Creating Bank Accounts ===");
        BankAccount account1 = null;
        BankAccount account2 = null;
        try {
            account1 = new BankAccount("ACC001", "Alice", 5000.0);
            System.out.println("Account 1 created successfully.");
        } catch (InvalidAccountException e) {
            System.out.println("Error creating account 1: " + e.getMessage());
        }
        try {
            account2 = new BankAccount("ACC002", "Bob", 3000.0);
            System.out.println("Account 2 created successfully.");
        } catch (InvalidAccountException e) {
            System.out.println("Error creating account 2: " + e.getMessage());
        }

        // 2. Invalid Account Creation
        System.out.println("\n=== Invalid Account Creation ===");
        try {
            BankAccount invalidAccount = new BankAccount("", "Charlie", 1000.0);
        } catch (InvalidAccountException e) {
            System.out.println("Caught checked exception: " + e.getMessage());
        }
        try {
            BankAccount invalidAccount = new BankAccount("ACC003", "Diana", -500.0);
        } catch (InvalidAccountException e) {
            System.out.println("Caught checked exception: " + e.getMessage());
        }

        // 3. Insufficient Funds
        System.out.println("\n=== Insufficient Funds Example ===");
        try {
            account1.withdraw(10000.0);
        } catch (InsufficientFundsException e) {
            System.out.println("Caught unchecked exception: " + e.getMessage());
        } catch (InvalidAccountException e) {
            System.out.println("Caught checked exception: " + e.getMessage());
        }

        // 4. Valid Deposit and Withdrawal
        System.out.println("\n=== Valid Transactions ===");
        try {
            account1.display();
            account1.deposit(2000.0);
            account1.withdraw(1500.0);
            account1.display();
        } catch (InvalidAccountException e) {
            System.out.println("Transaction error: " + e.getMessage());
        }

        // 5. try-catch-finally
        System.out.println("\n=== try-catch-finally Example ===");
        try {
            System.out.println("Attempting to withdraw 500 from account1...");
            account1.withdraw(500.0);
            System.out.println("Withdrawal successful.");
        } catch (InsufficientFundsException e) {
            System.out.println("Caught InsufficientFundsException: " + e.getMessage());
        } catch (InvalidAccountException e) {
            System.out.println("Caught InvalidAccountException: " + e.getMessage());
        } finally {
            System.out.println("Finally block: cleanup or logging code runs.");
            account1.display();
        }

        // 6. Successful Transfer
        System.out.println("\n=== Successful Transfer ===");
        try {
            account1.transfer(account2, 1000.0);
        } catch (TransactionException e) {
            System.out.println("Caught TransactionException: " + e.getMessage());
            System.out.println("Cause: " + e.getCause().getMessage());
        }

        // 7. Failed Transfer
        System.out.println("\n=== Failed Transfer ===");
        try {
            account2.transfer(account1, 5000.0);
        } catch (TransactionException e) {
            System.out.println("Caught TransactionException: " + e.getMessage());
            System.out.println("Root cause: " + e.getCause().getMessage());
        }

        // 8. Invalid Transaction Amounts
        System.out.println("\n=== Invalid Transaction Amounts ===");
        try {
            account1.deposit(-100.0);
        } catch (InvalidAccountException e) {
            System.out.println("Caught deposit error: " + e.getMessage());
        }
        try {
            account1.withdraw(-50.0);
        } catch (InsufficientFundsException e) {
            System.out.println("Caught insufficient funds error: " + e.getMessage());
        } catch (InvalidAccountException e) {
            System.out.println("Caught withdrawal error: " + e.getMessage());
        }

        // 9. Final Account States
        System.out.println("\n=== Final Account States ===");
        account1.display();
        account2.display();
        System.out.println("Total accounts created: " + BankAccount.getTotalAccounts());
    }
}
