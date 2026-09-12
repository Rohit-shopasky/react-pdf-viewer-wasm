/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const close_document: (a: number) => [number, number];
export const extract_text: (a: number, b: number) => [number, number, number, number];
export const get_page_count: (a: number) => [number, number, number];
export const get_page_dimensions: (a: number, b: number) => [number, number, number, number];
export const get_text_chars: (a: number, b: number) => [number, number, number, number];
export const initialize: () => [number, number];
export const initialize_pdfium_render: (a: any, b: any, c: number) => number;
export const open_document: (a: number, b: number, c: number, d: number) => [number, number, number];
export const read_block_from_callback_wasm: (a: number, b: number, c: number, d: number) => number;
export const render_page: (a: number, b: number, c: number, d: number) => [number, number, number];
export const start: () => void;
export const write_block_from_callback_wasm: (a: number, b: number, c: number) => number;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_exn_store: (a: number) => void;
export const __externref_table_alloc: () => number;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_start: () => void;
