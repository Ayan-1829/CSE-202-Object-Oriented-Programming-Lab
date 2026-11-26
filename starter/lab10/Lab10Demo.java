import javax.swing.SwingUtilities;

public class Lab10Demo {

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new AnimationApp();
            }
        });
    }
}
