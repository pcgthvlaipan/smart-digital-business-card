function InputField({ label, error, required = false, boxed = false, icon: Icon, className = "", ...props }) {
  const boxedBase =
    "w-full h-12 rounded-xl border-2 border-[#9DB8E8] bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-4 focus:ring-[#0B3D91]/10 focus:border-[#0B3D91] transition-colors";
  const defaultBase =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors";
  const paddingClasses = boxed ? (Icon ? "pl-11 pr-4" : "px-4") : "";

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-ink">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            aria-hidden="true"
          />
        )}
        <input
          className={`${boxed ? boxedBase : defaultBase} ${paddingClasses} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export default InputField;
