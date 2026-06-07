"""
File I/O utilities for the CI/CD Security System.

Provides safe JSON reading and writing operations used across all modules.
"""

import json
import logging
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)


def ensure_dir(path: Path) -> None:
    """Creates a directory (and parents) if it does not already exist."""
    path.mkdir(parents=True, exist_ok=True)


def read_json(path: Path) -> Optional[dict[str, Any]]:
    """
    Reads and parses a JSON file.

    Returns:
        Parsed dictionary, or None if the file is missing or malformed.
    """
    if not path.exists():
        logger.warning("File not found: %s", path)
        return None

    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        logger.debug("Loaded JSON from %s", path)
        return data
    except json.JSONDecodeError as exc:
        logger.error("Invalid JSON in %s: %s", path, exc)
        return None
    except OSError as exc:
        logger.error("Cannot read %s: %s", path, exc)
        return None


def write_json(path: Path, data: Any, indent: int = 2) -> bool:
    """
    Writes data as a JSON file, creating parent directories as needed.

    Returns:
        True on success, False on failure.
    """
    try:
        ensure_dir(path.parent)
        with path.open("w", encoding="utf-8") as f:
            json.dump(data, f, indent=indent, default=str)
        logger.debug("Wrote JSON to %s", path)
        return True
    except (OSError, TypeError) as exc:
        logger.error("Cannot write JSON to %s: %s", path, exc)
        return False


def read_json_list(path: Path) -> list[Any]:
    """
    Reads a JSON file expected to contain a top-level list.

    Returns an empty list on missing file or parse error.
    """
    data = read_json(path)
    if data is None:
        return []
    if isinstance(data, list):
        return data
    logger.warning("Expected a JSON array in %s, got %s", path, type(data).__name__)
    return []
