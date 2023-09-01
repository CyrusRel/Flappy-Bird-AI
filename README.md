The goal of Flappy Bird is straightforward: keep the bird airborne for as long as possible while passing through openings in the pipes.
#The challenge lies in the timing and precision required to maneuver the bird through the narrow gaps between the pipes.
![birds](https://raw.githubusercontent.com/CyrusRel/Flappy-Bird-AI/main/game%20screenshots/Picture5.png)

With NEAT, the AI agent starts with a population of neural networks, each controlling a bird. These neural networks initially produce random behaviors. The AI then evaluates the performance of each bird based on criteria such as how far they travel or how long they stay alive. The best-performing birds, according to these criteria, are selected to "reproduce," creating a new generation of neural networks.
![birds](https://raw.githubusercontent.com/CyrusRel/Flappy-Bird-AI/main/game%20screenshots/Picture4.png)

