public class Dog extends Animal implements Drawable {

    private String breed;

    public Dog(String name, int age, String breed) {
        super(name, age);
        this.breed = breed;
    }

    @Override
    public void makeSound() {
        System.out.println(name + " barks: Woof! Woof!");
    }

    @Override
    public void eat() {
        System.out.println(name + " is eating dog food from a bowl.");
    }

    @Override
    public void draw() {
        System.out.println("[Drawing] " + name + " (" + breed + ") as a dog.");
    }

    @Override
    public void hide() {
        System.out.println("[Hiding] " + name + " is no longer visible.");
    }

    public String getBreed() { return breed; }
}
