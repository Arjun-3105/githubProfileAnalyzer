from loguru import logger


def setup_logging() -> None:
    logger.remove()
    logger.add(
        sink=lambda msg: print(msg, end=""),
        level="INFO",
        serialize=False,
        backtrace=False,
        diagnose=False,
    )


__all__ = ["logger", "setup_logging"]

