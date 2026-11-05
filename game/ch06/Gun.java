public class Gun {
    private String name;
    private int ammo;

    public Gun(String name, int ammo) {
        this.name = name;
        this.ammo = ammo;
    }

    // throws: tells every caller that this method can fail this way
    public void fire() throws OutOfAmmoException {
        if (ammo == 0) {
            throw new OutOfAmmoException(name);
        }
        ammo--;
        System.out.println("  BANG! " + name + " has " + ammo + " left");
    }

    // An unchecked exception for a programming mistake
    public void reload(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("reload amount must be positive, got " + amount);
        }
        ammo += amount;
        System.out.println("  reloaded " + amount + " -> " + name + " has " + ammo);
    }
}
