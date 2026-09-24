import MenuLink from "../atoms/MenuLink";

// Header nav link with its hover mega-menu.
export default function NavItem({ item, onNavigate, onOpenPdf }) {
  return <li>
    <a href={item.href} onClick={onNavigate}>{item.t}</a>
    {item.items && <div className={`mega${item.sm ? " sm" : ""}`}>
      <h6>{item.h}</h6>
      {item.items.map((label) => <MenuLink key={label} label={label} onOpenPdf={onOpenPdf} />)}
    </div>}
  </li>;
}
