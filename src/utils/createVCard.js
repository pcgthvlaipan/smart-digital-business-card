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
    "END:VCARD",
  ].filter(Boolean);

  const blob = new Blob([lines.join("\n")], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${card.fullName || "contact"}.vcf`;
  link.click();
  URL.revokeObjectURL(url);
}
