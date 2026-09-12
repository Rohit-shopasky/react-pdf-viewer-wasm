/// <reference types="vite/client" />

// Teach TypeScript about Vite's ?no-inline asset query suffix.
// At runtime Vite resolves this to a URL string pointing to the emitted file.
declare module '*.wasm?no-inline' {
    const src: string;
    export default src;
}
