public class GameBasics {
    public static void main(String[] args) {

        // 1. Variables: the player's stats
        String name = "Ranger";
        int health = 100;
        int ammo = 5;
        double damage = 12.75;
        boolean alive = true;
        System.out.println(name + " | health " + health + " | ammo " + ammo + " | alive " + alive);

        // 2. Casting: a 12.75 hit becomes a whole number
        int hit = (int) damage;
        health = health - hit;
        System.out.println("Hit for " + damage + " -> loses " + hit + " -> health " + health);

        // 3. if-else: the colour of the health bar
        if (health >= 70) {
            System.out.println("Health bar: green");
        } else if (health >= 30) {
            System.out.println("Health bar: yellow");
        } else {
            System.out.println("Health bar: red");
        }

        // 4. switch: key 2 picks the rifle
        int key = 2;
        switch (key) {
            case 1:  System.out.println("Weapon: Pistol"); break;
            case 2:  System.out.println("Weapon: Rifle");  break;
            default: System.out.println("Weapon: Fists");
        }

        // 5. for: a burst of exactly 3 shots
        for (int shot = 1; shot <= 3; shot++) {
            ammo--;
            System.out.println("Shot " + shot + ", ammo left " + ammo);
        }

        // 6. while: shoot the drone until it falls
        int droneHealth = 60;
        while (droneHealth > 0) {
            droneHealth -= 25;
            System.out.println("Drone health " + Math.max(droneHealth, 0));
        }

        // 7. break and continue: a jammed shot, then an empty clip
        for (int shot = 1; shot <= 5; shot++) {
            if (shot == 2) continue;            // jammed: skip this shot
            if (ammo == 0) break;               // empty: stop firing
            ammo--;
            System.out.println("Bang! ammo left " + ammo);
        }

        // 8. do-while: fight waves until no enemies are left
        int enemies = 5;
        int wave = 0;
        do {
            wave++;
            enemies -= 3;
            System.out.println("Wave " + wave + " cleared");
        } while (enemies > 0);
    }
}
