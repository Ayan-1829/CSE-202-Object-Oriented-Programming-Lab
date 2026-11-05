import java.awt.Graphics2D;

public class Explosion extends GameObject {
    private int age = 0;

    public Explosion(double cx, double cy) {
        super(cx, cy, 0, 0);
    }

    @Override
    public void update() {
        age++;
        if (age > 20) {
            destroy();
        }
    }

    @Override
    public void draw(Graphics2D g) {
        Sprites.drawExplosion(g, (int) x, (int) y, age);
    }
}
