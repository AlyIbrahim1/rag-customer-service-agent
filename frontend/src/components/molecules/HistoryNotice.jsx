import Button from "../atoms/Button";

export default function HistoryNotice({ deletedConversation, onUndo }) {
  if (!deletedConversation) return null;

  return <div className="history-notice" role="status">
    <span>Conversation deleted</span>
    <Button variant="message-action" onClick={onUndo}>Undo</Button>
  </div>;
}
