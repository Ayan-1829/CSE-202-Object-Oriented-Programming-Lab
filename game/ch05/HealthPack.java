public class HealthPack extends GameObject implements Collectible {
    private int amount;

    public HealthPack(int x, int amount) {
        super("HealthPack", x);
        this.amount = amount;
    }

    @Override
    public void update() {
        // a health pack lies still: an empty body is still an implementation
    }

    @Override
    public char symbol() {
        return '+';
    }

    @Override
    public void collectBy(Player p) {
        p.heal(amount);
        System.out.println("  " + p.getName() + " " + pickupMessage() + " -> health " + p.getHealth());
    }

    @Override
    public String pickupMessage() {
        return "grabs a health pack (+" + amount + ")";
    }
}
