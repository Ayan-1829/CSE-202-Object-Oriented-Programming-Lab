import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.Font;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;

// The window: a score label on top, the arena in the middle, buttons below
public class GameFrame extends JFrame {
    private final JLabel scoreLabel = new JLabel();
    private final GamePanel panel;

    public GameFrame() {
        super("Code Commando - Chapter 9");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new BorderLayout());

        scoreLabel.setFont(new Font("SansSerif", Font.BOLD, 18));
        scoreLabel.setBorder(BorderFactory.createEmptyBorder(6, 10, 6, 10));
        add(scoreLabel, BorderLayout.NORTH);

        panel = new GamePanel(this);
        add(panel, BorderLayout.CENTER);

        JButton fire = new JButton("Fire");
        JButton reset = new JButton("Reset");
        fire.setFocusable(false);           // keep the keyboard focus on the panel
        reset.setFocusable(false);
        fire.addActionListener(e -> panel.fire());
        reset.addActionListener(e -> panel.reset());
        JPanel buttons = new JPanel(new FlowLayout());
        buttons.add(fire);
        buttons.add(reset);
        buttons.add(new JLabel("Arrow keys move, Space fires"));
        add(buttons, BorderLayout.SOUTH);

        pack();                             // size the window to fit its parts
        setLocationRelativeTo(null);        // centre it on the screen
    }

    public void updateScore(int score, int dronesLeft) {
        scoreLabel.setText("Score: " + score + "    Drones left: " + dronesLeft);
    }

    public static void main(String[] args) {
        // Swing must be built and changed on the Event Dispatch Thread
        SwingUtilities.invokeLater(() -> new GameFrame().setVisible(true));
    }
}
