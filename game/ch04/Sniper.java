public class Sniper extends Enemy {

    public Sniper(String name) {
        super(name, 50, 35);                // fragile, but every shot hurts
    }

    @Override
    public void attack(GameCharacter target) {
        target.takeDamage(damage);
        System.out.println(name + " takes aim... headshot on " + target.getName() + "! -" + damage);
    }

    // Only snipers have this method
    public void aim() {
        System.out.println(name + " steadies the rifle (red laser on)");
    }
}
