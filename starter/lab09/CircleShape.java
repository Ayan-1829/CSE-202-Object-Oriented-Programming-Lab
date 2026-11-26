import java.awt.Color;
import java.awt.Graphics;

public class CircleShape extends Shape {

    private int radius;

    public CircleShape(int x, int y, int radius, Color colour) {
        super(x, y, colour);
        this.radius = (radius > 0) ? radius : 50;
    }

    @Override
    public void draw(Graphics g) {
        int diameter = 2 * radius;
        g.setColor(colour);
        g.fillOval(x - radius, y - radius, diameter, diameter);
        g.setColor(Color.BLACK);
        g.drawOval(x - radius, y - radius, diameter, diameter);
    }
}
