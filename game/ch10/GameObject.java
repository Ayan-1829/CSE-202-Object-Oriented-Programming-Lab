import java.awt.Graphics2D;
import java.awt.Rectangle;

// Everything on screen: it has a box, moves every frame and draws itself
public abstract class GameObject {
    protected double x, y;                  // top-left corner of the box
    protected final int w, h;               // size of the box
    protected boolean active = true;        // false = remove it next frame

    public GameObject(double x, double y, int w, int h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    public abstract void update();
    public abstract void draw(Graphics2D g);

    public Rectangle getBounds() {
        return new Rectangle((int) x, (int) y, w, h);
    }

    public boolean collidesWith(GameObject other) {
        return getBounds().intersects(other.getBounds());
    }

    public boolean isActive() { return active; }
    public void destroy()     { active = false; }
}
