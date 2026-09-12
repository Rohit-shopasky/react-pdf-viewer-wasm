import init, * as PdfCore from './pdf_core.js';

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/pdf-viewer-assets@1.1.0';
const DEFAULT_PDFIUM_JS_URL   = `${CDN_BASE}/pdfium.js`;
const DEFAULT_PDFIUM_WASM_URL = `${CDN_BASE}/pdfium.wasm`;
const DEFAULT_CORE_WASM_URL   = `${CDN_BASE}/pdf_core_bg.wasm`;

let pdfiumJsUrl   = DEFAULT_PDFIUM_JS_URL;
let pdfiumWasmUrl = DEFAULT_PDFIUM_WASM_URL;
let coreWasmUrl   = DEFAULT_CORE_WASM_URL;
let ready: Promise<typeof PdfCore> | null = null;

/**
 * Override where the pdfium engine files are loaded from.
 * Call this ONCE before rendering any <Document>, e.g. in your app's entry file.
 *
 * Use this if you need to self-host the binaries instead of loading them from
 * the default CDN (e.g. offline apps, corporate networks, strict CSP policies).
 *
 * Download all three files from:
 *   https://cdn.jsdelivr.net/npm/pdf-viewer-assets@1.1.0/
 *
 * Put them in your app's `public/` folder, then call:
 *
 *   setPdfiumSource({
 *     jsUrl:       '/pdfium.js',
 *     wasmUrl:     '/pdfium.wasm',
 *     coreWasmUrl: '/pdf_core_bg.wasm',
 *   });
 */
export function setPdfiumSource(options: {
    jsUrl: string;
    wasmUrl: string;
    coreWasmUrl: string;
}) {
    if (ready) {
        throw new Error(
            'setPdfiumSource() must be called before the first <Document> is rendered. ' +
            'The pdfium engine has already started loading.'
        );
    }
    pdfiumJsUrl   = options.jsUrl;
    pdfiumWasmUrl = options.wasmUrl;
    coreWasmUrl   = options.coreWasmUrl;
}

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

export function loadPdfEngine(): Promise<typeof PdfCore> {
    if (ready) return ready;

    ready = (async () => {
        await loadScript(pdfiumJsUrl);

        const pdfiumModule = await (window as any).PDFiumModule({
            locateFile: () => pdfiumWasmUrl,
        });

        // Load pdf_core_bg.wasm from CDN (or self-hosted URL if setPdfiumSource was called).
        // Using a URL string works in all bundlers — no Vite-specific config needed.
        await init({ module_or_path: coreWasmUrl });

        const ok = PdfCore.initialize_pdfium_render(pdfiumModule, PdfCore, false);
        if (!ok) throw new Error('Failed to initialize pdfium-render');

        PdfCore.initialize();
        return PdfCore;
    })();

    return ready;
}