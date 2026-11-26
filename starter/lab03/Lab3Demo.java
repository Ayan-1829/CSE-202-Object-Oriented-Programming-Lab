public class Lab3Demo {

    static void passPrimitive(double side) {
        System.out.println("Inside passPrimitive: side before = " + side);
        side = side * 2;
        System.out.println("Inside passPrimitive: side after  = " + side);
    }

    static void passReference(Rectangle rectangle) {
        System.out.println("Inside passReference before scaling: " + rectangle.describe());
        rectangle.scale(2.0);
        System.out.println("Inside passReference after scaling : " + rectangle.describe());
    }

    static void tryReassignReference(Rectangle rectangle) {
        rectangle = new Rectangle(99.0, 99.0, "Invisible");
        System.out.println("Inside tryReassignReference: " + rectangle.describe());
    }

    public static void main(String[] args) {

        // 1. Constructor Variants
        System.out.println("=== Constructor Variants ===");
        Rectangle r0 = new Rectangle();
        System.out.println("Default constructor    : " + r0.describe());
        Rectangle r1 = new Rectangle(5.0);
        System.out.println("Square constructor     : " + r1.describe());
        Rectangle r2 = new Rectangle(4.0, 7.0);
        System.out.println("Two-arg constructor    : " + r2.describe());
        Rectangle r3 = new Rectangle(3.0, 6.0, "Blue");
        System.out.println("Full constructor       : " + r3.describe());
        Rectangle r4 = new Rectangle(r3);
        System.out.println("Copy constructor       : " + r4.describe());

        // 2. Copy Constructor Independence
        System.out.println("\n=== Copy Constructor Independence ===");
        r3.setColour("Green");
        System.out.println("Original after change  : " + r3.describe());
        System.out.println("Copy remains unchanged : " + r4.describe());

        // 3. Method Overloading
        System.out.println("\n=== Method Overloading: area() ===");
        Rectangle rect = new Rectangle(6.0, 4.0, "Yellow");
        System.out.printf("area()          = %.2f%n", rect.area());
        System.out.printf("area(1.5)       = %.2f%n", rect.area(1.5));
        System.out.printf("area(3.0, 8.0)  = %.2f%n", Rectangle.area(3.0, 8.0));

        System.out.println("\n=== Method Overloading: describe() ===");
        System.out.println(rect.describe());
        System.out.println(rect.describe("Main rectangle"));

        // 4. Passing Primitive Value
        System.out.println("\n=== Passing a Primitive Value ===");
        double side = 10.0;
        System.out.println("Before method call: side = " + side);
        passPrimitive(side);
        System.out.println("After method call : side = " + side);

        // 5. Passing Object Reference
        System.out.println("\n=== Passing an Object Reference ===");
        Rectangle ref = new Rectangle(5.0, 5.0, "Blue");
        System.out.println("Before method call: " + ref.describe());
        passReference(ref);
        System.out.println("After method call : " + ref.describe());

        // 6. Reassigning Reference Parameter
        System.out.println("\n=== Reassigning Reference Parameter ===");
        Rectangle original = new Rectangle(2.0, 3.0, "Pink");
        System.out.println("Before method call: " + original.describe());
        tryReassignReference(original);
        System.out.println("After method call : " + original.describe());
    }
}
