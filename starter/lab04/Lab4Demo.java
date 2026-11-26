public class Lab4Demo {

    static void displayVehicle(Vehicle vehicle) {
        vehicle.display();
    }

    public static void main(String[] args) {

        // 1. Object Creation
        System.out.println("=== Object Creation ===");
        Vehicle vehicle = new Vehicle("Generic Vehicle", 2020);
        Car car = new Car("Toyota Camry", 2022, 4, 75.0);
        Motorcycle motorcycle = new Motorcycle("Yamaha YZF", 2021, true);
        ElectricCar electricCar = new ElectricCar("Tesla Model 3", 2023, 4, 75.0, 85.0);

        // 2. Direct Method Calls
        System.out.println("\n=== Direct Method Calls ===");
        vehicle.display();
        car.display();
        motorcycle.display();
        electricCar.display();

        // 3. Polymorphism with Superclass References
        System.out.println("\n=== Polymorphic Dispatch ===");
        Vehicle[] vehicles = {vehicle, car, motorcycle, electricCar};
        for (int i = 0; i < vehicles.length; i++) {
            System.out.println("vehicles[" + i + "]:");
            displayVehicle(vehicles[i]);
        }

        // 4. Inherited Methods
        System.out.println("\n=== Inherited Methods ===");
        car.accelerate(50);
        System.out.println("After car.accelerate(50):");
        car.display();
        motorcycle.accelerate(80);
        System.out.println("After motorcycle.accelerate(80):");
        motorcycle.display();
        electricCar.accelerate(40);
        System.out.println("After electricCar.accelerate(40):");
        electricCar.display();

        // 5. Subclass-Specific Methods
        System.out.println("\n=== Subclass-Specific Methods ===");
        car.refuel(20.0);
        System.out.println("After car.refuel(20.0):");
        car.display();
        motorcycle.wheelie();
        electricCar.charge(15.0);
        System.out.println("After electricCar.charge(15.0):");
        electricCar.display();

        // 6. instanceof and Safe Casting
        System.out.println("\n=== instanceof and Safe Casting ===");
        Vehicle v = new Car("Honda Civic", 2021, 2, 60.0);
        System.out.println("v instanceof Vehicle    : " + (v instanceof Vehicle));
        System.out.println("v instanceof Car        : " + (v instanceof Car));
        System.out.println("v instanceof Motorcycle : " + (v instanceof Motorcycle));
        if (v instanceof Car) {
            Car castedCar = (Car) v;
            System.out.println("Number of doors after casting: " + castedCar.getNumDoors());
        }

        // 7. Method Overriding Verification
        System.out.println("\n=== Method Overriding Verification ===");
        Vehicle ref1 = new Car("Ford Mustang", 2020, 2, 50.0);
        Vehicle ref2 = new Motorcycle("Harley-Davidson", 2022, false);
        Vehicle ref3 = new ElectricCar("Nissan Leaf", 2023, 4, 62.0, 70.0);
        ref1.display();
        ref2.display();
        ref3.display();

        // 8. Inherited brake() Method
        System.out.println("\n=== Inherited brake() Method ===");
        Car testCar = new Car("Subaru Outback", 2019, 5, 45.0);
        testCar.accelerate(100);
        System.out.println("After testCar.accelerate(100):");
        testCar.display();
        testCar.brake(30);
        System.out.println("After testCar.brake(30):");
        testCar.display();
        testCar.brake(200);
        System.out.println("After testCar.brake(200):");
        testCar.display();
    }
}
