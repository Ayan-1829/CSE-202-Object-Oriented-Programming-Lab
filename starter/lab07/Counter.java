public class Counter {

    private int value;
    private String name;

    public Counter(String name, int initialValue) {
        this.name = name;
        this.value = initialValue;
    }

    public synchronized void increment() {
        value++;
        System.out.println(Thread.currentThread().getName()
                + " incremented " + name + " to " + value);
    }

    public synchronized void decrement() {
        value--;
        System.out.println(Thread.currentThread().getName()
                + " decremented " + name + " to " + value);
    }

    public synchronized int getValue() {
        return value;
    }

    public void display() {
        System.out.println(name + " = " + getValue());
    }
}
