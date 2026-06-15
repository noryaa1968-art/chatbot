from sqlalchemy.orm import Session

from ..models.user import User
from ..schemas.user import UserCreate
from ..utils.security import hash_password
from ..core.config import SECRET_KEY, ALGORITHM
from ..utils.security import (
    hash_password,
    verify_password,
    create_access_token
)


def login_service(
    email: str,
    password: str,
    db: Session
):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:

        return None

    valid_password = verify_password(
        password,
        user.password
    )

    if not valid_password:

        return None

    token = create_access_token({
        "sub": user.email
    })

    return token


def create_user_service(user: UserCreate, db: Session):

    hashed_password = hash_password(
        user.password
    )

    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return new_user

def get_users_service(db: Session):

    users = db.query(User).all()

    return users