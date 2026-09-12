import { useEffect, useState } from 'react';
import { loadPdfEngine } from '../pdf-core/loadPdfEngine';

interface CharBox {
    ch: string;
    left: number;
    top: number;
    width: number;
    height: number;
}

interface TextLayerProps {
    docHandle: number;
    pageIndex: number;
    scale: number;
    pageWidthPts: number;
    pageHeightPts: number;
}

export function TextLayer({ docHandle, pageIndex, scale, pageWidthPts, pageHeightPts }: TextLayerProps) {
    const [chars, setChars] = useState<CharBox[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const pdfCore = await loadPdfEngine();
            const json = pdfCore.get_text_chars(docHandle, pageIndex);
            if (!cancelled) setChars(JSON.parse(json));
        })();
        return () => { cancelled = true; };
    }, [docHandle, pageIndex]);

    return (
        <div
            data-pdf-textlayer="true"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: pageWidthPts * scale,
                height: pageHeightPts * scale,
                pointerEvents: 'none',
            }}
        >
            {chars.map((c, i) => (
                <span
                    key={i}
                    style={{
                        position: 'absolute',
                        left: c.left * scale,
                        top: c.top * scale,
                        width: c.width * scale,
                        height: c.height * scale,
                        fontSize: c.height * scale,
                        lineHeight: 1,
                        color: 'transparent',
                        whiteSpace: 'pre',
                        userSelect: 'text',
                        pointerEvents: 'auto',
                    }}
                >
                    {c.ch}
                </span>
            ))}
        </div>
    );
}