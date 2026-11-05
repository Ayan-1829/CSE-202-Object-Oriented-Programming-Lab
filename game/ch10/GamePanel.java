import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.util.ArrayList;
import java.util.Random;
import javax.swing.JPanel;

// The game: a thread updates the world about 60 times a second, Swing paints it
public class GamePanel extends JPanel implements Runnable, KeyListener {
    public static final int W = 760, H = 380, GROUND = 330;

    private final Object lock = new Object();           // guards the lists below
    private final ArrayList<Enemy> enemies = new ArrayList<>();
    private final ArrayList<Bullet> bullets = new ArrayList<>();
    private final ArrayList<Explosion> explosions = new ArrayList<>();
    private final Random random = new Random();
    private Player player;
    private int score, frame, spawnTimer;
    private boolean gameOver;

    // Written by the Event Dispatch Thread, read by the game thread
    private volatile boolean left, right, up, down, firing, restart;
    private volatile boolean running;
    private Thread gameThread;

    public GamePanel() {
        setPreferredSize(new Dimension(W, H));
        setFocusable(true);
        addKeyListener(this);
        newGame();
    }

    private void newGame() {
        synchronized (lock) {
            enemies.clear();
            bullets.clear();
            explosions.clear();
            player = new Player(70, GROUND);
            score = 0;
            frame = 0;
            spawnTimer = 0;
            gameOver = false;
        }
    }

    public void start() {
        running = true;
        gameThread = new Thread(this, "GameLoop");
        gameThread.start();
    }

    public void stop() {
        running = false;
    }

    // The game loop: update, then repaint, then sleep until the next frame
    @Override
    public void run() {
        while (running) {
            long begin = System.currentTimeMillis();
            synchronized (lock) {
                update();
            }
            repaint();
            long wait = 16 - (System.currentTimeMillis() - begin);
            try {
                Thread.sleep(Math.max(2, wait));
            } catch (InterruptedException e) {
                return;
            }
        }
    }

    private void update() {
        if (gameOver) {
            if (restart) {
                restart = false;
                newGame();
            }
            return;
        }
        frame++;

        // 1. the player
        player.move((right ? 1 : 0) - (left ? 1 : 0), (down ? 1 : 0) - (up ? 1 : 0));
        player.update();
        if (firing) {
            Bullet b = player.tryShoot();
            if (b != null) bullets.add(b);
        }

        // 2. new enemies, a little faster as the score grows
        spawnTimer--;
        if (spawnTimer <= 0) {
            if (random.nextInt(4) == 0) {
                enemies.add(new Tank(W + 10));
            } else {
                enemies.add(new Drone(W + 10, 90 + random.nextInt(170)));
            }
            spawnTimer = Math.max(30, 80 - score / 200);
        }

        // 3. move everything
        for (Enemy e : enemies) {
            e.update();
            Bullet shell = e.tryShoot();
            if (shell != null) bullets.add(shell);
        }
        for (Bullet b : bullets) b.update();
        for (Explosion x : explosions) x.update();

        // 4. collisions
        for (Bullet b : bullets) {
            if (!b.isActive()) continue;
            if (b.isFromEnemy()) {
                if (b.collidesWith(player)) {
                    b.destroy();
                    player.takeDamage(20);
                }
                continue;
            }
            for (Enemy e : enemies) {
                if (e.isActive() && b.collidesWith(e)) {
                    b.destroy();
                    e.takeHit();
                    if (!e.isActive()) {
                        score += e.getPoints();
                        explosions.add(new Explosion(e.x + e.w / 2.0, e.y + e.h / 2.0));
                    }
                    break;
                }
            }
        }
        // enemies that crash into the player
        for (Enemy e : enemies) {
            if (e.isActive() && e.collidesWith(player)) {
                e.destroy();
                player.takeDamage(e.getTouchDamage());
                explosions.add(new Explosion(e.x + e.w / 2.0, e.y + e.h / 2.0));
            }
        }

        // 5. remove what is finished
        enemies.removeIf(e -> !e.isActive());
        bullets.removeIf(b -> !b.isActive());
        explosions.removeIf(x -> !x.isActive());
        if (!player.isActive()) {
            gameOver = true;
        }
    }

    @Override
    protected void paintComponent(Graphics g0) {
        super.paintComponent(g0);
        Graphics2D g = (Graphics2D) g0;
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        synchronized (lock) {               // never draw while the game thread changes the lists
            Sprites.drawBackground(g, W, H, GROUND);
            for (Enemy e : enemies) e.draw(g);
            for (Bullet b : bullets) b.draw(g);
            if (player.isActive()) player.draw(g);
            for (Explosion x : explosions) x.draw(g);
            drawHud(g);
        }
    }

    private void drawHud(Graphics2D g) {
        g.setColor(new Color(0, 0, 0, 120));
        g.fillRect(10, 10, 210, 22);
        g.setColor(new Color(220, 60, 60));
        g.fillRect(10, 10, player.getHealth() * 2, 22);
        g.setColor(Color.WHITE);
        g.setFont(new Font("SansSerif", Font.BOLD, 16));
        g.drawString("HP " + player.getHealth(), 16, 27);
        g.drawString("Score " + score, W - 130, 27);
        if (gameOver) {
            g.setFont(new Font("SansSerif", Font.BOLD, 40));
            g.drawString("GAME OVER", W / 2 - 120, H / 2 - 10);
            g.setFont(new Font("SansSerif", Font.PLAIN, 18));
            g.drawString("Score " + score + "  -  press R to play again", W / 2 - 150, H / 2 + 24);
        }
    }

    @Override
    public void keyPressed(KeyEvent e) {
        setKey(e.getKeyCode(), true);
    }

    @Override
    public void keyReleased(KeyEvent e) {
        setKey(e.getKeyCode(), false);
    }

    private void setKey(int code, boolean down) {
        switch (code) {
            case KeyEvent.VK_LEFT:  left = down; break;
            case KeyEvent.VK_RIGHT: right = down; break;
            case KeyEvent.VK_UP:    up = down; break;
            case KeyEvent.VK_DOWN:  this.down = down; break;
            case KeyEvent.VK_SPACE: firing = down; break;
            case KeyEvent.VK_R:     if (down) restart = true; break;
            default: break;
        }
    }

    @Override
    public void keyTyped(KeyEvent e) { }
}
