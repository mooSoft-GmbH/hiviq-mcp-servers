# @hiviq/mcp-confluence

MCP server for Atlassian Confluence Cloud. Exposes 19 tools covering spaces, pages, search, comments, labels, attachments, and blog posts.

## Requirements

- [Bun](https://bun.sh) v1.0+
- Confluence Cloud instance
- API token from [id.atlassian.net](https://id.atlassian.net/manage-profile/security/api-tokens)

## Setup

```bash
cp .env.example .env
# fill in CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, CONFLUENCE_API_TOKEN
bun install
```

## Running

```bash
bun start
```

## Tools

| Domain | Tool | Description |
|---|---|---|
| Spaces | `list_spaces` | List accessible spaces |
| | `get_space` | Get space details |
| Pages | `list_pages` | List pages (filterable by space, title, status) |
| | `get_page` | Get full page content as Markdown |
| | `get_child_pages` | List direct child pages |
| | `get_ancestors` | Get ancestor breadcrumb path |
| | `create_page` | Create a new page |
| | `update_page` | Update an existing page |
| | `delete_page` | Delete a page |
| Search | `search` | CQL-based search |
| | `search_text` | Free-text search with optional filters |
| Comments | `list_comments` | List footer comments on a page |
| | `add_comment` | Add a footer comment |
| Labels | `list_labels` | List labels on a page |
| | `add_label` | Add a label |
| | `remove_label` | Remove a label |
| Attachments | `list_attachments` | List attachments (with size & download link) |
| Blog Posts | `list_blog_posts` | List blog posts |
| | `get_blog_post` | Get full blog post as Markdown |

## Testing

```bash
bun test              # all tests
bun test:unit         # unit tests only (formatters, validators, client)
bun test:integration  # tool handlers with mocked HTTP
bun test:e2e          # full MCP protocol over InMemoryTransport
bun test:coverage     # with coverage report
```

### Testing pyramid

```
         ┌─────────────┐
         │   E2E  10%  │  InMemoryTransport, all HTTP mocked
         ├─────────────┤
         │ Integration │  Tool handlers, fixture-based HTTP mocks
         │    20%      │  validates API calls + response shaping
         ├─────────────┤
         │    Unit     │  Pure functions: formatters, html-to-md,
         │    70%      │  validators, HTTP client contract
         └─────────────┘
```

No external services required at any layer — all HTTP is intercepted with pre-recorded fixtures in `tests/fixtures/`.

## Claude Desktop config

```json
{
  "mcpServers": {
    "confluence": {
      "command": "bun",
      "args": ["/path/to/servers/confluence/src/index.ts"],
      "env": {
        "CONFLUENCE_BASE_URL": "https://moosoft.atlassian.net",
        "CONFLUENCE_EMAIL": "your@email.com",
        "CONFLUENCE_API_TOKEN": "your-token"
      }
    }
  }
}
```
