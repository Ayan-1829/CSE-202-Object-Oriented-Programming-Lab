public class ExceptionDemo {

    static int score = 0;

    // finally runs even when the try block returns early
    static String saveScore() {
        try {
            return "score " + score + " sent to the server";
        } finally {
            System.out.println("  finally: score " + score + " written to save.dat");
        }
    }

    public static void main(String[] args) {

        System.out.println("=== An unchecked exception: a lane that does not exist ===");
        int[] laneY = { 100, 200, 300 };
        try {
            System.out.println("Lane 5 is at y=" + laneY[5]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught " + e.getClass().getSimpleName() + ": " + e.getMessage());
        }

        System.out.println("\n=== try / catch / finally: firing until the clip is empty ===");
        Gun pistol = new Gun("Pistol", 2);
        for (int shot = 1; shot <= 3; shot++) {
            try {
                pistol.fire();
                score += 10;
            } catch (OutOfAmmoException e) {
                System.out.println("  Caught: " + e.getMessage() + " -> reloading");
                pistol.reload(6);
            } finally {
                System.out.println("  (shot " + shot + " logged, score " + score + ")");
            }
        }

        System.out.println("\n=== throw for a bad argument ===");
        try {
            pistol.reload(-5);
        } catch (IllegalArgumentException e) {
            System.out.println("Caught: " + e.getMessage());
        }

        System.out.println("\n=== A custom exception that wraps another ===");
        String[] typed = { "3", "abc", "42" };
        for (String t : typed) {
            try {
                int level = LevelLoader.load(t);
                System.out.println("Loaded level " + level);
            } catch (InvalidLevelException e) {
                System.out.println("Cannot load: " + e.getMessage());
                if (e.getCause() != null) {
                    System.out.println("  cause: " + e.getCause().getClass().getSimpleName());
                }
            }
        }

        System.out.println("\n=== Catching by the parent type ===");
        Gun rocket = new Gun("Rocket", 0);
        try {
            rocket.fire();
        } catch (GameException e) {
            System.out.println("GameException handler caught " + e.getClass().getSimpleName() + ": " + e.getMessage());
        }

        System.out.println("\n=== finally always runs ===");
        System.out.println(saveScore());
    }
}
