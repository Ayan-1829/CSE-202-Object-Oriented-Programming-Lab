public class GameCharacter {
    // protected: visible to subclasses such as Player and Enemy
    protected String name;
    protected int health;

    public GameCharacter(String name, int health) {
        this.name = name;
        this.health = health;
    }

    public String getName() { return name; }
    public int getHealth()  { return health; }

    public boolean isAlive() {
        return health > 0;
    }

    public void takeDamage(int amount) {
        health = Math.max(0, health - amount);
    }

    public void describe() {
        System.out.println(name + " (" + health + " HP)");
    }
}
