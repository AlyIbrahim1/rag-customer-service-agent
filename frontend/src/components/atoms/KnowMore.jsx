import ArrowBadge from "./ArrowBadge";

// Red "Know More ↗" link used on plan, read-about and service cards.
export default function KnowMore({ label, ...props }) {
  return <a href="#" className="know" {...props}>{label} <ArrowBadge /></a>;
}
