import { sourcePdfTarget } from "../../content";

// One-based citations open the matching page in the site's PDF dialog.
export default function SourceList({ sources, label, pageLabel, onOpenPdf }) {
  if (!sources.length) return null;
  return <div className="msg-sources" dir="ltr">
    <small>{label}</small>
    <ol>{sources.map((source) => {
      const target = sourcePdfTarget(source);
      const page = Number(source.page);
      const text = <>{source.title}{Number.isInteger(page) && page > 0 && ` — ${pageLabel} ${page}`}</>;
      return <li key={`${source.title}-${source.page ?? ""}`}>
        {target ? <button type="button" onClick={() => onOpenPdf(target.index, target.page)}>{text}</button> : <span>{text}</span>}
      </li>;
    })}</ol>
  </div>;
}
