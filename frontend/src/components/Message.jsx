function Message({ message }) {
  const isUser = message.sender === 'user'

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
        {message.text}
      </div>
    </div>
  )
}

export default Message
