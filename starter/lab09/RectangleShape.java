import java.awt.Color;
import java.awt.Graphics;

public class RectangleShape extends Shape {

    private int width;
    private int height;

    public RectangleShape(int x, int y, int width, int height, Color colour) {
        super(x, y, colour);
        this.width = (width > 0) ? width : 100;
        this.height = (height > 0) ? height : 80;
    }

    @Override
    public void draw(Graphics g) {
        g.setColor(colour);
        g.fillRect(x, y, width, height);
        g.setColor(Color.BLACK);
        g.drawRect(x, y, width, height);
    }
}
