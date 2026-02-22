from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analysis, job_match, readme_tools, roadmap, auth, snapshots


def create_app() -> FastAPI:
    app = FastAPI(
        title="HireLens AI – Recruiter-Grade GitHub Intelligence Engine",
        version="0.1.0",
    )

    @app.on_event("startup")
    async def startup_event():
        from app.core.db import init_db
        await init_db()

    from starlette.middleware.sessions import SessionMiddleware
    app.add_middleware(SessionMiddleware, secret_key="your-secret-key-for-sessions")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://github-profile-analyzer-lime.vercel.app"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(snapshots.router)
    app.include_router(analysis.router, prefix="/api")
    app.include_router(job_match.router, prefix="/api")
    app.include_router(readme_tools.router, prefix="/api")
    app.include_router(roadmap.router, prefix="/api")

    return app


app = create_app()

