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

export function createVCard(card) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.fullName || ""}`,
    `ORG:${card.company || ""}`,
    `TITLE:${card.jobTitle || ""}`,
    card.phone ? `TEL;TYPE=CELL:${card.phone}` : "",
    card.email ? `EMAIL:${card.email}` : "",
    card.website ? `URL:${card.website}` : "",
  ];

  if (card.photoUrl && card.photoUrl.startsWith("data:image")) {
    const match = card.photoUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (match) {
      const imageType = match[1].toUpperCase();
      const base64Data = match[2];
      const photoLine = `PHOTO;ENCODING=b;TYPE=${imageType}:${base64Data}`;
      lines.push(foldLine(photoLine));
    }
  }

  lines.push("END:VCARD");

  const vcardContent = lines.filter(Boolean).join("\r\n");
  const blob = new Blob([vcardContent], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${card.fullName || "contact"}.vcf`;
  link.click();
  URL.revokeObjectURL(url);
}
