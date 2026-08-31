import { useEffect, useLayoutEffect, useRef } from "react";
import Button from "../atoms/Button";
import ChatMessage from "./ChatMessage";

const BOTTOM_THRESHOLD = 96;

export default function ConversationThread({ messages, isLoading, onRetry, onNearBottomChange, scrollRequest, showJumpToLatest, onJumpToLatest }) {
  const threadRef = useRef(null);
  const nearBottomRef = useRef(true);

  function reportNearBottom() {
    const thread = threadRef.current;
    if (!thread) return;
    const isNearBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight <= BOTTOM_THRESHOLD;
    if (isNearBottom !== nearBottomRef.current) {
      nearBottomRef.current = isNearBottom;
      onNearBottomChange(isNearBottom);
    }
  }

  useEffect(() => {
    reportNearBottom();
  }, [messages.length, isLoading]);

  useLayoutEffect(() => {
    const thread = threadRef.current;
    if (!thread || !scrollRequest) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (scrollRequest.type === "message") {
      document.getElementById(`message-${scrollRequest.messageId}`)?.scrollIntoView({ behavior, block: "end" });
    } else {
      thread.scrollTo({ top: thread.scrollHeight, behavior });
    }
    requestAnimationFrame(reportNearBottom);
  }, [scrollRequest]);

  return <section ref={threadRef} className="conversation-thread" aria-label="Conversation" aria-live="polite" aria-busy={isLoading} onScroll={reportNearBottom}>
    {showJumpToLatest && <Button variant="message-action" className="conversation-thread__jump" onClick={onJumpToLatest}>Jump to latest</Button>}
    {messages.map((message, index) => <ChatMessage key={message.id || `${message.role}-${index}`} message={message} isLoading={isLoading} onRetry={onRetry} />)}
    {isLoading && <div className="conversation-thread__loading" role="status"><span />Searching e& product guides…</div>}
  </section>;
}
