public class BattleDemo {
    public static void main(String[] args) {

        System.out.println("=== Creating objects with new ===");
        Player ranger = new Player("Ranger", 100, 5);
        Enemy drone1 = new Enemy("Drone-1", 40, 50);
        Enemy drone2 = new Enemy("Drone-2", 40, 50);
        ranger.showStatus();
        System.out.println("Players created: " + Player.getPlayersCreated());
        System.out.println("Enemies spawned: " + Enemy.getEnemiesSpawned());

        System.out.println("\n=== Each object keeps its own state ===");
        ranger.shoot(drone1);
        System.out.println("drone1 health: " + drone1.getHealth());
        System.out.println("drone2 health: " + drone2.getHealth());

        System.out.println("\n=== The fight: objects calling each other's methods ===");
        drone2.attack(ranger);
        ranger.shoot(drone1);
        drone2.attack(ranger);
        ranger.shoot(drone2);
        ranger.shoot(drone1);
        ranger.shoot(drone2);
        ranger.shoot(drone2);
        ranger.showStatus();

        System.out.println("\n=== Encapsulation: the setter validates ===");
        ranger.setHealth(250);
        System.out.println("setHealth(250) -> health " + ranger.getHealth());
        ranger.setHealth(-30);
        System.out.println("setHealth(-30) -> health " + ranger.getHealth() + ", alive? " + ranger.isAlive());

        System.out.println("\n=== References: two names, one object ===");
        Enemy target = drone1;
        System.out.println("target == drone1 ? " + (target == drone1));
        System.out.println("target.getType(): " + target.getType());
        System.out.println("Enemies spawned is still " + Enemy.getEnemiesSpawned() + " (no new object was made)");
    }
}
