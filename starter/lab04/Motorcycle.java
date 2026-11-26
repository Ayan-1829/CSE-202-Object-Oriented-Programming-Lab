public class Motorcycle extends Vehicle {

    private boolean hasStorage;

    public Motorcycle(String make, int year, boolean hasStorage) {
        super(make, year);
        this.hasStorage = hasStorage;
    }

    public void wheelie() {
        System.out.println(make + " is performing a wheelie!");
    }

    @Override
    public void display() {
        System.out.println("------- Motorcycle -------");
        System.out.println("Make        : " + make);
        System.out.println("Year        : " + year);
        System.out.println("Speed       : " + speed + " km/h");
        System.out.println("Has Storage : " + (hasStorage ? "Yes" : "No"));
        System.out.println("--------------------------");
    }

    public boolean hasStorage() { return hasStorage; }
}
