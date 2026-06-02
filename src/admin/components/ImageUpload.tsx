import { useState, useRef } from "react";
import { Upload, X, Loader2, Crop } from "lucide-react";
import { callAdminFunction } from "../lib/adminApi";
import ImageCropModal from "./ImageCropModal";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  bucket?: string;
  folder?: string;
  aspectRatio?: number;
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

export default function ImageUpload({
  value,
  onChange,
  label,
  bucket = "product-images",
  folder = "products/gallery",
  aspectRatio = 3 / 4,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
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
          fileName: originalName || "image.jpg",
          mimeType: blob.type || mimeType || "image/jpeg",
          dataBase64,
        },
      });

      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelected = (file: File) => {
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
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    if (internalStorageUrl(value, bucket)) {
      await callAdminFunction("admin-upload", {
        method: "DELETE",
        csrf: true,
        body: { bucket, url: value },
      }).catch(() => {});
    }

    onChange("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  };

  const inputClass =
    "w-full h-9 px-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,80%)] text-[13px] focus:outline-none focus:border-[hsl(220,10%,30%)] transition-colors";
  const labelClass =
    "block text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] mb-1.5";

  return (
    <div>
      {label && (
        <label className={labelClass} style={fontStyle}>
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt={label}
            className="w-full aspect-[3/4] object-cover bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)]"
          />
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => {
                setCropSrc(value);
                setPendingFile(null);
              }}
              className="w-7 h-7 bg-black/70 text-white flex items-center justify-center"
              title="Crop image"
            >
              <Crop size={14} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="w-7 h-7 bg-black/70 text-white flex items-center justify-center"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 aspect-[3/4] cursor-pointer border border-dashed transition-colors ${
            dragOver
              ? "border-[hsl(220,10%,50%)] bg-[hsl(220,15%,12%)]"
              : "border-[hsl(220,10%,20%)] bg-[hsl(220,15%,10%)]"
          }`}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-[hsl(220,10%,45%)]" />
          ) : (
            <>
              <Upload size={20} className="text-[hsl(220,10%,35%)]" />
              <span className="text-[11px] text-[hsl(220,10%,40%)]" style={fontStyle}>
                Drop image or click
              </span>
            </>
          )}
        </div>
      )}

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="or paste image URL"
        className={`${inputClass} mt-2`}
        style={fontStyle}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelected(file);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="text-[11px] text-[hsl(0,60%,55%)] mt-1" style={fontStyle}>
          {error}
        </p>
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
