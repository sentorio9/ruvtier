import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check, RotateCcw } from "lucide-react";

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

export default function ImageCropModal({ imageSrc, onCropComplete, onCancel, aspectRatio }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const fontStyle = { fontFamily: "var(--font-sans)" };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const aspect = aspectRatio || 3 / 4;
      setCrop(centerAspectCrop(width, height, aspect));
    },
    [aspectRatio]
  );

  const handleConfirm = useCallback(async () => {
    const image = imgRef.current;
    if (!image || !completedCrop) return;

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => { if (blob) onCropComplete(blob); },
      "image/jpeg",
      0.92
    );
  }, [completedCrop, onCropComplete]);

  const handleReset = () => {
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    setCrop(centerAspectCrop(width, height, aspectRatio || 3 / 4));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,16%)] max-w-[700px] w-full mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(220,10%,14%)]">
          <h3 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,65%)]" style={fontStyle}>
            Crop Image
          </h3>
          <button onClick={onCancel} className="text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,70%)] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Crop area */}
        <div className="flex-1 overflow-auto p-5 flex items-center justify-center min-h-0">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio || 3 / 4}
            className="max-h-[60vh]"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              alt="Crop preview"
              className="max-h-[60vh] object-contain"
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[hsl(220,10%,14%)]">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 h-8 px-3 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,45%)] hover:text-[hsl(220,10%,70%)] transition-colors"
            style={fontStyle}
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
