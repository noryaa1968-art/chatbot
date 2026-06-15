from fastapi.security import OAuth2PasswordBearer

from fastapi import Depends

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.utils.security import verify_token

from app.models.user import User

from app.database.connection import SessionLocal


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
) 

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    payload = verify_token(token)

    if not payload:

        return None

    email = payload.get("sub")

    user = db.query(User).filter(
        User.email == email
    ).first()

    return user