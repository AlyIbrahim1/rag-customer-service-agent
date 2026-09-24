import SectionTitle from "../atoms/SectionTitle";
import PlanCard from "../molecules/PlanCard";

export default function PlansSection({ t, formatNumber, onOpenPdf }) {
  return <section className="block" id="plans"><div className="container">
    <SectionTitle parts={t.titles.plans} />
    <div className="plans">{t.plans.map((plan, i) => <PlanCard key={plan.name} plan={plan} t={t} formatNumber={formatNumber} onOpen={() => onOpenPdf(i)} />)}</div>
  </div></section>;
}
