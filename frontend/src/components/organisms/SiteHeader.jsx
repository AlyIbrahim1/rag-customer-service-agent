import { useState } from "react";
import Icon from "../atoms/Icon";
import NavItem from "../molecules/NavItem";

// Nav links scroll their section into the space below the sticky header:
// centred when it fits, otherwise starting just below the header so the
// section title stays visible.
function scrollToSection(event) {
  const href = event.currentTarget.getAttribute("href");
  const section = href.length > 1 && document.querySelector(href);
  if (!section) return;
  event.preventDefault();
  const header = document.querySelector(".header").offsetHeight;
  const { top, height } = section.getBoundingClientRect();
  const gap = Math.max((innerHeight - header - height) / 2, 24);
  window.scrollTo({ top: scrollY + top - header - gap, behavior: "smooth" });
}

// Sticky header with logo, mega-menu nav, icons, and a mobile drawer.
export default function SiteHeader({ t, onOpenPdf }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return <>
    <header className="header">
      <div className="container">
        <button className="burger" aria-label="Menu" onClick={() => setDrawerOpen(true)}><Icon name="burger" className="ico" size={26} /></button>
        <a href="#" className="logo" aria-label="e& Egypt"><img src="/icons/logo.svg" alt="e& Egypt" /></a>
        <ul className="nav">{t.nav.map((item) => <NavItem key={item.t} item={item} onNavigate={scrollToSection} onOpenPdf={onOpenPdf} />)}</ul>
        <div className="hdr-right">
          <a href="#" className="ico-only" aria-label="Stores"><Icon name="pin" className="ico" /></a>
          <a href="#" aria-label="Cart"><Icon name="cart" className="ico flip" /></a>
          <a href="#" className="btn-profile" aria-label={t.signin} title={t.signin}><Icon name="profile" strokeWidth="1.8" /></a>
        </div>
      </div>
    </header>
    <div className={`drawer${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(false)}>
      <nav>{t.nav.map((item) => <a key={item.t} href={item.href} onClick={scrollToSection}>{item.t}</a>)}</nav>
    </div>
  </>;
}
