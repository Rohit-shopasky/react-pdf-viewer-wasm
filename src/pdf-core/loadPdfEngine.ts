import init, * as PdfCore from './pdf_core.js';
import wasmPath from './pdf_core_bg.wasm?no-inline';

const DEFAULT_PDFIUM_JS_URL = 'https://cdn.jsdelivr.net/npm/pdf-viewer-assets@1.0.0/pdfium.js';
const DEFAULT_PDFIUM_WASM_URL = 'https://cdn.jsdelivr.net/npm/pdf-viewer-assets@1.0.0/pdfium.wasm';

let pdfiumJsUrl = DEFAULT_PDFIUM_JS_URL;
let pdfiumWasmUrl = DEFAULT_PDFIUM_WASM_URL;
let ready: Promise<typeof PdfCore> | null = null;

/**
 * Override where the pdfium engine (pdfium.js / pdfium.wasm) is loaded from.
 * Call this BEFORE rendering any <Document>, if you need to self-host these
 * files instead of using the default CDN (e.g. for corporate networks that
 * block external CDNs, offline/airgapped apps, or strict CSP policies).
 *
 * Example:
 *   setPdfiumSource({
 *     jsUrl: '/vendor/pdfium.js',
 *     wasmUrl: '/vendor/pdfium.wasm',
 *   });
 */
export function setPdfiumSource(options: { jsUrl: string; wasmUrl: string }) {
    if (ready) {
        throw new Error(
            'setPdfiumSource() must be called before the first <Document> is rendered. ' +
            'The pdfium engine has already started loading.'
        );
    }
    pdfiumJsUrl = options.jsUrl;
    pdfiumWasmUrl = options.wasmUrl;
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

        // Build a URL relative to this bundle's location so the wasm file is
        // resolved correctly wherever the package is installed (e.g. node_modules).
        const resolvedWasmUrl = new URL(wasmPath, import.meta.url);
        await init({ module_or_path: resolvedWasmUrl });

        const ok = PdfCore.initialize_pdfium_render(pdfiumModule, PdfCore, false);
        if (!ok) throw new Error('Failed to initialize pdfium-render');

        PdfCore.initialize();
        return PdfCore;
    })();

    return ready;
}