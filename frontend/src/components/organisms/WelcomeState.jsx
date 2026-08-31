import BrandMark from "../atoms/BrandMark";
import Button from "../atoms/Button";
import ChatComposer from "../molecules/ChatComposer";

export default function WelcomeState({ draft, isLoading, prompts, onDraftChange, onSend }) {
  return <section className="welcome-state"><BrandMark decorative /><h1>What can we help with today?</h1><p>Ask about e& Egypt plans, internet services, or prepaid products. I’ll use available e& product guides and show the sources with each answer.</p><ChatComposer value={draft} isLoading={isLoading} onChange={onDraftChange} onSend={onSend} /><div className="welcome-state__prompts">{prompts.map(([label, question]) => <Button key={label} variant="suggestion" disabled={isLoading} onClick={() => onSend(question)}>{label}</Button>)}</div></section>;
}
