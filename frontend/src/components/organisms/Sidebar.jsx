import { useEffect, useRef } from "react";
import BrandMark from "../atoms/BrandMark";
import Button from "../atoms/Button";
import IconButton from "../atoms/IconButton";
import ConversationItem from "../molecules/ConversationItem";
import ThemeSelect from "../molecules/ThemeSelect";

function groupConversations(conversations) {
  const now = Date.now();
  const groups = { Today: [], "Previous 7 days": [], Older: [] };
  conversations.forEach((conversation) => {
    const age = now - new Date(conversation.createdAt).getTime();
    groups[age < 86400000 ? "Today" : age < 604800000 ? "Previous 7 days" : "Older"].push(conversation);
  });
  return Object.entries(groups).filter(([, items]) => items.length);
}

export default function Sidebar({ conversations, activeId, isOpen, theme, onClose, onNewConversation, onSelectConversation, onDeleteConversation, onClearHistory, onThemeChange }) {
  const sidebarRef = useRef(null);
  useEffect(() => { if (isOpen) sidebarRef.current?.querySelector("button")?.focus(); }, [isOpen]);
  useEffect(() => {
    function closeOnEscape(event) { if (event.key === "Escape" && isOpen) onClose(); }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);
  return <aside ref={sidebarRef} id="conversation-sidebar" className={isOpen ? "sidebar sidebar--open" : "sidebar"} aria-label="Conversations" aria-hidden={!isOpen}>
    <div className="sidebar__top"><div className="sidebar__brand"><BrandMark decorative /><strong>e& Egypt Assistant</strong></div><IconButton className="sidebar__close" label="Close conversations" onClick={onClose}>×</IconButton></div>
    <Button variant="sidebar" className="sidebar__new" onClick={onNewConversation}>＋ New chat</Button>
    <nav className="sidebar__history">{groupConversations([...conversations].reverse()).map(([label, items]) => <section key={label}><p>{label}</p>{items.map((conversation) => <ConversationItem key={conversation.id} conversation={conversation} isActive={conversation.id === activeId} onSelect={onSelectConversation} onDelete={onDeleteConversation} />)}</section>)}</nav>
    <footer className="sidebar__footer"><ThemeSelect value={theme} onChange={onThemeChange} /><Button variant="quiet" className="sidebar__clear-history" onClick={onClearHistory}>Clear conversation history</Button><details><summary>About this assistant</summary><p>Product information from available e& guides. It cannot access or change your account.</p></details></footer>
  </aside>;
}
