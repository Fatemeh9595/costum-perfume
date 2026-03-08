import type { CSSProperties } from "react";
import "./PerfumeCard.css";

type PerfumeCardProps = {
  imageSrc: string;
  name: string;
  description: string;
  price: string;
  revealDelayMs?: number;
  onBuy?: () => void;
};

function PerfumeCard({ imageSrc, name, description, price, revealDelayMs = 0, onBuy }: PerfumeCardProps) {
  return (
    <article
      className="perfume-card"
      style={{ "--reveal-delay": `${revealDelayMs}ms` } as CSSProperties}
      data-reveal-card
    >
      <img src={imageSrc} alt={name} className="perfume-card-image" loading="lazy" />
      <div className="perfume-card-body">
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="perfume-card-footer">
          <span className="perfume-card-price">{price}</span>
          <button type="button" className="perfume-card-buy" onClick={onBuy}>
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

export default PerfumeCard;
