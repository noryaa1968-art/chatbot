from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session

from ..database.session import get_db

from ..services.user_service import (
    login_service
)

router = APIRouter()


@router.post("/login")
def login(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):

    token = login_service(
        email,
        password,
        db
    )

    if not token:

        return {
            "error": "Invalid credentials"
        }

    return {
        "access_token": token,
        "token_type": "bearer"
    }