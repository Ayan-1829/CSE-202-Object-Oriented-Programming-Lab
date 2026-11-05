public class Drone extends Enemy {

    public Drone(String name) {
        super(name, 30, 5);                 // light and weak
    }

    @Override
    public void attack(GameCharacter target) {
        target.takeDamage(damage);
        System.out.println(name + " dives at " + target.getName() + "! -" + damage);
    }
}
