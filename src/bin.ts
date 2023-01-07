#!/usr/bin/env node

import { getPackageManager } from "./index.js";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));
const pm = getPackageManager({
  prefer: argv.prefer?.split(","),
  workspace: argv.workspace,
  cwd: argv.cwd,
  silent: argv.silent,
});

console.log(pm.name, pm.version);
