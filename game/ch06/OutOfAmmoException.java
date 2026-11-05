public class OutOfAmmoException extends GameException {
    private final String weapon;

    public OutOfAmmoException(String weapon) {
        super(weapon + " is out of ammo");
        this.weapon = weapon;
    }

    public String getWeapon() {
        return weapon;
    }
}
