// Anything the player can pick up
public interface Collectible {
    void collectBy(Player p);

    // A default method: implementers get it for free and may override it
    default String pickupMessage() {
        return "picked up";
    }
}
