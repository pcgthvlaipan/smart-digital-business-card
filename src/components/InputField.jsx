function InputField({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-ink">{label}</label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-xl border border-border bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export default InputField;
