from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models.chat import Chat
from .models.message import Message

from .routers import chat, auth, user
from .core.config import PROJECT_NAME
from .database.connection import engine
from .database.base import Base
from .models.user import User


app = FastAPI(title=PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://refactored-space-giggle-p7jjwrr9gw9rc7r4j-5175.app.github.dev",
        "https://refactored-space-giggle-p7jjwrr9gw9rc7r4j-8000.app.github.dev",
    ],
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
