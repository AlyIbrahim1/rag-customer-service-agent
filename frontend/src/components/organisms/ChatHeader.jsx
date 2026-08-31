import IconButton from "../atoms/IconButton";
import Button from "../atoms/Button";

export default function ChatHeader({ isSidebarOpen, onToggleSidebar, onNewConversation, menuRef }) {
  return <header className="chat-header">
    <IconButton buttonRef={menuRef} className="chat-header__menu" label={isSidebarOpen ? "Hide conversations" : "Show conversations"} aria-controls="conversation-sidebar" aria-expanded={isSidebarOpen} onClick={onToggleSidebar}>☰</IconButton>
    <div><strong>e& Egypt Assistant</strong><span>Answers from e& product guides</span></div>
    <Button variant="quiet" className="chat-header__new" onClick={onNewConversation}>New chat</Button>
  </header>;
}
