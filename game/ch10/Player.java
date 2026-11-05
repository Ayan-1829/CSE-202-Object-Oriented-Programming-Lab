import java.awt.Graphics2D;

public class Player extends GameObject {
    private int health = 100;
    private int cooldown = 0;               // frames until the next shot
    private int flash = 0;                  // frames to show the muzzle flash

    public Player(double x, double groundY) {
        super(x, groundY - 66, 40, 66);
    }

    // dx, dy come from the arrow keys: -1, 0 or +1
    public void move(int dx, int dy) {
        x = Math.max(10, Math.min(GamePanel.W / 2.0, x + dx * 4));
        y = Math.max(90, Math.min(GamePanel.GROUND - h, y + dy * 4));
    }

    @Override
    public void update() {
        if (cooldown > 0) cooldown--;
        if (flash > 0) flash--;
    }

    // Returns a new bullet, or null while the rifle is cooling down
    public Bullet tryShoot() {
        if (cooldown > 0) {
            return null;
        }
        cooldown = 10;
        flash = 3;
        return new Bullet(x + w / 2.0 + 40, y + h - 36, 9, false);
    }

    public void takeDamage(int amount) {
        health = Math.max(0, health - amount);
        if (health == 0) {
            destroy();
        }
    }

    public int getHealth() { return health; }

    @Override
    public void draw(Graphics2D g) {
        Sprites.drawCommando(g, (int) x + w / 2, (int) y + h, flash > 0);
    }
}
