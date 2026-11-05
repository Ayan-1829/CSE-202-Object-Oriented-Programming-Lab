public class Player extends GameCharacter {
    private int score;

    public Player(String name) {
        super(name, 100);                   // build the GameCharacter part first
    }

    // Overloaded: same name, different parameters (chosen at compile time)
    public void shoot(Enemy target) {
        shoot(target, 25);
    }

    public void shoot(Enemy target, int power) {
        System.out.println(name + " shoots " + target.getName() + " with power " + power);
        target.takeDamage(power);           // which takeDamage runs depends on the object
        if (!target.isAlive()) {
            score += 100;
            System.out.println(target.getName() + " destroyed! Score " + score);
        }
    }

    @Override
    public void describe() {
        System.out.println("Player " + name + " (" + health + " HP, score " + score + ")");
    }
}
