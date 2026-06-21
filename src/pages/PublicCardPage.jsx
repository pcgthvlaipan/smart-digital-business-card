import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Phone, Mail, Globe, MapPin, Copy, Download, Image as ImageIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createVCard } from "../utils/createVCard";
import { formatPhoneLink, formatEmailLink } from "../utils/formatLinks";
import { WhatsAppIcon, LineIcon, WeChatIcon } from "../components/icons/BrandIcons";
import pcgLogo from "../assets/PCGlogo.png";
import defaultWallpaper from "../assets/wall2.png";

function PublicCardPage() {
  const { cardId } = useParams();
  const [card, setCard] = useState(null);
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const snap = await getDoc(doc(db, "businessCards", cardId));
        if (snap.exists()) {
          setCard({ id: snap.id, ...snap.data() });
        } else {
          setNotFound(true);
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

  const contactRows = [
    card.phone && { key: "call", label: card.phone, icon: Phone, href: formatPhoneLink(card.phone) },
    card.email && { key: "email", label: card.email, icon: Mail, href: formatEmailLink(card.email) },
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
        <div
          ref={cardRef}
          className="relative bg-white rounded-[20px] shadow-card overflow-hidden"
        >
          {hasBackground && (
            <>
              <img
                src={backgroundImage}
                alt=""
                crossOrigin="anonymous"
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
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
            <img src={pcgLogo} alt="Perfect Companion Group" className="relative h-9 mb-3 block" />
          </div>

          {/* Photo overlapping light zone and navy block */}
          <div className={`relative flex justify-center ${hasBackground ? "" : "bg-[#EEEEEC]"}`}>
            <div className="w-[158px] h-[158px] rounded-full bg-white p-[3px] -mb-[65px] relative z-10">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#C7CDD6]">
                {card.photoUrl ? (
                  <img src={card.photoUrl} alt={card.fullName} className="w-full h-full object-cover" />
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

            <h1 className="relative text-lg font-semibold text-white text-center pb-[2px]">
              {card.fullName}{card.nickname && ` (${card.nickname})`}
            </h1>
            <p className="relative text-[17px] font-semibold text-center pb-1" style={{ color: "#D9A441" }}>
              {card.jobTitle}
            </p>
            {card.company && (
              <p className="relative text-[16px] text-white/70 text-center pb-4">{card.company}</p>
            )}

            {card.bio && (
              <p className="relative text-xs text-white/75 italic text-center mb-4 leading-loose">
                {card.bio}
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
                    style={{ display: "table", width: "100%", height: "22px" }}
                  >
                    <span style={{ display: "table-cell", verticalAlign: "middle", width: "25px" }}>
                      <row.icon className="w-[15px] h-[15px] shrink-0" style={{ color: "#D9A441" }} />
                    </span>
                    <span className="text-[13px] text-white" style={{ display: "table-cell", verticalAlign: "middle", lineHeight: "20px", whiteSpace: "nowrap" }}>{row.label}</span>
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

            <div className="absolute bottom-3.5 right-3.5 bg-white rounded-xl p-2 shadow-lg">
              <QRCodeSVG value={publicUrl} size={56} />
            </div>
          </div>

          {/* Save Contact button */}
          <div className={`relative z-10 px-5 pb-5 ${hasBackground ? "" : "bg-white"}`}>
            <button
              onClick={() => createVCard(card)}
              className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-lg transition-opacity hover:opacity-90"
              style={{ background: "#D9A441", color: "#0B3D91" }}
            >
              <Download className="w-4 h-4" />
              Save Contact
            </button>
          </div>
        </div>

        <div className="px-0 mt-3">
          <button
            onClick={saveCardAsImage}
            className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-lg border border-border bg-white text-navy hover:bg-surface transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Save Card as Image
          </button>
        </div>

        <p className="text-center text-xs text-muted/70 mt-5">Powered by Smart Digital Card</p>
      </div>
    </div>
  );
}

export default PublicCardPage;
