import javax.swing.JPanel;
import java.awt.Color;
import java.awt.Graphics;
import java.util.ArrayList;

public class DrawingPanel extends JPanel {

    private ArrayList<Shape> shapes;
    private Color currentColor;

    public DrawingPanel() {
        shapes = new ArrayList<Shape>();
        currentColor = Color.BLUE;
        setBackground(Color.WHITE);
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        drawGrid(g);
        for (Shape shape : shapes) {
            shape.draw(g);
        }
    }

    private void drawGrid(Graphics g) {
        g.setColor(new Color(220, 220, 220));
        for (int x = 0; x < getWidth(); x += 50) {
            g.drawLine(x, 0, x, getHeight());
        }
        for (int y = 0; y < getHeight(); y += 50) {
            g.drawLine(0, y, getWidth(), y);
        }
    }

    public void addRectangle(int x, int y, int width, int height) {
        shapes.add(new RectangleShape(x, y, width, height, currentColor));
        repaint();
    }

    public void addCircle(int x, int y, int radius) {
        shapes.add(new CircleShape(x, y, radius, currentColor));
        repaint();
    }

    public void clear() {
        shapes.clear();
        repaint();
    }

    public void setCurrentColor(Color colour) {
        this.currentColor = colour;
    }

    public int getShapeCount() {
        return shapes.size();
    }
}
