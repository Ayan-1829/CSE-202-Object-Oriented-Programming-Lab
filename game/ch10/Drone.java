import java.awt.Graphics2D;

public class Drone extends Enemy {
    private final double baseY;
    private int age = 0;

    public Drone(double x, double y) {
        super(x, y, 60, 22, 1, 100, 15);    // one hit destroys it
        baseY = y;
    }

    @Override
    public void update() {
        age++;
        x -= 2.6;
        y = baseY + Math.sin(age / 12.0) * 18;   // bobs up and down
        super.update();
    }

    @Override
    public void draw(Graphics2D g) {
        Sprites.drawDrone(g, (int) x + w / 2, (int) y + 14);
    }
}
