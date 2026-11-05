// Each squad member is a thread that keeps scoring points
public class SquadMember extends Thread {
    private final Scoreboard board;
    private final boolean safe;

    public SquadMember(String name, Scoreboard board, boolean safe) {
        super(name);
        this.board = board;
        this.safe = safe;
    }

    @Override
    public void run() {
        for (int i = 0; i < 100000; i++) {
            if (safe) {
                board.addSafe(1);
            } else {
                board.addUnsafe(1);
            }
        }
    }
}
