public class Player extends GameObject implements Damageable, Shooter {
    private int health = 100;
    private int shots = 0;

    public Player(String name, int x) {
        super(name, x);
    }

    @Override
    public void update() {
        x += 1;                             // walks right one step
    }

    @Override
    public char symbol() {
        return 'P';
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
        shots++;
        return new Bullet(name + "-bullet" + shots, x + 1, +1);
    }

    public void heal(int amount) {
        health = Math.min(100, health + amount);
    }

    public int getHealth() {
        return health;
    }
}
