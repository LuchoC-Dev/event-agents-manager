import chalk from "chalk";
import Table from "cli-table3";

export function table(headers: string[], rows: string[][]): void {
  const t = new Table({
    head: headers.map((h) => chalk.cyan(h)),
    style: { border: ["gray"], head: [] },
  });
  rows.forEach((r) => t.push(r));
  console.log(t.toString());
}

export function ok(msg: string) {
  console.log(chalk.green("✓") + " " + msg);
}

export function fail(msg: string) {
  console.error(chalk.red("✗") + " " + msg);
  process.exit(1);
}

export function info(msg: string) {
  console.log(chalk.gray(msg));
}

export function label(key: string, value: string) {
  console.log(chalk.gray(key + ":") + " " + chalk.white(value));
}

export function handleError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  fail(msg);
}
