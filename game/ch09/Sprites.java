import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.GradientPaint;
import java.awt.Graphics2D;

// Draws every character from simple shapes: rectangles, ovals and arcs
public final class Sprites {
    private Sprites() { }

    static final Color SKY_TOP    = new Color(14, 26, 46);
    static final Color SKY_BOTTOM = new Color(34, 56, 90);
    static final Color CITY       = new Color(26, 42, 64);
    static final Color DIRT       = new Color(59, 47, 37);
    static final Color GRASS      = new Color(76, 122, 58);

    public static void drawBackground(Graphics2D g, int w, int h, int ground) {
        g.setPaint(new GradientPaint(0, 0, SKY_TOP, 0, ground, SKY_BOTTOM));
        g.fillRect(0, 0, w, ground);
        g.setColor(CITY);
        int[] tops = { 60, 90, 40, 110, 70, 50, 95, 65 };
        int bw = w / tops.length;
        for (int i = 0; i < tops.length; i++) {
            g.fillRect(i * bw + 6, ground - tops[i], bw - 12, tops[i]);
        }
        g.setColor(DIRT);
        g.fillRect(0, ground, w, h - ground);
        g.setColor(GRASS);
        g.fillRect(0, ground, w, 4);
    }

    // (x, y) = the point between the boots, on the ground
    public static void drawCommando(Graphics2D g, int x, int y, boolean firing) {
        Color dark = new Color(47, 93, 44), green = new Color(62, 123, 58);
        Color skin = new Color(224, 180, 138), metal = new Color(34, 34, 34);
        g.setColor(dark);
        g.fillRect(x - 18, y - 44, 7, 18);                  // backpack
        g.fillRect(x - 10, y - 22, 8, 22);                  // back leg
        g.fillRect(x + 2, y - 22, 8, 22);                   // front leg
        g.setColor(Color.BLACK);
        g.fillRect(x - 12, y - 4, 12, 4);                   // boots
        g.fillRect(x + 1, y - 4, 12, 4);
        g.setColor(green);
        g.fillRect(x - 12, y - 46, 24, 26);                 // body
        g.setColor(new Color(110, 80, 40));
        g.fillRect(x - 12, y - 24, 24, 3);                  // belt
        g.setColor(skin);
        g.fillOval(x - 8, y - 60, 16, 16);                  // head
        g.setColor(dark);
        g.fillArc(x - 10, y - 66, 20, 16, 0, 180);          // helmet
        g.fillRect(x - 10, y - 59, 22, 3);                  // helmet brim
        g.setColor(Color.BLACK);
        g.fillRect(x + 3, y - 55, 4, 3);                    // eye
        g.setColor(metal);
        g.fillRect(x + 2, y - 38, 26, 6);                   // rifle
        g.fillRect(x + 28, y - 37, 8, 3);                   // barrel
        g.setColor(green);
        g.fillRect(x - 2, y - 40, 14, 6);                   // arm
        g.setColor(skin);
        g.fillOval(x + 9, y - 41, 7, 7);                    // hand
        if (firing) {
            g.setColor(new Color(255, 210, 60));
            g.fillOval(x + 36, y - 41, 12, 10);             // muzzle flash
        }
    }

    // (cx, cy) = the centre of the drone
    public static void drawDrone(Graphics2D g, int cx, int cy) {
        g.setColor(new Color(58, 63, 71));
        g.fillRect(cx - 24, cy - 10, 48, 3);                // arms
        g.setColor(new Color(170, 178, 189));
        g.fillOval(cx - 30, cy - 14, 16, 4);                // rotors
        g.fillOval(cx + 14, cy - 14, 16, 4);
        g.setColor(new Color(90, 98, 112));
        g.fillOval(cx - 16, cy - 8, 32, 16);                // body
        g.setColor(new Color(255, 77, 77));
        g.fillOval(cx - 5, cy - 4, 10, 8);                  // red eye
    }

    // (x, y) = the left end of the tracks, on the ground
    public static void drawTank(Graphics2D g, int x, int y) {
        g.setColor(new Color(51, 51, 51));
        g.fillRoundRect(x, y - 14, 70, 14, 12, 12);         // tracks
        g.setColor(new Color(122, 106, 58));
        g.fillRect(x + 6, y - 28, 58, 14);                  // hull
        g.setColor(new Color(106, 90, 48));
        g.fillRoundRect(x + 20, y - 40, 28, 14, 8, 8);      // turret
        g.setColor(new Color(68, 68, 68));
        g.fillRect(x - 10, y - 36, 32, 5);                  // cannon, pointing left
    }

    public static void drawBullet(Graphics2D g, int x, int y, boolean enemy) {
        g.setColor(enemy ? new Color(255, 120, 60) : new Color(255, 214, 90));
        g.fillRoundRect(x - 5, y - 2, 10, 4, 4, 4);
    }

    // age runs from 0 (bang) to 20 (gone)
    public static void drawExplosion(Graphics2D g, int cx, int cy, int age) {
        int r = 6 + age * 2;
        int alpha = Math.max(0, 220 - age * 11);
        g.setColor(new Color(255, 140, 40, alpha));
        g.fillOval(cx - r, cy - r, 2 * r, 2 * r);
        g.setColor(new Color(255, 230, 120, alpha));
        g.fillOval(cx - r / 2, cy - r / 2, r, r);
    }

    public static void drawLaser(Graphics2D g, int x1, int y, int x2) {
        g.setColor(new Color(255, 220, 80));
        g.setStroke(new BasicStroke(3));
        g.drawLine(x1, y, x2, y);
        g.setStroke(new BasicStroke(1));
    }
}
