from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import RedirectResponse
from app.models.auth import UserRegister, UserLogin, UserPublic
from app.core.db import get_user_by_email, create_user, get_user_by_provider_id
from app.core.security import hash_password, verify_password, create_access_token, get_current_user_required
import uuid
import os
from datetime import datetime
from starlette.config import Config
from authlib.integrations.starlette_client import OAuth

router = APIRouter(prefix="/api/auth", tags=["auth"])

config = Config('.env')
oauth = OAuth(config)

oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

oauth.register(
    name='github',
    api_base_url='https://api.github.com/',
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    client_kwargs={'scope': 'user:email'}
)

@router.post("/register", response_model=UserPublic)
async def register(user: UserRegister, response: Response):
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(user.password)
    created_at = datetime.utcnow().isoformat()
    
    await create_user(
        user_id=user_id,
        email=user.email,
        hashed_password=hashed_pwd,
        display_name=user.display_name,
        created_at=created_at
    )
    
    access_token = create_access_token(data={"sub": user_id})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        secure=False,
    )
    
    return UserPublic(
        id=user_id,
        email=user.email,
        display_name=user.display_name,
        created_at=created_at
    )

@router.post("/login")
async def login(user: UserLogin, response: Response):
    db_user = await get_user_by_email(user.email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not verify_password(user.password, db_user["hashed_password"]):
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": db_user["id"]})
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        secure=False,
    )
    
    return {"message": "Login successful"}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserPublic)
async def get_me(current_user: dict = Depends(get_current_user_required)):
    return UserPublic(
        id=current_user["id"],
        email=current_user["email"],
        display_name=current_user["display_name"],
        created_at=current_user["created_at"]
    )

@router.get('/login/google')
async def login_google(request: Request):
    redirect_uri = request.url_for('auth_google')
    return await oauth.google.authorize_redirect(request, str(redirect_uri))

@router.get('/callback/google')
async def auth_google(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to get user info from Google")
    
    email = user_info.get('email')
    display_name = user_info.get('name', 'Google User')
    provider_id = user_info.get('sub')
    
    return await _process_oauth_login(email, display_name, 'google', provider_id)

@router.get('/login/github')
async def login_github(request: Request):
    redirect_uri = request.url_for('auth_github')
    return await oauth.github.authorize_redirect(request, str(redirect_uri))

@router.get('/callback/github')
async def auth_github(request: Request):
    token = await oauth.github.authorize_access_token(request)
    resp = await oauth.github.get('user', token=token)
    user_info = resp.json()
    
    email = user_info.get('email')
    if not email:
        emails_resp = await oauth.github.get('user/emails', token=token)
        emails = emails_resp.json()
        for e in emails:
            if e.get('primary'):
                email = e['email']
                break
        if not email and emails:
            email = emails[0]['email']

    if not email:
        raise HTTPException(status_code=400, detail="Failed to get email from GitHub")

    display_name = user_info.get('name') or user_info.get('login') or 'GitHub User'
    provider_id = str(user_info.get('id'))
    
    return await _process_oauth_login(email, display_name, 'github', provider_id)

async def _process_oauth_login(email: str, display_name: str, provider: str, provider_id: str):
    db_user = await get_user_by_provider_id(provider, provider_id)
    if not db_user:
        existing_email_user = await get_user_by_email(email)
        if existing_email_user:
            raise HTTPException(status_code=400, detail="Email already registered with another account")
            
        user_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()
        await create_user(
            user_id=user_id,
            email=email,
            hashed_password='',
            display_name=display_name,
            created_at=created_at,
            auth_provider=provider,
            provider_id=provider_id
        )
        db_user = {"id": user_id, "email": email}

    access_token = create_access_token(data={"sub": db_user["id"]})
    
    frontend_url = os.environ.get("FRONTEND_URL", "https://github-profile-analyzer-lime.vercel.app")
    response = RedirectResponse(url=f"{frontend_url}/")
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        secure=False,
    )
    return response
