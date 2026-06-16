import { useState, useRef, useEffect } from 'react'
import { sendMessage } from '../services/api'

function ChatPage({ onBack }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef(null)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const scrollIntervalRef = useRef(null) // Ref for the interval

  // Handle manual scroll detection
  const handleScroll = () => {
    const container = chatContainerRef.current
    if (!container) return
    const { scrollTop, scrollHeight, clientHeight } = container
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100
    setIsNearBottom(nearBottom)
  }

  // Auto-scroll only if near bottom
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return
    if (isNearBottom || messages.length === 0) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages, isLoading, isNearBottom])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
        scrollIntervalRef.current = null
      }
    }
  }, [])

  // --- Scroll Button Logic (Hold to scroll) ---
  const startScrolling = (direction) => {
    // Clear any existing interval first
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }

    // Small initial jump for immediate feedback
    const container = chatContainerRef.current
    if (container) {
      const step = direction === 'up' ? -30 : 30
      container.scrollTop = Math.max(0, Math.min(container.scrollHeight - container.clientHeight, container.scrollTop + step))
    }

    // Then start continuous scrolling
    scrollIntervalRef.current = setInterval(() => {
      const container = chatContainerRef.current
      if (!container) {
        stopScrolling()
        return
      }
      const step = direction === 'up' ? -15 : 15
      const newScrollTop = container.scrollTop + step
      container.scrollTop = Math.max(0, Math.min(container.scrollHeight - container.clientHeight, newScrollTop))
    }, 30) // runs every 30ms for smooth scrolling
  }

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: message.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage('')
    setIsLoading(true)

    try {
      const data = await sendMessage(userMessage.content)
      const aiReply = data?.response || 'Sorry, I could not generate a reply.'
      setMessages((prev) => [...prev, { role: 'ai', content: aiReply }])
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Sorry, the chat service is unavailable right now.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-shell flex h-screen bg-[#202123] text-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-gray-700 bg-[#171717] p-4 md:flex">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New chat</h2>
          <button className="rounded-md border border-gray-600 px-3 py-1 text-sm hover:bg-gray-800">
            +
          </button>
        </div>
        <div className="flex-1 rounded-xl border border-gray-700 bg-[#2b2c2f] p-3 text-sm text-gray-300">
          Start a new conversation
        </div>
        <button
          onClick={onBack}
          className="mt-4 rounded-md border border-gray-600 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
        >
          Logout
        </button>
      </aside>

      {/* Main Chat Area */}
      <div className="relative flex flex-1 flex-col bg-[#343541]">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-700 bg-[#343541] px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold">ChatGPT</h1>
            <p className="text-sm text-gray-400">Your AI assistant</p>
          </div>
        </header>

        {/* Scrollable Messages */}
        <main
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="chat-scrollbar flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-gray-700 bg-[#444654] p-8 text-center shadow-sm">
                <h2 className="mb-2 text-lg font-semibold">How can I help you today?</h2>
                <p className="text-sm text-gray-400">
                  Start a conversation and the assistant will respond here.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`message-enter max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-7 ${
                    msg.role === 'user'
                      ? 'message-user bg-[#0f6cbd] text-white'
                      : 'message-ai border border-gray-700 bg-[#444654] text-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-gray-700 bg-[#444654] px-4 py-3 text-sm text-gray-300">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ===== NEW: Floating Scroll Buttons ===== */}
        <div className="absolute bottom-28 right-6 z-10 flex flex-col gap-2">
          {/* Scroll Up Button */}
          <button
            onMouseDown={() => startScrolling('up')}
            onMouseUp={stopScrolling}
            onMouseLeave={stopScrolling}
            onTouchStart={() => startScrolling('up')}
            onTouchEnd={stopScrolling}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#40414f] text-white shadow-lg transition hover:bg-[#565869] active:scale-95"
            aria-label="Scroll up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Scroll Down Button */}
          <button
            onMouseDown={() => startScrolling('down')}
            onMouseUp={stopScrolling}
            onMouseLeave={stopScrolling}
            onTouchStart={() => startScrolling('down')}
            onTouchEnd={stopScrolling}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#40414f] text-white shadow-lg transition hover:bg-[#565869] active:scale-95"
            aria-label="Scroll down"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Input Footer */}
        <footer className="border-t border-gray-700 bg-[#343541] px-4 py-4 sm:px-6 lg:px-8">
          <div className="composer-glow mx-auto flex max-w-3xl gap-3 rounded-2xl border border-gray-600 bg-[#40414f] p-3 shadow-sm">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message ChatGPT..."
              className="input-field flex-1 border-none bg-transparent px-2 py-2 text-[15px] text-white outline-none placeholder:text-gray-400"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default ChatPage
