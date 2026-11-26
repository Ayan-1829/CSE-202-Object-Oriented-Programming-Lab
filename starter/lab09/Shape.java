import java.awt.Color;
import java.awt.Graphics;

public abstract class Shape {

    protected int x;
    protected int y;
    protected Color colour;

    public Shape(int x, int y, Color colour) {
        this.x = x;
        this.y = y;
        this.colour = colour;
    }

    public abstract void draw(Graphics g);
}
