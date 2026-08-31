import SourceList from "../molecules/SourceList";
import MessageActions from "../molecules/MessageActions";

const NO_MATCH_MESSAGE = "I couldn’t find reliable information about that in the available e& product guides. Try rephrasing your question or ask about data plans, internet packages, prepaid options, Emerald, or Hekaya.";

export default function ChatMessage({ isLoading, message, onRetry }) {
  const isAssistant = message.role === "assistant";
  const isNoMatch = isAssistant && message.outcome === "no_match";
  const hasSources = (message.sources || []).length > 0;
  const isGrounded = message.outcome === "grounded" || (!message.outcome && hasSources);
  const content = isNoMatch ? NO_MATCH_MESSAGE : message.content;
  return <article id={`message-${message.id}`} data-message-id={message.id} className={`chat-message chat-message--${message.role}${isNoMatch ? " chat-message--no-match" : ""}`}>
    {isAssistant && <p className="chat-message__author">e& Assistant</p>}
    <div className={message.error ? "chat-message__content chat-message__content--error" : isNoMatch ? "chat-message__content chat-message__content--no-match" : "chat-message__content"} role={message.error ? "alert" : undefined}>{content}</div>
    {isAssistant && isGrounded && <SourceList sources={message.sources || []} />}
    {isAssistant && message.outcome === "direct" && !message.error && <p className="chat-message__guide-note">No product guide was needed for this response.</p>}
    {isAssistant && <MessageActions content={message.error ? undefined : content} isLoading={isLoading} onRetry={message.error && message.retryQuestion ? () => onRetry(message) : undefined} />}
  </article>;
}
