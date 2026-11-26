public class Lab2Demo {

    public static void main(String[] args) {

        // 1. Object Creation
        System.out.println("=== Object Creation ===");
        Car car1 = new Car("Sedan", 80.5);
        Car car2 = new Car("SUV", 100.0);
        System.out.println("Total Car objects created: " + Car.getCount());

        // 2. Method Invocation on car1
        System.out.println("\n=== car1 initial state ===");
        car1.display();
        car1.accelerate(30);
        System.out.println("After accelerate(30):");
        car1.display();
        car1.brake(10);
        System.out.println("After brake(10):");
        car1.display();
        car1.brake(100);
        System.out.println("After brake(100):");
        car1.display();

        // 3. Method Invocation on car2
        System.out.println("\n=== car2 initial state ===");
        car2.display();
        car2.accelerate(60);
        car2.refuel(5.0);
        System.out.println("After accelerate(60) and refuel(5.0):");
        car2.display();

        // 4. Getters and Setters
        System.out.println("\n=== Getters and Setters ===");
        System.out.println("car1 make via getter : " + car1.getMake());
        System.out.println("car2 speed via getter: " + car2.getSpeed());
        car1.setMake("Hatchback");
        System.out.println("car1 make after setter: " + car1.getMake());

        // 5. Reference Semantics
        System.out.println("\n=== Reference Semantics ===");
        Car car3 = car1;
        car3.accelerate(20);
        System.out.println("car1.getSpeed() = " + car1.getSpeed());
        System.out.println("car3.getSpeed() = " + car3.getSpeed());
        System.out.println("car1 and car3 refer to the same object.");

        // 6. Static Member
        System.out.println("\n=== Static Member ===");
        System.out.println("Total Car objects ever created: " + Car.getCount());
    }
}
