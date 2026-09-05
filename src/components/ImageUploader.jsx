import { useState } from "react";

function ImageUploader({ currentImageUrl, onFileSelect, shape = "circle" }) {
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
      : "w-28 h-28 rounded-full";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${frameClassName} overflow-hidden border border-border bg-surface flex items-center justify-center`}
      >
        {preview ? (
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-muted text-xs">No photo</span>
        )}
      </div>
      <label className="text-sm font-medium text-navy hover:underline cursor-pointer">
        Upload Photo
        <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
      </label>
    </div>
  );
}

export default ImageUploader;
