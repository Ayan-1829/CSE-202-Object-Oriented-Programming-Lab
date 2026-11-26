public abstract class Animal {

    protected String name;
    protected int age;

    protected Animal(String name, int age) {
        this.name = name;
        if (age >= 0) {
            this.age = age;
        } else {
            this.age = 0;
        }
    }

    public abstract void makeSound();

    public abstract void eat();

    public String getName() { return name; }
    public int getAge() { return age; }

    public void displayInfo() {
        System.out.println("Name: " + name + ", Age: " + age + " years");
    }
}
