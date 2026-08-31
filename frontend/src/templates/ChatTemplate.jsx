export default function ChatTemplate({ sidebar, header, content, composer, notice, isSidebarOpen, isMobile, onCloseSidebar }) {
  return <div className={isSidebarOpen ? "chat-template" : "chat-template chat-template--sidebar-closed"}>
    {sidebar}
    {isMobile && isSidebarOpen && <button className="chat-template__backdrop" type="button" aria-label="Close conversations" onClick={onCloseSidebar} />}
    <main className="chat-template__main">{header}<div className="chat-template__content">{content}</div>{composer && <div className="chat-template__composer">{composer}</div>}{notice}<details className="answer-about" id="composer-safety"><summary>About these answers</summary><p>This assistant provides product information from available e& guides. It cannot access or change personal accounts. Never share passwords, verification codes, or sensitive account information. Confirm important decisions through official e& support channels.</p></details></main>
  </div>;
}
