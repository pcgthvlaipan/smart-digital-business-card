import { useRef, useState } from "react";
import { dbRowToCard } from "../utils/cardData";
import { useIsLightBackground } from "../hooks/useBackgroundBrightness";
import defaultWallpaper from "../assets/wall2.png";
import CardFace from "./CardFace";

// Same CardFace the public card page renders, given the dashboard's own
// (raw, snake_case) card row - so "what your card looks like" on the
// dashboard is never a different design from the real, shareable card.
function CardPreview({ card: rawRow }) {
  const [lang, setLang] = useState("th");
  const cardRef = useRef(null);
  const photoRef = useRef(null);
  // Hooks below must run every render regardless of rawRow, so the null
  // check happens after them, not before.
  const card = rawRow ? dbRowToCard(rawRow) : null;
  const isLightBg = useIsLightBackground(card?.backgroundUrl || defaultWallpaper);

  if (!card) return null;
  const publicUrl = `${window.location.origin}/card/${card.id}`;

  const copyWeChat = () => {
    navigator.clipboard.writeText(card.wechatId);
    alert(`WeChat ID copied: ${card.wechatId}`);
  };

  return (
    <div className="bg-[#F1F5F9] rounded-[20px] shadow-card overflow-hidden">
      <CardFace
        card={card}
        lang={lang}
        onLangChange={setLang}
        isLightBg={isLightBg}
        cardRef={cardRef}
        photoRef={photoRef}
        publicUrl={publicUrl}
        onWeChatClick={copyWeChat}
      />
    </div>
  );
}

export default CardPreview;
