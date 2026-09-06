import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { Download, Image as ImageIcon } from "lucide-react";
import { createVCard } from "../utils/createVCard";
import { dbRowToCard } from "../utils/cardData";
import { baseManifest } from "../utils/appManifest";
import { useIsLightBackground } from "../hooks/useBackgroundBrightness";
import CardFace from "../components/CardFace";
import InstallPrompt from "../components/InstallPrompt";
import defaultWallpaper from "../assets/wall2.png";

function PublicCardPage() {
  const { cardId } = useParams();
  const [card, setCard] = useState(null);
  const cardRef = useRef(null);
  const photoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lang, setLang] = useState("th");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const isLightBg = useIsLightBackground(card?.backgroundUrl || defaultWallpaper);

  // Pre-fetch the contact photo into a data URL while the page just sits
  // open, rather than at click time: createVCard's photo fetch is async, and
  // iOS Safari can refuse navigator.share() if too much async work (a
  // network fetch included) happens between the tap and the share() call,
  // since it no longer looks tied to the user gesture. Resolving this ahead
  // of time means the click handler hits an instant data: URI, not a fetch.
  useEffect(() => {
    // Already usable as-is (no photo, or already a data URI) - nothing to
    // pre-fetch, and the render-time fallback below covers this case.
    if (!card?.photoUrl || card.photoUrl.startsWith("data:image")) return;
    let cancelled = false;
    fetch(card.photoUrl)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      )
      .then((dataUrl) => {
        if (!cancelled) setPhotoDataUrl(dataUrl);
      })
      .catch((err) => console.error("Failed to pre-fetch contact photo:", err));
    return () => {
      cancelled = true;
    };
  }, [card?.photoUrl]);

  // Android/Chrome's install prompt launches whatever start_url the page's
  // manifest declares - the static one in index.html points at "/", so
  // installing straight from here would reopen the generic homepage
  // instead of this exact card. Swapping in a Blob-backed manifest whose
  // start_url is this card's own URL (while this page is open) fixes that,
  // restored on unmount so every other page keeps the default manifest.
  // Built synchronously from the shared JS object (no fetch of the static
  // file) - besides skipping a network round-trip on every card view, this
  // also avoids a real race the old fetch-based version had: an in-flight
  // fetch could still resolve and overwrite the href *after* a fast
  // navigation's cleanup had already restored it.
  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) return;
    const originalHref = link.getAttribute("href");
    const perCardManifest = { ...baseManifest, start_url: window.location.pathname };
    const blobUrl = URL.createObjectURL(
      new Blob([JSON.stringify(perCardManifest)], { type: "application/manifest+json" })
    );
    link.setAttribute("href", blobUrl);
    return () => {
      link.setAttribute("href", originalHref);
      URL.revokeObjectURL(blobUrl);
    };
  }, [cardId]);

  useEffect(() => {
    const fetchCard = async ({ showLoading } = {}) => {
      if (showLoading) setLoading(true);
      try {
        const { data, error } = await supabase
          .from("business_cards")
          .select("*")
          .eq("id", cardId)
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setCard(dbRowToCard(data));
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCard({ showLoading: true });

    // If this card was opened, then the owner updated their photo/details
    // elsewhere (the editor, another tab) and came back to this same
    // already-open tab without a full reload, nothing would otherwise tell
    // it to notice - React state only ever reflects whatever was fetched
    // once on mount. Re-fetching whenever the tab becomes visible again
    // means "Save Contact" and "Save Image" always use current data.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchCard({ showLoading: false });
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [cardId]);

  const copyWeChat = () => {
    // WeChat has no public "add friend by ID" link the way LINE does (a
    // deliberate anti-spam restriction on their end, not something fixable
    // from a website) - copying the ID and opening the app directly is the
    // best available flow, so the message needs to say what to do next
    // rather than leaving it looking like nothing happened.
    navigator.clipboard.writeText(card.wechatId);
    window.location.href = "weixin://";
    alert(`WeChat ID copied: ${card.wechatId}\n\nOpen WeChat → Add Friends → paste to add.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #0B3D91 0%, #123F8C 60%, #0A3578 100%)" }}>
        <p className="text-white/70">Loading...</p>
      </div>
    );
  }

  if (notFound || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #0B3D91 0%, #123F8C 60%, #0A3578 100%)" }}>
        <p className="text-white/70">This business card could not be found.</p>
      </div>
    );
  }

  const publicUrl = window.location.href;

  const saveCardAsImage = async () => {
    if (!cardRef.current) return;
    try {
      // Preload every image the capture depends on - background, profile
      // photo, logo - fully before capture. Only the background was being
      // preloaded before; the profile photo could still be mid-decode when
      // html2canvas grabbed it, which is a likely cause of it coming out soft.
      const preloadImage = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
          img.src = src;
        });
      const [, photoImg] = await Promise.all([
        preloadImage(backgroundImage),
        card.photoUrl ? preloadImage(card.photoUrl) : Promise.resolve(null),
        card.logoUrl ? preloadImage(card.logoUrl) : Promise.resolve(null),
      ]);

      // Ensure all custom fonts are fully loaded before measuring/rendering text
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Extra delay to ensure browser has fully painted everything
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Measured right before capture (after font loading/layout has
      // settled, not before it) - used after capture to redraw the photo at
      // full quality (see below). Measuring earlier risked a layout shift
      // (e.g. from a webfont swapping in) drifting the photo's position out
      // of sync with where it ends up in the captured image.
      const cardRectForPhoto = cardRef.current.getBoundingClientRect();
      const photoRectForPhoto = photoRef.current?.getBoundingClientRect();

      const captureScale = 4;
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: captureScale,
        backgroundColor: null,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        // html2canvas paints ordinary HTML text using its own approximate
        // font metrics rather than the browser's real ones, which can drift
        // enough to visibly misalign an icon next to it - only in the
        // exported image, never live. The single-line detail rows sidestep
        // that entirely now (DetailRowSvg - see its comment), but the
        // address line still wraps across 2 lines as plain HTML, so it still
        // needs this pixel nudge, applied only in the clone used for
        // capture, never on the live page.
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll(".detail-icon").forEach((icon) => {
            icon.style.transform = "translateY(5px)";
          });
        },
      });

      // html2canvas rasterizes every image itself, using the canvas 2D API's
      // own (lower-quality-by-default) scaling rather than the browser's own
      // CSS rendering - it never sets imageSmoothingQuality at all. That's a
      // real quality gap versus how the photo looks live on the card, most
      // visible on the largest image (the profile photo). Redraw just that
      // circle here with explicit high-quality smoothing, replicating
      // background-size:cover/center, so the exported photo matches what's
      // actually on the card instead of html2canvas's own softer version.
      if (photoImg && photoImg.naturalWidth > 0 && photoRectForPhoto) {
        const ctx = canvas.getContext("2d");
        const x = (photoRectForPhoto.left - cardRectForPhoto.left) * captureScale;
        const y = (photoRectForPhoto.top - cardRectForPhoto.top) * captureScale;
        const w = photoRectForPhoto.width * captureScale;
        const h = photoRectForPhoto.height * captureScale;
        if (ctx && w > 0 && h > 0) {
          ctx.save();
          // Reset any transform html2canvas left on this context - our x/y/w/h
          // are already in final canvas-pixel space, computed independently
          // via captureScale, so drawing under a leftover transform would
          // apply that scaling twice and throw the photo's position/size off.
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
          ctx.clip();

          const boxRatio = w / h;
          const imgRatio = photoImg.naturalWidth / photoImg.naturalHeight;
          let sx, sy, sw, sh;
          if (imgRatio > boxRatio) {
            sh = photoImg.naturalHeight;
            sw = sh * boxRatio;
            sx = (photoImg.naturalWidth - sw) / 2;
            sy = 0;
          } else {
            sw = photoImg.naturalWidth;
            sh = sw / boxRatio;
            sx = 0;
            sy = (photoImg.naturalHeight - sh) / 2;
          }
          ctx.drawImage(photoImg, sx, sy, sw, sh, x, y, w, h);
          ctx.restore();
        }
      }

      const dataUrl = canvas.toDataURL("image/png", 0.95);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      // iOS Safari doesn't reliably support the <a download> attribute, so use
      // the native share sheet there. Android downloads directly to Downloads
      // instead, since its share sheet doesn't reliably offer a gallery target.
      if (isIOS && navigator.canShare) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const fileName = `${card.fullName || "business-card"}.png`;
        const file = new File([blob], fileName, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file] });
          } catch (shareErr) {
            if (shareErr.name !== "AbortError") {
              throw shareErr;
            }
          }
          return;
        }
      }
      // Android and desktop: direct download
      const link = document.createElement("a");
      link.download = `${card.fullName || "business-card"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to save card as image:", err);
      alert("Could not save card image. Please try again.");
    }
  };
  const backgroundImage = card.backgroundUrl || defaultWallpaper;

  // Save Contact matches whichever language is currently displayed (falls
  // back to the base fields automatically when a Thai variant isn't set,
  // same as what CardFace shows on screen).
  const displayName = (lang === "th" && card.fullNameTh) || card.fullName;
  const displayJobTitle = (lang === "th" && card.jobTitleTh) || card.jobTitle;
  const displayCompany = (lang === "th" && card.companyTh) || card.company;
  const displayBio = (lang === "th" && card.bioTh) || card.bio;

  return (
    <div className="min-h-screen py-10 px-4 overflow-x-hidden" style={{ background: "linear-gradient(160deg, #0B3D91 0%, #123F8C 60%, #0A3578 100%)" }}>
      <div className="w-full max-w-[380px] mx-auto">
        {/* One card section, start to finish: the card face (ref'd for
            "Save as Image") and the actions below it share this same
            rounded, shadowed container with no gap between them. */}
        <div className="bg-[#F1F5F9] rounded-[20px] shadow-card overflow-hidden">
        <CardFace
          card={card}
          lang={lang}
          onLangChange={setLang}
          isLightBg={isLightBg}
          cardRef={cardRef}
          photoRef={photoRef}
          publicUrl={publicUrl}
          onWeChatClick={copyWeChat}
        />

        {/* Actions: save contact, save as image - grouped together, in the
            same card section as the face above (just a border seam between
            them), directly under the QR code on the card. */}
        <div className="relative z-10 bg-[#F1F5F9] p-5 flex flex-col items-center gap-3">
          <div className="w-full flex gap-2.5">
            <button
              onClick={() =>
                createVCard({
                  ...card,
                  // Saved contact matches whichever language is currently
                  // displayed (falls back to the base fields automatically
                  // when a Thai variant isn't set, same as the on-screen text).
                  fullName: displayName,
                  jobTitle: displayJobTitle,
                  company: displayCompany,
                  bio: displayBio,
                  photoUrl: card.photoUrl?.startsWith("data:image") ? card.photoUrl : photoDataUrl || card.photoUrl,
                })
              }
              className="flex-1 flex items-center justify-center gap-1.5 font-semibold text-sm py-3 rounded-full transition-opacity hover:opacity-90 text-white"
              style={{ background: "linear-gradient(90deg,#F97316,#EA580C)" }}
            >
              <Download className="w-4 h-4 shrink-0" />
              Save Contact
            </button>

            <button
              onClick={saveCardAsImage}
              className="flex-1 flex items-center justify-center gap-1.5 font-semibold text-sm py-3 rounded-full text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(90deg,#F97316,#EA580C)" }}
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              Save Image
            </button>
          </div>
        </div>
        </div>

        <p className="text-center text-xs text-muted/70 mt-5">Powered by Smart Digital Card</p>
      </div>
      <InstallPrompt />
    </div>
  );
}

export default PublicCardPage;
