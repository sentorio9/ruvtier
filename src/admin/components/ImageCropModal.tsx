import { useState, useRef, useCallback, useMemo } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check, RotateCcw, RotateCw, ZoomIn, ZoomOut, Ruler } from "lucide-react";

interface ImageCropModalProps {
  imageSrc: string;
  onCropComplete: (blob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;

export default function ImageCropModal({ imageSrc, onCropComplete, onCancel, aspectRatio }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [initialCrop, setInitialCrop] = useState<Crop | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // multiples of 90deg
  const [unit, setUnit] = useState<"%" | "px">("%");
  const imgRef = useRef<HTMLImageElement>(null);
  const fontStyle = { fontFamily: "var(--font-sans)" };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const aspect = aspectRatio || 3 / 4;
      const initial = centerAspectCrop(width, height, aspect);
      setCrop(initial);
      setInitialCrop(initial);
    },
    [aspectRatio]
  );

  const handleConfirm = useCallback(async () => {
    const image = imgRef.current;
    if (!image || !completedCrop) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const cropW = completedCrop.width * scaleX;
    const cropH = completedCrop.height * scaleY;
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    // For 90/270 rotations, the output canvas swaps width/height.
    const rad = (rotation * Math.PI) / 180;
    const swap = rotation % 180 !== 0;
    const outW = swap ? cropH : cropW;
    const outH = swap ? cropW : cropH;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Translate to centre, rotate, then draw the crop centred on origin.
    ctx.imageSmoothingQuality = "high";
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate(rad);
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropW,
      cropH,
      -cropW / 2,
      -cropH / 2,
      cropW,
      cropH
    );

    canvas.toBlob(
      (blob) => { if (blob) onCropComplete(blob); },
      "image/jpeg",
      0.92
    );
  }, [completedCrop, onCropComplete, rotation]);

  const handleReset = useCallback(() => {
    if (initialCrop) setCrop(initialCrop);
    setZoom(1);
    setRotation(0);
  }, [initialCrop]);

  const incZoom = (d: number) =>
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + d).toFixed(2))));

  const cropReadout = useMemo(() => {
    const image = imgRef.current;
    if (!completedCrop || !image) return "—";
    if (unit === "px") {
      const sx = image.naturalWidth / image.width;
      const sy = image.naturalHeight / image.height;
      return `${Math.round(completedCrop.width * sx)} × ${Math.round(completedCrop.height * sy)} px`;
    }
    const wPct = (completedCrop.width / image.width) * 100;
    const hPct = (completedCrop.height / image.height) * 100;
    return `${wPct.toFixed(1)} × ${hPct.toFixed(1)} %`;
  }, [completedCrop, unit]);

  const toolBtn =
    "flex items-center justify-center w-7 h-7 text-[hsl(220,10%,55%)] hover:text-[hsl(220,10%,85%)] hover:bg-[hsl(220,10%,14%)] transition-colors disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,16%)] max-w-[760px] w-full mx-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(220,10%,14%)]">
          <h3 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,65%)]" style={fontStyle}>
            Crop Image
          </h3>
          <button onClick={onCancel} className="text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,70%)] transition-colors" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-5 py-2 border-b border-[hsl(220,10%,14%)] text-[hsl(220,10%,55%)]">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => incZoom(-ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} className={toolBtn} title="Zoom out" aria-label="Zoom out">
              <ZoomOut size={14} />
            </button>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-28 accent-[hsl(220,10%,75%)]"
              aria-label="Zoom"
            />
            <button type="button" onClick={() => incZoom(ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} className={toolBtn} title="Zoom in" aria-label="Zoom in">
              <ZoomIn size={14} />
            </button>
            <span className="text-[10px] tabular-nums w-10 text-right" style={fontStyle}>{Math.round(zoom * 100)}%</span>
          </div>

          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setRotation((r) => (r - 90 + 360) % 360)} className={toolBtn} title="Rotate left" aria-label="Rotate left">
              <RotateCcw size={14} />
            </button>
            <span className="text-[10px] tabular-nums w-8 text-center" style={fontStyle}>{rotation}°</span>
            <button type="button" onClick={() => setRotation((r) => (r + 90) % 360)} className={toolBtn} title="Rotate right" aria-label="Rotate right">
              <RotateCw size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUnit((u) => (u === "%" ? "px" : "%"))}
              className="flex items-center gap-1 h-7 px-2 text-[10px] tracking-[0.14em] uppercase text-[hsl(220,10%,55%)] hover:text-[hsl(220,10%,85%)] transition-colors"
              style={fontStyle}
              title="Toggle units"
              aria-label="Toggle crop unit"
            >
              <Ruler size={12} />
              {unit}
            </button>
            <span className="text-[10px] tabular-nums text-[hsl(220,10%,55%)]" style={fontStyle}>{cropReadout}</span>
          </div>
        </div>

        {/* Crop area */}
        <div className="flex-1 overflow-auto p-5 flex items-center justify-center min-h-0 bg-[hsl(220,15%,7%)]">
          <div
            className="origin-center transition-transform duration-200 ease-out"
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
          >
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio || 3 / 4}
              className="max-h-[58vh]"
              ruleOfThirds
            >
              <img
                ref={imgRef}
                src={imageSrc}
                onLoad={onImageLoad}
                alt="Crop preview"
                className="max-h-[58vh] object-contain select-none"
                crossOrigin="anonymous"
                draggable={false}
              />
            </ReactCrop>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[hsl(220,10%,14%)]">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 h-8 px-3 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,45%)] hover:text-[hsl(220,10%,70%)] transition-colors"
            style={fontStyle}
            title="Reset crop, zoom, and rotation"
          >
            <RotateCcw size={12} /> Reset
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="h-8 px-4 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,45%)] hover:text-[hsl(220,10%,70%)] transition-colors"
              style={fontStyle}
            >
              Skip crop
            </button>
            <button
              onClick={handleConfirm}
              disabled={!completedCrop}
              className="flex items-center gap-2 h-8 px-4 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[11px] tracking-[0.1em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors disabled:opacity-40"
              style={fontStyle}
            >
              <Check size={12} /> Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
