import { z } from "zod";

const schema = z.object({
  JIRA_BASE_URL: z.string().url("JIRA_BASE_URL must be a valid URL"),
  JIRA_EMAIL: z.string().email("JIRA_EMAIL must be a valid email"),
  JIRA_API_TOKEN: z.string().min(1, "JIRA_API_TOKEN is required"),
});

function loadConfig() {
  const result = schema.safeParse({
    JIRA_BASE_URL: process.env["JIRA_BASE_URL"],
    JIRA_EMAIL: process.env["JIRA_EMAIL"],
    JIRA_API_TOKEN: process.env["JIRA_API_TOKEN"],
  });

  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid configuration:\n${errors}\n\nSee .env.example for required variables.`,
    );
  }

  return result.data;
}

export type Config = z.infer<typeof schema>;
export const config = loadConfig();
