from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.models.user import User
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = create_access_token(user.id)
    return {"token": token, "user": {"id": user.id, "username": user.username, "role": user.role}}


@router.post("/register")
def register(req: LoginRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="用户名已存在")
    user = User(username=req.username, password_hash=hash_password(req.password), role="admin")
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return {"token": token, "user": {"id": user.id, "username": user.username, "role": user.role}}


@router.get("/me")
def get_me(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    user_id = decode_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="无效token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return {"id": user.id, "username": user.username, "role": user.role}
