import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, Crop } from "lucide-react";
import ImageCropModal from "./ImageCropModal";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  bucket?: string;
  folder?: string;
  aspectRatio?: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function ImageUpload({
  value,
  onChange,
  label,
  bucket = "product-images",
  folder = "products",
  aspectRatio = 3 / 4,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fontStyle = { fontFamily: "var(--font-sans)" };

  const uploadBlob = async (blob: Blob, originalName?: string) => {
    setError(null);
    setUploading(true);

    const ext = originalName?.split(".").pop() || "jpg";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, { cacheControl: "3600", upsert: false, contentType: blob.type || "image/jpeg" });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
    onChange(publicUrl);
    setUploading(false);
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

    // Show crop modal
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
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    const prefix = `/storage/v1/object/public/${bucket}/`;
    const idx = value.indexOf(prefix);
    if (idx !== -1) {
      const path = value.slice(idx + prefix.length);
      await supabase.storage.from(bucket).remove([path]);
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
      <label className={labelClass} style={fontStyle}>
        {label}
      </label>

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

      {/* Manual URL fallback */}
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
        accept="image/*"
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

      {/* Crop Modal */}
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
