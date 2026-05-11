# Setup

## Prerequisites

- Node.js 20 or newer.
- Chrome or a Chromium-based browser.
- Slock daemon already installed and running.
- A dedicated Slock agent for clipping, for example `@ShareBot`.

## Find the agent CLI

Each Slock agent has a workspace:

```text
~/.slock/agents/<agent-id>/
```

The CLI wrapper is:

```text
~/.slock/agents/<agent-id>/.slock/slock
```

The token file is:

```text
~/.slock/agents/<agent-id>/.slock/agent-token
```

## Verify the CLI manually

Replace the paths and IDs:

```bash
SLOCK_AGENT_ID=<agent-id> \
SLOCK_AGENT_TOKEN_FILE=$HOME/.slock/agents/<agent-id>/.slock/agent-token \
SLOCK_SERVER_URL=https://api.slock.ai \
$HOME/.slock/agents/<agent-id>/.slock/slock auth whoami
```

Send a test message:

```bash
SLOCK_AGENT_ID=<agent-id> \
SLOCK_AGENT_TOKEN_FILE=$HOME/.slock/agents/<agent-id>/.slock/agent-token \
SLOCK_SERVER_URL=https://api.slock.ai \
$HOME/.slock/agents/<agent-id>/.slock/slock message send --target "#收藏" <<'EOF'
Test from Slock Clipper setup.
EOF
```

## Configure relay

Copy:

```bash
cp relay/config.example.json relay/config.json
```

Edit the fields:

- `relaySecret`: random local secret shared by extension and relay.
- `slockCliPath`: full path to `.slock/slock`.
- `agentId`: the same agent ID.
- `agentTokenFile`: full path to `.slock/agent-token`.
- `defaultTarget`: target channel or thread.
- `defaultMention`: optional summarizer agent.

## Run

```bash
npm install
npm run build
npm run start:relay
```

Then load `extension/dist` in Chrome.
