function CardPreview({ card }) {
  if (!card) return null;

  return (
    <div className="bg-white rounded-xl2 shadow-card p-6 max-w-sm mx-auto text-center">
      <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border border-border bg-surface">
        {card.photoUrl ? (
          <img src={card.photoUrl} alt={card.fullName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">
            No photo
          </div>
        )}
      </div>
      <h3 className="text-lg font-bold text-navy">{card.fullName}</h3>
      <p className="text-sm text-muted">{card.jobTitle}</p>
      <p className="text-sm text-muted">{card.company}</p>
      {card.bio && <p className="text-xs text-ink mt-3">{card.bio}</p>}
    </div>
  );
}

export default CardPreview;
