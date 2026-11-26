public class Vehicle {

    // Protected fields are accessible in subclasses
    protected String make;
    protected int year;
    protected int speed;

    public Vehicle(String make, int year) {
        this.make = make;
        this.year = year;
        this.speed = 0;
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

    public void display() {
        System.out.println("------- Vehicle -------");
        System.out.println("Make  : " + make);
        System.out.println("Year  : " + year);
        System.out.println("Speed : " + speed + " km/h");
        System.out.println("-----------------------");
    }

    public int getYear() {
        return year;
    }
}
