public class Rectangle {

    private double width;
    private double height;
    private String colour;

    public Rectangle() {
        this(1.0, 1.0, "White");
    }

    public Rectangle(double side) {
        this(side, side, "White");
    }

    public Rectangle(double width, double height) {
        this(width, height, "White");
    }

    public Rectangle(double width, double height, String colour) {
        if (width > 0) {
            this.width = width;
        } else {
            this.width = 1.0;
        }
        if (height > 0) {
            this.height = height;
        } else {
            this.height = 1.0;
        }
        this.colour = colour;
    }

    // Copy constructor
    public Rectangle(Rectangle other) {
        this(other.width, other.height, other.colour);
    }

    public double area() {
        return width * height;
    }

    public double area(double scaleFactor) {
        return area() * scaleFactor;
    }

    public static double area(double width, double height) {
        return width * height;
    }

    public String describe() {
        return String.format("Rectangle[%.2f x %.2f, colour=%s, area=%.2f]",
                width, height, colour, area());
    }

    public String describe(String prefix) {
        return prefix + ": " + describe();
    }

    public void scale(double factor) {
        if (factor > 0) {
            width = width * factor;
            height = height * factor;
        }
    }

    public double getWidth() { return width; }
    public double getHeight() { return height; }
    public String getColour() { return colour; }
    public void setColour(String colour) { this.colour = colour; }

    @Override
    public String toString() {
        return describe();
    }
}
