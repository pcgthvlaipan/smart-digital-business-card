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
      lines.push(`PHOTO;ENCODING=b;TYPE=${imageType}:${base64Data}`);
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
