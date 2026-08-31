const LOGO = "/e&-logo-1.png";

export default function BrandMark({ decorative = false, label = "e& Egypt" }) {
  return <img className="brand-mark" src={LOGO} alt={decorative ? "" : label} aria-hidden={decorative || undefined} />;
}
