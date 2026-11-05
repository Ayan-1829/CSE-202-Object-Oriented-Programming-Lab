public class WaveDemo {
    public static void main(String[] args) {

        System.out.println("=== The characters ===");
        Player ranger = new Player("Ranger");
        Drone drone = new Drone("Drone-1");
        Tank tank = new Tank("Tank-1", 8);
        Sniper sniper = new Sniper("Sniper-1");
        ranger.describe();
        drone.describe();                   // Drone has no describe(): Enemy's runs
        tank.describe();
        sniper.describe();

        System.out.println("\n=== Polymorphism: one loop, three attacks ===");
        Enemy[] wave = { drone, tank, sniper };
        for (Enemy e : wave) {
            e.attack(ranger);               // the object's own attack() runs
        }
        System.out.println("Ranger's health after the wave: " + ranger.getHealth());

        System.out.println("\n=== Overriding takeDamage() ===");
        ranger.shoot(drone);
        ranger.shoot(tank);
        System.out.println("Tank health: " + tank.getHealth());

        System.out.println("\n=== Overloading shoot() ===");
        ranger.shoot(sniper, 60);

        System.out.println("\n=== instanceof and casting ===");
        for (Enemy e : wave) {
            if (e instanceof Tank) {
                Tank t = (Tank) e;          // safe: we just checked
                t.raiseShield();
            } else if (e instanceof Sniper) {
                ((Sniper) e).aim();
            } else {
                System.out.println(e.getName() + " is a " + e.getClass().getSimpleName() + ": no special move");
            }
        }

        System.out.println("\n=== A GameCharacter reference ===");
        GameCharacter c = tank;             // upcast: always allowed
        c.describe();                       // still runs Tank's describe()
        System.out.println("c instanceof Enemy : " + (c instanceof Enemy));
        System.out.println("c instanceof Drone : " + (c instanceof Drone));
    }
}
