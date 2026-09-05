import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { Phone, Mail, Globe, MapPin, Copy, Download, Image as ImageIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createVCard } from "../utils/createVCard";
import { formatPhoneLink, formatEmailLink } from "../utils/formatLinks";
import { WhatsAppIcon, LineIcon, WeChatIcon } from "../components/icons/BrandIcons";
import pcgLogo from "../assets/PCGlogo.png";
import defaultWallpaper from "../assets/wall2.png";

function dbRowToCard(row) {
  return {
    id: row.id,
    fullName: row.full_name || "",
    fullNameTh: row.full_name_th || "",
    nickname: row.nickname || "",
    jobTitle: row.job_title || "",
    jobTitleTh: row.job_title_th || "",
    department: row.department || "",
    company: row.company || "",
    companyTh: row.company_th || "",
    phone: row.phone || "",
    email: row.email || "",
    email2: row.email2 || "",
    website: row.website || "",
    address: row.address || "",
    bio: row.bio || "",
    bioTh: row.bio_th || "",
    photoUrl: row.photo_url || "",
    backgroundUrl: row.background_url || "",
    logoUrl: row.logo_url || "",
    lineId: row.line_id || "",
    lineUrl: row.line_url || "",
    wechatId: row.wechat_id || "",
    whatsappNumber: row.whatsapp_number || "",
    facebookUrl: row.facebook_url || "",
    instagramUrl: row.instagram_url || "",
    linkedinUrl: row.linkedin_url || "",
    tiktokUrl: row.tiktok_url || "",
    youtubeUrl: row.youtube_url || "",
    googleMapsUrl: row.google_maps_url || "",
  };
}

function PublicCardPage() {
  const { cardId } = useParams();
  const [card, setCard] = useState(null);
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lang, setLang] = useState("en");
  const [isLightBg, setIsLightBg] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState("");

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

  // The navy block's text sits directly over the card's background image
  // (default wallpaper or a user's own upload), so a light-colored custom
  // background needs dark text instead of the usual white to stay readable.
  useEffect(() => {
    const bgUrl = card?.backgroundUrl || defaultWallpaper;
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
  }, [card?.backgroundUrl]);

  useEffect(() => {
    const fetchCard = async () => {
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
    fetchCard();
  }, [cardId]);

  const copyWeChat = () => {
    navigator.clipboard.writeText(card.wechatId);
    alert("WeChat ID copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F2ED]">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (notFound || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F2ED]">
        <p className="text-muted">This business card could not be found.</p>
      </div>
    );
  }

  const publicUrl = window.location.href;

  const saveCardAsImage = async () => {
    if (!cardRef.current) return;
    try {
      // Preload the background image fully before capture
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = resolve;
        img.onerror = resolve;
        img.src = backgroundImage;
      });

      // Ensure all custom fonts are fully loaded before measuring/rendering text
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Extra delay to ensure browser has fully painted everything
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
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
  const hasBackground = true;

  const hasThai = Boolean(card.fullNameTh || card.jobTitleTh || card.companyTh || card.bioTh);
  const displayName = (lang === "th" && card.fullNameTh) || card.fullName;
  const displayJobTitle = (lang === "th" && card.jobTitleTh) || card.jobTitle;
  const displayCompany = (lang === "th" && card.companyTh) || card.company;
  const displayBio = (lang === "th" && card.bioTh) || card.bio;

  const textColor = isLightBg ? "#0B3D91" : "#FFFFFF";
  const textColorMuted = isLightBg ? "rgba(11,61,145,0.72)" : "rgba(255,255,255,0.7)";
  const textColorBio = isLightBg ? "rgba(11,61,145,0.8)" : "rgba(255,255,255,0.75)";

  const contactRows = [
    card.phone && { key: "call", label: card.phone, icon: Phone, href: formatPhoneLink(card.phone) },
    card.email && { key: "email", label: card.email, icon: Mail, href: formatEmailLink(card.email) },
    card.email2 && { key: "email2", label: card.email2, icon: Mail, href: formatEmailLink(card.email2) },
    card.address && { key: "address", label: card.address, icon: MapPin, wrap: true },
    card.website && { key: "website", label: card.website.replace(/^https?:\/\//, ""), icon: Globe, href: card.website, external: true },
    card.googleMapsUrl && { key: "map", label: "View location", icon: MapPin, href: card.googleMapsUrl, external: true },
  ].filter(Boolean);

  const socialIcons = [
    card.facebookUrl && { key: "fb", href: card.facebookUrl, bg: "#1877F2", label: "f" },
    card.instagramUrl && { key: "ig", href: card.instagramUrl, bg: "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)", label: "ig" },
    card.whatsappNumber && { key: "wa", href: `https://wa.me/${card.whatsappNumber.replace(/[^\d]/g, "")}`, bg: "#25D366", type: "whatsapp" },
    (card.lineId || card.lineUrl) && { key: "line", href: card.lineUrl || `https://line.me/ti/p/${card.lineId}`, bg: "#06C755", type: "line" },
    card.wechatId && { key: "wechat", href: null, bg: "#2DC100", type: "wechat" },
  ].filter(Boolean);

  return (
    <div className="min-h-screen py-10 px-4 bg-[#F4F2ED]">
      <div className="max-w-[360px] mx-auto">
        {/* One card section, start to finish: the card face (ref'd for
            "Save as Image") and the actions below it share this same
            rounded, shadowed container with no gap between them. */}
        <div className="bg-white rounded-[20px] shadow-card overflow-hidden">
        <div
          ref={cardRef}
          className="relative bg-white"
        >
          {hasBackground && (
            <>
              {/* A background-image div, not an <img> with object-cover: html2canvas
                  (used by "Save Card as Image") doesn't support object-fit at all and
                  would stretch an <img> to fill the box instead of cropping it. */}
              <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute inset-0 bg-black/12 pointer-events-none z-0" />
            </>
          )}
          {/* Light header zone with logo */}
          <div className={`relative pt-7 px-5 overflow-hidden ${hasBackground ? "" : "bg-[#EEEEEC]"}`}>
            {!hasBackground && (
              <svg className="absolute inset-0 w-full h-[90px] opacity-50" preserveAspectRatio="none">
                <defs>
                  <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.4" fill="#B9BDC2" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
            )}
            <img
              src={card.logoUrl || pcgLogo}
              alt={card.logoUrl ? `${card.company || card.fullName} logo` : "Perfect Companion Group"}
              className="relative h-9 max-w-[160px] w-auto object-contain mb-3 block"
            />
          </div>

          {/* Language toggle, top right, aligned to the same top offset as the
              logo (the header's own pt-7) so they sit at the same level.
              Positioned against the outer card, not the header, so it can
              never get clipped by the header's own (much shorter) content
              height. */}
          {hasThai && (
            <div className="absolute top-7 right-3 flex bg-white rounded-xl p-1 shadow-lg text-xs font-semibold z-10">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-1 rounded-lg transition-colors ${lang === "en" ? "bg-navy text-white" : "text-navy"}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("th")}
                className={`px-2 py-1 rounded-lg transition-colors ${lang === "th" ? "bg-navy text-white" : "text-navy"}`}
              >
                TH
              </button>
            </div>
          )}

          {/* Photo overlapping light zone and navy block */}
          <div className={`relative flex justify-center ${hasBackground ? "" : "bg-[#EEEEEC]"}`}>
            <div className="w-[158px] h-[158px] rounded-full bg-white p-[3px] -mb-[65px] relative z-10">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#C7CDD6]">
                {card.photoUrl ? (
                  <div
                    role="img"
                    aria-label={displayName}
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${card.photoUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/70 text-xs">
                    No photo
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navy block: name, title, contact rows, socials */}
          <div
            className="relative px-5 pt-[88px] pb-5 overflow-hidden"
            style={hasBackground ? undefined : { background: "linear-gradient(160deg, #0B3D91 0%, #123F8C 60%, #0A3578 100%)" }}
          >
            <svg className="absolute -top-8 -right-8 w-[100px] h-[100px] opacity-[0.12]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50" fill="#D9A441" />
            </svg>

            <h1 className="relative text-lg font-semibold text-center pb-[2px]" style={{ color: textColor }}>
              {displayName}{card.nickname && ` (${card.nickname})`}
            </h1>
            <p className="relative text-[17px] font-semibold text-center pb-1" style={{ color: "#D9A441" }}>
              {displayJobTitle}
            </p>
            {displayCompany && (
              <p className="relative text-[16px] text-center pb-4" style={{ color: textColorMuted }}>{displayCompany}</p>
            )}

            {displayBio && (
              <p className="relative text-xs italic text-center mb-4 leading-loose" style={{ color: textColorBio }}>
                {displayBio}
              </p>
            )}

            {contactRows.length > 0 && (
              <div className="relative flex flex-col gap-2.5">
                {contactRows.map((row) => (
                    <a
                    key={row.key}
                    href={row.href}
                    target={row.external ? "_blank" : undefined}
                    rel={row.external ? "noopener noreferrer" : undefined}
                    className="flex items-start gap-2.5"
                  >
                    <row.icon className="w-[15px] h-[15px] shrink-0 mt-0.5" style={{ color: "#D9A441" }} />
                    <span className="text-[13px] leading-[1.4]" style={{ color: textColor, whiteSpace: row.wrap ? "normal" : "nowrap" }}>{row.label}</span>
                  </a>
                ))}

              </div>
            )}

            {socialIcons.length > 0 && (
              <div className="relative flex gap-2.5 mt-4">
                {socialIcons.map((s) => (
                  <span key={s.key} className="inline-block">
                    {s.href ? (
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: s.bg }}
                      >
                        {s.type === "whatsapp" && (
                          <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                        )}
                        {s.type === "line" && (
                          <LineIcon className="w-3.5 h-3.5 fill-white" />
                        )}
                      </a>
                    ) : (
                      <button onClick={copyWeChat} type="button" className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: s.bg }}>
                        {s.type === "wechat" && (
                          <WeChatIcon className="w-3.5 h-3.5 fill-white" />
                        )}
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* QR code, on the card face itself (so it's part of the
                exported image too), bottom right, above the actions below. */}
            <div className="relative flex justify-end mt-4">
              <div className="bg-white rounded-xl p-2 shadow-lg">
                <QRCodeSVG value={publicUrl} size={56} className="block" />
              </div>
            </div>

                      </div>
        </div>

        {/* Actions: save contact, save as image - grouped together, in the
            same card section as the face above (just a border seam between
            them), directly under the QR code on the card. */}
        <div className="relative z-10 border-t border-border p-5 flex flex-col items-center gap-3">
          <div className="w-full flex flex-col gap-2.5">
            <button
              onClick={() =>
                createVCard({
                  ...card,
                  photoUrl: card.photoUrl?.startsWith("data:image") ? card.photoUrl : photoDataUrl || card.photoUrl,
                })
              }
              className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-lg transition-opacity hover:opacity-90"
              style={{ background: "#D9A441", color: "#0B3D91" }}
            >
              <Download className="w-4 h-4" />
              Save Contact
            </button>

            <button
              onClick={saveCardAsImage}
              className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-lg border border-border bg-surface text-navy hover:bg-border/30 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              Save Card as Image
            </button>
          </div>
        </div>
        </div>

        <p className="text-center text-xs text-muted/70 mt-5">Powered by Smart Digital Card</p>
      </div>
    </div>
  );
}

export default PublicCardPage;
