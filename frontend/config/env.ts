import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

const ENV_PATH = resolve(process.cwd(), ".env");

export async function loadEnv(): Promise<Record<string, string>> {
  try {
    const content = await readFile(ENV_PATH, "utf-8");
    return content.split("\n").reduce(
      (acc, line) => {
        const [key, value] = line.split("=").map((s) => s.trim());
        if (key && value) {
          acc[key] = value.replace(/["']/g, "");
        }
        return acc;
      },
      {} as Record<string, string>,
    );
  } catch {
    return {};
  }
}

export async function saveEnv(env: Record<string, string>): Promise<void> {
  const content = Object.entries(env)
    .map(([key, value]) => `${key}="${value}"`)
    .join("\n");
  await writeFile(ENV_PATH, content, "utf-8");
}
