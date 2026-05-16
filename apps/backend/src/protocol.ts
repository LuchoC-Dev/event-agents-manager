import { readFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function readProtocol(): Promise<string> {
  const path = resolve(__dirname, "../../../packages/protocol/protocol.md");
  return readFile(path, "utf-8");
}
