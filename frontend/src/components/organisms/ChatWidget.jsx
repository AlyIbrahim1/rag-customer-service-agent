import { useEffect, useRef, useState } from "react";
import Icon from "../atoms/Icon";
import ChatBubbleMessage from "../molecules/ChatBubbleMessage";
import ChatComposer from "../molecules/ChatComposer";
import SuggestionChips from "../molecules/SuggestionChips";

// Backend sources arrive as objects or strings like "Emerald.pdf (p. 3)".
function normalizeSource(source) {
  if (typeof source === "object" && source) return { title: source.title || source.name || "e& product guide", page: source.page };
  const match = String(source).match(/^(.*?)(?:\s*\(p\.?\s*(\d+)\))?$/i);
  return { title: match?.[1].replace(/\.pdf$/i, "") || "e& product guide", page: match?.[2] ? Number(match[2]) : undefined };
}

// Floating chat bubble (bottom-right; bottom-left in Arabic) that talks to /api/chat.
export default function ChatWidget({ t, request, onOpenPdf }) {
  const [isOpen, setIsOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [seen, setSeen] = useState(false);
  const [hintHidden, setHintHidden] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chips, setChips] = useState("default"); // "default" | "none" | { retry: question }
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const busyRef = useRef(false);

  function open(state = true) {
    setIsOpen(state);
    setSeen(true);
    setHintHidden(true);
    if (state) {
      setStarted(true);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }

  function reset() {
    setMessages([]);
    setChips("default");
    open(true);
  }

  async function ask(text) {
    const question = (text || "").trim();
    if (!question || busyRef.current) return;
    // Skip failed turns (the error bubble and the question before it).
    const history = messages.filter((message, i) => !message.error && !messages[i + 1]?.error).map(({ role, content }) => ({ role, content }));
    busyRef.current = true; setBusy(true);
    setDraft(""); setChips("none");
    setMessages((items) => [...items, { role: "user", content: question }]);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, history }) });
      const result = await response.json();
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const noMatch = result.outcome === "no_match";
      const sources = result.outcome === "grounded" ? (result.sources || []).map(normalizeSource) : [];
      setMessages((items) => [...items, { role: "assistant", content: noMatch ? t.noMatch : result.answer || t.empty, sources }]);
    } catch (error) {
      console.error("[e& chat]", error);
      setMessages((items) => [...items, { role: "assistant", content: t.error, error: true }]);
      setChips({ retry: question });
    } finally {
      busyRef.current = false; setBusy(false);
      inputRef.current?.focus();
    }
  }

  // "Ask the assistant" from the PDF viewer.
  useEffect(() => {
    if (!request) return;
    open(true);
    ask(request.text);
  }, [request]);

  useEffect(() => {
    const timer = setTimeout(() => setHintHidden(true), 12000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event) => { if (event.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, busy, started]);

  const chipItems = !started ? [] : chips === "default" ? t.suggestions : chips === "none" ? [] : [t.retry];
  const pickChip = chips.retry ? () => ask(chips.retry) : ask;

  return <>
    <div className={`chat-hint${hintHidden ? " hide" : ""}`} onClick={() => open(true)}>{t.hint}</div>
    <button className={`chat-fab${isOpen ? " open" : ""}${seen ? " seen" : ""}`} aria-expanded={isOpen} aria-controls="chat" aria-label={t.aOpen} onClick={() => open(!isOpen)}>
      <span className="ping" />
      <Icon name="chat" className="i-chat" stroke="#fff" />
      <Icon name="x" className="i-close" stroke="#fff" strokeWidth="2.2" />
    </button>
    <div className={`chat${isOpen ? " open" : ""}`} id="chat" role="dialog" aria-label={t.botName}>
      <div className="chat-head">
        <div className="av"><img src="/icons/logo.svg" alt="" /></div>
        <div className="t"><h4>{t.botName}</h4><small>{t.status}</small></div>
        <button aria-label={t.aReset} title={t.aReset} onClick={reset}><Icon name="reset" className="ico" size={18} /></button>
        <button aria-label={t.aClose} title={t.aClose} onClick={() => open(false)}><Icon name="chevron" className="ico" size={20} /></button>
      </div>
      <div className="chat-body" ref={bodyRef} aria-live="polite">
        {started && <ChatBubbleMessage message={{ role: "assistant", content: t.welcome }} />}
        {messages.map((message, i) => <ChatBubbleMessage key={i} message={message} sourcesLabel={t.sources} pageLabel={t.page} onOpenPdf={onOpenPdf} />)}
        {busy && <div className="msg bot typing"><i /><i /><i /></div>}
      </div>
      <SuggestionChips items={chipItems} onPick={pickChip} />
      <ChatComposer value={draft} isLoading={busy} placeholder={t.placeholder} messageLabel={t.aMsg} sendLabel={t.aSend} inputRef={inputRef} onChange={setDraft} onSend={ask} />
      <div className="chat-note">{t.chatNote}</div>
    </div>
  </>;
}
