import java.awt.Graphics2D;

public class Tank extends Enemy {
    private int reload = 60;

    public Tank(double x) {
        super(x, GamePanel.GROUND - 40, 80, 40, 3, 300, 30);   // takes 3 hits
    }

    @Override
    public void update() {
        x -= 1.1;
        if (reload > 0) reload--;
        super.update();
    }

    @Override
    public Bullet tryShoot() {
        if (reload > 0 || x > GamePanel.W - 40) {
            return null;
        }
        reload = 110;
        return new Bullet(x, y + 6, -5, true);  // a shell from the cannon, flying left
    }

    @Override
    public void draw(Graphics2D g) {
        Sprites.drawTank(g, (int) x + 10, (int) y + h);
    }
}
