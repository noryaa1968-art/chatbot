import { useState } from 'react'
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

      <main className="chat-panel">
        <header className="chat-header">
          <div>
            <p className="eyebrow">AI Assistant</p>
            <h1>{activeChat?.title ?? 'New chat'}</h1>
          </div>
        </header>

        <MessageList messages={activeChat?.messages ?? []} isLoading={isLoading} />

        <ChatInput value={draft} onChange={setDraft} onSend={handleSend} />
      </main>
    </div>
  )
}

export default App
