public class Player {
    private String name;
    private int health;
    private Weapon weapon;

    public Player(String name) {
        this(name, 100);                    // chain: default health is 100
    }

    public Player(String name, int health) {
        this.name = name;
        this.health = health;
        this.weapon = new Weapon();         // everyone starts with a pistol
    }

    public String getName() { return name; }
    public int getHealth()  { return health; }

    public void setHealth(int health) {
        this.health = Math.max(0, Math.min(100, health));
    }

    public void equip(Weapon w) {
        weapon = w;
        System.out.println(name + " equips " + w);
    }

    // Overloaded shoot(): same name, different parameter lists
    public void shoot() {
        if (weapon.fire()) {
            System.out.println(name + " fires the " + weapon.getName() + " into the air");
        } else {
            System.out.println(name + ": click! The " + weapon.getName() + " is empty");
        }
    }

    public void shoot(String target) {
        if (weapon.fire()) {
            System.out.println(name + " hits " + target + " for " + weapon.getDamage());
        } else {
            System.out.println(name + ": click! The " + weapon.getName() + " is empty");
        }
    }

    public void shoot(String target, int burst) {
        System.out.println(name + " fires a burst of " + burst + " at " + target);
        for (int i = 1; i <= burst; i++) {
            shoot(target);                  // reuses the one-target version
        }
    }

    public void takeDamage(int amount) {
        setHealth(health - amount);
    }
}
