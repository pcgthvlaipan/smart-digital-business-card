import { useEffect, useState } from "react";
import { Share, X, Download } from "lucide-react";

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isStandalone() {
  // Already installed/running as an app - true on Android/desktop Chrome
  // once installed, and the only way iOS Safari exposes this (there's no
  // display-mode media query support there).
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

// A small "install this as an app" nudge for whoever opens a shared card
// link. There is no way for a page to add itself to a phone's home screen
// silently on either platform - Android/Chrome exposes an install prompt a
// page can trigger from a tap, iOS Safari exposes nothing programmatic at
// all, so the best available fallback there is telling people the manual
// Share -> "Add to Home Screen" step.
function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  // iOS never fires beforeinstallprompt, and this never changes for the
  // life of the page, so it's computed once up front rather than set from
  // inside the effect below.
  const [showIosHint] = useState(() => !isStandalone() && isIos());
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem("installPromptDismissed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isStandalone()) return;
    const handleBeforeInstallPrompt = (e) => {
      // Stops Chrome's own delayed mini-infobar so our banner is the only
      // prompt shown, then keeps the event to fire on our own button tap.
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("installPromptDismissed", "1");
    } catch {
      // Private browsing or storage disabled - the banner just re-shows
      // next visit, which is a minor inconvenience, not worth erroring on.
    }
  };

  const handleInstall = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  if (dismissed || isStandalone() || (!installEvent && !showIosHint)) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center px-4 pb-4">
      <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.25)] border border-[#E5E7EB] p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
          <img src="/icon-192.png" alt="" className="w-full h-full object-cover" />
        </div>
        {installEvent ? (
          <>
            <p className="flex-1 text-[13px] font-medium text-slate-700">
              Install this card for quick access from your home screen.
            </p>
            <button
              onClick={handleInstall}
              className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-white px-3.5 py-2 rounded-full"
              style={{ background: "#0B3D91" }}
            >
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
          </>
        ) : (
          <p className="flex-1 text-[13px] font-medium text-slate-700">
            Tap <Share className="w-3.5 h-3.5 inline -mt-0.5" style={{ color: "#0B3D91" }} /> then{" "}
            <strong>"Add to Home Screen"</strong> to save this to your home screen.
          </p>
        )}
        <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default InstallPrompt;
