from loguru import logger
import sys


def configure_logging(debug: bool = True) -> None:
    """Configure structured logging with loguru."""
    logger.remove()
    logger.add(
        sys.stdout,
        level="DEBUG" if debug else "INFO",
        format="<green>{time}</green> | <level>{level}</level> | {message}",
    )
