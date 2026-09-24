import Icon from "../atoms/Icon";

export default function EShopBanner({ t }) {
  return <section className="block" id="shop"><div className="container">
    <div className="eshop">
      <div className="bgimg" />
      <img src="/icons/eshop-logo.png" alt="e-Shop" />
      <h3>{t.eshopTitle}</h3>
      <p dangerouslySetInnerHTML={{ __html: t.eshopText }} />
      <a href="#" className="shop"><span>{t.shopNow}</span> <Icon name="arrow" stroke="#fff" strokeWidth="2.4" strokeLinecap="butt" strokeLinejoin="miter" /></a>
    </div>
  </div></section>;
}
