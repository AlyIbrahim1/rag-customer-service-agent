import { useLayoutEffect, useRef } from "react";
import IconButton from "../atoms/IconButton";

export default function ChatComposer({ value, isLoading, onChange, onSend }) {
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  function submit(event) {
    event.preventDefault();
    onSend();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return <form className="chat-composer" onSubmit={submit}>
    <label className="sr-only" htmlFor="chat-question">Ask e& Egypt Assistant a question</label>
    <textarea ref={textareaRef} id="chat-question" value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about e& plans and services." rows="1" aria-describedby="composer-help composer-safety" disabled={isLoading} />
    <IconButton className="chat-composer__send" label="Send message" disabled={!value.trim() || isLoading}>↑</IconButton>
    <span className="chat-composer__hint" id="composer-help">Enter to send · Shift+Enter for a new line</span>
  </form>;
}
