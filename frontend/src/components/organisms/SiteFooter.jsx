import MenuLink from "../atoms/MenuLink";
import { IMG } from "../../content";

const SOCIAL = ["facebook", "x", "linkedin", "youtube", "instagram"];
const SOCIAL_NAMES = { facebook: "Facebook", x: "X", linkedin: "LinkedIn", youtube: "YouTube", instagram: "Instagram" };

export default function SiteFooter({ t, onOpenPdf }) {
  return <footer>
    <div className="container fgrid">
      <div className="flogo"><img src={IMG.flogo} alt="e& Egypt" /></div>
      {t.footer.map((column) => <div key={column.h}><h5>{column.h}</h5><ul>{column.items.map((label) => <li key={label}><MenuLink label={label} onOpenPdf={onOpenPdf} /></li>)}</ul></div>)}
      <div />
    </div>
    <div className="copy"><div className="container">
      <span>{t.copyright}</span>
      <a href="#">{t.privacy}</a><a href="#">{t.terms}</a><span style={{ color: "var(--text-2)" }}>V 1.10.94</span>
      <div className="social"><span>{t.follow}</span>
        {SOCIAL.map((name) => <img key={name} src={`/icons/social/${name}.png`} alt={SOCIAL_NAMES[name]} />)}
      </div>
    </div></div>
  </footer>;
}
