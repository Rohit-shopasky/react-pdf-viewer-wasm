import { useEffect, useRef, useState } from 'react';
import { loadPdfEngine } from '../pdf-core/loadPdfEngine';
import { TextLayer } from './TextLayer';
import { useDocContext } from './Document';

interface PageProps {
    pageIndex: number;
    scale?: number;   // overrides Document's scale if provided
    rotate?: number;  // overrides Document's rotate if provided
    textSelectable?: boolean;
}

export function Page({ pageIndex, scale, rotate, textSelectable = true }: PageProps) {
    const ctx = useDocContext();
    const effectiveScale = scale ?? ctx.scale;
    const effectiveRotate = rotate ?? ctx.rotate;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const pdfCore = await loadPdfEngine();
            const [widthPts, heightPts] = pdfCore.get_page_dimensions(ctx.docHandle, pageIndex);
            const rotated = effectiveRotate === 90 || effectiveRotate === 270;
            const outW = rotated ? heightPts : widthPts;
            const outH = rotated ? widthPts : heightPts;

            const width = Math.round(outW * effectiveScale);
            const height = Math.round(outH * effectiveScale);
            const rgba = pdfCore.render_page(ctx.docHandle, pageIndex, effectiveScale, effectiveRotate);

            if (cancelled || !canvasRef.current) return;
            const canvas = canvasRef.current;
            canvas.width = width;
            canvas.height = height;
            const c2d = canvas.getContext('2d')!;
            c2d.putImageData(new ImageData(new Uint8ClampedArray(rgba), width, height), 0, 0);

            setDims({ w: outW, h: outH });
        })();
        return () => { cancelled = true; };
    }, [ctx.docHandle, pageIndex, effectiveScale, effectiveRotate]);

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
            {textSelectable && dims && (
                <TextLayer
                    docHandle={ctx.docHandle}
                    pageIndex={pageIndex}
                    scale={effectiveScale}
                    pageWidthPts={dims.w}
                    pageHeightPts={dims.h}
                />
            )}
        </div>
    );
}