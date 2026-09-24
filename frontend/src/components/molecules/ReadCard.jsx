import KnowMore from "../atoms/KnowMore";

// "Read About" card. Title/text come from content.js and may contain <b>/<span>.
export default function ReadCard({ card, knowMore }) {
  return <div className="rcard">
    <img src={card.img} alt="" />
    <div><h4 dangerouslySetInnerHTML={{ __html: card.t }} /><p dangerouslySetInnerHTML={{ __html: card.p }} /><KnowMore label={knowMore} /></div>
  </div>;
}
