import type { JiraEpic, JiraVotes } from "../../types.js";

export function formatEpic(epic: JiraEpic): string {
  return [
    `# ${epic.name}`,
    "",
    `**Key:** ${epic.key}  |  **ID:** ${epic.id}  |  **Done:** ${epic.done ? "Yes" : "No"}`,
    `**Summary:** ${epic.summary}`,
  ].join("\n");
}

export function formatVotes(votes: JiraVotes): string {
  const lines = [
    `**Votes:** ${votes.votes}  |  **You voted:** ${votes.hasVoted ? "Yes" : "No"}`,
  ];
  if (votes.voters.length > 0) {
    lines.push("", "Voters:");
    for (const u of votes.voters) {
      lines.push(`- ${u.displayName} (\`${u.accountId}\`)`);
    }
  }
  return lines.join("\n");
}
