import { useEffect, useState } from "react";

// The card's name/title text sits directly over its background image, so a
// light-colored background needs dark text instead of the usual white to
// stay readable. Shared by the public card page and the dashboard preview
// so both react to a custom background the same way.
export function useIsLightBackground(bgUrl) {
  const [isLightBg, setIsLightBg] = useState(false);

  useEffect(() => {
    if (!bgUrl) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let total = 0;
        const pixelCount = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        setIsLightBg(total / pixelCount > 150);
      } catch (err) {
        // Cross-origin canvas tainting or any other read failure: keep the
        // default (dark-background) styling rather than risk unreadable text.
        console.error("Could not sample background brightness:", err);
      }
    };
    img.onerror = () => {};
    img.src = bgUrl;
    return () => {
      cancelled = true;
    };
  }, [bgUrl]);

  return isLightBg;
}
