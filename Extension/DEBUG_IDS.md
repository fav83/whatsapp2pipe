# Debug IDs and Source Maps

This project uses Sentry Debug IDs to reliably de‑minify stack traces for the Chrome extension.

Key points

- Debug IDs are injected at build time by the Sentry Vite plugin.
- Upload is a separate step using `sentry-cli` (no auto‑upload during build).
- Chrome must reload the extension so it runs JS that already contains Debug IDs.

Workflow

1. Build

```bash
cd Extension
npm run build
```

2. Upload artifacts (JS + .map)

```bash
npm run upload-sourcemaps
```

3. Reload extension

- Open `chrome://extensions`
- Click `Reload` on the extension
- Refresh the WhatsApp tab and reproduce the error

If Sentry shows “Missing source file with a matching Debug ID”

- Rebuild, re‑upload, reload the extension, then reproduce.
- Ensure you didn’t rebuild after uploading without re‑uploading.
- In Sentry Issue details, the Debug ID in the stack frame should match one of the uploaded artifacts under Settings → Source Maps.

Notes

- Release is set in code (`chrome.runtime.getManifest().version`); release association is optional when using Debug IDs.
- Source maps are not shipped in the extension; they are produced into `Extension/sourcemaps/` and uploaded separately.
