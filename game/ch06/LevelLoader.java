public class LevelLoader {
    public static final int MAX_LEVEL = 10;

    // Turns text such as "3" into a level number, or explains why it cannot
    public static int load(String text) throws InvalidLevelException {
        int level;
        try {
            level = Integer.parseInt(text.trim());
        } catch (NumberFormatException e) {
            throw new InvalidLevelException("\"" + text + "\" is not a level number", e);
        }
        if (level < 1 || level > MAX_LEVEL) {
            throw new InvalidLevelException("level " + level + " does not exist (1-" + MAX_LEVEL + ")");
        }
        return level;
    }
}
