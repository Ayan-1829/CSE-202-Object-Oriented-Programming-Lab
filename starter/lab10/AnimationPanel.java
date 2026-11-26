import javax.swing.JPanel;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.util.ArrayList;

public class AnimationPanel extends JPanel {

    private ArrayList<Ball> balls;
    private boolean running;

    public AnimationPanel() {
        balls = new ArrayList<Ball>();
        running = false;
        initializeBalls();
        setBackground(Color.WHITE);
    }

    private void initializeBalls() {
        balls.clear();
        balls.add(new Ball(100, 100, 3.0, 2.0, 15, Color.RED));
        balls.add(new Ball(300, 150, -2.5, 3.5, 15, Color.BLUE));
        balls.add(new Ball(200, 300, 2.0, -2.0, 15, Color.GREEN));
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        if (getWidth() <= 0 || getHeight() <= 0) {
            return;
        }
        BufferedImage buffer = new BufferedImage(getWidth(), getHeight(),
                BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = buffer.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
                RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, getWidth(), getHeight());
        drawGrid(g2d);

        synchronized (this) {
            for (Ball ball : balls) {
                ball.draw(g2d);
            }
            g2d.setColor(Color.BLACK);
            g2d.drawString("Balls: " + balls.size() + " | "
                    + (running ? "Running" : "Paused"), 10, getHeight() - 10);
        }
        g.drawImage(buffer, 0, 0, null);
        g2d.dispose();
    }

    private void drawGrid(Graphics2D g2d) {
        g2d.setColor(new Color(220, 220, 220));
        for (int x = 0; x < getWidth(); x += 50) {
            g2d.drawLine(x, 0, x, getHeight());
        }
        for (int y = 0; y < getHeight(); y += 50) {
            g2d.drawLine(0, y, getWidth(), y);
        }
    }

    public synchronized void updateAnimation() {
        if (!running) {
            return;
        }
        int width = getWidth();
        int height = getHeight();
        if (width <= 0 || height <= 0) {
            return;
        }
        for (Ball ball : balls) {
            ball.update(width, height);
        }
        for (int i = 0; i < balls.size(); i++) {
            for (int j = i + 1; j < balls.size(); j++) {
                Ball first = balls.get(i);
                Ball second = balls.get(j);
                if (first.collidesWith(second)) {
                    first.bounceOff(second);
                }
            }
        }
    }

    public synchronized void startAnimation() { running = true; }

    public synchronized void pauseAnimation() { running = false; }

    public synchronized void resetAnimation() {
        running = false;
        initializeBalls();
        repaint();
    }

    public synchronized boolean isRunning() { return running; }

    public synchronized int getBallCount() { return balls.size(); }
}
