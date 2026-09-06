import { useRef, useState } from "react";
import PhotoCropModal from "./PhotoCropModal";

function ImageUploader({ currentImageUrl, onFileSelect, shape = "circle", label = "Upload Photo" }) {
  const [preview, setPreview] = useState(currentImageUrl || null);
  const [hasLocalFile, setHasLocalFile] = useState(false);
  const [lastSyncedUrl, setLastSyncedUrl] = useState(currentImageUrl);
  const [pendingFile, setPendingFile] = useState(null);
  const inputRef = useRef(null);

  // currentImageUrl starts empty and only arrives after the editor's async
  // fetch of the existing card resolves - useState's initial value alone
  // would miss that update entirely and leave the existing photo/background/
  // logo looking blank. Adjusted here during render (React's recommended
  // way to sync state to a changed prop) rather than in an effect, but not
  // over a file the person just picked themselves in this session.
  if (currentImageUrl !== lastSyncedUrl) {
    setLastSyncedUrl(currentImageUrl);
    if (!hasLocalFile) setPreview(currentImageUrl || null);
  }

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (shape === "circle") {
      // The profile photo goes through the crop modal so the person can
      // choose exactly what sits inside the round frame, rather than
      // whatever a plain center-crop happens to land on.
      setPendingFile(file);
      return;
    }
    setHasLocalFile(true);
    setPreview(URL.createObjectURL(file));
    onFileSelect?.(file);
  };

  const handleCropConfirm = (blob) => {
    setHasLocalFile(true);
    setPreview(URL.createObjectURL(blob));
    onFileSelect?.(blob);
    setPendingFile(null);
    // Without this, re-picking the exact same file later (e.g. to redo the
    // crop) wouldn't fire onChange at all - the input's value never
    // actually changed as far as the browser's concerned.
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleCropCancel = () => {
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const frameClassName =
    shape === "card"
      ? "w-full max-w-[220px] aspect-[3/5] rounded-xl2"
      : shape === "logo"
      ? "w-full max-w-[220px] aspect-[3/1] rounded-xl2"
      : "w-28 h-28 rounded-full";

  // A logo shouldn't be cropped to fill its box the way a photo or
  // background is - it's shown at its own aspect ratio, letterboxed.
  const imgClassName = shape === "logo" ? "max-w-full max-h-full object-contain p-3" : "w-full h-full object-cover";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${frameClassName} overflow-hidden border border-border bg-surface flex items-center justify-center`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className={imgClassName} />
        ) : (
          <span className="text-muted text-xs">No photo</span>
        )}
      </div>
      <label className="text-sm font-medium text-navy hover:underline cursor-pointer">
        {label}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      </label>

      {pendingFile && (
        <PhotoCropModal file={pendingFile} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />
      )}
    </div>
  );
}

export default ImageUploader;
