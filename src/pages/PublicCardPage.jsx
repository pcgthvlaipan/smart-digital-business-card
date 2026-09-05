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

  // Quick-action rows: everything with a real tappable destination, shown
  // with its actual value (not just a generic label) - address has no link
  // of its own (it's shown as plain text below instead) - "Map" already
  // covers "open this in Google Maps" when a link is set.
  const quickActions = [
    card.phone && { key: "call", label: card.phone, bg: "#0284C7", icon: Phone, href: formatPhoneLink(card.phone) },
    card.email && { key: "email", label: card.email, bg: "#0EA5E9", icon: Mail, href: formatEmailLink(card.email) },
    card.email2 && { key: "email2", label: card.email2, bg: "#38BDF8", icon: Mail, href: formatEmailLink(card.email2) },
    card.website && { key: "website", label: card.website.replace(/^https?:\/\//, ""), bg: "#0D9488", icon: Globe, href: card.website, external: true },
    card.googleMapsUrl && { key: "map", label: "View on Google Maps", bg: "#7C3AED", icon: MapPin, href: card.googleMapsUrl, external: true },
  ].filter(Boolean);

  // The icon row is one-per-type (e.g. a single mail icon covers both email
  // and email2) - both addresses still get their own line further down,
  // where there's room to actually show which is which.
  const seenIconTypes = new Set();
  const quickActionIcons = quickActions.filter((action) => {
    if (seenIconTypes.has(action.icon)) return false;
    seenIconTypes.add(action.icon);
    return true;
  });

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
        <div className="bg-[#F1F5F9] rounded-[20px] shadow-card overflow-hidden">
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
          {/* Simple header row: logo left, language toggle right. Same flex
              row means they're always at the same level - no manual offset
              math needed to keep them aligned. */}
          <div className="relative flex items-center justify-between px-5 pt-5">
            <img
              src={card.logoUrl || pcgLogo}
              alt={card.logoUrl ? `${card.company || card.fullName} logo` : "Perfect Companion Group"}
              className="h-7 max-w-[120px] w-auto object-contain"
            />
            {hasThai && (
              <div className="flex rounded-full overflow-hidden shadow-lg text-[11px] font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-3 py-1.5 transition-colors ${lang === "en" ? "bg-navy text-white" : "bg-white text-navy"}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang("th")}
                  className={`px-3 py-1.5 transition-colors ${lang === "th" ? "bg-navy text-white" : "bg-white text-navy"}`}
                >
                  TH
                </button>
              </div>
            )}
          </div>

          {/* Photo, name, title, company - sits directly on the background
              image/wallpaper, so text color adapts to it (isLightBg). */}
          <div className="relative flex flex-col items-center px-5 pt-5 pb-7">
            <div className="w-[134px] h-[134px] rounded-full bg-white p-[3px] relative">
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
              <div
                className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "#0EA5E9", border: "3px solid #FFFFFF" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
            </div>

            <h1 className="text-lg font-bold text-center mt-3" style={{ color: textColor }}>
              {displayName}{card.nickname && ` (${card.nickname})`}
            </h1>
            <p className="text-sm font-semibold text-center mt-0.5" style={{ color: "#5EEAD4" }}>
              {displayJobTitle}
            </p>
            {displayCompany && (
              <p className="text-[13px] text-center mt-0.5" style={{ color: textColorMuted }}>{displayCompany}</p>
            )}
          </div>

          {/* White panel: quick-action contact icons, address, about me,
              connect (social icons + QR code). */}
          <div className="relative bg-white rounded-[28px] mx-3 mb-3 px-5 pt-5 pb-5 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
            {quickActions.length > 0 && (
              <div className="pb-4 border-b border-[#EEF2F6]">
                {/* Icons on one line, like before - just the colored circles,
                    wrapping onto a second line rather than overlapping if
                    there isn't room for all of them. */}
                <div className="flex flex-wrap gap-2.5 mb-3">
                  {quickActionIcons.map((action) => (
                    <a
                      key={action.key}
                      href={action.href}
                      target={action.external ? "_blank" : undefined}
                      rel={action.external ? "noopener noreferrer" : undefined}
                      aria-label={action.label}
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: action.bg }}
                    >
                      <action.icon className="w-4 h-4 text-white" />
                    </a>
                  ))}
                </div>

                {/* Detail lines: the actual values, underneath the icon row. */}
                <div className="flex flex-col gap-1.5">
                  {quickActions.map((action) => (
                    <a
                      key={action.key}
                      href={action.href}
                      target={action.external ? "_blank" : undefined}
                      rel={action.external ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-2"
                    >
                      <action.icon className="w-3.5 h-3.5 shrink-0" style={{ color: action.bg }} />
                      <span className="text-[13px] font-medium text-slate-700 break-all">{action.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {card.address && (
              <div className="flex items-start gap-2 pt-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#7C3AED" }} />
                <span className="text-xs text-slate-500 leading-snug">{card.address}</span>
              </div>
            )}

            {displayBio && (
              <div className="pt-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0E7490" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" /></svg>
                  <span className="text-xs font-bold text-navy">About Me</span>
                </div>
                <p className="text-[11.5px] text-slate-500 leading-relaxed">{displayBio}</p>
              </div>
            )}

            <div className="pt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0E7490" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
                <span className="text-xs font-bold text-navy">Connect</span>
              </div>
              {/* Social icons and the QR code share one row, wrapping onto a
                  new line (rather than overlapping) if enough icons are added
                  that they'd otherwise crowd the QR code out. ml-auto keeps
                  the QR pinned right whether or not icons are present. */}
              <div className="flex flex-wrap items-center gap-3">
                {socialIcons.length > 0 && (
                  <div className="flex flex-wrap gap-2.5">
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

                <div className="bg-white rounded-xl p-2 shadow-lg shrink-0 ml-auto border border-[#EEF2F6]">
                  <QRCodeSVG value={publicUrl} size={56} className="block" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions: save contact, save as image - grouped together, in the
            same card section as the face above (just a border seam between
            them), directly under the QR code on the card. */}
        <div className="relative z-10 bg-[#F1F5F9] p-5 flex flex-col items-center gap-3">
          <div className="w-full flex gap-2.5">
            <button
              onClick={() =>
                createVCard({
                  ...card,
                  photoUrl: card.photoUrl?.startsWith("data:image") ? card.photoUrl : photoDataUrl || card.photoUrl,
                })
              }
              className="flex-1 flex items-center justify-center gap-1.5 font-semibold text-sm py-3 rounded-full transition-opacity hover:opacity-90 text-white"
              style={{ background: "linear-gradient(90deg,#0E7490,#0369A1)" }}
            >
              <Download className="w-4 h-4 shrink-0" />
              Save Contact
            </button>

            <button
              onClick={saveCardAsImage}
              className="flex-1 flex items-center justify-center gap-1.5 font-semibold text-sm py-3 rounded-full border border-border bg-surface text-navy hover:bg-border/30 transition-colors"
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
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
