// Mirrors public/manifest.webmanifest as a plain object. Kept in sync by
// hand (there are only two places), so that a per-card start_url can be
// built synchronously (see PublicCardPage) instead of re-fetching the
// static file over the network on every card view.
export const baseManifest = {
  name: "Smart Digital Card",
  short_name: "Smart Card",
  description: "Your digital business card - share it with a link or QR code.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#F8FAFC",
  theme_color: "#0B3D91",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};
