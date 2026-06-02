import { useRef, useState } from "react";
import { Upload, X, Loader2, ArrowUp, ArrowDown, Crop } from "lucide-react";
import { callAdminFunction } from "../lib/adminApi";
import ImageCropModal from "./ImageCropModal";

interface MediaGalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  folder?: string;
  aspectRatio?: number;
  maxImages?: number;
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",").pop() || "");
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(blob);
  });
}

function internalStorageUrl(url: string, bucket: string) {
  return url.includes(`/storage/v1/object/public/${bucket}/`);
}

export default function MediaGalleryUpload({
  value,
  onChange,
  bucket = "product-images",
  folder = "products/gallery",
  aspectRatio = 3 / 4,
  maxImages = 8,
}: MediaGalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fontStyle = { fontFamily: "var(--font-sans)" };

  const uploadBlob = async (blob: Blob, originalName?: string, mimeType?: string) => {
    setError(null);
    setUploading(true);

    try {
      const dataBase64 = await blobToBase64(blob);
      const data = await callAdminFunction<{ url: string }>("admin-upload", {
        method: "POST",
        csrf: true,
        body: {
          bucket,
          folder,
          fileName: originalName || "gallery-image.jpg",
          mimeType: blob.type || mimeType || "image/jpeg",
          dataBase64,
        },
      });

      if (editingIndex !== null) {
        const next = [...value];
        next[editingIndex] = data.url;
        onChange(next);
        setEditingIndex(null);
      } else {
        onChange([...value, data.url]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setPendingFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (blob: Blob) => {
    setCropSrc(null);
    uploadBlob(blob, pendingFile?.name, pendingFile?.type);
    setPendingFile(null);
  };

  const handleSkipCrop = () => {
    setCropSrc(null);
    if (pendingFile) {
      uploadBlob(pendingFile, pendingFile.name, pendingFile.type);
      setPendingFile(null);
    } else {
      setEditingIndex(null);
    }
  };

  const removeAt = async (index: number) => {
    const url = value[index];
    if (internalStorageUrl(url, bucket)) {
      await callAdminFunction("admin-upload", {
        method: "DELETE",
        csrf: true,
        body: { bucket, url },
      }).catch(() => {});
    }
    onChange(value.filter((_, i) => i !== index));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)]" style={fontStyle}>
          Media Gallery
        </label>
        <span className="text-[10px] text-[hsl(220,10%,35%)]" style={fontStyle}>
          {value.length} / {maxImages}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {value.map((url, i) => (
          <div key={`${url}-${i}`} className="relative group bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)]">
            <img src={url} alt={`Gallery ${i + 1}`} className="w-full aspect-[3/4] object-cover" />
            <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  className="w-6 h-6 bg-black/70 text-white flex items-center justify-center disabled:opacity-30"
                  title="Move up"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === value.length - 1}
                  className="w-6 h-6 bg-black/70 text-white flex items-center justify-center disabled:opacity-30"
                  title="Move down"
                >
                  <ArrowDown size={12} />
                </button>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(i);
                    setCropSrc(url);
                  }}
                  className="w-6 h-6 bg-black/70 text-white flex items-center justify-center"
                  title="Recrop"
                >
                  <Crop size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="w-6 h-6 bg-black/70 text-white flex items-center justify-center"
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
            {i === 0 && (
              <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5" style={fontStyle}>
                Cover
              </span>
            )}
          </div>
        ))}

        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1 aspect-[3/4] border border-dashed border-[hsl(220,10%,20%)] bg-[hsl(220,15%,10%)] hover:border-[hsl(220,10%,35%)] transition-colors"
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin text-[hsl(220,10%,45%)]" />
            ) : (
              <>
                <Upload size={18} className="text-[hsl(220,10%,35%)]" />
                <span className="text-[10px] text-[hsl(220,10%,40%)]" style={fontStyle}>Add image</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="text-[11px] text-[hsl(0,60%,55%)] mt-2" style={fontStyle}>{error}</p>
      )}

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspectRatio={aspectRatio}
          onCropComplete={handleCropComplete}
          onCancel={handleSkipCrop}
        />
      )}
    </div>
  );
}
