// Page skeleton of the e& homepage; each slot is filled by an organism.
export default function HomeTemplate({ topBar, header, hero, quickLinks, sections, appStrip, footer, overlays }) {
  return <>
    {topBar}
    {header}
    <main>
      {hero}
      {quickLinks}
      {sections}
    </main>
    {appStrip}
    {footer}
    {overlays}
  </>;
}
