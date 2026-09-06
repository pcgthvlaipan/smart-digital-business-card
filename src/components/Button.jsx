function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl2 px-6 py-3 transition-all duration-200";

  const variants = {
    primary: "bg-navy text-white hover:bg-navy-light shadow-card hover:shadow-cardHover",
    // Dark-blue brand variant, used on the login and card-editor pages.
    brand: "bg-[#0B3D91] text-white hover:bg-[#0A3578] shadow-card hover:shadow-cardHover",
    accent: "bg-accent text-white hover:bg-accent-dark shadow-card hover:shadow-cardHover",
    outline: "border border-border text-navy bg-white hover:bg-surface",
    // Outline variant matching the "brand" dark-blue theme.
    outlineBrand: "border-2 border-[#9DB8E8] text-[#0B3D91] bg-white hover:bg-[#F0F5FF]",
    ghost: "text-navy hover:bg-surface",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
