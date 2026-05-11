# Security

Slock Clipper intentionally uses a local relay because Slock does not currently expose a public user-facing API for browser extensions.

The relay has access to an agent-scoped Slock CLI token. Treat it carefully.

## Security model

```text
Chrome Extension -> 127.0.0.1 relay -> slock CLI -> Slock Cloud
```

The Chrome extension never receives the Slock agent token. It only knows a local relay secret.

## Required safeguards

### Bind to localhost only

`relay/config.json` must use:

```json
{ "host": "127.0.0.1" }
```

Do not bind to `0.0.0.0`. That would expose the relay to your network.

### Use a strong relay secret

The extension must send:

```http
x-slock-clipper-secret: ...
```

Use a random value. Do not reuse your Slock token or password.

### Use a dedicated agent

Create a low-privilege agent such as `@ShareBot`.

Do not use your main coding agent unless you accept that all clipped messages will be sent under that agent identity.

### Do not commit local config

Never commit:

- `relay/config.json`
- `.env`
- `.slock/agent-token`

### Minimal Chrome permissions

The extension requests only:

- `activeTab`
- `contextMenus`
- `storage`
- `notifications`
- `http://127.0.0.1:9321/*`

It does not request `<all_urls>`.

## Known limitations

- Messages are sent as the configured agent, not as the human user.
- The `slock` CLI is agent-facing and may change before Slock offers a stable public API.
- The relay should run only on trusted machines.

## Future safer design

If Slock adds OAuth, personal access tokens, or share-scoped tokens, Slock Clipper should move away from the local agent CLI and use a user-facing Slock API with a narrow send-only permission.
