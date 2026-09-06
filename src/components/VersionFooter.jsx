// The build date/commit come from vite.config.js's `define` - injected at
// build time, so this always reflects whenever the app was actually last
// deployed rather than a number someone has to remember to update by hand.
const buildDate = import.meta.env.BUILD_DATE ? new Date(import.meta.env.BUILD_DATE) : null;
const version = import.meta.env.APP_VERSION || "dev";

function VersionFooter({ className = "" }) {
  return (
    <p className={`text-[11px] text-muted/70 ${className}`}>
      v{version}
      {buildDate && ` · Updated ${buildDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`}
    </p>
  );
}

export default VersionFooter;
