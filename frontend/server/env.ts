import fs from "fs/promises";
import path from "path";

export async function readEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  try {
    const content = await fs.readFile(envPath, "utf-8");
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

export async function writeEnvFile(env: Record<string, string>) {
  const envPath = path.resolve(process.cwd(), ".env");
  const content = Object.entries(env)
    .map(
      ([key, value]) =>
        `${key}=${typeof value === "string" ? `"${value}"` : value}`,
    )
    .join("\n");
  await fs.writeFile(envPath, content, "utf-8");
}
