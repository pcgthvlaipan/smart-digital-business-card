import { useState } from "react";

function ImageUploader({ currentImageUrl, onFileSelect, shape = "circle", label = "Upload Photo" }) {
  const [preview, setPreview] = useState(currentImageUrl || null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelect?.(file);
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
        <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
      </label>
    </div>
  );
}

export default ImageUploader;
