import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;

public class Ball {

    private double x;
    private double y;
    private double vx;
    private double vy;
    private int radius;
    private Color colour;

    public Ball(double x, double y, double vx, double vy, int radius, Color colour) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = (radius > 0) ? radius : 15;
        this.colour = colour;
    }

    public void update(int panelWidth, int panelHeight) {
        x = x + vx;
        y = y + vy;
        if (x - radius < 0 || x + radius > panelWidth) {
            vx = -vx;
            x = Math.max(radius, Math.min(panelWidth - radius, x));
        }
        if (y - radius < 0 || y + radius > panelHeight) {
            vy = -vy;
            y = Math.max(radius, Math.min(panelHeight - radius, y));
        }
    }

    public void draw(Graphics2D g) {
        int diameter = 2 * radius;
        g.setColor(colour);
        g.fillOval((int) (x - radius), (int) (y - radius), diameter, diameter);
        g.setColor(Color.BLACK);
        g.setStroke(new BasicStroke(2));
        g.drawOval((int) (x - radius), (int) (y - radius), diameter, diameter);
    }

    public boolean collidesWith(Ball other) {
        double dx = this.x - other.x;
        double dy = this.y - other.y;
        double distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius + other.radius;
    }

    public void bounceOff(Ball other) {
        double tempVx = this.vx;
        double tempVy = this.vy;
        this.vx = other.vx;
        this.vy = other.vy;
        other.vx = tempVx;
        other.vy = tempVy;
    }

    public double getX() { return x; }
    public double getY() { return y; }
    public int getRadius() { return radius; }
}
