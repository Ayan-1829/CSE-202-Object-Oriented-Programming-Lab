public class ArmoryDemo {

    // Receives a copy of the int: the change stays inside this method
    static void refill(int ammo) {
        ammo = 99;
        System.out.println("  inside refill(int): ammo = " + ammo);
    }

    // Receives a copy of the reference: both point at the same Weapon object
    static void refill(Weapon w) {
        w.addAmmo(10);
        System.out.println("  inside refill(Weapon): " + w);
    }

    // Pointing the parameter at a new object does not change the caller's variable
    static void swap(Weapon w) {
        w = new Weapon("Water gun", 1, 1);
        System.out.println("  inside swap(): w is now " + w);
    }

    public static void main(String[] args) {

        System.out.println("=== Constructors ===");
        Weapon pistol = new Weapon();
        Weapon rifle = new Weapon("Rifle", 25);
        Weapon rocket = new Weapon("Rocket", 80, 3);

        System.out.println("\n=== Copy constructor ===");
        Weapon spare = new Weapon(rifle);
        spare.upgrade(5);
        System.out.println("rifle: " + rifle);
        System.out.println("spare: " + spare + "  (a separate object)");

        System.out.println("\n=== Overloaded shoot() ===");
        Player ranger = new Player("Ranger");
        ranger.equip(rocket);
        ranger.shoot();
        ranger.shoot("Tank");
        ranger.shoot("Drone", 3);

        System.out.println("\n=== Passing a primitive ===");
        int ammo = 5;
        refill(ammo);
        System.out.println("  after refill(int): ammo = " + ammo);

        System.out.println("\n=== Passing an object reference ===");
        refill(pistol);
        System.out.println("  after refill(Weapon): " + pistol);
        swap(pistol);
        System.out.println("  after swap(): pistol is still " + pistol);

        System.out.println("\n=== A medic heals through a reference ===");
        Medic doc = new Medic("Doc");
        ranger.takeDamage(40);
        System.out.println("Ranger takes 40 damage -> health " + ranger.getHealth());
        doc.heal(ranger, 30);
        System.out.println("Back in main: ranger.getHealth() = " + ranger.getHealth());
    }
}
