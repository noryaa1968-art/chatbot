from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models.chat import Chat
from .models.message import Message

from .routers import chat, auth, user
from .core.config import PROJECT_NAME
from .database.connection import engine
from .database.base import Base
from .models.user import User


app = FastAPI(title="My API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*\.app\.github\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


app.include_router(chat.router)
app.include_router(user.router)
app.include_router(auth.router)

@app.get("/")
def about():
    return {"message": f"Welcome to !"}
