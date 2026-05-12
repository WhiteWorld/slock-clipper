# Slock Clipper

Slock Clipper is a local-first Chrome extension for clipping webpages, URLs, and selected text into Slock channels through a dedicated bot/agent identity.

It is designed for workflows like:

1. Save an article from Chrome.
2. Send to a Slock channel such as `#ladder`.
3. Mention an agent such as `@ReaderBot`.
4. Let the agent summarize, tag, and archive the content in a thread.

## Architecture

```text
Chrome Extension -> 127.0.0.1 relay -> slock CLI -> Slock channel
```

This project does not require a public Slock API. It uses the agent-facing `slock` CLI that is already injected into a Slock agent workspace.

Important limitation: messages are sent as the configured Slock agent, not as a human user. For a clean setup, create a dedicated agent such as `@ShareBot`.

## Features

- Popup share: send the current tab title, URL, and optional note.
- Context menu: right-click to send a page or selected text.
- Smart templates: prompts adapt based on content type (GitHub repos, articles, selections, general pages).
- Local relay with secret-based protection.
- Keyboard shortcut: `Ctrl/Cmd + Enter` to send from popup.
- Quick badge feedback after context-menu sends.
- Minimal Chrome permissions.

## Quick Start

### 1. Create a dedicated Slock agent

Create an agent such as `@ShareBot` and make sure it has access to the target channel.

### 2. Install and build

```bash
npm install
npm run build
```

### 3. Configure the relay

Copy the example config and edit `relay/config.json`:

```json
{
  "relaySecret": "replace-with-a-random-local-secret",
  "agentId": "<sharebot-agent-id>",
  "defaultTarget": "#ladder",
  "defaultMention": "@ReaderBot"
}
```

Only these four fields are required. The relay derives `slockCliPath` and `agentTokenFile` automatically from `~/.slock/agents/<agentId>/`.

Optional overrides (add to `relay/config.json` if defaults don't fit):

| Field | Default | Description |
|-------|---------|-------------|
| `host` | `127.0.0.1` | Bind address |
| `port` | `9321` | Listen port |
| `serverUrl` | `https://api.slock.ai` | Slock API server |
| `slockCliPath` | auto from `agentId` | Override CLI path |
| `agentTokenFile` | auto from `agentId` | Override token file path |

### 4. Start relay

```bash
npm run start:relay
```

### 5. Test with curl

```bash
curl -X POST http://127.0.0.1:9321/share \
  -H 'content-type: application/json' \
  -H 'x-slock-clipper-secret: replace-with-a-random-local-secret' \
  -d '{"title":"Demo","url":"https://example.com","target":"#ladder"}'
```

### 6. Load the Chrome extension

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select `extension/dist`.
5. Open extension options and set:
   - Relay URL: `http://127.0.0.1:9321`
   - Relay Secret: same as `relay/config.json`
   - Default Channel: for example `#ladder`

## Share API

The relay accepts `POST /share` with a `x-slock-clipper-secret` header and a JSON body:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `page` (default), `selection`, `note`, or `code` |
| `title` | string | Page title |
| `url` | string | Page URL |
| `selection` | string | Selected text |
| `note` | string | Optional note |
| `target` | string | Channel override (falls back to relay config) |

At least one of `title`, `url`, `selection`, or `note` is required.

## Smart Templates

The relay detects content type from the URL and generates an appropriate prompt:

| Content Type | Detection | Example Prompt |
|-------------|-----------|---------------|
| GitHub repo | `github.com/user/repo` | Analyze project: features, tech stack, architecture |
| GitHub link | Issues / PRs / discussions | Summarize key information |
| Article / Blog | Medium, Zhihu, WeChat, arXiv, etc. | Summarize 3-5 key points, methodology, takeaways |
| Selection | User-selected text | Summarize selected text only (no URL fetch) |
| Note / Code | Explicit type | Organize key points / Analyze code |
| Default | All other URLs | Read and summarize with 3-5 key points |

### Customizing Templates

To customize prompts and labels, copy and edit `relay/templates.json`:

```bash
cp relay/templates.example.json relay/templates.json
```

Each category can override `label` and `prompt`. For GitHub repos, override `promptRepo` to use a different prompt than other GitHub links. Write in any language — the relay reads this file at startup.

If `relay/templates.json` is missing, the relay uses English defaults. The mention (e.g. `@ReaderBot`) and target channel are always controlled by relay config, never by the extension.

## Development

```bash
npm run build
npm run dev:relay
```

The extension build output is `extension/dist`.

## Security

- Keep the relay bound to `127.0.0.1` (enforced by the relay).
- Use a strong local `relaySecret`.
- Use a dedicated low-privilege Slock agent like `@ShareBot`.
- Do not commit `relay/config.json` or agent tokens.
- See [docs/security.md](docs/security.md) for more details.

## License

MIT
