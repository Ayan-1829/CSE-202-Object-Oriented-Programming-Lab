public class Fish extends Animal implements Eatable {

    private int waterDepth;

    public Fish(String name, int age, int waterDepth) {
        super(name, age);
        if (waterDepth > 0) {
            this.waterDepth = waterDepth;
        } else {
            this.waterDepth = 1;
        }
    }

    @Override
    public void makeSound() {
        System.out.println(name + " bubbles: Blub! Blub!");
    }

    @Override
    public void eat() {
        System.out.println(name + " is eating algae and small organisms.");
    }

    @Override
    public boolean isPoisonous() {
        return false;
    }

    @Override
    public int getNutrition() {
        return 65;
    }

    public int getWaterDepth() { return waterDepth; }
}
