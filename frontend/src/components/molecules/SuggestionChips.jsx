// Up to four quick-question buttons above the chat input.
export default function SuggestionChips({ items, onPick }) {
  return <div className="chips">{items.slice(0, 4).map((item) => <button key={item} type="button" dir="auto" onClick={() => onPick(item)}>{item}</button>)}</div>;
}
