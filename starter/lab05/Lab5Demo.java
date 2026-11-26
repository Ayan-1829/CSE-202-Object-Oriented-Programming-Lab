public class Lab5Demo {

    static void demonstratePolymorphism(Animal animal) {
        animal.displayInfo();
        animal.makeSound();
        animal.eat();
    }

    static void demonstrateDrawable(Drawable drawable) {
        drawable.draw();
        drawable.hide();
    }

    static void demonstrateEatable(Eatable eatable) {
        System.out.println("Poisonous : " + eatable.isPoisonous());
        System.out.println("Nutrition : " + eatable.getNutrition());
    }

    public static void main(String[] args) {

        // 1. Object Creation
        System.out.println("=== Object Creation ===");
        Dog dog = new Dog("Rex", 5, "Golden Retriever");
        Bird bird = new Bird("Tweety", 2, 0.5);
        Fish fish = new Fish("Nemo", 1, 20);
        System.out.println("Created Dog : " + dog.getName());
        System.out.println("Created Bird: " + bird.getName());
        System.out.println("Created Fish: " + fish.getName());

        // 2. Polymorphism through Animal References
        System.out.println("\n=== Polymorphism through Animal References ===");
        Animal[] animals = {dog, bird, fish};
        for (Animal animal : animals) {
            System.out.println("-------------------------------");
            demonstratePolymorphism(animal);
        }

        // 3. Drawable Interface
        System.out.println("\n=== Drawable Interface ===");
        Drawable[] drawables = {dog, bird};
        for (Drawable drawable : drawables) {
            System.out.println("-------------------------------");
            demonstrateDrawable(drawable);
        }

        // 4. Eatable Interface
        System.out.println("\n=== Eatable Interface ===");
        demonstrateEatable(fish);

        // 5. Abstract Class Instantiation Rule
        System.out.println("\n=== Abstract Class Instantiation Rule ===");
        System.out.println("Animal cannot be instantiated directly.");
        System.out.println("Use concrete subclasses such as Dog, Bird, and Fish.");

        // 6. instanceof with Interfaces
        System.out.println("\n=== instanceof with Interfaces ===");
        System.out.println("dog instanceof Drawable  : " + (dog instanceof Drawable));
        System.out.println("dog instanceof Eatable   : " + (dog instanceof Eatable));
        System.out.println("fish instanceof Drawable : " + (fish instanceof Drawable));
        System.out.println("fish instanceof Eatable  : " + (fish instanceof Eatable));

        // 7. Safe Casting
        System.out.println("\n=== Safe Casting ===");
        Animal animalRef = dog;
        if (animalRef instanceof Dog) {
            Dog castedDog = (Dog) animalRef;
            System.out.println("Casted Dog breed: " + castedDog.getBreed());
        }
    }
}
