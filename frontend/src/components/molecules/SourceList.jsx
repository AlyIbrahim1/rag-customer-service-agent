export default function SourceList({ sources }) {
  if (!sources.length) return null;
  return <section className="source-list" aria-label="Sources used">
    <p>Sources used</p>
    <ul>{sources.map((source) => {
      const page = Number(source.page);
      const pageFragment = Number.isInteger(page) && page > 0 ? `#page=${page}` : "";
      const label = `${source.title}${pageFragment ? ` — page ${page}` : ""}`;
      return <li key={`${source.title}-${source.page ?? ""}`}><a href={`/api/sources/${encodeURIComponent(source.title)}${pageFragment}`} target="_blank" rel="noreferrer" aria-label={`Open ${label} in a new tab`}>{label}</a></li>;
    })}</ul>
  </section>;
}
