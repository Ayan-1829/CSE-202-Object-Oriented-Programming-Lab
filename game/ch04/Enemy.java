public class Enemy extends GameCharacter {
    protected int damage;

    public Enemy(String name, int health, int damage) {
        super(name, health);
        this.damage = damage;
    }

    // Every enemy can attack; subclasses override how
    public void attack(GameCharacter target) {
        target.takeDamage(damage);
        System.out.println(name + " attacks " + target.getName() + " for " + damage);
    }

    @Override
    public void describe() {
        System.out.println("Enemy " + name + " (" + health + " HP, " + damage + " damage)");
    }
}
