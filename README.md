## pacman
Detect and abstract away package managers in JS/TS codebases

### Why?
Many a time, I find myself creating CLIs that require some sort of access to the user's package manager. This is a pain to do, as I have to write a bunch of code to detect the user's package manager, and then write code to abstract away the differences between the package managers. This package aims to solve that problem.

Right about now, you might be thinking "Why not use [which-pm](https://github.com/zkochan/packages/tree/main/which-pm) or [which-pm-runs](https://github.com/zkochan/packages/tree/main/which-pm-runs) or [preferred-pm](https://github.com/zkochan/packages/tree/main/preferred-pm)". Well, those packages are great, but they don't abstract away the differences between the package managers. This package does that.

### Detection logic
- If a bin target is executed with a user_agent i.e `npx` | `pnpx` | `yarn dlx`, then the package manager is detected from the user_agent.
- If a `lockfile` is present, then the package manager is detected from the `lockfile`.
- If `node_modules` is present, then the package manager is detected from the `node_modules`.
- If multiple package managers are detected and the `prefer` option has been passed, then the package manager is detected from the `prefer` option. see example below.
- If all else fails, defaults to `npm`.

### Usage
```ts
import { getPackageManager } from 'pacman';

const pm = getPackageManager({
    prefer: ['pnpm', 'yarn'], // optional - if multiple found, prefer these
    cwd: process.cwd(), // optional - defaults to process.cwd()
    workspace: true, // optional - treat working dir as a workspace
    silent: false, // optional - suppress console output when running pm commands eg. `pm.install()`
});

console.log(pm.name); // npm | yarn | pnpm
console.log(pm.version) // semver version of the package manager

// install packages defined in package.json
await pm.install();

// add packages
await pm.add(['foo', 'bar']);

// add packages with flags/options
await pm.add(['foo', 'bar'], "-Dw"); // -Dw is the workspace flag for pnpm

// remove packages
await pm.remove(['foo', 'bar']);

// run scripts in package.json
await pm.run('build');

// execute binaries
await pm.exec('tailwindcss', ['init', '-p']);
```

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
