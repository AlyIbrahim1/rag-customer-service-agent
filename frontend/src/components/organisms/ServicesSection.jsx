import SectionTitle from "../atoms/SectionTitle";
import ServiceCard from "../molecules/ServiceCard";

export default function ServicesSection({ t }) {
  return <section className="block" id="services"><div className="container">
    <SectionTitle parts={t.titles.svc} />
    <div className="svc">{t.svc.map((card) => <ServiceCard key={card.t} card={card} knowMore={t.knowMore} />)}</div>
  </div></section>;
}
