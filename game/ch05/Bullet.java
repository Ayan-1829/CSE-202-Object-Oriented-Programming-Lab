public class Bullet extends GameObject {
    private int direction;                  // +1 flies right, -1 flies left

    public Bullet(String name, int x, int direction) {
        super(name, x);
        this.direction = direction;
    }

    @Override
    public void update() {
        x += 3 * direction;                 // bullets are fast
    }

    @Override
    public char symbol() {
        return direction > 0 ? '>' : '<';
    }
}
