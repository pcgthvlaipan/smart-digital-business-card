function CardPreview({ card }) {
  if (!card) return null;

  const fullName = card.fullName || card.full_name || "Your Name";
  const jobTitle = card.jobTitle || card.job_title || "Your title";
  const company = card.company || card.company_name || "Your company";
  const bio = card.bio || "A thoughtful introduction, made easy to share.";
  const photoUrl = card.photoUrl || card.photo_url;
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <article className="business-card-preview" aria-label={`${fullName} digital business card`}>
      <div className="business-card-topline">
        <span className="business-card-brand">SMART / DIGITAL</span>
        <span className="business-card-index">01</span>
      </div>

      <div className="business-card-portrait">
        {photoUrl ? (
          <img src={photoUrl} alt={fullName} />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>

      <div className="business-card-identity">
        <h3>{fullName}</h3>
        <p className="business-card-role">{jobTitle}</p>
        <p className="business-card-company">{company}</p>
      </div>

      <p className="business-card-bio">{bio}</p>

      <div className="business-card-footer">
        <span className="business-card-link">smartcard / profile</span>
        <span className="business-card-arrow" aria-hidden="true">↗</span>
      </div>
    </article>
  );
}

export default CardPreview;
