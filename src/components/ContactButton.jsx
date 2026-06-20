function ContactButton({ icon: Icon, label, href, onClick, className = "" }) {
  const content = (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-white hover:bg-surface hover:shadow-card transition-all cursor-pointer ${className}`}
    >
      {Icon && <Icon className="w-5 h-5 text-navy" />}
      <span className="text-sm font-medium text-ink">{label}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {content}
      </a>
    );
  }

  return <div onClick={onClick}>{content}</div>;
}

export default ContactButton;
