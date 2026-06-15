from fastapi import APIRouter

from ..schemas.chat import ChatRequest
from fastapi.responses import (
    StreamingResponse
)

from ..services.ai_service import (
    stream_ai_response
)

from ..services.ai_service import (
    get_ai_response
)

router = APIRouter()


@router.post("/chat")
def chat(request: ChatRequest):

    ai_response = get_ai_response(
        request.message
    )

    return {
        "response": ai_response
    }

@router.post("/chat-stream")
async def chat_stream(
    request: ChatRequest
):

    generator = stream_ai_response(
        request.message
    )

    return StreamingResponse(
        generator,
        media_type="text/plain"
    )