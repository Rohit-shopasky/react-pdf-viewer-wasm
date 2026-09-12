// src/components/Document.tsx
import {
    useEffect, useState, useRef, createContext, useContext,
    forwardRef, useImperativeHandle,
} from 'react';
import type { ReactNode } from 'react';
import { loadPdfEngine } from '../pdf-core/loadPdfEngine';

interface DocContextValue {
    docHandle: number;
    scale: number;
    rotate: number;
}
const DocContext = createContext<DocContextValue | null>(null);
export function useDocContext() {
    const ctx = useContext(DocContext);
    if (!ctx) throw new Error('Page must be used inside a Document');
    return ctx;
}

type FileInput = string | File | Uint8Array;

interface DocumentProps {
    file: FileInput;
    className?: string | string[];
    scale?: number;
    rotate?: number;
    error?: ReactNode | (() => ReactNode);
    loading?: ReactNode | (() => ReactNode);
    noData?: ReactNode | (() => ReactNode);
    children?: ReactNode;
    onLoadSuccess?: (info: { numPages: number }) => void;
    onLoadError?: (error: Error) => void;
    onLoadProgress?: (info: { loaded: number; total: number }) => void;
    onSourceSuccess?: () => void;
    onSourceError?: (error: Error) => void;
    onPassword?: (callback: (password: string) => void) => void;
}

async function readFileBytes(
    file: FileInput,
    onProgress?: (loaded: number, total: number) => void,
): Promise<Uint8Array> {
    if (file instanceof Uint8Array) return file;

    if (file instanceof File) {
        return new Uint8Array(await file.arrayBuffer());
    }

    // string URL — fetch with streaming progress if possible
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status}`);

    const total = Number(response.headers.get('content-length')) || 0;
    if (!response.body || !total) {
        return new Uint8Array(await response.arrayBuffer());
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        onProgress?.(loaded, total);
    }
    const bytes = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
    }
    return bytes;
}

export const Document = forwardRef<HTMLDivElement, DocumentProps>(function Document(
    {
        file,
        className,
        scale = 1,
        rotate = 0,
        error = 'Failed to load PDF file.',
        loading = 'Loading PDF…',
        noData = 'No PDF file specified.',
        children,
        onLoadSuccess,
        onLoadError,
        onLoadProgress,
        onSourceSuccess,
        onSourceError,
        onPassword,
    },
    inputRef,
) {
    const [docHandle, setDocHandle] = useState<number | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('loading');
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(inputRef, () => containerRef.current!);

    useEffect(() => {
        if (!file) {
            setStatus('idle');
            return;
        }

        let cancelled = false;
        setStatus('loading');

        (async () => {
            try {
                const pdfCore = await loadPdfEngine();
                const bytes = await readFileBytes(file, (loaded, total) => {
                    onLoadProgress?.({ loaded, total });
                });
                if (cancelled) return;
                onSourceSuccess?.();

                let handle: number;
                try {
                    handle = pdfCore.open_document(bytes, undefined);
                } catch (e) {
                    const msg = String(e);
                    if (msg.includes('Password') || msg.includes('password')) {
                        if (!onPassword) throw new Error('Password-protected PDF, but no onPassword handler provided.');
                        handle = await new Promise<number>((resolve, reject) => {
                            onPassword((password: string) => {
                                try {
                                    resolve(pdfCore.open_document(bytes, password));
                                } catch (err) {
                                    reject(err);
                                }
                            });
                        });
                    } else {
                        throw e;
                    }
                }

                if (cancelled) return;
                setDocHandle(handle);
                setStatus('idle');
                onLoadSuccess?.({ numPages: pdfCore.get_page_count(handle) });
            } catch (e) {
                if (cancelled) return;
                setStatus('error');
                const err = e instanceof Error ? e : new Error(String(e));
                onLoadError?.(err);
                onSourceError?.(err);
            }
        })();

        return () => { cancelled = true; };
    }, [file]);

    const classNames = Array.isArray(className) ? className.join(' ') : className;
    const wrapperClass = ['react-pdf-viewer-wasm__Document', classNames].filter(Boolean).join(' ');

    if (!file) {
        return <div className={wrapperClass} ref={containerRef}>{typeof noData === 'function' ? noData() : noData}</div>;
    }
    if (status === 'loading') {
        return <div className={wrapperClass} ref={containerRef}>{typeof loading === 'function' ? loading() : loading}</div>;
    }
    if (status === 'error' || docHandle === null) {
        return <div className={wrapperClass} ref={containerRef}>{typeof error === 'function' ? error() : error}</div>;
    }

    return (
        <div className={wrapperClass} ref={containerRef}>
            <DocContext.Provider value={{ docHandle, scale, rotate }}>
                {children}
            </DocContext.Provider>
        </div>
    );
});