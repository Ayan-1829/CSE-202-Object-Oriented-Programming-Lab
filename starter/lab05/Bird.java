public class Bird extends Animal implements Drawable {

    private double wingSpan;

    public Bird(String name, int age, double wingSpan) {
        super(name, age);
        if (wingSpan > 0.0) {
            this.wingSpan = wingSpan;
        } else {
            this.wingSpan = 0.1;
        }
    }

    @Override
    public void makeSound() {
        System.out.println(name + " chirps: Tweet! Tweet!");
    }

    @Override
    public void eat() {
        System.out.println(name + " is pecking at seeds and insects.");
    }

    @Override
    public void draw() {
        System.out.println("[Drawing] " + name + " with wingspan " + wingSpan + "m as a bird.");
    }

    @Override
    public void hide() {
        System.out.println("[Hiding] " + name + " flies away and disappears.");
    }

    public double getWingSpan() { return wingSpan; }
}
