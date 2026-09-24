import { useLayoutEffect, useRef } from "react";
import Icon from "../atoms/Icon";

// Chat input: Enter sends, Shift+Enter adds a line, grows up to 110px.
export default function ChatComposer({ value, isLoading, placeholder, messageLabel, sendLabel, inputRef, onChange, onSend }) {
  const ownRef = useRef(null);
  const textareaRef = inputRef || ownRef;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 110)}px`;
    // Only show a scrollbar once the text is taller than the 110px maximum.
    textarea.style.overflowY = textarea.scrollHeight > 110 ? "auto" : "hidden";
  }, [value, textareaRef]);

  function submit(event) {
    event.preventDefault();
    onSend(value);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend(value);
    }
  }

  return <form className="chat-foot" onSubmit={submit}>
    <textarea ref={textareaRef} rows="1" dir="auto" value={value} placeholder={placeholder} aria-label={messageLabel} onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown} />
    <button className="send" type="submit" aria-label={sendLabel} disabled={!value.trim() || isLoading}><Icon name="send" width="20" height="20" stroke="#fff" strokeWidth="2.1" /></button>
  </form>;
}
