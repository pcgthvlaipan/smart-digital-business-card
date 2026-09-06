import { useEffect, useRef, useState } from "react";

const STAGE_SIZE = 260; // on-screen crop stage, px
const OUTPUT_SIZE = 900; // exported square image, px - matches the editor's upload target

// Lets the person drag/zoom their photo behind a fixed circular frame,
// then exports exactly what's inside that circle as a new square image -
// so what they see while cropping is what actually gets uploaded, not the
// original photo auto-cropped to whatever happened to be in the middle.
function PhotoCropModal({ file, onConfirm, onCancel }) {
  const [naturalSize, setNaturalSize] = useState(null); // { width, height }
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null); // { startX, startY, startPosX, startPosY, pointerId }
  const imgRef = useRef(null);

  // Create and revoke the object URL together in one effect, keyed on
  // `file` - assigned directly to the real <img> element (via ref) rather
  // than kept in state, so there's no separate render-time value whose
  // lifetime could get split from this effect's own create/revoke pairing.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (imgRef.current) imgRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleImgLoad = () => {
    const img = imgRef.current;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };

  // The scale that makes the image exactly cover the stage at zoom = 1 -
  // the zoom slider then only ever makes it bigger from there, never
  // smaller than "fully covers the circle". Falls back to 0 (image
  // invisible) until naturalSize is known, right after the src is set.
  const baseScale = naturalSize ? Math.max(STAGE_SIZE / naturalSize.width, STAGE_SIZE / naturalSize.height) : 0;
  const renderedW = naturalSize ? naturalSize.width * baseScale * zoom : 0;
  const renderedH = naturalSize ? naturalSize.height * baseScale * zoom : 0;
  const maxOffsetX = Math.max(0, (renderedW - STAGE_SIZE) / 2);
  const maxOffsetY = Math.max(0, (renderedH - STAGE_SIZE) / 2);

  const clamp = (value, max) => Math.min(max, Math.max(-max, value));

  const handlePointerDown = (e) => {
    if (!naturalSize) return;
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
      pointerId: e.pointerId,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
    const { startX, startY, startPosX, startPosY } = dragRef.current;
    setPos({
      x: clamp(startPosX + (e.clientX - startX), maxOffsetX),
      y: clamp(startPosY + (e.clientY - startY), maxOffsetY),
    });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleZoomChange = (e) => {
    if (!naturalSize) return;
    const nextZoom = Number(e.target.value);
    const nextW = naturalSize.width * baseScale * nextZoom;
    const nextH = naturalSize.height * baseScale * nextZoom;
    const nextMaxX = Math.max(0, (nextW - STAGE_SIZE) / 2);
    const nextMaxY = Math.max(0, (nextH - STAGE_SIZE) / 2);
    setZoom(nextZoom);
    // Re-clamp the current position to the new (usually larger) bounds so
    // zooming in/out never suddenly reveals empty space at an old edge.
    setPos((current) => ({ x: clamp(current.x, nextMaxX), y: clamp(current.y, nextMaxY) }));
  };

  const handleConfirm = () => {
    if (!naturalSize) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    const drawScale = OUTPUT_SIZE / STAGE_SIZE;
    const outW = renderedW * drawScale;
    const outH = renderedH * drawScale;
    const dx = OUTPUT_SIZE / 2 - outW / 2 + pos.x * drawScale;
    const dy = OUTPUT_SIZE / 2 - outH / 2 + pos.y * drawScale;
    ctx.drawImage(imgRef.current, dx, dy, outW, outH);
    canvas.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 max-w-sm w-full">
        <h3 className="text-sm font-semibold text-ink self-start">Position your photo</h3>

        <div
          className="relative overflow-hidden rounded-lg bg-slate-100 touch-none cursor-grab active:cursor-grabbing select-none"
          style={{ width: STAGE_SIZE, height: STAGE_SIZE }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <img
            ref={imgRef}
            onLoad={handleImgLoad}
            alt=""
            draggable={false}
            className="absolute pointer-events-none"
            style={{
              display: naturalSize ? "block" : "none",
              width: renderedW,
              height: renderedH,
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
            }}
          />
          {!naturalSize && (
            <p className="absolute inset-0 flex items-center justify-center text-xs text-muted">Loading...</p>
          )}
          {/* Dims everything outside the circular frame - a big solid ring
              via box-shadow spread, transparent only inside the circle. */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: "0 0 0 2000px rgba(15, 23, 42, 0.55)" }}
          />
        </div>

        <div className="w-full flex items-center gap-3">
          <span className="text-xs text-muted">Zoom</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
            disabled={!naturalSize}
            className="flex-1"
          />
        </div>

        <div className="w-full flex gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full border border-border text-sm font-semibold text-ink hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!naturalSize}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "#0B3D91" }}
          >
            Use Photo
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhotoCropModal;
