from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..schemas.user import UserCreate
from ..models.user import User
from ..database.session import get_db

from ..services.user_service import create_user_service, get_users_service

from ..utils.dependencies import (
    get_current_user
)


router = APIRouter()



@router.post("/users")
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    create_user_service(user, db)

    return {
        "message": "User Created Successfully"
    }

@router.get("/users")
def get_users(
    db: Session = Depends(get_db)
):

    users = get_users_service(db)

    return users

#Add Protected API
@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "username": current_user.username,
        "email": current_user.email
    }