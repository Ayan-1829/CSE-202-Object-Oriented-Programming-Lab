import java.awt.Graphics2D;

public class Bullet extends GameObject {
    private final double speed;             // pixels per frame; negative flies left
    private final boolean fromEnemy;

    public Bullet(double x, double y, double speed, boolean fromEnemy) {
        super(x - 5, y - 2, 10, 4);
        this.speed = speed;
        this.fromEnemy = fromEnemy;
    }

    @Override
    public void update() {
        x += speed;
        if (x < -20 || x > GamePanel.W + 20) {
            destroy();                      // left the screen
        }
    }

    @Override
    public void draw(Graphics2D g) {
        Sprites.drawBullet(g, (int) x + 5, (int) y + 2, fromEnemy);
    }

    public boolean isFromEnemy() { return fromEnemy; }
}
