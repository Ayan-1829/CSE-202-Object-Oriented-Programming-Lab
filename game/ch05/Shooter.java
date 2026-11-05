// Anything that can fire bullets
public interface Shooter {
    int RANGE = 8;                          // interface fields are public static final

    Bullet shoot();
}
