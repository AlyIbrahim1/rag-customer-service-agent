import SectionTitle from "../atoms/SectionTitle";
import ReadCard from "../molecules/ReadCard";

export default function ReadAboutSection({ t }) {
  return <section className="block"><div className="container">
    <SectionTitle parts={t.titles.read} />
    <div className="read">{t.read.map((card) => <ReadCard key={card.img} card={card} knowMore={t.knowMore} />)}</div>
  </div></section>;
}
