public class InvalidLevelException extends GameException {
    public InvalidLevelException(String message) {
        super(message);
    }

    // Wraps the low-level exception that caused the problem
    public InvalidLevelException(String message, Throwable cause) {
        super(message, cause);
    }
}
