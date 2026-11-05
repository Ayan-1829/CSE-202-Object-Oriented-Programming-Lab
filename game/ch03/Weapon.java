public class Weapon {
    private String name;
    private int damage;
    private int ammo;

    // 1. Default constructor: no arguments gives a basic pistol
    public Weapon() {
        this("Pistol", 10);                 // chain to the 2-argument constructor
    }

    // 2. Parameterised constructor: a standard clip of 12
    public Weapon(String name, int damage) {
        this(name, damage, 12);             // chain to the full constructor
    }

    // 3. Full constructor: the only one that sets the fields
    public Weapon(String name, int damage, int ammo) {
        this.name = name;
        this.damage = damage;
        this.ammo = ammo;
        System.out.println("  crafted " + this);
    }

    // 4. Copy constructor: a new weapon with the same settings
    public Weapon(Weapon other) {
        this(other.name, other.damage, other.ammo);
    }

    public String getName() { return name; }
    public int getDamage()  { return damage; }
    public int getAmmo()    { return ammo; }

    public boolean fire() {
        if (ammo == 0) {
            return false;
        }
        ammo--;
        return true;
    }

    public void addAmmo(int amount) {
        ammo += amount;
    }

    public void upgrade(int extraDamage) {
        damage += extraDamage;
    }

    @Override
    public String toString() {
        return name + " [" + damage + " dmg, " + ammo + " ammo]";
    }
}
