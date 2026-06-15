from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy.orm import Session

from langchain_community.chat_message_histories import (
    ChatMessageHistory
)
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory

from app.models.chat import Chat
from app.models.message import Message

from app.core.config import (
    GEMINI_API_KEY
)

import asyncio



llm=ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.9,google_api_key=GEMINI_API_KEY)



# Original prompt template definition
"""prompt_template = ChatPromptTemplate.from_messages([
    ("system", "you are a {role} who explain concepts in {style} style"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}")
])"""

#chain 
chain= llm

store={}
def get_session_history(session_id: str):
  if session_id not in store:
    store[session_id]=ChatMessageHistory()
    return store[session_id]
  return store[session_id]

# Create the conversation chain
conversation = RunnableWithMessageHistory(
   chain,
    get_session_history
)

def get_ai_response(message: str):
    try:

        response = conversation.invoke(
            {"input": message},
            {"configurable": {"session_id": "default"}}
        )

        return response.content

    except Exception as e:

        return f"Error: {str(e)}"

def create_chat(
    user_id: int,
    db: Session
):

    chat = Chat(user_id=user_id)

    db.add(chat)

    db.commit()

    db.refresh(chat)

    return chat

def get_chat_messages(
    chat_id: int,
    db: Session
):

    messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).all()

    return messages

async def stream_ai_response(
    message: str
):

    response = llm.invoke(
        message
    )

    text = response.content

    for word in text.split():

        yield word + " "

        await asyncio.sleep(0.05)
    