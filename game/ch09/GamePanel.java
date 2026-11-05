import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.RenderingHints;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.util.ArrayList;
import javax.swing.JPanel;

// The drawing area: a JPanel that paints the arena and listens to the keyboard
public class GamePanel extends JPanel implements KeyListener {
    public static final int W = 760, H = 380, GROUND = 330;

    private final GameFrame frame;
    private int playerX, playerY;
    private final ArrayList<Point> drones = new ArrayList<>();
    private int score;
    private int laserY = -1;                // -1 means "no shot on screen"
    private int laserEndX;

    public GamePanel(GameFrame frame) {
        this.frame = frame;
        setPreferredSize(new Dimension(W, H));
        setFocusable(true);                 // so the panel can receive key presses
        addKeyListener(this);
        reset();
    }

    public void reset() {
        drones.clear();
        drones.add(new Point(560, 120));
        drones.add(new Point(640, 200));
        drones.add(new Point(480, 270));
        playerX = 80;
        playerY = GROUND;
        score = 0;
        laserY = -1;
        frame.updateScore(score, drones.size());
        repaint();                          // ask Swing to call paintComponent soon
        requestFocusInWindow();
    }

    // One shot: a laser along the rifle's height that stops at the first drone
    public void fire() {
        laserY = playerY - 36;
        laserEndX = W;
        Point hit = null;
        for (Point d : drones) {
            boolean ahead = d.x > playerX;
            boolean inLine = Math.abs(d.y - laserY) < 16;
            if (ahead && inLine && (hit == null || d.x < hit.x)) {
                hit = d;
            }
        }
        if (hit != null) {
            drones.remove(hit);
            laserEndX = hit.x;
            score += 100;
        }
        frame.updateScore(score, drones.size());
        repaint();
        requestFocusInWindow();
    }

    @Override
    protected void paintComponent(Graphics g0) {
        super.paintComponent(g0);           // clear the old picture first
        Graphics2D g = (Graphics2D) g0;
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        Sprites.drawBackground(g, W, H, GROUND);
        for (Point d : drones) {
            Sprites.drawDrone(g, d.x, d.y);
        }
        Sprites.drawCommando(g, playerX, playerY, laserY >= 0);
        if (laserY >= 0) {
            Sprites.drawLaser(g, playerX + 36, laserY, laserEndX);
        }
        if (drones.isEmpty()) {
            g.setColor(Color.WHITE);
            g.setFont(new Font("SansSerif", Font.BOLD, 32));
            g.drawString("All drones down!", W / 2 - 130, H / 2);
        }
    }

    @Override
    public void keyPressed(KeyEvent e) {
        switch (e.getKeyCode()) {
            case KeyEvent.VK_LEFT:  playerX = Math.max(30, playerX - 10); break;
            case KeyEvent.VK_RIGHT: playerX = Math.min(W - 60, playerX + 10); break;
            case KeyEvent.VK_UP:    playerY = Math.max(120, playerY - 10); break;   // jump jets
            case KeyEvent.VK_DOWN:  playerY = Math.min(GROUND, playerY + 10); break;
            case KeyEvent.VK_SPACE: fire(); return;
            default: return;
        }
        laserY = -1;                        // moving clears the last shot
        repaint();
    }

    @Override
    public void keyReleased(KeyEvent e) { }

    @Override
    public void keyTyped(KeyEvent e) { }
}
