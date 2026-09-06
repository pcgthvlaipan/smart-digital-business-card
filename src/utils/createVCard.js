import { formatLineUrl } from "./formatLinks";

function foldLine(line, maxLength = 75) {
  if (line.length <= maxLength) return line;
  const chunks = [];
  let i = 0;
  while (i < line.length) {
    const chunkSize = i === 0 ? maxLength : maxLength - 1;
    chunks.push(line.slice(i, i + chunkSize));
    i += chunkSize;
  }
  return chunks.map((chunk, idx) => (idx === 0 ? chunk : " " + chunk)).join("\r\n");
}

// vCard structural characters (backslash, semicolon, comma) and newlines
// inside a VALUE must be escaped, or a name/address/note containing one
// would corrupt the surrounding fields when a phone parses it.
function esc(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function waUrl(number) {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}`;
}

// card.photoUrl is normally a remote Supabase Storage URL, not a data URI -
// fetch and inline it as base64 so phones that don't follow a remote PHOTO
// URL still actually get the picture on the imported contact.
async function resolvePhotoDataUrl(photoUrl) {
  if (!photoUrl) return null;
  if (photoUrl.startsWith("data:image")) return photoUrl;

  try {
    const res = await fetch(photoUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Failed to embed contact photo in vCard:", err);
    return null;
  }
}

export async function createVCard(card) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:2.1",
    `N:${esc(card.fullName || "")};;;;`,
    `FN:${esc(card.fullName || "")}`,
    card.nickname ? `NICKNAME:${esc(card.nickname)}` : "",
    card.department ? `ORG:${esc(card.company || "")};${esc(card.department)}` : `ORG:${esc(card.company || "")}`,
    `TITLE:${esc(card.jobTitle || "")}`,
    card.phone ? `TEL;CELL:${esc(card.phone)}` : "",
    card.email ? `EMAIL;INTERNET:${esc(card.email)}` : "",
    card.email2 ? `EMAIL;INTERNET:${esc(card.email2)}` : "",
    // Free-text address, not broken into street/city/etc components - the
    // "extended address" slot is the conventional place to put it whole.
    card.address ? `ADR;WORK:;${esc(card.address)};;;;;` : "",
    card.website ? `URL:${esc(card.website)}` : "",
    card.facebookUrl ? `URL:${esc(card.facebookUrl)}` : "",
    card.instagramUrl ? `URL:${esc(card.instagramUrl)}` : "",
    card.linkedinUrl ? `URL:${esc(card.linkedinUrl)}` : "",
    card.tiktokUrl ? `URL:${esc(card.tiktokUrl)}` : "",
    card.youtubeUrl ? `URL:${esc(card.youtubeUrl)}` : "",
    card.googleMapsUrl ? `URL:${esc(card.googleMapsUrl)}` : "",
    card.whatsappNumber ? `URL:${esc(waUrl(card.whatsappNumber))}` : "",
    card.lineUrl || card.lineId ? `URL:${esc(formatLineUrl(card.lineId, card.lineUrl))}` : "",
  ];

  // WeChat has no public profile URL to link to, so it goes in NOTE instead,
  // alongside the bio (both optional, joined only if present). Each part is
  // escaped on its own, then joined with a literal \n - escaping the already-
  // joined string would double-escape that separator's own backslash.
  const noteParts = [card.bio, card.wechatId ? `WeChat: ${card.wechatId}` : ""].filter(Boolean).map(esc);
  if (noteParts.length > 0) {
    lines.push(foldLine(`NOTE:${noteParts.join("\\n")}`));
  }

  const photoDataUrl = await resolvePhotoDataUrl(card.photoUrl);
  if (photoDataUrl) {
    const match = photoDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (match) {
      const imageType = match[1].toUpperCase();
      const base64Data = match[2];
      const photoLine = `PHOTO;ENCODING=BASE64;TYPE=${imageType}:${base64Data}`;
      lines.push(foldLine(photoLine));
      lines.push("");
    }
  }

  lines.push("END:VCARD");

  const vcardContent = lines
    .filter((l, i) => l !== "" || i === lines.length - 2)
    .join("\r\n");
  const blob = new Blob([vcardContent], { type: "text/vcard" });
  const fileName = `${card.fullName || "contact"}.vcf`;

  // iOS Safari doesn't reliably support the <a download> attribute for blob
  // URLs (same issue as the "Save Card as Image" button below), so use the
  // native share sheet there. Android and desktop download directly.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS && navigator.canShare) {
    const file = new File([blob], fileName, { type: "text/vcard" });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (shareErr) {
        if (shareErr.name !== "AbortError") {
          console.error("Failed to share vCard:", shareErr);
        } else {
          return;
        }
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
