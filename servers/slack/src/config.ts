import { z } from "zod";

const schema = z.object({
  SLACK_BOT_TOKEN: z.string().startsWith("xoxb-", "SLACK_BOT_TOKEN must be an xoxb- bot token"),
  SLACK_USER_TOKEN: z
    .string()
    .startsWith("xoxp-", "SLACK_USER_TOKEN must be an xoxp- user token")
    .optional(),
});

function loadConfig() {
  const result = schema.safeParse({
    SLACK_BOT_TOKEN: process.env["SLACK_BOT_TOKEN"],
    SLACK_USER_TOKEN: process.env["SLACK_USER_TOKEN"],
  });

  if (!result.success) {
    const errors = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid configuration:\n${errors}\n\nSee .env.example for required variables.`);
  }

  return result.data;
}

export type Config = z.infer<typeof schema>;
export const config = loadConfig();
