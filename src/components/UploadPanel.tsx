import { useCallback, useRef, useState } from "react";

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  previewUrl: string | null;
  busy: boolean;
  onFileSelected: (file: File) => void;
  onError: (message: string) => void;
};

export function UploadPanel({ previewUrl, busy, onFileSelected, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!ACCEPTED.includes(file.type)) {
        onError("That file type isn't supported. Please use a JPG, PNG or WebP image.");
        return;
      }
      if (file.size > MAX_BYTES) {
        onError("That image is larger than 8 MB. Please choose a smaller photo.");
        return;
      }
      onFileSelected(file);
    },
    [onError, onFileSelected],
  );

  return (
    <div className="panel p-5 sm:p-7">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a cricket player photo"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className={`dropzone flex cursor-pointer flex-col items-center justify-center px-6 py-10 text-center ${
          dragging ? "dropzone-active" : ""
        }`}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview of the photo you uploaded"
            className="max-h-72 w-auto rounded-xl object-contain"
          />
        ) : (
          <>
            <span className="text-5xl" aria-hidden="true">
              🏏
            </span>
            <p className="mt-4 font-display text-2xl">Drop a player photo here</p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse — JPG, PNG or WebP, up to 8 MB
            </p>
            <p className="mt-3 max-w-sm text-xs text-muted-foreground">
              A clear, front-facing photo gives the best result. Everything is analysed
              in your browser — the photo is never uploaded anywhere.
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="btn-hero"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {previewUrl ? "Choose another photo" : "Select a photo"}
        </button>
      </div>
    </div>
  );
}
