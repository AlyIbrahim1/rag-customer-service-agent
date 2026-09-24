import SourceList from "./SourceList";

// Tiny Markdown renderer from the design (bold, italic, code, links, lists).
// Text is HTML-escaped first, so only the tags added here can appear.
export const isArabic = (text) => /[؀-ۿ]/.test(text);
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function md(src) {
  const inline = (t) => t
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<i>$2</i>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  let html = "", list = null;
  for (const raw of esc(src.trim()).split(/\n/)) {
    const l = raw.trim(), ul = l.match(/^[-•*]\s+(.*)/), ol = l.match(/^\d+[.)]\s+(.*)/);
    if (ul || ol) {
      const tag = ul ? "ul" : "ol";
      if (list !== tag) { if (list) html += `</${list}>`; html += `<${tag}>`; list = tag; }
      html += `<li>${inline((ul || ol)[1])}</li>`;
    } else {
      if (list) { html += `</${list}>`; list = null; }
      if (l) html += `<p>${inline(l)}</p>`;
    }
  }
  if (list) html += `</${list}>`;
  return html;
}

export default function ChatBubbleMessage({ message, sourcesLabel, pageLabel, onOpenPdf }) {
  const isUser = message.role === "user";
  const html = isUser ? esc(message.content).replace(/\n/g, "<br>") : md(message.content);
  return <div className={`msg ${isUser ? "user" : "bot"}${message.error ? " err" : ""}`} dir={isArabic(message.content) ? "rtl" : "ltr"} role={message.error ? "alert" : undefined}>
    <div dangerouslySetInnerHTML={{ __html: html }} />
    {!isUser && <SourceList sources={message.sources || []} label={sourcesLabel} pageLabel={pageLabel} onOpenPdf={onOpenPdf} />}
  </div>;
}
