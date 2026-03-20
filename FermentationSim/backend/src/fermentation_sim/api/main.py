from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fermentation_sim.api.routes import simulation, metadata, presets
from fermentation_sim.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.api_title,
        version=settings.api_version,
        description=(
            "Virtual fermentation simulator for process development, training "
            "and control strategy prototyping. Not validated for regulatory use."
        ),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # tighten in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(metadata.router)
    app.include_router(presets.router)
    app.include_router(simulation.router)
    return app


app = create_app()
