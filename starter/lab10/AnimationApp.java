import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class AnimationApp extends JFrame {

    private AnimationPanel animationPanel;
    private JButton startButton;
    private JButton pauseButton;
    private JButton resetButton;
    private JLabel statusLabel;
    private Thread animationThread;

    public AnimationApp() {
        setTitle("Bouncing Balls Animation");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setupUI();
        addActionListeners();
        startWorkerThread();
        setVisible(true);
    }

    private void setupUI() {
        JPanel mainPanel = new JPanel(new BorderLayout(10, 10));
        mainPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        JPanel topPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JLabel titleLabel = new JLabel("Bouncing Balls Animation");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 16));
        topPanel.add(titleLabel);

        animationPanel = new AnimationPanel();
        animationPanel.setBorder(BorderFactory.createLineBorder(Color.BLACK, 2));

        JPanel controlPanel = new JPanel(new BorderLayout());
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        startButton = new JButton("Start");
        pauseButton = new JButton("Pause");
        resetButton = new JButton("Reset");
        buttonPanel.add(startButton);
        buttonPanel.add(pauseButton);
        buttonPanel.add(resetButton);

        statusLabel = new JLabel("Status: Initialized");
        controlPanel.add(buttonPanel, BorderLayout.CENTER);
        controlPanel.add(statusLabel, BorderLayout.SOUTH);

        mainPanel.add(topPanel, BorderLayout.NORTH);
        mainPanel.add(animationPanel, BorderLayout.CENTER);
        mainPanel.add(controlPanel, BorderLayout.SOUTH);
        setContentPane(mainPanel);
    }

    private void addActionListeners() {
        startButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                animationPanel.startAnimation();
                updateStatus("Running");
            }
        });
        pauseButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                animationPanel.pauseAnimation();
                updateStatus("Paused");
            }
        });
        resetButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                animationPanel.resetAnimation();
                updateStatus("Reset");
            }
        });
    }

    private void startWorkerThread() {
        animationThread = new Thread(new AnimationThread(animationPanel));
        animationThread.setDaemon(true);
        animationThread.start();
    }

    private void updateStatus(String status) {
        statusLabel.setText("Status: " + status + " | Balls: " + animationPanel.getBallCount());
    }
}
