import sys
from pathlib import Path

from pydantic import BaseModel, Field


def default_c_library_path() -> str:
    c_core_dir = Path(__file__).resolve().parents[3] / "c_core"
    library_name = "fermentation.dll" if sys.platform.startswith("win") else "libfermentation.so"
    return str(c_core_dir / library_name)


class Settings(BaseModel):
    """Application configuration."""

    api_title: str = "Fermentation Simulator API"
    api_version: str = "0.1.0"
    debug: bool = True
    c_library_path: str = Field(default_factory=default_c_library_path)


settings = Settings()
