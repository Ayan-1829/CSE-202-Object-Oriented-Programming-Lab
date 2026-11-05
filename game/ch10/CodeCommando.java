import javax.swing.JFrame;
import javax.swing.SwingUtilities;

public class CodeCommando {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame window = new JFrame("Code Commando");
            GamePanel game = new GamePanel();
            window.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            window.add(game);
            window.pack();
            window.setResizable(false);
            window.setLocationRelativeTo(null);
            window.setVisible(true);
            game.requestFocusInWindow();
            game.start();                   // the game thread begins here
        });
    }
}
