public class Enemy {
    private String type;
    private int health;
    private int points;

    // Counts every Enemy ever created
    private static int enemiesSpawned = 0;

    public Enemy(String type, int health, int points) {
        this.type = type;
        this.health = health;
        this.points = points;
        enemiesSpawned++;
    }

    public String getType() { return type; }
    public int getHealth()  { return health; }
    public int getPoints()  { return points; }
    public static int getEnemiesSpawned() { return enemiesSpawned; }

    public boolean isAlive() {
        return health > 0;
    }

    public void takeDamage(int amount) {
        health -= amount;
        if (health < 0) {
            health = 0;
        }
    }

    public void attack(Player target) {
        if (isAlive()) {
            target.takeDamage(10);
            System.out.println(type + " zaps " + target.getName() + " -> health " + target.getHealth());
        }
    }
}
