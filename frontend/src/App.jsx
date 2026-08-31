import { useEffect, useState } from "react";

const TOPIC_QUESTIONS = [
  ["DataLine", "What is DataLine and what does it offer?"],
  ["Emerald", "What is the Emerald plan?"],
  ["Hekaya Internet", "Tell me about Hekaya Internet."],
  ["Hekaya Mixat", "Tell me about Hekaya Mixat."],
  ["Prepaid systems", "How do e&'s prepaid systems work?"],
];

const LOGO = "/e&-logo-1.png";

function createConversation() {
  return { id: crypto.randomUUID(), title: "New conversation", messages: [] };
}

function loadConversations() {
  try {
    const saved = JSON.parse(localStorage.getItem("etisalat-conversations"));
    return Array.isArray(saved) && saved.length ? saved : [createConversation()];
  } catch {
    return [createConversation()];
  }
}

function loadTheme() {
  return localStorage.getItem("etisalat-theme") || "system";
}

function shortTitle(question) {
  return question.length <= 40 ? question : `${question.slice(0, 37)}...`;
}

function Message({ message }) {
  return (
    <article className={`message message--${message.role}`}>
      {message.role === "assistant" ? (
        <img className="message__avatar" src={LOGO} alt="e&" />
      ) : (
        <span className="message__avatar message__avatar--user" aria-hidden="true">You</span>
      )}
      <div className="message__body">
        <p className={message.error ? "message__error" : "message__text"}>{message.content}</p>
        {message.sources?.length > 0 && (
          <div className="sources" aria-label="Sources">
            {message.sources.map((source) => <span className="source-pill" key={source}>{source}</span>)}
          </div>
        )}
      </div>
    </article>
  );
}

function App() {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(() => localStorage.getItem("etisalat-active-conversation"));
  const [theme, setTheme] = useState(loadTheme);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeConversation = conversations.find((conversation) => conversation.id === activeId) || conversations[0];

  useEffect(() => {
    if (activeConversation.id !== activeId) setActiveId(activeConversation.id);
  }, [activeConversation.id, activeId]);

  useEffect(() => {
    localStorage.setItem("etisalat-conversations", JSON.stringify(conversations));
    localStorage.setItem("etisalat-active-conversation", activeConversation.id);
  }, [activeConversation.id, conversations]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("etisalat-theme", theme);
  }, [theme]);

  function updateConversation(conversationId, update) {
    setConversations((current) => current.map((conversation) => (
      conversation.id === conversationId ? update(conversation) : conversation
    )));
  }

  function startNewConversation() {
    const conversation = createConversation();
    setConversations((current) => [...current, conversation]);
    setActiveId(conversation.id);
    setSidebarOpen(false);
  }

  function deleteConversation(conversationId) {
    const remaining = conversations.filter((conversation) => conversation.id !== conversationId);
    const nextConversations = remaining.length ? remaining : [createConversation()];
    setConversations(nextConversations);
    if (conversationId === activeConversation.id) setActiveId(nextConversations.at(-1).id);
  }

  async function sendMessage(question = draft) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || isLoading) return;

    const history = activeConversation.messages.map(({ role, content }) => ({ role, content }));
    const userMessage = { role: "user", content: cleanQuestion };
    updateConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      title: conversation.messages.length ? conversation.title : shortTitle(cleanQuestion),
      messages: [...conversation.messages, userMessage],
    }));
    setDraft("");
    setIsLoading(true);
    setSidebarOpen(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleanQuestion, history }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The knowledge base is unavailable.");

      updateConversation(activeConversation.id, (conversation) => ({
        ...conversation,
        messages: [...conversation.messages, { role: "assistant", content: result.answer, sources: result.sources }],
      }));
    } catch (error) {
      updateConversation(activeConversation.id, (conversation) => ({
        ...conversation,
        messages: [...conversation.messages, { role: "assistant", content: error.message, sources: [], error: true }],
      }));
    } finally {
      setIsLoading(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <div className="app-shell">
      <button className="mobile-menu" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open conversations">☰</button>
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`} aria-label="Conversation navigation">
        <div className="sidebar__brand">
          <img src={LOGO} alt="e&" />
          <div>
            <strong>Egypt Assistant</strong>
            <span>Product support, grounded in e& documentation</span>
          </div>
        </div>
        <button className="new-chat" type="button" onClick={startNewConversation}>+ New conversation</button>
        <p className="sidebar__label">Conversations</p>
        <nav className="conversation-list">
          {[...conversations].reverse().map((conversation) => (
            <div className="conversation-row" key={conversation.id}>
              <button
                className={conversation.id === activeConversation.id ? "conversation conversation--active" : "conversation"}
                type="button"
                onClick={() => { setActiveId(conversation.id); setSidebarOpen(false); }}
              >
                {conversation.title}
              </button>
              <button className="delete-chat" type="button" onClick={() => deleteConversation(conversation.id)} aria-label={`Delete ${conversation.title}`}>×</button>
            </div>
          ))}
        </nav>
        <div className="sidebar__footer">
          <label htmlFor="appearance">Appearance</label>
          <select id="appearance" value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-scrim" type="button" aria-label="Close conversations" onClick={() => setSidebarOpen(false)} />}

      <main className="workspace">
        <header className="workspace__header">
          <div>
            <p>e& Egypt</p>
            <h1>Customer support assistant</h1>
          </div>
          <span>Grounded answers</span>
        </header>

        {activeConversation.messages.length === 0 ? (
          <section className="welcome">
            <img src={LOGO} alt="e&" />
            <h2>How can I help?</h2>
            <p>Ask about e& products and services in Egypt. I answer using the available product documentation.</p>
            <h3>Popular questions</h3>
            <div className="suggestions">
              {TOPIC_QUESTIONS.map(([topic, question]) => (
                <button type="button" key={topic} onClick={() => sendMessage(question)}>{topic}</button>
              ))}
            </div>
          </section>
        ) : (
          <section className="messages" aria-live="polite">
            {activeConversation.messages.map((message, index) => <Message key={`${message.role}-${index}`} message={message} />)}
            {isLoading && <div className="thinking"><span />Searching e& documentation…</div>}
          </section>
        )}

        <form className="composer" onSubmit={submit}>
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message e& Egypt Assistant" rows="1" disabled={isLoading} />
          <button type="submit" disabled={!draft.trim() || isLoading} aria-label="Send message">↑</button>
        </form>
        <p className="composer-note">Answers are based on e& product documentation. Check official channels for final confirmation.</p>
      </main>
    </div>
  );
}

export default App;
