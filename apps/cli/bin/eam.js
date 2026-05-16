#!/usr/bin/env node
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const entry = resolve(__dirname, "../src/index.ts");

const tsxCandidates = [
  resolve(__dirname, "../../../node_modules/tsx/dist/cli.mjs"),
  resolve(__dirname, "../node_modules/tsx/dist/cli.mjs"),
];

const tsxMain = tsxCandidates.find((c) => existsSync(c));

const result = tsxMain
  ? spawnSync(process.execPath, [tsxMain, entry, ...process.argv.slice(2)], { stdio: "inherit" })
  : spawnSync("tsx", [entry, ...process.argv.slice(2)], { stdio: "inherit", shell: true });

process.exit(result.status ?? 0);
