import { z } from "zod";

const schema = z.object({
  CONFLUENCE_BASE_URL: z.string().url("CONFLUENCE_BASE_URL must be a valid URL"),
  CONFLUENCE_EMAIL: z.string().email("CONFLUENCE_EMAIL must be a valid email"),
  CONFLUENCE_API_TOKEN: z.string().min(1, "CONFLUENCE_API_TOKEN is required"),
});

function loadConfig() {
  const result = schema.safeParse({
    CONFLUENCE_BASE_URL: process.env["CONFLUENCE_BASE_URL"],
    CONFLUENCE_EMAIL: process.env["CONFLUENCE_EMAIL"],
    CONFLUENCE_API_TOKEN: process.env["CONFLUENCE_API_TOKEN"],
  });

  if (!result.success) {
    const errors = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid configuration:\n${errors}\n\nSee .env.example for required variables.`);
  }

  return result.data;
}

export type Config = z.infer<typeof schema>;
export const config = loadConfig();
