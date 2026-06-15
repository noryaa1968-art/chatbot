import { useEffect, useRef } from 'react'
import Message from './Message'

function MessageList({ messages, isLoading }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <section className="message-area" aria-label="Chat messages">
      {messages.length === 0 ? (
        <div className="empty-state">
          <h2>Start a new conversation</h2>
          <p>Ask anything and the assistant will respond in real time.</p>
        </div>
      ) : (
        <div className="message-stack">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="message-row assistant">
              <div className="message-bubble assistant typing-bubble">Thinking…</div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      )}
    </section>
  )
}

export default MessageList
