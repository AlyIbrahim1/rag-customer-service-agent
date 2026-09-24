import Icon from "../atoms/Icon";

// Thin bar above the header: Consumer/Business, Stores, language switch.
export default function TopBar({ t, lang, onToggleLang }) {
  return <div className="topbar">
    <div className="container">
      <div className="seg"><a href="#" className="active">{t.consumer}</a><a href="#">{t.business}</a></div>
      <div className="util">
        <a href="#"><Icon name="pin" className="ico" /><span className="lbl">{t.stores}</span></a>
        <button type="button" aria-label={lang === "en" ? "التبديل إلى العربية" : "Switch to English"} onClick={onToggleLang}><Icon name="globe" className="ico" /><span className={t.langLabelClass}>{t.langLabel}</span></button>
      </div>
    </div>
  </div>;
}
