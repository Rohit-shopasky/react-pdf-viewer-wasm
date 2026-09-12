# react-pdf-viewer-wasm

Show PDF files in your React app — powered by **Rust + WebAssembly** instead of the usual `pdf.js`.

This library uses **pdfium**, the same PDF engine built into Google Chrome, to draw PDF pages onto the screen. It works a lot like the popular `react-pdf` package, but under the hood it's a completely different engine.

> **Status:** early release (v0.1.x). The basics — viewing pages, zooming, rotating, selecting text, password-protected files — all work. Some more advanced features (clickable links, bookmarks, forms) aren't built yet. See [What's not supported yet](#whats-not-supported-yet).

---

## What you get

- 📄 Render any PDF page onto the screen
- 🔍 Zoom in and out
- 🔄 Rotate pages
- ✍️ Select and copy text from the PDF (just like a real document)
- 🔒 Support for password-protected PDFs
- ⚡ No setup needed — the PDF engine loads automatically from the internet the first time it's used

---

## Installing it

```bash
npm install react-pdf-viewer-wasm
```

That's it. You don't need to download or configure anything else — this library automatically fetches the small "PDF engine" file it needs from the internet the first time your app shows a PDF.

*(If your company's network blocks outside websites, see [Using it without the internet](#using-it-without-the-internet) below.)*

---

## Vite setup (required)

Add the following to your app's `vite.config.ts`. This is needed because the library's WASM file must be served to the browser, and the browser requires special security headers to run it:

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createReadStream, existsSync } from 'fs'
import { resolve } from 'path'

function servePdfCoreWasm() {
  return {
    name: 'serve-pdf-core-wasm',
    configureServer(server: any) {
      server.middlewares.use('/pdf_core_bg.wasm', (_req: any, res: any, next: any) => {
        const wasmPath = resolve(
          import.meta.dirname,
          'node_modules/react-pdf-viewer-wasm/dist/pdf_core_bg.wasm'
        )
        if (!existsSync(wasmPath)) return next()
        res.setHeader('Content-Type', 'application/wasm')
        createReadStream(wasmPath).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), servePdfCoreWasm()],
  server: {
    headers: {
      // Required for pdfium.wasm (uses SharedArrayBuffer)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
```

## Showing your first PDF

```tsx
import { Document, Page } from 'react-pdf-viewer-wasm';

function App() {
  return (
    <Document file="/my-file.pdf">
      <Page pageIndex={0} />
    </Document>
  );
}
```

That's the whole thing. `pageIndex={0}` means "show the first page" (pages are counted starting from 0, not 1).

Put your PDF file in your app's `public` folder so `"/my-file.pdf"` can find it. You can also use a full web address instead, like `"https://example.com/my-file.pdf"`.

---

## Showing every page in the PDF

```tsx
import { useState } from 'react';
import { Document, Page } from 'react-pdf-viewer-wasm';

function App() {
  const [numPages, setNumPages] = useState(0);

  return (
    <Document
      file="/my-file.pdf"
      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
    >
      {Array.from({ length: numPages }, (_, i) => (
        <Page key={i} pageIndex={i} />
      ))}
    </Document>
  );
}
```

`onLoadSuccess` tells you how many pages the PDF has, once it's finished loading. We use that number to draw one `<Page>` for every page in the file.

---

## Zooming in and out

```tsx
<Document file="/my-file.pdf" scale={1.5}>
  <Page pageIndex={0} />
</Document>
```

`scale={1}` is the normal size. `scale={1.5}` makes it 50% bigger. `scale={0.5}` makes it half size.

You can also zoom just one page differently from the rest:

```tsx
<Page pageIndex={0} scale={2} />
```

---

## Rotating pages

```tsx
<Document file="/my-file.pdf" rotate={90}>
  <Page pageIndex={0} />
</Document>
```

Use `90`, `180`, or `270` degrees. Just like `scale`, you can also rotate a single page differently:

```tsx
<Page pageIndex={0} rotate={180} />
```

---

## Turning text selection on or off

By default, users can click and drag to select text on the page, then copy it — just like a real document.

If you don't want this (for example, showing small page thumbnails), turn it off:

```tsx
<Page pageIndex={0} textSelectable={false} />
```

---

## Opening password-protected PDFs

```tsx
<Document
  file="/protected-file.pdf"
  onPassword={(submitPassword) => {
    const password = window.prompt('This PDF needs a password:');
    submitPassword(password ?? '');
  }}
>
  <Page pageIndex={0} />
</Document>
```

When the library discovers the PDF needs a password, it calls your `onPassword` function. You ask the user for the password (however you like — a prompt box, a form, anything), and then call `submitPassword(theirAnswer)` to try opening it.

---

## Showing loading and error messages

```tsx
<Document
  file="/my-file.pdf"
  loading="Loading your document..."
  error="Sorry, we couldn't open this PDF."
>
  <Page pageIndex={0} />
</Document>
```

You can use plain text, or your own custom design:

```tsx
<Document
  file="/my-file.pdf"
  loading={<MySpinner />}
  error={<MyErrorMessage />}
>
  <Page pageIndex={0} />
</Document>
```

---

## All the settings you can use

### `<Document>` settings

| Setting | What it does | Default |
|---|---|---|
| `file` | The PDF to show — a web address, an uploaded file, or raw file data. | *(required)* |
| `scale` | How zoomed in the pages are. | `1` |
| `rotate` | How many degrees to rotate the pages (`0`, `90`, `180`, `270`). | `0` |
| `loading` | What to show while the PDF is loading. | `"Loading PDF…"` |
| `error` | What to show if something goes wrong. | `"Failed to load PDF file."` |
| `noData` | What to show if no file was given. | `"No PDF file specified."` |
| `onLoadSuccess` | Runs when the PDF has finished loading. Tells you `numPages`. | — |
| `onLoadError` | Runs if the PDF fails to load. | — |
| `onLoadProgress` | Runs while the file is downloading, so you can show a progress bar. | — |
| `onPassword` | Runs when a password-protected PDF needs unlocking. | — |
| `className` | Add your own CSS class name(s) to the wrapper. | — |

### `<Page>` settings

| Setting | What it does | Default |
|---|---|---|
| `pageIndex` | Which page to show (starting at `0` for the first page). | *(required)* |
| `scale` | Zoom for this page only (overrides the Document's setting). | inherited |
| `rotate` | Rotation for this page only (overrides the Document's setting). | inherited |
| `textSelectable` | Whether people can select and copy text on this page. | `true` |

---

## Using it without the internet

By default, this library downloads a small "PDF engine" file from a free content-delivery service the first time it's needed. For most people, this just works with zero setup.

If you're building something for a company network that blocks outside websites, or an app that needs to work completely offline, you can host these files yourself instead:

**1. Download the two engine files:**

- [`pdfium.js`](https://cdn.jsdelivr.net/npm/pdf-viewer-assets@1.0.0/pdfium.js)
- [`pdfium.wasm`](https://cdn.jsdelivr.net/npm/pdf-viewer-assets@1.0.0/pdfium.wasm)

**2. Put both files in your app's `public` folder.**

**3. Tell the library to use your own copies, before showing any PDF:**

```tsx
import { setPdfiumSource } from 'react-pdf-viewer-wasm';

setPdfiumSource({
  jsUrl: '/pdfium.js',
  wasmUrl: '/pdfium.wasm',
});
```

Do this once, near the very start of your app (for example, in your main entry file), before any `<Document>` is shown.

---

## What's not supported yet

This is a young library, and being upfront about its current limits:

- **No clickable links or bookmarks inside PDFs yet.**
- **No PDF forms yet** (fillable fields, checkboxes, etc.).
- **Large PDFs may feel a little slow** — page rendering currently happens on the main part of your browser's engine, so very big or complex PDFs might cause a brief pause while rendering. Improving this is planned.

If any of these matter for what you're building, keep that in mind before relying on this library for a big project just yet.

---

## Requirements

- React 18 or newer
- Any modern web browser (Chrome, Firefox, Safari, Edge — all support what this library needs)

---

## License

MIT

---

## Credits

- [pdfium](https://pdfium.googlesource.com/pdfium/) — the actual PDF engine, made by Google.
- [pdfium-render](https://github.com/ajrcarey/pdfium-render) — the Rust tool this library is built on top of.
- [pdfium-lib](https://github.com/paulocoutinhox/pdfium-lib) — provides the ready-to-use engine files.