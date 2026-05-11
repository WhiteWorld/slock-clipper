# Slock Clipper

Slock Clipper is a local-first Chrome extension for clipping webpages, URLs, and selected text into Slock channels through a dedicated bot/agent identity.

It is designed for workflows like:

1. Save an article from Chrome.
2. Send it to a Slock channel such as `#收藏`.
3. Mention an agent such as `@Reader`.
4. Let the agent summarize, tag, and archive the content in a thread.

## Architecture

```text
Chrome Extension -> 127.0.0.1 relay -> slock CLI -> Slock channel
```

This project does not require a public Slock API. It uses the agent-facing `slock` CLI that is already injected into a Slock agent workspace.

Important limitation: messages are sent as the configured Slock agent, not as a human user. For a clean setup, create a dedicated agent such as `@ShareBot`.

## Features

- Popup share: send the current tab title, URL, and optional note.
- Context menu share: send the current page.
- Selection share: send highlighted text with the source URL.
- Local relay with `RELAY_SECRET` protection.
- Minimal Chrome permissions.
- No full-page extraction by default.

## Quick Start

### 1. Create a dedicated Slock agent

Create an agent such as `@ShareBot` and make sure it has access to the target channel.

Find its workspace:

```bash
ls ~/.slock/agents
```

The CLI path should look like:

```text
~/.slock/agents/<sharebot-agent-id>/.slock/slock
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the relay

```bash
cp relay/config.example.json relay/config.json
```

Edit `relay/config.json`:

```json
{
  "host": "127.0.0.1",
  "port": 9321,
  "relaySecret": "replace-with-a-random-local-secret",
  "slockCliPath": "/Users/you/.slock/agents/<sharebot-agent-id>/.slock/slock",
  "agentId": "<sharebot-agent-id>",
  "agentTokenFile": "/Users/you/.slock/agents/<sharebot-agent-id>/.slock/agent-token",
  "serverUrl": "https://api.slock.ai",
  "defaultTarget": "#收藏",
  "defaultMention": "@Reader"
}
```

### 4. Build

```bash
npm run build
```

### 5. Start relay

```bash
npm run start:relay
```

### 6. Test with curl

```bash
curl -X POST http://127.0.0.1:9321/share \
  -H 'content-type: application/json' \
  -H 'x-slock-clipper-secret: replace-with-a-random-local-secret' \
  -d '{"title":"Demo","url":"https://example.com","target":"#收藏"}'
```

### 7. Load the Chrome extension

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select `extension/dist`.
5. Open extension options and set:
   - Relay URL: `http://127.0.0.1:9321`
   - Relay Secret: same value as `relay/config.json`
   - Default Target: for example `#收藏`
   - Default Mention: for example `@Reader`

## Development

```bash
npm run build
npm run dev:relay
```

The extension build output is `extension/dist`.

## Security

Read [docs/security.md](docs/security.md) before running this on your machine.

Key rules:

- Keep the relay bound to `127.0.0.1`.
- Use a strong local `relaySecret`.
- Use a dedicated low-privilege Slock agent like `@ShareBot`.
- Do not commit `relay/config.json` or agent tokens.

## License

MIT
