public class Medic {
    private String name;

    public Medic(String name) {
        this.name = name;
    }

    // p is a copy of the reference: it points at the caller's Player object
    public void heal(Player p, int amount) {
        p.setHealth(p.getHealth() + amount);
        System.out.println(name + " heals " + p.getName() + " -> health " + p.getHealth());
    }
}
