import "server-only";

type RequiredEnvVar = "DATABASE_URL" | "NEXTAUTH_SECRET" | "NEXTAUTH_URL";

function getRequiredEnvVar(name: RequiredEnvVar): string {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getRequiredUrl(name: "NEXTAUTH_URL"): string {
  const value = getRequiredEnvVar(name);

  try {
    // Validate at runtime so misconfiguration fails early.
    new URL(value);
  } catch {
    throw new Error(`Invalid URL in environment variable: ${name}`);
  }

  return value;
}

export const env = {
  DATABASE_URL: getRequiredEnvVar("DATABASE_URL"),
  NEXTAUTH_SECRET: getRequiredEnvVar("NEXTAUTH_SECRET"),
  NEXTAUTH_URL: getRequiredUrl("NEXTAUTH_URL"),
} as const;
