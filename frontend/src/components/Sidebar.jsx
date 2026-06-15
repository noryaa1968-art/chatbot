function Sidebar({ chats, activeChatId, onNewChat, onSelectChat }) {
  return (
    <aside className="sidebar">
      <button className="new-chat-btn" onClick={onNewChat}>
        <span>+</span>
        <span>New Chat</span>
      </button>

      <div className="sidebar-section">
        <div className="sidebar-label">Recent</div>
        <div className="history-list">
          {chats.map((chat) => (
            <button
              key={chat.id}
              className={`history-item ${chat.id === activeChatId ? 'active' : ''}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <span className="history-title">{chat.title}</span>
              <span className="history-dot" />
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
