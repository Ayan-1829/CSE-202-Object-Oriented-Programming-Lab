// Shared enemy behaviour; each kind decides how it moves, looks and fights
public abstract class Enemy extends GameObject {
    protected int health;
    protected final int points;
    protected final int touchDamage;

    public Enemy(double x, double y, int w, int h, int health, int points, int touchDamage) {
        super(x, y, w, h);
        this.health = health;
        this.points = points;
        this.touchDamage = touchDamage;
    }

    public void takeHit() {
        health--;
        if (health <= 0) {
            destroy();
        }
    }

    // Most enemies never shoot; Tank overrides this
    public Bullet tryShoot() {
        return null;
    }

    public int getPoints()      { return points; }
    public int getTouchDamage() { return touchDamage; }

    @Override
    public void update() {
        if (x + w < 0) {
            active = false;                 // flew past the player: gone, no points
        }
    }
}
