import KnowMore from "../atoms/KnowMore";

// One plan: image, name, "Know More", starting price, description. All open the plan PDF.
export default function PlanCard({ plan, t, formatNumber, onOpen }) {
  const open = (event) => { event.preventDefault(); onOpen(); };
  return <article className="plan">
    <button type="button" className="img" aria-label={t.pdf.open(plan.name)} onClick={open}><img src={plan.img} alt="" loading="lazy" /></button>
    <div className="hd"><h3><button type="button" onClick={open}>{plan.name}</button></h3><KnowMore label={t.knowMore} onClick={open} /></div>
    <div className="from">{t.from}</div>
    <div className="price"><b>{formatNumber(plan.price)}</b>{t.perMonth}</div>
    <p>{plan.desc}</p>
  </article>;
}
