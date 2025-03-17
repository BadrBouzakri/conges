from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    is_admin: bool
    is_approver: bool

class TokenPayload(BaseModel):
    sub: Optional[int] = None