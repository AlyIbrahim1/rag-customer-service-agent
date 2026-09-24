import KnowMore from "../atoms/KnowMore";

// Service card; "wide" cards (e& money) show an image beside the text.
export default function ServiceCard({ card, knowMore }) {
  const text = <><h4 dangerouslySetInnerHTML={{ __html: card.t }} /><p dangerouslySetInnerHTML={{ __html: card.p }} /><KnowMore label={knowMore} /></>;
  return card.wide
    ? <div className="scard wide"><div className="txt">{text}</div><img src={card.img} alt="" /></div>
    : <div className="scard">{text}</div>;
}
