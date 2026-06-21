import { useState, useRef, useEffect } from 'react'
import { sendMessage } from '../services/api'

function ChatPage({ onBack }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef(null)
  const [isNearBottom, setIsNearBottom] = useState(true)

  const handleScroll = () => {
    const container = chatContainerRef.current
    if (!container) return
    const { scrollTop, scrollHeight, clientHeight } = container
    const nearBottom = scrollHeight - scrollTop - clientHeight < 50
    setIsNearBottom(nearBottom)
  }

  // Auto-scroll only if near bottom or no messages
  //useEffect(() => {
   // const container = chatContainerRef.current
   // if (!container) return
    //if (isNearBottom || messages.length === 0) {
     // container.scrollTop = container.scrollHeight
    //}
  //}, [messages, isLoading, isNearBottom])"""

  const scrollToBottom = () => {
    const container = chatContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
      setIsNearBottom(true)
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
          className="chat-scrollbar flex-1 overflow-y-scroll px-4 py-6 sm:px-6 lg:px-8"
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

        {/* Scroll-to-Bottom Button (appears only when scrolled up) */}
        {!isNearBottom && messages.length > 0 && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-28 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#40414f] px-4 py-2 text-sm text-white shadow-lg transition hover:bg-[#565869]"
          >
            Scroll to bottom ↓
          </button>
        )}

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
