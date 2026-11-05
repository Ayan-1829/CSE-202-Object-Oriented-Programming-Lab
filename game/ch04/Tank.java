public class Tank extends Enemy {
    private int armor;

    public Tank(String name, int armor) {
        super(name, 120, 20);               // slow, tough and hits hard
        this.armor = armor;
    }

    @Override
    public void attack(GameCharacter target) {
        target.takeDamage(damage);
        System.out.println(name + " fires a shell at " + target.getName() + "! -" + damage);
    }

    // Armor blocks part of every hit, then the inherited version does the rest
    @Override
    public void takeDamage(int amount) {
        int blocked = Math.min(armor, amount);
        System.out.println("  " + name + "'s armor blocks " + blocked);
        super.takeDamage(amount - blocked);
    }

    // Only tanks have this method
    public void raiseShield() {
        armor += 10;
        System.out.println(name + " raises its shield: armor " + armor);
    }

    @Override
    public void describe() {
        super.describe();                   // reuse Enemy's version, then add more
        System.out.println("  armor " + armor);
    }
}
