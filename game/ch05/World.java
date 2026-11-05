public class World {

    // Draws a one-line map, 20 cells wide, from any GameObjects
    static void drawMap(String label, GameObject[] objects) {
        char[] row = "....................".toCharArray();
        for (GameObject o : objects) {
            if (o.getX() >= 0 && o.getX() < row.length) {
                row[o.getX()] = o.symbol();
            }
        }
        System.out.println(label + "  |" + new String(row) + "|");
    }

    public static void main(String[] args) {
        Player ranger = new Player("Ranger", 1);
        Drone drone = new Drone("Drone-1", 15);
        HealthPack pack = new HealthPack(4, 25);

        // GameObject g = new GameObject("ghost", 0);   // compile error: GameObject is abstract

        System.out.println("=== One abstract type, many objects ===");
        GameObject[] world = { pack, drone, ranger };     // drawn in this order: the player on top
        drawMap("start ", world);
        for (int tick = 1; tick <= 3; tick++) {
            for (GameObject o : world) {
                o.update();                 // each class moves in its own way
            }
            drawMap("tick " + tick, world);
        }

        System.out.println("\n=== Interfaces as types ===");
        Shooter[] shooters = { ranger, drone };
        for (Shooter s : shooters) {
            Bullet b = s.shoot();
            System.out.println(b.getName() + " fired, flying '" + b.symbol() + "' from x=" + b.getX());
        }
        System.out.println("Shooter.RANGE = " + Shooter.RANGE);

        System.out.println("\n=== Damage only what is Damageable ===");
        drone.takeDamage(10);
        ranger.takeDamage(30);
        for (GameObject o : world) {
            if (o instanceof Damageable) {
                Damageable d = (Damageable) o;
                d.takeDamage(20);
            } else {
                System.out.println("  " + o.getName() + " is not Damageable: skipped");
            }
        }
        System.out.println("Drone destroyed? " + drone.isDestroyed());

        System.out.println("\n=== Picking up a Collectible ===");
        Collectible c = pack;
        c.collectBy(ranger);

        System.out.println("\n=== Final map ===");
        drawMap("end   ", world);
    }
}
