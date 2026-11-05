// Anything that can be hit and destroyed
public interface Damageable {
    void takeDamage(int amount);
    boolean isDestroyed();
}
