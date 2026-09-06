export function formatWhatsApp(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${cleaned}`;
}

export function formatLineUrl(lineId, lineUrl) {
  if (lineUrl) return lineUrl;
  if (lineId) {
    // LINE's official "add friend by ID" link requires a leading ~ for a
    // personal LINE ID (as opposed to @ for an Official Account) - without
    // it, LINE resolves the URL as looking for a different, literal ID and
    // shows "User not found" even though the ID itself is correct.
    const trimmed = lineId.trim().replace(/^[~@]/, "");
    return `https://line.me/ti/p/~${trimmed}`;
  }
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
