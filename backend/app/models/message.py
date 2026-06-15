from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from sqlalchemy.orm import relationship

from ..database.base import Base


class Message(Base):

    __tablename__ = "messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    content = Column(String)

    role = Column(String)

    chat_id = Column(
        Integer,
        ForeignKey("chats.id")
    )

    chat = relationship(
        "Chat",
        back_populates="messages"
    )