import { useRef } from "react";
import { Phone, Mail, Globe, MapPin } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatPhoneLink, formatEmailLink, formatLineUrl } from "../utils/formatLinks";
import { WhatsAppIcon, LineIcon, WeChatIcon } from "./icons/BrandIcons";
import pcgLogo from "../assets/PCGlogo.png";
import defaultWallpaper from "../assets/wall2.png";

// An email has no spaces for the browser to wrap at naturally, so a long one
// needs a break hint - <wbr> after "@" specifically, so a two-line email
// always splits at "localpart@" / "domain" rather than break-all's arbitrary
// mid-word cut wherever it happens to run out of room.
function withLineBreakHints(text) {
  const parts = String(text).split("@");
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && (
        <>
          @<wbr />
        </>
      )}
    </span>
  ));
}

// The card face itself - logo/language toggle, photo/name/title/company on
// the background image, and the white details panel (contact icons,
// address, bio, social + QR). This is the one place that layout is written,
// so the public card page and the dashboard's "what your card looks like"
// preview can never drift out of sync with each other again.
function CardFace({ card, lang, onLangChange, isLightBg, cardRef, photoRef, publicUrl, onWeChatClick }) {
  const fallbackCardRef = useRef(null);
  const fallbackPhotoRef = useRef(null);
  const resolvedCardRef = cardRef || fallbackCardRef;
  const resolvedPhotoRef = photoRef || fallbackPhotoRef;

  const hasThai = Boolean(card.fullNameTh || card.jobTitleTh || card.companyTh || card.bioTh);
  const displayName = (lang === "th" && card.fullNameTh) || card.fullName;
  const displayJobTitle = (lang === "th" && card.jobTitleTh) || card.jobTitle;
  const displayCompany = (lang === "th" && card.companyTh) || card.company;
  const displayBio = (lang === "th" && card.bioTh) || card.bio;

  const textColor = isLightBg ? "#0B3D91" : "#FFFFFF";
  const textColorMuted = isLightBg ? "rgba(11,61,145,0.72)" : "rgba(255,255,255,0.7)";
  const backgroundImage = card.backgroundUrl || defaultWallpaper;

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
    (card.lineId || card.lineUrl) && { key: "line", href: formatLineUrl(card.lineId, card.lineUrl), bg: "#06C755", type: "line" },
    card.wechatId && { key: "wechat", href: null, bg: "#2DC100", type: "wechat" },
  ].filter(Boolean);

  return (
    <div ref={resolvedCardRef} className="relative bg-white overflow-hidden">
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

      {/* Simple header row: logo left, language toggle right. Same flex row
          means they're always at the same level - no manual offset math
          needed to keep them aligned. */}
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
              onClick={() => onLangChange?.("th")}
              className={`px-3 py-1.5 transition-colors ${lang === "th" ? "bg-navy text-white" : "bg-white text-navy"}`}
            >
              TH
            </button>
            <button
              type="button"
              onClick={() => onLangChange?.("en")}
              className={`px-3 py-1.5 transition-colors ${lang === "en" ? "bg-navy text-white" : "bg-white text-navy"}`}
            >
              EN
            </button>
          </div>
        )}
      </div>

      {/* Photo, name, title, company - sits directly on the background
          image/wallpaper, so text color adapts to it (isLightBg). */}
      <div className="relative flex flex-col items-center px-5 pt-5 pb-7">
        <div className="w-[161px] h-[161px] rounded-full bg-white p-[4px] relative shadow-[0_12px_30px_rgba(23,32,51,0.22)]">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#C7CDD6]">
            {card.photoUrl ? (
              <div
                ref={resolvedPhotoRef}
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
      <div className="relative bg-white rounded-[28px] -mt-2 mx-3 mb-3 px-5 pt-5 pb-5 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
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
                  className="rounded-full flex items-center justify-center shrink-0"
                  style={
                    action.key === "call"
                      ? { background: action.bg, width: "46px", height: "46px" }
                      : { background: action.bg, width: "40px", height: "40px" }
                  }
                >
                  <action.icon className={action.key === "call" ? "w-[18px] h-[18px] text-white" : "w-4 h-4 text-white"} />
                </a>
              ))}
            </div>

            {/* Detail lines: the actual values, underneath the icon row.
                Plain HTML that wraps rather than a fixed-width SVG - a
                long email needs to always be fully visible, which
                matters more than the export's icon/text alignment. */}
            <div className="flex flex-col gap-1.5">
              {quickActions.map((action) => (
                <a
                  key={action.key}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className="flex items-start gap-2"
                >
                  <action.icon className="w-3.5 h-3.5 shrink-0 mt-0.5 detail-icon" style={{ color: action.bg }} />
                  <span className="text-[13px] font-medium text-slate-700 break-words leading-snug">{withLineBreakHints(action.label)}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {card.address && (
          <div className="flex items-start gap-2 pt-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 detail-icon" style={{ color: "#7C3AED" }} />
            <span className="text-[13px] text-slate-500 leading-snug">{card.address}</span>
          </div>
        )}

        {displayBio && (
          <div className="pt-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0E7490" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" /></svg>
              <span className="text-[13px] font-bold text-navy">About Me</span>
            </div>
            <p className="text-[12.5px] text-slate-500 leading-relaxed">{displayBio}</p>
          </div>
        )}

        <div className="pt-4">
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
                      <button onClick={onWeChatClick} type="button" className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: s.bg }}>
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
  );
}

export default CardFace;
