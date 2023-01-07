import fs from "fs";
import path from "path";
import { execaSync, execa, Options as ExecOpts } from "execa";
import semver from "semver";
import { findUpSync } from "find-up";

type PM = "npm" | "yarn" | "pnpm" | "cnpm";
type Options = {
  prefer?: PM[];
  cwd?: string;
  workspace?: boolean;
  silent?: boolean;
};

export function getPackageManager(opts?: Options) {
  // get package manager
  return new PackageManager(opts);
}

export class PackageManager {
  #name: string;
  #version: string;

  constructor(private opts?: Options) {
    // start detection
    const pm =
      getFromUserAgent(opts) ||
      getFromLockFile(opts) ||
      getFromInstaller() ||
      getFromPrefer(opts) ||
      getFromInstalled();

    if (!pm) this.#name = "npm";
    else this.#name = pm;

    this.#version = execaSync(this.#name, ["--version"]).stdout;
  }

  get name() {
    // get package manager name
    return this.#name;
  }

  get version() {
    // get package manager version
    return this.#version;
  }

  async run(script: string) {
    // run script with package manager
    await execa(this.#name, ["run", script], this.#getExecOptions());
  }

  async add(deps: string[]) {
    // install deps
    await execa(this.#name, ["add", ...deps], this.#getExecOptions());
  }

  async install() {
    // install deps
    await execa(this.#name, ["install"], this.#getExecOptions());
  }

  async remove(deps: string[]) {
    // remove deps
    await execa(this.#name, ["remove", ...deps], this.#getExecOptions());
  }

  async upgrade(deps: string[]) {
    // upgrade deps
    await execa(this.#name, ["upgrade", ...deps], this.#getExecOptions());
  }

  async exec(cmd: string, args: string[]) {
    // exec command
    const pkg = this.#getExecutable();
    await execa(pkg, [cmd, ...args], this.#getExecOptions());
  }

  #getExecOptions() {
    // get execa options
    return {
      stdio: this.opts?.silent ? "ignore" : "inherit",
    } as Partial<ExecOpts>;
  }

  #getExecutable() {
    const mapping = {
        npm: "npx",
        yarn: "yarn exec",
        pnpm: "pnpx",
    }

    // @ts-ignore
    return mapping[this.#name] || "npx"
  }
}

function isAvailable(pm: PM) {
  // check if package manager is available
  try {
    const { stdout } = execaSync(pm, ["--version"]);
    if (semver.valid(String(stdout))) return true;

    return false;
  } catch (error) {
    return false;
  }
}

function getFromUserAgent(_opts?: Options) {
  // get package manager from user agent
  const packageManager = process.env.npm_config_user_agent;

  if (packageManager) {
    const pm = packageManager.split("/")[0];
    if (isAvailable(pm as PM)) {
      return pm;
    }
  }
}

function getFromLockFile(opts?: Options) {
  // get package manager from lock file
  const cwd = opts?.cwd || process.cwd();

  const mapping = {
    "package-lock.json": "npm",
    "yarn.lock": "yarn",
    "pnpm-lock.yaml": "pnpm",
  };

  for (const [file, pm] of Object.entries(mapping)) {
    if (fs.existsSync(path.join(cwd, file))) {
      return pm;
    }

    if (opts?.workspace) {
      const workspace = findUpSync(file, { cwd });
      if (workspace) {
        return pm;
      }
    }
  }
}

function getFromPrefer(opts?: Options) {
  // get package manager from prefer
  const prefer = opts?.prefer || ["npm", "yarn", "pnpm", "cnpm"];

  for (const pm of prefer) {
    if (isAvailable(pm)) {
      return pm;
    }
  }
}

function getFromInstalled() {
  // get package manager from installed
  const choices = ["yarn", "pnpm", "cnpm", "npm"];

  for (const pm of choices) {
    if (isAvailable(pm as PM)) {
      return pm;
    }
  }
}

function getFromInstaller(opts?: Options) {
  const cwd = opts?.cwd || process.cwd();
  // get which pm was used to install node_modules
  const mapping = {
    ".yarn-integrity": "yarn",
    ".package-lock.json": "npm",
    ".modules.yaml": "pnpm",
    ".package_versions": "cnpm",
  };

  for (const [file, pm] of Object.entries(mapping)) {
    if (fs.existsSync(path.join(cwd, "node_modules", file))) {
      return pm;
    }
  }
}
