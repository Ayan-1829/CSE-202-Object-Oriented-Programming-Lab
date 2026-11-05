public class Player {
    // Fields: every Player object gets its own copy
    private String name;
    private int health;
    private int ammo;
    private int score;

    // Static field: one copy shared by the whole class
    private static int playersCreated = 0;

    // Constructor: runs once for each new Player
    public Player(String name, int health, int ammo) {
        this.name = name;
        setHealth(health);
        this.ammo = ammo;
        this.score = 0;
        playersCreated++;
    }

    // Getters: read-only access to private fields
    public String getName() { return name; }
    public int getHealth()  { return health; }
    public int getAmmo()    { return ammo; }
    public int getScore()   { return score; }
    public static int getPlayersCreated() { return playersCreated; }

    // Validating setter: health always stays between 0 and 100
    public void setHealth(int health) {
        if (health < 0) {
            health = 0;
        }
        if (health > 100) {
            health = 100;
        }
        this.health = health;
    }

    // Methods: what a player can do
    public void shoot(Enemy target) {
        if (!target.isAlive()) {
            System.out.println(name + " holds fire: " + target.getType() + " is already destroyed");
            return;
        }
        if (ammo == 0) {
            System.out.println(name + " pulls the trigger: click! Out of ammo");
            return;
        }
        ammo--;
        target.takeDamage(25);
        System.out.println(name + " shoots " + target.getType() + " -> its health " + target.getHealth());
        if (!target.isAlive()) {
            score += target.getPoints();
            System.out.println(target.getType() + " destroyed! +" + target.getPoints() + " points");
        }
    }

    public void takeDamage(int amount) {
        setHealth(health - amount);
    }

    public boolean isAlive() {
        return health > 0;
    }

    public void showStatus() {
        System.out.println("[" + name + "] health " + health + " | ammo " + ammo + " | score " + score);
    }
}
