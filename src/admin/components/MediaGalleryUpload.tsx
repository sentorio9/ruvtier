import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, ArrowUp, ArrowDown, Crop } from "lucide-react";
import ImageCropModal from "./ImageCropModal";

interface MediaGalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  folder?: string;
  aspectRatio?: number;
  maxImages?: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

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

  const uploadBlob = async (blob: Blob, originalName?: string) => {
    setError(null);
    setUploading(true);
    const ext = (originalName?.split(".").pop() || "jpg").toLowerCase();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: err } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, { cacheControl: "3600", upsert: false, contentType: blob.type || "image/jpeg" });
    if (err) {
      setError(err.message);
      setUploading(false);
      return;
    }
    const url = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
    if (editingIndex !== null) {
      const next = [...value];
      next[editingIndex] = url;
      onChange(next);
      setEditingIndex(null);
    } else {
      onChange([...value, url]);
    }
    setUploading(false);
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
    uploadBlob(blob, pendingFile?.name);
    setPendingFile(null);
  };

  const handleSkipCrop = () => {
    setCropSrc(null);
    if (pendingFile) {
      uploadBlob(pendingFile, pendingFile.name);
      setPendingFile(null);
    } else {
      setEditingIndex(null);
    }
  };

  const removeAt = async (index: number) => {
    const url = value[index];
    const prefix = `/storage/v1/object/public/${bucket}/`;
    const idx = url.indexOf(prefix);
    if (idx !== -1) {
      try {
        await supabase.storage.from(bucket).remove([url.slice(idx + prefix.length)]);
      } catch {
        // best-effort
      }
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
        accept="image/*"
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
