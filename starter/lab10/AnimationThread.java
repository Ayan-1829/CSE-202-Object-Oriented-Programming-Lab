public class AnimationThread implements Runnable {

    private AnimationPanel panel;

    private static final int TARGET_FPS = 60;
    private static final long FRAME_TIME_MS = 1000 / TARGET_FPS;

    public AnimationThread(AnimationPanel panel) {
        this.panel = panel;
    }

    @Override
    public void run() {
        while (true) {
            long frameStartTime = System.currentTimeMillis();

            panel.updateAnimation();
            panel.repaint();

            long elapsedTime = System.currentTimeMillis() - frameStartTime;
            long sleepTime = FRAME_TIME_MS - elapsedTime;
            if (sleepTime > 0) {
                try {
                    Thread.sleep(sleepTime);
                } catch (InterruptedException e) {
                    System.out.println("Animation thread interrupted.");
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
}
