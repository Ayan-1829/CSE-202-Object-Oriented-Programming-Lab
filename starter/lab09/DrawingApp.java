import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class DrawingApp extends JFrame {

    private DrawingPanel drawingPanel;
    private JLabel statusLabel;
    private JButton rectangleButton;
    private JButton circleButton;
    private JButton clearButton;
    private JComboBox<String> colorComboBox;

    public DrawingApp() {
        setTitle("Drawing Application");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setupUI();
        addActionListeners();
        setVisible(true);
    }

    private void setupUI() {
        JPanel mainPanel = new JPanel(new BorderLayout(10, 10));
        mainPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        JPanel topPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JLabel titleLabel = new JLabel("Drawing Application");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 16));
        topPanel.add(titleLabel);

        drawingPanel = new DrawingPanel();
        drawingPanel.setBorder(BorderFactory.createLineBorder(Color.BLACK, 2));

        JPanel controlPanel = new JPanel(new BorderLayout());
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JLabel colorLabel = new JLabel("Colour:");
        colorComboBox = new JComboBox<String>(
                new String[] {"Blue", "Red", "Green", "Yellow", "Orange", "Purple"});
        rectangleButton = new JButton("Add Rectangle");
        circleButton = new JButton("Add Circle");
        clearButton = new JButton("Clear All");

        buttonPanel.add(colorLabel);
        buttonPanel.add(colorComboBox);
        buttonPanel.add(rectangleButton);
        buttonPanel.add(circleButton);
        buttonPanel.add(clearButton);

        statusLabel = new JLabel("Ready. Shapes: 0");
        controlPanel.add(buttonPanel, BorderLayout.CENTER);
        controlPanel.add(statusLabel, BorderLayout.SOUTH);

        mainPanel.add(topPanel, BorderLayout.NORTH);
        mainPanel.add(drawingPanel, BorderLayout.CENTER);
        mainPanel.add(controlPanel, BorderLayout.SOUTH);
        setContentPane(mainPanel);
    }

    private void addActionListeners() {
        rectangleButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                drawingPanel.setCurrentColor(getSelectedColor());
                int x = (int) (Math.random() * 600);
                int y = (int) (Math.random() * 350);
                drawingPanel.addRectangle(x, y, 100, 80);
                updateStatus();
            }
        });
        circleButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                drawingPanel.setCurrentColor(getSelectedColor());
                int x = 60 + (int) (Math.random() * 600);
                int y = 60 + (int) (Math.random() * 350);
                drawingPanel.addCircle(x, y, 50);
                updateStatus();
            }
        });
        clearButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                drawingPanel.clear();
                updateStatus();
            }
        });
    }

    private Color getSelectedColor() {
        String selected = (String) colorComboBox.getSelectedItem();
        if ("Red".equals(selected)) {
            return Color.RED;
        } else if ("Green".equals(selected)) {
            return Color.GREEN;
        } else if ("Yellow".equals(selected)) {
            return Color.YELLOW;
        } else if ("Orange".equals(selected)) {
            return new Color(255, 165, 0);
        } else if ("Purple".equals(selected)) {
            return new Color(128, 0, 128);
        } else {
            return Color.BLUE;
        }
    }

    private void updateStatus() {
        statusLabel.setText("Ready. Shapes: " + drawingPanel.getShapeCount());
    }
}
