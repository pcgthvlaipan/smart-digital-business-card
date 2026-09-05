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

export async function createVCard(card) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:2.1",
    `N:${card.fullName || ""};;;;`,
    `FN:${card.fullName || ""}`,
    `ORG:${card.company || ""}`,
    `TITLE:${card.jobTitle || ""}`,
    card.phone ? `TEL;CELL:${card.phone}` : "",
    card.email ? `EMAIL;INTERNET:${card.email}` : "",
    card.website ? `URL:${card.website}` : "",
  ];

  if (card.photoUrl && card.photoUrl.startsWith("data:image")) {
    const match = card.photoUrl.match(/^data:image\/(\w+);base64,(.+)$/);
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
