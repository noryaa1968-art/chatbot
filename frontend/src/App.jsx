import { useState, useRef, useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import MessageList from './components/MessageList'
import ChatInput from './components/ChatInput'
import { sendMessage } from './services/api'

function App() {
  const [chats, setChats] = useState([
    {
      id: 1,
      title: 'Welcome',
      messages: [{ id: 1, sender: 'ai', text: 'Hello! I’m your AI assistant. Ask me anything.' }],
    },
  ])
  const [activeChatId, setActiveChatId] = useState(1)
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ----- Scroll logic (added) -----
  const messageContainerRef = useRef(null)
  const [isNearBottom, setIsNearBottom] = useState(true)

  const handleScroll = () => {
    const container = messageContainerRef.current
    if (!container) return
    const { scrollTop, scrollHeight, clientHeight } = container
    const nearBottom = scrollHeight - scrollTop - clientHeight < 50
    setIsNearBottom(nearBottom)
  }

  // Auto-scroll when messages or loading state change
  useEffect(() => {
    const container = messageContainerRef.current
    if (!container) return
    const messages = activeChat?.messages ?? []
    if (isNearBottom || messages.length === 0) {
      container.scrollTop = container.scrollHeight
    }
  }, [activeChat?.messages, isLoading, isNearBottom])

  const scrollToBottom = () => {
    const container = messageContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
      setIsNearBottom(true)
    }
  }
  // ----- End of scroll logic -----

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? chats[0]

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New chat',
      messages: [],
    }

    setChats((previous) => [newChat, ...previous])
    setActiveChatId(newChat.id)
    setDraft('')
  }

  const handleSend = async () => {
    const trimmed = draft.trim()

    if (!trimmed || isLoading) {
      return
    }

    const userMessage = { id: Date.now(), sender: 'user', text: trimmed }

    setChats((previous) =>
      previous.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title: chat.messages.length === 0 ? trimmed.slice(0, 30) : chat.title,
              messages: [...chat.messages, userMessage],
            }
          : chat,
      ),
    )

    setDraft('')
    setIsLoading(true)

    try {
      const response = await sendMessage(trimmed)
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response?.response || 'Sorry, I could not generate a reply.',
      }

      setChats((previous) =>
        previous.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat,
        ),
      )
    } catch (error) {
      console.error(error)
      const fallbackMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Sorry, the chat service is unavailable right now.',
      }

      setChats((previous) =>
        previous.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, fallbackMessage] }
            : chat,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={setActiveChatId}
      />

      <main className="chat-panel relative">
        <header className="chat-header">
          <div>
            <p className="eyebrow">AI Assistant</p>
            <h1>{activeChat?.title ?? 'New chat'}</h1>
          </div>
        </header>

        {/* Scrollable container wrapping MessageList */}
        <div
          ref={messageContainerRef}
          onScroll={handleScroll}
          className="chat-scrollbar flex-1 overflow-y-scroll px-4 py-6 sm:px-6 lg:px-8"
        >
          <MessageList messages={activeChat?.messages ?? []} isLoading={isLoading} />
        </div>

        {/* Scroll‑to‑bottom button (appears only when scrolled up) */}
        {!isNearBottom && (activeChat?.messages?.length ?? 0) > 0 && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-28 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#40414f] px-4 py-2 text-sm text-white shadow-lg transition hover:bg-[#565869]"
          >
            Scroll to bottom ↓
          </button>
        )}

        <ChatInput value={draft} onChange={setDraft} onSend={handleSend} />
      </main>
    </div>
  )
}

export default App
