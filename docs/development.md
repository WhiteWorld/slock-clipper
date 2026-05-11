# Development

## Build

```bash
npm run build
```

This builds:

- `shared/dist`
- `relay/dist`
- `extension/dist`

## Relay development

```bash
npm run dev:relay
```

By default, the relay reads `relay/config.json`. Override with:

```bash
SLOCK_CLIPPER_CONFIG=/path/to/config.json npm run dev:relay
```

## Extension development

Run:

```bash
npm run build:extension
```

Then load `extension/dist` through `chrome://extensions`.

After editing extension files, rebuild and click "Reload" in Chrome.

## Release checklist

- `npm run build` passes.
- `curl /share` test sends a Slock message.
- Chrome popup sends the current tab.
- Context menu sends selected text.
- README and security docs are current.
