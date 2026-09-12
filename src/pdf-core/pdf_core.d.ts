/* tslint:disable */
/* eslint-disable */

/**
 * Free a document from memory.
 *
 * Drops both the raw bytes and the cached metadata.
 * After this call, using the handle in any other function returns an error.
 */
export function close_document(doc_handle: number): void;

/**
 * Extract all text from a specific page.
 *
 * Returns an empty string if the page contains no selectable text
 * (e.g., scanned images without OCR).
 *
 * KNOWN LIMITATION: re-parses the PDF from bytes on every call.
 * Same root cause as `render_page`; see that function's doc comment for
 * the planned fix (`ouroboros` / `self_cell` self-referential struct).
 */
export function extract_text(doc_handle: number, page_index: number): string;

/**
 * Returns the total number of pages in the document.
 *
 * O(1) — served from the metadata cache built at `open_document` time.
 * Does **not** re-parse the PDF.
 */
export function get_page_count(doc_handle: number): number;

/**
 * Returns `[width_pts, height_pts]` for the given page.
 *
 * Dimensions are in **PDF points** (72 points = 1 inch).
 * Multiply by your `scale` factor to get pixel dimensions.
 *
 * O(1) — served from the metadata cache built at `open_document` time.
 * Does **not** re-parse the PDF.
 */
export function get_page_dimensions(doc_handle: number, page_index: number): Float32Array;

/**
 * Returns per-character position data for a page, as a JSON string.
 * Coordinates are in PDF points, with origin at TOP-LEFT (converted from
 * pdfium's native bottom-left origin) so they map directly onto a
 * top-left-origin HTML/CSS layer once multiplied by your zoom scale.
 */
export function get_text_chars(doc_handle: number, page_index: number): string;

/**
 * Initialize the pdfium binding.
 *
 * **Must be called once before any other function.**
 * Calling it multiple times is safe — subsequent calls are no-ops.
 *
 * On native (cargo test): links against the system pdfium shared library.
 * On WASM:               connects to the pdfium.wasm module loaded by the JS host.
 */
export function initialize(): void;

/**
 * Establishes a binding between an external Pdfium WASM module and `pdfium-render`'s WASM module.
 * This function should be called from Javascript once the external Pdfium WASM module has been loaded
 * into the browser. It is essential that this function is called _before_ initializing
 * `pdfium-render` from within Rust code. For an example, see:
 * <https://github.com/ajrcarey/pdfium-render/blob/master/examples/index.html>
 */
export function initialize_pdfium_render(pdfium_wasm_module: any, local_wasm_module: any, debug: boolean): boolean;

/**
 * Load a PDF from raw bytes.
 *
 * Returns a **document handle** (u32) that identifies this document in all
 * subsequent calls.  Call `close_document()` when done to free memory.
 *
 * This is the **only** time the full PDF is parsed to extract metadata.
 * Page count and page dimensions are cached here so subsequent calls to
 * `get_page_count` and `get_page_dimensions` are O(1) and never re-parse.
 *
 * Errors if the bytes are not a valid PDF.
 */
export function open_document(bytes: Uint8Array, password?: string | null): number;

/**
 * A callback function that can be invoked by Pdfium's `FPDF_LoadCustomDocument()` function,
 * wrapping around `crate::utils::files::read_block_from_callback()` to shuffle data buffers
 * from our WASM memory heap to Pdfium's WASM memory heap as they are loaded.
 */
export function read_block_from_callback_wasm(param: number, position: number, pBuf: number, size: number): number;

/**
 * Render a single page to raw **RGBA pixel data**.
 *
 * - `scale = 1.0` → 72 DPI (native PDF point resolution)
 * - `scale = 1.5` → 108 DPI
 * - `scale = 2.0` → 144 DPI (retina-quality)
 *
 * Returns a flat `Uint8Array` of `[R, G, B, A, R, G, B, A, …]` bytes.
 * The output pixel dimensions are `round(width_pts * scale) × round(height_pts * scale)`.
 *
 * Call `get_page_dimensions()` beforehand to know the canvas size (O(1), no re-parse).
 *
 * KNOWN LIMITATION: re-parses the PDF from bytes on every call.
 * For a user scrolling through a 200-page document this means 200 re-parses.
 * Future fix: use `ouroboros` or `self_cell` to store a parsed `PdfDocument`
 * alongside the bytes it borrows from, eliminating the re-parse entirely.
 */
export function render_page(doc_handle: number, page_index: number, scale: number, rotation_degrees: number): Uint8Array;

export function start(): void;

/**
 * A callback function that can be invoked by Pdfium's `FPDF_SaveAsCopy()` and `FPDF_SaveWithVersion()`
 * functions, wrapping around `crate::utils::files::write_block_from_callback()` to shuffle data buffers
 * from Pdfium's WASM memory heap to our WASM memory heap as they are written.
 */
export function write_block_from_callback_wasm(param: number, buf: number, size: number): number;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly close_document: (a: number) => [number, number];
    readonly extract_text: (a: number, b: number) => [number, number, number, number];
    readonly get_page_count: (a: number) => [number, number, number];
    readonly get_page_dimensions: (a: number, b: number) => [number, number, number, number];
    readonly get_text_chars: (a: number, b: number) => [number, number, number, number];
    readonly initialize: () => [number, number];
    readonly initialize_pdfium_render: (a: any, b: any, c: number) => number;
    readonly open_document: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly read_block_from_callback_wasm: (a: number, b: number, c: number, d: number) => number;
    readonly render_page: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly start: () => void;
    readonly write_block_from_callback_wasm: (a: number, b: number, c: number) => number;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
