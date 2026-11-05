// Way 2: implement Runnable and hand the task to a Thread
public class AmmoRegen implements Runnable {
    private int ammo;

    public AmmoRegen(int ammo) {
        this.ammo = ammo;
    }

    @Override
    public void run() {
        String me = Thread.currentThread().getName();
        for (int i = 1; i <= 3; i++) {
            ammo += 5;
            System.out.println("[" + me + "] +5 ammo -> " + ammo);
            try {
                Thread.sleep(450);
            } catch (InterruptedException e) {
                return;
            }
        }
        System.out.println("[" + me + "] clip full");
    }

    public int getAmmo() {
        return ammo;
    }
}
