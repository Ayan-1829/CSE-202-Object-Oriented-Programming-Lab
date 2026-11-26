public class Car extends Vehicle {

    private int numDoors;
    private double fuelLevel;

    public Car(String make, int year, int numDoors, double fuelLevel) {
        super(make, year);
        if (numDoors > 0) {
            this.numDoors = numDoors;
        } else {
            this.numDoors = 4;
        }
        if (fuelLevel >= 0.0 && fuelLevel <= 100.0) {
            this.fuelLevel = fuelLevel;
        } else {
            this.fuelLevel = 0.0;
        }
    }

    public void refuel(double amount) {
        if (amount > 0.0) {
            this.fuelLevel = Math.min(100.0, this.fuelLevel + amount);
        }
    }

    @Override
    public void display() {
        System.out.println("------- Car -------");
        System.out.println("Make      : " + make);
        System.out.println("Year      : " + year);
        System.out.println("Speed     : " + speed + " km/h");
        System.out.println("Doors     : " + numDoors);
        System.out.printf("Fuel Level: %.1f%%%n", fuelLevel);
        System.out.println("-------------------");
    }

    public int getNumDoors() { return numDoors; }
    public double getFuelLevel() { return fuelLevel; }
}
