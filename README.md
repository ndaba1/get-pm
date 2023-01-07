## pacman - Detect and abstract away package managers in JS/TS codebases

### Why?
Many a time, I find myself creating CLIs that require some sort of access to the user's package manager. This is a pain to do, as I have to write a bunch of code to detect the user's package manager, and then write code to abstract away the differences between the package managers. This package aims to solve that problem.

Right about now, you might be thinking "Why not use [which-pm](https://github.com/zkochan/packages/tree/main/which-pm) or [which-pm-runs](https://github.com/zkochan/packages/tree/main/which-pm-runs) or [preferred-pm](https://github.com/zkochan/packages/tree/main/preferred-pm)". Well, those packages are great, but they don't abstract away the differences between the package managers. This package does that.

