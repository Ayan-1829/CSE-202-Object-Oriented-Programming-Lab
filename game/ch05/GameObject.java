public abstract class GameObject {
    protected String name;
    protected int x;                        // column on the map, 0..19

    public GameObject(String name, int x) {
        this.name = name;
        this.x = x;
    }

    // Abstract: every kind of object must say how it moves and how it looks
    public abstract void update();
    public abstract char symbol();

    // Concrete: shared by every subclass
    public String getName() { return name; }
    public int getX()       { return x; }

    public String position() {
        return name + " at x=" + x;
    }
}
