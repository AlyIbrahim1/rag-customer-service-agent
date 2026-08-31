import { useEffect, useRef, useState } from "react";
import ChatComposer from "../components/molecules/ChatComposer";
import HistoryNotice from "../components/molecules/HistoryNotice";
import ChatHeader from "../components/organisms/ChatHeader";
import ConversationThread from "../components/organisms/ConversationThread";
import Sidebar from "../components/organisms/Sidebar";
import WelcomeState from "../components/organisms/WelcomeState";
import ChatTemplate from "../templates/ChatTemplate";

const PROMPTS = [["Compare mobile and data plans", "What mobile and data plans are available?"], ["Find an internet package", "What internet packages are available?"], ["Understand prepaid options", "How do e& prepaid options work?"], ["Tell me about Emerald or Hekaya", "Tell me about Emerald and Hekaya plans."]];
const now = () => new Date().toISOString();
const createConversation = () => ({ id: crypto.randomUUID(), title: "New conversation", createdAt: now(), messages: [] });
const shortTitle = (question) => question.length <= 40 ? question : `${question.slice(0, 37)}…`;

function normalizeSource(source) {
  if (typeof source === "object" && source) return { title: source.title || source.name || "e& product guide", page: source.page };
  const match = String(source).match(/^(.*?)(?:\s*\(p\.?\s*(\d+)\))?$/i);
  return { title: match?.[1].replace(/\.pdf$/i, "") || "e& product guide", page: match?.[2] ? Number(match[2]) : undefined };
}
function loadConversations() {
  try {
    const saved = JSON.parse(localStorage.getItem("etisalat-conversations"));
    return Array.isArray(saved) && saved.length ? saved.map((conversation) => ({ ...conversation, createdAt: conversation.createdAt || now(), messages: (conversation.messages || []).map((message) => ({ ...message, id: message.id || crypto.randomUUID(), sources: (message.sources || []).map(normalizeSource) })) })) : [createConversation()];
  } catch { return [createConversation()]; }
}

export default function ChatPage() {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(() => localStorage.getItem("etisalat-active-conversation"));
  const [theme, setTheme] = useState(() => localStorage.getItem("etisalat-theme") || "system");
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [scrollRequest, setScrollRequest] = useState(null);
  const [deletedConversation, setDeletedConversation] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const [sidebarOpen, setSidebarOpen] = useState(() => !window.matchMedia("(max-width: 767px)").matches);
  const menuRef = useRef(null);
  const isSendingRef = useRef(false);
  const isNearBottomRef = useRef(true);
  const activeIdRef = useRef(activeId);
  const scrollRequestId = useRef(0);
  const deleteTimerRef = useRef(null);
  const pendingFocusIdRef = useRef(null);
  const activeConversation = conversations.find((conversation) => conversation.id === activeId) || conversations[0];

  useEffect(() => { if (activeConversation.id !== activeId) setActiveId(activeConversation.id); }, [activeConversation.id, activeId]);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => () => window.clearTimeout(deleteTimerRef.current), []);
  useEffect(() => {
    const conversationId = pendingFocusIdRef.current;
    if (!conversationId) return;

    const button = [...document.querySelectorAll("[data-conversation-id]")]
      .find((item) => item.dataset.conversationId === conversationId);
    if (button) {
      button.focus();
      pendingFocusIdRef.current = null;
    }
  }, [activeId, conversations]);
  useEffect(() => { localStorage.setItem("etisalat-conversations", JSON.stringify(conversations)); localStorage.setItem("etisalat-active-conversation", activeConversation.id); }, [activeConversation.id, conversations]);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("etisalat-theme", theme); }, [theme]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => { setIsMobile(media.matches); setSidebarOpen(!media.matches); };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  function updateConversation(id, update) { setConversations((items) => items.map((item) => item.id === id ? update(item) : item)); }
  function requestScroll(type, messageId) { setScrollRequest({ id: ++scrollRequestId.current, type, messageId }); }
  function handleNearBottomChange(nextIsNearBottom) {
    isNearBottomRef.current = nextIsNearBottom;
    if (nextIsNearBottom) setShowJumpToLatest(false);
  }
  function jumpToLatest() { setShowJumpToLatest(false); requestScroll("latest"); }
  function closeSidebar() { setSidebarOpen(false); if (isMobile) requestAnimationFrame(() => menuRef.current?.focus()); }
  function startNewConversation() { const conversation = createConversation(); setConversations((items) => [...items, conversation]); setActiveId(conversation.id); if (isMobile) closeSidebar(); }
  function selectConversation(id) { setActiveId(id); if (isMobile) closeSidebar(); }
  function clearDeleteTimer() { window.clearTimeout(deleteTimerRef.current); }
  function deleteConversation(id) {
    const index = conversations.findIndex((conversation) => conversation.id === id);
    if (index < 0) return;

    const conversation = conversations[index];
    const remaining = conversations.filter((item) => item.id !== id);
    const replacement = remaining.length ? null : createConversation();
    const nextConversations = replacement ? [replacement] : remaining;
    const nextConversation = nextConversations[Math.min(index, nextConversations.length - 1)];
    const wasActive = id === activeConversation.id;

    clearDeleteTimer();
    setDeletedConversation({ conversation, index, replacementId: replacement?.id, wasActive });
    setConversations(nextConversations);
    setActiveId(wasActive ? nextConversation.id : activeConversation.id);
    pendingFocusIdRef.current = nextConversation.id;
    deleteTimerRef.current = window.setTimeout(() => {
      setDeletedConversation((current) => current?.conversation.id === id ? null : current);
    }, 6000);
  }
  function undoDelete() {
    if (!deletedConversation) return;

    clearDeleteTimer();
    setConversations((items) => {
      const withoutReplacement = deletedConversation.replacementId
        ? items.filter((item) => item.id !== deletedConversation.replacementId)
        : items;
      const restored = [...withoutReplacement];
      restored.splice(Math.min(deletedConversation.index, restored.length), 0, deletedConversation.conversation);
      return restored;
    });
    if (deletedConversation.wasActive) setActiveId(deletedConversation.conversation.id);
    pendingFocusIdRef.current = deletedConversation.conversation.id;
    setDeletedConversation(null);
  }
  function clearHistory() {
    if (!window.confirm("Clear all conversation history? This cannot be undone.")) return;

    const conversation = createConversation();
    clearDeleteTimer();
    setDeletedConversation(null);
    setConversations([conversation]);
    setActiveId(conversation.id);
    pendingFocusIdRef.current = conversation.id;
  }
  function addAssistantMessage(conversationId, message) {
    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      messages: [...conversation.messages, message],
    }));
    if (conversationId === activeIdRef.current) {
      if (isNearBottomRef.current) requestScroll("latest");
      else setShowJumpToLatest(true);
    }
  }

  async function requestAnswer(question, conversationId, history) {
    if (isSendingRef.current) return;

    isSendingRef.current = true;
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, history }) });
      const result = await response.json();
      if (!response.ok) throw new Error();

      const sources = (result.sources || []).map(normalizeSource);
      const outcome = ["grounded", "no_match", "direct"].includes(result.outcome)
        ? result.outcome
        : sources.length ? "grounded" : "direct";
      addAssistantMessage(conversationId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.answer,
        sources,
        outcome,
      });
    } catch {
      addAssistantMessage(conversationId, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I couldn’t reach the product guides right now. Your question is still here, so you can try again.",
        sources: [],
        error: true,
        retryQuestion: question,
      });
    } finally {
      isSendingRef.current = false;
      setIsLoading(false);
    }
  }

  function sendMessage(question = draft) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || isSendingRef.current) return;
    const history = activeConversation.messages.map(({ role, content }) => ({ role, content }));
    const conversationId = activeConversation.id;
    const messageId = crypto.randomUUID();
    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      title: conversation.messages.length ? conversation.title : shortTitle(cleanQuestion),
      messages: [...conversation.messages, { id: messageId, role: "user", content: cleanQuestion }],
    }));
    setShowJumpToLatest(false);
    requestScroll("message", messageId);
    setDraft("");
    if (isMobile) setSidebarOpen(false);
    requestAnswer(cleanQuestion, conversationId, history);
  }

  function retryMessage(message) {
    const question = message.retryQuestion?.trim();
    if (!question || isSendingRef.current) return;

    const conversationId = activeConversation.id;
    const history = activeConversation.messages
      .filter((item) => !item.error)
      .map(({ role, content }) => ({ role, content }));
    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      messages: conversation.messages.filter((item) => item.id !== message.id),
    }));
    requestAnswer(question, conversationId, history);
  }
  const sidebar = <Sidebar conversations={conversations} activeId={activeConversation.id} isOpen={sidebarOpen} theme={theme} onClose={closeSidebar} onNewConversation={startNewConversation} onSelectConversation={selectConversation} onDeleteConversation={deleteConversation} onClearHistory={clearHistory} onThemeChange={setTheme} />;
  const header = <ChatHeader isSidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} onNewConversation={startNewConversation} menuRef={menuRef} />;
  const empty = activeConversation.messages.length === 0;
  return <ChatTemplate sidebar={sidebar} header={header} isSidebarOpen={sidebarOpen} isMobile={isMobile} onCloseSidebar={closeSidebar} content={empty ? <WelcomeState draft={draft} isLoading={isLoading} prompts={PROMPTS} onDraftChange={setDraft} onSend={sendMessage} /> : <ConversationThread messages={activeConversation.messages} isLoading={isLoading} onRetry={retryMessage} onNearBottomChange={handleNearBottomChange} scrollRequest={scrollRequest} showJumpToLatest={showJumpToLatest} onJumpToLatest={jumpToLatest} />} composer={empty ? null : <ChatComposer value={draft} isLoading={isLoading} onChange={setDraft} onSend={sendMessage} />} notice={<HistoryNotice deletedConversation={deletedConversation} onUndo={undoDelete} />} />;
}
