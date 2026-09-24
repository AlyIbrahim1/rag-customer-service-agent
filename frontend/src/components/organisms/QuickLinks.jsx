import ArrowBadge from "../atoms/ArrowBadge";
import { IMG } from "../../content";

const ICONS = [IMG.q1, IMG.q2, IMG.q3, IMG.q4];

// Four shortcut links under the hero.
export default function QuickLinks({ t }) {
  return <section className="quick"><div className="container">
    {t.quick.map((label, i) => <a key={label} href="#"><img src={ICONS[i]} alt="" /><span>{label} <ArrowBadge /></span></a>)}
  </div></section>;
}
