from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analysis, job_match, readme_tools, roadmap


def create_app() -> FastAPI:
    app = FastAPI(
        title="HireLens AI – Recruiter-Grade GitHub Intelligence Engine",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(analysis.router, prefix="/api")
    app.include_router(job_match.router, prefix="/api")
    app.include_router(readme_tools.router, prefix="/api")
    app.include_router(roadmap.router, prefix="/api")

    return app


app = create_app()

