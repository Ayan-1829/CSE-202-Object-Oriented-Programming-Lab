public class Car {

    // Private instance fields
    private String make;
    private int speed;
    private double fuelLevel;

    // Static field shared by all Car objects
    private static int count = 0;

    public Car(String make, double fuelLevel) {
        this.make = make;
        this.speed = 0;
        if (fuelLevel >= 0.0 && fuelLevel <= 100.0) {
            this.fuelLevel = fuelLevel;
        } else {
            this.fuelLevel = 0.0;
        }
        count++;
    }

    public void accelerate(int delta) {
        if (delta > 0) {
            this.speed = this.speed + delta;
        }
    }

    public void brake(int delta) {
        if (delta > 0) {
            this.speed = Math.max(0, this.speed - delta);
        }
    }

    public void refuel(double amount) {
        if (amount > 0.0) {
            this.fuelLevel = Math.min(100.0, this.fuelLevel + amount);
        }
    }

    public void display() {
        System.out.println("-------------------------------");
        System.out.println("Make      : " + make);
        System.out.println("Speed     : " + speed + " km/h");
        System.out.printf("Fuel Level: %.1f%%%n", fuelLevel);
        System.out.println("-------------------------------");
    }

    // Getter methods
    public String getMake() { return make; }
    public int getSpeed() { return speed; }
    public double getFuelLevel() { return fuelLevel; }

    // Setter methods
    public void setMake(String make) { this.make = make; }

    public void setFuelLevel(double fuelLevel) {
        if (fuelLevel >= 0.0 && fuelLevel <= 100.0) {
            this.fuelLevel = fuelLevel;
        }
    }

    // Static method
    public static int getCount() { return count; }
}
