public class ElectricCar extends Car {

    private double batteryCapacity;
    private double chargeLevel;

    public ElectricCar(String make, int year, int numDoors,
                       double batteryCapacity, double chargeLevel) {
        super(make, year, numDoors, 100.0);
        if (batteryCapacity > 0.0) {
            this.batteryCapacity = batteryCapacity;
        } else {
            this.batteryCapacity = 50.0;
        }
        if (chargeLevel >= 0.0 && chargeLevel <= 100.0) {
            this.chargeLevel = chargeLevel;
        } else {
            this.chargeLevel = 0.0;
        }
    }

    public void charge(double amount) {
        if (amount > 0.0) {
            this.chargeLevel = Math.min(100.0, this.chargeLevel + amount);
        }
    }

    @Override
    public void display() {
        System.out.println("------- Electric Car -------");
        System.out.println("Make             : " + make);
        System.out.println("Year             : " + year);
        System.out.println("Speed            : " + speed + " km/h");
        System.out.println("Doors            : " + getNumDoors());
        System.out.printf("Battery Capacity : %.1f kWh%n", batteryCapacity);
        System.out.printf("Charge Level     : %.1f%%%n", chargeLevel);
        System.out.println("----------------------------");
    }

    public double getBatteryCapacity() { return batteryCapacity; }
    public double getChargeLevel() { return chargeLevel; }
}
