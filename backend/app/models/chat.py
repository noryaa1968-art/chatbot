from sqlalchemy import (
    Column,
    Integer,
    ForeignKey
)

from sqlalchemy.orm import relationship

from ..database.base import Base


class Chat(Base):

    __tablename__ = "chats"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    messages = relationship(
        "Message",
        back_populates="chat"
    )

    user = relationship(
    "User",
    back_populates="chats"
)