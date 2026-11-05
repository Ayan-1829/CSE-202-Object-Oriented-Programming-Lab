// One scoreboard shared by the whole squad
public class Scoreboard {
    private int score = 0;

    // Not safe: read, add and write can interleave with another thread
    public void addUnsafe(int points) {
        score = score + points;
    }

    // Safe: only one thread at a time may run this method on this object
    public synchronized void addSafe(int points) {
        score = score + points;
    }

    public synchronized int getScore() {
        return score;
    }

    public synchronized void reset() {
        score = 0;
    }
}
