import SectionTitle from "../atoms/SectionTitle";

const CARDS = ["/images/sections/twist-music.png", "/images/sections/twist-sports.png"];

export default function EntertainmentSection({ t }) {
  return <section className="block" id="entertainment"><div className="container">
    <SectionTitle parts={t.titles.ent} />
    <div className="ent">{CARDS.map((src) => <a key={src} href="#" className="ecard" style={{ backgroundImage: `url('${src}')` }}><span className="know">{t.knowMoreArrow}</span></a>)}</div>
  </div></section>;
}
