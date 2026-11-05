public class Drone extends GameObject implements Damageable, Shooter {
    private int health = 30;

    public Drone(String name, int x) {
        super(name, x);
    }

    @Override
    public void update() {
        x -= 1;                             // flies left, towards the player
    }

    @Override
    public char symbol() {
        return isDestroyed() ? '*' : 'D';
    }

    @Override
    public void takeDamage(int amount) {
        health = Math.max(0, health - amount);
        System.out.println("  " + name + " is hit: health " + health);
    }

    @Override
    public boolean isDestroyed() {
        return health == 0;
    }

    @Override
    public Bullet shoot() {
        return new Bullet(name + "-laser", x - 1, -1);
    }
}
