import Button from "../atoms/Button";
import IconButton from "../atoms/IconButton";

export default function ConversationItem({ conversation, isActive, onDelete, onSelect }) {
  return <div className={isActive ? "conversation-item conversation-item--active" : "conversation-item"}>
    <Button variant="conversation" className="conversation-item__select" data-conversation-id={conversation.id} aria-current={isActive ? "page" : undefined} onClick={() => onSelect(conversation.id)}>{conversation.title}</Button>
    <IconButton className="conversation-item__delete" label={`Delete ${conversation.title}`} onClick={() => onDelete(conversation.id)}>🗑</IconButton>
  </div>;
}
