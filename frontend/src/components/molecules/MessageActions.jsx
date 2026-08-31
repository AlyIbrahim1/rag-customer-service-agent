import { useEffect, useState } from "react";
import Button from "../atoms/Button";

export default function MessageActions({ content, isLoading, onRetry }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyAnswer() {
    if (!content || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (!content && !onRetry) return null;

  return <div className="message-actions">
    {content && <Button variant="message-action" onClick={copyAnswer}>{copied ? "Copied" : "Copy answer"}</Button>}
    {onRetry && <Button variant="message-action" disabled={isLoading} onClick={onRetry}>Try again</Button>}
  </div>;
}
