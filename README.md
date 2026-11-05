<div align="center">

<img src="img/logo.svg" alt="CSE 202 logo" height="76">

# CSE 202 · Object Oriented Programming Lab

**Learn Java OOP by building a game: ten interactive lab chapters around Code Commando.**

<a href="https://ayan-1829.github.io/CSE-202-Object-Oriented-Programming-Lab/"><img alt="Live site: open" src="https://img.shields.io/badge/Live_site-open-E07A1F?style=for-the-badge&logo=githubpages&logoColor=white"></a>
<img alt="Chapters: 10" src="https://img.shields.io/badge/Chapters-10-555555?style=for-the-badge">
<img alt="Build step: none" src="https://img.shields.io/badge/Build_step-none-555555?style=for-the-badge&logo=html5&logoColor=white">

</div>

## 🎮 The idea

Every chapter starts from a real problem in a small action game: a commando with a rifle fighting drones, tanks and snipers.
The game grows with the course, and each Java topic is explained by the part of the game that needs it.

| # | Chapter | Mission | In the game |
|:--:|---|---|---|
| **1** | Java Syntax, Data Types & Control Flow | The numbers behind the game | health, ammo and score as variables; firing with loops |
| **2** | Classes, Objects, Instances & Methods | Build the characters | `Player` and `Enemy` classes, objects, references |
| **3** | Constructors, Overloading & Reference Passing | Arm up | a `Weapon` armory, overloaded `shoot()`, a medic |
| **4** | Inheritance, Polymorphism & Overriding | Many enemies, one fight | `Drone`, `Tank`, `Sniper` extend `Enemy` |
| **5** | Abstract Classes & Interfaces | Rules every object follows | abstract `GameObject`; `Damageable`, `Shooter`, `Collectible` |
| **6** | Exception Handling & Custom Exceptions | When things go wrong | `OutOfAmmoException`, `InvalidLevelException` |
| **7** | Thread Creation & Thread States | Everything at once | spawner, ammo regen and timer threads |
| **8** | Synchronization, Deadlock & Resource Allocation | Sharing safely | a shared scoreboard, soldiers deadlocked over supplies |
| **9** | GUI Components, Drawing, AWT & Swing | Put the game on screen | a Swing window that draws the game |
| **10** | Animation with Threads | Bring it to life | the full game with a game-loop thread |

Each chapter has:

- the ideas, shown with animated and interactive game scenes;
- the chapter's game program, walked through section by section, with its real output;
- game practice tasks with hints;
- the **official lab program, in-lab tasks and report exercises**, unchanged from the lab manual;
- viva questions, a quiz and a summary.

The Java sources of every chapter are in [`game/`](game/): each folder compiles on its own with `javac *.java`.

## ⌨️ Using the slides

| Key | Action |
|:--:|---|
| <kbd>←</kbd> <kbd>→</kbd> · <kbd>Space</kbd> | previous / next slide |
| <kbd>F</kbd> | full screen for teaching |
| <kbd>M</kbd> | slide list |
| click a game, then arrows / Space | play inside a game scene |

## 🚀 Run it locally

No build step and no server: open `index.html` in any modern browser.

---

<p align="center">Made by <b>Ayan Sarkar</b> · Green University of Bangladesh · Code Commando and its art are original to this course</p>
