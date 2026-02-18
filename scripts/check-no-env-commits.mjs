import { execSync } from "node:child_process";
import path from "node:path";

function getStagedFiles() {
  const output = execSync("git diff --cached --name-only --diff-filter=ACMR", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function isBlockedEnvFile(filePath) {
  const normalized = filePath.replaceAll("\\", "/");
  const fileName = path.posix.basename(normalized).toLowerCase();

  if (!fileName.startsWith(".env")) {
    return false;
  }

  return fileName !== ".env.example";
}

try {
  const stagedFiles = getStagedFiles();
  const blockedFiles = stagedFiles.filter(isBlockedEnvFile);

  if (blockedFiles.length > 0) {
    console.error("Commit blocked: .env files must never be committed.");
    console.error("Blocked files:");
    for (const file of blockedFiles) {
      console.error(`- ${file}`);
    }
    console.error("Use .env.example for shared keys and keep real values in local env files only.");
    process.exit(1);
  }

  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown git error";
  console.error(`Could not validate staged files: ${message}`);
  process.exit(1);
}
