export function formatWhatsApp(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${cleaned}`;
}

export function formatLineUrl(lineId, lineUrl) {
  if (lineUrl) return lineUrl;
  if (lineId) return `https://line.me/ti/p/${lineId}`;
  return "";
}

export function formatPhoneLink(phone) {
  if (!phone) return "";
  return `tel:${phone}`;
}

export function formatEmailLink(email) {
  if (!email) return "";
  return `mailto:${email}`;
}

export function isValidUrl(url) {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
